#!/usr/bin/env node
/**
 * Análise de conversas exportadas do WhatsApp para desempenho de vendedores
 * e follow-up de clientes que não finalizaram a compra.
 *
 * Uso:
 *   node scripts/whatsapp-analysis/analisar.mjs <pasta-com-exports-txt> [opções]
 *
 * Opções:
 *   --saida <dir>          Pasta de saída dos relatórios (padrão: <pasta>/relatorios)
 *   --dias-followup <n>    Dias parados para entrar na lista de follow-up (padrão: 1)
 *   --empresa <nome>       Nome da conta da empresa nos exports (autodetectado se omitido)
 *
 * Cada arquivo .txt deve ser um export de conversa do WhatsApp
 * ("Mais > Exportar conversa > Sem mídia"). O vendedor é identificado pela
 * apresentação no início do atendimento (ex.: "Oi, sou a Maria da Total Quality").
 */

import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Parsing do formato de export do WhatsApp (Android e iOS, pt-BR e en)
// ---------------------------------------------------------------------------

const LINE_PATTERNS = [
  // Android pt-BR: "13/07/2026 14:32 - Nome: mensagem"
  /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),? (\d{1,2}):(\d{2})(?::(\d{2}))?\s*[-–]\s(.+?): ([\s\S]*)$/,
  // iOS: "[13/07/2026 14:32:01] Nome: mensagem"
  /^\[(\d{1,2})\/(\d{1,2})\/(\d{2,4}),? (\d{1,2}):(\d{2})(?::(\d{2}))?\]\s(.+?): ([\s\S]*)$/,
];

function parseExport(text) {
  const messages = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/[‎‏‪-‮]/g, ''); // marcas invisíveis do WhatsApp
    let matched = false;
    for (const re of LINE_PATTERNS) {
      const m = line.match(re);
      if (!m) continue;
      const [, d, mo, y, h, mi, s, sender, body] = m;
      const year = y.length === 2 ? 2000 + Number(y) : Number(y);
      messages.push({
        date: new Date(year, Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s || 0)),
        sender: sender.trim(),
        text: body.trim(),
      });
      matched = true;
      break;
    }
    if (!matched && messages.length && line.trim() && !/^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(line)) {
      // continuação de mensagem multilinha
      messages[messages.length - 1].text += '\n' + line.trim();
    }
  }
  return messages.filter((m) => m.text && m.text !== '<Mídia oculta>' && m.text !== '<Media omitted>');
}

// ---------------------------------------------------------------------------
// Identificação dos lados da conversa e do vendedor
// ---------------------------------------------------------------------------

const VENDOR_INTRO_RES = [
  /\b(?:sou (?:o|a)?|meu nome é|me chamo|aqui é (?:o|a)?|aqui quem fala é (?:o|a)?|quem fala é (?:o|a)?)\s*([A-ZÀ-Ü][a-zà-üç]+(?: [A-ZÀ-Ü][a-zà-üç]+)?)/iu,
  /^\*?([A-ZÀ-Ü][a-zà-üç]+)\*? falando\b/iu,
];

function clientNameFromFile(fileName) {
  const m = fileName.match(/(?:Conversa do WhatsApp com|WhatsApp Chat with) (.+)\.txt$/i);
  return m ? m[1].trim() : null;
}

/**
 * Em um export 1:1 há dois remetentes: o cliente (nome do contato, igual ao
 * nome do arquivo) e a conta da empresa. Se o nome do arquivo não ajudar,
 * usa-se --empresa ou o remetente que se apresenta como vendedor.
 */
function splitSides(messages, fileName, companyName) {
  const senders = [...new Set(messages.map((m) => m.sender))];
  const clientHint = clientNameFromFile(fileName);
  let company = null;

  if (companyName && senders.includes(companyName)) company = companyName;
  if (!company && clientHint) {
    const others = senders.filter((s) => s !== clientHint);
    if (others.length === 1) company = others[0];
  }
  if (!company) {
    for (const m of messages) {
      if (VENDOR_INTRO_RES.some((re) => re.test(m.text))) {
        company = m.sender;
        break;
      }
    }
  }
  if (!company && senders.length === 2 && clientHint === null) {
    // sem dica: assume que quem NÃO manda a primeira mensagem de interesse é a empresa
    company = senders[1];
  }
  const client = senders.find((s) => s !== company) || clientHint || 'Cliente';
  return { company, client };
}

function detectVendor(messages, company) {
  for (const m of messages) {
    if (m.sender !== company) continue;
    for (const re of VENDOR_INTRO_RES) {
      const match = m.text.match(re);
      // remove conectivos capturados por engano ("Carlos da Total Quality" -> "Carlos")
      if (match) return match[1].trim().replace(/\s+(?:da|de|do|das|dos|e)$/i, '');
    }
  }
  return 'Não identificado';
}

