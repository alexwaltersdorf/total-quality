/*
 * Design: "Warm Clinical" — Humanized Material Design 3
 * Sobre: Split layout with image + text, values cards, timeline
 */
import { Target, Eye, Heart, ShieldCheck, Leaf, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const TEAM_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/medical-team-bJWUj4Z8SJ7BtHxaBpEYBR.webp";
const CLINIC_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/clinic-exterior-8oyYmBoVFJpB6wf6Twf6p4.webp";

const values = [
  {
    icon: Target,
    title: "Missão",
    description: "Oferecer diagnósticos precisos e atendimento humanizado, contribuindo para a saúde e bem-estar de nossos pacientes.",
    color: "bg-teal-50 text-teal-600 border-teal-100",
  },
  {
    icon: Eye,
    title: "Visão",
    description: "Ser reconhecida como a principal referência em Medicina Diagnóstica no Litoral Norte de São Paulo.",
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    icon: Heart,
    title: "Valores",
    description: "Ética, qualidade, inovação tecnológica, sustentabilidade e compromisso com a excelência no atendimento.",
    color: "bg-rose-50 text-rose-600 border-rose-100",
  },
];

const timeline = [
  { year: "2003", title: "Fundação", description: "Início das atividades com foco em diagnóstico de qualidade", icon: ShieldCheck },
  { year: "2015", title: "Expansão", description: "Ampliação da estrutura e incorporação de novas tecnologias", icon: GraduationCap },
  { year: "2020", title: "Sustentabilidade", description: "Implementação do sistema de energia solar sustentável", icon: Leaf },
];

export default function SobreSection() {
  return (
    <section id="sobre" className="py-20 lg:py-28">
      <div className="container">
        {/* Main about block */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* Image side */}
          <div className="reveal-left relative">
            <div className="rounded-[28px] overflow-hidden shadow-xl">
              <img
                src={TEAM_IMG}
                alt="Equipe Total Quality"
                className="w-full h-[400px] lg:h-[480px] object-cover"
              />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -right-4 lg:right-4 bg-white rounded-3xl shadow-xl p-5 border border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-teal-700">22</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Anos de</p>
                  <p className="text-teal-600 font-semibold">Experiência</p>
                </div>
              </div>
            </div>
          </div>

          {/* Text side */}
          <div className="reveal-right">
            <span className="inline-block text-sm font-semibold text-teal-600 tracking-wider uppercase mb-3">
              Sobre Nós
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Sobre a <span className="text-teal-600">Total Quality</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Fundada em 2003, a Total Quality Medicina Diagnóstica é reconhecida como 
              <strong className="text-foreground"> "a mais completa do Litoral Norte"</strong>. Nossa trajetória de mais de 20 anos é marcada pela constante busca pela excelência em diagnósticos médicos.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100">
                <div className="flex items-center gap-2 mb-1">
                  <Leaf className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-semibold text-teal-700">Sustentabilidade</span>
                </div>
                <p className="text-sm text-teal-600/80">Pioneiros na região com 85% da energia proveniente de painéis solares.</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">Parceria Acadêmica</span>
                </div>
                <p className="text-sm text-blue-600/80">Convênio com UNITAU para ensino, pesquisa e constante evolução.</p>
              </div>
            </div>
            <Button
              className="rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow-md transition-all ripple-effect"
              onClick={() => {
                const el = document.querySelector("#contato");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Entre em Contato
            </Button>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h3 className="reveal text-center text-2xl font-bold text-foreground mb-10">Nossos Valores</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            {values.map((item, i) => (
              <div
                key={item.title}
                className={`reveal bg-card rounded-[28px] p-8 border border-border/50 hover:shadow-md transition-all duration-300`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">{item.title}</h4>
                <p className="text-muted-foreground leading-relaxed text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline + Clinic Image */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="reveal text-2xl font-bold text-foreground mb-10">Nossa Trajetória</h3>
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <div key={item.year} className="reveal flex gap-5" style={{ transitionDelay: `${i * 150}ms` }}>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-teal-600" />
                    </div>
                    {i < timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-teal-100 mt-2" />
                    )}
                  </div>
                  <div className="pb-8">
                    <span className="text-sm font-bold text-teal-600">{item.year}</span>
                    <h4 className="text-lg font-semibold text-foreground mt-1">{item.title}</h4>
                    <p className="text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal-right rounded-[28px] overflow-hidden shadow-xl">
            <img
              src={CLINIC_IMG}
              alt="Clínica Total Quality - Exterior"
              className="w-full h-[350px] lg:h-[420px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
