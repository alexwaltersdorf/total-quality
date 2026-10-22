// Resolve CEP em coordenada e guarda no cache geo_cep.
//
// Por que existe: a mesma rua se repete em dezenas de empresas, e as APIs
// publicas de CEP tem limite de uso. Consultar uma vez por CEP, e nao uma vez
// por empresa, e a diferenca entre caber no limite e tomar 429.
//
// Chamada:
//   POST /functions/v1/cep  { "ceps": ["11660010", "11660-020"] }
//   POST /functions/v1/cep  { "pendentes": 100 }  -> fila de CEPs sem ponto
//   POST /functions/v1/cep  { "refinar": 30 }     -> troca centroide por endereco
//   POST /functions/v1/cep  { "ceps": [...], "revalidar": true }
//
// Sobre precisao: as fontes gratuitas de CEP devolvem, em boa parte do
// interior, o centro do municipio no lugar do ponto da rua, sem avisar. Num
// anel de 10 km isso poe a empresa do bairro distante no anel errado. Por isso
// o ponto so vale como 'cep' depois de passar pela deteccao de centroide, e o
// modo "refinar" existe para buscar o ponto de verdade pelo endereco escrito.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const LOTE_MAXIMO = 200;
const LOTE_REFINO = 40;
const PAUSA_MS = 350;   // respiro entre chamadas de CEP
const PAUSA_GEO = 1100; // geocodificador publico: no maximo ~1 por segundo
const AGENTE = "TotalQuality-Prospeccao/1.0 (contato@totalquality.med.br)";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const soDigitos = (v: unknown) => String(v ?? "").replace(/\D/g, "");
const ehCep = (v: string) => /^[0-9]{8}$/.test(v);
const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

function coordenada(v: unknown): number | null {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : null;
}
function dentroDoBrasil(lat: number | null, lon: number | null) {
  return lat !== null && lon !== null &&
    lat >= -34 && lat <= 6 && lon >= -74 && lon <= -34;
}

type Achado = {
  logradouro?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  ibge?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  precisao?: "cep" | "prefixo" | "cidade" | "manual" | null;
  fonte?: string | null;
  erro?: string | null;
};

async function pelaBrasilApi(cep: string): Promise<Achado | null> {
  const r = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, {
    headers: { accept: "application/json" },
  });
  if (!r.ok) return null;
  const d = await r.json();

  const lat = coordenada(d?.location?.coordinates?.latitude);
  const lon = coordenada(d?.location?.coordinates?.longitude);
  const temPonto = dentroDoBrasil(lat, lon);

  return {
    logradouro: d?.street ?? null,
    bairro: d?.neighborhood ?? null,
    cidade: d?.city ?? null,
    uf: d?.state ?? null,
    ibge: d?.ibge?.city ?? null,
    latitude: temPonto ? lat : null,
    longitude: temPonto ? lon : null,
    precisao: temPonto ? "cep" : null,
    fonte: temPonto ? `brasilapi/${d?.service ?? "?"}` : "brasilapi(sem ponto)",
  };
}

// Nao tem coordenada, mas confirma o endereco — e e o endereco que o modo
// "refinar" usa depois.
async function pelaViaCep(cep: string): Promise<Achado | null> {
  const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    headers: { accept: "application/json" },
  });
  if (!r.ok) return null;
  const d = await r.json();
  if (d?.erro) return null;
  return {
    logradouro: d?.logradouro ?? null,
    bairro: d?.bairro ?? null,
    cidade: d?.localidade ?? null,
    uf: d?.uf ?? null,
    ibge: d?.ibge ?? null,
    fonte: "viacep(sem ponto)",
  };
}

async function peloPrefixo(cep: string): Promise<Achado | null> {
  const { data, error } = await supabase.rpc("geo_cep_centroide_prefixo", {
    alvo: cep,
  });
  if (error) return null;
  const linha = Array.isArray(data) ? data[0] : data;
  const lat = coordenada(linha?.latitude);
  const lon = coordenada(linha?.longitude);
  if (!dentroDoBrasil(lat, lon)) return null;
  return {
    latitude: lat,
    longitude: lon,
    precisao: "prefixo",
    fonte: `prefixo(${linha?.vizinhos ?? "?"} vizinhos)`,
  };
}

type Ponto = { lat: number; lon: number; via: string };

