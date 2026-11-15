import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  getSeoContentForPath,
  getSsrPage,
  injectSeoContent,
  injectSsrPage,
} from "./_core/seo-content";
import { getAllRoutes, getRouteMetadata, injectMetaTags } from "./_core/routes-metadata";
import { SCHEMA_EXAMES } from "./_core/schema-exames";
import { examesData } from "@/lib/examesData";
import { especialidadesData } from "@/lib/especialidadesData";
import { REVISOR_LD } from "@/lib/blogMeta";
import blogIndex from "../client/src/content/blog/index.json";

/*
 * SEO nov/2026, Fase 5 — dados estruturados (plano aprovado pelo Alex em
 * 14/11/2026, docs/seo-plano.md §7).
 *
 * Monta a resposta de CADA rota do jeito que o servidor de producao monta
 * (server/_core/vite.ts, serveStatic: index.html + meta tags da rota + SSR do
 * React ou pre-render) e confere o JSON-LD da pagina inteira:
 *   - todo bloco e JSON valido, com @context do schema.org;
 *   - todos os blocos ficam no <head> (nenhum dentro do #root: o React apagava
 *     os de dentro e os hooks do cliente recolocavam outra copia);
 *   - nenhum @type repetido em dois blocos da mesma pagina e nenhuma entidade
 *     (@id) descrita duas vezes;
 *   - o FAQPage e igual, pergunta a pergunta, ao FAQ visivel da pagina;
 *   - nada de AggregateRating/Review (nota inventada e proibida — CFM e Google);
 *   - revisao, MedicalTest e Physician nas paginas de servico; AboutPage e
 *     ContactPage em /sobre e /contato.
 *
 * Se falhar: corrigir a pagina ou o dado — nunca afrouxar o teste.
 */

const TEMPLATE = readFileSync(resolve(import.meta.dirname, "../client/index.html"), "utf-8");

function respostaDaRota(pathname: string): string {
  let html = TEMPLATE;
  const meta = getRouteMetadata(pathname);
  if (meta) html = injectMetaTags(html, meta);
  const ssr = getSsrPage(pathname);
  if (ssr) return injectSsrPage(html, ssr);
  const seo = getSeoContentForPath(pathname);
  return seo ? injectSeoContent(html, seo) : html;
}

const LD = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;

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

const norm = (s: string) =>
  s
    .replace(/\*\*/g, "")
    .replace(/(^|\s)- /g, "$1")
    .replace(/\s+/g, " ")
    // a tag de um link vira espaco no decode: "hemograma ." = "hemograma."
    .replace(/ ([.,;:!?)])/g, "$1")
    .trim();

/** FAQ visivel: <details> (paginas SSR) ou o bloco "Perguntas frequentes" com <h3>/<p> (pre-render). */
function faqVisivel(body: string): Array<{ q: string; a: string }> {
  const details = [...body.matchAll(/<details[\s>][^]*?<\/details>/g)].map((m) => {
    const summary = m[0].match(/<summary[\s>][^]*?<\/summary>/)?.[0] ?? "";
    const pergunta = summary.replace(/<span aria-hidden="true"[^>]*>[^<]*<\/span>/g, "");
    return { q: decode(pergunta), a: decode(m[0].replace(summary, "")) };
  });
  if (details.length) return details;
  const ini = body.search(/<h2[^>]*>Perguntas frequentes<\/h2>/);
  if (ini < 0) return [];
  const resto = body.slice(ini).replace(/^<h2[^>]*>Perguntas frequentes<\/h2>/, "");
  const fim = resto.search(/<h2[\s>]|<aside|<footer|<\/article>|<address/);
  const secao = fim < 0 ? resto : resto.slice(0, fim);
  return secao
    .split(/<h3[^>]*>/)
    .slice(1)
    .map((parte) => {
      const [q, a] = parte.split("</h3>");
      return { q: decode(q), a: decode(a ?? "") };
    });
}

function nos(obj: unknown, out: Array<Record<string, unknown>> = []): Array<Record<string, unknown>> {
  if (Array.isArray(obj)) obj.forEach((o) => nos(o, out));
  else if (obj && typeof obj === "object") {
    out.push(obj as Record<string, unknown>);
    Object.values(obj).forEach((v) => nos(v, out));
  }
  return out;
}

const publicados = (blogIndex as Array<{ slug: string; draft?: boolean }>).filter((p) => p.draft !== true);
const ROTAS = [
  ...new Set([
    "/",
    ...getAllRoutes().map((r) => new URL(r.canonical).pathname),
    ...publicados.map((p) => `/blog/${p.slug}`),
    "/pagina-que-nao-existe",
  ]),
];

