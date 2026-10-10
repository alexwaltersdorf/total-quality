import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import fs from "fs";
import path from "path";

/**
 * Stubs minimos: os testes rodam em ambiente "node" (ver vitest.config.ts),
 * entao window/document/sessionStorage precisam existir antes do import.
 */
function prepararNavegador(url: string, referrer = "") {
  const u = new URL(url);
  const store = new Map<string, string>();
  (globalThis as any).window = { location: { search: u.search, pathname: u.pathname, hostname: u.hostname, href: u.href } };
  (globalThis as any).document = { referrer };
  (globalThis as any).sessionStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  return store;
}

async function carregarTracker() {
  vi.resetModules();
  return await import("../client/src/lib/utmTracker");
}

afterEach(() => {
  delete (globalThis as any).window;
  delete (globalThis as any).document;
  delete (globalThis as any).sessionStorage;
});

describe("GUARD-RAIL: o utm_term nao gruda na sessao (nao remover)", () => {
  it("navegacao dentro do site NAO sobrescreve a campanha da chegada", async () => {
    const store = prepararNavegador("https://totalquality.med.br/?utm_source=google&utm_medium=cpc&utm_term=pesquisa-raiox");
    const t = await carregarTracker();
    expect(t.captureUTMParams().utmTerm).toBe("pesquisa-raiox");

    // Segunda pagina, sem parametro nenhum: o dado da campanha tem de sobreviver.
    (globalThis as any).window.location.search = "";
    (globalThis as any).window.location.pathname = "/exames/ultrassonografia";
    expect(t.captureUTMParams().utmTerm).toBe("pesquisa-raiox");
    expect(store.size).toBe(1);
  });

  it("uma chegada NOVA com utm_term sobrescreve a anterior", async () => {
    prepararNavegador("https://totalquality.med.br/?utm_source=google&utm_medium=cpc&utm_term=pesquisa-raiox");
    const t = await carregarTracker();
    expect(t.captureUTMParams().utmTerm).toBe("pesquisa-raiox");

    /*
     * Este e o caso que a planilha mostrou: o mesmo paciente chega por raio-x e
     * depois clica num anuncio de ultrassom. Antes de 22/09/2026 o segundo
     * clique herdava `pesquisa-raiox` e a atribuicao ficava errada.
     */
    (globalThis as any).window.location.search = "?utm_source=google&utm_medium=cpc&utm_term=pesquisa-ultrassom";
    expect(t.captureUTMParams().utmTerm).toBe("pesquisa-ultrassom");
  });

  it("um clique pago sem UTM (so gclid) tambem sobrescreve o organico anterior", async () => {
    prepararNavegador("https://totalquality.med.br/", "https://www.google.com/");
    const t = await carregarTracker();
    expect(t.captureUTMParams().channel).toBe("Google Orgânico");

    (globalThis as any).window.location.search = "?gclid=Cj0KCQtesteGCLID";
    const depois = t.captureUTMParams();
    expect(depois.gclid).toBe("Cj0KCQtesteGCLID");
  });
});

describe("GUARD-RAIL: o gclid nao vai no payload do lead (nao remover)", () => {
  it("getUTMForAPI nao expoe identificador de clique", async () => {
    prepararNavegador("https://totalquality.med.br/?gclid=abc123&utm_source=google");
    const t = await carregarTracker();
    t.captureUTMParams();
    const payload = t.getUTMForAPI();

    /*
     * O schema de lead.create no servidor nao aceita estes campos. Mandar um
     * deles faz o tRPC devolver HTTP 400 e o lead se perde — medicao quebrando
     * atendimento. O gclid tem caminho proprio: getAdClickIds -> ADS-01.
     */
    for (const proibido of ["gclid", "gbraid", "wbraid", "keyword", "campaignid", "adgroupid"]) {
      expect(Object.keys(payload)).not.toContain(proibido);
    }
    expect(t.getAdClickIds().gclid).toBe("abc123");
  });
});

describe("GUARD-RAIL: o codigo TQ casa com a validacao do ADS-01 (nao remover)", () => {
  it("gera sempre no formato que o webhook aceita, sem caractere ambiguo", async () => {
    const { gerarCodigoTQ, PADRAO_CODIGO } = await import("../client/src/lib/adsClickTracker");

    // O mesmo regex do node "Normalizar e validar clique" do ADS-01.
    const regexDoN8N = /^TQ-[A-HJ-NP-Z2-9]{5}$/;
    const vistos = new Set<string>();
    for (let i = 0; i < 2000; i++) {
      const c = gerarCodigoTQ();
      expect(c).toMatch(regexDoN8N);
      expect(PADRAO_CODIGO.test(c)).toBe(true);
      // I, O, 0 e 1 sao os quatro que as pessoas trocam ao reescrever a mao.
      expect(c.slice(3)).not.toMatch(/[IO01]/);
      vistos.add(c);
    }
    expect(vistos.size).toBeGreaterThan(1900);
  });
});

describe("GUARD-RAIL: o endereco do N8N nao entra no repositorio (nao remover)", () => {
  it("nenhum host de webhook fica embutido no codigo do site", () => {
    const raiz = path.resolve(__dirname, "..", "client", "src");
    const arquivos: string[] = [];
    (function anda(dir: string) {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) anda(p);
        else if (/\.tsx?$/.test(e.name)) arquivos.push(p);
      }
    })(raiz);

    for (const f of arquivos) {
      const src = fs.readFileSync(f, "utf8");
      expect(src, `${path.relative(raiz, f)} embute um host de n8n`).not.toMatch(/https:\/\/[^\s"']*n8n[^\s"']*\.(cloud|com|io)/);
      expect(src, `${path.relative(raiz, f)} embute /webhook/`).not.toMatch(/https:\/\/[^\s"']*\/webhook\//);
    }
  });
});
