import { useEffect } from "react";
import { trackDirectionsClick, trackFaqOpen } from "@/lib/tracking";

/**
 * Sinais de interesse que o site gerava e nao media (pericia de rastreamento,
 * 28/10/2026): 80 perguntas frequentes abertas sem evento — "Quanto custa",
 * "Meu convenio cobre", "Preciso agendar" — e os botoes "Como chegar".
 *
 * Um ouvinte no documento cobre todas as paginas de uma vez, inclusive as que
 * vierem depois, sem espalhar chamadas de rastreamento pelos componentes.
 * Montado uma unica vez no App, ao lado do usePageViewTracking.
 */
export function useInteractionTracking() {
  useEffect(() => {
    // <details> nao propaga "toggle"; so a captura enxerga todos.
    const onToggle = (e: Event) => {
      const el = e.target;
      if (!(el instanceof HTMLDetailsElement) || !el.open) return;
      const todos = Array.from(document.querySelectorAll("details"));
      trackFaqOpen(todos.indexOf(el) + 1);
    };

    const onClick = (e: MouseEvent) => {
      const alvo = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!alvo) return;
      const href = alvo.getAttribute("href") || "";
      if (/google\.[^/]+\/maps/.test(href) && !href.includes("output=embed")) {
        trackDirectionsClick();
      }
    };

    document.addEventListener("toggle", onToggle, true);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("toggle", onToggle, true);
      document.removeEventListener("click", onClick, true);
    };
  }, []);
}
