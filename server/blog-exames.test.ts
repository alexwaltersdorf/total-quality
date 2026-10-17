/*
 * Guard-rails do blog de exames laboratoriais (diagnostico de SEO, 17/10/2026).
 *
 * Oito artigos novos nasceram como RASCUNHO (draft: true) a espera da revisao
 * medica e da aprovacao do Alex. Estes testes garantem tres coisas:
 *   1. rascunho nao vaza: fora do sitemap, da listagem, de qualquer link de
 *      pagina publicada, e servido com noindex;
 *   2. artigo so publica pronto: sem marcador {{PRAZO}}, com revisao aprovada;
 *   3. as regras do CFM 2.336/2023 e as decisoes do Alex valem para o corpo
 *      dos artigos (sem superlativo, sem preco, sem "agende" para coleta, sem
 *      sabado, sem convenio fora dos tres, sem servico nao prestado).
 *
 * Se um teste falhar, corrigir o artigo ou o codigo — nunca afrouxar o teste.
 */
import fs from "node:fs";
import nodePath from "node:path";
import { describe, expect, it } from "vitest";
import blogIndex from "../client/src/content/blog/index.json";
import {
  blogDateIso,
  CTA_MARKER,
  extractFaqs,
  isPublished,
  type BlogPost,
  type BlogPostMeta,
} from "../client/src/lib/blogMeta";
import { getSeoContentForPath, resolveHttpStatus } from "./_core/seo-content";
import {
  getAllRoutes,
  getKnownBlogSlugs,
  getRouteMetadata,
  injectMetaTags,
} from "./_core/routes-metadata";
import { generateSitemap } from "./_core/sitemap-handler";
import { getLegacyRedirect } from "./_core/legacy-redirects";

const DIR = nodePath.resolve(import.meta.dirname, "../client/src/content/blog");
const index = blogIndex as BlogPostMeta[];
const load = (slug: string): BlogPost =>
  JSON.parse(fs.readFileSync(nodePath.join(DIR, `${slug}.json`), "utf-8"));

const ARTIGOS_DE_EXAME = [
  "hemoglobina-glicada-exame",
  "beta-hcg-exame-de-gravidez",
  "exame-tsh-t4-livre-tireoide",
  "urocultura-exame-de-urina",
  "curva-glicemica-teste-tolerancia-glicose",
  "glicemia-de-jejum-exame",
  "coleta-domiciliar-exames-caraguatatuba",
  "exames-laboratoriais-tipos-e-preparo",
];

const rascunhos = index.filter((p) => !isPublished(p));
const publicados = index.filter(isPublished);

const HTML_BASE = `<html><head><title>x</title>
<meta name="description" content="x" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="x" />
<meta property="og:type" content="website" />
<meta property="og:title" content="x" /><meta property="og:description" content="x" />
<meta property="og:url" content="x" /><meta property="og:image" content="x" />
</head><body><div id="root"></div></body></html>`;

