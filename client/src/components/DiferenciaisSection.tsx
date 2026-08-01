/*
 * Style: Optik Editorial — Numbered list with outline numbers
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 * SEO: Keywords in headings, descriptions, and aria-labels
 */
import {
  Award,
  Cpu,
  Sun,
  Stethoscope,
  GraduationCap,
  Globe,
} from "lucide-react";

const diferenciais = [
  {
    icon: Award,
    title: "Mais de 20 anos de experiência em medicina diagnóstica",
    description: "Tradição e confiança no cuidado com sua saúde desde 2003 em Caraguatatuba e Litoral Norte de São Paulo.",
  },
  {
    icon: Cpu,
    title: "Tecnologia de última geração em exames diagnósticos",
    description: "Equipamentos modernos de tomografia, ultrassonografia, mamografia digital e laboratório automatizado para exames de sangue e análises clínicas com diagnósticos precisos e confiáveis.",
  },
  {
    icon: Sun,
    title: "85% de energia solar — clínica sustentável",
    description: "Compromisso com o meio ambiente e sustentabilidade energética na nossa clínica em Caraguatatuba.",
  },
  {
    icon: Stethoscope,
    title: "Equipe Médica Altamente Qualificada",
    description: "Profissionais especializados em cardiologia, diagnóstico por imagem, análises clínicas e exames laboratoriais dedicados ao seu bem-estar.",
  },
  {
    icon: GraduationCap,
    title: "Parceria acadêmica com UNITAU",
    description: "Ensino e pesquisa para constante evolução e inovação em medicina diagnóstica e laboratorial.",
  },
  {
    icon: Globe,
    title: "Resultados de exames online",
    description: "Acesso rápido e seguro aos seus laudos de exames de sangue, hemograma, glicemia, colesterol, tomografia, ultrassonografia e mamografia a qualquer momento.",
  },
];

export default function DiferenciaisSection() {
  return (
    <section id="diferenciais" className="py-24 lg:py-32 bg-white" aria-label="Diferenciais da Total Quality - Laboratório e Medicina Diagnóstica Caraguatatuba">
      <div className="container">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-20">
          <div>
            <span className="reveal section-label mb-4 block">Diferenciais da Clínica</span>
            <h2 className="reveal heading-display text-5xl sm:text-6xl lg:text-7xl text-text" style={{ transitionDelay: "100ms" }}>
              NOSSOS{" "}
              <br />
              <span className="text-brand">DIFERENCIAIS</span>
            </h2>
          </div>
          <p className="reveal text-text-light max-w-md text-lg leading-relaxed" style={{ transitionDelay: "200ms" }}>
            Nossos diferenciais em Medicina Diagnóstica e Laboratório de Análises Clínicas fazem toda a diferença no cuidado com sua saúde. 
Referência em exames de sangue, diagnóstico por imagem, cardiologia e prevenção no Litoral Norte de São Paulo.
          </p>
        </div>

        {/* Divider */}
        <div className="divider-line mb-16" />

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {diferenciais.map((item, i) => (
            <article
              key={item.title}
              className="reveal group"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start gap-5">
                <span className="number-outline select-none" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="pt-4">
                  <div className="w-10 h-10 flex items-center justify-center text-brand mb-4 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-text mb-2">{item.title}</h3>
                  <p className="text-text-muted leading-relaxed text-sm">{item.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Recognition badge */}
        <div className="reveal mt-20 flex items-center gap-4" style={{ transitionDelay: "500ms" }}>
          <div className="w-12 h-[1px] bg-brand" />
          <p className="text-sm font-medium text-text-muted uppercase tracking-wider">
            Reconhecida como referência em exames laboratoriais, exames de sangue e medicina diagnóstica no Litoral Norte de São Paulo
          </p>
        </div>
      </div>
    </section>
  );
}
