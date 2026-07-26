import { describe, expect, it } from "vitest";
import {
  getSeoContentForPath,
  injectSeoContent,
  resolveHttpStatus,
} from "./_core/seo-content";
import { getKnownBlogSlugs } from "./_core/routes-metadata";

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
    expect(resolveHttpStatus("/admin/leads", blogSlugs)).toBe(200);
    expect(
      resolveHttpStatus("/blog/hemograma-caraguatatuba", blogSlugs)
    ).toBe(200);
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
