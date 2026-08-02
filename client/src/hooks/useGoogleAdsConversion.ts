import { useCallback } from 'react';

/**
 * Rastreamento de conversões (cliques em Agendar, WhatsApp, Ligar).
 *
 * Desde 01/08/2026 o site carrega SOMENTE o container GTM-WLR7JD57 (decisão
 * do Alex) — o gtag direto do Google Ads (AW-16697936154) foi removido do
 * index.html. Os eventos abaixo vão para o dataLayer com event
 * "ads_conversion"; a tag de conversão do Google Ads deve ser configurada
 * DENTRO do GTM, disparando nesse evento e lendo `conversion_label` /
 * `event_label` das variáveis de camada de dados.
 *
 * ATENÇÃO (auditoria 02/08/2026): o rótulo histórico AW-16697936154/... que
 * vivia neste arquivo NÃO pertence a nenhuma das contas de Ads da clínica —
 * as conversões de site iam para uma conta desconhecida. O ID real da conta
 * principal (920-715-3288) é AW-14387808424; o rótulo é definido NA TAG do
 * GTM (ver gtm/README.md no repo SEO---Total-Quality), não aqui. Este código
 * só emite o evento — o destino é responsabilidade do container.
 */

interface ConversionEvent {
  eventName: string;
  value?: number;
  currency?: string;
  phone?: string;
}

function pushConversion(payload: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'ads_conversion',
    currency: 'BRL',
    ...payload,
  });
}

export function useGoogleAdsConversion() {
  /** Rastreia clique no botão AGENDAR */
  const trackScheduleClick = useCallback((source: string = 'website') => {
    pushConversion({ event_label: `schedule_click_${source}`, value: 0 });
  }, []);

  /** Rastreia clique no botão WhatsApp */
  const trackWhatsAppClick = useCallback((phone: string = '5512388735350') => {
    pushConversion({ event_label: 'whatsapp_click', phone_number: phone, value: 0 });
  }, []);

  /** Rastreia clique no botão Ligar */
  const trackPhoneClick = useCallback((phone: string = '5512388735350') => {
    pushConversion({ event_label: 'phone_click', phone_number: phone, value: 0 });
  }, []);

  /** Rastreia clique em CTA genérico */
  const trackCTAClick = useCallback((ctaName: string, value: number = 0) => {
    pushConversion({ event_label: ctaName, value });
  }, []);

  /** Rastreia visualização de página (PageView) */
  const trackPageView = useCallback((pageName: string) => {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'ads_page_view',
      page_title: pageName,
      page_path: window.location.pathname,
    });
  }, []);

  /** Rastreia evento customizado */
  const trackCustomEvent = useCallback((event: ConversionEvent) => {
    pushConversion({
      event_label: event.eventName,
      value: event.value || 0,
      currency: event.currency || 'BRL',
      ...(event.phone && { phone_number: event.phone }),
    });
  }, []);

  return {
    trackScheduleClick,
    trackWhatsAppClick,
    trackPhoneClick,
    trackCTAClick,
    trackPageView,
    trackCustomEvent,
  };
}
