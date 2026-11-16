import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getLegacyRedirect, isGone, LEGACY_REDIRECTS } from "./_core/legacy-redirects";
import {
  getAllRoutes,
  getKnownBlogSlugs,
  getRouteMetadata,
  injectMetaTags,
  injectNotFoundMeta,
  LCP_MARCADOR,
} from "./_core/routes-metadata";
import { generateSitemap } from "./_core/sitemap-handler";
import { notFoundHtml, resolveHttpStatus } from "./_core/seo-content";
import { conteudoDaRota } from "@/lib/paginasCatalogo";

/*
 * SEO nov/2026, Fase 6 — correcoes tecnicas (plano aprovado pelo Alex em
 * 14/11/2026, docs/seo-plano.md §8). O comportamento HTTP (um salto so, barra
 * final, cache) e conferido com curl contra o servidor de producao local; aqui
 * ficam as travas do que mora nos dados e nas funcoes puras.
 */
const raiz = resolve(import.meta.dirname, "..");
const ler = (p: string) => readFileSync(resolve(raiz, p), "utf-8");
const TEMPLATE = ler("client/index.html");
const blog = getKnownBlogSlugs();
const status = (p: string) => resolveHttpStatus(p, blog, new Set());

describe("GUARD-RAIL: 301 de URLs antigas do blog (Fase 6)", () => {
  const CASOS: Array<[string, string]> = [
    ["/posts/hipoglicemia-o-que-voce-precisa-saber-para-manter-sua-saude-em-dia", "/blog/hipoglicemia-sintomas-e-exames"],
    ["/posts/hemograma-completo-o-que-ele-pode-revelar", "/blog/hemograma-completo-o-que-avalia"],
    ["/posts/hormonios-do-amor-o-que-sao-e-como-agem", "/blog"],
    ["/posts/tirzepatida-exames-de-acompanhamento-e-alerta-da-anvisa-sobre-falsificacao", "/blog"],
    ["/posts/ultrassom-de-tireoide-para-que-serve-e-como-e-feito", "/blog"],
    ["/posts/qualquer-outro-artigo", "/blog"],
    ["/posts", "/blog"],
    ["/category/saude", "/blog"],
    ["/category/blog", "/blog"],
  ];
  it.each(CASOS)("%s → %s", (de, para) => {
    expect(getLegacyRedirect(de)).toBe(para);
    expect(getLegacyRedirect(`${de}/`)).toBe(para);
  });

  it("todo destino de 301 existe (200) e nao redireciona de novo — um salto so", () => {
    for (const [de, para] of Object.entries(LEGACY_REDIRECTS)) {
      const destino = para.split("#")[0] || "/";
      expect(getLegacyRedirect(destino), `${de} → ${para} redireciona de novo`).toBeNull();
      expect(isGone(destino)).toBe(false);
      expect(status(destino), `${de} → ${para}`).toBe(200);
    }
  });
});

describe("GUARD-RAIL: sitemap (Fase 6)", () => {
  const xml = generateSitemap();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);

  it("toda URL do sitemap responde 200, sem 301/410 e sem barra final", () => {
    expect(urls.length).toBeGreaterThan(40);
    for (const u of urls) {
      expect(getLegacyRedirect(u), `${u} redireciona`).toBeNull();
      expect(isGone(u)).toBe(false);
      expect(status(u), u).toBe(200);
      if (u !== "/") expect(u.endsWith("/"), u).toBe(false);
    }
  });

  it("todas as URLs com lastmod real (nao a data do dia para todas)", () => {
    const blocos = xml.split("<url>").slice(1);
    for (const b of blocos) expect(b, b.slice(0, 80)).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
    const datas = new Set([...xml.matchAll(/<lastmod>([^<]+)</g)].map((m) => m[1]));
    expect(datas.size).toBeGreaterThan(3);
    // Pagina do modelo: o atualizadoEm do proprio dado.
    const hemo = blocos.find((b) => b.includes("/exames/hemograma<"))!;
    expect(hemo).toContain(`<lastmod>${conteudoDaRota("/exames/hemograma")!.atualizadoEm}</lastmod>`);
  });

  it("paginas novas entram (especialidades, cardiologista, pediatra, sobre, contato)", () => {
    for (const u of ["/especialidades", "/especialidades/cardiologista", "/especialidades/pediatra", "/sobre", "/contato"]) {
      expect(urls).toContain(u);
    }
    expect(urls).not.toContain("/outubro-rosa");
  });
});

