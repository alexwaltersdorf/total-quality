import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { getKnownBlogSlugs, getRouteMetadata, injectMetaTags } from "./routes-metadata";
import { getKnownAutoSeoSlugs } from "./autoseo-slugs";
import { getSeoContentForPath, injectSeoContent, resolveHttpStatus } from "./seo-content";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      // Injetar meta tags dinâmicas por rota
      const pathname = new URL(url, "http://localhost").pathname;
      const metadata = getRouteMetadata(pathname);
      if (metadata) {
        template = injectMetaTags(template, metadata);
      }

      // Injetar conteúdo SEO pré-renderizado dentro do #root
      const seoContent = getSeoContentForPath(pathname);
      if (seoContent) {
        template = injectSeoContent(template, seoContent);
      }

      const page = await vite.transformIndexHtml(url, template);
      const status = resolveHttpStatus(pathname, getKnownBlogSlugs(), getKnownAutoSeoSlugs());
      res.status(status).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // `index: false` e essencial: por padrao o express.static responde "/" com o
  // index.html cru, curto-circuitando o catch-all abaixo. Com isso a HOME — a
  // pagina mais importante do site — era servida com o <div id="root"> VAZIO,
  // sem meta tags por rota e sem conteudo pre-renderizado, enquanto todas as
  // outras rotas recebiam tudo. Descoberto em 01/08/2026 por curl na home.
  app.use(express.static(distPath, { index: false }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    let html = fs.readFileSync(indexPath, "utf-8");

    // Injetar meta tags dinâmicas por rota
    const pathname = new URL(req.originalUrl, "http://localhost").pathname;
    const metadata = getRouteMetadata(pathname);
    if (metadata) {
      html = injectMetaTags(html, metadata);
    }

    // Injetar conteúdo SEO pré-renderizado dentro do #root
    const seoContent = getSeoContentForPath(pathname);
    if (seoContent) {
      html = injectSeoContent(html, seoContent);
    }

    // Rotas inexistentes devolvem 404 real (corrige soft-404)
    const status = resolveHttpStatus(pathname, getKnownBlogSlugs(), getKnownAutoSeoSlugs());
    res.status(status).set({ "Content-Type": "text/html" }).send(html);
  });
}
