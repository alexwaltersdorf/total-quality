import { describe, expect, it } from "vitest";
import {
  CONVENIOS,
  getSeoContentForPath,
  injectSeoContent,
  resolveHttpStatus,
} from "./_core/seo-content";
import { CONVENIOS as CONVENIOS_CLIENT } from "@/lib/conveniosData";
import {
  getAllRoutes,
  getKnownBlogSlugs,
  getRouteMetadata,
  injectMetaTags,
} from "./_core/routes-metadata";
import { getLegacyRedirect, isGone, LEGACY_REDIRECTS } from "./_core/legacy-redirects";
import { anosDeAtuacao } from "@shared/const";

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
      resolveHttpStatus("/blog/hemograma-completo-o-que-avalia", blogSlugs)
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
    expect(getSeoContentForPath("/blog/hemograma-completo-o-que-avalia")).toContain("<article>");
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

  it("client/index.html (JSON-LD global) nao anuncia servico nao prestado", async () => {
    // A auditoria de 01/08/2026 achou "Ecocardiograma" 3x no JSON-LD do
    // index.html DEPOIS da limpeza das paginas: o arquivo fica fora de
    // client/src e escapou do grep. Este teste le o template servido em toda
    // rota — se o termo voltar aqui, volta em todas as paginas de uma vez.
    const fs = await import("node:fs");
    const nodePath = await import("node:path");
    const indexHtml = fs.readFileSync(
      nodePath.resolve(import.meta.dirname, "../client/index.html"),
      "utf-8"
    );
    for (const termo of NAO_OFERECIDOS) {
      expect(indexHtml, `client/index.html menciona ${termo}`).not.toMatch(termo);
    }
    // O dominio de staging da Manus tambem nao pode voltar a nenhum schema
    const hook = fs.readFileSync(
      nodePath.resolve(import.meta.dirname, "../client/src/hooks/useSchemaLocalBusiness.ts"),
      "utf-8"
    );
    expect(hook).not.toContain("manus.space");
    // O campo (nao a palavra em comentario): nota autodeclarada e fabricada
    expect(hook).not.toContain("ratingValue");
  });
});

describe("GUARD-RAIL: horario oficial unico (nao remover)", () => {
  // Decisao do Alex em 02/08/2026: segunda a sexta, 07h30 as 18h; sabado e
  // domingo FECHADOS. O perfil do Google ja esta assim. Antes desta correcao o
  // codigo tinha QUATRO horarios diferentes (8h-18h, 7h30-17h30 na sexta,
  // coleta 6h30-16h e sabado 6h30-11h) — NAP inconsistente e sinal negativo de
  // ranking local. Se algum horario legado reaparecer, este teste quebra.
  const HORARIOS_LEGADOS = [/06h30/i, /6h30 às/i, /08h às 18h/i, /17h30/i, /Sábado: /];

  it("nenhum arquivo do cliente volta a citar horario legado", async () => {
    const fs = await import("node:fs");
    const nodePath = await import("node:path");
    const raiz = nodePath.resolve(import.meta.dirname, "../client");
    const arquivos = fs
      .readdirSync(nodePath.join(raiz, "src"), { recursive: true })
      .filter((f) => /\.(tsx?|json)$/.test(String(f)))
      .map((f) => nodePath.join(raiz, "src", String(f)));
    arquivos.push(nodePath.join(raiz, "index.html"));
    for (const arquivo of arquivos) {
      const conteudo = fs.readFileSync(arquivo, "utf-8");
      for (const legado of HORARIOS_LEGADOS) {
        expect(conteudo, `${arquivo} contem horario legado ${legado}`).not.toMatch(legado);
      }
    }
  });

  it("o pre-render e o schema usam o horario oficial", async () => {
    const html = getSeoContentForPath("/")!;
    expect(html).toContain("7h30 às 18h");
    expect(html).toContain("Sábado e domingo fechado");
    const fs = await import("node:fs");
    const nodePath = await import("node:path");
    const indexHtml = fs.readFileSync(
      nodePath.resolve(import.meta.dirname, "../client/index.html"),
      "utf-8"
    );
    expect(indexHtml).not.toContain('"opens": "08:00"');
    // Um unico no de negocio desde out/2026 (eram dois, com @id diferentes).
    expect((indexHtml.match(/"opens": "07:30"/g) || []).length).toBe(1);
    expect(indexHtml).not.toMatch(/Saturday|Sunday/);
  });

  it("og:image, favicon e imagem do schema saem do domínio próprio, nunca de CDN de terceiro", async () => {
    // Auditoria ago/2026: og:image, favicon e o "image" do LocalBusiness
    // apontavam para um PNG generico ("optik-hero") no CloudFront da Manus —
    // a imagem da ENTIDADE local vinha de dominio de terceiro. Fotos reais
    // da clinica no dominio proprio sao sinal de procedencia local.
    const fs = await import("node:fs");
    const nodePath = await import("node:path");
    const indexHtml = fs.readFileSync(
      nodePath.resolve(import.meta.dirname, "../client/index.html"),
      "utf-8"
    );
    expect(indexHtml).not.toContain("cloudfront.net");
    // Regra "so GTM" (02/08): nenhum pixel, gtag ou noscript de mensuracao
    // direto no HTML — Meta Pixel aposentado (1536672876562340) incluso.
    expect(indexHtml).not.toContain("facebook.com/tr");
    expect(indexHtml).not.toContain("1536672876562340");
    expect(indexHtml).not.toContain("gtag/js?id=");
    expect(indexHtml).not.toContain("trysoro");
    expect(indexHtml).toContain('og:image" content="https://totalquality.med.br/images/');
    expect(indexHtml).toContain('"image": ["https://totalquality.med.br/images/');
  });

  it("nenhuma rota injeta og:image de CDN de terceiro", () => {
    // Auditoria out/2026: o teste acima le o client/index.html, que esta
    // correto desde agosto. O PNG do CloudFront sobrevivia em routes-metadata,
    // no ogImage da home, e injectMetaTags sobrescreve a tag certa em tempo de
    // requisicao — por isso a producao servia o PNG de 5,7 MB enquanto o HTML
    // de origem declarava o WebP. Verificar o HTML INJETADO, nao o de origem.
    for (const metadata of getAllRoutes()) {
      if (!metadata.ogImage) continue;
      expect(metadata.ogImage, metadata.canonical).not.toContain("cloudfront.net");
      const injected = injectMetaTags(
        '<meta property="og:image" content="PLACEHOLDER" />',
        metadata
      );
      expect(injected, metadata.canonical).not.toContain("cloudfront.net");
    }
  });
});

describe("GUARD-RAIL: tempo de atuacao sempre calculado (nao remover)", () => {
  // A Total Quality foi fundada em 08/07/2003 (FUNDACAO_ISO em shared/const.ts).
  // Antes desta correcao o numero de anos vivia escrito a mao em CINCO lugares
  // (routes-metadata.ts e quatro trechos do seo-content.ts) — todos ficariam
  // errados no aniversario seguinte, em 08/07/2027. Se alguem voltar a escrever
  // o numero fixo em vez de chamar anosDeAtuacao(), este teste quebra.
  const ANOS_FIXOS = /(?:h[áa]|de|com)\s+mais\s+de\s+\d{2}\s+anos|H[áa]\s+\d{2}\s+anos|Mais\s+de\s+\d{2}\s+anos\s+de\s+experi/i;

  it("o calculo acompanha o aniversario", () => {
    expect(anosDeAtuacao(new Date(2026, 6, 7))).toBe(22); // 07/07/2026, vespera
    expect(anosDeAtuacao(new Date(2026, 6, 8))).toBe(23); // 08/07/2026, aniversario
    expect(anosDeAtuacao(new Date(2027, 6, 8))).toBe(24);
  });

  it("nenhum arquivo do prerender volta a fixar o numero de anos", async () => {
    const fs = await import("node:fs");
    const nodePath = await import("node:path");
    for (const rel of ["_core/seo-content.ts", "_core/routes-metadata.ts"]) {
      const arquivo = nodePath.resolve(import.meta.dirname, rel);
      const conteudo = fs.readFileSync(arquivo, "utf-8");
      expect(conteudo, `${rel} fixa o numero de anos em vez de usar anosDeAtuacao()`).not.toMatch(
        ANOS_FIXOS
      );
    }
  });

  it("nenhum componente do cliente volta a fixar o numero de anos", async () => {
    const fs = await import("node:fs");
    const nodePath = await import("node:path");
    // Em 05/09/2026 tres componentes diziam "mais de 20 anos" enquanto o
    // prerender ja calculava 23: numero errado, e invisivel para o guard-rail
    // acima, que so varre o server. O texto que o visitante le conta tanto
    // quanto o que o Google le.
    const dir = nodePath.resolve(import.meta.dirname, "../client/src/components");
    for (const nome of fs.readdirSync(dir)) {
      if (!nome.endsWith(".tsx")) continue;
      const conteudo = fs.readFileSync(nodePath.join(dir, nome), "utf-8");
      expect(conteudo, `${nome} fixa o numero de anos em vez de usar anosDeAtuacao()`).not.toMatch(
        ANOS_FIXOS
      );
    }
  });

  it("o prerender publica o numero calculado, nao um literal", () => {
    const html = getSeoContentForPath("/")!;
    expect(html).toContain(`Há mais de ${anosDeAtuacao()} anos no Litoral Norte`);
  });

  it("o schema declara a data de fundacao completa", async () => {
    const fs = await import("node:fs");
    const nodePath = await import("node:path");
    const indexHtml = fs.readFileSync(
      nodePath.resolve(import.meta.dirname, "../client/index.html"),
      "utf-8"
    );
    // Um unico no de negocio desde out/2026 (eram dois, com @id diferentes).
    expect((indexHtml.match(/"foundingDate": "2003-07-08"/g) || []).length).toBe(1);
    expect(indexHtml).not.toContain('"foundingDate": "2003"');
  });
});