describe("GUARD-RAIL: pagina 404 (Fase 6)", () => {
  it("noindex, sem canonical e titulo em portugues", () => {
    const html = injectNotFoundMeta(TEMPLATE);
    expect(html).toContain('<meta name="robots" content="noindex, follow"');
    expect(html).not.toMatch(/<link rel="canonical"/);
    expect(html).not.toMatch(/og:url/);
    expect(html).toContain("<title>Página não encontrada | Total Quality</title>");
  });

  it("texto em portugues com links para exames, especialidades, blog e home", () => {
    const html = notFoundHtml();
    expect(html).toContain("<h1>Página não encontrada</h1>");
    for (const href of ["/exames", "/especialidades", "/blog", "/"]) expect(html).toContain(`<a href="${href}">`);
    const react = ler("client/src/pages/NotFound.tsx");
    expect(react).not.toMatch(/Page Not Found|Go Home/);
    expect(react).toContain("noindex, follow");
  });

  it("rota inexistente segue 404", () => {
    expect(status("/exames/nao-existe")).toBe(404);
    expect(status("/blog/nao-existe")).toBe(404);
    expect(status("/a/b/c")).toBe(404);
  });
});

describe("GUARD-RAIL: <head> enxuto (Fase 6)", () => {
  it("sem <meta name=keywords> no template e em nenhuma rota", () => {
    expect(TEMPLATE).not.toMatch(/name="keywords"/);
    for (const r of getAllRoutes()) {
      expect(injectMetaTags(TEMPLATE, r)).not.toMatch(/name="keywords"/);
    }
  });

  it("preload da foto LCP (recepcao-1024.avif) so na home", () => {
    expect(TEMPLATE).toContain(LCP_MARCADOR);
    expect(TEMPLATE).not.toMatch(/rel="preload"[^>]*recepcao-1024\.avif/);
    expect(injectMetaTags(TEMPLATE, getRouteMetadata("/")!)).toMatch(/rel="preload" as="image" type="image\/avif" href="\/images\/recepcao-1024\.avif"/);
    for (const r of ["/exames/hemograma", "/blog", "/sobre"]) {
      expect(injectMetaTags(TEMPLATE, getRouteMetadata(r)!)).not.toContain("recepcao-1024.avif");
    }
  });

  it("favicon quadrado, apple-touch-icon e manifest existem e estao no <head>", () => {
    for (const f of ["favicon.ico", "favicon-48x48.png", "favicon-96x96.png", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "site.webmanifest"]) {
      expect(existsSync(resolve(raiz, "client/public", f)), f).toBe(true);
    }
    const manifest = JSON.parse(ler("client/public/site.webmanifest"));
    expect(manifest.name).toBe("Total Quality");
    expect(manifest.theme_color).toBe("#9B212B");
    expect(manifest.icons.map((i: { sizes: string }) => i.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));
    expect(TEMPLATE).toContain('<link rel="icon" href="/favicon.ico"');
    expect(TEMPLATE).toContain('<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"');
    expect(TEMPLATE).toContain('<link rel="manifest" href="/site.webmanifest"');
  });

  it("og:image da pagina de servico e a foto real dela, com dimensoes reais", () => {
    for (const r of getAllRoutes()) {
      const path = new URL(r.canonical).pathname;
      const img = conteudoDaRota(path)?.imagem;
      if (!img) continue;
      expect(r.ogImage, path).toBe(`https://totalquality.med.br/images/${img.slug}-1024.webp`);
      expect(existsSync(resolve(raiz, `client/public/images/${img.slug}-1024.webp`)), path).toBe(true);
      expect(r.ogImageWidth).toBe(1024);
      expect(r.ogImageHeight).toBe(Math.round((1024 * img.height) / img.width));
    }
  });

  it("llms.txt tem as paginas da Fase 3 e nao tem a campanha encerrada", () => {
    const llms = ler("client/public/llms.txt");
    for (const u of ["/especialidades)", "/especialidades/cardiologista", "/especialidades/pediatra"]) expect(llms).toContain(u);
    expect(llms).not.toMatch(/outubro/i);
  });
});
