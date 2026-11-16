import { useEffect, useRef } from "react";

/*
 * Animacao de entrada (.reveal, .reveal-left, .reveal-right).
 *
 * SEO nov/2026, Fase 1: as rotas de template chegam renderizadas do servidor.
 * O CSS so esconde os elementos .reveal quando o <html> tem a classe
 * `reveal-on` — sem JavaScript (crawler, JS lento ou bloqueado) o conteudo
 * aparece. Ao ligar a classe, o que JA esta na tela recebe `.visible` antes,
 * no mesmo quadro: nada que o visitante esta vendo pisca ou some. O resto
 * continua entrando conforme a rolagem, como antes.
 */
const SELETOR = ".reveal, .reveal-left, .reveal-right";

export function ativarReveal(root: ParentNode = document) {
  const html = document.documentElement;
  if (!html.classList.contains("reveal-on")) {
    const altura = window.innerHeight || 0;
    root.querySelectorAll(SELETOR).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < altura && r.bottom > 0) el.classList.add("visible");
    });
    html.classList.add("reveal-on");
  }
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    ativarReveal(el);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    el.querySelectorAll(SELETOR).forEach((element) => observer.observe(element));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
