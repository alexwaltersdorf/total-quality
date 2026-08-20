import { useEffect } from "react";
import { useLocation } from "wouter";
import { trackPageView } from "@/lib/tracking";

/**
 * Emite UM page_view por navegação real. Montado uma unica vez no App — nenhuma
 * pagina deve chamar trackPageView por conta propria.
 *
 * O disparo e adiado por um tick porque as rotas definem document.title no
 * proprio efeito; efeito de filho roda antes do efeito do pai, mas rotas em
 * lazy loading podem chegar depois. A deduplicacao dentro de trackPageView
 * protege contra o duplo-efeito do StrictMode.
 */
export function usePageViewTracking() {
  const [location] = useLocation();

  useEffect(() => {
    const id = window.setTimeout(() => trackPageView(), 0);
    return () => window.clearTimeout(id);
  }, [location]);
}
