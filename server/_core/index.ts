import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import compression from "compression";
import type { Request, Response, NextFunction } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { syncAutoSeoArticles } from "./syncAutoSeo";
import { weeklyMonitoringHandler } from "./monitoring-handler";
import { generateSitemap } from "./sitemap-handler";
import { registerTagGateway } from "./tag-gateway";
import { getLegacyRedirect, isGone } from "./legacy-redirects";
import { refreshAutoSeoSlugs } from "./autoseo-slugs";

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

  // Carrega os slugs de artigo AutoSEO publicados antes de comecar a responder.
  // Enquanto essa lista nao existir, qualquer caminho de primeiro nivel volta
  // 200 (soft 404). Falha nao derruba o boot — o cache fica null e o
  // comportamento antigo permanece.
  void refreshAutoSeoSlugs();
  // Canonical host redirect — force https://totalquality.med.br (non-www)
  // Combines:
  //   - www → apex (www.totalquality.med.br → totalquality.med.br)
  //   - http → https (when behind a reverse proxy that forwards X-Forwarded-Proto)
  // Goal: consolidate all traffic on a single canonical host for analytics
  // (Google Analytics, Facebook/Meta Pixel, TikTok Pixel, Instagram, etc.)
  app.set("trust proxy", 1);

  /*
   * Cabecalhos de seguranca. Ate 06/09/2026 nao havia nenhum.
   *
   * Escritos a mao, sem helmet, para nao acrescentar dependencia a um projeto
   * que ja carrega peso morto — sao cinco cabecalhos, nao vale um pacote.
   *
   * SEM Content-Security-Policy DE PROPOSITO. Uma CSP mal calibrada aqui nao
   * quebra a pagina de forma visivel: ela mata silenciosamente o GTM, o GA4, o
   * Meta e as fontes, e a medicao para sem ninguem perceber. Fazer isso direito
   * exige inventariar todas as origens que o contêiner carrega (que mudam pelo
   * painel, fora deste repositorio) e validar em Report-Only antes de impor.
   * Fica registrado como trabalho proprio, nao como esquecimento.
   */
  app.use((req, res, next) => {
    // Nao adivinhar o tipo de um arquivo pelo conteudo.
    res.setHeader("X-Content-Type-Options", "nosniff");
    // Ninguem enquadra o site numa pagina de terceiro (clickjacking).
    res.setHeader("X-Frame-Options", "DENY");
    // O referenciador sai com origem, nunca com o caminho: URL de exame e
    // dado de saude e nao pode vazar para terceiro pelo Referer.
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    // Recursos que o site nao usa ficam desligados por padrao.
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=(), payment=(), usb=()",
    );
    // HSTS so em producao e so sobre HTTPS, para nao travar o preview local.
    if (
      process.env.NODE_ENV === "production" &&
      (req.protocol === "https" || req.get("X-Forwarded-Proto") === "https")
    ) {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  });
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

  // Redirecionamentos de URLs legadas conhecidas pelo Google (auditoria do
  // Search Console): 301 para o equivalente atual, 410 para artefatos de link
  // quebrado. Precisa vir antes do catch-all da SPA, senao viram soft 404.
  app.use((req, res, next) => {
    const pathname = req.path;

    if (isGone(pathname)) {
      return res.status(410).type("text/plain").send("Gone");
    }

    const destination = getLegacyRedirect(pathname);
    if (destination) {
      const query = req.originalUrl.slice(req.path.length);
      return res.redirect(301, `${destination}${destination.includes("#") ? "" : query}`);
    }

    next();
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

  // Adicionar compressão gzip/brotli para melhorar performance
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req: Request, res: Response) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  }));

  // Gateway da tag do Google (proxy first-party /metrics -> fps.goog).
  // PRECISA vir antes dos body parsers: os POSTs de medicao sao encaminhados
  // como stream bruto — express.json consumiria o corpo antes do proxy.
  registerTagGateway(app);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // AutoSEO Webhook endpoint
  /*
   * ENDPOINT DO WEBHOOK DO AUTOSEO — REMOVIDO EM 06/09/2026.
   *
   * A rota POST /api/webhooks/autoseo criava e publicava artigos no site. Seu
   * token estava em texto claro no repositorio (corrigido no PR #13), mas
   * remover do HEAD nao desfaz a exposicao: o valor segue no historico do git.
   *
   * O Alex informou que nao usa o AutoSEO. Com a ferramenta fora de uso, a rota
   * era superficie de ataque sem contrapartida — e removida ela vale mais que
   * rotacionada, porque o token vazado deixa de autenticar qualquer coisa.
   *
   * Para religar: reintroduzir a rota, marcar AUTOSEO_ATIVO = true em
   * _core/autoseo-slugs.ts e gerar um token NOVO. Nunca reaproveitar o antigo.
   */

  // Weekly Monitoring endpoint
  app.post("/api/scheduled/weekly-monitoring", weeklyMonitoringHandler);

  // Sitemap.xml endpoint
  app.get("/sitemap.xml", (_req, res) => {
    const sitemap = generateSitemap();
    res.set({ "Content-Type": "application/xml" }).send(sitemap);
  });

  // Robots.txt endpoint
  app.get("/robots.txt", (_req, res) => {
    // GPTBot/CCBot liberados de propósito: a clínica já aparece em respostas de
    // LLMs (3 prompts registrados no SEMrush) e esse canal só cresce. Não voltar
    // a bloquear crawlers de IA sem decisão explícita do negócio.
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /dashboard
Disallow: /metrics
Disallow: /*?q=

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