describe("GUARD-RAIL: sem nota autodeclarada no schema (nao remover)", () => {
  // Auditoria ago/2026 ja havia removido o aggregateRating FABRICADO do hook
  // (useSchemaLocalBusiness). O index.html ficou para tras com 4,5/348 — numero
  // que envelhece a cada avaliacao nova (a base cresce ~26/mes) e que o Google
  // ignora de qualquer forma: nota autodeclarada de LocalBusiness nao gera
  // estrelas desde 2019. Removido em 23/08/2026; se voltar, este teste quebra.
  it("nem o index.html nem o hook declaram aggregateRating", async () => {
    const fs = await import("node:fs");
    const nodePath = await import("node:path");
    const indexHtml = fs.readFileSync(
      nodePath.resolve(import.meta.dirname, "../client/index.html"),
      "utf-8"
    );
    expect(indexHtml).not.toContain("aggregateRating");
    expect(indexHtml).not.toContain("reviewCount");
    const hook = fs.readFileSync(
      nodePath.resolve(import.meta.dirname, "../client/src/hooks/useSchemaLocalBusiness.ts"),
      "utf-8"
    );
    expect(hook).not.toContain("ratingValue");
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
    // Auditoria ago/2026 (C6): a duvida de convenio e transacional — o link
    // aponta para a pagina /convenios, nao mais para o post informacional.
    "/convenios",
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
    // /medicos fazia 301 para a home, que o Google conta como soft 404:
    // desde 22/10/2026 responde 410 (sem pagina equivalente).
    expect(getLegacyRedirect("/medicos")).toBeNull();
    expect(isGone("/medicos")).toBe(true);
    // Placeholder WordPress indexado, achado via site: em 01/08/2026
    expect(getLegacyRedirect("/total-quality")).toBe("/");
    expect(getLegacyRedirect("/total-quality/")).toBe("/");
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

describe("GUARD-RAIL: pagina /convenios (auditoria ago/2026, fila C6)", () => {
  it("existe, e pre-renderizada e resolve 200", () => {
    const html = getSeoContentForPath("/convenios");
    expect(html).toBeTruthy();
    expect(html).toContain("<h1>Convênios Aceitos no Laboratório em Caraguatatuba</h1>");
    expect(html).toContain("Perguntas frequentes");
    expect(html).toContain("FAQPage");
    expect(resolveHttpStatus("/convenios", getKnownBlogSlugs())).toBe(200);
  });

  it("as listas de convenios do servidor e do client sao identicas (paridade)", () => {
    // A lista vive em dois lugares porque o client nao pode importar
    // seo-content.ts (usa node:fs). Se este teste falhar, alguem atualizou
    // um lado e esqueceu o outro — sincronizar os dois arquivos.
    expect(CONVENIOS).toEqual(CONVENIOS_CLIENT);
    expect(CONVENIOS.length).toBeGreaterThan(0);
  });

  it("todo convenio da lista aparece no HTML pre-renderizado", () => {
    const html = getSeoContentForPath("/convenios")!;
    for (const convenio of CONVENIOS) {
      expect(html, `convenio ${convenio} sumiu da pagina`).toContain(convenio);
    }
  });
});

describe("GUARD-RAIL: convenio nao atendido nunca volta a peca publica (set/2026)", () => {
  // Em 05/09/2026 o Alex reduziu a lista a Cartao de Todos, Solumedi e Leader.
  // Antes disso o site anunciava 12 planos de saude que a clinica nao atende —
  // uma paciente com Hapvida ligou, ouviu "nao atendemos" e cobrou publicamente
  // numa avaliacao de 3 estrelas em 26/08. Anunciar convenio nao atendido custa
  // paciente, custa estrela e e o mesmo problema do ecocardiograma.
  const REMOVIDOS = [
    "Unimed", "Bradesco Saúde", "SulAmérica", "Amil", "Porto Seguro",
    "NotreDame Intermédica", "Hapvida", "Cassi", "Geap", "Postal Saúde",
    "Economus", "Funasa",
  ];

  it("nenhum convenio removido aparece na lista oficial", () => {
    for (const nome of REMOVIDOS) {
      expect(CONVENIOS, `${nome} voltou para a lista de convenios`).not.toContain(nome);
    }
  });

  it("nenhum convenio removido aparece no HTML pre-renderizado de /convenios", () => {
    const html = getSeoContentForPath("/convenios")!;
    for (const nome of REMOVIDOS) {
      expect(html, `${nome} voltou ao prerender de /convenios`).not.toContain(nome);
    }
  });

  it("nenhum convenio removido aparece em conteudo do client nem em metadados", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const raiz = path.resolve(import.meta.dirname, "..");
    const alvos = [
      "client/src/pages/Convenios.tsx",
      "client/src/pages/LaboratorioCaraguatatuba.tsx",
      "client/src/lib/conveniosData.ts",
      "client/src/content/blog/index.json",
      "server/_core/routes-metadata.ts",
    ];
    const problemas: string[] = [];
    for (const rel of alvos) {
      const texto = fs.readFileSync(path.resolve(raiz, rel), "utf-8");
      for (const nome of REMOVIDOS) {
        if (texto.includes(nome)) problemas.push(`${rel}: ainda cita "${nome}"`);
      }
    }
    expect(problemas, problemas.join("\n")).toEqual([]);
  });

  it("a pagina nao promete convenios alem dos atendidos", () => {
    const html = getSeoContentForPath("/convenios")!;
    // "Outros planos regionais e nacionais" sugeria lista aberta; com tres
    // convenios fechados isso volta a ser promessa que a recepcao nao cumpre.
    expect(html).not.toContain("Outros planos regionais");
    expect(html).toContain("atendimento é particular");
  });
});

describe("GUARD-RAIL: linkagem interna dos artigos do blog (ago/2026)", () => {
  // Antes os corpos dos artigos tinham ZERO links — a camada informacional
  // nao repassava autoridade a nenhuma pagina estrategica. O auto-linker
  // (client/src/lib/internalLinkTargets.ts) precisa continuar produzindo
  // links no prerender de todo artigo, sem nunca linkar o artigo para si.
  const slugs = Array.from(getKnownBlogSlugs());

  it.each(slugs)("artigo %s linka ao menos uma página estratégica no corpo", (slug) => {
    const html = getSeoContentForPath(`/blog/${slug}`)!;
    const article = html.slice(html.indexOf("<article>"), html.indexOf("</article>"));
    const hrefs = Array.from(article.matchAll(/href="(\/[^"#]*)"/g)).map((m) => m[1]);
    expect(hrefs.length, `corpo de ${slug} voltou a ficar sem links internos`).toBeGreaterThan(0);
    expect(hrefs, `artigo ${slug} linka para si mesmo`).not.toContain(`/blog/${slug}`);
  });

  it("todo link automático resolve 200 (mapa não aponta para rota morta)", () => {
    const blogSlugs = getKnownBlogSlugs();
    for (const slug of blogSlugs) {
      const html = getSeoContentForPath(`/blog/${slug}`)!;
      for (const m of html.matchAll(/href="(\/[^"#]*)"/g)) {
        expect(resolveHttpStatus(m[1], blogSlugs), `${m[1]} em ${slug} não resolve 200`).toBe(200);
      }
    }
  });
});

describe("GUARD-RAIL: rastreamento padronizado (briefing de 02/08/2026)", () => {
  // Regra: todo clique de WhatsApp empurra UM UNICO evento whatsapp_click
  // padronizado (tracking.ts/trackWhatsAppConversion); generate_lead foi
  // aposentado; nenhum pixel direto no codigo — o GTM e o unico distribuidor.
  it("nenhum CTA de WhatsApp sem chamada de tracking, e eventos aposentados ausentes", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const base = path.resolve(import.meta.dirname, "..", "client", "src");
    const files = fs
      .readdirSync(base, { recursive: true, encoding: "utf-8" })
      .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));
    const problemas: string[] = [];
    for (const rel of files) {
      const src = fs.readFileSync(path.resolve(base, rel), "utf-8");
      if (src.includes("generate_lead")) problemas.push(`${rel}: generate_lead aposentado`);
      if (src.includes('"ads_conversion"')) problemas.push(`${rel}: ads_conversion aposentado`);
      // Cobre window.fbq(...) e o disfarce (window as any).fbq(...), que foi
      // como o hook legado useTracking.ts escapou da limpeza de 02/08.
      if (/\bfbq\s*\(|\bttq\s*\.|\bgtag\s*\(\s*['"]config/.test(src)) {
        problemas.push(`${rel}: pixel/tag direto proibido — o GTM e o unico distribuidor`);
      }
      // CTAs vivem em componentes (.tsx); um .ts pode citar wa.me para
      // classificar referrer (utmTracker) sem ser um CTA.
      if (!rel.endsWith(".tsx")) continue;
      const lines = src.split("\n");
      lines.forEach((line, i) => {
        // Nenhum CTA de WhatsApp navega na mesma aba: tirar o paciente do site
        // encerra a sessao e derruba a atribuicao.
        if (/window\.location\.href\s*=\s*[`'"]https:\/\/wa\.me/.test(line)) {
          problemas.push(`${rel}:${i + 1}: WhatsApp na mesma aba — use window.open(..., "_blank")`);
        }
        if (!line.includes("wa.me")) return;
        const janela = lines.slice(Math.max(0, i - 6), i + 7).join("\n");
        if (!/track(WhatsApp|Schedule|Card|Lead)/.test(janela)) {
          problemas.push(`${rel}:${i + 1}: CTA de WhatsApp sem tracking`);
        }
        if (/href=/.test(line) && !/target="_blank"/.test(janela)) {
          problemas.push(`${rel}:${i + 1}: link de WhatsApp sem target="_blank"`);
        }
      });
      // Todo link de telefone dispara trackPhoneClick.
      lines.forEach((line, i) => {
        if (!/href="tel:/.test(line)) return;
        const janela = lines.slice(Math.max(0, i - 2), i + 5).join("\n");
        if (!/trackPhoneClick/.test(janela)) {
          problemas.push(`${rel}:${i + 1}: link de telefone sem trackPhoneClick`);
        }
      });
    }
    expect(problemas, problemas.join("\n")).toEqual([]);
  });

  /*
   * Desde 21/09/2026 nenhum pedido de contato sai do site sem lead: os botoes
   * de WhatsApp E os de ligacao passam pelo formulario de qualificacao
   * (contexts/ContatoLeadContext.tsx). Um <a href=tel:...> solto desfaz a
   * regra em silencio — entrega o numero ao discador e a clinica so descobre
   * o lead se a chamada completar e alguem anotar. Foi assim que metade dos
   * pedidos de contato ficou invisivel ate esta data.
   *
   * Duas excecoes, e so estas duas:
   *   - pages/Privacidade.tsx   canal para exercer direitos do titular. A LGPD
   *                             manda facilitar o pedido (art. 18) e nao
   *                             coletar alem do necessario (art. 6, III);
   *                             exigir cadastro de quem liga para pedir
   *                             exclusao e o contrario das duas regras.
   *   - pages/ThankYouCall.tsx  a pagina que de fato disca, no fim do fluxo.
   *                             So disca para quem chegou pelo formulario
   *                             (MARCA_LIGACAO_QUALIFICADA).
   */
  it("nenhum CTA de telefone escapa do formulario de qualificacao", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const base = path.resolve(import.meta.dirname, "..", "client", "src");
    const EXCECOES = new Set(["pages/Privacidade.tsx", "pages/ThankYouCall.tsx"]);
    const arquivos = fs
      .readdirSync(base, { recursive: true, encoding: "utf-8" })
      .filter((f) => f.endsWith(".tsx"))
      .map((f) => f.split(path.sep).join("/"));

    const problemas: string[] = [];
    for (const rel of arquivos) {
      if (EXCECOES.has(rel)) continue;
      const linhas = fs.readFileSync(path.resolve(base, rel), "utf-8").split("\n");
      linhas.forEach((linha, i) => {
        if (/href\s*=\s*["'`]tel:/.test(linha) || /location\.href\s*=\s*["'`]tel:/.test(linha)) {
          problemas.push(
            `${rel}:${i + 1}: telefone sem qualificacao — use useTelefoneRedirect()`
          );
        }
      });
    }
    expect(problemas, problemas.join("\n")).toEqual([]);

    // As excecoes precisam continuar existindo: se alguem renomear ou apagar
    // um desses arquivos, a lista acima vira letra morta e o teste passaria a
    // permitir tudo sem ninguem perceber.
    for (const rel of EXCECOES) {
      expect(arquivos, `${rel} sumiu — reveja a lista de excecoes`).toContain(rel);
    }
  });

  /*
   * O formulario e o mesmo para os dois canais e o evento de conversao
   * continua sendo UM SO (briefing de 02/08). Quem precisa separar ligacao de
   * conversa usa lead_channel como dimensao — criar um evento novo obrigaria a
   * refazer as conversoes no Ads e no Meta.
   */
  it("o canal do lead viaja como dimensao, nao como evento novo", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const raiz = path.resolve(import.meta.dirname, "..");
    const leia = (rel: string) => fs.readFileSync(path.resolve(raiz, rel), "utf-8");
    const tracking = leia("client/src/lib/tracking.ts");
    const contexto = leia("client/src/contexts/ContatoLeadContext.tsx");

    expect(tracking).toMatch(/lead_channel:\s*canal/);
    expect(contexto).toContain("useTelefoneRedirect");
    /*
     * A valvula de escape documentada no topo do contexto: se o atrito custar
     * lead, tirar "telefone" de CANAIS_QUALIFICADOS devolve o discador
     * imediato. Enquanto ela estiver ligada, o canal precisa estar la.
     *
     * Aqui o array e EXTRAIDO e conferido, em vez de aferido por proximidade.
     * Duas versoes anteriores desta trava passavam com o canal ja removido:
     * a primeira casava com a palavra "telefone" num comentario vizinho, a
     * segunda com o array do CAMPOS_OBRIGATORIOS logo abaixo. Trava que casa
     * com o texto errado nao trava nada.
     */
    const canais = contexto.match(/CANAIS_QUALIFICADOS[^=]*=\s*\[([^\]]*)\]/)?.[1];
    expect(canais, "CANAIS_QUALIFICADOS nao encontrado no contexto").toBeDefined();
    expect(canais).toContain('"whatsapp"');
    expect(canais).toContain('"telefone"');
    // O telefone tem tipo de conversao proprio no banco; sem isso todo pedido
    // de ligacao volta a se misturar com qualquer outro clique em "cta_click".
    expect(leia("client/src/hooks/useAnalyticsTracker.ts")).toContain('"phone_call"');
  });

  // Conversoes aprimoradas: o contato so pode entrar no dataLayer com hash
  // SHA-256 (lib/userData.ts) e com consentimento de marketing. Texto puro
  // nunca — nem no evento, nem em user_data.
  it("nenhum e-mail ou telefone em texto puro no dataLayer", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const base = path.resolve(import.meta.dirname, "..", "client", "src");
    const files = fs
      .readdirSync(base, { recursive: true, encoding: "utf-8" })
      .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));
    const problemas: string[] = [];
    for (const rel of files) {
      const src = fs.readFileSync(path.resolve(base, rel), "utf-8");
      const pushes = src.match(/pushToDataLayer\([\s\S]{0,600}?\n\s*\}\);/g) ?? [];
      for (const bloco of pushes) {
        if (/\b(email|e_mail|telefone|phone|phone_number|user_email)\s*:/.test(bloco)) {
          problemas.push(`${rel}: contato em texto puro no push do dataLayer`);
        }
      }
    }
    // O unico modulo autorizado a manipular contato e o userData.ts, e ele so
    // devolve campos com prefixo sha256_.
    const userData = fs.readFileSync(path.resolve(base, "lib", "userData.ts"), "utf-8");
    expect(userData).toContain("sha256_email_address");
    expect(userData).toContain("sha256_phone_number");
    expect(userData).toContain("marketingConsentGranted");
    expect(problemas, problemas.join("\n")).toEqual([]);
  });
});

describe("GUARD-RAIL: nenhum dado pessoal ou de saude em URL (LGPD, ago/2026)", () => {
  // Ate 11/08/2026 o formulario de contato navegava para
  // /formulario-sucesso?nome=&telefone=&email=&tipoExame=&mensagem=. Isso
  // gravava nome, telefone, e-mail e o EXAME PROCURADO (dado sensivel de
  // saude, art. 11 da LGPD) dentro do page_location do GA4 — violacao da
  // politica de dados pessoais do Google Analytics. O lead passou a viajar por
  // sessionStorage (lib/leadHandoff.ts). Nao reverter.
  it("nenhuma rota do cliente recebe PII em query string", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const base = path.resolve(import.meta.dirname, "..", "client", "src");
    const files = fs
      .readdirSync(base, { recursive: true, encoding: "utf-8" })
      .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));
    const CAMPOS = ["nome", "telefone", "email", "tipoExame", "mensagem"];
    const problemas: string[] = [];
    for (const rel of files) {
      const src = fs.readFileSync(path.resolve(base, rel), "utf-8");
      if (/formulario-sucesso\?/.test(src)) {
        problemas.push(`${rel}: /formulario-sucesso navegado com query string`);
      }
      // URLSearchParams montado com campos do formulario de contato.
      const params = src.match(/new URLSearchParams\(\{[\s\S]{0,400}?\}\)/g) ?? [];
      for (const bloco of params) {
        const usados = CAMPOS.filter((c) => new RegExp(`\\b${c}\\s*:`).test(bloco));
        if (usados.length > 0) {
          problemas.push(`${rel}: URLSearchParams com ${usados.join(", ")}`);
        }
      }
    }
    expect(problemas, problemas.join("\n")).toEqual([]);
  });
});

