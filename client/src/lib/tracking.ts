/**
 * Total Quality - Sistema de Rastreamento de Eventos
 * 
 * Este módulo centraliza todos os eventos de rastreamento do site,
 * enviando dados para o dataLayer do GTM que distribui para:
 * - Google Analytics 4 (GA4)
 * - Meta Pixel (Facebook/Instagram)
 * - TikTok Pixel
 * - Google Ads
 * - LinkedIn Insight Tag
 * 
 * Eventos seguem a nomenclatura GA4 recommended events + custom events
 * para máxima compatibilidade entre plataformas.
 */

// Tipagem do dataLayer
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track: (...args: unknown[]) => void;
      page: () => void;
    };
  }
}

// ============================================================
// CORE: Push para dataLayer
// ============================================================
function pushToDataLayer(event: string, params: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...params,
    event_timestamp: new Date().toISOString(),
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
    page_hostname: window.location.hostname,
    page_referrer: document.referrer,
  });
}

// ============================================================
// NAVEGAÇÃO E PAGEVIEW
// ============================================================

/*
 * FONTE UNICA DE page_view.
 *
 * Ate 11/08/2026 havia tres emissores: um push manual na Home, outro no hook
 * legado useTracking (CartaoPage) e o disparo do proprio GTM na troca de rota.
 * O GA4 recebia o evento em duplicidade. Agora quem chama e apenas o
 * usePageViewTracking, montado uma vez no App; o gatilho de History Change do
 * GTM NAO deve emitir page_view (ver docs/analytics.md).
 *
 * A deduplicacao por caminho + janela de tempo tambem absorve o duplo-render
 * do StrictMode em desenvolvimento.
 */
let lastPageViewPath: string | null = null;
let lastPageViewAt = 0;
const PAGE_VIEW_DEDUP_MS = 1000;

/** Rastreia visualização de página (navegação SPA). */
export function trackPageView(pageName?: string) {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  const agora = Date.now();
  if (path === lastPageViewPath && agora - lastPageViewAt < PAGE_VIEW_DEDUP_MS) return;
  lastPageViewPath = path;
  lastPageViewAt = agora;

  pushToDataLayer("page_view", {
    page_name: pageName || document.title,
    content_group: getContentGroup(),
  });
}

/** Rastreia scroll depth (25%, 50%, 75%, 90%) */
export function trackScrollDepth(percentage: number) {
  pushToDataLayer("scroll", {
    percent_scrolled: percentage,
    event_category: "engagement",
    event_label: `scroll_${percentage}%`,
  });
}

/** Rastreia tempo na página */
export function trackTimeOnPage(seconds: number) {
  pushToDataLayer("time_on_page", {
    engagement_time_seconds: seconds,
    event_category: "engagement",
    event_label: `${seconds}s_on_page`,
  });
}

// ============================================================
// SEÇÕES VISUALIZADAS
// ============================================================

/** Rastreia quando uma seção entra no viewport */
export function trackSectionView(sectionName: string) {
  pushToDataLayer("section_view", {
    section_name: sectionName,
    event_category: "engagement",
    event_label: `viewed_${sectionName}`,
  });
}

// ============================================================
// AGENDAMENTO E CONVERSÕES (WhatsApp)
// ============================================================

/** Rastreia clique em "Agendar Exame" (WhatsApp) - CONVERSÃO PRINCIPAL */
/*
 * EVENTO CANONICO DE CONVERSAO (padronizacao de 02/08/2026): todo clique em
 * qualquer botao/link de WhatsApp empurra UM UNICO evento whatsapp_click
 * com este payload. O antigo evento de lead foi aposentado e nao ha mais
 * pixel direto — o GTM converte whatsapp_click em Lead (Meta) e em
 * conversao (Google Ads).
 */
export function trackWhatsAppConversion(label: string, source: string, examType: string = "geral") {
  pushToDataLayer("whatsapp_click", {
    event_category: "conversion",
    event_label: label,
    lead_source: source,
    exam_type: examType,
    currency: "BRL",
    value: 1,
  });
}

export function trackScheduleExam(source: string, examType?: string) {
  trackWhatsAppConversion(source, source.replace(/_(cta|section)$/, ""), examType || "geral");
}

/** Rastreia clique em "Agendar Check-Up" */
export function trackScheduleCheckup(packageType: string) {
  trackWhatsAppConversion(`checkup_${packageType}`, "checkup", `checkup_${packageType}`);
}

/** Rastreia clique em "Agendar Bioimpedância" */
export function trackScheduleBioimpedancia() {
  trackWhatsAppConversion("bioimpedancia_cta", "bioimpedancia", "bioimpedancia");
}

// ============================================================
// INTERAÇÕES COM EXAMES
// ============================================================

/** Rastreia seleção de categoria de exame (tabs) */
export function trackExamCategorySelect(category: string) {
  pushToDataLayer("select_content", {
    content_type: "exam_category",
    content_id: category,
    event_category: "engagement",
    event_label: `exam_category_${category}`,
  });

}

/** Rastreia visualização de exame específico */
export function trackExamView(examName: string, category: string) {
  pushToDataLayer("view_item", {
    item_name: examName,
    item_category: category,
    event_category: "engagement",
    event_label: `view_exam_${examName}`,
  });
}

// ============================================================
// FORMULÁRIO DE CONTATO
// ============================================================

/** Rastreia início de preenchimento do formulário */
export function trackFormStart() {
  pushToDataLayer("form_start", {
    event_category: "engagement",
    event_label: "contact_form_start",
    form_name: "contato",
  });

}

