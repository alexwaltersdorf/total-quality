/*
 * GUARD-RAIL do endereco no formulario de qualificacao (pedido do Alex,
 * 22/11/2026). Nao remover.
 *
 * O endereco e opcional e vai SO para o armazenamento da propria clinica
 * (banco e planilha). LGPD, art. 6, III (minimizacao): nada de endereco no
 * dataLayer/GTM/GA4/Google Ads/Meta, nem na Conversions API, nem em hash, nem
 * na mensagem pre-preenchida do WhatsApp (que vira URL).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const mocks = vi.hoisted(() => ({
  createLead: vi.fn(async () => ({ success: true })),
  syncLeadToSheet: vi.fn(async () => true),
  dispatchLeadConversion: vi.fn(async () => ({ meta: "skipped", ga4: "skipped" })),
  notifyOwner: vi.fn(async () => true),
}));

vi.mock("./db", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./db")>()),
  createLead: mocks.createLead,
}));
vi.mock("./_core/googleSheetsSync", () => ({ syncLeadToSheet: mocks.syncLeadToSheet }));
vi.mock("./_core/conversions", () => ({ dispatchLeadConversion: mocks.dispatchLeadConversion }));
vi.mock("./_core/notification", () => ({ notifyOwner: mocks.notifyOwner }));

import { appRouter } from "./routers";
import { montarEnderecoLead, LIMITES_ENDERECO } from "../client/src/lib/enderecoLead";
import {
  extrairComponentes,
  partesDaApiLegada,
  partesDaApiNova,
  urlScriptGoogleMaps,
} from "../client/src/lib/enderecoGoogle";
import { trackLeadQualificado } from "../client/src/lib/tracking";

const raiz = resolve(import.meta.dirname, "..");
const leia = (rel: string) => readFileSync(resolve(raiz, rel), "utf-8");

/** Tudo que identifica o endereco de teste, como chave ou como valor. */
const CHAVES_ENDERECO = ["address", "addressComplement", "street", "streetNumber", "neighborhood", "city", "state", "zipCode", "endereco", "complemento"];
const VALORES_ENDERECO = /Anchieta|1010|Centro|Caraguatatuba|11660|apto 32/i;

const ENDERECO_GOOGLE = {
  formatado: "R. Padre Anchieta, 1010 - Centro, Caraguatatuba - SP, 11660-010, Brasil",
  componentes: { rua: "Rua Padre Anchieta", numero: "1010", bairro: "Centro", cidade: "Caraguatatuba", uf: "SP", cep: "11660-010" },
};

function contexto() {
  return {
    user: null,
    req: { protocol: "https", headers: { "user-agent": "test-agent", "x-forwarded-for": "127.0.0.1" }, ip: "127.0.0.1" } as any,
    res: {} as any,
  };
}

function chavesProfundas(obj: unknown, acc: string[] = []): string[] {
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      acc.push(k);
      chavesProfundas(v, acc);
    }
  }
  return acc;
}

describe("montarEnderecoLead", () => {
  it("sem nada digitado nao acrescenta chave nenhuma ao lead (payload igual ao de antes)", () => {
    expect(montarEnderecoLead("", "", null)).toEqual({});
    expect(montarEnderecoLead("   ", " ", ENDERECO_GOOGLE.componentes)).toEqual({});
  });

  it("com sugestao escolhida leva o texto e as partes; sem sugestao, so o texto", () => {
    expect(montarEnderecoLead(ENDERECO_GOOGLE.formatado, "apto 32", ENDERECO_GOOGLE.componentes)).toEqual({
      address: ENDERECO_GOOGLE.formatado,
      addressComplement: "apto 32",
      street: "Rua Padre Anchieta",
      streetNumber: "1010",
      neighborhood: "Centro",
      city: "Caraguatatuba",
      state: "SP",
      zipCode: "11660-010",
    });
    expect(montarEnderecoLead("Rua digitada a mao, 12", "", null)).toEqual({ address: "Rua digitada a mao, 12" });
  });

  it("corta no limite do schema: endereco comprido nunca derruba o lead inteiro", () => {
    const r = montarEnderecoLead("x".repeat(2000), "y".repeat(500), null);
    expect(r.address!.length).toBe(LIMITES_ENDERECO.address);
    expect(r.addressComplement!.length).toBe(LIMITES_ENDERECO.addressComplement);
  });
});

