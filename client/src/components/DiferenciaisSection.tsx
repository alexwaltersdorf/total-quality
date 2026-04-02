/*
 * Design: "Warm Clinical" — Humanized Material Design 3
 * Diferenciais: 6 cards with tonal elevation, icons, staggered reveal
 */
import {
  Award,
  Cpu,
  Sun,
  GraduationCap,
  Globe,
  Stethoscope,
} from "lucide-react";

const diferenciais = [
  {
    icon: Award,
    title: "Mais de 20 anos de experiência",
    description: "Tradição e confiança no cuidado com sua saúde desde 2003.",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: Cpu,
    title: "Tecnologia de última geração",
    description: "Equipamentos modernos para diagnósticos precisos e confiáveis.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Sun,
    title: "85% de energia solar",
    description: "Compromisso com o meio ambiente e sustentabilidade energética.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Stethoscope,
    title: "Equipe altamente qualificada",
    description: "Profissionais especializados e dedicados ao seu bem-estar.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: GraduationCap,
    title: "Parceria acadêmica com UNITAU",
    description: "Ensino e pesquisa para constante evolução e inovação.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: Globe,
    title: "Resultados online 24h",
    description: "Acesso rápido e seguro aos seus exames a qualquer momento.",
    color: "bg-emerald-50 text-emerald-600",
  },
];

export default function DiferenciaisSection() {
  return (
    <section id="diferenciais" className="py-20 lg:py-28">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="reveal inline-block text-sm font-semibold text-teal-600 tracking-wider uppercase mb-3">
            Nossos Diferenciais
          </span>
          <h2 className="reveal text-3xl sm:text-4xl font-bold text-foreground mb-4" style={{ transitionDelay: "100ms" }}>
            Por que escolher a <span className="text-teal-600">Total Quality</span>?
          </h2>
          <p className="reveal text-lg text-muted-foreground" style={{ transitionDelay: "200ms" }}>
            Nossos diferenciais fazem toda a diferença no cuidado com sua saúde e bem-estar
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {diferenciais.map((item, i) => (
            <div
              key={item.title}
              className="reveal group bg-card rounded-[28px] p-8 hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-teal-200/50"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Recognition badge */}
        <div className="reveal mt-12 text-center" style={{ transitionDelay: "500ms" }}>
          <div className="inline-flex items-center gap-3 bg-teal-50 text-teal-700 px-6 py-3 rounded-full text-sm font-medium border border-teal-100">
            <Award className="w-5 h-5" />
            Reconhecida como referência no Litoral Norte de São Paulo
          </div>
        </div>
      </div>
    </section>
  );
}
