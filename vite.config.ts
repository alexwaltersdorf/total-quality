import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