// ---------------------------------------------------------------------------
// Métricas e classificação
// ---------------------------------------------------------------------------

const CONVERSION_RE =
  /\bagendad[oa]\b|\bconfirmad[oa]\b|pagamento (?:recebido|efetuado|confirmado|aprovado)|\bfechad[oa]\b|comprovante|pix recebido|recebi o pix|\bpaguei\b|fiz o pix|nota fiscal|obrigad[oa] pela (?:compra|preferência)|pedido (?:confirmado|realizado)|contrato assinado/i;

const INTEREST_RE =
  /pre[çc]o|\bvalor\b|quanto (?:custa|fica|sai)|or[çc]amento|\bagendar\b|\bmarcar\b|disponibilidade|hor[áa]rio|tenho interesse|me interessei|gostaria de|queria saber|como funciona|formas? de pagamento|\bparcel/i;

const OBJECTION_RE =
  /vou pensar|depois (?:eu )?(?:te )?(?:falo|aviso|retorno)|mais pra frente|t[áa] caro|muito caro|sem condi[çc][õo]es|vou ver com|preciso ver|qualquer coisa (?:eu )?(?:te )?chamo|semana que vem|m[êe]s que vem/i;

function median(values) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function fmtMinutes(min) {
  if (min == null) return '—';
  if (min < 1) return '<1 min';
  if (min < 60) return `${Math.round(min)} min`;
  if (min < 60 * 24) return `${(min / 60).toFixed(1)} h`;
  return `${(min / 60 / 24).toFixed(1)} dias`;
}

function analyzeConversation(messages, fileName, companyName) {
  const { company, client } = splitSides(messages, fileName, companyName);
  const vendor = company ? detectVendor(messages, company) : 'Não identificado';
  const isCompany = (m) => m.sender === company;

  // tempos de resposta: cada transição cliente -> empresa
  const responseTimes = [];
  let firstResponse = null;
  let pendingClientMsg = null;
  for (const m of messages) {
    if (!isCompany(m)) {
      if (!pendingClientMsg) pendingClientMsg = m;
    } else if (pendingClientMsg) {
      const mins = (m.date - pendingClientMsg.date) / 60000;
      if (mins >= 0) {
        responseTimes.push(mins);
        if (firstResponse == null) firstResponse = mins;
      }
      pendingClientMsg = null;
    }
  }

  const allText = messages.map((m) => m.text).join('\n');
  const converted = CONVERSION_RE.test(allText);
  const interested = INTEREST_RE.test(allText);
  const hasObjection = OBJECTION_RE.test(allText);
  const last = messages[messages.length - 1];
  const lastClientMsg = [...messages].reverse().find((m) => !isCompany(m));

  return {
    file: fileName,
    client,
    company,
    vendor,
    totalMessages: messages.length,
    sentByCompany: messages.filter(isCompany).length,
    firstResponseMin: firstResponse,
    responseTimes,
    converted,
    interested,
    hasObjection,
    lastDate: last?.date ?? null,
    lastFromClient: last ? !isCompany(last) : false,
    lastClientExcerpt: lastClientMsg ? lastClientMsg.text.slice(0, 120) : '',
  };
}

function suggestFollowUp(conv) {
  const nome = conv.client.split(' ')[0];
  if (conv.lastFromClient) {
    return `Olá ${nome}! Vi sua última mensagem e quero te ajudar a concluir. Posso te passar as informações agora?`;
  }
  if (conv.hasObjection) {
    return `Olá ${nome}, tudo bem? Ficou alguma dúvida sobre valores ou condições? Tenho uma condição especial que pode te ajudar a decidir.`;
  }
  return `Olá ${nome}, tudo bem? Passando para saber se ainda tem interesse. Posso reservar um horário para você esta semana?`;
}

// ---------------------------------------------------------------------------
// Relatórios
// ---------------------------------------------------------------------------

