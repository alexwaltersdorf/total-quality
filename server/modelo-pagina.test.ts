import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getSsrPage, resolveHttpStatus } from "./_core/seo-content";
import { getAllRoutes, getRouteMetadata } from "./_core/routes-metadata";
import { rotasDoModelo } from "@/lib/paginasCatalogo";
import { REVISOR_PAGINAS } from "@/lib/modeloPagina";

/*
 * SEO nov/2026, Fase 3 — modelo de pagina de exame e de consulta (plano
 * aprovado pelo Alex em 14/11/2026, docs/seo-plano.md §5). Trava o contrato
 * do modelo em TODA rota que ele desenha. Se falhar: corrigir a pagina ou o
 * dado — nunca afrouxar o teste.
 */

const raiz = path.resolve(import.meta.dirname, "..");
const ROTAS = rotasDoModelo();

const texto = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

describe("Fase 3: todas as rotas do modelo", () => {
  it("cobrem exames, especialidades, analises clinicas, check-up e bioimpedancia", () => {
    const rotas = ROTAS.map(([r]) => r);
    for (const r of [
      "/exames/hemograma",
      "/exames/ultrassonografia",
      "/laboratorio-caraguatatuba",
      "/checkup",
      "/bioimpedancia",
      "/especialidades/cardiologista",
      "/especialidades/pediatra",
    ]) {
      expect(rotas).toContain(r);
    }
    // 3 paginas de servico + 13 exames + 5 especialidades
    expect(rotas.length).toBe(21);
  });

  it.each(ROTAS)("%s: resposta curta de 40 a 60 palavras logo depois do H1", (rota, c) => {
    const n = c.respostaCurta.split(/\s+/).length;
    expect(n, `${rota}: ${n} palavras`).toBeGreaterThanOrEqual(40);
    expect(n, `${rota}: ${n} palavras`).toBeLessThanOrEqual(60);
    const html = getSsrPage(rota)!.body;
    const depoisDoH1 = html.split("</h1>")[1] ?? "";
    expect(texto(depoisDoH1).startsWith(c.respostaCurta), rota).toBe(true);
  });

  it.each(ROTAS)("%s: blocos do modelo na ordem, revisao visivel com <time>", (rota, c) => {
    const html = getSsrPage(rota)!.body;
    const t = texto(html);
    expect(t).toContain("Nesta página");
    expect(t).toContain(`Onde fazer ${c.nomeOndeFazer} em Caraguatatuba`);
    expect(t).toContain("Perguntas frequentes");
    expect(t).toContain(`Revisado por ${REVISOR_PAGINAS} · Atualizado em`);
    expect(html).toContain(`<time dateTime="${c.atualizadoEm}">`);
    // cada ancora do "Nesta pagina" existe na pagina
    const nav = html.match(/<nav aria-labelledby="nesta-pagina"[\s\S]*?<\/nav>/)![0];
    for (const [, id] of nav.matchAll(/href="#([^"]+)"/g)) {
      expect(html, `${rota}: ancora #${id} sem alvo`).toContain(`id="${id}"`);
    }
    // ordem: resumo → secoes → onde fazer → FAQ → revisao
    const pos = (s: string) => t.indexOf(s);
    if (Object.keys(c.resumo).length) expect(pos("Resumo rápido")).toBeLessThan(pos(c.secoes[0].titulo));
    expect(pos(c.secoes[0].titulo)).toBeLessThan(pos(`Onde fazer ${c.nomeOndeFazer}`));
    expect(pos(`Onde fazer ${c.nomeOndeFazer}`)).toBeLessThan(pos("Perguntas frequentes"));
    expect(pos("Perguntas frequentes")).toBeLessThan(pos("Revisado por"));
  });

  it.each(ROTAS)("%s: H2 do conteudo em forma de pergunta", (rota, c) => {
    for (const s of c.secoes) expect(s.titulo, rota).toMatch(/\?$/);
  });

  it.each(ROTAS)("%s: nada pendente, provisorio ou proibido aparece na pagina", (rota) => {
    const t = texto(getSsrPage(rota)!.body);
    expect(t).not.toMatch(/\bTODO\b/);
    expect(t).not.toMatch(/\ba confirmar\b|lorem|placeholder|\bpendente\b/i);
    // CFM 2.336/2023 e decisoes do Alex (briefing de 14/11/2026)
    expect(t).not.toMatch(/R\$|\bpre[çc]o promocional|desconto|\bmelhor(es)?\b|mais (preciso|completo|moderno)|padr[ãa]o-ouro|garant|\bdepoimento/i);
    // servico que a clinica nao realiza (a mamografia aparece so no titulo do
    // artigo do blog linkado na ultrassonografia, que diz que nao realiza)
    expect(t).not.toMatch(/resson[âa]ncia|ecocardiograma|ergom[ée]trico/i);
    // resultado nunca em "24 horas"/"24h" (MAPA 24h e Holter 24h sao nomes de exame)
    expect(t.replace(/(MAPA|Holter) 24h/g, "")).not.toMatch(/resultado[^.]{0,40}24 ?h/i);
    expect(t).not.toMatch(/wa\.me/);
  });

  it.each(ROTAS)("%s: convenios so os tres, senao particular", (rota, c) => {
    if (!c.resumo.convenios) return;
    expect(c.resumo.convenios).toContain("Cartão de Todos, Solumedi e Leader");
    expect(texto(getSsrPage(rota)!.body)).not.toMatch(/\b(Unimed|Bradesco|SulAm[ée]rica|Amil|Porto Seguro|NotreDame|Hapvida|Cassi|Geap)\b/);
  });

  it.each(ROTAS)("%s: foto real, com width/height, alt e carregamento preguicoso", (rota) => {
    // so o conteudo (o logo do menu e outra coisa)
    const html = getSsrPage(rota)!.body.match(/<main[\s>][\s\S]*<\/main>/)![0];
    const imgs = [...html.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
    expect(imgs.length, `${rota} sem foto`).toBeGreaterThanOrEqual(1);
    for (const img of imgs) {
      expect(img).toMatch(/ width="\d+"/);
      expect(img).toMatch(/ height="\d+"/);
      expect(img).toMatch(/ alt="[^"]{20,}"/);
      expect(img).toContain('loading="lazy"');
      const src = img.match(/src="\/images\/([^"]+)"/)![1];
      expect(fs.existsSync(path.join(raiz, "client/public/images", src)), src).toBe(true);
      // banco de imagem (hero-clinica e uma ressonancia) nunca
      expect(src).not.toMatch(/hero-clinica/);
    }
    // variantes AVIF e WebP existem
    for (const [, set] of html.matchAll(/srcSet="([^"]+)"/g)) {
      for (const parte of set.split(", ")) {
        const arq = parte.split(" ")[0].replace("/images/", "");
        expect(fs.existsSync(path.join(raiz, "client/public/images", arq)), arq).toBe(true);
      }
    }
  });

  it.each(ROTAS)("%s: Saiba mais com 2 a 4 artigos (quando ha) e 3 a 4 servicos relacionados", (rota, c) => {
    expect(c.relacionados.length).toBeGreaterThanOrEqual(3);
    expect(c.relacionados.length).toBeLessThanOrEqual(4);
    for (const r of c.relacionados) {
      expect(resolveHttpStatus(r, new Set(), new Set()), `${rota} → ${r}`).toBe(200);
      expect(r).not.toBe(rota);
    }
    if (c.blog) {
      expect(c.blog.length).toBeGreaterThanOrEqual(2);
      expect(c.blog.length).toBeLessThanOrEqual(4);
    }
  });
});

