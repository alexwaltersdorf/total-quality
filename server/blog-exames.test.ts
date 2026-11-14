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
  blogPostingLd,
  CTA_MARKER,
  extractFaqs,
  extractReferences,
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
  // Segunda rodada (18/10/2026): palavras-chave pedidas pelo Alex.
  "papanicolau-exame-preventivo",
  "ultrassom-transvaginal-preparo",
  "exame-de-colesterol-lipidograma",
  "lipoproteina-a-apolipoproteina-b",
  "exames-diagnostico-infarto",
  "exames-diagnostico-avc",
  "exames-diagnostico-hipertensao",
  "exames-diagnostico-diabetes",
  // Terceira rodada (22/10/2026): exames prioritarios do Alex — laboratorio,
  // ultrassom, tomografia, check-up cardiologico e toxicologico.
  "siglas-exames-laboratoriais",
  "ultrassom-abdome-total-preparo",
  "tomografia-com-contraste",
  "check-up-cardiologico-prevencao-infarto",
  "exame-toxicologico-clt-motorista",
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
    // Regra 5 do system prompt do blog (21/10/2026) substitui a exigencia
    // anterior de "Caraguatatuba" no titulo: busca local e da pagina /exames/;
    // o artigo responde a duvida informativa nacional e a ligacao local fica
    // no quadro de contato. Excecao: coleta domiciliar nao tem pagina de exame.
    if (slug !== "coleta-domiciliar-exames-caraguatatuba") {
      expect(`${post.title} ${post.metaTitle}`).not.toMatch(/Caraguatatuba/);
    }
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
    expect(html.match(/Na unidade da Rua Padre Anchieta, 1010 – Centro,/g)!.length).toBe(2);
    expect(html).toContain(
      "Este conteúdo é informativo e não substitui a consulta médica. A interpretação dos resultados deve ser feita pelo seu médico."
    );
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

  it("o guia linka todos os artigos de exame da primeira rodada", () => {
    const corpo = load("exames-laboratoriais-tipos-e-preparo").content.join("\n");
    for (const slug of ARTIGOS_DE_EXAME.slice(0, 7)) {
      expect(corpo, slug).toContain(`/blog/${slug})`);
    }
  });

  it("infarto e AVC abrem pela emergência: SAMU 192, e laboratório não é o lugar", () => {
    // Teste dos dois leitores (skill de compliance): quem tem sintoma agora
    // precisa ler isto antes de qualquer exame.
    for (const slug of ["exames-diagnostico-infarto", "exames-diagnostico-avc"]) {
      const abertura = load(slug).content[0];
      expect(abertura, slug).toMatch(/SAMU 192/);
      expect(abertura, slug).toMatch(/pronto-socorro/);
    }
  });

  it("exame com hora marcada nunca diz que é sem agendamento", () => {
    for (const slug of ARTIGOS_DE_EXAME) {
      const p = load(slug);
      if (!p.horaMarcada) continue;
      const local = p.content.join("\n");
      expect(local, slug).toMatch(/hora marcada|horário (marcado|combinado)|marque/i);
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

describe("GUARD-RAIL: check-up completo em Caraguatatuba (out/2026)", () => {
  it("title e description do /checkup vêm da fonte única, sem promessa", async () => {
    const { CHECKUP_TITLE, CHECKUP_DESCRIPTION } = await import("@shared/const");
    const meta = getRouteMetadata("/checkup")!;
    expect(meta.title).toBe(CHECKUP_TITLE);
    expect(meta.title).toMatch(/Check-up Completo em Caraguatatuba/);
    expect(meta.description).toBe(CHECKUP_DESCRIPTION);
    expect(`${meta.title} ${meta.description} ${getSeoContentForPath("/checkup")}`).not.toMatch(
      /resultados? r[áa]pidos?|agende agora/i
    );
  });

  it("nenhum schema do cliente aponta para domínio de rascunho", () => {
    const base = nodePath.resolve(import.meta.dirname, "../client/src");
    const achados = fs
      .readdirSync(base, { recursive: true, encoding: "utf-8" })
      .filter((f) => /\.tsx?$/.test(f))
      .filter((f) => fs.readFileSync(nodePath.join(base, f), "utf-8").includes("manus.space"));
    expect(achados).toEqual([]);
  });
});

describe("GUARD-RAIL: textos do site sem superlativo nem promessa (auditoria de design, out/2026)", () => {
  // A auditoria de 18/10/2026 achou na HOME "a maior estrutura de medicina
  // diagnóstica do litoral norte", "referência", "tecnologia de ponta",
  // "resultados precisos, rápidos" e "Agende seu exame de sangue" — os
  // guard-rails anteriores olhavam o prerender e o blog, não os componentes.
  // CFM 2.336/2023, art. 11: comparação, autopromoção e promessa.
  const PROIBIDO = /a maior estrutura|principal refer[êe]ncia|(?:^|\s)é refer[êe]ncia em|reconhecida como refer[êe]ncia|(?<!de )refer[êe]ncia em (exames|medicina|laborat)|tecnologia de ponta|equipamentos de ponta|alta precis[ãa]o|garantem precis|precisos, r[áa]pidos|altamente qualificad|(?<!Programa de )excel[êe]ncia|com resultados? r[áa]pidos?|agende seu exame de sangue|melhores decis/i;

  it("componentes, páginas e metadados", () => {
    const base = nodePath.resolve(import.meta.dirname, "..");
    const pastas = ["client/src/components", "client/src/pages"].map((p) => nodePath.join(base, p));
    const arquivos = [
      ...pastas.flatMap((dir) =>
        fs
          .readdirSync(dir, { recursive: true, encoding: "utf-8" })
          .filter((f) => f.endsWith(".tsx"))
          .map((f) => nodePath.join(dir, f))
      ),
      nodePath.join(base, "client/src/lib/examesData.ts"),
      nodePath.join(base, "server/_core/routes-metadata.ts"),
    ];
    const achados: string[] = [];
    for (const arq of arquivos) {
      fs.readFileSync(arq, "utf-8")
        .split("\n")
        .forEach((linha, i) => {
          if (/^\s*(\/\/|\*|\/\*|\{\/\*)/.test(linha)) return; // comentario
          const m = linha.match(PROIBIDO);
          if (m) achados.push(`${nodePath.relative(base, arq)}:${i + 1}: "${m[0]}"`);
        });
    }
    expect(achados, achados.join("\n")).toEqual([]);
  });

  it("o prerender de todas as rotas", () => {
    // Artigos citam "resultado rápido" para criticar a expressão (critério de
    // escolha de laboratório) e comparar EAS x urocultura; ali vale o texto
    // inteiro, revisado pela skill de compliance. Promessa da clínica não.
    for (const route of getAllRoutes()) {
      const path = new URL(route.canonical).pathname;
      const html = getSeoContentForPath(path) ?? "";
      const m = html.match(PROIBIDO);
      expect(m?.[0], path).toBeUndefined();
    }
  });
});

describe("GUARD-RAIL: menu e botão de resultados (out/2026)", () => {
  const navbar = fs.readFileSync(
    nodePath.resolve(import.meta.dirname, "../client/src/components/Navbar.tsx"),
    "utf-8"
  );
  it("Resultados abre o portal de laudos, não o próprio site", () => {
    expect(navbar).toContain('RESULTADOS_URL = "https://app.totalquality.med.br/"');
    expect(navbar).not.toMatch(/window\.open\("https:\/\/totalquality\.med\.br"/);
  });
  it("menu na ordem decidida pelo Alex: Início, Sobre, Contato, Nossos Exames, Blog, Resultados, Agendar", () => {
    const ordem = ["Início", '"Sobre"', '"Contato"', "Nossos Exames", "Blog", "Resultados", "Agendar"];
    const desktop = navbar.slice(navbar.indexOf("{/* Desktop nav links */}"), navbar.indexOf("{/* Mobile menu button */}"));
    const pos = ordem.map((t) => (t.startsWith('"') ? navbar.indexOf(t) : desktop.indexOf(t)));
    expect(pos.every((p) => p >= 0), pos.join(",")).toBe(true);
    const nav = ordem.slice(3).map((t) => desktop.indexOf(t));
    expect([...nav].sort((a, b) => a - b)).toEqual(nav);
    expect(desktop).not.toMatch(/Diferenciais|>\s*Exames\s*</);
  });
});

describe("GUARD-RAIL: autoria e revisao visiveis (system prompt do blog, out/2026)", () => {
  // Conteudo de saude (YMYL): quem escreve e quem revisa precisam aparecer no
  // texto e no schema. Os artigos antigos traziam medicos que nao existem na
  // equipe ("Dra. Mariana Costa", "Dr. Carlos Mendes"…) — autoria inventada e
  // pior que nenhuma. A clinica assina; o responsavel tecnico revisa.
  it("nenhum artigo e assinado por medico inventado", () => {
    for (const p of index) {
      expect(p.author, `${p.slug} assinado por pessoa`).toBe("Equipe Total Quality");
      expect(`${p.author} ${p.authorRole}`).not.toMatch(/\bDra?\.\s/);
    }
  });

  it.each(publicados.map((p) => p.slug))("%s mostra revisao, data e identificacao", (slug) => {
    const html = getSeoContentForPath(`/blog/${slug}`)!;
    expect(html).toContain("Revisado por Alex Waltersdorf, Responsável Técnico · Atualizado em");
    // Modelo de fechamento do Alex (22/10/2026): identificacao em tres linhas.
    expect(html).toContain(
      "Total Quality Medicina Diagnóstica — Registro 970616<br>Responsável Técnico: Alex Waltersdorf - 267.339<br>Rua Padre Anchieta, 1010 – Centro – Caraguatatuba-SP · (12) 3887-3535"
    );
    expect(html).toMatch(/n[ãa]o substitui a consulta m[ée]dica/i);
    const ld = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)).map((m) =>
      JSON.parse(m[1])
    );
    const posting = ld.flat().find((o) => o["@type"] === "BlogPosting");
    expect(posting, "sem BlogPosting").toBeTruthy();
    expect(posting.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(posting.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(posting.author).toEqual({ "@id": "https://totalquality.med.br/#medicalbusiness" });
    expect(posting.mainEntityOfPage.reviewedBy.name).toBe("Alex Waltersdorf");
    expect(ld.flat().some((o) => o["@type"] === "BreadcrumbList")).toBe(true);
  });

  it.each(rascunhos.map((p) => p.slug))("rascunho %s nunca diz que foi revisado", (slug) => {
    const html = getSeoContentForPath(`/blog/${slug}`)!;
    expect(html).not.toContain("Revisado por");
    expect(html).not.toContain('"reviewedBy"');
  });
});

describe("GUARD-RAIL: do artigo para o exame (system prompt do blog, fase 3)", () => {
  // O blog respondia 72% das impressoes do site com CTR de 0,14%: o leitor
  // chegava e nao tinha caminho para a pagina do exame. Todo artigo publicado
  // leva o quadro de contato no meio e no fim, com a pagina do exame e o
  // WhatsApp, e a mensagem diz que o paciente veio do blog.
  it.each(publicados.map((p) => p.slug))("%s tem quadro de contato ligado a pagina do exame", (slug) => {
    const post = load(slug);
    expect(post.examName, "sem examName o quadro nao aparece").toBeTruthy();
    expect(post.examPages?.length, "quadro sem pagina de exame").toBeGreaterThan(0);
    expect(post.content.filter((b) => b.trim() === CTA_MARKER)).toHaveLength(1);
    const html = getSeoContentForPath(`/blog/${slug}`)!;
    expect(html.match(/<aside>/g)?.length ?? 0, "quadro no meio e no fim").toBeGreaterThanOrEqual(2);
    for (const href of post.examPages!) expect(html).toContain(`<a href="${href}">`);
    expect(html).toContain("https://api.whatsapp.com/send?phone=551238873535&amp;text=Ol%C3%A1!%20Vim%20pelo%20blog");
  });
});

describe("GUARD-RAIL: um formato de link de WhatsApp (system prompt do blog, regra 3)", () => {
  // Contato unico: api.whatsapp.com com o fixo (12) 3887-3535, montado por
  // whatsappUrl() em shared/const.ts. Nunca wa.me nem o celular antigo.
  it("nenhum codigo do site monta link wa.me ou usa o celular antigo", () => {
    const raiz = nodePath.resolve(import.meta.dirname, "..");
    const dirs = ["client/src", "server/_core", "shared", "client/index.html"];
    const arquivos: string[] = [];
    for (const d of dirs) {
      const abs = nodePath.join(raiz, d);
      if (fs.statSync(abs).isFile()) arquivos.push(abs);
      else
        for (const f of fs.readdirSync(abs, { recursive: true, encoding: "utf-8" }))
          if (/\.(tsx?|json|html)$/.test(f)) arquivos.push(nodePath.join(abs, f));
    }
    const ofensores = arquivos.flatMap((f) => {
      const texto = fs.readFileSync(f, "utf-8");
      const achados: string[] = [];
      // utmTracker le "wa.me" no REFERRER de quem chega, nao monta link.
      if (/wa\.me\//.test(texto) && !f.endsWith("utmTracker.ts")) achados.push(`${f}: wa.me`);
      if (/99774/.test(texto)) achados.push(`${f}: celular antigo`);
      return achados;
    });
    expect(ofensores).toEqual([]);
  });
});

describe("GUARD-RAIL: uma URL por intencao — titulo do artigo (system prompt do blog, regra 5)", () => {
  // "Ultrassonografia caraguatatuba sp" caiu da posicao 4,7 para 48,3 quando um
  // artigo do blog passou a disputar a busca com /exames/ultrassonografia.
  // Artigo de blog nao leva o nome da cidade no title nem no H1; a unica
  // excecao e o tema sem pagina de servico equivalente.
  const SEM_PAGINA_EQUIVALENTE = new Set(["coleta-domiciliar-exames-caraguatatuba"]);
  it.each(index.map((p) => p.slug))("%s nao disputa a busca local da pagina de exame", (slug) => {
    if (SEM_PAGINA_EQUIVALENTE.has(slug)) return;
    const post = load(slug);
    expect(post.title).not.toMatch(/Caraguatatuba/);
    expect(post.metaTitle ?? "").not.toMatch(/Caraguatatuba/);
  });
});

describe("GUARD-RAIL: blog externo nao fica orfao (system prompt do blog, fase 6)", () => {
  it("o indice /blog linka o blog externo da clinica", () => {
    const html = getSeoContentForPath("/blog")!;
    expect(html).toContain('href="https://blog.totalquality.med.br/"');
  });
});

describe("GUARD-RAIL: prazo de resultado (decisao do Alex, 22/10/2026)", () => {
  // "Resultado em ate 24 horas" nunca foi confirmado. O Alex decidiu em
  // 22/10/2026 trocar por "resultados em curto prazo" no site inteiro. Holter,
  // MAPA e urina de 24 horas sao duracao de exame, nao prazo, e ficam de fora.
  it.each(getAllRoutes().map((r) => new URL(r.canonical).pathname))("%s nao promete resultado em 24 horas", (pathname) => {
    const html = getSeoContentForPath(pathname);
    if (!html) return;
    const semDuracao = html.replace(/(Holter|MAPA|urina)[^.<]{0,60}24 ?h(oras)?/gi, "");
    expect(semDuracao).not.toMatch(/(resultado|pront[ao]|dispon[íi]ve)[^.<]{0,60}(at[ée]|em) 24 ?h(oras)?/i);
  });

  it("componentes da home nao voltam a dizer 24H", () => {
    const fonte = fs.readFileSync(nodePath.resolve(import.meta.dirname, "../client/src/components/ExamesSection.tsx"), "utf-8");
    expect(fonte).not.toMatch(/em até 24 horas|"24H"/);
  });
});

describe("GUARD-RAIL: padrao editorial do orquestrador de SEO (27/10/2026)", () => {
  // SYSTEM-PROMPT-ORQUESTRADOR-BLOG.md (repo de SEO), enviado pelo Alex em
  // 27/10/2026: toda afirmacao clinica relevante tem de ser verificavel, com
  // referencias medicas no artigo, e a pagina precisa de autoria, datas,
  // breadcrumb e dados estruturados coerentes. As fontes de cada artigo foram
  // abertas e conferidas uma a uma; nunca inventar titulo, autor ou URL.
  const publicados = index.filter((p) => isPublished(p));
  const BLOQUEADAS = /wikipedia\.org|totalquality\.med\.br|gpnotebook|airticles/i;

  it.each(publicados.map((p) => p.slug))("%s tem secao de referencias com pelo menos 2 fontes", (slug) => {
    const refs = extractReferences(load(slug).content);
    expect(refs.length, "faltam referencias").toBeGreaterThanOrEqual(2);
    for (const r of refs) {
      expect(r.url).toMatch(/^https:\/\//);
      expect(r.url, "fonte proibida").not.toMatch(BLOQUEADAS);
      expect(r.publisher, `${r.url} sem instituicao`).toBeTruthy();
    }
  });

  it("as referencias viram citation no BlogPosting", () => {
    for (const p of publicados) {
      const post = load(p.slug);
      const ld = blogPostingLd(p, post.content) as { citation?: { url: string }[] };
      expect(ld.citation?.map((c) => c.url), p.slug).toEqual(extractReferences(post.content).map((r) => r.url));
    }
  });

  it.each(publicados.map((p) => p.slug))("%s com FAQ termina a duvida local em 'Onde fazer ... em Caraguatatuba?'", (slug) => {
    const faqs = extractFaqs(load(slug).content);
    if (faqs.length === 0) return;
    expect(faqs.some((f) => /^Onde fazer .+ em Caraguatatuba\?$/.test(f.q)), "falta a pergunta local do modelo de fechamento").toBe(true);
  });

  it("artigo publicado tem breadcrumb visivel e data de publicacao no HTML pre-renderizado", () => {
    for (const p of publicados) {
      const html = getSeoContentForPath(`/blog/${p.slug}`)!;
      expect(html, p.slug).toContain('<nav aria-label="Trilha de navegação"><a href="/">Início</a> › <a href="/blog">Blog</a>');
      expect(html, p.slug).toMatch(/Publicado em \d{2}\/\d{2}\/\d{4}/);
    }
  });

  it("twitter e datas do artigo seguem a pagina, nao a home (o index.html real)", () => {
    const base = fs.readFileSync(nodePath.resolve(import.meta.dirname, "../client/index.html"), "utf8");
    const p = publicados[0];
    const meta = getRouteMetadata(`/blog/${p.slug}`)!;
    const html = injectMetaTags(base, meta);
    const og = html.match(/<meta property="og:title" content="([^"]*)"/)![1];
    expect(html).toContain(`<meta name="twitter:title" content="${og}"`);
    expect(html).toContain(`<meta property="article:published_time" content="${blogDateIso(p.date)}"`);
    expect(html).toMatch(/<meta property="article:modified_time" content="\d{4}-\d{2}-\d{2}"/);
    expect(html).not.toContain('twitter:title" content="Total Quality | Exames de Sangue e Laboratório');
  });
});
