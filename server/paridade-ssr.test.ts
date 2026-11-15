import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getSeoContentForPath, getSsrPage } from "./_core/seo-content";
import { getRouteMetadata } from "./_core/routes-metadata";
import { examesData, examH1 } from "@/lib/examesData";
import { especialidadesData } from "@/lib/especialidadesData";
import { HOME_FAQS } from "@/lib/paginasServico";
import { ANALISES_H1, BIOIMPEDANCIA_H1, CHECKUP_H1 } from "@shared/const";

/*
 * SEO nov/2026, Fase 1 — fonte unica de conteudo (plano aprovado pelo Alex em
 * 14/11/2026). Nas rotas de template o servidor entrega o HTML do PROPRIO
 * componente React, que o navegador hidrata. Este teste trava o contrato do
 * lado do servidor; a comparacao com a pagina ja hidratada no navegador
 * (curl x DOM, com console sem aviso de hidratacao) e o
 * scripts/paridade-ssr.mjs, que roda contra o servidor de producao local.
 *
 * Se falhar: corrigir a pagina ou o dado — nunca afrouxar o teste.
 */

const decode = (s: string) =>
  s
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

function h1s(html: string): string[] {
  return [...html.matchAll(/<h1[\s>][^]*?<\/h1>/g)].map((m) => decode(m[0]));
}

function headings(html: string): string[] {
  return [...html.matchAll(/<(h[23])[\s>][^]*?<\/\1>/g)].map((m) => `${m[1]}:${decode(m[0])}`);
}

/** Perguntas visiveis: cada <details> com a resposta no DOM desde o 1o render. */
function faqVisivel(html: string): Array<{ q: string; a: string }> {
  return [...html.matchAll(/<details[\s>][^]*?<\/details>/g)].map((m) => {
    const summary = m[0].match(/<summary[\s>][^]*?<\/summary>/)?.[0] ?? "";
    const resto = m[0].replace(summary, "");
    // icone decorativo (aria-hidden) nao e texto da pergunta
    const pergunta = summary.replace(/<span aria-hidden="true"[^>]*>[^<]*<\/span>/g, "");
    return { q: decode(pergunta), a: decode(resto) };
  });
}

function faqJsonLd(html: string): Array<{ q: string; a: string }> {
  const blocos = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) =>
    JSON.parse(m[1])
  );
  const faq = blocos.find((b) => b["@type"] === "FAQPage");
  return (faq?.mainEntity ?? []).map((q: { name: string; acceptedAnswer: { text: string } }) => ({
    q: q.name.replace(/\s+/g, " ").trim(),
    a: q.acceptedAnswer.text.replace(/\s+/g, " ").trim(),
  }));
}

const ROTAS: Array<[string, string]> = [
  ...examesData.map((e) => [`/exames/${e.slug}`, examH1(e)] as [string, string]),
  ...especialidadesData.map((e) => [`/especialidades/${e.slug}`, examH1(e)] as [string, string]),
  ["/laboratorio-caraguatatuba", ANALISES_H1],
  ["/checkup", CHECKUP_H1],
  ["/bioimpedancia", BIOIMPEDANCIA_H1],
];

describe("Fase 1: o servidor entrega a pagina React (fonte unica)", () => {
  it.each(ROTAS)("%s e renderizada pelo React e marcada para hidratar", (rota) => {
    const page = getSsrPage(rota);
    expect(page, `${rota} deveria ser renderizada no servidor`).not.toBeNull();
    expect(page!.hydrate).toBe(true);
    // o bloco antigo, escrito a mao, nao volta
    expect(page!.body).not.toContain("seo-prerender");
    // nada de JSON-LD dentro do #root (iria quebrar a hidratacao): fica no <head>
    expect(page!.body).not.toContain("application/ld+json");
  });

  it.each(ROTAS)("%s tem um H1 so, no formato '[Nome] em Caraguatatuba', sem caixa alta no texto", (rota, esperado) => {
    const html = getSsrPage(rota)!.body;
    const lista = h1s(html);
    expect(lista).toEqual([esperado]);
    expect(lista[0]).toMatch(/ em Caraguatatuba$/);
    // A caixa alta e do CSS (.heading-display); o texto e normal.
    expect(lista[0]).not.toBe(lista[0].toUpperCase());
  });

  it.each(ROTAS)("%s: o FAQ visivel e o FAQPage do JSON-LD sao o mesmo texto", (rota) => {
    const page = getSsrPage(rota)!;
    const visivel = faqVisivel(page.body);
    expect(visivel.length, `${rota} sem FAQ visivel`).toBeGreaterThan(0);
    expect(visivel.every((f) => f.a.length > 20), "resposta ausente do DOM").toBe(true);
    expect(faqJsonLd(page.jsonLd)).toEqual(visivel);
  });

  it.each(ROTAS)("%s mostra 'Onde fazer [exame] em Caraguatatuba' com endereco, telefone e horario", (rota) => {
    const html = getSsrPage(rota)!.body;
    // Fase 3 (15/11/2026, modelo aprovado em 14/11): o H2 nomeia o exame —
    // "Onde fazer hemograma em Caraguatatuba". Continua obrigatorio.
    expect(headings(html).some((h) => /^h2:Onde fazer (.+ )?em Caraguatatuba$/.test(h)), headings(html).join(" | ")).toBe(true);
    const texto = decode(html);
    expect(texto).toContain("Rua Padre Anchieta, 1010");
    expect(texto).toContain("(12) 3887-3535");
    expect(texto).toContain("7h30 às 18h");
  });

  it("nenhum dado de exame ou especialidade guarda o nome em caixa alta", () => {
    for (const e of [...examesData, ...especialidadesData]) {
      expect(e.title, e.slug).not.toBe(e.title.toUpperCase());
    }
  });

  it.each(ROTAS)("%s: title e description do servidor sao os do dado que o React usa", (rota) => {
    const meta = getRouteMetadata(rota)!;
    const slug = rota.split("/").pop()!;
    const e = [...examesData, ...especialidadesData].find((x) => x.slug === slug);
    if (!e) return; // laboratorio, check-up e bioimpedancia: shared/const.ts dos dois lados
    expect(meta.title).toBe(e.metaTitle);
    expect(meta.description).toBe(e.metaDescription);
  });

  it("barra final: o HTML vai, mas sem hidratar (o wouter do navegador decide a rota)", () => {
    const page = getSsrPage("/exames/hemograma/")!;
    expect(page.hydrate).toBe(false);
    expect(h1s(page.body)).toEqual(["Hemograma Completo em Caraguatatuba"]);
  });
});

