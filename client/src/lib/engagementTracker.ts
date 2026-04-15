/**
 * Engagement Tracker — Rastreia tempo de página, scroll depth e quartis de visualização.
 * Envia dados para a API de page_views e analytics.
 */

const SESSION_KEY = "tq_session_id";

function getSessionId(): string {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

interface PageTrackState {
  page: string;
  title: string;
  enteredAt: number;
  maxScrollDepth: number;
  quartilsSent: Set<number>;
  intervalId: ReturnType<typeof setInterval> | null;
}

let currentPage: PageTrackState | null = null;

/**
 * Calcula o scroll depth atual (0-100).
 */
function getScrollDepth(): number {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  );
  const winHeight = window.innerHeight;
  if (docHeight <= winHeight) return 100;
  return Math.min(100, Math.round((scrollTop / (docHeight - winHeight)) * 100));
}

/**
 * Envia dados de page view para a API.
 */
async function sendPageView(data: Record<string, unknown>) {
  try {
    await fetch("/api/trpc/analytics.trackPageView", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ json: data }),
    });
  } catch {
    // Silently fail
  }
}

/**
 * Envia evento de quartil de tempo de visualização.
 */
async function sendTimeQuartile(quartile: number, page: string, durationMs: number) {
  try {
    await fetch("/api/trpc/analytics.track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        json: {
          eventName: `time_on_page_${quartile}pct`,
          eventCategory: "engagement",
          eventData: { page, durationMs, quartile },
          page,
          sessionId: getSessionId(),
        },
      }),
    });
  } catch {
    // Silently fail
  }
}

/**
 * Verifica e envia quartis de tempo de visualização.
 * Tempo esperado por página: 60 segundos (configurável).
 */
function checkTimeQuartiles(expectedDurationMs: number = 60000) {
  if (!currentPage) return;

  const elapsed = Date.now() - currentPage.enteredAt;
  const quartiles = [25, 50, 75, 100];

  for (const q of quartiles) {
    const threshold = (q / 100) * expectedDurationMs;
    if (elapsed >= threshold && !currentPage.quartilsSent.has(q)) {
      currentPage.quartilsSent.add(q);
      sendTimeQuartile(q, currentPage.page, elapsed);
    }
  }
}

/**
 * Inicia o rastreamento de uma página.
 * Deve ser chamado quando o usuário entra em uma nova página.
 */
export function startPageTracking(page?: string, title?: string) {
  // Finalizar tracking anterior
  if (currentPage) {
    endPageTracking();
  }

  const now = Date.now();
  currentPage = {
    page: page || window.location.pathname,
    title: title || document.title,
    enteredAt: now,
    maxScrollDepth: 0,
    quartilsSent: new Set(),
    intervalId: null,
  };

  // Registrar page view
  sendPageView({
    sessionId: getSessionId(),
    page: currentPage.page,
    title: currentPage.title,
    durationMs: 0,
    scrollDepthPct: 0,
  });

  // Listener de scroll
  const handleScroll = () => {
    if (currentPage) {
      const depth = getScrollDepth();
      if (depth > currentPage.maxScrollDepth) {
        currentPage.maxScrollDepth = depth;
      }
    }
  };
  window.addEventListener("scroll", handleScroll, { passive: true });

  // Verificar quartis a cada 5 segundos
  currentPage.intervalId = setInterval(() => checkTimeQuartiles(), 5000);

  // Cleanup ao sair da página
  const cleanup = () => {
    window.removeEventListener("scroll", handleScroll);
    endPageTracking();
  };

  window.addEventListener("beforeunload", cleanup);
  // Retornar cleanup para uso em React useEffect
  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("beforeunload", cleanup);
    endPageTracking();
  };
}

/**
 * Finaliza o rastreamento da página atual e envia dados finais.
 */
export function endPageTracking() {
  if (!currentPage) return;

  if (currentPage.intervalId) {
    clearInterval(currentPage.intervalId);
  }

  const durationMs = Date.now() - currentPage.enteredAt;

  // Enviar dados finais da page view
  sendPageView({
    sessionId: getSessionId(),
    page: currentPage.page,
    title: currentPage.title,
    durationMs,
    scrollDepthPct: currentPage.maxScrollDepth,
    reached25pct: currentPage.quartilsSent.has(25) ? 1 : 0,
    reached50pct: currentPage.quartilsSent.has(50) ? 1 : 0,
    reached75pct: currentPage.quartilsSent.has(75) ? 1 : 0,
    reached100pct: currentPage.quartilsSent.has(100) ? 1 : 0,
    isExit: true,
  });

  currentPage = null;
}

/**
 * Rastreia visualização de vídeo com quartis.
 */
export function trackVideoView(
  videoId: string,
  videoTitle: string,
  videoDurationMs: number,
  watchTimeMs: number
) {
  const quartile25 = videoDurationMs * 0.25;
  const quartile50 = videoDurationMs * 0.5;
  const quartile75 = videoDurationMs * 0.75;

  const data = {
    sessionId: getSessionId(),
    page: window.location.pathname,
    videoId,
    videoTitle,
    videoDurationMs,
    watchTimeMs,
    reached25pct: watchTimeMs >= quartile25 ? 1 : 0,
    reached50pct: watchTimeMs >= quartile50 ? 1 : 0,
    reached75pct: watchTimeMs >= quartile75 ? 1 : 0,
    reached100pct: watchTimeMs >= videoDurationMs * 0.95 ? 1 : 0, // 95% conta como 100%
  };

  fetch("/api/trpc/analytics.trackVideoView", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ json: data }),
  }).catch(() => {});
}
