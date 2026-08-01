import { describe, expect, it } from "vitest";
import {
  getSeoContentForPath,
  injectSeoContent,
  resolveHttpStatus,
} from "./_core/seo-content";
import { getAllRoutes, getKnownBlogSlugs } from "./_core/routes-metadata";
import { getLegacyRedirect, isGone } from "./_core/legacy-redirects";

const PRIORITY_ROUTES = [
  "/",
  "/laboratorio-caraguatatuba",
  "/bioimpedancia",
  "/exames/exames-de-sangue",
  "/exames/tomografia-computadorizada",
  "/exames/ultrassonografia",
  "/exames/mapa",
  "/exames/holter",
  "/exames/exame-toxicologico",
  "/exames/espirometria",
];

describe("getSeoContentForPath", () => {
  it.each(PRIORITY_ROUTES)("gera conteúdo pré-renderizado para %s", (route) => {
    const html = getSeoContentForPath(route);
    expect(html).toBeTruthy();
    expect(html).toContain("<h1>");
    expect(html).toContain("Caraguatatuba");
    // NAP: telefone e endereço visíveis no HTML
    expect(html).toContain("(12) 3887-3535");
    expect(html).toContain("Padre Anchieta");
    // Links internos para fortalecer as demais páginas
    expect(html).toContain('href="/exames/');
  });

  it("gera FAQ e preparo nas páginas de exame", () => {
    const html = getSeoContentForPath("/exames/exames-de-sangue")!;
    expect(html).toContain("Perguntas frequentes");
    expect(html).toContain("Preparo para o exame");
    expect(html).toContain("jejum");
  });

  it("não gera conteúdo para rotas fora da lista priorizada", () => {
    expect(getSeoContentForPath("/admin")).toBeNull();
    expect(getSeoContentForPath("/exames/slug-inexistente")).toBeNull();
    expect(getSeoContentForPath("/dashboard")).toBeNull();
  });

  it("normaliza trailing slash e query string", () => {
    expect(getSeoContentForPath("/exames/ultrassonografia/")).toBeTruthy();
    expect(getSeoContentForPath("/bioimpedancia?utm_source=google")).toBeTruthy();
  });
});

describe("injectSeoContent", () => {
  it("injeta o conteúdo dentro do div root", () => {
    const html = '<body><div id="root"></div></body>';
    const result = injectSeoContent(html, "<main>conteúdo</main>");
    expect(result).toBe('<body><div id="root"><main>conteúdo</main></div></body>');
  });

  it("tolera espaços dentro do div root", () => {
    const html = '<div id="root">\n  </div>';
    const result = injectSeoContent(html, "<main>x</main>");
    expect(result).toContain('<div id="root"><main>x</main></div>');
  });
});

describe("resolveHttpStatus", () => {
  const blogSlugs = getKnownBlogSlugs();

  it("retorna 200 para rotas conhecidas", () => {
    expect(resolveHttpStatus("/", blogSlugs)).toBe(200);
    expect(resolveHttpStatus("/checkup", blogSlugs)).toBe(200);
    expect(resolveHttpStatus("/exames/holter", blogSlugs)).toBe(200);
    expect(
      resolveHttpStatus("/blog/hemograma-caraguatatuba", blogSlugs)
    ).toBe(200);
  });

  it("retorna 404 para as rotas do admin removido", () => {
    // O painel administrativo foi removido (decisao do Alex, jul/2026): as rotas
    // devem devolver 404 real em vez de servir a SPA.
    expect(resolveHttpStatus("/admin", blogSlugs)).toBe(404);
    expect(resolveHttpStatus("/admin/leads", blogSlugs)).toBe(404);
    expect(resolveHttpStatus("/dashboard", blogSlugs)).toBe(404);
  });

  it("retorna 404 para exames e posts inexistentes (corrige soft-404)", () => {
    expect(resolveHttpStatus("/exames/nao-existe", blogSlugs)).toBe(404);
    expect(resolveHttpStatus("/blog/post-inexistente", blogSlugs)).toBe(404);
    expect(resolveHttpStatus("/a/b/c", blogSlugs)).toBe(404);
  });

  it("mantém 200 para slugs de primeiro nível (artigos AutoSEO dinâmicos)", () => {
    expect(resolveHttpStatus("/algum-artigo-autoseo", blogSlugs)).toBe(200);
  });
});