describe("GUARD-RAIL: headings sem palavras coladas (auditoria HeadingsMap ago/2026)", () => {
  // Titulos JSX quebrados com <br/> ou <span> empilhados SEM espaco explicito
  // concatenam sem espaco no nome acessivel: "PRINCIPAIS"+"EXAMES" vira
  // "PRINCIPAISEXAMES" para HeadingsMap, leitores de tela e Google.
  // Regra: sempre terminar a linha de texto com {" "} antes de <br/> ou de
  // outro <span>. Unica excecao intencional: BIO<br/>IMPEDANCIA, que forma
  // a palavra correta "BIOIMPEDANCIA" justamente por concatenar sem espaco.
  it("nenhum heading do client junta palavras sem espaço", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const files = fs
      .readdirSync(path.resolve(import.meta.dirname, "..", "client", "src"), {
        recursive: true,
        encoding: "utf-8",
      })
      .filter((f) => f.endsWith(".tsx"));
    const headingRe = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g;
    const stripTags = (s: string) => s.replace(/\{[^}]*\}/g, "").replace(/<[^>]+>/g, "");
    const problemas: string[] = [];
    for (const rel of files) {
      const src = fs.readFileSync(
        path.resolve(import.meta.dirname, "..", "client", "src", rel),
        "utf-8"
      );
      for (const m of src.matchAll(headingRe)) {
        const lines = m[2].split("\n");
        for (let i = 0; i < lines.length - 1; i++) {
          const a = stripTags(lines[i].trimEnd());
          const b = stripTags(lines.slice(i + 1).join("")).trimStart();
          const nxt = (lines[i + 1] ?? "").trim();
          const juncao =
            a && b &&
            /[\p{L}\p{N}]$/u.test(a) && /^[\p{L}\p{N}]/u.test(b) &&
            !lines[i].trimEnd().endsWith('{" "}') &&
            (nxt.startsWith("<br") || nxt.startsWith("<span") || lines[i].includes("<br />"));
          if (juncao && !(a.trim().endsWith("BIO") && b.startsWith("IMPEDÂNCIA"))) {
            problemas.push(`${rel}: "${a.trim().slice(-25)}" + "${b.slice(0, 25)}"`);
            break;
          }
        }
      }
    }
    expect(problemas, problemas.join("\n")).toEqual([]);
  });
});