// Photon primeiro: mesma base do OpenStreetMap, mas aceita requisicao de
// servidor. O Nominatim responde 403 para IP de nuvem (o Supabase e um),
// entao fica so como segunda tentativa.
// Nada de lang=pt aqui: o Photon so conhece de/en/fr/it e devolve 400.
async function pelaPhoton(q: string): Promise<Ponto | null> {
  const r = await fetch(
    `https://photon.komoot.io/api/?limit=1&q=${encodeURIComponent(q)}`,
    { headers: { "user-agent": AGENTE, accept: "application/json" } },
  );
  if (!r.ok) throw new Error(`photon http ${r.status}`);
  const d = await r.json();
  const p = d?.features?.[0]?.geometry?.coordinates;
  const lon = coordenada(p?.[0]);
  const lat = coordenada(p?.[1]);
  return dentroDoBrasil(lat, lon) ? { lat: lat!, lon: lon!, via: "photon" } : null;
}

async function pelaNominatim(q: string): Promise<Ponto | null> {
  const r = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
    { headers: { "user-agent": AGENTE, accept: "application/json" } },
  );
  if (!r.ok) throw new Error(`nominatim http ${r.status}`);
  const d = await r.json();
  const p = Array.isArray(d) ? d[0] : null;
  const lat = coordenada(p?.lat);
  const lon = coordenada(p?.lon);
  return dentroDoBrasil(lat, lon) ? { lat: lat!, lon: lon!, via: "nominatim" } : null;
}

async function resolver(cep: string): Promise<Achado> {
  let achado: Achado = {};

  try {
    achado = (await pelaBrasilApi(cep)) ?? {};
  } catch (e) {
    achado = { erro: `brasilapi: ${e}` };
  }

  if (!achado.cidade) {
    try {
      const v = await pelaViaCep(cep);
      if (v) {
        achado = {
          ...v, ...achado,
          cidade: v.cidade, uf: v.uf,
          logradouro: achado.logradouro ?? v.logradouro,
          bairro: achado.bairro ?? v.bairro,
          ibge: achado.ibge ?? v.ibge,
        };
      }
    } catch (e) {
      achado.erro = `${achado.erro ?? ""} viacep: ${e}`.trim();
    }
  }

  if (achado.latitude == null) {
    const p = await peloPrefixo(cep);
    if (p) achado = { ...achado, ...p };
  }

  if (achado.latitude == null && !achado.cidade) {
    achado.erro = achado.erro ?? "CEP nao encontrado em nenhuma fonte";
  }
  return achado;
}

