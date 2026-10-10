// Extracao pontual: leads + status da conversa + historico de mensagens.
// Protegida por token guardado em ana_config.chave = 'historico_token'.
// Apagar a linha do token desativa a funcao (passa a devolver 404).
const URL_SB = Deno.env.get('SUPABASE_URL')!;
const CHAVE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const H = { apikey: CHAVE, Authorization: `Bearer ${CHAVE}` };

const rest = async (caminho: string) => {
  const r = await fetch(`${URL_SB}/rest/v1/${caminho}`, { headers: H });
  if (!r.ok) throw new Error(`${caminho} -> ${r.status} ${await r.text()}`);
  return await r.json();
};

// comparacao de tempo constante, para o token nao vazar por timing
const igual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
};

const BR = 'America/Sao_Paulo';
const fmt = new Intl.DateTimeFormat('pt-BR', {
  timeZone: BR, day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: false,
});
const quando = (iso: string) => fmt.format(new Date(iso)).replace(',', '');
const dia = (iso: string) => quando(iso).slice(0, 10);

Deno.serve(async (req) => {
  const u = new URL(req.url);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });

  let token = '';
  try {
    const cfg = await rest(`ana_config?chave=eq.historico_token&select=valor`);
    token = cfg?.[0]?.valor ?? '';
  } catch { /* sem token configurado */ }
  if (!token || !igual(u.searchParams.get('k') ?? '', token)) {
    return new Response('Not Found', { status: 404 });
  }

  // 1. planilha de leads (nome, exame, status comercial, etapa, datas)
  const planilha = await rest(
    'ana_leads_planilha?select=*&order=ord.desc&limit=5000');

  // 2. estado atual da conversa, direto de ana_leads
  const estados = await rest('ana_leads?select=phone,escalado,bot_ativo,opt_out,' +
    'motivo_escalada,proxima_acao,agendamento,temperatura,funil,convenio,' +
    'last_patient_msg_at,last_bot_msg_at,human_msg_at,followup_step,' +
    'followup_due_at,agendado_em,resumo_interno&limit=5000');
  const porFone = new Map<string, any>(estados.map((e: any) => [e.phone, e]));

  // 3. historico completo, paginado
  const hist: Record<string, any[]> = {};
  const contagem: Record<string, number> = {};
  let off = 0;
  for (;;) {
    const lote = await rest('ana_mensagens?select=phone,role,tipo,conteudo,created_at' +
      `&order=created_at.asc,id.asc&limit=2000&offset=${off}`);
    if (!lote.length) break;
    for (const m of lote) {
      // p = paciente, a = Ana (bot), h = recepcao (humano pelo WhatsApp)
      const quem = m.role === 'user' ? 'p' : (m.tipo === 'humano' ? 'h' : 'a');
      const txt = String(m.conteudo ?? '').slice(0, 1800);
      (hist[m.phone] ??= []).push([quando(m.created_at), quem,
        m.tipo === 'texto' || m.tipo === 'humano' ? '' : (m.tipo ?? ''), txt]);
      contagem[m.phone] = (contagem[m.phone] ?? 0) + 1;
    }
    off += 2000;
    if (off > 120000) break;
  }

  const agora = Date.now();
  const dias = (iso: string | null) =>
    iso ? (agora - new Date(iso).getTime()) / 86400000 : Infinity;

  const leads = planilha.map((p: any) => {
    const e = porFone.get(p.WhatsApp) ?? {};
    const ag = e.agendamento?.status ?? 'nenhum';
    const ult = Math.min(dias(e.last_patient_msg_at), dias(e.last_bot_msg_at),
                         dias(e.human_msg_at));
    let c: string, det = '';
    if (ag === 'confirmado')       { c = 'Agendada'; det = e.agendamento?.quando ?? ''; }
    else if (e.opt_out)            { c = 'Opt-out'; det = 'pediu para nao receber mais mensagens'; }
    else if (e.escalado)           { c = 'Escalada'; det = e.motivo_escalada ?? ''; }
    else if (e.bot_ativo === false){ c = 'Bot pausado'; det = 'a recepcao assumiu e nao devolveu'; }
    else {
      // quem falou por ultimo so vira fila de trabalho se a conversa ainda esta quente
      const doPaciente = dias(e.last_patient_msg_at) < dias(e.last_bot_msg_at);
      const lado = doPaciente ? 'o paciente' : 'a clinica';
      if (ult > 7) { c = 'Parada'; det = `${Math.floor(ult)} dias sem mensagem, ${lado} falou por ultimo`; }
      else if (doPaciente) { c = 'Aguardando a clinica'; det = 'o paciente falou por ultimo'; }
      else { c = 'Aguardando o paciente'; det = 'a clinica falou por ultimo'; }
    }

    return {
      n: p.Nome, t: p.WhatsApp, e: p['Exame procurado'], f: p.Familia,
      s: p.Status, et: p['Etapa do follow-up'],
      d: p['Data do contato'], u: p['Ultima mensagem'],
      r: p.Recontato === 'sim',
      fila: !!e.followup_due_at,
      c, det,
      tmp: e.temperatura ?? '', fun: e.funil ?? '', conv: e.convenio ?? '',
      res: e.resumo_interno ?? '',
      nm: contagem[p.WhatsApp] ?? 0,
      dias: Number.isFinite(ult) ? Math.floor(ult) : null,
    };
  });

  const corpo = JSON.stringify({
    gerado_em: quando(new Date().toISOString()),
    leads,
    hist: Object.fromEntries(
      Object.entries(hist).filter(([f]) => porFone.has(f))),
  });
  return new Response(corpo, {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
});