describe("Fase 3: casos especificos do briefing", () => {
  it("hemograma: a pagina de servico linka o artigo 'o que avalia' e nao copia o texto dele", () => {
    const html = getSsrPage("/exames/hemograma")!.body;
    expect(html).toContain('href="/blog/hemograma-completo-o-que-avalia"');
    const artigo = JSON.parse(
      fs.readFileSync(path.join(raiz, "client/src/content/blog/hemograma-completo-o-que-avalia.json"), "utf-8")
    ) as { content: string[] };
    const t = texto(html);
    for (const p of artigo.content) {
      if (p.length < 120 || p.startsWith("#") || p.startsWith("|")) continue;
      expect(t, `paragrafo do artigo repetido: ${p.slice(0, 60)}`).not.toContain(p.replace(/\*\*/g, ""));
    }
  });

  it("ultrassonografia: title ate 60 caracteres e H2 com 'ultrassom' e 'ultrassonografia'", () => {
    const meta = getRouteMetadata("/exames/ultrassonografia")!;
    expect(meta.title.length).toBeLessThanOrEqual(60);
    expect(meta.title).toMatch(/Ultrassonografia/);
    expect(meta.title).toMatch(/Ultrassom/);
    const h2 = [...getSsrPage("/exames/ultrassonografia")!.body.matchAll(/<h2[\s>][\s\S]*?<\/h2>/g)].map((m) => texto(m[0]));
    expect(h2.some((h) => /ultrassonografia/i.test(h))).toBe(true);
    expect(h2.some((h) => /\bultrassom\b/i.test(h))).toBe(true);
  });

  it.each(["/especialidades/medicina-do-trabalho", "/exames/exame-admissional"])(
    "%s: bloco para empresas com 'Solicitar proposta para empresa' no WhatsApp",
    (rota) => {
      const html = getSsrPage(rota)!.body;
      expect(texto(html)).toContain("Solicitar proposta para empresa");
      const links = [...html.matchAll(/<a [^>]*href="(https:\/\/api\.whatsapp\.com[^"]*)"[^>]*data-cta="whatsapp"[^>]*>([\s\S]*?)<\/a>/g)];
      const proposta = links.find((m) => texto(m[2]).includes("Solicitar proposta"));
      expect(proposta).toBeTruthy();
      expect(decodeURIComponent(proposta![1].replace(/&amp;/g, "&"))).toMatch(/solicitar uma proposta/);
      expect(texto(html)).toContain("ASO");
    }
  );

  it("o CTA para empresas usa os mesmos eventos (nenhum evento novo no tracking)", () => {
    const pagina = fs.readFileSync(path.join(raiz, "client/src/pages/ExamePage.tsx"), "utf-8");
    expect(pagina).toMatch(/trackScheduleExam\(`exame_\$\{exam\.slug\}_empresa`/);
    expect(pagina).toMatch(/openWhatsApp\(`exame_\$\{exam\.slug\}_empresa`/);
  });

  it("check-up: detalha os tres planos, sem preco", () => {
    const t = texto(getSsrPage("/checkup")!.body);
    for (const plano of ["Check-Up Básico", "Check-Up Select", "Check-Up Premium"]) expect(t).toContain(plano);
    expect(t).toContain("Hemoglobina Glicada");
    expect(t).toContain("Avaliação Cerebral: Eletroencefalograma");
    expect(t).not.toMatch(/R\$|MAIS POPULAR|48 horas/i);
  });

  it("especialidades novas: cardiologista e pediatra, sem nome de medico", () => {
    for (const slug of ["cardiologista", "pediatra"]) {
      const rota = `/especialidades/${slug}`;
      expect(resolveHttpStatus(rota, new Set(), new Set())).toBe(200);
      expect(getAllRoutes().map((r) => r.canonical)).toContain(`https://totalquality.med.br${rota}`);
      const t = texto(getSsrPage(rota)!.body).split(REVISOR_PAGINAS).join("");
      expect(t).not.toMatch(/\bDra?\.\s/);
    }
    const llms = fs.readFileSync(path.join(raiz, "client/public/llms.txt"), "utf-8");
    expect(llms).toContain("/especialidades/cardiologista");
    expect(llms).toContain("/especialidades/pediatra");
  });

  it("/especialidades: indice renderizado no servidor, no sitemap, no menu e no rodape", () => {
    const page = getSsrPage("/especialidades")!;
    expect(page).not.toBeNull();
    expect(page.hydrate).toBe(true);
    expect(page.jsonLd).toContain('"@type":"CollectionPage"');
    for (const slug of ["cardiologista", "endocrinologista", "gastroenterologista", "pediatra", "medicina-do-trabalho"]) {
      expect(page.body).toContain(`href="/especialidades/${slug}"`);
    }
    expect(getAllRoutes().map((r) => r.canonical)).toContain("https://totalquality.med.br/especialidades");
    for (const arq of ["client/src/components/Navbar.tsx", "client/src/components/Footer.tsx"]) {
      expect(fs.readFileSync(path.join(raiz, arq), "utf-8")).toContain('href: "/especialidades"');
    }
    // e o hub /exames linka as especialidades
    expect(fs.readFileSync(path.join(raiz, "client/src/pages/ExamesHub.tsx"), "utf-8")).toContain("ESPECIALIDADES_BASE");
  });
});
