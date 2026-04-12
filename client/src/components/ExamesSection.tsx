/*
 * Style: Optik Editorial — Large image panels, minimal tabs, clean typography
 * Exames: Category switcher with editorial image + exam list
 */
import { useState } from "react";
import {
  Scan,
  HeartPulse,
  FlaskConical,
  ArrowUpRight,
  Check,
} from "lucide-react";

const DIAGNOSTIC_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/optik-lab_848f61cd.png";
const CARDIOLOGY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/optik-cardiology_f4f4a6c3.png";
const LAB_IMG = "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80";

type Category = "imagem" | "cardiologia" | "laboratorio";

const categories = [
  { id: "imagem" as Category, label: "Diagnóstico por Imagem", shortLabel: "Imagem", icon: Scan },
  { id: "cardiologia" as Category, label: "Cardiologia", shortLabel: "Cardio", icon: HeartPulse },
  { id: "laboratorio" as Category, label: "Laboratório", shortLabel: "Lab", icon: FlaskConical },
];

const examData: Record<Category, { image: string; tag: string; exams: string[]; description: string }> = {
  imagem: {
    image: DIAGNOSTIC_IMG,
    tag: "Tecnologia de Última Geração",
    description: "Equipamentos de ponta para diagnósticos por imagem com alta precisão e rapidez nos resultados.",
    exams: [
      "Tomografia Computadorizada Multislice",
      "Ultrassonografia Geral e Doppler",
      "Mamografia Digital",
      "Raio-X Digital",
    ],
  },
  cardiologia: {
    image: CARDIOLOGY_IMG,
    tag: "Cuidado Especializado",
    description: "Exames cardiológicos completos com profissionais especializados e equipamentos modernos.",
    exams: [
      "Eletrocardiograma (ECG)",
      "MAPA - Pressão Arterial",
      "Holter 24h",
      "Check-up Cardiovascular",
    ],
  },
  laboratorio: {
    image: LAB_IMG,
    tag: "Análises Clínicas",
    description: "Laboratório completo com mais de 3.000 tipos de exames e resultados em até 24 horas.",
    exams: [
      "Exames de Rotina",
      "Análises de Alta Complexidade",
      "Hormônios e Marcadores",
      "Exames Especializados",
    ],
  },
};

export default function ExamesSection() {
  const [active, setActive] = useState<Category>("imagem");
  const data = examData[active];

  return (
    <section id="exames" className="py-24 lg:py-32 bg-[#f7f7f5]">
      <div className="container">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div>
            <span className="reveal section-label mb-4 block">Nossos Exames</span>
            <h2 className="reveal heading-display text-5xl sm:text-6xl lg:text-7xl text-foreground" style={{ transitionDelay: "100ms" }}>
              PRINCIPAIS
              <br />
              <span className="text-brand">EXAMES</span>
            </h2>
          </div>
          <p className="reveal text-muted-foreground max-w-md text-lg leading-relaxed" style={{ transitionDelay: "200ms" }}>
            Oferecemos uma ampla gama de exames diagnósticos com tecnologia de ponta e resultados confiáveis.
          </p>
        </div>

        {/* Category tabs - Optik style */}
        <div className="reveal flex gap-2 mb-12" style={{ transitionDelay: "300ms" }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 border ${
                active === cat.id
                  ? "bg-foreground text-white border-foreground"
                  : "bg-transparent text-foreground/60 border-black/10 hover:border-black/30"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{cat.label}</span>
              <span className="sm:hidden">{cat.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* Exam content - editorial layout */}
        <div className="reveal grid lg:grid-cols-12 gap-8 items-stretch" style={{ transitionDelay: "400ms" }}>
          {/* Image panel */}
          <div className="lg:col-span-7 relative overflow-hidden group">
            <img
              src={data.image}
              alt={categories.find(c => c.id === active)?.label}
              className="w-full h-[350px] lg:h-[520px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-6 left-6">
              <span className="inline-block bg-white/95 backdrop-blur-sm text-xs font-semibold uppercase tracking-[0.12em] px-4 py-2">
                {data.tag}
              </span>
            </div>
          </div>

          {/* Exam list panel */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {data.description}
              </p>
              <div className="space-y-0">
                {data.exams.map((exam, i) => (
                  <div
                    key={exam}
                    className="flex items-center gap-4 py-5 border-b border-black/5 group/item hover:pl-2 transition-all duration-300"
                  >
                    <Check className="w-4 h-4 text-brand shrink-0" />
                    <span className="text-foreground font-medium">{exam}</span>
                    <span className="number-outline !text-3xl ml-auto opacity-30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={() => window.open("https://wa.me/5512997743535?text=Olá! Gostaria de agendar um exame.", "_blank")}
                className="btn-pill-brand btn-pill"
              >
                Agendar Exame
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="reveal grid grid-cols-2 sm:grid-cols-4 gap-8 mt-20 pt-12 border-t border-black/10" style={{ transitionDelay: "500ms" }}>
          {[
            { value: "24H", label: "Resultados em até" },
            { value: "3K+", label: "Tipos de exames" },
            { value: "22", label: "Anos de experiência" },
            { value: "2003", label: "Cuidando de você desde" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="heading-display text-4xl lg:text-5xl text-brand">{stat.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
