import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

/**
 * P1.2 — tira a folha de estilo principal do caminho de renderizacao.
 *
 * O primeiro paint do site e o bloco pre-renderizado que o servidor injeta em
 * `<div id="root">` (server/_core/seo-content.ts), e ele ja tem estilo proprio
 * inline no <head> — nao depende desta folha. Mesmo assim o <link rel=stylesheet>
 * que o Vite injeta bloqueava esse paint por ~20 KB gzip.
 *
 * O padrao abaixo (preload + troca para stylesheet no onload) mantem a
 * prioridade alta do download, mas sem bloquear o paint. O React so monta depois
 * do bundle de JS (126 KB gzip contra 20 KB do CSS, ambos no mesmo dominio e
 * pedidos juntos), entao a folha chega bem antes de haver app para pintar.
 *
 * O <noscript> garante a folha para quem tem JS desligado.
 */
function nonBlockingCss(): Plugin {
  return {
    name: "total-quality:non-blocking-css",
    // `post` para rodar depois que o Vite ja injetou as tags de asset
    enforce: "post",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="stylesheet"([^>]*?)href="([^"]+)"([^>]*?)>/g,
        (_match, before, href, after) =>
          `<link rel="preload" as="style"${before}href="${href}"${after} ` +
          `onload="this.onload=null;this.rel='stylesheet'">` +
          `<noscript><link rel="stylesheet"${before}href="${href}"${after}></noscript>`
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), nonBlockingCss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
    // Medicoes de jul/2026, para nao refazerem o teste:
    //
    // `target`: fica no padrao do Vite 7 (baseline-widely-available). Forcar
    // es2022 gerou um bundle byte a byte identico (432,35 KB / 126,57 KB gzip)
    // — a saida ja e moderna e nao ha polyfill algum nela. O aviso de "legacy
    // JavaScript" do PageSpeed vem dos scripts de terceiros (GTM, gtag, Pixel),
    // nao do nosso codigo.
    //
    // `sourcemap`: deixado desligado de proposito. Ligar acrescenta 26 MB de
    // .map a um bundle de 15 MB (quase o triplo do artefato de deploy), quase
    // tudo de chunks de linguagem do shiki que ninguem depura. O audit
    // `valid-source-maps` do Lighthouse e diagnostico e nao entra na nota.
    // Para investigar o bundle, rode `npx vite build --sourcemap` pontualmente.
    // Sem manualChunks: com as rotas em React.lazy (App.tsx), o Rollup divide o
    // bundle pelos proprios dynamic imports — Admin/Dashboard/recharts saem do
    // chunk inicial. O manualChunks anterior nao surtia efeito (react-vendor ~5KB)
    // porque todas as paginas eram importadas estaticamente no entry.
  },
  server: {
    host: true,
    fs: {
      strict: true,
      deny: ["**/..*"],
    },
  },
});
