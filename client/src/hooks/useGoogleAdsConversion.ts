import { useEffect } from 'react';

/**
 * Hook para rastreamento de conversões do Google Ads
 * Envia eventos de conversão quando usuário clica em CTAs (Agendar, WhatsApp, Ligar)
 */

interface ConversionEvent {
  eventName: string;
  value?: number;
  currency?: string;
  phone?: string;
}

export function useGoogleAdsConversion() {
  /**
   * Rastreia clique no botão AGENDAR
   */
  const trackScheduleClick = (source: string = 'website') => {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'conversion', {
        'allow_custom_event': true,
        'value': 0,
        'currency': 'BRL',
        'event_category': 'engagement',
        'event_label': `schedule_click_${source}`,
        'send_to': 'AW-16697936154/VFxiCKPqvvEZEMrKsqsq'
      });
    }
  };

  /**
   * Rastreia clique no botão WhatsApp
   */
  const trackWhatsAppClick = (phone: string = '5512388735350') => {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'conversion', {
        'allow_custom_event': true,
        'value': 0,
        'currency': 'BRL',
        'event_category': 'engagement',
        'event_label': 'whatsapp_click',
        'phone_number': phone,
        'send_to': 'AW-16697936154/VFxiCKPqvvEZEMrKsqsq'
      });
    }
  };

  /**
   * Rastreia clique no botão Ligar
   */
  const trackPhoneClick = (phone: string = '5512388735350') => {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'conversion', {
        'allow_custom_event': true,
        'value': 0,
        'currency': 'BRL',
        'event_category': 'engagement',
        'event_label': 'phone_click',
        'phone_number': phone,
        'send_to': 'AW-16697936154/VFxiCKPqvvEZEMrKsqsq'
      });
    }
  };

  /**
   * Rastreia clique em CTA genérico
   */
  const trackCTAClick = (ctaName: string, value: number = 0) => {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'conversion', {
        'allow_custom_event': true,
        'value': value,
        'currency': 'BRL',
        'event_category': 'engagement',
        'event_label': ctaName,
        'send_to': 'AW-16697936154/VFxiCKPqvvEZEMrKsqsq'
      });
    }
  };

  /**
   * Rastreia visualização de página (PageView)
   */
  const trackPageView = (pageName: string) => {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'page_view', {
        'page_title': pageName,
        'page_path': window.location.pathname,
        'send_to': 'AW-16697936154'
      });
    }
  };

  /**
   * Rastreia evento customizado
   */
  const trackCustomEvent = (event: ConversionEvent) => {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'conversion', {
        'allow_custom_event': true,
        'value': event.value || 0,
        'currency': event.currency || 'BRL',
        'event_category': 'engagement',
        'event_label': event.eventName,
        ...(event.phone && { 'phone_number': event.phone }),
        'send_to': 'AW-16697936154/VFxiCKPqvvEZEMrKsqsq'
      });
    }
  };

  return {
    trackScheduleClick,
    trackWhatsAppClick,
    trackPhoneClick,
    trackCTAClick,
    trackPageView,
    trackCustomEvent
  };
}