describe("GUARD-RAIL: coleta sem agendamento (confirmado pelo Alex em 01/08/2026)", () => {
  // A coleta laboratorial e por ordem de chegada — argumento de desempate nas
  // buscas locais ("exame de sangue sem agendamento"). As paginas de exames de
  // LABORATORIO devem afirmar isso; exames de imagem seguem com agendamento.
  it.each(["/", "/laboratorio-caraguatatuba", "/exames/exames-de-sangue", "/exames/hemograma", "/exames/sexagem-fetal", "/convenios"])(
    "%s afirma o atendimento por ordem de chegada",
    (route) => {
      const html = getSeoContentForPath(route)!;
      expect(html).toMatch(/ordem de chegada|sem agendamento|n[ãa]o [ée] necess[áa]rio agendamento/i);
    }
  );
});

describe("GUARD-RAIL: peso do bundle — sem destaque de sintaxe (ago/2026)", () => {
  // Em 21/08/2026 a dependencia `streamdown` foi removida: existia para
  // renderizar markdown de IA em streaming com destaque de sintaxe, e trazia
  // junto 73 gramaticas de linguagem (emacs-lisp, C++, WebAssembly, Wolfram)
  // mais mermaid e cytoscape. Num site de laboratorio clinico isso custava
  // 271,8 KB gzip na pagina de artigo e 2.839 KB gzip no build inteiro, sem
  // servir a nenhum leitor. O markdown passou a ser renderizado por
  // client/src/lib/renderMarkdown.tsx (elementos React, sem innerHTML).
  it("nenhuma biblioteca de destaque de sintaxe ou diagrama nas dependencias", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(import.meta.dirname, "..", "package.json"), "utf-8")
    );
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    const proibidas = deps.filter((d) => /^(streamdown|shiki|mermaid|cytoscape|highlight\.js|prismjs)$/.test(d));
    expect(proibidas, `dependencias pesadas de renderizacao: ${proibidas.join(", ")}`).toEqual([]);
  });

  it("nenhum modulo do client importa essas bibliotecas", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const base = path.resolve(import.meta.dirname, "..", "client", "src");
    const files = fs
      .readdirSync(base, { recursive: true, encoding: "utf-8" })
      .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));
    const problemas: string[] = [];
    for (const rel of files) {
      const src = fs.readFileSync(path.resolve(base, rel), "utf-8");
      if (/from\s+["'](streamdown|shiki|mermaid|cytoscape|highlight\.js|prismjs)["']/.test(src)) {
        problemas.push(`${rel}: import de biblioteca pesada de renderizacao`);
      }
    }
    expect(problemas, problemas.join("\n")).toEqual([]);
  });

  it("renderMarkdown nunca usa dangerouslySetInnerHTML", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const src = fs.readFileSync(
      path.resolve(import.meta.dirname, "..", "client", "src", "lib", "renderMarkdown.tsx"),
      "utf-8"
    );
    // O conteudo vem de webhook externo: elementos React escapam texto,
    // innerHTML executaria markdown malicioso como HTML.
    expect(src).not.toContain("dangerouslySetInnerHTML");
  });
});

describe("GUARD-RAIL: soft 404 do catch-all de artigos (Search Console, ago/2026)", () => {
  // O Search Console reportou 13 URLs em "Soft 404". As legadas (/sobre,
  // /medicos, /mapa, /login...) ganharam 301 em legacy-redirects.ts. Sobrava a
  // fabrica: a rota `/:slug` do wouter devolvia **200 para qualquer caminho de
  // primeiro nivel**, servindo a home com status 200 — soft 404 por definicao,
  // renovavel para toda URL nova que o Google descobrisse.
  const blogSlugs = getKnownBlogSlugs();

  it("caminho de primeiro nível inexistente responde 404 real", () => {
    const publicados = new Set(["guia-de-exames-2026"]);
    expect(resolveHttpStatus("/pagina-que-nao-existe", blogSlugs, publicados)).toBe(404);
    expect(resolveHttpStatus("/promo-antiga", blogSlugs, publicados)).toBe(404);
  });

  it("artigo AutoSEO publicado continua respondendo 200", () => {
    const publicados = new Set(["guia-de-exames-2026"]);
    expect(resolveHttpStatus("/guia-de-exames-2026", blogSlugs, publicados)).toBe(200);
    expect(resolveHttpStatus("/guia-de-exames-2026/", blogSlugs, publicados)).toBe(200);
  });

  it("rota estática nunca é confundida com slug de artigo", () => {
    // Sem artigo nenhum publicado, as rotas do site seguem 200.
    const vazio = new Set<string>();
    for (const rota of ["/", "/checkup", "/bioimpedancia", "/cartao", "/convenios", "/privacidade", "/blog", "/exames"]) {
      expect(resolveHttpStatus(rota, blogSlugs, vazio), `${rota} virou 404`).toBe(200);
    }
  });

  it("lista ainda não carregada mantém o comportamento antigo (nunca 404 por banco fora)", () => {
    // `null` = cache nunca carregou. Preferimos soft 404 transitório a
    // devolver 404 num artigo real porque o banco estava indisponível.
    expect(resolveHttpStatus("/qualquer-coisa", blogSlugs, null)).toBe(200);
    expect(resolveHttpStatus("/qualquer-coisa", blogSlugs)).toBe(200);
  });

  it("as 13 URLs do relatório de soft 404 têm 301 ou são rota válida", () => {
    // Lista exata do relatório do Search Console (validação falhou em 11/08,
    // quando o deploy estava quebrado e o código nunca chegou à produção).
    const reportadas = [
      "/blog/index",
      "/blog/privacidade",
      "/mapa",
      "/login",
      "/sobre",
      "/contato",
      "/cartao-desconto",
    ];
    for (const url of reportadas) {
      const destino = getLegacyRedirect(url);
      expect(destino, `${url} perdeu o 301 e volta a ser soft 404`).toBeTruthy();
      // O destino do 301 precisa existir de verdade.
      const alvo = destino!.split("#")[0] || "/";
      expect(
        resolveHttpStatus(alvo, blogSlugs, new Set<string>()),
        `${url} redireciona para ${alvo}, que não responde 200`
      ).toBe(200);
    }
  });
});