// Pega os CEPs que ficaram com ponto aproximado e procura a rua no OSM.
// Guarda o motivo de cada falha: refino que falha calado vira anel errado
// que ninguem explica depois.
async function refinar(limite: number) {
  const { data, error } = await supabase
    .from("geo_cep")
    .select("cep, logradouro, bairro, cidade, uf")
    .in("precisao", ["cidade", "prefixo"])
    .not("logradouro", "is", null)
    .not("cidade", "is", null)
    .limit(Math.min(limite, LOTE_REFINO));
  if (error) return { erro: error.message };

  let tentados = 0, achados = 0, naoEncontrados = 0, falhas = 0;
  let ultimaFalha: string | null = null;

  for (const l of data ?? []) {
    if (tentados > 0) await dormir(PAUSA_GEO);
    tentados++;

    const q = [l.logradouro, l.bairro, l.cidade, l.uf ?? "SP", "Brasil"]
      .filter(Boolean).join(", ");

    let ponto: Ponto | null = null;
    const problemas: string[] = [];
    for (const tentativa of [pelaPhoton, pelaNominatim]) {
      try {
        ponto = await tentativa(q);
        if (ponto) break;
        problemas.push(`${tentativa.name}: sem resultado`);
      } catch (e) {
        problemas.push(`${tentativa.name}: ${e}`);
      }
    }

    if (!ponto) {
      const motivo = problemas.join(" | ");
      if (motivo.includes("http")) { falhas++; ultimaFalha = motivo; }
      else naoEncontrados++;
      await supabase.from("geo_cep")
        .update({ erro: `refino: ${motivo}`.slice(0, 500) }).eq("cep", l.cep);
      continue;
    }

    achados++;
    await supabase.from("geo_cep").update({
      latitude: ponto.lat,
      longitude: ponto.lon,
      precisao: "cep",
      fonte: `${ponto.via}(endereco)`,
      erro: null,
      consultado_em: new Date().toISOString(),
    }).eq("cep", l.cep);
  }
  return { tentados, achados, nao_encontrados: naoEncontrados, falhas, ultima_falha: ultimaFalha };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return resposta({ erro: "use POST" }, 405);

  let corpo: Record<string, unknown> = {};
  try {
    corpo = await req.json();
  } catch {
    return resposta({ erro: "corpo nao e JSON" }, 400);
  }

  // Modo refino: nao consulta CEP, so troca ponto aproximado por endereco.
  if (corpo.refinar) {
    const r = await refinar(Number(corpo.refinar) || 10);
    const { data: rebaixados } = await supabase.rpc("geo_cep_reclassifica");
    const { data: aplicado } = await supabase.rpc("prospeccao_aplica_geo");
    return resposta({
      refino: r,
      rebaixados_para_cidade: rebaixados ?? 0,
      empresas: Array.isArray(aplicado) ? aplicado[0] : aplicado,
    });
  }

  const revalidar = corpo.revalidar === true;
  let alvos: string[] = [];

  if (Array.isArray(corpo.ceps)) {
    alvos = corpo.ceps.map(soDigitos).filter(ehCep);
  } else if (typeof corpo.cep === "string") {
    const c = soDigitos(corpo.cep);
    if (ehCep(c)) alvos = [c];
  } else if (corpo.pendentes) {
    const limite = Math.min(Number(corpo.pendentes) || 50, LOTE_MAXIMO);
    const { data, error } = await supabase
      .from("geo_cep_pendentes").select("cep").limit(limite);
    if (error) return resposta({ erro: error.message }, 500);
    alvos = (data ?? []).map((l: { cep: string }) => l.cep).filter(ehCep);
  }

  alvos = [...new Set(alvos)].slice(0, LOTE_MAXIMO);
  if (alvos.length === 0) {
    return resposta({ erro: "nenhum CEP valido na chamada" }, 400);
  }

  // O cache manda: so vai para a rede quem ainda nao tem ponto.
  const { data: jaTem } = await supabase
    .from("geo_cep").select("*").in("cep", alvos);
  const cache = new Map((jaTem ?? []).map((l: { cep: string }) => [l.cep, l]));

  let consultados = 0, doCache = 0, semPonto = 0;

  for (const cep of alvos) {
    const guardado = cache.get(cep) as Record<string, unknown> | undefined;
    if (!revalidar && guardado?.latitude != null) {
      doCache++;
      continue;
    }

    if (consultados > 0) await dormir(PAUSA_MS);
    consultados++;
    const achado = await resolver(cep);
    if (achado.latitude == null) semPonto++;

    await supabase.from("geo_cep").upsert({
      cep,
      logradouro: achado.logradouro ?? null,
      bairro: achado.bairro ?? null,
      cidade: achado.cidade ?? null,
      uf: achado.uf ?? null,
      ibge: achado.ibge ?? null,
      latitude: achado.latitude ?? null,
      longitude: achado.longitude ?? null,
      precisao: achado.precisao ?? null,
      fonte: achado.fonte ?? null,
      erro: achado.erro ?? null,
      tentativas: Number(guardado?.tentativas ?? 0) + 1,
      consultado_em: new Date().toISOString(),
    }, { onConflict: "cep" });
  }

  // Deteccao de centroide: so da para ver comparando CEPs entre si, depois que
  // o lote inteiro entrou — por isso aqui, e nao dentro de resolver().
  const { data: rebaixados } = await supabase.rpc("geo_cep_reclassifica");
  const { data: aplicado } = await supabase.rpc("prospeccao_aplica_geo");

  // Rele o que ficou gravado: devolver o que foi escrito antes da
  // reclassificacao seria devolver a mentira que ela acabou de desfazer.
  const { data: finais } = await supabase
    .from("geo_cep").select("*").in("cep", alvos);

  return resposta({
    pedidos: alvos.length,
    do_cache: doCache,
    consultados,
    sem_ponto: semPonto,
    rebaixados_para_cidade: rebaixados ?? 0,
    empresas: Array.isArray(aplicado) ? aplicado[0] : aplicado,
    ceps: finais ?? [],
  });
});

function resposta(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
