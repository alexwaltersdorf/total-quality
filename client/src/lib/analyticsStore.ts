/**
 * Total Quality - Analytics Store
 * 
 * Armazena e processa eventos do dataLayer em tempo real para o dashboard.
 * Usa localStorage para persistência entre sessões e fornece dados
 * agregados para visualização em gráficos e métricas.
 */

export interface AnalyticsEvent {
  event: string;
  timestamp: string;
  page_path: string;
  page_title: string;
  event_category?: string;
  event_label?: string;
  lead_source?: string;
  exam_type?: string;
  contact_method?: string;
  click_source?: string;
  section_name?: string;
  nav_item?: string;
  platform?: string;
  percent_scrolled?: number;
  engagement_time_seconds?: number;
  [key: string]: unknown;
}

export interface DailyMetrics {
  date: string;
  pageViews: number;
  leads: number;
  whatsappClicks: number;
  phoneClicks: number;
  formStarts: number;
  formSubmits: number;
}

export interface HourlyMetrics {
  hour: number;
  events: number;
}

const STORAGE_KEY = "tq_analytics_events";
const MAX_EVENTS = 5000;

// ============================================================
// CORE: Armazenamento de Eventos
// ============================================================

function getStoredEvents(): AnalyticsEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: AnalyticsEvent[]) {
  try {
    // Manter apenas os últimos MAX_EVENTS
    const trimmed = events.slice(-MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage cheio — limpar metade
    const trimmed = events.slice(-Math.floor(MAX_EVENTS / 2));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }
}

/** Intercepta o dataLayer e armazena eventos */
export function initAnalyticsCapture() {
  const originalPush = Array.prototype.push;
  window.dataLayer = window.dataLayer || [];

  // Interceptar push no dataLayer
  const originalDataLayerPush = window.dataLayer.push.bind(window.dataLayer);
  window.dataLayer.push = function (...args: Record<string, unknown>[]) {
    args.forEach((item) => {
      if (item.event && typeof item.event === "string") {
        const event: AnalyticsEvent = {
          event: item.event,
          timestamp: (item.event_timestamp as string) || new Date().toISOString(),
          page_path: (item.page_path as string) || window.location.pathname,
          page_title: (item.page_title as string) || document.title,
          event_category: item.event_category as string,
          event_label: item.event_label as string,
          lead_source: item.lead_source as string,
          exam_type: item.exam_type as string,
          contact_method: item.contact_method as string,
          click_source: item.click_source as string,
          section_name: item.section_name as string,
          nav_item: item.nav_item as string,
          platform: item.platform as string,
          percent_scrolled: item.percent_scrolled as number,
          engagement_time_seconds: item.engagement_time_seconds as number,
        };
        const events = getStoredEvents();
        events.push(event);
        saveEvents(events);
      }
    });
    return originalPush.apply(window.dataLayer, args);
  };
}

// ============================================================
// QUERIES: Obter dados agregados
// ============================================================

/** Obter todos os eventos armazenados */
export function getAllEvents(): AnalyticsEvent[] {
  return getStoredEvents();
}

/** Obter eventos filtrados por período */
export function getEventsByPeriod(days: number): AnalyticsEvent[] {
  const events = getStoredEvents();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return events.filter((e) => new Date(e.timestamp) >= cutoff);
}

/** Obter eventos de hoje */
export function getTodayEvents(): AnalyticsEvent[] {
  const events = getStoredEvents();
  const today = new Date().toISOString().split("T")[0];
  return events.filter((e) => e.timestamp.startsWith(today));
}

/** Contar eventos por tipo */
export function countByEvent(events: AnalyticsEvent[], eventName: string): number {
  return events.filter((e) => e.event === eventName).length;
}

/** Contar eventos por label */
export function countByLabel(events: AnalyticsEvent[], label: string): number {
  return events.filter((e) => e.event_label === label).length;
}

// ============================================================
// MÉTRICAS AGREGADAS
// ============================================================

/** Obter métricas resumidas */
export function getSummaryMetrics(events: AnalyticsEvent[]) {
  return {
    totalEvents: events.length,
    pageViews: countByEvent(events, "page_view"),
    leads: countByEvent(events, "whatsapp_click") + countByEvent(events, "form_submit"),
    whatsappClicks: countByEvent(events, "whatsapp_click"),
    phoneClicks: countByEvent(events, "phone_click"),
    formStarts: countByEvent(events, "form_start"),
    formSubmits: events.filter(
      (e) => e.event === "form_submit"
    ).length,
    scheduleExam: events.filter(
      (e) => e.event === "whatsapp_click" && String(e.exam_type || "geral") === "geral"
    ).length,
    scheduleCheckup: events.filter(
      (e) => e.event === "whatsapp_click" && String(e.exam_type || "").startsWith("checkup")
    ).length,
    scheduleBioimpedancia: events.filter(
      (e) => e.event === "whatsapp_click" && e.exam_type === "bioimpedancia"
    ).length,
    cardInterest: events.filter(
      (e) => e.event === "whatsapp_click" && e.exam_type === "cartao"
    ).length,
    navClicks: countByEvent(events, "nav_click"),
    externalLinks: countByEvent(events, "external_link_click"),
    sectionViews: countByEvent(events, "section_view"),
    examCategorySelects: countByEvent(events, "select_content"),
    mapInteractions: countByEvent(events, "map_interaction"),
    scrollEvents: countByEvent(events, "scroll"),
  };
}

/** Obter métricas diárias dos últimos N dias */
export function getDailyMetrics(days: number): DailyMetrics[] {
  const events = getStoredEvents();
  const result: DailyMetrics[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayEvents = events.filter((e) => e.timestamp.startsWith(dateStr));

    result.push({
      date: dateStr,
      pageViews: dayEvents.filter((e) => e.event === "page_view").length,
      leads: dayEvents.filter((e) => e.event === "whatsapp_click" || e.event === "form_submit").length,
      whatsappClicks: dayEvents.filter((e) => e.event === "whatsapp_click").length,
      phoneClicks: dayEvents.filter((e) => e.event === "phone_click").length,
      formStarts: dayEvents.filter((e) => e.event === "form_start").length,
      formSubmits: dayEvents.filter(
        (e) => e.event === "form_submit"
      ).length,
    });
  }

  return result;
}

/** Obter distribuição por hora do dia */
export function getHourlyDistribution(events: AnalyticsEvent[]): HourlyMetrics[] {
  const hours: HourlyMetrics[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    events: 0,
  }));

  events.forEach((e) => {
    const hour = new Date(e.timestamp).getHours();
    if (hours[hour]) {
      hours[hour].events++;
    }
  });

  return hours;
}