describe("GUARD-RAIL: uma URL por intencao — consolidacao do blog (out/2026)", () => {
  // Auditoria do Search Console de 21/10/2026: artigos do blog disputavam a
  // intencao das paginas de servico e a posicao do site caiu. Cada um foi
  // consolidado no destino com 301. Se um deles voltar ao indice do blog, a
  // canibalizacao volta junto.
  const CONSOLIDADOS: Record<string, string> = {
    "/blog/hemograma-caraguatatuba": "/exames/hemograma",
    "/blog/ultrassonografia-caraguatatuba": "/exames/ultrassonografia",
    "/blog/tomografia-caraguatatuba": "/exames/tomografia-computadorizada",
    "/blog/check-up-preventivo-quando-fazer": "/blog/check-up-medico-quais-exames-fazer",
    "/blog/laboratorio-regiao-sul-caraguatatuba": "/laboratorio-caraguatatuba",
    "/blog/laboratorio-jardim-primavera-caraguatatuba": "/laboratorio-caraguatatuba",
    "/blog/convenios-laboratorio-caraguatatuba": "/convenios",
    "/blog/exame-de-sangue-caraguatatuba": "/exames/exames-de-sangue",
    "/blog/hemograma-completo": "/blog/hemograma-completo-o-que-avalia",
  };

  it.each(Object.entries(CONSOLIDADOS))("%s faz 301 para %s", (origem, destino) => {
    expect(getLegacyRedirect(origem)).toBe(destino);
  });

  it("os artigos consolidados saem do blog e do sitemap", () => {
    const slugs = getKnownBlogSlugs();
    const sitemap = getAllRoutes().map((r) => new URL(r.canonical).pathname);
    for (const origem of Object.keys(CONSOLIDADOS)) {
      expect(slugs.has(origem.replace("/blog/", "")), `${origem} voltou ao indice do blog`).toBe(false);
      expect(sitemap, `${origem} voltou ao sitemap`).not.toContain(origem);
    }
  });

  it("nenhum 301 aponta para outra URL que tambem redireciona (sem cadeia)", () => {
    const blogSlugs = getKnownBlogSlugs();
    for (const [origem, destino] of Object.entries(LEGACY_REDIRECTS)) {
      const alvo = destino.split("#")[0] || "/";
      expect(getLegacyRedirect(alvo), `${origem} -> ${alvo} faz cadeia de redirecionamento`).toBeNull();
      expect(resolveHttpStatus(alvo, blogSlugs, new Set<string>()), `${origem} -> ${alvo} nao responde 200`).toBe(200);
    }
  });

  it("nenhuma pagina publicada linka um artigo consolidado", () => {
    for (const route of getAllRoutes()) {
      const html = getSeoContentForPath(new URL(route.canonical).pathname);
      if (!html) continue;
      for (const origem of Object.keys(CONSOLIDADOS)) {
        expect(html, `${route.canonical} ainda linka ${origem}`).not.toContain(`href="${origem}"`);
      }
    }
  });
});

describe("GUARD-RAIL: pagina de sexagem fetal (25/10/2026)", () => {
  // O Alex confirmou em 25/10/2026 que a clinica faz sexagem fetal. O grupo do
  // Google Ads ja convertia e mandava para /exames/exames-de-sangue: a pagina
  // propria e a URL final certa (regra de 05/10). Exame de sangue da gestante:
  // sem promessa de acerto, sem jejum, com a idade gestacional minima.
  const html = getSeoContentForPath("/exames/sexagem-fetal")!;

  it("existe, responde 200, entra no sitemap e tem metadados proprios", () => {
    expect(html).toBeTruthy();
    expect(resolveHttpStatus("/exames/sexagem-fetal")).toBe(200);
    expect(getAllRoutes().map((r) => r.canonical)).toContain("https://totalquality.med.br/exames/sexagem-fetal");
    expect(getRouteMetadata("/exames/sexagem-fetal")?.title).toBe("Sexagem Fetal em Caraguatatuba | Total Quality");
  });

  it("explica o exame com o que e verdade: 8a semana, sem jejum, nao substitui o pre-natal", () => {
    expect(html).toMatch(/8ª semana/);
    expect(html).toMatch(/jejum/i);
    expect(html).toMatch(/não substitui o pré-natal/i);
  });

  it("nao promete acerto nem usa superlativo", () => {
    expect(html).not.toMatch(/\d{2}(,\d+)?\s?%|garant|100% seguro|precis[ãa]o|mais r[áa]pido|melhor/i);
  });

  it("a landing de analises clinicas linka a pagina", () => {
    expect(getSeoContentForPath("/laboratorio-caraguatatuba")).toContain('href="/exames/sexagem-fetal"');
  });
});

describe("GUARD-RAIL: paginas de especialidade (24/10/2026)", () => {
  // Pedido do Alex: endocrinologista, gastroenterologista e medicina do
  // trabalho. Decisoes: sem nome de medico, gastro so consulta (a clinica nao
  // faz endoscopia nem colonoscopia), PCMSO incluso, consultas particular e
  // pelos tres convenios.
  const SLUGS = ["endocrinologista", "gastroenterologista", "medicina-do-trabalho"];

  it.each(SLUGS)("/especialidades/%s responde 200, entra no sitemap e tem metadados", (slug) => {
    const path = `/especialidades/${slug}`;
    expect(resolveHttpStatus(path, getKnownBlogSlugs(), new Set<string>())).toBe(200);
    const canonicals = getAllRoutes().map((r) => r.canonical);
    expect(canonicals).toContain(`https://totalquality.med.br${path}`);
    const meta = getRouteMetadata(path)!;
    expect(meta.title.length).toBeLessThanOrEqual(60);
    expect(meta.description.length).toBeLessThanOrEqual(160);
    expect(meta.title).toMatch(/Caraguatatuba/);
  });

  it("especialidade inexistente responde 404", () => {
    expect(resolveHttpStatus("/especialidades/pediatra", getKnownBlogSlugs(), new Set<string>())).toBe(404);
  });

  it.each(SLUGS)("/especialidades/%s: prerender dentro das regras do CFM e das decisoes do Alex", (slug) => {
    const html = getSeoContentForPath(`/especialidades/${slug}`)!;
    expect(html.match(/<h1>/g)).toHaveLength(1);
    expect(html).toMatch(/Registro\s*970616/);
    expect(html).toContain("Alex Waltersdorf - 267.339");
    expect(html).not.toMatch(/\bCRM\b/);
    expect(html).not.toMatch(/\bDra?\.\s/);
    // (o rodape de endereco diz "Sábado e domingo fechado": horario, nao oferta)
    expect(html).not.toMatch(/\bmelhor(es)?\b|garant|R\$|\bpre[çc]o\b|wa\.me|resson[âa]ncia|ecocardiograma|ergom[ée]trico/i);
    expect(html).not.toMatch(/\b(Unimed|Bradesco|SulAm[ée]rica|Amil|Porto Seguro|NotreDame|Hapvida|Cassi|Geap)\b/);
    expect(html).toContain("MedicalWebPage");
  });

  it("gastroenterologia: so consulta, e a pagina diz que nao faz endoscopia nem colonoscopia", () => {
    const html = getSeoContentForPath("/especialidades/gastroenterologista")!;
    expect(html).toContain("não realiza endoscopia nem colonoscopia");
    expect(html).toContain("https://schema.org/Gastroenterologic");
  });

  it("medicina do trabalho: PCMSO, ASO e link para o exame admissional", () => {
    const html = getSeoContentForPath("/especialidades/medicina-do-trabalho")!;
    expect(html).toContain("PCMSO");
    expect(html).toContain("ASO");
    expect(html).toContain('href="/exames/exame-admissional"');
  });

  it("consultas: particular e os tres convenios", () => {
    for (const slug of ["endocrinologista", "gastroenterologista"]) {
      expect(getSeoContentForPath(`/especialidades/${slug}`)!).toContain("Cartão de Todos, Solumedi e Leader");
    }
  });
});

describe("GUARD-RAIL: auditoria de indexacao (23/10/2026)", () => {
  // URLs com historico de impressao no Search Console que respondiam 404.
  const COM_EQUIVALENTE: Record<string, string> = {
    "/blog/eletrocardiograma-o-que-%C3%A9-como-%C3%A9-feito": "/blog/eletrocardiograma-o-que-e-como-e-feito",
    "/blog/exame-de-sangue-guia-completo": "/blog/exames-de-sangue-guia-completo",
    "/exames/ultassonografia": "/exames/ultrassonografia",
    "/eletroencefalograma": "/exames/eletroencefalograma",
    "/glossario/tempo-resultado-hemograma-completo/": "/exames/hemograma",
    "/category/blog/": "/blog",
    "/about-us/": "/#sobre",
    "/contact-us/": "/#contato",
    "/contact-us-2/": "/#contato",
    "/appointment/": "/#contato",
  };

  it.each(Object.entries(COM_EQUIVALENTE))("%s faz 301 para %s", (origem, destino) => {
    expect(getLegacyRedirect(origem)).toBe(destino);
  });

  it("/faq/ responde 410", () => {
    expect(isGone("/faq/")).toBe(true);
  });
});

