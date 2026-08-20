/*
 * Style: Optik Editorial — Hub de exames (silo de SEO)
 * Página-índice que organiza todos os exames por categoria e distribui
 * links internos para as páginas individuais — pilar do silo de
 * "exames laboratoriais / análises clínicas" (auditoria SEMrush jul/2026).
 */
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { useCanonical, useMetaDescription } from "@/components/SEOHead";
import { examesData, type ExamData } from "@/lib/examesData";

const CATEGORIES: Array<{ key: ExamData["category"]; label: string; blurb: string }> = [
  {
    key: "laboratorio",
    label: "Exames Laboratoriais",
    blurb: "Análises clínicas com coleta rápida e resultados online em até 24 horas para a maioria dos exames.",
  },
  {
    key: "imagem",
    label: "Diagnóstico por Imagem",
    blurb: "Equipamentos modernos e laudos rápidos, sem precisar sair do Litoral Norte.",
  },
  {
    key: "cardiologia",
    label: "Cardiologia",
    blurb: "Avaliação completa do coração, do ECG ao monitoramento de 24 horas.",
  },
  {
    key: "neurologia",
    label: "Neurologia",
    blurb: "Exames neurológicos não invasivos com equipe especializada.",
  },
  {
    key: "outros",
    label: "Medicina Ocupacional e Outros",
    blurb: "Exames admissionais, periódicos, demissionais e ASO para empresas da região.",
  },
];

function ExamCard({ exam }: { exam: ExamData }) {
  return (
    <Link href={`/exames/${exam.slug}`} className="group block border border-border rounded-2xl p-6 hover:border-brand transition-colors duration-300">
      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">{exam.subtitle}</span>
      <h3 className="heading-display text-2xl text-text group-hover:text-brand transition-colors duration-300 mt-2 mb-3">
        {exam.shortTitle}
      </h3>
      <p className="text-text-light leading-relaxed text-sm">{exam.description}</p>
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.1em] text-brand mt-4 group-hover:gap-3 transition-all duration-300">
        Ver exame <ArrowUpRight className="w-4 h-4" />
      </div>
    </Link>
  );
}

export default function ExamesHub() {
  useCanonical("https://totalquality.med.br/exames");
  useMetaDescription(
    "Todos os exames da Total Quality em Caraguatatuba: exames laboratoriais, hemograma, ultrassom, tomografia, cardiológicos, ocupacionais e mais. Veja a lista completa."
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <header className="max-w-3xl mb-16">
            <span className="section-label mb-6 block">Nossos Exames</span>
            <h1 className="heading-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] text-text mb-6">
              Exames Laboratoriais e de Imagem em Caraguatatuba
            </h1>
            <p className="text-text-light leading-relaxed text-lg">
              Mais de 3.000 tipos de exames em um só endereço, no Centro de Caraguatatuba:
              análises clínicas, diagnóstico por imagem, cardiologia e medicina ocupacional.
              Resultados online em até 24 horas para a maioria dos exames laboratoriais.
            </p>
          </header>

          {CATEGORIES.map((cat) => {
            const exams = examesData.filter((e) => e.category === cat.key);
            if (exams.length === 0) return null;
            return (
              <section key={cat.key} className="mb-16">
                <h2 className="heading-display text-3xl text-text mb-2">{cat.label}</h2>
                <p className="text-text-light mb-8">{cat.blurb}</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exams.map((exam) => (
                    <ExamCard key={exam.slug} exam={exam} />
                  ))}
                </div>
              </section>
            );
          })}

          <section className="mb-8">
            <h2 className="heading-display text-3xl text-text mb-8">Também na Total Quality</h2>
            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
              <Link href="/bioimpedancia" className="group block border border-border rounded-2xl p-6 hover:border-brand transition-colors duration-300">
                <h3 className="heading-display text-2xl text-text group-hover:text-brand transition-colors duration-300 mb-3">Bioimpedância</h3>
                <p className="text-text-light text-sm">Análise completa de composição corporal com resultado na hora.</p>
              </Link>
              <Link href="/checkup" className="group block border border-border rounded-2xl p-6 hover:border-brand transition-colors duration-300">
                <h3 className="heading-display text-2xl text-text group-hover:text-brand transition-colors duration-300 mb-3">Check-up Preventivo</h3>
                <p className="text-text-light text-sm">Pacotes completos de exames por faixa etária.</p>
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
