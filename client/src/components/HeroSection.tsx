/*
 * Design: "Warm Clinical" — Humanized Material Design 3
 * Hero: Full-width banner with overlay, badge, headline, stats, and CTAs
 * Light image background with dark overlay for text contrast
 */
import { Button } from "@/components/ui/button";
import { Shield, Clock, Users, BadgeCheck, ArrowRight, MessageCircle } from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/hero-banner-mPWTMVYiLFG6Q2jpBeWUEy.webp";

const stats = [
  { icon: Shield, value: "3.000+", label: "Tipos de Exames" },
  { icon: Clock, value: "24h", label: "Resultados Online" },
  { icon: Users, value: "30.000+", label: "Famílias Atendidas" },
  { icon: BadgeCheck, value: "22", label: "Anos de Tradição" },
];

export default function HeroSection() {
  return (
    <section id="inicio" className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="Clínica Total Quality - Recepção moderna"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/85 via-teal-800/70 to-teal-700/50" />
      </div>

      {/* Content */}
      <div className="relative container py-20 lg:py-28">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="reveal inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-8 border border-white/10">
            <Shield className="w-4 h-4" />
            Tradição há 22 anos cuidando de sua saúde
          </div>

          {/* Headline */}
          <h1 className="reveal text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6" style={{ transitionDelay: "100ms" }}>
            Total Quality
            <span className="block text-teal-200 mt-1">Medicina Diagnóstica</span>
          </h1>

          {/* Subtitle */}
          <p className="reveal text-lg sm:text-xl text-white/80 leading-relaxed mb-10 max-w-xl" style={{ transitionDelay: "200ms" }}>
            Desde 2003, mais de 30.000 famílias já confiaram na Total Quality. 
            Aqui você encontra a combinação perfeita entre <strong className="text-white">Tecnologia de Última Geração</strong> e <strong className="text-white">Atendimento Humanizado</strong>.
          </p>

          {/* CTA Buttons */}
          <div className="reveal flex flex-wrap gap-4 mb-14" style={{ transitionDelay: "300ms" }}>
            <Button
              size="lg"
              className="rounded-full bg-white text-teal-800 hover:bg-teal-50 font-semibold text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all ripple-effect"
              onClick={() => window.open("https://wa.me/5512997743535?text=Olá! Gostaria de agendar um exame.", "_blank")}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Agendar pelo WhatsApp
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-white/30 text-white hover:bg-white/10 font-semibold text-base px-8 py-6 backdrop-blur-sm"
              onClick={() => {
                const el = document.querySelector("#exames");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Ver Exames
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Stats row */}
          <div className="reveal grid grid-cols-2 sm:grid-cols-4 gap-4" style={{ transitionDelay: "400ms" }}>
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 border border-white/10 hover:bg-white/15 transition-colors"
              >
                <stat.icon className="w-5 h-5 text-teal-200 mb-2" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[60px]" style={{ display: "block" }}>
          <path
            d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z"
            fill="oklch(0.99 0.005 90)"
          />
        </svg>
      </div>
    </section>
  );
}
