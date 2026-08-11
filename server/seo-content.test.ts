import { describe, expect, it } from "vitest";
import {
  CONVENIOS,
  getSeoContentForPath,
  injectSeoContent,
  resolveHttpStatus,
} from "./_core/seo-content";
import { CONVENIOS as CONVENIOS_CLIENT } from "@/lib/conveniosData";
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
    expect((indexHtml.match(/"opens": "07:30"/g) || []).length).toBe(2);
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
    expect(getLegacyRedirect("/medicos")).toBe("/");
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
    expect(CONVENIOS.length).toBeGreaterThanOrEqual(10);
  });

  it("todo convenio da lista aparece no HTML pre-renderizado", () => {
    const html = getSeoContentForPath("/convenios")!;
    for (const convenio of CONVENIOS) {
      expect(html, `convenio ${convenio} sumiu da pagina`).toContain(convenio);
    }
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
        if (!line.includes("wa.me")) return;
        const janela = lines.slice(Math.max(0, i - 6), i + 7).join("\n");
        if (!/track(WhatsApp|Schedule|Card|Lead)/.test(janela)) {
          problemas.push(`${rel}:${i + 1}: CTA de WhatsApp sem tracking`);
        }
      });
    }
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
  it.each(["/", "/laboratorio-caraguatatuba", "/exames/exames-de-sangue", "/exames/hemograma", "/convenios"])(
    "%s afirma o atendimento por ordem de chegada",
    (route) => {
      const html = getSeoContentForPath(route)!;
      expect(html).toMatch(/ordem de chegada|sem agendamento|n[ãa]o [ée] necess[áa]rio agendamento/i);
    }
  );
});
