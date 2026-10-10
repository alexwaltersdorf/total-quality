// API de pacientes e conversas, atras de senha.
//
// A senha e conferida aqui, contra o hash PBKDF2 guardado em
// ana_config.chave = 'historico_senha'. Sem senha certa nada sai: o link do
// painel sozinho nao da acesso a nome, telefone nem conversa de paciente.
//
//   GET  ?modo=lista                 -> os leads, sem as mensagens
//   GET  ?modo=conversa&fone=55...   -> o historico de um contato so
//   GET  ?modo=tudo                  -> leads + todas as mensagens (gera o HTML)
//   POST ?modo=status                -> grava o status manual de um contato
//        corpo {fone, status}, status vazio volta para o automatico
//
// A senha vai no cabecalho x-senha, nunca na URL: query string entra em log de
// servidor, historico de navegador e cabecalho Referer.
const URL_SB = Deno.env.get('SUPABASE_URL')!;
const CHAVE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const H = { apikey: CHAVE, Authorization: `Bearer ${CHAVE}` };
const PAGINA = 1000;   // teto do PostgREST, independente do limit pedido

const ORIGEM_OK = new Set([
  'https://totalquality.med.br',
  'https://www.totalquality.med.br',
]);
const cors = (origem: string | null) => ({
  'access-control-allow-origin': origem && ORIGEM_OK.has(origem) ? origem : 'null',
  'access-control-allow-headers': 'x-senha, content-type',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-max-age': '86400',
  'vary': 'origin',
});

const rest = async (caminho: string, init: RequestInit = {}) => {
  const r = await fetch(`${URL_SB}/rest/v1/${caminho}`,
    { ...init, headers: { ...H, ...(init.headers ?? {}) } });
  if (!r.ok) throw new Error(`${caminho} -> ${r.status} ${await r.text()}`);
  return await r.json();
};

// o unico status que a conversa nao produz sozinha: quem fecha o assunto e a
// pessoa que atende, entao 'Encerrado' so existe como escolha manual
const STATUS_OK = ['Agendou', 'Não Agendou', 'Não Aplica', 'Encerrado'];

// pagina ate o fim: avanca pelo que veio, nunca pelo que foi pedido
const todos = async (caminho: string, ordem: string, teto = 200000) => {
  const fora: any[] = [];
  for (;;) {
    const lote = await rest(
      `${caminho}&order=${ordem}&limit=${PAGINA}&offset=${fora.length}`);
    for (const x of lote) fora.push(x);
    if (lote.length < PAGINA || fora.length >= teto) break;
  }
  return fora;
};

const deB64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0));

// PBKDF2 custa ~100ms por tentativa: forca bruta em senha de 20 caracteres
// aleatorios deixa de ser viavel mesmo sem contador de tentativas.
const confere = async (senha: string, registro: string) => {
  const [algo, it, sal, esperado] = registro.split('$');
  if (algo !== 'pbkdf2') return false;
  const material = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: deB64(sal), iterations: Number(it) },
    material, 256);
  const obtido = new Uint8Array(bits), alvo = deB64(esperado);
  if (obtido.length !== alvo.length) return false;
  let d = 0;
  for (let i = 0; i < obtido.length; i++) d |= obtido[i] ^ alvo[i];
  return d === 0;
};

const BR = 'America/Sao_Paulo';
const fmt = new Intl.DateTimeFormat('pt-BR', {
  timeZone: BR, day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: false,
});
const quando = (iso: string) => fmt.format(new Date(iso)).replace(',', '');

// p = paciente, a = Ana (bot), h = recepcao (humano pelo WhatsApp)
const linhaMsg = (m: any) => [
  quando(m.created_at),
  m.role === 'user' ? 'p' : (m.tipo === 'humano' ? 'h' : 'a'),
  m.tipo === 'texto' || m.tipo === 'humano' ? '' : (m.tipo ?? ''),
  String(m.conteudo ?? '').slice(0, 1800),
];