describe("GUARD-RAIL: cobertura do sitemap (nao remover)", () => {
  // Regra permanente (auditoria SEMrush jul/2026): o site e uma SPA e o Google
  // precisa receber conteudo no HTML inicial. TODA rota publicada no sitemap
  // deve entregar conteudo pre-renderizado com H1. Se este teste falhar, uma
  // rota nova foi adicionada ao sitemap sem cobertura em seo-content.ts —
  // adicione o conteudo antes de publicar, nao delete o teste.
  const PATHS_SEM_PRERENDER_PERMITIDOS = new Set([
    "https://totalquality.med.br/cartao", // pagina de produto, baixa prioridade SEO
  ]);

  it.each(
    getAllRoutes()
      .filter((r) => !PATHS_SEM_PRERENDER_PERMITIDOS.has(r.canonical))
      .map((r) => new URL(r.canonical).pathname)
  )("rota do sitemap %s entrega conteudo pre-renderizado com H1", (pathname) => {
    const html = getSeoContentForPath(pathname);
    expect(html, `Rota ${pathname} esta no sitemap mas nao tem conteudo pre-renderizado em seo-content.ts`).toBeTruthy();
    expect(html).toContain("<h1>");
  });

  it("novas paginas do hub e blog estao cobertas", () => {
    expect(getSeoContentForPath("/exames")).toContain("Exames Laboratoriais");
    expect(getSeoContentForPath("/exames/hemograma")).toContain("jejum");
    expect(getSeoContentForPath("/exames/exame-admissional")).toContain("ASO");
    expect(getSeoContentForPath("/blog/hemograma-caraguatatuba")).toContain("<article>");
    expect(getSeoContentForPath("/blog")).toContain("<h1>");
  });
});

describe("GUARD-RAIL: nunca anunciar servico nao prestado (nao remover)", () => {
  // Anunciar exame que a clinica nao realiza viola as diretrizes do Google
  // (risco de suspensao do perfil) e as normas do CFM. Duas decisoes do Alex:
  //   - ressonancia magnetica: nao oferecida (29/07/2026);
  //   - ecocardiograma: nao oferecido no momento, previsto para o futuro
  //     (01/08/2026) — ao passar a oferecer, remover daqui PRIMEIRO.
  const NAO_OFERECIDOS = [/resson[âa]ncia/i, /ecocardiograma/i, /ecodoppler/i];

  it.each(
    getAllRoutes().map((r) => new URL(r.canonical).pathname)
  )("%s nao menciona exame que a clinica nao realiza", (pathname) => {
    const html = getSeoContentForPath(pathname);
    if (!html) return;
    for (const termo of NAO_OFERECIDOS) {
      expect(html, `${pathname} menciona ${termo}`).not.toMatch(termo);
    }
  });
});

