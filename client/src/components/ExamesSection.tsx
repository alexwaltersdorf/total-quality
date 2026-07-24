/*
 * Style: Optik Editorial — Large image panels, minimal tabs
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 */
import { useState } from "react";
import { trackExamCategorySelect, trackScheduleExam } from "@/lib/tracking";
import {
  Scan,
  HeartPulse,
  FlaskConical,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { Link } from "wouter";

const DIAGNOSTIC_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/optik-lab_848f61cd.png";
const CARDIOLOGY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/optik-cardiology_f4f4a6c3.png";
const LAB_IMG = "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80";

type Category = "imagem" | "cardiologia" | "laboratorio";

const categories = [
  { id: "imagem" as Category, label: "Diagnóstico por Imagem", shortLabel: "Imagem", icon: Scan },
  { id: "cardiologia" as Category, label: "Cardiologia", shortLabel: "Cardio", icon: HeartPulse },
  { id: "laboratorio" as Category, label: "Laboratório e Exames de Sangue", shortLabel: "Lab", icon: FlaskConical },
];

const examData: Record<Category, { image: string; tag: string; exams: string[]; description: string }> = {
  imagem: {
    image: DIAGNOSTIC_IMG,
    tag: "Tecnologia de Última Geração",
    description: "Equipamentos de ponta para diagnósticos por imagem em Caraguatatuba. Tomografia computadorizada multislice, ultrassonografia geral e Doppler, mamografia digital e raio-X digital com alta precisão e rapidez nos resultados.",
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
    description: "Exames cardiológicos completos em Caraguatatuba com profissionais especializados. Eletrocardiograma, MAPA 24h, Holter 24h e check-up cardiovascular com equipamentos modernos.",
    exams: [
      "Eletrocardiograma (ECG)",
      "MAPA - Pressão Arterial",
      "Holter 24h",
      "Check-up Cardiovascular",
    ],
  },
  laboratorio: {
    image: LAB_IMG,
    tag: "Análises Clínicas e Exames de Sangue",
    description: "Laboratório de análises clínicas completo em Caraguatatuba com mais de 3.000 tipos de exames de sangue e laboratoriais. Hemograma, glicemia, colesterol, triglicerídeos, TSH, T4 livre, PSA, vitamina D, ácido úrico, ureia, creatinina, TGO, TGP, hemoglobina glicada, hormônios e marcadores tumorais com resultados online em até 24 horas.",
    exams: [
      "Hemograma Completo e Exames de Sangue",
      "Glicemia, Colesterol e Triglicerídeos",
      "Hormônios (TSH, T4, Estradiol, Testosterona)",
      "PSA, Vitamina D e Marcadores Tumorais",
      "Ureia, Creatinina, TGO, TGP e Ácido Úrico",
      "Hemoglobina Glicada e Exame de Urina",
    ],
  },
};

export default function ExamesSection() {
  const [active, setActive] = useState<Category>("imagem");
  const data = examData[active];

  return (
    <section id="exames" className="py-24 lg:py-32 bg-surface-dark" aria-label="Exames de sangue, laboratoriais e diagnósticos na Total Quality Caraguatatuba">
      <div className="container">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div>
            <span className="reveal section-label mb-4 block">Exames de Sangue, Laboratoriais e Diagnósticos em Caraguatatuba</span>
            <h2 className="reveal heading-display text-5xl sm:text-6xl lg:text-7xl text-text" style={{ transitionDelay: "100ms" }}>
              PRINCIPAIS
              <br />
              <span className="text-brand">EXAMES</span>
            </h2>
          </div>
          <p className="reveal text-text-light max-w-md text-lg leading-relaxed" style={{ transitionDelay: "200ms" }}>
            Oferecemos mais de 3.000 tipos de Exames Laboratoriais, Diagnósticos por Imagem e Cardiologicos em Caraguatatuba - SP. 
Hemograma, Glicemia, Colesterol, Hormônios, Vitaminas, Tomografia Computadorizada, Ultrassonografia, Raio-x, Eletrocardiograma, Espirometria, Eletroencefalograma com tecnologia de ponta.
          </p>
        </div>

        {/* Category tabs */}
        <div className="reveal flex gap-2 mb-12" style={{ transitionDelay: "300ms" }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActive(cat.id); trackExamCategorySelect(cat.id); }}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 border ${
                active === cat.id
                  ? "bg-text text-white border-text"
                  : "bg-transparent text-text-light border-black/15 hover:border-black/30"
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
              alt={`Exame de ${categories.find(c => c.id === active)?.label} na Total Quality Medicina Diagnóstica Caraguatatuba`}
              className="w-full h-[400px] lg:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              width="2400"
              height="1792"
            />
            <div className="absolute top-6 left-6">
              <span className="inline-block bg-white/90 backdrop-blur-sm text-text text-xs font-semibold uppercase tracking-[0.12em] px-4 py-2">
                {data.tag}
              </span>
            </div>
          </div>

          {/* Exam list panel */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <p className="text-lg text-text-light leading-relaxed mb-8">
                {data.description}
              </p>
              <div className="space-y-0">
                {data.exams.map((exam, i) => (
                  <div
                    key={exam}
                    className="flex items-center gap-4 py-5 border-b border-black/10 group/item hover:pl-2 transition-all duration-300"
                  >
                    <Check className="w-4 h-4 text-brand shrink-0" />
                    <span className="text-text font-medium">{exam}</span>
                    <span className="number-outline !text-3xl ml-auto opacity-30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={() => { trackScheduleExam("exames_section", active); window.open("https://wa.me/551238873535?text=Olá! Gostaria de agendar um exame.", "_blank"); }}
                className="btn-pill-brand btn-pill"
              >
                Agendar Exame
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <Link
                href="/checkup"
                className="btn-pill !bg-transparent !text-text border border-black/15 hover:!bg-black/5"
              >
                Check-Up
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/bioimpedancia"
                className="btn-pill !bg-transparent !text-text border border-black/15 hover:!bg-black/5"
              >
                Bioimpedância
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
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
              <p className="text-xs text-text-muted uppercase tracking-wider mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