describe("GUARD-RAIL: blog de SEO local da regiao sul (out/2026)", () => {
  // O briefing de 09/10/2026 pedia um pilar de artigos comparando a Total
  // Quality com grandes redes nominalmente. A Resolucao CFM 2.336/2023 veda
  // publicidade que estabeleca comparacao ou concorrencia entre
  // estabelecimentos de saude, e o Google trata pagina feita para capturar
  // marca de terceiro como conteudo de baixa qualidade. O pilar foi mantido,
  // mas escrito por CRITERIO TECNICO verificavel, sem nomear ninguem.
  //
  // "Anchieta" fica fora da lista de proposito: e o nome da rua da clinica
  // (Rua Padre Anchieta, 1010). "a+" tambem fica fora — casaria com qualquer
  // texto. Esses dois so sao audiveis por leitura humana.
  const CONCORRENTES_NOMEADOS = [
    /oswaldo\s*cruz/i,
    /\bsabin\b/i,
    /mastellini/i,
    /lavoisier/i,
    /confiance/i,
  ];

  // O artigo da regiao sul foi consolidado em /laboratorio-caraguatatuba
  // (301 em 22/10/2026); os guard-rails dele passaram para a landing.
  const ARTIGOS_DO_SUL = [
    "como-escolher-laboratorio-analises-clinicas",
    "resultado-de-exames-online-seguranca",
    "exame-de-urina-eas-como-coletar",
  ];

  it.each(getAllRoutes().map((r) => new URL(r.canonical).pathname))(
    "%s nao nomeia laboratorio concorrente",
    (pathname) => {
      const html = getSeoContentForPath(pathname);
      if (!html) return;
      for (const marca of CONCORRENTES_NOMEADOS) {
        expect(html, `${pathname} nomeia concorrente (${marca})`).not.toMatch(marca);
      }
    }
  );

  it("nenhuma peca publica usa o nome de rua errado do NAP", () => {
    // Os fluxos de WhatsApp (ANA-02, BV-01) dizem "Av. Anchieta, 1010". O
    // endereco correto, e o que esta no perfil do Google, e "Rua Padre
    // Anchieta, 1010". NAP divergente derruba ranking local — o site nao pode
    // herdar a variante errada.
    for (const route of getAllRoutes()) {
      const html = getSeoContentForPath(new URL(route.canonical).pathname);
      if (!html) continue;
      expect(html, `${route.canonical} usa "Av. Anchieta" em vez de "Rua Padre Anchieta"`).not.toMatch(
        /Av\.?\s*Anchieta|Avenida\s+Anchieta/i
      );
    }
  });

  it("a landing de analises clinicas nomeia os bairros que antes tinham artigo proprio", () => {
    // Os artigos da regiao sul e do Jardim Primavera viraram uma secao de
    // /laboratorio-caraguatatuba (301 em 22/10/2026). Sem os bairros, a pagina
    // perde a cauda longa que o artigo trazia. Os nomes da regiao sul vem da
    // area de referencia do CRAS Sul da Prefeitura.
    const html = getSeoContentForPath("/laboratorio-caraguatatuba")!;
    for (const bairro of ["Perequê-Mirim", "Travessão", "Porto Novo", "Morro do Algodão", "Pegorelli", "Jardim Primavera"]) {
      expect(html, `a landing perdeu o bairro ${bairro}`).toContain(bairro);
    }
  });

  it("a landing continua dizendo que a clinica so atende no Centro", () => {
    // A clinica NAO tem unidade na regiao sul nem no Jardim Primavera. Texto
    // otimizado para o nome do bairro sem essa frase vira promessa falsa de
    // localidade — o paciente sai de casa e nao encontra nada.
    const html = getSeoContentForPath("/laboratorio-caraguatatuba")!;
    expect(html).toContain("Não temos unidade na região sul");
    expect(html).toContain("Rua Padre Anchieta, 1010");
  });

  it.each(ARTIGOS_DO_SUL)("artigo %s avisa que nao substitui consulta medica", (slug) => {
    // Nicho YMYL: conteudo de saude sem encaminhamento ao medico e risco
    // clinico antes de ser risco de ranking.
    const html = getSeoContentForPath(`/blog/${slug}`)!;
    expect(html).toMatch(/n[ãa]o substitui a consulta m[ée]dica/i);
  });

  it("nenhum artigo do blog volta a disputar o termo da landing", () => {
    // "laboratorio em Caraguatatuba" e da HOME (decisao por Search Console,
    // out/2026 — ver HOME_TITLE em shared/const.ts). Artigo com esse termo no
    // title reabre a canibalizacao, agora com 23 paginas em vez de duas.
    for (const route of getAllRoutes()) {
      const pathname = new URL(route.canonical).pathname;
      if (!pathname.startsWith("/blog/")) continue;
      expect(
        route.title,
        `${pathname} disputa "laboratorio em Caraguatatuba" com a home`
      ).not.toMatch(/laborat[óo]rio em caraguatatuba/i);
    }
  });
});

describe("GUARD-RAIL: identificacao do art. 5o em TODA peca publica (out/2026)", () => {
  // A auditoria de conformidade de 09/10/2026 reprovou os artigos novos por
  // ausencia de identificacao obrigatoria — e a varredura mostrou que a falta
  // era do site inteiro, nao dos artigos: nenhuma das 44 rotas
  // pre-renderizadas trazia o registro do estabelecimento nem o responsavel
  // tecnico, e o rodape renderizado tambem nao.
  //
  // Art. 5o da Resolucao CFM 2.336/2023: nome do estabelecimento com o numero
  // de registro E nome do responsavel tecnico com o dele, em local visivel.
  // Art. 6o: os numeros devem constar na pagina principal do site/perfil.
  //
  // Por isso a identificacao mora no bloco de NAP (pre-render) e no rodape
  // (cliente): sao as duas pecas que acompanham todas as paginas. Pagina nova
  // nasce conforme sem ninguem lembrar de nada.
  it.each(getAllRoutes().map((r) => new URL(r.canonical).pathname))(
    "%s identifica o estabelecimento e o responsavel tecnico",
    (pathname) => {
      const html = getSeoContentForPath(pathname);
      if (!html) return;
      expect(html, `${pathname} nao traz o registro do estabelecimento`).toMatch(/Registro\s*970616/);
      expect(html, `${pathname} nao traz o responsavel tecnico`).toMatch(
        /Respons[áa]vel T[ée]cnico:\s*Alex Waltersdorf - 267\.339/
      );
    }
  );

  it("o rodape renderizado tambem identifica (quem tem JavaScript ve o Footer, nao o prerender)", async () => {
    const fs = await import("node:fs");
    const nodePath = await import("node:path");
    const footer = fs.readFileSync(
      nodePath.resolve(import.meta.dirname, "../client/src/components/Footer.tsx"),
      "utf-8"
    );
    expect(footer).toContain("970616");
    expect(footer).toContain("Alex Waltersdorf - 267.339");
    expect(footer).toContain("Responsável Técnico:");
  });

  it("nem o pre-render nem o rodape escrevem a sigla do conselho", () => {
    // Decisao do Alex: apenas os digitos, sem a sigla. Comentario de codigo
    // nao conta — o teste olha o texto servido.
    for (const route of getAllRoutes()) {
      const html = getSeoContentForPath(new URL(route.canonical).pathname);
      if (!html) continue;
      const semComentarios = html.replace(/<!--[\s\S]*?-->/g, "");
      expect(semComentarios, `${route.canonical} escreve a sigla do conselho`).not.toMatch(
        /\bCRM\b/
      );
    }
  });
});

