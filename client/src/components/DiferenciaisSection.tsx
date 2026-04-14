/*
 * Style: Optik Editorial — Numbered list with outline numbers
 * Theme: Dark gray background, white text, brand #9B212B
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
    title: "Mais de 20 anos de experiência",
    description: "Tradição e confiança no cuidado com sua saúde desde 2003.",
  },
  {
    icon: Cpu,
    title: "Tecnologia de última geração",
    description: "Equipamentos modernos para diagnósticos precisos e confiáveis.",
  },
  {
    icon: Sun,
    title: "85% de energia solar",
    description: "Compromisso com o meio ambiente e sustentabilidade energética.",
  },
  {
    icon: Stethoscope,
    title: "Equipe altamente qualificada",
    description: "Profissionais especializados e dedicados ao seu bem-estar.",
  },
  {
    icon: GraduationCap,
    title: "Parceria acadêmica com UNITAU",
    description: "Ensino e pesquisa para constante evolução e inovação.",
  },
  {
    icon: Globe,
    title: "Resultados online 24h",
    description: "Acesso rápido e seguro aos seus exames a qualquer momento.",
  },
];

export default function DiferenciaisSection() {
  return (
    <section id="diferenciais" className="py-24 lg:py-32 bg-surface">
      <div className="container">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-20">
          <div>
            <span className="reveal section-label mb-4 block">Nossos Diferenciais</span>
            <h2 className="reveal heading-display text-5xl sm:text-6xl lg:text-7xl text-white" style={{ transitionDelay: "100ms" }}>
              POR QUE ESCOLHER
              <br />
              <span className="text-brand">A TOTAL QUALITY?</span>
            </h2>
          </div>
          <p className="reveal text-white/60 max-w-md text-lg leading-relaxed" style={{ transitionDelay: "200ms" }}>
            Nossos diferenciais fazem toda a diferença no cuidado com sua saúde e bem-estar.
          </p>
        </div>

        {/* Divider */}
        <div className="divider-line mb-16" />

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {diferenciais.map((item, i) => (
            <div
              key={item.title}
              className="reveal group"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start gap-5">
                <span className="number-outline select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="pt-4">
                  <div className="w-10 h-10 flex items-center justify-center text-brand mb-4 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-white/50 leading-relaxed text-sm">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recognition badge */}
        <div className="reveal mt-20 flex items-center gap-4" style={{ transitionDelay: "500ms" }}>
          <div className="w-12 h-[1px] bg-brand" />
          <p className="text-sm font-medium text-white/50 uppercase tracking-wider">
            Reconhecida como referência no Litoral Norte de São Paulo
          </p>
        </div>
      </div>
    </section>
  );
}