/** Obter páginas mais visitadas */
export function getTopPages(events: AnalyticsEvent[]): { page: string; views: number }[] {
  const pageViews = events.filter((e) => e.event === "page_view");
  const counts: Record<string, number> = {};

  pageViews.forEach((e) => {
    const path = e.page_path || "/";
    counts[path] = (counts[path] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
}

/** Obter seções mais visualizadas */
export function getTopSections(events: AnalyticsEvent[]): { section: string; views: number }[] {
  const sectionViews = events.filter((e) => e.event === "section_view");
  const counts: Record<string, number> = {};

  sectionViews.forEach((e) => {
    const section = e.section_name || "unknown";
    counts[section] = (counts[section] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([section, views]) => ({ section, views }))
    .sort((a, b) => b.views - a.views);
}

/** Obter categorias de exames mais procuradas */
export function getTopExamCategories(events: AnalyticsEvent[]): { category: string; count: number }[] {
  const selects = events.filter((e) => e.event === "select_content");
  const counts: Record<string, number> = {};

  selects.forEach((e) => {
    const cat = (e as Record<string, unknown>).content_id as string || "unknown";
    counts[cat] = (counts[cat] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

/** Obter fontes de leads */
export function getLeadSources(events: AnalyticsEvent[]): { source: string; count: number }[] {
  const leads = events.filter((e) => e.event === "whatsapp_click" || e.event === "form_submit");
  const counts: Record<string, number> = {};

  leads.forEach((e) => {
    const source = e.lead_source || e.event_label || "unknown";
    counts[source] = (counts[source] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

/** Obter taxa de conversão do funil */
export function getFunnelMetrics(events: AnalyticsEvent[]) {
  const pageViews = countByEvent(events, "page_view");
  const sectionViews = countByEvent(events, "section_view");
  const formStarts = countByEvent(events, "form_start");
  const leads = countByEvent(events, "whatsapp_click") + countByEvent(events, "form_submit");

  return {
    steps: [
      { name: "Visualizações", value: pageViews, rate: 100 },
      { name: "Engajamento", value: sectionViews, rate: pageViews > 0 ? Math.round((sectionViews / pageViews) * 100) : 0 },
      { name: "Início Contato", value: formStarts, rate: pageViews > 0 ? Math.round((formStarts / pageViews) * 100) : 0 },
      { name: "Conversões", value: leads, rate: pageViews > 0 ? Math.round((leads / pageViews) * 100) : 0 },
    ],
    conversionRate: pageViews > 0 ? ((leads / pageViews) * 100).toFixed(1) : "0.0",
  };
}

/** Gerar dados de demonstração para visualização */
export function generateDemoData() {
  const events: AnalyticsEvent[] = [];
  const now = new Date();
  const eventTypes = [
    { event: "page_view", category: "engagement", label: "page_view", weight: 40 },
    { event: "section_view", category: "engagement", label: "viewed_exames", weight: 25 },
    { event: "scroll", category: "engagement", label: "scroll_50%", weight: 20 },
    { event: "whatsapp_click", category: "conversion", label: "hero_cta", weight: 5 },
    { event: "whatsapp_click", category: "conversion", label: "checkup_geral", weight: 2 },
    { event: "whatsapp_click", category: "conversion", label: "bioimpedancia_cta", weight: 2 },
    { event: "form_submit", category: "conversion", label: "contato", weight: 2 },
    { event: "whatsapp_click", category: "conversion", label: "cartao_cta", weight: 1 },
    { event: "whatsapp_click", category: "contact", label: "whatsapp_click", weight: 8 },
    { event: "phone_click", category: "contact", label: "phone_click", weight: 4 },
    { event: "form_start", category: "engagement", label: "contact_form_start", weight: 6 },
    { event: "select_content", category: "engagement", label: "exam_category_imagem", weight: 5 },
    { event: "select_content", category: "engagement", label: "exam_category_cardiologia", weight: 3 },
    { event: "select_content", category: "engagement", label: "exam_category_laboratorio", weight: 4 },
    { event: "nav_click", category: "navigation", label: "nav_exames", weight: 6 },
    { event: "external_link_click", category: "outbound", label: "external_instagram", weight: 3 },
    { event: "map_interaction", category: "engagement", label: "map_zoom", weight: 2 },
  ];

  const pages = ["/", "/checkup", "/bioimpedancia"];
  const sections = ["inicio", "diferenciais", "exames", "cartao", "sobre", "contato"];
  const examCategories = ["imagem", "cardiologia", "laboratorio"];
  const leadSources = ["hero_cta", "exames_section", "footer_cta", "navbar_cta", "checkup_page", "bioimpedancia_page", "contact_form", "cartao_section"];

  // Gerar 30 dias de dados
  for (let day = 29; day >= 0; day--) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    
    // Mais eventos em dias úteis
    const isWeekday = date.getDay() >= 1 && date.getDay() <= 5;
    const baseEvents = isWeekday ? Math.floor(Math.random() * 30) + 20 : Math.floor(Math.random() * 15) + 8;

    for (let i = 0; i < baseEvents; i++) {
      // Selecionar tipo de evento baseado no peso
      const totalWeight = eventTypes.reduce((sum, t) => sum + t.weight, 0);
      let random = Math.random() * totalWeight;
      let selectedType = eventTypes[0];
      for (const type of eventTypes) {
        random -= type.weight;
        if (random <= 0) {
          selectedType = type;
          break;
        }
      }

      const hour = Math.floor(Math.random() * 12) + 7; // 7h - 19h
      const minute = Math.floor(Math.random() * 60);
      const eventDate = new Date(date);
      eventDate.setHours(hour, minute, 0, 0);

      const event: AnalyticsEvent = {
        event: selectedType.event,
        timestamp: eventDate.toISOString(),
        page_path: pages[Math.floor(Math.random() * pages.length)],
        page_title: "Total Quality Medicina Diagnóstica",
        event_category: selectedType.category,
        event_label: selectedType.label,
      };

      if (selectedType.event === "section_view") {
        event.section_name = sections[Math.floor(Math.random() * sections.length)];
      }
      if (selectedType.event === "select_content") {
        (event as Record<string, unknown>).content_id = examCategories[Math.floor(Math.random() * examCategories.length)];
      }
      if (selectedType.event === "whatsapp_click" || selectedType.event === "form_submit") {
        event.lead_source = leadSources[Math.floor(Math.random() * leadSources.length)];
        event.exam_type = examCategories[Math.floor(Math.random() * examCategories.length)];
      }
      if (selectedType.event === "scroll") {
        event.percent_scrolled = [25, 50, 75, 90][Math.floor(Math.random() * 4)];
      }
      if (selectedType.event === "whatsapp_click" || selectedType.event === "phone_click") {
        event.click_source = ["hero", "navbar", "footer", "contato", "fab"][Math.floor(Math.random() * 5)];
      }

      events.push(event);
    }
  }

  saveEvents(events);
  return events;
}

/** Limpar todos os dados */
export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
}
