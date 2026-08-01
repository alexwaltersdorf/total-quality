/*
 * Style: Optik Editorial — Large image panels, minimal tabs
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 */
import ResponsiveImage from "@/components/ResponsiveImage";
import { useState, type ReactNode } from "react";
import { trackExamCategorySelect, trackScheduleExam } from "@/lib/tracking";
import {
  Scan,
  HeartPulse,
  FlaskConical,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { Link } from "wouter";

const DIAGNOSTIC_IMG = "laboratorio";
const CARDIOLOGY_IMG = "cardiologia";
const LAB_IMG = "tomografia";

type Category = "imagem" | "cardiologia" | "laboratorio";

const categories = [
  { id: "imagem" as Category, label: "Diagnóstico por Imagem", shortLabel: "Imagem", icon: Scan },
  { id: "cardiologia" as Category, label: "Cardiologia", shortLabel: "Cardio", icon: HeartPulse },
  { id: "laboratorio" as Category, label: "Laboratório e Exames de Sangue", shortLabel: "Lab", icon: FlaskConical },
];

/*
 * Auditoria de links internos, jul/2026: esta lista era <div> + <span>. Sendo a
 * secao de exames da HOME — a pagina mais forte do site — era o maior
 * desperdicio de autoridade interna que existia. Item com `href` vira <Link>.
 *
 * Regra ao editar: so colocar `href` para pagina que EXISTE. Link para rota
 * inexistente cai no 404 real de `resolveHttpStatus` e desperdica rastreamento.
 */
type ExamItem = { name: string; href?: string };

const examData: Record<
  Category,
  { image: string; tag: string; exams: ExamItem[]; description: ReactNode }
> = {
  imagem: {
    image: DIAGNOSTIC_IMG,
    tag: "Tecnologia de Última Geração",
    description: (
      <>
        Equipamentos de ponta para diagnósticos por imagem em Caraguatatuba.{" "}
        <Link href="/exames/tomografia-computadorizada" className="text-brand hover:underline">
          Tomografia computadorizada multislice
        </Link>
        ,{" "}
        <Link href="/exames/ultrassonografia" className="text-brand hover:underline">
          ultrassonografia geral e Doppler
        </Link>
        ,{" "}
        <Link href="/exames/mamografia" className="text-brand hover:underline">
          mamografia digital
        </Link>{" "}
        e{" "}
        <Link href="/exames/raio-x" className="text-brand hover:underline">
          raio-X digital
        </Link>{" "}
        com alta precisão e rapidez nos resultados.
      </>
    ),
    exams: [
      { name: "Tomografia Computadorizada Multislice", href: "/exames/tomografia-computadorizada" },
      { name: "Ultrassonografia Geral e Doppler", href: "/exames/ultrassonografia" },
      { name: "Mamografia Digital", href: "/exames/mamografia" },
      { name: "Raio-X Digital", href: "/exames/raio-x" },
    ],
  },
  cardiologia: {
    image: CARDIOLOGY_IMG,
    tag: "Cuidado Especializado",
    description: (
      <>
        Exames cardiológicos completos em Caraguatatuba com profissionais especializados.{" "}
        <Link href="/exames/eletrocardiograma" className="text-brand hover:underline">
          Eletrocardiograma
        </Link>
        ,{" "}
        <Link href="/exames/mapa" className="text-brand hover:underline">
          MAPA 24h
        </Link>
        ,{" "}
        <Link href="/exames/holter" className="text-brand hover:underline">
          Holter 24h
        </Link>{" "}
        e{" "}
        <Link href="/checkup" className="text-brand hover:underline">
          check-up cardiovascular
        </Link>{" "}
        com equipamentos modernos.
      </>
    ),
    exams: [
      { name: "Eletrocardiograma (ECG)", href: "/exames/eletrocardiograma" },
      { name: "MAPA - Pressão Arterial", href: "/exames/mapa" },
      { name: "Holter 24h", href: "/exames/holter" },
      { name: "Check-up Cardiovascular", href: "/checkup" },
    ],
  },
  laboratorio: {
    image: LAB_IMG,
    tag: "Análises Clínicas e Exames de Sangue",
    description: (
      <>
        <Link href="/laboratorio-caraguatatuba" className="text-brand hover:underline">
          Laboratório de análises clínicas
        </Link>{" "}
        completo em Caraguatatuba com mais de 3.000 tipos de{" "}
        <Link href="/exames/exames-de-sangue" className="text-brand hover:underline">
          exames de sangue
        </Link>{" "}
        e laboratoriais.{" "}
        <Link href="/exames/hemograma" className="text-brand hover:underline">
          Hemograma
        </Link>
        , glicemia, colesterol, triglicerídeos, TSH, T4 livre, PSA,{" "}
        <Link href="/blog/vitamina-d-importancia-saude" className="text-brand hover:underline">
          vitamina D
        </Link>
        , ácido úrico, ureia, creatinina, TGO, TGP, hemoglobina glicada, hormônios e marcadores
        tumorais com resultados online em até 24 horas.
      </>
    ),
    exams: [
      { name: "Hemograma Completo e Exames de Sangue", href: "/exames/hemograma" },
      { name: "Glicemia, Colesterol e Triglicerídeos" },
      { name: "Hormônios (TSH, T4, Estradiol, Testosterona)" },
      { name: "PSA, Vitamina D e Marcadores Tumorais" },
      { name: "Ureia, Creatinina, TGO, TGP e Ácido Úrico" },
      { name: "Hemoglobina Glicada e Exame de Urina" },
      { name: "Exame Toxicológico", href: "/exames/exame-toxicologico" },
      { name: "Exame Admissional e ASO", href: "/exames/exame-admissional" },
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
            <ResponsiveImage
              slug={data.image}
              widths={[480, 768, 1024, 1440]}
              sizes="(max-width: 1024px) 100vw, 58vw"
              width={1440}
              height={1075}
              alt={`Exame de ${categories.find(c => c.id === active)?.label} na Total Quality Medicina Diagnóstica Caraguatatuba`}
              className="w-full h-[400px] lg:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
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
                {data.exams.map((exam, i) => {
                  const conteudo = (
                    <>
                      <Check className="w-4 h-4 text-brand shrink-0" />
                      <span className="text-text font-medium">{exam.name}</span>
                      <span className="number-outline !text-3xl ml-auto opacity-30">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </>
                  );
                  const base =
                    "flex items-center gap-4 py-5 border-b border-black/10 group/item hover:pl-2 transition-all duration-300";

                  return exam.href ? (
                    <Link key={exam.name} href={exam.href} className={base}>
                      {conteudo}
                    </Link>
                  ) : (
                    <div key={exam.name} className={base}>
                      {conteudo}
                    </div>
                  );
                })}
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
