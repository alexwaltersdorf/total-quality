/*
 * Design: "Warm Clinical" — Humanized Material Design 3
 * Exames: Segmented buttons (M3) to switch categories, cards with images
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Scan,
  HeartPulse,
  FlaskConical,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const DIAGNOSTIC_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/diagnostic-imaging-8S85QSz9GbEmgULFuXDY9D.webp";
const CARDIOLOGY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/cardiology-exam-U6dxugLfZrFfd7i3DAN5Mi.webp";
const LAB_IMG = "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80";

type Category = "imagem" | "cardiologia" | "laboratorio";

const categories = [
  { id: "imagem" as Category, label: "Diagnóstico por Imagem", icon: Scan },
  { id: "cardiologia" as Category, label: "Cardiologia", icon: HeartPulse },
  { id: "laboratorio" as Category, label: "Laboratório", icon: FlaskConical },
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
    <section id="exames" className="py-20 lg:py-28 bg-secondary/50">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="reveal inline-block text-sm font-semibold text-teal-600 tracking-wider uppercase mb-3">
            Nossos Exames
          </span>
          <h2 className="reveal text-3xl sm:text-4xl font-bold text-foreground mb-4" style={{ transitionDelay: "100ms" }}>
            Principais <span className="text-teal-600">Exames</span>
          </h2>
          <p className="reveal text-lg text-muted-foreground" style={{ transitionDelay: "200ms" }}>
            Oferecemos uma ampla gama de exames diagnósticos com tecnologia de ponta e resultados confiáveis
          </p>
        </div>

        {/* M3 Segmented Buttons */}
        <div className="reveal flex justify-center mb-12" style={{ transitionDelay: "300ms" }}>
          <div className="inline-flex bg-card rounded-full p-1.5 border border-border/50 shadow-sm">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  active === cat.id
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Exam content */}
        <div className="reveal grid lg:grid-cols-2 gap-8 items-center" style={{ transitionDelay: "400ms" }}>
          {/* Image */}
          <div className="relative rounded-[28px] overflow-hidden shadow-lg group">
            <img
              src={data.image}
              alt={categories.find(c => c.id === active)?.label}
              className="w-full h-[350px] lg:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full border border-white/20">
                {data.tag}
              </span>
            </div>
          </div>

          {/* Exam list */}
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {data.description}
            </p>
            <div className="space-y-3">
              {data.exams.map((exam) => (
                <div
                  key={exam}
                  className="flex items-center gap-3 bg-card p-4 rounded-2xl border border-border/50 hover:border-teal-200 hover:shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                  <span className="font-medium text-foreground">{exam}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                className="rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow-md transition-all ripple-effect"
                onClick={() => window.open("https://wa.me/5512997743535?text=Olá! Gostaria de agendar um exame.", "_blank")}
              >
                Agendar Exame
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-teal-200 text-teal-700 hover:bg-teal-50"
              >
                Ver todos os exames
              </Button>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="reveal grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16" style={{ transitionDelay: "500ms" }}>
          {[
            { value: "24h", label: "Resultados em até" },
            { value: "3.000+", label: "Tipos de exames" },
            { value: "22 anos", label: "De experiência" },
            { value: "Desde 2003", label: "Cuidando de você" },
          ].map((stat) => (
            <div key={stat.label} className="text-center py-4">
              <p className="text-2xl font-bold text-teal-700">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
