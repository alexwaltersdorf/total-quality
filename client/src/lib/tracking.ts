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

/** Rastreia visualização de página (SPA navigation) */
export function trackPageView(pageName?: string) {
  pushToDataLayer("page_view", {
    page_name: pageName || document.title,
    content_group: getContentGroup(),
  });

  // Meta Pixel - PageView
  if (window.fbq) {
    window.fbq("track", "PageView");
  }

  // TikTok Pixel - PageView
  if (window.ttq) {
    window.ttq.page();
  }
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
export function trackScheduleExam(source: string, examType?: string) {
  pushToDataLayer("generate_lead", {
    event_category: "conversion",
    event_label: "schedule_exam_whatsapp",
    lead_source: source,
    exam_type: examType || "geral",
    currency: "BRL",
    value: 1, // valor simbólico para otimização
  });

  // Meta Pixel - Lead
  if (window.fbq) {
    window.fbq("track", "Lead", {
      content_name: "Agendamento de Exame",
      content_category: examType || "geral",
      value: 1,
      currency: "BRL",
    });
  }

  // TikTok Pixel - SubmitForm (equivalente a lead)
  if (window.ttq) {
    window.ttq.track("SubmitForm", {
      content_name: "Agendamento de Exame",
      content_type: examType || "geral",
    });
  }
}

/** Rastreia clique em "Agendar Check-Up" */
export function trackScheduleCheckup(packageType: string) {
  pushToDataLayer("generate_lead", {
    event_category: "conversion",
    event_label: "schedule_checkup",
    lead_source: "checkup_page",
    exam_type: `checkup_${packageType}`,
    currency: "BRL",
    value: 1,
  });

  if (window.fbq) {
    window.fbq("track", "Schedule", {
      content_name: `Check-Up ${packageType}`,
      content_category: "checkup",
    });
  }

  if (window.ttq) {
    window.ttq.track("SubmitForm", {
      content_name: `Check-Up ${packageType}`,
      content_type: "checkup",
    });
  }
}

/** Rastreia clique em "Agendar Bioimpedância" */
export function trackScheduleBioimpedancia() {
  pushToDataLayer("generate_lead", {
    event_category: "conversion",
    event_label: "schedule_bioimpedancia",
    lead_source: "bioimpedancia_page",
    exam_type: "bioimpedancia",
    currency: "BRL",
    value: 1,
  });

  if (window.fbq) {
    window.fbq("track", "Schedule", {
      content_name: "Bioimpedância",
      content_category: "bioimpedancia",
    });
  }

  if (window.ttq) {
    window.ttq.track("SubmitForm", {
      content_name: "Bioimpedância",
      content_type: "bioimpedancia",
    });
  }
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

  if (window.fbq) {
    window.fbq("track", "ViewContent", {
      content_name: category,
      content_type: "exam_category",
    });
  }
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

  if (window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      content_name: "Formulário de Contato",
    });
  }
}

/** Rastreia envio do formulário de contato - CONVERSÃO */
export function trackFormSubmit(formData: { name: string; subject?: string }) {
  pushToDataLayer("generate_lead", {
    event_category: "conversion",
    event_label: "contact_form_submit",
    form_name: "contato",
    lead_source: "contact_form",
    contact_subject: formData.subject || "geral",
  });

  if (window.fbq) {
    window.fbq("track", "Lead", {
      content_name: "Formulário de Contato",
      content_category: formData.subject || "geral",
    });
  }

  if (window.ttq) {
    window.ttq.track("SubmitForm", {
      content_name: "Formulário de Contato",
    });
  }
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

  if (window.fbq) {
    window.fbq("track", "Contact", {
      content_name: "Telefone",
    });
  }

  if (window.ttq) {
    window.ttq.track("Contact", {
      content_name: "Telefone",
    });
  }
}

/** Rastreia clique no WhatsApp (sem ser agendamento) */
export function trackWhatsAppClick(source: string) {
  pushToDataLayer("whatsapp_click", {
    event_category: "contact",
    event_label: "whatsapp_click",
    contact_method: "whatsapp",
    click_source: source,
  });

  if (window.fbq) {
    window.fbq("track", "Contact", {
      content_name: "WhatsApp",
    });
  }

  if (window.ttq) {
    window.ttq.track("Contact", {
      content_name: "WhatsApp",
    });
  }
}

// ============================================================
// CARTÃO TOTAL QUALITY
// ============================================================

/** Rastreia interesse no Cartão Total Quality */
export function trackCardInterest() {
  pushToDataLayer("generate_lead", {
    event_category: "conversion",
    event_label: "card_interest",
    lead_source: "cartao_section",
    content_type: "cartao_total_quality",
  });

  if (window.fbq) {
    window.fbq("track", "Lead", {
      content_name: "Cartão Total Quality",
      content_category: "cartao",
    });
  }

  if (window.ttq) {
    window.ttq.track("SubmitForm", {
      content_name: "Cartão Total Quality",
    });
  }
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

/** Inicializa rastreamento de tempo na página */
export function initTimeTracking() {
  const intervals = [15, 30, 60, 120, 300]; // segundos
  const triggered = new Set<number>();
  let startTime = Date.now();

  const checkTime = () => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    intervals.forEach((interval) => {
      if (elapsed >= interval && !triggered.has(interval)) {
        triggered.add(interval);
        trackTimeOnPage(interval);
      }
    });
  };

  const timer = setInterval(checkTime, 5000);
  return () => clearInterval(timer);
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