describe("componentes do Google (Places API nova e legada)", () => {
  it("extrai rua, numero, bairro, cidade, UF e CEP nos dois formatos", () => {
    const nova = partesDaApiNova([
      { types: ["street_number"], longText: "1010", shortText: "1010" },
      { types: ["route"], longText: "Rua Padre Anchieta", shortText: "R. Padre Anchieta" },
      { types: ["sublocality_level_1", "sublocality", "political"], longText: "Centro", shortText: "Centro" },
      { types: ["administrative_area_level_2", "political"], longText: "Caraguatatuba", shortText: "Caraguatatuba" },
      { types: ["administrative_area_level_1", "political"], longText: "São Paulo", shortText: "SP" },
      { types: ["country", "political"], longText: "Brasil", shortText: "BR" },
      { types: ["postal_code"], longText: "11660-010", shortText: "11660-010" },
    ]);
    expect(extrairComponentes(nova)).toEqual(ENDERECO_GOOGLE.componentes);

    const legada = partesDaApiLegada([
      { types: ["route"], long_name: "Rua Padre Anchieta", short_name: "R. Padre Anchieta" },
      { types: ["sublocality_level_1", "sublocality", "political"], long_name: "Centro", short_name: "Centro" },
      { types: ["administrative_area_level_2", "political"], long_name: "Caraguatatuba", short_name: "Caraguatatuba" },
      { types: ["administrative_area_level_1", "political"], long_name: "São Paulo", short_name: "SP" },
    ]);
    // Resultado brasileiro sem numero e sem CEP e comum: dai o campo
    // "Numero / complemento" separado.
    expect(extrairComponentes(legada)).toEqual({ rua: "Rua Padre Anchieta", bairro: "Centro", cidade: "Caraguatatuba", uf: "SP" });
  });

  it("o script do Google sai com loading=async, places, pt-BR e BR", () => {
    const url = new URL(urlScriptGoogleMaps("CHAVE"));
    expect(url.origin + url.pathname).toBe("https://maps.googleapis.com/maps/api/js");
    expect(url.searchParams.get("loading")).toBe("async");
    expect(url.searchParams.get("libraries")).toBe("places");
    expect(url.searchParams.get("language")).toBe("pt-BR");
    expect(url.searchParams.get("region")).toBe("BR");
  });

  it("o Google so carrega sob demanda: import() no campo, nunca import estatico nem script no HTML", () => {
    const arquivos = readdirRecursivo("client/src").filter((f) => /\.(tsx?|jsx?)$/.test(f));
    // `import type` some no build; so import de VALOR puxaria o modulo para o bundle de entrada.
    const estaticos = arquivos.filter((f) =>
      leia(f).split("\n").some((l) => /from\s+["'][^"']*enderecoGoogle["']/.test(l) && !/^\s*import type\b/.test(l))
    );
    expect(estaticos).toEqual([]);
    expect(leia("client/src/components/CampoEnderecoGoogle.tsx")).toContain('import("@/lib/enderecoGoogle")');
    expect(leia("client/index.html")).not.toContain("maps.googleapis.com");
    const comScript = arquivos.filter((f) => f !== "client/src/lib/enderecoGoogle.ts" && leia(f).includes("maps.googleapis.com"));
    expect(comScript).toEqual([]);
  });
});