describe("GUARD-RAIL: JSON-LD de cada rota (SEO nov/2026, Fase 5)", () => {
  it("cobre as rotas do sitemap, a home, os artigos publicados e o 404", () => {
    expect(ROTAS.length).toBeGreaterThan(45);
  });

  it.each(ROTAS)("%s: JSON valido, @context, tudo no <head>, sem duplicata, FAQ = FAQ visivel", (rota) => {
    const html = respostaDaRota(rota);
    const fimHead = html.indexOf("</head>");
    const head = html.slice(0, fimHead);
    const body = html.slice(fimHead);

    expect([...body.matchAll(LD)], "JSON-LD dentro do <body>").toHaveLength(0);

    const blocos = [...head.matchAll(LD)].map((m) => {
      expect(() => JSON.parse(m[1]), `bloco invalido em ${rota}`).not.toThrow();
      return JSON.parse(m[1]);
    });
    // Grafo do index.html (negocio + WebSite) em toda rota.
    expect(blocos.length).toBeGreaterThanOrEqual(2);
    for (const b of blocos) expect(b["@context"], `${rota}: bloco sem @context`).toBe("https://schema.org");

    // Um bloco por @type na pagina.
    const tipos = blocos.map((b) => [].concat(b["@type"]).join("+"));
    expect(tipos.length, `${rota}: @type repetido (${tipos.join(", ")})`).toBe(new Set(tipos).size);

    // Uma descricao por entidade: o mesmo @id pode ser REFERENCIADO varias
    // vezes ({"@id": ...}), mas so DESCRITO (com outras propriedades) uma vez.
    const descritos = nos(blocos)
      .filter((n) => typeof n["@id"] === "string" && Object.keys(n).length > 1)
      .map((n) => n["@id"] as string);
    expect(descritos.length, `${rota}: entidade descrita duas vezes`).toBe(new Set(descritos).size);

    // Nota/avaliacao inventada: proibida (CFM 2.336/2023, regras do Google).
    const texto = JSON.stringify(blocos);
    expect(texto).not.toMatch(/AggregateRating|"Review"|aggregateRating|"review"/);

    // FAQPage = FAQ visivel, na mesma ordem e com o mesmo texto.
    const faq = blocos.find((b) => b["@type"] === "FAQPage");
    const visivel = faqVisivel(body);
    if (faq) {
      const ld = faq.mainEntity.map((q: { name: string; acceptedAnswer: { text: string } }) => ({
        q: norm(q.name),
        a: norm(q.acceptedAnswer.text),
      }));
      expect(visivel.map((f) => ({ q: norm(f.q), a: norm(f.a) })), `${rota}: FAQPage diferente do FAQ visivel`).toEqual(ld);
    }
  });

  it.each(examesData.map((e) => `/exames/${e.slug}`))("%s: MedicalWebPage revisada sobre um MedicalTest", (rota) => {
    const blocos = [...respostaDaRota(rota).matchAll(LD)].map((m) => JSON.parse(m[1]));
    const pagina = blocos.find((b) => b["@type"] === "MedicalWebPage");
    expect(pagina.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(pagina.reviewedBy).toEqual(REVISOR_LD);
    expect(pagina.about["@type"]).toBe("MedicalTest");
    expect(pagina.provider).toEqual({ "@id": "https://totalquality.med.br/#medicalbusiness" });
  });

  it("usedToDiagnose/usesDevice so com o termo escrito no dado da pagina", () => {
    for (const [slug, extra] of Object.entries(SCHEMA_EXAMES)) {
      const exam = examesData.find((e) => e.slug === slug);
      expect(exam, slug).toBeTruthy();
      const fonte = [...exam!.indications, exam!.howItWorks].join(" ").toLowerCase();
      for (const termo of [...(extra.usedToDiagnose ?? []), ...(extra.usesDevice ? [extra.usesDevice] : [])]) {
        expect(fonte, `${slug}: "${termo}" nao esta no texto da pagina`).toContain(termo.toLowerCase());
      }
      const blocos = [...respostaDaRota(`/exames/${slug}`).matchAll(LD)].map((m) => JSON.parse(m[1]));
      const teste = blocos.find((b) => b["@type"] === "MedicalWebPage").about;
      expect((teste.usedToDiagnose ?? []).map((c: { name: string }) => c.name)).toEqual(extra.usedToDiagnose ?? []);
      expect(teste.usesDevice?.name).toBe(extra.usesDevice);
    }
  });

  it.each(especialidadesData.map((e) => `/especialidades/${e.slug}`))("%s: consulta com Physician generico, sem nome de medico", (rota) => {
    const blocos = [...respostaDaRota(rota).matchAll(LD)].map((m) => JSON.parse(m[1]));
    const pagina = blocos.find((b) => b["@type"] === "MedicalWebPage");
    expect(pagina.about["@type"]).toBe("Physician");
    expect(pagina.about.name).not.toMatch(/\bDra?\.?\s/);
    expect(pagina.about.parentOrganization).toEqual({ "@id": "https://totalquality.med.br/#medicalbusiness" });
    expect(pagina.reviewedBy).toEqual(REVISOR_LD);
    if (pagina.specialty) expect(pagina.about.medicalSpecialty).toBe(pagina.specialty);
  });

  it.each(publicados.map((p) => `/blog/${p.slug}`))("%s: BlogPosting com autor, publisher e a mesma Person revisora", (rota) => {
    const blocos = [...respostaDaRota(rota).matchAll(LD)].map((m) => JSON.parse(m[1]));
    const artigo = blocos.find((b) => b["@type"] === "BlogPosting");
    expect(artigo.author).toEqual({ "@id": "https://totalquality.med.br/#medicalbusiness" });
    expect(artigo.publisher).toEqual({ "@id": "https://totalquality.med.br/#medicalbusiness" });
    expect(artigo.mainEntityOfPage.reviewedBy).toEqual(REVISOR_LD);
  });

  it("/sobre e AboutPage e /contato e ContactPage", () => {
    const tipo = (rota: string) => [...respostaDaRota(rota).matchAll(LD)].map((m) => JSON.parse(m[1])["@type"]);
    expect(tipo("/sobre")).toContain("AboutPage");
    expect(tipo("/contato")).toContain("ContactPage");
  });

  it("o grafo do negocio (index.html) segue com MedicalBusiness+DiagnosticLab+MedicalClinic e WebSite", () => {
    const blocos = [...TEMPLATE.matchAll(LD)].map((m) => JSON.parse(m[1]));
    expect(blocos.map((b) => [].concat(b["@type"]).join("+"))).toEqual([
      "MedicalBusiness+DiagnosticLab+MedicalClinic",
      "WebSite",
    ]);
  });
});