describe("Fase 1: home — o FAQPage corresponde a um FAQ visivel", () => {
  it("o pre-render mostra as mesmas perguntas e respostas do FAQPage", () => {
    const html = getSeoContentForPath("/")!;
    const ld = faqJsonLd(html);
    expect(ld).toEqual(HOME_FAQS.map((f) => ({ q: f.q, a: f.a })));
    for (const f of HOME_FAQS) {
      expect(decode(html)).toContain(f.q);
      expect(decode(html)).toContain(decode(f.a));
    }
  });

  it("a home React exibe as mesmas perguntas (HomeFaqSection, mesma lista)", () => {
    const raiz = resolve(import.meta.dirname, "..");
    const home = readFileSync(resolve(raiz, "client/src/pages/Home.tsx"), "utf-8");
    const secao = readFileSync(resolve(raiz, "client/src/components/HomeFaqSection.tsx"), "utf-8");
    expect(home).toContain("<HomeFaqSection />");
    expect(secao).toContain("HOME_FAQS.map");
    expect(readFileSync(resolve(raiz, "server/_core/seo-content.ts"), "utf-8")).toContain("faqSectionHtml(HOME_FAQS)");
  });
});

describe("Fase 2: /sobre e /contato sao paginas reais, renderizadas no servidor", () => {
  it.each([
    ["/sobre", "Sobre a Total Quality em Caraguatatuba", "AboutPage"],
    ["/contato", "Contato da Total Quality em Caraguatatuba", "ContactPage"],
  ])("%s: H1 proprio, schema e identificacao do art. 5o", (rota, h1, tipo) => {
    const page = getSsrPage(rota)!;
    expect(page.hydrate).toBe(true);
    expect(h1s(page.body)).toEqual([h1]);
    expect(page.jsonLd).toContain(`"@type":"${tipo}"`);
    const texto = decode(page.body);
    expect(texto).toContain("Rua Padre Anchieta, 1010");
    expect(texto).toContain("(12) 3887-3535");
    expect(texto).toMatch(/Registro\s*970616/);
    expect(texto).toContain("Responsável Técnico: Alex Waltersdorf - 267.339");
    expect(getRouteMetadata(rota)!.canonical).toBe(`https://totalquality.med.br${rota}`);
  });

  it("/sobre conta a historia desde 2003 e /contato tem mapa com carregamento preguicoso", () => {
    expect(decode(getSsrPage("/sobre")!.body)).toContain("Fundada em 2003");
    expect(getSsrPage("/sobre")!.body).toMatch(/<iframe[^>]*loading="lazy"/);
    expect(getSsrPage("/contato")!.body).toMatch(/<iframe[^>]*loading="lazy"/);
  });
});

describe("Fase 2: CTAs como links reais no HTML do servidor", () => {
  it("a pagina de exame leva links de WhatsApp com a mensagem da pagina", () => {
    const html = getSsrPage("/exames/hemograma")!.body;
    const hrefs = [...html.matchAll(/<a [^>]*href="(https:\/\/api\.whatsapp\.com[^"]*)"[^>]*data-cta="whatsapp"/g)].map((m) =>
      decodeURIComponent(m[1].replace(/&amp;/g, "&"))
    );
    expect(hrefs.length).toBeGreaterThanOrEqual(3);
    for (const h of hrefs) {
      expect(h).toContain("phone=551238873535");
      expect(h).toContain("Olá, vim pelo site e quero informações sobre hemograma completo");
    }
    expect(html).not.toContain("wa.me");
  });

  it("menu e rodape apontam para /sobre, /contato e os resultados online", () => {
    const html = getSsrPage("/checkup")!.body;
    expect(html).toContain('href="/sobre"');
    expect(html).toContain('href="/contato"');
    expect(html).toContain('href="https://app.totalquality.med.br/"');
    expect(html).not.toMatch(/href="#(sobre|contato|inicio)"/);
  });
});
