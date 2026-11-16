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
  /*
   * Redirecionamento em UM salto so (SEO nov/2026, Fase 6). Antes eram dois
   * middlewares — host canonico (www → apex, http → https) e URLs legadas — e
   * a barra final nao era tratada: /exames/ e /exames/hemograma/ respondiam
   * 200 com o mesmo conteudo da forma sem barra. Agora o destino final e
   * calculado de uma vez — host canonico + caminho sem barra final + destino
   * legado — e sai um unico 301, com a query string preservada.
   *
   * O salto http → https que a CDN da Hostinger faz ANTES de o pedido chegar
   * aqui (mantendo o www) e configuracao do hPanel, fora do repositorio.
   */
  const ORIGEM_CANONICA = "https://totalquality.med.br";
  // A barra final faz parte destes caminhos (gateway da tag em /metrics/, API).
  const BARRA_FINAL_E_DO_CAMINHO = /^\/(metrics|api)(\/|$)/;
  app.use((req, res, next) => {
    const pathname = req.path;

    // URLs legadas que respondem 410 Gone (antes de qualquer redirecionamento).
    if (isGone(pathname)) {
      return res.status(410).type("text/plain").set("Cache-Control", "no-cache").send("Gone");
    }

    const host = (req.headers.host || "").toLowerCase();
    // Host canonico so em producao e so no dominio de producao — preview,
    // staging e localhost passam.
    const dominioProducao =
      process.env.NODE_ENV === "production" &&
      (host === "totalquality.med.br" || host === "www.totalquality.med.br");
    const isHttps = req.protocol === "https" || req.get("X-Forwarded-Proto") === "https";
    const hostErrado = dominioProducao && !(host === "totalquality.med.br" && isHttps);

    let destino = pathname;
    if (pathname.length > 1 && pathname.endsWith("/") && !BARRA_FINAL_E_DO_CAMINHO.test(pathname)) {
      destino = pathname.replace(/\/+$/, "") || "/";
    }
    const legado = getLegacyRedirect(destino);
    if (legado) destino = legado;

    if (destino === pathname && !hostErrado) return next();

    const query = req.originalUrl.slice(req.path.length);
    const origem = dominioProducao ? ORIGEM_CANONICA : "";
    return res.redirect(301, `${origem}${destino}${destino.includes("#") ? "" : query}`);
  });

  // CWV Optimization: Cache headers para assets estáticos
  // Imagens, fonts, CSS, JS devem ser cacheados por longo tempo
  app.use((req, res, next) => {
    // Skip em desenvolvimento
    if (process.env.NODE_ENV !== "production") return next();

    // Fase 6 (15/11/2026): este cabecalho e definido ANTES de se saber se o
    // arquivo existe. Um arquivo que nao existe cai no catch-all da SPA
    // (vite.ts), que responde 404 e troca o cabecalho por "no-cache" — antes o
    // 404 do /favicon.ico saia "immutable" por 1 ano.
    //
    // Cache imagens por 1 ano (AVIF entrou em 15/11/2026: a foto LCP da home
    // e .avif e saia com max-age=0)
    if (req.path.match(/\.(png|jpg|jpeg|gif|webp|avif|svg)$/i)) {
      res.set("Cache-Control", "public, max-age=31536000, immutable");
    }
    // Icone e manifesto: nome fixo, sem hash — cache de 1 dia.
    else if (req.path.match(/\.(ico|webmanifest)$/i)) {
      res.set("Cache-Control", "public, max-age=86400");
    }
    // Cache fonts por 1 ano
    else if (req.path.match(/\.(woff|woff2|ttf|eot)$/i)) {
      res.set("Cache-Control", "public, max-age=31536000, immutable");
    }
    // CSS/JS com hash do Vite (/assets/): 1 ano, imutavel. Fora de /assets o
    // nome nao muda a cada build — cache de 1 hora.
    else if (req.path.match(/\.(css|js)$/i)) {
      res.set(
        "Cache-Control",
        req.path.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "public, max-age=3600"
      );
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
