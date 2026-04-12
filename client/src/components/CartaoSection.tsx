/*
 * Style: Optik Editorial — Dark CTA section with brand accent
 * Cartão Total Quality: Promotional block
 */
import { ArrowUpRight, CreditCard, Users, Percent } from "lucide-react";

export default function CartaoSection() {
  return (
    <section className="py-24 lg:py-32 bg-foreground text-white relative overflow-hidden">
      {/* Decorative large text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
        <span className="heading-display text-[20vw] text-white/[0.03] whitespace-nowrap">
          TOTAL QUALITY
        </span>
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="reveal">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-brand-light mb-6">
              <CreditCard className="w-4 h-4" />
              Novidade
            </span>
            <h2 className="heading-display text-5xl sm:text-6xl lg:text-7xl text-white mb-6">
              CARTÃO
              <br />
              <span className="text-brand-light">TOTAL QUALITY</span>
            </h2>
            <p className="text-lg text-white/60 leading-relaxed mb-10 max-w-lg">
              Descontos exclusivos em exames para toda sua família. Faça seu cartão e aproveite benefícios especiais em todos os nossos serviços.
            </p>
            <button
              onClick={() => window.open("https://wa.me/5512997743535?text=Olá! Gostaria de saber mais sobre o Cartão Total Quality.", "_blank")}
              className="btn-pill bg-white !text-foreground hover:!bg-brand hover:!text-white"
            >
              Saiba Mais
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Benefits */}
          <div className="reveal grid grid-cols-1 gap-0" style={{ transitionDelay: "200ms" }}>
            {[
              { icon: Percent, title: "Descontos Exclusivos", description: "Preços especiais em todos os exames da clínica" },
              { icon: Users, title: "Benefícios Familiares", description: "Extensível para toda a família sem custo adicional" },
              { icon: CreditCard, title: "Fácil e Prático", description: "Cadastro simples e rápido, sem burocracia" },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`flex items-start gap-6 py-8 ${i < 2 ? "border-b border-white/10" : ""}`}
              >
                <div className="w-12 h-12 flex items-center justify-center text-brand-light shrink-0">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-white/50">{item.description}</p>
                </div>
                <span className="number-outline !text-4xl ![-webkit-text-stroke:1px_rgba(255,255,255,0.1)] ml-auto">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
