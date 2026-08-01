/*
 * Style: Optik Editorial — Giant display type, asymmetric layout
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 * SEO: Keywords in headings, alt texts, and semantic HTML
 * Tracking: CTA clicks → generate_lead, nav clicks
 */
import ResponsiveImage from "@/components/ResponsiveImage";
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { trackScheduleExam } from "@/lib/tracking";
import { trackLeadDirect } from "@/hooks/useAnalyticsTracker";


const marqueeItems = [
  "TOMOGRAFIA", "EXAMES DE SANGUE", "HEMOGRAMA",
  "ULTRASSONOGRAFIA", "GLICEMIA", "RAIO-X", "COLESTEROL",
  "ELETROCARDIOGRAMA", "BIOIMPEDÂNCIA", "CHECK-UP",
  "DIAGNÓSTICO POR IMAGEM", "LABORATÓRIO", "HORMÔNIOS",
  "ESPIROMETRIA", "HOLTER", "MAPA", "VITAMINA D", "PSA",
  "ANÁLISES CLÍNICAS", "ELETROENCEFALOGRAMA", "CREATININA",
];

export default function HeroSection() {
  const handleScheduleClick = () => {
    trackScheduleExam("hero_cta", "geral");
    trackLeadDirect("hero_cta");
    window.open("https://wa.me/551238873535?text=Olá! Gostaria de agendar um exame na Total Quality.", "_blank");
  };

  return (
    <section id="inicio" className="relative min-h-screen bg-white overflow-hidden" aria-label="Início - Total Quality Medicina Diagnóstica Caraguatatuba">
      {/* Main content grid */}
      <div className="container relative z-10 pt-28 lg:pt-32 pb-16">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left column - Text */}
          <div className="lg:col-span-6 xl:col-span-5 pt-8 lg:pt-16">
            <div className="reveal">
              <span className="section-label mb-8 block">Laboratório e Medicina Diagnóstica Caraguatatuba - SP</span>
            </div>

            <div className="reveal mb-8" style={{ transitionDelay: "100ms" }}>
              <span className="heading-display text-[clamp(3.5rem,10vw,8rem)] leading-[0.85] block" aria-hidden="true">
                <span className="text-text">TOTAL</span>
                <br />
                <span className="text-brand">QUALITY</span>
              </span>
              <h1 className="block text-lg lg:text-xl text-text-light font-light tracking-wide mt-4">
                Laboratório de Análises Clínicas e Medicina Diagnóstica em Caraguatatuba
              </h1>
            </div>

            <p className="reveal text-lg text-text-light leading-relaxed max-w-md mb-10" style={{ transitionDelay: "200ms" }}>
              {/* Links discretos: sublinhado suave em vez da cor da marca, para nao
                  poluir o hero. Continuam sendo <a href> rastreaveis. */}
              Desde 2003, mais de 30.000 famílias confiam no nosso{" "}
              <Link href="/laboratorio-caraguatatuba" className="underline decoration-brand/40 underline-offset-2 hover:text-brand transition-colors">
                laboratório de análises clínicas
              </Link>{" "}
              e clínica de medicina diagnóstica em Caraguatatuba. Realizamos{" "}
              <Link href="/exames/exames-de-sangue" className="underline decoration-brand/40 underline-offset-2 hover:text-brand transition-colors">
                exames de sangue
              </Link>
              ,{" "}
              <Link href="/exames/hemograma" className="underline decoration-brand/40 underline-offset-2 hover:text-brand transition-colors">
                hemograma
              </Link>
              , glicemia, colesterol, hormônios,{" "}
              <Link href="/exames/tomografia-computadorizada" className="underline decoration-brand/40 underline-offset-2 hover:text-brand transition-colors">
                tomografia
              </Link>
              ,{" "}
              <Link href="/exames/ultrassonografia" className="underline decoration-brand/40 underline-offset-2 hover:text-brand transition-colors">
                ultrassonografia
              </Link>
              ,{" "}
              <Link href="/exames/mamografia" className="underline decoration-brand/40 underline-offset-2 hover:text-brand transition-colors">
                mamografia
              </Link>{" "}
              e{" "}
              <Link href="/checkup" className="underline decoration-brand/40 underline-offset-2 hover:text-brand transition-colors">
                check-up preventivo
              </Link>{" "}
              com tecnologia de última geração.
            </p>

            <div className="reveal flex flex-wrap gap-4 mb-16" style={{ transitionDelay: "300ms" }}>
              <button
                onClick={handleScheduleClick}
                className="btn-pill-brand btn-pill"
                aria-label="Agendar exame na Total Quality via WhatsApp"
              >
                Agendar Exame
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  const el = document.querySelector("#exames");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-pill !bg-transparent !text-text border border-black/15 hover:!bg-black/5"
                // O nome acessivel precisa conter o texto visivel: sem isso o
                // Lighthouse acusa `label-content-name-mismatch` e quem usa
                // controle por voz nao consegue dizer "clicar em Ver Exames".
                aria-label="Ver Exames disponíveis na Total Quality"
              >
                Ver Exames
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stats row */}
            <div className="reveal grid grid-cols-3 gap-8" style={{ transitionDelay: "400ms" }}>
              {[
                { value: "22+", label: "Anos de\nExperiência" },
                { value: "3K+", label: "Tipos de\nExames" },
                { value: "30K+", label: "Famílias\nAtendidas" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="heading-display text-4xl lg:text-5xl text-brand">{stat.value}</p>
                  <p className="text-xs text-text-muted uppercase tracking-wider mt-1 whitespace-pre-line">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Hero image */}
          <div className="lg:col-span-6 xl:col-span-7">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[80vh]">
              {/* Foto REAL da recepcao. A antiga "hero-clinica" era banco de
                  imagens e mostrava uma RESSONANCIA — exame que a clinica nao
                  oferece; imagem removida das paginas em 01/08/2026. */}
              <ResponsiveImage
                slug="recepcao"
                widths={[480, 768, 1024]}
                sizes="(max-width: 1024px) 100vw, 55vw"
                width={1024}
                height={576}
                alt="Recepção da clínica Total Quality Medicina Diagnóstica em Caraguatatuba - SP"
                className="w-full h-full object-cover"
                priority
              />
              {/* Floating info card */}
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-5 max-w-xs shadow-lg">
                <p className="text-xs uppercase tracking-[0.15em] font-semibold text-brand mb-1">Caraguatatuba - SP</p>
                <p className="text-sm text-text-light">R. Padre Anchieta, 1010 - Centro</p>
                <p className="text-sm text-text-light">Seg-Sex: 07h30 às 18h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee strip — SEO: visible service keywords */}
      <div className="py-4 overflow-hidden bg-surface-dark border-t border-b border-black/5" aria-label="Serviços de exames disponíveis na Total Quality">
        <div className="animate-marquee whitespace-nowrap flex">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className="inline-flex items-center gap-8 mx-8">
              {marqueeItems.map((item) => (
                <span key={`${i}-${item}`} className="inline-flex items-center gap-8">
                  <span className="heading-display text-2xl text-text">{item}</span>
                  <span className="w-2 h-2 rounded-full bg-brand" />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
