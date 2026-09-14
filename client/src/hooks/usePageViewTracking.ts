import { useEffect } from "react";
import { useLocation } from "wouter";
import { trackPageView } from "@/lib/tracking";
import { captureUTMParams } from "@/lib/utmTracker";

/**
 * Emite UM page_view por navegação real. Montado uma unica vez no App — nenhuma
 * pagina deve chamar trackPageView por conta propria.
 *
 * O disparo e adiado por um tick porque as rotas definem document.title no
 * proprio efeito; efeito de filho roda antes do efeito do pai, mas rotas em
 * lazy loading podem chegar depois. A deduplicacao dentro de trackPageView
 * protege contra o duplo-efeito do StrictMode.
 *
 * captureUTMParams() tambem mora aqui (e nao so na Home): ela ja e idempotente
 * (grava no sessionStorage so na primeira chamada da sessao), mas antes so
 * era chamada dentro do efeito da Home. Um visitante que chega direto numa
 * pagina de exame/blog vindo do Google, sem nunca passar pela Home, tinha o
 * canal de atribuicao (UTM/referrer) perdido para sempre — a coluna "Canal"
 * saia em branco na planilha de leads mesmo em buscas organicas legitimas.
 */
export function usePageViewTracking() {
  const [location] = useLocation();

  useEffect(() => {
    captureUTMParams();
    const id = window.setTimeout(() => trackPageView(), 0);
    return () => window.clearTimeout(id);
  }, [location]);
}