describe("GUARD-RAIL: cada artigo tem a sua propria imagem (out/2026)", () => {
  // Duas correcoes empilhadas, nesta ordem:
  //
  //   1. As fotos nao batiam com o texto. O nome do arquivo enganava:
  //      "cardiologia-*.webp" e um ULTRASSOM com Doppler, e por isso foi parar
  //      nos artigos de eletrocardiograma, MAPA e Holter. E "hero-clinica" era
  //      uma RESSONANCIA, exame que a clinica nao realiza.
  //   2. Corrigido o assunto, sobrou a repeticao: 23 artigos dividiam 5 fotos,
  //      e a listagem do blog mostrava a mesma imagem seis vezes.
  //
  // Agora cada artigo tem imagem propria. As da clinica vem primeiro, porque
  // foto real vale mais para SEO local do que banco de imagens; o resto esta
  // em /images/blog/<slug>.webp, com a origem registrada em
  // docs/creditos-imagens-blog.md.
  const FOTO_DA_CLINICA: Record<string, string> = {
    "como-escolher-laboratorio-analises-clinicas": "laboratorio-1024.webp",
    "diferenca-ultrassom-comum-doppler": "cardiologia-1024.webp",
  };

  async function imagemDoArtigo(slug: string): Promise<string> {
    const fs = await import("node:fs");
    const nodePath = await import("node:path");
    const artigo = JSON.parse(
      fs.readFileSync(
        nodePath.resolve(import.meta.dirname, `../client/src/content/blog/${slug}.json`),
        "utf-8"
      )
    ) as { image: string };
    return artigo.image;
  }

  it("nenhuma imagem se repete entre os artigos", async () => {
    // Era o pedido do Alex em 10/10/2026: "as imagens do blog devem ser
    // diferentes umas das outras".
    const slugs = Array.from(getKnownBlogSlugs());
    const porImagem = new Map<string, string[]>();
    for (const slug of slugs) {
      const img = await imagemDoArtigo(slug);
      porImagem.set(img, [...(porImagem.get(img) ?? []), slug]);
    }
    const repetidas = Array.from(porImagem.entries()).filter(([, s]) => s.length > 1);
    expect(
      repetidas.map(([img, s]) => `${img.split("/").pop()} em ${s.join(", ")}`),
      "imagem usada por mais de um artigo"
    ).toEqual([]);
    expect(porImagem.size).toBe(slugs.length);
  });

  it.each(Array.from(getKnownBlogSlugs()))(
    "artigo %s aponta para uma imagem que existe no disco",
    async (slug) => {
      const fs = await import("node:fs");
      const nodePath = await import("node:path");
      const img = await imagemDoArtigo(slug);
      const esperado = FOTO_DA_CLINICA[slug]
        ? `https://totalquality.med.br/images/${FOTO_DA_CLINICA[slug]}`
        : `https://totalquality.med.br/images/blog/${slug}.webp`;
      expect(img, `${slug} nao usa a imagem definida para ele`).toBe(esperado);
      const caminho = nodePath.resolve(
        import.meta.dirname,
        "../client/public",
        img.replace("https://totalquality.med.br/", "")
      );
      expect(fs.existsSync(caminho), `${img} nao existe em client/public`).toBe(true);
    }
  );

  it("o card e o og:image do artigo mostram a mesma coisa", async () => {
    // Antes do #60 so 7 dos 23 tinham ogImage, e nem todos batiam com o card.
    for (const route of getAllRoutes()) {
      const pathname = new URL(route.canonical).pathname;
      const slug = pathname.startsWith("/blog/") ? pathname.slice("/blog/".length) : null;
      if (!slug || !getKnownBlogSlugs().has(slug)) continue;
      expect(route.ogImage, `${slug} tem og:image diferente da imagem do card`).toBe(
        await imagemDoArtigo(slug)
      );
    }
  });

  it("nenhuma peca servida volta a usar a foto da ressonancia", async () => {
    // hero-clinica-*.webp mostra uma ressonancia magnetica, exame que a clinica
    // nao realiza. O guard-rail de servico nao prestado le TEXTO; imagem
    // passava batido.
    const fs = await import("node:fs");
    const nodePath = await import("node:path");
    const raiz = nodePath.resolve(import.meta.dirname, "..", "client", "src");
    const arquivos = fs
      .readdirSync(raiz, { recursive: true, encoding: "utf-8" })
      .filter((f) => /\.(tsx?|json)$/.test(f))
      .map((f) => nodePath.join(raiz, f));
    arquivos.push(nodePath.resolve(import.meta.dirname, "..", "client", "index.html"));
    arquivos.push(nodePath.resolve(import.meta.dirname, "_core", "routes-metadata.ts"));
    arquivos.push(nodePath.resolve(import.meta.dirname, "_core", "seo-content.ts"));

    const ofensores: string[] = [];
    for (const arquivo of arquivos) {
      const semComentario = fs
        .readFileSync(arquivo, "utf-8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
        .replace(/^\s*\/\/.*$/gm, "");
      if (semComentario.includes("hero-clinica")) ofensores.push(arquivo);
    }
    expect(ofensores, ofensores.join("\n")).toEqual([]);
  });

  it("toda imagem de banco esta creditada em docs/creditos-imagens-blog.md", async () => {
    // Exigencia da Resolucao CFM 2.336/2023: banco de imagens cita a origem.
    const fs = await import("node:fs");
    const nodePath = await import("node:path");
    const creditos = fs.readFileSync(
      nodePath.resolve(import.meta.dirname, "..", "docs", "creditos-imagens-blog.md"),
      "utf-8"
    );
    for (const slug of getKnownBlogSlugs()) {
      if (FOTO_DA_CLINICA[slug]) continue;
      expect(creditos, `${slug} usa banco de imagens e nao esta creditado`).toContain(slug);
    }
  });
});

describe("GUARD-RAIL: campanha Outubro Rosa (out/2026)", () => {
  // Pagina de campanha com preco anunciado: o que esta escrito vincula a
  // clinica (CDC art. 30) e passa pelas vedacoes da Resolucao CFM 2.336/2023.
  // Tres riscos concretos, e um teste para cada:
  //
  //   1. O pre-render e a pagina React sao DOIS textos. Se alguem corrigir o
  //      preco em um e esquecer o outro, o robo e o paciente passam a ler
  //      ofertas diferentes — e a que vincula e a que o paciente viu.
  //   2. A ressalva da mamografia e o que impede o pacote de ser lido como
  //      rastreamento completo de cancer de mama. Ela nao e enfeite.
  //   3. Promessa de resultado, urgencia fabricada e brinde sao exatamente o
  //      que o art. 11 veda, e sao o que primeiro aparece quando alguem
  //      "melhora a conversao" da pagina.
  const ROTA = "/outubro-rosa";

  async function fontePagina(): Promise<string> {
    const fs = await import("node:fs");
    const nodePath = await import("node:path");
    return fs.readFileSync(
      nodePath.resolve(import.meta.dirname, "../client/src/pages/OutubroRosa.tsx"),
      "utf-8"
    );
  }

  /*
   * Precos CITADOS, nao precos PRESENTES. A primeira versao deste teste so
   * exigia que "R$ 399,90" aparecesse em algum lugar — e passou com o preco
   * trocado numa frase, porque a string sobrevivia na resposta do FAQ. Agora
   * o teste coleta todo preco do texto e exige que o conjunto seja exatamente
   * os dois: um terceiro valor significa oferta se contradizendo.
   */
  const PRECOS_AUTORIZADOS = ["R$ 500,00", "R$ 399,90"];
  const precosCitados = (texto: string) =>
    Array.from(
      new Set(Array.from(texto.matchAll(/R\$\s?\d{1,3}(?:\.\d{3})*,\d{2}/g)).map((m) => m[0]))
    ).sort();

  it("o pre-render anuncia os tres exames e nenhum preco alem dos dois", () => {
    const html = getSeoContentForPath(ROTA)!;
    for (const exame of [
      "Ultrassonografia das mamas",
      "Ultrassonografia transvaginal",
      "Papanicolau",
    ]) {
      expect(html, `o pre-render perdeu "${exame}"`).toContain(exame);
    }
    expect(precosCitados(html), "preco fora da oferta no pre-render").toEqual(
      [...PRECOS_AUTORIZADOS].sort()
    );
  });

  it("a pagina React anuncia exatamente a mesma oferta do pre-render", async () => {
    const src = await fontePagina();
    for (const exame of [
      "Ultrassonografia das mamas",
      "Ultrassonografia transvaginal",
      "Papanicolau",
    ]) {
      expect(src, `a pagina perdeu "${exame}"`).toContain(exame);
    }
    // O preco promocional aparece quebrado no bloco grande (399 + ,90), entao
    // o teste cobra as duas partes alem do texto corrido.
    expect(src).toContain('PRECO_POR_INTEIRO = "399"');
    expect(src).toContain('PRECO_POR_CENTAVOS = ",90"');
    expect(precosCitados(src), "preco fora da oferta na pagina").toEqual(
      [...PRECOS_AUTORIZADOS].sort()
    );
  });

  it("a ressalva da mamografia aparece nos dois pontos de cada versao", async () => {
    /*
     * Duas vezes em cada versao, e o teste cobra as duas: a nota abaixo dos
     * cartoes e a resposta do FAQ. Exigir uma so deixava apagar a nota — a
     * que o paciente le junto da oferta — sem o teste perceber, porque a
     * frase sobrevivia no FAQ.
     */
    const ressalva = /n[ãa]o substitui a/gi;
    const html = getSeoContentForPath(ROTA)!;
    const src = await fontePagina();
    expect((html.match(ressalva) || []).length, "pre-render perdeu uma ressalva").toBe(2);
    expect((src.match(ressalva) || []).length, "pagina React perdeu uma ressalva").toBe(2);
    expect(html).toContain("conforme indica");
  });

  it("nem o pre-render nem a pagina usam promessa, urgencia ou brinde", async () => {
    const VEDADO = [
      /prote[çc][ãa]o completa/i,
      /100\s*%\s*de\s*preven/i,
      /diagn[óo]stico garantido/i,
      /livre do c[âa]ncer/i,
      /vagas limitadas/i,
      /[úu]ltima chance/i,
      /contagem regressiva/i,
      /resultado em 24\s*horas/i,
      /brinde/i,
      /sorteio/i,
      /parcelamos|parcelamento em/i,
      /desconto no pix/i,
      /no mesmo dia garantido/i,
    ];
    const alvos: Array<[string, string]> = [
      ["pre-render", getSeoContentForPath(ROTA)!],
      ["pagina React", await fontePagina()],
    ];
    for (const [onde, texto] of alvos) {
      for (const proibido of VEDADO) {
        expect(texto, `${onde} usa ${proibido}`).not.toMatch(proibido);
      }
    }
  });
});
describe("GUARD-RAIL: artigo de hipoglicemia, conteudo de terceiro (out/2026)", () => {
  // O artigo de hipoglicemia chegou em 18/10/2026 como HTML gerado por um
  // servico externo (airticles.ai). O texto original trazia tres problemas que
  // NAO podem voltar, e e para isso que estas travas existem:
  //
  //   1. Uma TABELA COMPARATIVA posicionando a Total Quality acima de
  //      "monitoramento domiciliar" e "metodo ambulatorial tradicional" em
  //      precisao, agilidade e conforto. A Resolucao CFM 2.336/2023 veda
  //      publicidade que estabeleca comparacao ou sugira superioridade. E o
  //      mesmo motivo que derrubou o pilar de benchmark do briefing de 09/10.
  //   2. DESQUALIFICACAO DO GLICOSIMETRO ("sujeitos a interferencias e margem
  //      de erro tecnica maior"). Aparelho de ponta de dedo e prescrito e e a
  //      ferramenta certa para o monitoramento diario de quem tem diabetes.
  //      Desencorajar o autocontrole para vender exame laboratorial e risco
  //      clinico, nao so problema de etica publicitaria.
  //   3. A conclusao mandava AGENDAR EXAME. O proprio texto lista convulsao,
  //      desmaio e coma entre as manifestacoes — que sao emergencia. Artigo de
  //      saude que descreve quadro agudo e termina em call-to-action comercial,
  //      sem dizer para procurar urgencia, e falha de seguranca.
  const SLUG = "hipoglicemia-sintomas-e-exames";

  const artigo = () => {
    const fs = require("node:fs") as typeof import("node:fs");
    const nodePath = require("node:path") as typeof import("node:path");
    return JSON.parse(
      fs.readFileSync(
        nodePath.join(process.cwd(), "client/src/content/blog", `${SLUG}.json`),
        "utf-8"
      )
    ) as { title: string; content: string[] };
  };

  const corpo = () => artigo().content.join("\n");

  it("a rota existe e o pre-render responde", () => {
    const slugs = getKnownBlogSlugs();
    expect(
      Array.from(slugs),
      "rota do artigo nao registrada em routes-metadata"
    ).toContain(SLUG);
    expect(resolveHttpStatus(`/blog/${SLUG}`, slugs)).toBe(200);
  });

  it("nenhuma comparacao com outro meio de diagnostico ou de atendimento", () => {
    // Cobra o PADRAO da peca reprovada: coluna/linha de tabela que confronta a
    // clinica com uma alternativa. Nao basta proibir as palavras soltas.
    const vedado = [
      /monitoramento\s+domiciliar/i,
      /m[eé]todo\s+ambulatorial/i,
      /ambulatorial\s+tradicional/i,
      /margem\s+de\s+erro\s+(t[eé]cnica\s+)?maior/i,
      /sujeit[oa]s?\s+a\s+interfer[eê]ncias/i,
      /processamento\s+manual/i,
      /prazos\s+estendidos/i,
    ];
    const texto = corpo();
    const achados = vedado.filter((r) => r.test(texto)).map(String);
    expect(
      achados,
      "voltou a comparar a clinica com outro meio de diagnostico (CFM 2.336/2023)"
    ).toEqual([]);
  });

  it("nenhum superlativo de superioridade", () => {
    const vedado = [
      /excel[eê]ncia/i,
      /exemplar/i,
      /\bo\s+melhor\b/i,
      // "de ponta" precisa do substantivo E da ressalva: "aparelho de ponta de
      // dedo" (glicosimetro) e termo clinico legitimo e aparece na pergunta
      // frequente que impede a versao que desqualificava o aparelho.
      /(tecnologia|equipamento|aparelh\w+|estrutura|infraestrutura)\s+de\s+ponta(?!\s+de\s+dedo)/i,
      /[uú]ltima\s+gera[çc][aã]o/i,
      /alta\s+sensibilidade/i,
      /m[aá]xima\s+confiabilidade/i,
      /infraestrutura\s+(t[eé]cnica\s+)?avan[çc]ada/i,
      /destaca-se/i,
    ];
    const texto = corpo();
    const achados = vedado.filter((r) => r.test(texto)).map(String);
    expect(achados, "superlativo de superioridade no artigo (CFM 2.336/2023)").toEqual([]);
  });

  it("o glicosimetro e tratado como ferramenta legitima, nao como concorrente", () => {
    const texto = corpo();
    expect(
      /glicos[ií]metro|ponta\s+de\s+dedo/i.test(texto),
      "o artigo deixou de falar do glicosimetro — a pergunta frequente sobre ele e o que impede a versao que o desqualificava"
    ).toBe(true);
    expect(texto).toMatch(/ferramenta\s+certa/i);
  });

  it("a orientacao de emergencia esta no artigo, com o numero do servico", () => {
    const texto = corpo();
    expect(texto, "sem secao de emergencia").toMatch(/##\s*Quando\s+é\s+emerg[eê]ncia/i);
    expect(texto, "sem o telefone do servico de emergencia").toMatch(/\bSAMU\b[^\n]*192|\b192\b/);
    for (const sinal of [/convuls/i, /desmaio|inconsciente/i]) {
      expect(texto, `sinal de emergencia ausente: ${sinal}`).toMatch(sinal);
    }
  });

  it("avisa para nao dar nada pela boca a quem esta inconsciente", () => {
    // Era a omissao mais perigosa do texto original: ele listava coma e
    // convulsao, e nao dizia o que NAO fazer.
    expect(corpo()).toMatch(/n[aã]o\s+ofere[çc]a[^.]*pela\s+boca|nada\s+pela\s+boca/i);
  });

  it("o fechamento manda ao medico e a urgencia, nao a um agendamento", () => {
    const blocos = artigo().content;
    const ultimo = blocos[blocos.length - 1];
    expect(ultimo, "ultimo bloco nao e a ressalva medica").toMatch(
      /n[aã]o\s+substitui\s+consulta\s+m[eé]dica/i
    );
    expect(ultimo, "a ressalva final nao remete a urgencia").toMatch(/urg[eê]ncia/i);
  });

  it("nenhuma imagem de dominio de terceiro", () => {
    // O HTML de origem servia as fotos de api.airticles.ai. Imagem de CDN
    // alheio quebra sozinha e ja foi corrigida antes no og:image (#25).
    const bruto = JSON.stringify(artigo());
    expect(bruto, "imagem hospedada fora do dominio proprio").not.toMatch(
      /airticles\.ai|cloudfront\.net/i
    );
  });

  it("nao promete resultado nem diagnostico pelo artigo", () => {
    // "\bcura\b" e nao "cura\b": sem a fronteira da esquerda, casa com
    // "proCURA" em "o medico procura tres coisas juntas".
    const vedado = [
      /garantimos/i,
      /diagn[oó]stico\s+(garantido|imediato)/i,
      /\bcura\b/i,
      /sem\s+risco/i,
    ];
    const texto = corpo();
    expect(vedado.filter((r) => r.test(texto)).map(String)).toEqual([]);
  });
});

describe("GUARD-RAIL: rota de primeiro nivel responde 200 em PRODUCAO (out/2026)", () => {
  // /outubro-rosa entrou no ar em 18/10/2026 devolvendo 404 — com a pagina
  // inteira no corpo da resposta. O sitemap a listava, o bundle tinha o chunk,
  // o conteudo aparecia. So o status estava errado, que e o unico pedaco que o
  // Google e o Google Ads leem para decidir se a URL existe.
  //
  // A causa: resolveHttpStatus trata caminho de primeiro nivel como slug de
  // artigo AutoSEO. Quando `knownAutoSeoSlugs` vem carregado (producao), um
  // caminho que nao esta em CLIENT_ROUTES e nao e artigo cai em 404.
  //
  // POR QUE A TRAVA DA #62 NAO PEGOU: ela chamava resolveHttpStatus(path, blog)
  // com DOIS argumentos. Sem o terceiro, a funcao entra no ramo
  // `if (!knownAutoSeoSlugs) return 200` — que existe para o boot com banco
  // fora do ar. O teste exercitava o caminho degradado e nunca o de producao.
  // Verde que nao provava nada.
  //
  // Esta trava cobre a CLASSE: toda rota de primeiro nivel declarada em
  // routes-metadata, nao so a que quebrou.
  const AUTOSEO_CARREGADO = new Set(["artigo-autoseo-de-exemplo"]);

  const primeiroNivel = () =>
    getAllRoutes()
      .map((r) => new URL(r.canonical).pathname)
      .filter((p) => /^\/[a-z0-9-]+$/i.test(p));

  it("existe rota de primeiro nivel para cobrir (o teste nao e vacuo)", () => {
    expect(primeiroNivel().length).toBeGreaterThan(3);
  });

  it("toda rota de primeiro nivel do sitemap responde 200 com AutoSEO carregado", () => {
    const blog = getKnownBlogSlugs();
    const quebradas = primeiroNivel().filter(
      (p) => resolveHttpStatus(p, blog, AUTOSEO_CARREGADO) !== 200
    );
    expect(
      quebradas,
      "rota anunciada no sitemap que devolve 404 em producao — falta em CLIENT_ROUTES"
    ).toEqual([]);
  });

  it("o 200 nao vem do ramo degradado: vale com e sem AutoSEO carregado", () => {
    // Se alguem "consertar" removendo o terceiro argumento, isto quebra.
    const blog = getKnownBlogSlugs();
    for (const p of primeiroNivel()) {
      expect(resolveHttpStatus(p, blog, AUTOSEO_CARREGADO), `${p} com AutoSEO carregado`).toBe(200);
      expect(resolveHttpStatus(p, blog, null), `${p} com AutoSEO fora do ar`).toBe(200);
    }
  });

  it("caminho de primeiro nivel inexistente continua 404", () => {
    // A trava acima nao pode ser satisfeita devolvendo 200 para tudo.
    expect(resolveHttpStatus("/pagina-que-nunca-existiu", getKnownBlogSlugs(), AUTOSEO_CARREGADO)).toBe(404);
  });
});