describe("GUARD-RAIL: indice e arquivos do blog batem (out/2026)", () => {
  it("todo artigo do indice tem arquivo, e todo arquivo esta no indice", () => {
    const arquivos = fs
      .readdirSync(DIR)
      .filter((f) => f.endsWith(".json") && f !== "index.json")
      .map((f) => f.replace(/\.json$/, ""))
      .sort();
    expect(arquivos).toEqual(index.map((p) => p.slug).sort());
  });

  it.each(index.map((p) => p.slug))("%s: metadados do indice iguais aos do arquivo", (slug) => {
    const { content, ...meta } = load(slug);
    expect(content.length).toBeGreaterThan(0);
    expect(meta).toEqual(index.find((p) => p.slug === slug));
  });

  it("ids unicos", () => {
    const ids = index.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(index.map((p) => p.slug))(
    "%s: o <title> do React e o do prerender sao o mesmo (metaTitle)",
    (slug) => {
      // Regra de ouro, item 2: robo e pessoa leem o mesmo titulo.
      const post = index.find((p) => p.slug === slug)!;
      expect(post.metaTitle).toBeTruthy();
      expect(getRouteMetadata(`/blog/${slug}`)!.title).toBe(post.metaTitle);
    }
  );

  it("datas de publicacao viram ISO valido (schema e sitemap)", () => {
    for (const p of index) expect(blogDateIso(p.date), p.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("GUARD-RAIL: rascunho nao vaza (out/2026)", () => {
  it("os oito artigos de exame existem", () => {
    for (const slug of ARTIGOS_DE_EXAME) expect(getKnownBlogSlugs().has(slug), slug).toBe(true);
  });

  it.each(rascunhos.map((p) => p.slug))("%s: fora do sitemap", (slug) => {
    expect(generateSitemap()).not.toContain(`/blog/${slug}<`);
    expect(getAllRoutes().some((r) => r.canonical.endsWith(`/blog/${slug}`))).toBe(false);
  });

  it.each(rascunhos.map((p) => p.slug))("%s: abre com 200 e noindex, para revisao", (slug) => {
    expect(resolveHttpStatus(`/blog/${slug}`, getKnownBlogSlugs())).toBe(200);
    const meta = getRouteMetadata(`/blog/${slug}`)!;
    expect(meta.noindex).toBe(true);
    expect(injectMetaTags(HTML_BASE, meta)).toContain('<meta name="robots" content="noindex, nofollow"');
  });

  it("nenhuma pagina publicada linka um rascunho", () => {
    const vazamentos: string[] = [];
    for (const route of getAllRoutes()) {
      const path = new URL(route.canonical).pathname;
      const html = getSeoContentForPath(path) ?? "";
      for (const r of rascunhos) {
        if (html.includes(`href="/blog/${r.slug}"`)) vazamentos.push(`${path} → ${r.slug}`);
      }
    }
    expect(vazamentos, vazamentos.join("\n")).toEqual([]);
  });

  it("artigo publicado nao linka rascunho nem no corpo", () => {
    for (const p of publicados) {
      const corpo = load(p.slug).content.join("\n");
      for (const r of rascunhos) {
        expect(corpo, `${p.slug} linka o rascunho ${r.slug}`).not.toContain(`/blog/${r.slug})`);
      }
    }
  });
});

describe("GUARD-RAIL: artigo so publica pronto (out/2026)", () => {
  it.each(publicados.map((p) => p.slug))("%s: sem marcador pendente", (slug) => {
    expect(JSON.stringify(load(slug))).not.toMatch(/\{\{[A-Z_]+\}\}/);
  });

  it.each(publicados.filter((p) => p.reviewStatus).map((p) => p.slug))(
    "%s: publicado so com revisao medica aprovada e datada",
    (slug) => {
      const p = index.find((x) => x.slug === slug)!;
      expect(p.reviewStatus).toBe("aprovado");
      expect(p.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  );
});

describe("GUARD-RAIL: artigos de exame laboratorial (out/2026)", () => {
  const PROIBIDO: Array<[RegExp, string]> = [
    [/\bmelhor(es)?\b|mais moderno|o mais r[áa]pido|\bn[ºo°] ?1\b|\bl[íi]der\b|de [úu]ltima gera[çc][ãa]o|tecnologia de ponta/i, "superlativo"],
    [/garant/i, "garantia"],
    [/R\$|\bpre[çc]o\b|promo[çc][ãa]o|desconto/i, "preco ou promocao"],
    [/s[áa]bado|domingo/i, "horario fora de seg-sex"],
    [/\bCRM\b/, "sigla do conselho"],
    [/wa\.me|99774|\(12\) (?!3887-3535)\d/i, "telefone fora do oficial"],
    [/resson[âa]ncia|ecocardiograma|ergom[ée]trico/i, "servico nao prestado"],
    // \b obrigatorio: sem ele "Amil" casa dentro de "familiar".
    [/\b(Unimed|Bradesco|SulAm[ée]rica|Amil|Porto Seguro|NotreDame|Hapvida|Cassi|Geap|Postal Sa[úu]de|Economus|Funasa)\b/i, "convenio nao atendido"],
    [/\bagend(e|ar) (a |sua |seu )?(coleta|exame de sangue)/i, "agendar coleta laboratorial (e sem agendamento)"],
  ];

  it.each(ARTIGOS_DE_EXAME)("%s: texto dentro das regras do CFM e das decisoes do Alex", (slug) => {
    const post = load(slug);
    const texto = [post.title, post.subtitle, post.excerpt, post.metaTitle, ...post.content].join("\n");
    const achados = PROIBIDO.filter(([re]) => re.test(texto)).map(([, motivo]) => motivo);
    expect(achados).toEqual([]);
  });

  it.each(ARTIGOS_DE_EXAME)("%s: formato de SEO do diagnostico", (slug) => {
    const post = load(slug);
    expect(post.metaTitle!.length, "title acima de 60").toBeLessThanOrEqual(60);
    expect(post.excerpt.length, "description fora de 140-155").toBeGreaterThanOrEqual(140);
    expect(post.excerpt.length, "description fora de 140-155").toBeLessThanOrEqual(155);
    expect(post.content.filter((b) => b.startsWith("# ")), "H1 no corpo").toEqual([]);
    expect(post.content.filter((b) => b.trim() === CTA_MARKER)).toHaveLength(1);
    expect(post.examName).toBeTruthy();
    expect(post.related).toHaveLength(3);
    const faqs = extractFaqs(post.content);
    expect(faqs.length).toBeGreaterThanOrEqual(5);
    expect(faqs.length).toBeLessThanOrEqual(6);
    expect(`${post.title} ${post.metaTitle}`).toMatch(/Caraguatatuba|Guia/);
  });

  it.each(ARTIGOS_DE_EXAME)("%s: valor de referencia sempre com fonte e aviso", (slug) => {
    const corpo = load(slug).content.join("\n");
    if (!/faixas? usua(l|is)/i.test(corpo)) return;
    expect(corpo).toContain(
      "Os valores de referência variam conforme o método e o laboratório. Consulte os valores impressos no seu laudo e leve o resultado ao seu médico."
    );
    expect(corpo).toMatch(/\]\(https:\/\//);
  });

  it.each(ARTIGOS_DE_EXAME)("%s: todo link interno do corpo resolve 200", (slug) => {
    const corpo = load(slug).content.join("\n");
    const hrefs = Array.from(corpo.matchAll(/\]\((\/[^)#]*)\)/g)).map((m) => m[1]);
    for (const href of hrefs) {
      expect(resolveHttpStatus(href, getKnownBlogSlugs()), `${slug} → ${href}`).toBe(200);
    }
  });

  it.each(ARTIGOS_DE_EXAME)("%s: prerender com H1 unico, quadro de contato, rodape medico e schema", (slug) => {
    const html = getSeoContentForPath(`/blog/${slug}`)!;
    expect(html.match(/<h1>/g)).toHaveLength(1);
    expect(html).not.toContain(CTA_MARKER);
    // Os dois quadros de contato: no meio (marcador) e no fim.
    expect(html.match(/Na unidade da Rua Padre Anchieta, 1010 – Centro, a coleta/g)!.length).toBe(2);
    expect(html).toContain("Conteúdo informativo. Não substitui consulta médica.");
    expect(html).toMatch(/Registro\s*970616/);
    expect(html).toContain("Alex Waltersdorf - 267.339");
    const blocos = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)).map(
      (m) => JSON.parse(m[1])
    );
    const tipos = blocos.map((b) => b["@type"]);
    expect(tipos).toEqual(expect.arrayContaining(["BlogPosting", "BreadcrumbList", "FAQPage"]));
    const artigo = blocos.find((b) => b["@type"] === "BlogPosting");
    expect(artigo.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(artigo.publisher).toEqual({ "@id": "https://totalquality.med.br/#medicalbusiness" });
    expect(artigo.mainEntityOfPage.about["@type"]).toBe("MedicalTest");
  });

  it("artigo longo ganha sumario com ancoras que existem", () => {
    const html = getSeoContentForPath("/blog/hemoglobina-glicada-exame")!;
    const ancoras = Array.from(html.matchAll(/<li><a href="#([^"]+)">/g)).map((m) => m[1]);
    expect(ancoras.length).toBeGreaterThan(3);
    for (const a of ancoras) expect(html).toContain(`<h2 id="${a}">`);
  });

  it("o guia linka todos os artigos de exame", () => {
    const corpo = load("exames-laboratoriais-tipos-e-preparo").content.join("\n");
    for (const slug of ARTIGOS_DE_EXAME.filter((s) => s !== "exames-laboratoriais-tipos-e-preparo")) {
      expect(corpo, slug).toContain(`/blog/${slug})`);
    }
  });

  it("coleta domiciliar nao lista bairro nem promete condicao", () => {
    // Area, horario e valor nunca foram informados pelo Alex (CLAUDE.md).
    const corpo = load("coleta-domiciliar-exames-caraguatatuba").content.join("\n");
    expect(corpo).not.toMatch(/Perequ[êe]|Indai[áa]|Porto Novo|Martim de S[áa]|Tabatinga|Massagua[çc]u|Ubatuba|S[ãa]o Sebasti[ãa]o|Ilhabela/i);
    expect(corpo).toMatch(/confirm\w* pelo WhatsApp/i);
  });
});

describe("GUARD-RAIL: canibalizacao do hemograma resolvida (out/2026)", () => {
  it("o artigo local do hemograma redireciona para a pagina de servico", () => {
    expect(getLegacyRedirect("/blog/hemograma-caraguatatuba")).toBe("/exames/hemograma");
    expect(getKnownBlogSlugs().has("hemograma-caraguatatuba")).toBe(false);
    expect(generateSitemap()).not.toContain("hemograma-caraguatatuba");
  });

  it("nenhum link interno aponta para a URL redirecionada", () => {
    for (const p of index) {
      expect(load(p.slug).content.join("\n"), p.slug).not.toContain("/blog/hemograma-caraguatatuba");
    }
  });
});

describe("GUARD-RAIL: sitemap e meta tags dos artigos (out/2026)", () => {
  it("lastmod so com data real; nunca a data do dia para todas as URLs", () => {
    const xml = generateSitemap();
    const lastmods = Array.from(xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)).map((m) => m[1]);
    expect(lastmods.length).toBe(publicados.length);
    for (const l of lastmods) expect(l).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("artigo sai com og:type article", () => {
    const meta = getRouteMetadata("/blog/hemograma-completo-o-que-avalia")!;
    expect(injectMetaTags(HTML_BASE, meta)).toContain('<meta property="og:type" content="article"');
    expect(injectMetaTags(HTML_BASE, meta)).toContain('<meta name="robots" content="index, follow"');
  });
});
