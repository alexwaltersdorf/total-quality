/*
 * Style: Optik Editorial — Asymmetric layout, large type, editorial images
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 */
import ResponsiveImage from "@/components/ResponsiveImage";
import { Target, Eye, Heart, ShieldCheck, Leaf, GraduationCap } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";


const values = [
  {
    icon: Target,
    title: "Missão",
    description: "Oferecer diagnósticos precisos em exames de sangue, análises clínicas, tomografia, ultrassonografia, mamografia e cardiologia com atendimento humanizado em Caraguatatuba - SP.",
  },
  {
    icon: Eye,
    title: "Visão",
    description: "Ser reconhecida como a principal referência em exames de sangue, laboratório de análises clínicas e medicina diagnóstica no Litoral Norte de São Paulo.",
  },
  {
    icon: Heart,
    title: "Valores",
    description: "Ética, qualidade, inovação tecnológica, sustentabilidade e compromisso com a excelência no atendimento.",
  },
];

const timeline = [
  { year: "2003", title: "Fundação", description: "Início das atividades de medicina diagnóstica em Caraguatatuba com foco em exames de qualidade", icon: ShieldCheck },
  { year: "2015", title: "Expansão", description: "Ampliação da estrutura com tomografia multislice, mamografia digital e novos equipamentos de cardiologia", icon: GraduationCap },
  { year: "2020", title: "Sustentabilidade", description: "Implementação do sistema de energia solar sustentável", icon: Leaf },
];

export default function SobreSection() {
  return (
    <section id="sobre" className="py-24 lg:py-32 bg-white" aria-label="Sobre a Total Quality - Laboratório de Análises Clínicas e Medicina Diagnóstica em Caraguatatuba">
      <div className="container">
        {/* Main about block */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-24">
          {/* Image side */}
          <div className="lg:col-span-6 reveal-left relative">
            <ResponsiveImage
              slug="recepcao"
              widths={[480, 768, 1024]}
              sizes="(max-width: 1024px) 100vw, 50vw"
              width={1024}
              height={576}
              alt="Recepção e sala de espera da Total Quality Medicina Diagnóstica em Caraguatatuba - SP - Ambiente moderno e acolhedor com parede verde e estrutura de madeira"
              className="w-full h-[400px] lg:h-[550px] object-cover"
            />
            {/* Floating experience card */}
            <div className="absolute -bottom-8 right-4 lg:right-8 bg-brand text-white p-6">
              <span className="heading-display text-5xl block">22+</span>
              <span className="text-xs uppercase tracking-[0.15em] font-semibold text-white/80">Anos de Experiência</span>
            </div>
          </div>

          {/* Text side */}
          <div className="lg:col-span-6 reveal-right pt-4 lg:pt-12">
            <span className="section-label mb-6 block">Sobre a Clínica de Medicina Diagnóstica</span>
            <h2 className="heading-display text-5xl sm:text-6xl text-text mb-8">
              SOBRE A{" "}
              <br />
              <span className="text-brand">TOTAL QUALITY</span>
            </h2>
            <p className="text-lg text-text-light leading-relaxed mb-8">
              Fundada em 2003 em Caraguatatuba - SP, a Total Quality Medicina Diagnóstica é reconhecida como
              <strong className="text-text"> "a clínica mais completa do Litoral Norte de São Paulo"</strong>. Nossa trajetória de
              mais de 20 anos é marcada pela excelência em{" "}
              <Link href="/exames/tomografia-computadorizada" className="text-brand hover:underline">
                tomografia
              </Link>
              ,{" "}
              <Link href="/exames/ultrassonografia" className="text-brand hover:underline">
                ultrassonografia
              </Link>
              ,{" "}
              <Link href="/exames/mamografia" className="text-brand hover:underline">
                mamografia
              </Link>
              ,{" "}
              <Link href="/laboratorio-caraguatatuba" className="text-brand hover:underline">
                exames laboratoriais
              </Link>{" "}
              e atendimento humanizado.
            </p>

            {/* Highlight cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="border border-black/10 p-5">
                <Leaf className="w-5 h-5 text-brand mb-3" />
                <p className="text-sm font-semibold text-text mb-1">Sustentabilidade</p>
                <p className="text-xs text-text-muted">85% da energia proveniente de painéis solares</p>
              </div>
              <div className="border border-black/10 p-5">
                <GraduationCap className="w-5 h-5 text-brand mb-3" />
                <p className="text-sm font-semibold text-text mb-1">Parceria Acadêmica</p>
                <p className="text-xs text-text-muted">Convênio com UNITAU para ensino e pesquisa</p>
              </div>
            </div>

            <button
              onClick={() => {
                const el = document.querySelector("#contato");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-pill"
            >
              Entre em Contato
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Values */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-[1px] bg-brand" />
            <h3 className="heading-display text-3xl text-text">NOSSOS VALORES</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-0">
            {values.map((item, i) => (
              <div
                key={item.title}
                className={`reveal p-8 ${i < values.length - 1 ? "border-r border-black/10" : ""}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-10 h-10 flex items-center justify-center text-brand mb-6">
                  <item.icon className="w-6 h-6" />
                </div>
                <h4 className="heading-display text-2xl text-text mb-3">{item.title.toUpperCase()}</h4>
                <p className="text-text-muted leading-relaxed text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline + Clinic Image */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-[1px] bg-brand" />
              <h3 className="heading-display text-3xl text-text">NOSSA TRAJETÓRIA</h3>
            </div>
            <div className="space-y-0">
              {timeline.map((item, i) => (
                <div
                  key={item.year}
                  className={`reveal flex gap-6 py-8 ${i < timeline.length - 1 ? "border-b border-black/10" : ""}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <span className="heading-display text-4xl text-brand shrink-0 w-20">{item.year}</span>
                  <div>
                    <h4 className="font-semibold text-text mb-1">{item.title}</h4>
                    <p className="text-sm text-text-muted">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7 reveal-right">
            <ResponsiveImage
              slug="fachada"
              widths={[480, 768, 1024]}
              sizes="(max-width: 1024px) 100vw, 58vw"
              width={1024}
              height={843}
              alt="Clínica Total Quality Medicina Diagnóstica em Caraguatatuba - SP - Estrutura moderna com equipamentos de tomografia e diagnóstico por imagem"
              className="w-full h-[350px] lg:h-[450px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