/** Rastreia envio do formulário de contato - CONVERSÃO */
export function trackFormSubmit(formData: { name: string; subject?: string }) {
  pushToDataLayer("form_submit", {
    event_category: "conversion",
    form_name: "contato",
    contact_subject: formData.subject || "geral",
  });
}

// ============================================================
// CLIQUES EM TELEFONE E WHATSAPP
// ============================================================

/** Rastreia clique no telefone */
export function trackPhoneClick(source: string) {
  pushToDataLayer("phone_click", {
    event_category: "contact",
    event_label: "phone_click",
    contact_method: "phone",
    click_source: source,
  });

}

/** Rastreia clique no WhatsApp (sem ser agendamento) */
export function trackWhatsAppClick(source: string) {
  trackWhatsAppConversion(source, source.replace(/_(cta|section)$/, ""));
}

// ============================================================
// CARTÃO TOTAL QUALITY
// ============================================================

/** Rastreia interesse no Cartão Total Quality */
export function trackCardInterest() {
  trackWhatsAppConversion("cartao_cta", "cartao", "cartao");
}

/**
 * Rastreia clique em CTA que NAO leva ao WhatsApp (abrir modal, escolher
 * plano, expandir bloco). Usa select_content, evento que ja esta no gatilho do
 * GTM — nao exige mudanca no contêiner.
 */
export function trackCtaClick(ctaName: string) {
  pushToDataLayer("select_content", {
    content_type: "cta",
    content_id: ctaName,
    event_category: "engagement",
    event_label: `cta_${ctaName}`,
  });
}

// ============================================================
// NAVEGAÇÃO E MENU
// ============================================================

/** Rastreia clique em item do menu */
export function trackNavClick(itemName: string) {
  pushToDataLayer("nav_click", {
    event_category: "navigation",
    event_label: `nav_${itemName}`,
    nav_item: itemName,
  });
}

/** Rastreia clique em link externo (Instagram, etc.) */
export function trackExternalLink(platform: string, url: string) {
  pushToDataLayer("external_link_click", {
    event_category: "outbound",
    event_label: `external_${platform}`,
    outbound_url: url,
    platform: platform,
  });
}

/** Rastreia clique em "Resultados Online" */
export function trackResultsClick() {
  pushToDataLayer("results_online_click", {
    event_category: "engagement",
    event_label: "results_online",
    content_type: "results_portal",
  });
}

// ============================================================
// MAPA E LOCALIZAÇÃO
// ============================================================

/** Rastreia interação com o mapa */
export function trackMapInteraction(action: string) {
  pushToDataLayer("map_interaction", {
    event_category: "engagement",
    event_label: `map_${action}`,
    map_action: action,
  });
}

// ============================================================
// UTILITÁRIOS
// ============================================================

/** Determina o grupo de conteúdo baseado na URL */
function getContentGroup(): string {
  const path = window.location.pathname;
  if (path === "/") return "home";
  if (path.includes("checkup")) return "servicos_checkup";
  if (path.includes("bioimpedancia")) return "servicos_bioimpedancia";
  return "outros";
}

/** Inicializa rastreamento automático de scroll depth */
export function initScrollTracking() {
  const thresholds = [25, 50, 75, 90];
  const triggered = new Set<number>();

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    thresholds.forEach((threshold) => {
      if (scrollPercent >= threshold && !triggered.has(threshold)) {
        triggered.add(threshold);
        trackScrollDepth(threshold);
      }
    });
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}

/**
 * Inicializa rastreamento de tempo na página.
 *
 * Marcos discretos, cada um uma unica vez por pagina. Antes eram
 * [15, 30, 60, 120, 300] verificados a cada 5s — tres eventos so no primeiro
 * minuto, consumindo cota do GA4 e inflando engajamento.
 *
 * O contador acumula apenas tempo com a aba VISIVEL (Page Visibility API):
 * antes ele seguia correndo com a aba em segundo plano, contando como
 * engajamento tempo em que ninguem estava lendo a pagina.
 */
export function initTimeTracking() {
  const marcos = [30, 60, 180]; // segundos
  const disparados = new Set<number>();
  let visivelDesde = document.visibilityState === "visible" ? Date.now() : null;
  let acumulado = 0;

  const decorrido = () =>
    Math.round((acumulado + (visivelDesde ? Date.now() - visivelDesde : 0)) / 1000);

  const checarMarcos = () => {
    const segundos = decorrido();
    for (const marco of marcos) {
      if (segundos >= marco && !disparados.has(marco)) {
        disparados.add(marco);
        trackTimeOnPage(marco);
      }
    }
  };

  const aoTrocarVisibilidade = () => {
    if (document.visibilityState === "visible") {
      visivelDesde = Date.now();
      return;
    }
    if (visivelDesde) {
      acumulado += Date.now() - visivelDesde;
      visivelDesde = null;
    }
    checarMarcos();
  };

  document.addEventListener("visibilitychange", aoTrocarVisibilidade);
  const timer = window.setInterval(checarMarcos, 10000);

  return () => {
    window.clearInterval(timer);
    document.removeEventListener("visibilitychange", aoTrocarVisibilidade);
  };
}

/** Inicializa observador de seções visíveis */
export function initSectionObserver() {
  const sections = document.querySelectorAll("section[id]");
  const observed = new Set<string>();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (!observed.has(id)) {
            observed.add(id);
            trackSectionView(id);
          }
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach((section) => observer.observe(section));
  return () => observer.disconnect();
}
