import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Necessario atras do Phusion Passenger / Apache
  app.set("trust proxy", true);
  app.disable("x-powered-by");

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  // Cache HTTP otimizado para Core Web Vitals
  // - Assets com hash (Vite output): 1 ano imutavel (immutable)
  // - Imagens estaticas: 30 dias
  // - Fonts: 1 ano imutavel
  // - HTML: 5 min com revalidacao
  app.use(
    express.static(staticPath, {
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        // Assets com hash no nome (ex: index-DfE64Xuc.js, index-D3f0rPfq.css)
        if (/-[A-Za-z0-9_-]{8,}\.(?:js|css|woff2?|ttf|otf)$/.test(filePath)) {
          res.setHeader(
            "Cache-Control",
            "public, max-age=31536000, immutable"
          );
        }
        // Outras fonts (sem hash)
        else if (/\.(?:woff2?|ttf|otf|eot)$/.test(filePath)) {
          res.setHeader(
            "Cache-Control",
            "public, max-age=31536000, immutable"
          );
        }
        // Imagens
        else if (/\.(?:png|jpe?g|webp|avif|svg|gif|ico)$/i.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=2592000"); // 30 dias
        }
        // HTML (incluindo /index.html)
        else if (/\.html$/.test(filePath)) {
          res.setHeader(
            "Cache-Control",
            "public, max-age=300, must-revalidate"
          ); // 5 min
        }
      },
    })
  );

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=300, must-revalidate");
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