describe("GUARD-RAIL: endereco nunca vai para medicao nem para a mensagem do WhatsApp", () => {
  let eventos: Record<string, unknown>[];
  beforeEach(() => {
    eventos = [];
    vi.stubGlobal("window", {
      dataLayer: eventos,
      location: { href: "https://totalquality.med.br/exames/hemograma", pathname: "/exames/hemograma", hostname: "totalquality.med.br" },
      // Com consentimento de marketing: e o caso em que mais coisa sai (user_data).
      localStorage: { getItem: (k: string) => (k === "tq-consent" ? "granted" : null), setItem: () => {} },
      crypto: globalThis.crypto,
    });
    vi.stubGlobal("document", { title: "Hemograma", referrer: "", cookie: "" });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("o evento de conversao do navegador (dataLayer) nao tem campo nem valor de endereco", async () => {
    await trackLeadQualificado("exame_hemograma", "hemograma", { email: "teste@example.com", telefone: "(12) 98765-4321" }, "whatsapp");
    // O push da conversao e, logo depois, o que limpa user_data do dataLayer.
    const conversao = eventos.find((e) => e.event === "whatsapp_click");
    expect(conversao).toHaveProperty("user_data"); // o caminho com hash foi exercitado
    const chaves = chavesProfundas(eventos);
    for (const k of CHAVES_ENDERECO) expect(chaves).not.toContain(k);
    expect(JSON.stringify(eventos)).not.toMatch(/Anchieta|11660|apto 32/);
  });

  it("no contexto do formulario, o endereco so aparece no trackLeadDirect — nunca no evento nem na mensagem", () => {
    const ctx = leia("client/src/contexts/ContatoLeadContext.tsx");
    const chamada = (inicio: string) => {
      const i = ctx.indexOf(inicio);
      expect(i, `${inicio} nao encontrado`).toBeGreaterThan(-1);
      return ctx.slice(i, ctx.indexOf(");", i));
    };
    for (const trecho of [
      chamada("await trackLeadQualificado("),
      chamada("abrirConversa(buildMessageWithName("),
      chamada("trackWhatsAppRedirectRequested(pending.source"),
    ]) {
      expect(trecho).not.toMatch(/endereco|complemento|componentes/i);
    }
    // A conversao pelo servidor (2o argumento do trackLeadDirect) nao leva endereco.
    const direto = ctx.slice(ctx.indexOf("void trackLeadDirect("), ctx.indexOf("if (pending.canal ===", ctx.indexOf("void trackLeadDirect(")));
    const [contato, conversao] = direto.split(/\}\s*,\s*\n\s*eventId/);
    expect(contato).toContain("...enderecoLead");
    expect(conversao).not.toMatch(/endereco|complemento|componentes|address/i);
    // E o endereco nao vira campo obrigatorio (atrito antes do WhatsApp).
    expect(ctx).toMatch(/const CAMPOS_OBRIGATORIOS = \["nome", "telefone", "email"\] as const;/);
  });
});

describe("GUARD-RAIL: lead.create grava o endereco so no banco e na planilha", () => {
  beforeEach(() => {
    mocks.createLead.mockClear();
    mocks.syncLeadToSheet.mockClear();
    mocks.dispatchLeadConversion.mockClear();
    mocks.notifyOwner.mockClear();
  });

  const comEndereco = {
    source: "exame_hemograma",
    page: "/exames/hemograma",
    name: "Ana Teste",
    phone: "(12) 98765-4321",
    email: "ana@example.com",
    address: ENDERECO_GOOGLE.formatado,
    addressComplement: "apto 32",
    street: "Rua Padre Anchieta",
    streetNumber: "1010",
    neighborhood: "Centro",
    city: "Caraguatatuba",
    state: "SP",
    zipCode: "11660-010",
    eventId: "11111111-2222-3333-4444-555555555555",
    examType: "hemograma",
    value: 135,
    leadChannel: "whatsapp" as const,
    consentMarketing: true,
    consentAnalytics: true,
  };

  it("banco recebe endereco (com complemento), cidade, UF e CEP — e nenhuma coluna que nao existe", async () => {
    await appRouter.createCaller(contexto()).lead.create(comEndereco);
    const linha = mocks.createLead.mock.calls[0][0] as Record<string, unknown>;
    expect(linha.address).toBe(`${ENDERECO_GOOGLE.formatado} — Nº/compl.: apto 32`);
    expect(linha).toMatchObject({ city: "Caraguatatuba", state: "SP", zipCode: "11660-010" });
    for (const k of ["addressComplement", "street", "streetNumber", "neighborhood"]) expect(linha).not.toHaveProperty(k);
  });

  it("planilha recebe o endereco e as partes", async () => {
    await appRouter.createCaller(contexto()).lead.create(comEndereco);
    expect(mocks.syncLeadToSheet.mock.calls[0][0]).toMatchObject({
      address: `${ENDERECO_GOOGLE.formatado} — Nº/compl.: apto 32`,
      addressComplement: "apto 32",
      street: "Rua Padre Anchieta",
      streetNumber: "1010",
      neighborhood: "Centro",
      city: "Caraguatatuba",
      state: "SP",
      zipCode: "11660-010",
    });
  });

  it("Conversions API / GA4 MP e a notificacao da Manus nao recebem endereco", async () => {
    await appRouter.createCaller(contexto()).lead.create(comEndereco);
    expect(mocks.dispatchLeadConversion).toHaveBeenCalledTimes(1);
    const conversao = mocks.dispatchLeadConversion.mock.calls[0][0] as Record<string, unknown>;
    const chaves = chavesProfundas(conversao);
    for (const k of CHAVES_ENDERECO) expect(chaves).not.toContain(k);
    const { page, ...semPagina } = conversao; // a pagina /exames/hemograma nao e endereco
    void page;
    expect(JSON.stringify(semPagina)).not.toMatch(VALORES_ENDERECO);
    expect(JSON.stringify(mocks.notifyOwner.mock.calls)).not.toMatch(/Anchieta|11660|apto 32/);
  });

  it("lead sem endereco continua sendo gravado como antes", async () => {
    const { address, addressComplement, street, streetNumber, neighborhood, city, state, zipCode, ...semEndereco } = comEndereco;
    void [address, addressComplement, street, streetNumber, neighborhood, city, state, zipCode];
    await expect(appRouter.createCaller(contexto()).lead.create(semEndereco)).resolves.toEqual({ success: true });
    expect((mocks.createLead.mock.calls[0][0] as Record<string, unknown>).address).toBeUndefined();
  });
});

function readdirRecursivo(rel: string): string[] {
  return readdirSync(resolve(raiz, rel), { recursive: true, encoding: "utf-8" }).map((f) => `${rel}/${f}`);
}