describe("GUARD-RAIL: links internos em todas as rotas (nao remover)", () => {
  // Auditoria de links internos, jul-ago/2026: as menções a exames eram texto
  // solto por todo o site. Todo link do HTML pre-renderizado precisa apontar
  // para rota que existe — link quebrado cai no 404 real de resolveHttpStatus
  // e desperdica rastreamento, o que e pior do que nao ter link.
  const blogSlugs = getKnownBlogSlugs();

  it.each(
    getAllRoutes().map((r) => new URL(r.canonical).pathname)
  )("todo link interno de %s resolve 200", (pathname) => {
    const html = getSeoContentForPath(pathname);
    if (!html) return;
    const hrefs = Array.from(html.matchAll(/href="(\/[^"#]*)"/g)).map((m) => m[1]);
    for (const href of hrefs) {
      expect(resolveHttpStatus(href, blogSlugs), `${pathname} → ${href} nao resolve 200`).toBe(200);
    }
  });

  it("a home pre-renderizada distribui autoridade para as paginas de exame", () => {
    const home = getSeoContentForPath("/")!;
    const hrefs = new Set(
      Array.from(home.matchAll(/href="(\/[^"#]*)"/g)).map((m) => m[1])
    );
    // A home e a pagina mais forte do site: se ela parar de linkar as paginas
    // de exame, todas elas perdem a principal fonte de autoridade interna.
    for (const href of [
      "/laboratorio-caraguatatuba",
      "/exames/exames-de-sangue",
      "/exames/tomografia-computadorizada",
      "/exames/ultrassonografia",
      "/exames/mamografia",
      "/exames/raio-x",
      "/exames/holter",
      "/exames/mapa",
      "/exames/eletrocardiograma",
      "/exames/eletroencefalograma",
      "/exames/espirometria",
      "/exames/exame-toxicologico",
      "/exames/exame-admissional",
      "/bioimpedancia",
      "/checkup",
    ]) {
      expect(hrefs, `home nao linka ${href}`).toContain(href);
    }
  });
});

describe("GUARD-RAIL: links internos da landing de laboratorio (nao remover)", () => {
  // Auditoria de links internos, jul/2026: a lista de exames desta pagina era
  // texto solto (<div>/<span> no React, <li> sem <a> no pre-render). O Google
  // lia os nomes dos exames sem nenhum caminho para as paginas que os
  // aprofundam — autoridade parada numa pagina so.
  const html = getSeoContentForPath("/laboratorio-caraguatatuba")!;

  it.each([
    "/exames/hemograma",
    "/exames/exames-de-sangue",
    "/exames/exame-toxicologico",
    "/exames/exame-admissional",
    "/exames/tomografia-computadorizada",
    "/exames/ultrassonografia",
    "/exames/mamografia",
    "/exames/raio-x",
    "/exames/eletrocardiograma",
    "/exames/holter",
    "/exames/mapa",
    "/exames/eletroencefalograma",
    "/exames/espirometria",
    "/bioimpedancia",
    "/blog/vitamina-d-importancia-saude",
    "/blog/convenios-laboratorio-caraguatatuba",
    "/blog/alimentacao-e-exames-laboratoriais",
  ])("linka para %s", (href) => {
    expect(html).toContain(`href="${href}"`);
  });

  it("todo destino linkado existe de verdade (nao gera 404)", () => {
    // Link para rota inexistente cai no 404 real de resolveHttpStatus e
    // desperdica rastreamento — pior do que nao ter link.
    const blogSlugs = getKnownBlogSlugs();
    const hrefs = Array.from(html.matchAll(/href="(\/[^"#]*)"/g)).map((m) => m[1]);
    expect(hrefs.length).toBeGreaterThan(15);
    for (const href of hrefs) {
      expect(resolveHttpStatus(href, blogSlugs), `${href} nao resolve 200`).toBe(200);
    }
  });
});

describe("Redirecionamentos legados (auditoria Search Console jul/2026)", () => {
  it("mapeia as URLs legadas conhecidas pelo Google para o destino atual", () => {
    expect(getLegacyRedirect("/index")).toBe("/");
    expect(getLegacyRedirect("/sobre")).toBe("/#sobre");
    expect(getLegacyRedirect("/contato")).toBe("/#contato");
    expect(getLegacyRedirect("/mapa")).toBe("/exames/mapa");
    expect(getLegacyRedirect("/cartao-desconto")).toBe("/cartao");
    expect(getLegacyRedirect("/blog/index")).toBe("/blog");
    expect(getLegacyRedirect("/medicos")).toBe("/");
  });

  it("normaliza barra final", () => {
    expect(getLegacyRedirect("/index/")).toBe("/");
  });

  it("não redireciona rotas válidas", () => {
    expect(getLegacyRedirect("/checkup")).toBeNull();
    expect(getLegacyRedirect("/exames/holter")).toBeNull();
    expect(getLegacyRedirect("/")).toBeNull();
  });

  it("marca artefatos de link quebrado como 410 Gone", () => {
    expect(isGone("/$")).toBe(true);
    expect(isGone("/undefined")).toBe(true);
    expect(isGone("/checkup")).toBe(false);
  });

  it("a página de privacidade existe e é pré-renderizada (LGPD)", () => {
    const html = getSeoContentForPath("/privacidade");
    expect(html).toContain("<h1>Política de Privacidade</h1>");
    expect(html).toContain("LGPD");
    expect(resolveHttpStatus("/privacidade", getKnownBlogSlugs())).toBe(200);
  });
});
