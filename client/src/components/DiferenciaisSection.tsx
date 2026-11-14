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
import { anosDeAtuacao } from "@shared/const";

const diferenciais = [
  {
    icon: Award,
    title: `Mais de ${anosDeAtuacao()} anos de experiência em medicina diagnóstica`,
    description: "Tradição e confiança no cuidado com sua saúde desde 2003 em Caraguatatuba e Litoral Norte de São Paulo.",
  },
  {
    icon: Cpu,
    title: "Equipamentos digitais e laboratório automatizado",
    description: "Equipamentos modernos de tomografia, ultrassonografia, raio-X e laboratório automatizado para exames de sangue e análises clínicas.",
  },
  {
    icon: Sun,
    title: "85% de energia solar — clínica sustentável",
    description: "Compromisso com o meio ambiente e sustentabilidade energética na nossa clínica em Caraguatatuba.",
  },
  {
    icon: Stethoscope,
    title: "Equipe médica especializada",
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
    description: "Acesso rápido e seguro aos seus laudos de exames de sangue, hemograma, glicemia, colesterol, tomografia e ultrassonografia a qualquer momento.",
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
            Exames de sangue, diagnóstico por imagem, cardiologia e prevenção no mesmo endereço, no Centro de Caraguatatuba, desde 2003.
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
            Mais de 30.000 famílias atendidas no Litoral Norte de São Paulo
          </p>
        </div>
      </div>
    </section>
  );
}