function buildVendorReport(convs) {
  const byVendor = new Map();
  for (const c of convs) {
    if (!byVendor.has(c.vendor)) byVendor.set(c.vendor, []);
    byVendor.get(c.vendor).push(c);
  }

  let md = '# Relatório de desempenho por vendedor\n\n';
  md += `_Gerado em ${new Date().toLocaleString('pt-BR')} a partir de ${convs.length} conversas._\n\n`;
  md += '| Vendedor | Conversas | Msgs enviadas | 1ª resposta (mediana) | Resposta (mediana) | Conversões | Taxa |\n';
  md += '|---|---|---|---|---|---|---|\n';

  const rows = [...byVendor.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [vendor, list] of rows) {
    const firsts = list.map((c) => c.firstResponseMin).filter((v) => v != null);
    const all = list.flatMap((c) => c.responseTimes);
    const conversions = list.filter((c) => c.converted).length;
    const rate = list.length ? Math.round((conversions / list.length) * 100) : 0;
    md += `| ${vendor} | ${list.length} | ${list.reduce((s, c) => s + c.sentByCompany, 0)} | ${fmtMinutes(median(firsts))} | ${fmtMinutes(median(all))} | ${conversions} | ${rate}% |\n`;
  }

  md += '\n## Alertas\n\n';
  const unanswered = convs.filter((c) => c.lastFromClient && !c.converted);
  if (unanswered.length) {
    md += `- **${unanswered.length} conversa(s) com a última mensagem do CLIENTE sem resposta** — prioridade máxima de follow-up.\n`;
    for (const c of unanswered) {
      md += `  - ${c.client} (vendedor: ${c.vendor}) — parado desde ${c.lastDate?.toLocaleDateString('pt-BR')}\n`;
    }
  } else {
    md += '- Nenhuma conversa com cliente sem resposta. \n';
  }
  const unidentified = convs.filter((c) => c.vendor === 'Não identificado').length;
  if (unidentified) {
    md += `- ${unidentified} conversa(s) sem vendedor identificado — reforce o padrão de apresentação no início do atendimento.\n`;
  }
  return md;
}

function buildFollowUpCsv(convs, minIdleDays, now = new Date()) {
  const pending = convs
    .filter((c) => !c.converted && c.interested && c.lastDate)
    .map((c) => ({ ...c, idleDays: Math.floor((now - c.lastDate) / 86400000) }))
    .filter((c) => c.idleDays >= minIdleDays || c.lastFromClient)
    .sort((a, b) => (b.lastFromClient - a.lastFromClient) || b.idleDays - a.idleDays);

  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
  const header = ['Cliente', 'Vendedor', 'UltimaInteracao', 'DiasParado', 'Status', 'OndeParou', 'MensagemSugerida', 'Arquivo'];
  const lines = [header.join(';')];
  for (const c of pending) {
    lines.push(
      [
        esc(c.client),
        esc(c.vendor),
        esc(c.lastDate.toLocaleString('pt-BR')),
        c.idleDays,
        esc(c.lastFromClient ? 'CLIENTE SEM RESPOSTA' : c.hasObjection ? 'Objeção pendente' : 'Aguardando cliente'),
        esc(c.lastClientExcerpt),
        esc(suggestFollowUp(c)),
        esc(c.file),
      ].join(';'),
    );
  }
  return { csv: '﻿' + lines.join('\n') + '\n', count: pending.length };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export { parseExport, splitSides, detectVendor, analyzeConversation, buildVendorReport, buildFollowUpCsv };

const isMain = process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname;
if (isMain) {
  const args = process.argv.slice(2);
  const inputDir = args.find((a) => !a.startsWith('--'));
  const opt = (name, def) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : def;
  };
  if (!inputDir || !fs.existsSync(inputDir)) {
    console.error('Uso: node scripts/whatsapp-analysis/analisar.mjs <pasta-com-exports-txt> [--saida dir] [--dias-followup n] [--empresa nome]');
    process.exit(1);
  }
  const outDir = opt('saida', path.join(inputDir, 'relatorios'));
  const minIdleDays = Number(opt('dias-followup', 1));
  const companyName = opt('empresa', null);

  const files = fs.readdirSync(inputDir).filter((f) => f.endsWith('.txt'));
  if (!files.length) {
    console.error(`Nenhum .txt encontrado em ${inputDir}`);
    process.exit(1);
  }

  const convs = [];
  for (const f of files) {
    const messages = parseExport(fs.readFileSync(path.join(inputDir, f), 'utf8'));
    if (!messages.length) {
      console.warn(`Aviso: ${f} não contém mensagens reconhecidas — pulado.`);
      continue;
    }
    convs.push(analyzeConversation(messages, f, companyName));
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'relatorio-vendedores.md'), buildVendorReport(convs));
  const { csv, count } = buildFollowUpCsv(convs, minIdleDays);
  fs.writeFileSync(path.join(outDir, 'followups.csv'), csv);

  console.log(`${convs.length} conversas analisadas.`);
  console.log(`Relatório de vendedores: ${path.join(outDir, 'relatorio-vendedores.md')}`);
  console.log(`Follow-ups pendentes (${count}): ${path.join(outDir, 'followups.csv')}`);
}
