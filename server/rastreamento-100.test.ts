import { readdirSync, readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

/*
 * Travas das correcoes da pericia de rastreamento de 28/10/2026
 * (repo de SEO, pericia-rastreamento/). Cada uma corresponde a um achado
 * medido em producao; falhou, corrige o codigo — nunca afrouxa o teste.
 */

function source(path: string): string {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

function bloco(texto: string, inicio: string, fim: string): string {
  const i = texto.indexOf(inicio);
  expect(i).toBeGreaterThanOrEqual(0);
  const j = texto.indexOf(fim, i + inicio.length);
  return texto.slice(i, j === -1 ? undefined : j);
}

describe("GUARD-RAIL: visitante que volta e medido (consentimento)", () => {
  /*
   * Com o consentimento salvo, o default saia "granted". O Google tag le o
   * default uma vez: sem uma transicao para granted, GA4 e Ads nao mandaram
   * nenhum hit do visitante que volta. O default e sempre negado; o
   * consentimento salvo entra como update.
   */
  it("o default do Consent Mode e sempre negado, e o salvo vira update", () => {
    const html = source("client/index.html");
    const padrao = bloco(html, "gtag('consent', 'default'", "});");
    for (const sinal of ["ad_storage", "analytics_storage", "ad_user_data", "ad_personalization"]) {
      expect(padrao).toMatch(new RegExp(`${sinal}\\s*:\\s*'denied'`));
    }
    expect(padrao).not.toMatch(/stored|granted'\s*:|\?\s*'granted'/);
    expect(html).toMatch(/gtag\('consent',\s*'update'/);
  });

  it("o aceite do banner emite consent_granted (Meta e GA4 pegam a entrada)", () => {
    expect(source("client/src/components/CookieConsent.tsx")).toMatch(/if \(granted\) trackConsentGranted\(\)/);
    expect(source("client/src/lib/tracking.ts")).toContain('"consent_granted"');
  });
});

describe("GUARD-RAIL: user_data nao gruda nos eventos seguintes", () => {
  it("o push com user_data e seguido de limpeza no dataLayer", () => {
    expect(source("client/src/lib/tracking.ts")).toMatch(
      /if \(params\.user_data\) window\.dataLayer\.push\(\{ user_data: undefined \}\)/
    );
  });
});

describe("GUARD-RAIL: sinais de interesse medidos", () => {
  it("FAQ aberta e 'Como chegar' viram evento, num ouvinte unico no App", () => {
    const tracking = source("client/src/lib/tracking.ts");
    expect(tracking).toContain('"faq_open"');
    expect(tracking).toContain('"directions_click"');
    const hook = source("client/src/hooks/useInteractionTracking.ts");
    expect(hook).toContain("trackFaqOpen");
    expect(hook).toContain("trackDirectionsClick");
    expect(source("client/src/App.tsx")).toMatch(/useInteractionTracking\(\)/);
  });
});

describe("GUARD-RAIL: todo caminho de lead tem conversao, uma vez so", () => {
  it("o formulario de contato emite o lead qualificado e manda o event_id ao servidor", () => {
    const contato = source("client/src/components/ContatoSection.tsx");
    expect(contato).toMatch(/trackLeadQualificado\(\s*"form_contato"/);
    expect(contato).toMatch(/eventId,\s*\n\s*examType/);
  });

  it("a tela de sucesso nao conta a conversao de novo", () => {
    const sucesso = source("client/src/pages/FormSubmissionSuccess.tsx");
    expect(sucesso).not.toContain("trackWhatsAppConversionWithLead");
    expect(sucesso).toContain("trackWhatsAppRedirectRequested");
  });

  it("o botao do Outubro Rosa emite whatsapp_click", () => {
    expect(source("client/src/pages/OutubroRosa.tsx")).toMatch(/trackWhatsAppClick\(origem\)/);
  });

  it("o quadro de contato do blog informa o exame do artigo", () => {
    expect(source("client/src/pages/BlogPost.tsx")).toMatch(
      /trackWhatsAppConversion\("artigo_cta", "blog", meta\?\.examType\)/
    );
  });
});

describe("GUARD-RAIL: o lead chega a planilha com o que a conversao offline precisa", () => {
  it("lead.create aceita os ids de clique e repassa exame, event_id e valor", () => {
    const routers = source("server/routers.ts");
    for (const campo of ["gclid", "gbraid", "wbraid"]) {
      expect(routers).toMatch(new RegExp(`${campo}: z\\.string\\(\\)\\.max\\(255\\)\\.optional\\(\\)`));
    }
    expect(routers).toMatch(/syncLeadToSheet\(\{ \.\.\.leadInput, gclid, gbraid, wbraid, examType, eventId, value \}\)/);
  });

  it("o Apps Script grava as colunas novas por cabecalho, sem colidir com as da recepcao", () => {
    const gs = source("docs/scripts/gravar-lead-por-cabecalho.gs");
    for (const par of ["'GCLID': 'gclid'", "'GBRAID': 'gbraid'", "'WBRAID': 'wbraid'",
      "'Exame (site)': 'examType'", "'Event ID': 'eventId'", "'Valor estimado (site)': 'value'"]) {
      expect(gs).toContain(par);
    }
    expect(gs).not.toMatch(/'Valor':\s*'value'/);
  });
});

describe("canal do lead com clique de anuncio", () => {
  afterEach(() => {
    delete (globalThis as any).window;
    delete (globalThis as any).document;
    delete (globalThis as any).sessionStorage;
  });

  function navegador(url: string, referrer = "") {
    const u = new URL(url);
    const store = new Map<string, string>();
    (globalThis as any).window = { location: { search: u.search, pathname: u.pathname, hostname: u.hostname, href: u.href } };
    (globalThis as any).document = { referrer };
    (globalThis as any).sessionStorage = {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    };
  }

  it("gclid sem UTM e Google Ads, e o id vai para o lead", async () => {
    navegador("https://totalquality.med.br/exames/raio-x?gbraid=0AAAAAteste");
    vi.resetModules();
    const t = await import("../client/src/lib/utmTracker");
    expect(t.captureUTMParams().channel).toBe("Google Ads");
    expect(t.getLeadClickIdsForAPI()).toEqual({ gclid: undefined, gbraid: "0AAAAAteste", wbraid: undefined });
  });

  it("utm_source desconhecido nao vira Acesso Direto", async () => {
    navegador("https://totalquality.med.br/?utm_source=panfleto");
    vi.resetModules();
    const t = await import("../client/src/lib/utmTracker");
    expect(t.captureUTMParams().channel).toBe("Outras Campanhas (UTM)");
  });
});

describe("GUARD-RAIL: regra do pixel nos artigos do blog (Alex, 29/10/2026)", () => {
  const dir = new URL("../client/src/content/blog/", import.meta.url);
  const artigos = readdirSync(dir)
    .filter((f) => f.endsWith(".json") && f !== "index.json")
    .map((f) => ({ arquivo: f, dados: JSON.parse(readFileSync(new URL(f, dir), "utf8")) }));

  it("encontra os artigos", () => {
    expect(artigos.length).toBeGreaterThan(10);
  });

  /*
   * Link de contato no corpo do artigo pula o formulario de qualificacao: sem
   * whatsapp_click, sem event_id, sem linha na planilha e sem conversao no Ads.
   * O contato do artigo e o ExamCTA, que ja mede tudo.
   */
  it("nenhum artigo tem link de contato, mapa, script ou pixel no corpo", () => {
    const proibidos = [
      /api\.whatsapp\.com/i, /wa\.me\//i, /whatsapp\.com\/send/i, /\btel:/i,
      /google\.[a-z.]+\/maps/i, /maps\.app\.goo\.gl/i, /goo\.gl\/maps/i,
      /<script/i, /\bon[a-z]+\s*=/i, /<iframe/i, /fbq\(|gtag\(|dataLayer/i,
    ];
    const achados: string[] = [];
    for (const { arquivo, dados } of artigos) {
      const corpo = JSON.stringify(dados.content ?? "");
      for (const re of proibidos) if (re.test(corpo)) achados.push(`${arquivo}: ${re}`);
    }
    expect(achados).toEqual([]);
  });

  it("todo artigo informa o exame (examType), e o publicado tambem a pagina do exame", () => {
    // Rascunho pode nascer sem examPages; publicar exige o botao para a pagina.
    const sem = artigos
      .filter(({ dados }) => !dados.examType ||
        (dados.draft !== true && (!Array.isArray(dados.examPages) || dados.examPages.length === 0)))
      .map(({ arquivo }) => arquivo);
    expect(sem).toEqual([]);
  });

  it("o contato do artigo e o ExamCTA, pelo formulario de qualificacao", () => {
    const cta = source("client/src/components/ExamCTA.tsx");
    expect(cta).toContain("useWhatsAppRedirect");
    expect(cta).toMatch(/trackWhatsAppConversion\(label, "blog", examType\)/);
    expect(source("client/src/pages/BlogPost.tsx")).toContain("ExamCTA");
  });
});
