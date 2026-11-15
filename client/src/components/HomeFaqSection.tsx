/*
 * Perguntas frequentes da home (SEO nov/2026, Fase 1). Sao as mesmas do
 * FAQPage que o pre-render da home publica (lib/paginasServico.ts,
 * HOME_FAQS): JSON-LD de FAQ precisa corresponder a um FAQ visivel.
 * Abrir uma pergunta ja gera faq_open (useInteractionTracking).
 */
import { ChevronRight } from "lucide-react";
import { HOME_FAQS } from "@/lib/paginasServico";

export default function HomeFaqSection() {
  return (
    <section id="perguntas-frequentes" className="py-20 lg:py-28" aria-label="Perguntas frequentes">
      <div className="container max-w-3xl">
        <h2 className="reveal heading-display text-4xl lg:text-5xl text-text mb-10">
          Perguntas <span className="text-brand">frequentes</span>
        </h2>
        <div className="space-y-4">
          {HOME_FAQS.map((faq) => (
            <details key={faq.q} className="group bg-white rounded-xl border border-black/5 overflow-hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-semibold text-text pr-4">{faq.q}</span>
                <ChevronRight className="w-5 h-5 text-text-muted shrink-0 transition-transform group-open:rotate-90" />
              </summary>
              <div className="px-6 pb-6 text-text-light leading-relaxed">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
