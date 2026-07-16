import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { syncAutoSeoArticles } from "./syncAutoSeo";
import { validateWebhookToken, processAutoSeoWebhook, processAutoSeoWebhookBatch } from "./autoseoWebhook";
import { weeklyMonitoringHandler } from "./monitoring-handler";
import { generateSitemap } from "./sitemap-handler";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

/**
 * Configura sincronização automática de artigos do AutoSEO
 * Executa 1x ao dia às 2:00 AM (horário do servidor)
 */
function setupAutoSeoSync() {
  // Calcular tempo até a próxima execução (2:00 AM)
  const now = new Date();
  const nextRun = new Date();
  nextRun.setHours(2, 0, 0, 0);

  // Se já passou das 2:00 AM hoje, agendar para amanhã
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  const delayMs = nextRun.getTime() - now.getTime();
  console.log(`[AutoSEO] Próxima sincronização agendada para ${nextRun.toISOString()}`);

  // Agendar primeira sincronização
  setTimeout(() => {
    console.log("[AutoSEO] Iniciando sincronização automática...");
    syncAutoSeoArticles().then(result => {
      console.log(`[AutoSEO] Sincronização concluída:`, result);
    }).catch(error => {
      console.error("[AutoSEO] Erro na sincronização:", error);
    });

    // Agendar sincronizações subsequentes a cada 24 horas
    setInterval(() => {
      console.log("[AutoSEO] Iniciando sincronização automática...");
      syncAutoSeoArticles().then(result => {
        console.log(`[AutoSEO] Sincronização concluída:`, result);
      }).catch(error => {
        console.error("[AutoSEO] Erro na sincronização:", error);
      });
    }, 24 * 60 * 60 * 1000); // 24 horas em ms
  }, delayMs);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Canonical host redirect — force https://totalquality.med.br (non-www)
  // Combines:
  //   - www → apex (www.totalquality.med.br → totalquality.med.br)
  //   - http → https (when behind a reverse proxy that forwards X-Forwarded-Proto)
  // Goal: consolidate all traffic on a single canonical host for analytics
  // (Google Analytics, Facebook/Meta Pixel, TikTok Pixel, Instagram, etc.)
  app.set("trust proxy", 1);
  app.use((req, res, next) => {
    // Skip in development so localhost previews keep working
    if (process.env.NODE_ENV !== "production") return next();

    const host = (req.headers.host || "").toLowerCase();
    // Check for HTTPS: either proto is https OR X-Forwarded-Proto header is https
    const isHttps = req.protocol === "https" || req.get("X-Forwarded-Proto") === "https";

    // Only enforce on the production domain — preview / staging hosts pass through
    const isProductionDomain =
      host === "totalquality.med.br" || host === "www.totalquality.med.br";
    if (!isProductionDomain) return next();

    // Check if already on canonical domain with HTTPS
    const isCanonical = host === "totalquality.med.br" && isHttps;
    if (isCanonical) return next();

    // Redirect to canonical domain (without www) and ensure HTTPS
    return res.redirect(
      301,
      `https://totalquality.med.br${req.originalUrl}`
    );
  });

  // CWV Optimization: Cache headers para assets estáticos
  // Imagens, fonts, CSS, JS devem ser cacheados por longo tempo
  app.use((req, res, next) => {
    // Skip em desenvolvimento
    if (process.env.NODE_ENV !== "production") return next();

    // Cache imagens por 1 ano (assets imutáveis)
    if (req.path.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
      res.set("Cache-Control", "public, max-age=31536000, immutable");
    }
    // Cache fonts por 1 ano
    else if (req.path.match(/\.(woff|woff2|ttf|eot)$/i)) {
      res.set("Cache-Control", "public, max-age=31536000, immutable");
    }
    // Cache CSS/JS por 1 ano (vite adiciona hash no nome)
    else if (req.path.match(/\.(css|js)$/i)) {
      res.set("Cache-Control", "public, max-age=31536000, immutable");
    }
    // HTML: cache curto (5 minutos) para permitir atualizações
    else if (req.path.endsWith(".html") || req.path === "/") {
      res.set("Cache-Control", "public, max-age=300, must-revalidate");
    }
    // API: sem cache
    else if (req.path.startsWith("/api/")) {
      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    }

    next();
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // AutoSEO Webhook endpoint
  app.post("/api/webhooks/autoseo", express.json(), async (req, res) => {
    try {
      // Validar Bearer Token
      const authHeader = req.headers.authorization;
      if (!validateWebhookToken(authHeader)) {
        return res.status(401).json({
          success: false,
          message: "Token de autorizacao invalido ou ausente",
        });
      }

      // Processar webhook
      const { articles } = req.body;

      if (!articles || !Array.isArray(articles)) {
        return res.status(400).json({
          success: false,
          message: "Campo 'articles' eh obrigatorio e deve ser um array",
        });
      }

      // Se eh um unico artigo, converter para array
      const articlesToProcess = Array.isArray(articles) ? articles : [articles];

      // Processar em batch
      const result = await processAutoSeoWebhookBatch(articlesToProcess);

      console.log(`[AutoSEO Webhook] Processados ${result.processed} artigos, ${result.failed} falharam`);

      return res.status(result.success ? 200 : 207).json({
        success: result.success,
        processed: result.processed,
        failed: result.failed,
        errors: result.errors.length > 0 ? result.errors : undefined,
        message: result.success
          ? `${result.processed} artigo(s) sincronizado(s) com sucesso`
          : `${result.processed} artigo(s) sincronizado(s), ${result.failed} falharam`,
      });
    } catch (error) {
      console.error("[AutoSEO Webhook] Erro ao processar webhook:", error);
      return res.status(500).json({
        success: false,
        message: `Erro ao processar webhook: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      });
    }
  });

  // Weekly Monitoring endpoint
  app.post("/api/scheduled/weekly-monitoring", weeklyMonitoringHandler);

  // Sitemap.xml endpoint
  app.get("/sitemap.xml", (_req, res) => {
    const sitemap = generateSitemap();
    res.set({ "Content-Type": "application/xml" }).send(sitemap);
  });

  // Robots.txt endpoint
  app.get("/robots.txt", (_req, res) => {
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /dashboard

User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

Sitemap: https://totalquality.med.br/sitemap.xml`;
    res.set({ "Content-Type": "text/plain" }).send(robotsTxt);
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  // Configurar sincronização automática de AutoSEO
  setupAutoSeoSync();
}

startServer().catch(console.error);
