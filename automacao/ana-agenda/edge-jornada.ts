// API de dados do painel "Jornada do paciente no WhatsApp" — Total Quality
// Publicada como Edge Function 'jornada'. Copia fiel do que esta no ar.
//
// Devolve o JSON que o painel desenha. A pagina em si NAO mora aqui: o gateway do
// Supabase reescreve qualquer resposta text/html para text/plain e injeta
// "content-security-policy: default-src 'none'; sandbox", o que mataria o script.
// Vale para Edge Functions E para o Storage — testei os dois. Esta documentado em
// https://supabase.com/docs/guides/functions/http-methods
// Por isso o painel e um artefato no Claude, que busca estes dados.
//
//   GET /functions/v1/jornada?k=<token>             devolve o cache (rapido)
//   GET /functions/v1/jornada?k=<token>&refresh=1   recalcula antes de devolver (~7s)
//
// O cache e atualizado todo dia as 00:03 de Brasilia pelo pg_cron
// 'ana-jornada-diaria'. O token esta em ana_config.chave = 'jornada_token'.
// Trocar o token e um UPDATE nessa linha, sem republicar a funcao.

const URL_SB = Deno.env.get("SUPABASE_URL")!;
const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const hdr = { apikey: KEY, Authorization: "Bearer " + KEY };

// O painel roda num artefato do Claude, de outra origem, entao precisa de CORS.
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "86400",
};

function timingSafe(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function rpc(fn: string) {
  const r = await fetch(URL_SB + "/rest/v1/rpc/" + fn, {
    method: "POST",
    headers: { ...hdr, "Content-Type": "application/json" },
    body: "{}",
  });
  if (!r.ok) throw new Error(fn + " falhou: " + r.status + " " + (await r.text()));
  return await r.json();
}

async function lerToken(): Promise<string> {
  const r = await fetch(URL_SB + "/rest/v1/ana_config?chave=eq.jornada_token&select=valor&limit=1",
                        { headers: hdr });
  if (!r.ok) return "";
  const rows = await r.json();
  return rows.length ? String(rows[0].valor).trim() : "";
}

async function lerCache() {
  const r = await fetch(URL_SB + "/rest/v1/ana_jornada_cache?select=payload&limit=1",
                        { headers: hdr });
  if (!r.ok) throw new Error("cache falhou: " + r.status);
  const rows = await r.json();
  return rows.length ? rows[0].payload : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  const u = new URL(req.url);
  const k = u.searchParams.get("k") ?? "";
  const TOKEN = await lerToken();

  // 404 em vez de 401: nao confirma que existe algo neste endereco.
  if (!TOKEN || !timingSafe(k, TOKEN)) {
    return new Response(JSON.stringify({ erro: "nao encontrado" }),
      { status: 404, headers: { ...CORS, "content-type": "application/json" } });
  }

  try {
    if (u.searchParams.get("refresh") === "1") await rpc("ana_jornada_atualizar");
    let dados = await lerCache();
    if (!dados) { await rpc("ana_jornada_atualizar"); dados = await lerCache(); }

    return new Response(JSON.stringify(dados), {
      headers: { ...CORS, "content-type": "application/json", "cache-control": "no-store" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ erro: String(e) }),
      { status: 500, headers: { ...CORS, "content-type": "application/json" } });
  }
});
