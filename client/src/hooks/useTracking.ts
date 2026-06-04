import { useEffect } from 'react';

/**
 * Hook para rastreamento de eventos com GTM e Meta Pixel
 */
export const useTracking = () => {
  // Rastrear scroll depth
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercentage = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );

        // GTM: Enviar evento de scroll
        if (typeof window !== 'undefined' && (window as any).dataLayer) {
          (window as any).dataLayer.push({
            event: 'scroll_depth',
            scrollPercentage,
          });
        }

        // Meta Pixel: Rastrear scroll depth
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'ViewContent', {
            value: scrollPercentage,
            currency: 'BRL',
          });
        }
      }, 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Função para rastrear clique em CTA
  const trackCTAClick = (ctaName: string) => {
    // GTM: Enviar evento de clique em CTA
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'cta_click',
        ctaName,
      });
    }

    // Meta Pixel: Rastrear clique em CTA
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', {
        content_name: ctaName,
        currency: 'BRL',
      });
    }
  };

  // Função para rastrear envio de formulário
  const trackFormSubmit = (formName: string, data?: Record<string, any>) => {
    // GTM: Enviar evento de envio de formulário
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'form_submit',
        formName,
        ...data,
      });
    }

    // Meta Pixel: Rastrear envio de formulário
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', {
        content_name: formName,
        currency: 'BRL',
      });
    }
  };

  // Função para rastrear compra/conversão
  const trackPurchase = (value: number, currency: string = 'BRL') => {
    // GTM: Enviar evento de compra
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'purchase',
        value,
        currency,
      });
    }

    // Meta Pixel: Rastrear compra
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Purchase', {
        value,
        currency,
      });
    }
  };

  // Função para rastrear visualização de página
  const trackPageView = (pageName: string) => {
    // GTM: Enviar evento de visualização de página
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'page_view',
        page_title: pageName,
        page_path: window.location.pathname,
      });
    }

    // Meta Pixel: Rastrear visualização de página
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }
  };

  return {
    trackCTAClick,
    trackFormSubmit,
    trackPurchase,
    trackPageView,
  };
};
