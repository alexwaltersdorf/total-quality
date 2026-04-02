/*
 * Design: "Warm Clinical" — Humanized Material Design 3
 * Cartão Total Quality: CTA section for the loyalty card
 */
import { Button } from "@/components/ui/button";
import { CreditCard, Users, Percent, ArrowRight } from "lucide-react";

export default function CartaoSection() {
  return (
    <section className="py-16 lg:py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative container">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div className="reveal">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-white/10">
              <CreditCard className="w-4 h-4" />
              Novidade
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Cartão Total Quality
            </h2>
            <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-lg">
              Descontos exclusivos em exames para toda sua família. Faça seu cartão e aproveite benefícios especiais em todos os nossos serviços.
            </p>
            <Button
              size="lg"
              className="rounded-full bg-white text-teal-800 hover:bg-teal-50 font-semibold px-8 py-6 shadow-lg hover:shadow-xl transition-all ripple-effect"
              onClick={() => window.open("https://wa.me/5512997743535?text=Olá! Gostaria de saber mais sobre o Cartão Total Quality.", "_blank")}
            >
              Saiba Mais
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Benefits cards */}
          <div className="reveal grid grid-cols-2 gap-4" style={{ transitionDelay: "200ms" }}>
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
              <Percent className="w-8 h-8 text-teal-200 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">Descontos</h3>
              <p className="text-sm text-white/70">Preços especiais em todos os exames</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
              <Users className="w-8 h-8 text-teal-200 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">Família</h3>
              <p className="text-sm text-white/70">Benefícios para toda a família</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/10 col-span-2">
              <CreditCard className="w-8 h-8 text-teal-200 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">Fácil e Prático</h3>
              <p className="text-sm text-white/70">Cadastro simples e rápido, sem burocracia. Comece a economizar hoje mesmo.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