Deno.serve(async (req) => {
  const u = new URL(req.url);
  const origem = req.headers.get('origin');
  const cab = cors(origem);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cab });

  const json = (corpo: unknown, status = 200) => new Response(JSON.stringify(corpo),
    { status, headers: { ...cab, 'content-type': 'application/json', 'cache-control': 'no-store' } });

  let registro = '';
  try {
    const cfg = await rest('ana_config?chave=eq.historico_senha&select=valor');
    registro = cfg?.[0]?.valor ?? '';
  } catch { /* sem senha configurada */ }
  const senha = req.headers.get('x-senha') ?? '';
  if (!registro || !senha || !(await confere(senha, registro))) {
    return json({ erro: 'senha' }, 401);
  }

  const modo = u.searchParams.get('modo') ?? 'lista';

  // gravar o status escolhido a mao, ou limpar para voltar ao automatico
  if (modo === 'status') {
    if (req.method !== 'POST') return json({ erro: 'metodo' }, 405);
    let corpo: any;
    try { corpo = await req.json(); } catch { return json({ erro: 'corpo' }, 400); }
    const fone = String(corpo?.fone ?? '').replace(/\D/g, '');
    const novo = String(corpo?.status ?? '').trim();
    if (!fone) return json({ erro: 'fone' }, 400);
    if (novo && !STATUS_OK.includes(novo)) return json({ erro: 'status' }, 400);
    const gravado = await rest(`ana_leads?phone=eq.${fone}&select=phone,status_manual`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({
        status_manual: novo || null,
        status_manual_em: novo ? new Date().toISOString() : null,
      }),
    });
    if (!gravado.length) return json({ erro: 'nao encontrado' }, 404);
    return json({ fone, status_manual: gravado[0].status_manual });
  }

  // uma conversa so, buscada quando a linha e aberta
  if (modo === 'conversa') {
    const fone = (u.searchParams.get('fone') ?? '').replace(/\D/g, '');
    if (!fone) return json({ erro: 'fone' }, 400);
    const ms = await todos(
      `ana_mensagens?select=role,tipo,conteudo,created_at&phone=eq.${fone}`,
      'created_at.asc,id.asc');
    return json({ fone, msgs: ms.map(linhaMsg) });
  }

  // 1. planilha de leads (nome, exame, status comercial, etapa, datas)
  const planilha = await todos('ana_leads_planilha?select=*', 'ord.desc');

  // 2. estado atual da conversa, direto de ana_leads
  const estados = await todos('ana_leads?select=phone,escalado,bot_ativo,opt_out,' +
    'motivo_escalada,agendamento,temperatura,funil,convenio,' +
    'last_patient_msg_at,last_bot_msg_at,human_msg_at,followup_due_at,' +
    'resumo_interno,status_manual,status_manual_em', 'phone.asc');
  const porFone = new Map<string, any>(estados.map((e: any) => [e.phone, e]));

  // 3. quantas mensagens cada um trocou e quando foi a ultima (a view agrupa
  //    no banco). 'ultima' e o que ordena a lista: ate aqui ela vinha por
  //    ord.desc, que e o inicio da conversa, nao a ultima mensagem.
  const msgs = new Map<string, { n: number, ut: number }>(
    (await todos('ana_msgs_contagem?select=phone,n,ultima', 'phone.asc'))
      .map((c: any) => [c.phone, { n: c.n, ut: Date.parse(c.ultima) || 0 }]));

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
    // sa = o que a conversa diz, sm = o que a pessoa que atende decidiu.
    // O manual ganha, mas o automatico continua visivel para dar o contraste.
    const sa = p.Status, sm = e.status_manual ?? null;
    return {
      n: p.Nome, t: p.WhatsApp, e: p['Exame procurado'], f: p.Familia,
      s: sm ?? sa, sa, sm, et: p['Etapa do follow-up'],
      d: p['Data do contato'], u: p['Ultima mensagem'],
      r: p.Recontato === 'sim',
      fila: !!e.followup_due_at,
      c, det,
      tmp: e.temperatura ?? '', fun: e.funil ?? '', conv: e.convenio ?? '',
      res: e.resumo_interno ?? '',
      nm: msgs.get(p.WhatsApp)?.n ?? 0,
      ut: msgs.get(p.WhatsApp)?.ut ?? 0,
      dias: Number.isFinite(ult) ? Math.floor(ult) : null,
    };
  });

  // do mais recente para o mais antigo, pela ultima mensagem trocada
  leads.sort((a: any, b: any) => b.ut - a.ut);

  const saida: Record<string, unknown> = {
    gerado_em: quando(new Date().toISOString()),
    conferencia: { leads: leads.length, estados: estados.length },
    leads,
  };

  // modo tudo: carrega o historico inteiro, para gerar o documento offline
  if (modo === 'tudo') {
    const mensagens = await todos(
      'ana_mensagens?select=phone,role,tipo,conteudo,created_at', 'created_at.asc,id.asc');
    const hist: Record<string, any[]> = {};
    for (const m of mensagens) (hist[m.phone] ??= []).push(linhaMsg(m));
    (saida.conferencia as any).mensagens = mensagens.length;
    saida.hist = Object.fromEntries(
      Object.entries(hist).filter(([f]) => porFone.has(f)));
  }

  return json(saida);
});
