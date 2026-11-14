/*
 * Style: Optik Editorial — Giant display type, asymmetric layout, brand #9B212B
 * Theme: White background, dark gray #5A5A5A text
 * Page: Check-Up Preventivo
 */
import { useEffect } from "react";
import { trackScheduleCheckup } from "@/lib/tracking";
import { useTelefoneRedirect, useWhatsAppRedirect } from "@/contexts/ContatoLeadContext";
import { ArrowUpRight, Heart, Shield, Activity, Clock, CheckCircle, Stethoscope, FlaskConical, Brain, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { useCanonical, useMetaDescription } from "@/components/SEOHead";
import { CHECKUP_TITLE, CHECKUP_DESCRIPTION } from "@shared/const";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { CHECKUP_FAQS } from "@/lib/paginasServico";
import OndeFazer from "@/components/OndeFazer";

const HERO_IMG = "/images/recepcao-1024.webp";
const PROCESS_IMG = "/images/laboratorio-1024.webp";
const BENEFITS_IMG = "/images/fachada-1024.webp";

const checkupPackages = [
  {
    title: "Check-Up Básico",
    subtitle: "19 Exames - Avaliação essencial",
    items: [
      "Hemograma Completo",
      "Glicemia",
      "Hemoglobina Glicada",
      "Insulina",
      "Ferritina",
      "Avaliação básica da Tiroíde: TSH",
      "Perfil Lipídico (Colesterol Total, LDL, HDL, NÃO-HDL, VLDL, Triglicerídeos)",
      "Avaliação da Função do Fígado: TGO, TGP, Gama GT",
      "Avaliação da Função dos Rins: Ureia, Creatinina, Ácido Úrico, Urina Tipo I",
    ],
    highlight: false,
  },
  {
    title: "Check-Up Select",
    subtitle: "30 Exames - Avaliação abrangente",
    items: [
      "Avaliação Cardiológica: Eletrocardiograma, Espirometria, RX Tórax",
      "Testosterona (Hormônio relacionado à massa muscular, saúde óssea e libido)",
      "VHS (Avalia processo de inflamação no Organismo)",
      "Sódio",
      "Potássio",
      "Fosfatase Alcalina",
      "Vitamina B12",
      "Vitamina D",
      "Hemograma Completo",
      "Glicemia",
      "Hemoglobina Glicada",
      "Insulina",
      "Ferritina",
      "Avaliação da Tiroíde: TSH, T3, T4 Livre",
      "Perfil Lipídico (Colesterol Total, LDL, HDL, NÃO-HDL, VLDL, Triglicerídeos)",
      "Avaliação da Função do Fígado: TGO, TGP, Gama GT",
      "Avaliação da Função dos Rins: Ureia, Creatinina, Ácido Úrico, Urina Tipo I",
    ],
    highlight: true,
  },
  {
    title: "Check-Up Premium",
    subtitle: "39 Exames - Avaliação completa + imagem",
    items: [
      "Avaliação Cerebral: Eletroencefalograma",
      "Avaliação Pulmonar: Espirometria",
      "Avaliação Cardiológica: MAPA, Holter, RX Tórax",
      "Testosterona",
      "VHS (Avalia processo de inflamação no Organismo)",
      "Cortisol (Hormônio relacionado ao Estresse)",
      "PCR",
      "Sódio",
      "Potássio",
      "Vitamina B12",
      "Vitamina D",
      "Vitamina C",
      "Hemograma Completo",
      "Glicemia",
      "Hemoglobina Glicada",
      "Insulina",
      "Ferritina",
      "Avaliação da Tiroíde: TSH, T3, T4 Livre",
      "Colesterol Total, LDL, HDL, NÃO-HDL, VLDL, Triglicerídeos",
      "TGO, TGP, Gama GT, Fosfatase Alcalina",
      "Ureia, Creatinina, Ácido Úrico, Urina Tipo I",
      "CEA, CA 19-9, Sangue Oculto nas Fezes",
    ],
    highlight: false,
  },
];

const benefits = [
  // "A prevenção é o melhor tratamento" saiu (superlativo, CFM 2.336/2023).
  { icon: Shield, title: "Prevenção", desc: "Detecte condições de saúde antes que se tornem problemas graves." },
  { icon: Activity, title: "Monitoramento", desc: "Acompanhe a evolução dos seus indicadores de saúde ao longo do tempo com relatórios comparativos." },
  // Era "resultados em até 48 horas úteis": prazo prometido (decisão do Alex,
  // 14/11/2026 — resultado é "em curto prazo", nunca um número de horas).
  { icon: Clock, title: "Agilidade", desc: "Todos os exames realizados em um único dia, com resultados em curto prazo." },
  { icon: Heart, title: "Cuidado Integral", desc: "Equipe multidisciplinar que analisa seus resultados de forma integrada e personalizada." },
];

const processSteps = [
  { num: "01", title: "Agendamento", desc: "Entre em contato pelo WhatsApp ou telefone e escolha a melhor data. Enviaremos as orientações de preparo." },
  { num: "02", title: "Coleta e Exames", desc: "No dia agendado, realize todos os exames laboratoriais e de imagem em nossa clínica, com conforto e agilidade." },
  { num: "03", title: "Análise Médica", desc: "Nossa equipe médica analisa todos os resultados de forma integrada, identificando padrões e riscos." },
  { num: "04", title: "Laudo e Orientação", desc: "Receba seu laudo completo com recomendações personalizadas e, se necessário, encaminhamento especializado." },
];

export default function CheckUp() {
  const openWhatsApp = useWhatsAppRedirect();
  const abrirTelefone = useTelefoneRedirect();
  const wrapperRef = useScrollReveal();

  useEffect(() => {
    window.scrollTo(0, 0);
    // SEO: Título otimizado 30-60 caracteres (46 chars)
    document.title = CHECKUP_TITLE;
  }, []);

  // SEO: Meta description e canonical (155 caracteres - ideal: 150-160)
  useMetaDescription(CHECKUP_DESCRIPTION);
  useCanonical("/checkup");

  // SEO: Schema.org LocalBusiness para melhorar visibilidade local
  /*
   * REMOVIDO EM 06/09/2026 — duplicava o @id do schema.
   *
   * O hook injetava um segundo bloco MedicalBusiness com o MESMO @id
   * (#medicalbusiness) do bloco que ja vem no index.html em todas as paginas,
   * mas com conteudo diferente. Dois nos com o mesmo @id e dados conflitantes
   * sao ambiguos para o Google, e /checkup era uma das 12 paginas que o Semrush
   * marcou com dado estruturado invalido em 06/09.
   *
   * O bloco do index.html e mais completo e, por vir no HTML pre-renderizado,
   * o rastreador ve mesmo sem executar JavaScript. Nao reintroduzir aqui.
   */

  // BreadcrumbList e FAQPage: emitidos pelo servidor no <head>, dos mesmos
  // dados desta pagina (seo-content.ts). O useSchemaBreadcrumb que ficava aqui
  // repetia o breadcrumb no navegador (SEO nov/2026, Fase 1).

  return (
    <div ref={wrapperRef} className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pb-24 px-4 bg-white">
        <div className="container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="reveal-left">
            <span className="section-label mb-4 block">Saúde preventiva</span>
            {/* H1 = CHECKUP_H1 ("Check-up Preventivo em Caraguatatuba"). */}
            <h1 className="heading-display mb-6 leading-tight">
              <span className="block text-5xl lg:text-6xl">
                Check-up <span className="text-brand">Preventivo</span>
              </span>{" "}
              <span className="block font-sans text-base lg:text-lg text-text-light font-light tracking-wide mt-2 normal-case leading-normal">
                em Caraguatatuba
              </span>
            </h1>
            <p className="text-lg text-text-muted mb-8 max-w-lg leading-relaxed">
              Avaliação completa da sua saúde com exames laboratoriais e de imagem. Escolha o plano que melhor se adequa às suas necessidades.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => { trackScheduleCheckup("geral"); openWhatsApp("checkup_geral", "Olá! Gostaria de agendar um Check-Up."); }}
                className="btn-pill"
              >
                Agendar Check-Up
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => abrirTelefone("checkup_topo")} className="btn-pill bg-transparent !text-text border border-black/20 hover:!bg-black/5">
                Ligar: (12) 3887-3535
              </button>
            </div>
          </div>
          <div className="reveal-right">
            <img src={HERO_IMG} alt="Check-up preventivo na Total Quality em Caraguatatuba - SP - exames laboratoriais e de imagem em um só lugar" className="w-full rounded-lg shadow-lg" />
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16 reveal">
            <span className="section-label mb-4 inline-flex">Nossos pacotes</span>
            <h2 className="heading-display text-4xl lg:text-5xl mb-6">
              Escolha seu <span className="text-brand">check-up</span>
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Três opções de pacotes para atender diferentes necessidades de saúde e prevenção.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {checkupPackages.map((pkg, idx) => (
              <div
                key={idx}
                className={`reveal rounded-lg overflow-hidden transition-all ${
                  pkg.highlight
                    ? "md:scale-105 bg-brand text-white shadow-2xl"
                    : "bg-white text-text shadow-lg hover:shadow-xl"
                }`}
              >
                {pkg.highlight && (
                  <div className="bg-white/20 px-4 py-2 text-center text-sm font-semibold tracking-wide">
                    MAIS POPULAR
                  </div>
                )}
                <div className="p-8">
                  <h3 className={`text-2xl font-bold mb-2 ${pkg.highlight ? "text-white" : "text-brand"}`}>
                    {pkg.title}
                  </h3>
                  <p className={`text-sm mb-6 ${pkg.highlight ? "text-white/80" : "text-text-muted"}`}>
                    {pkg.subtitle}
                  </p>

                  <div className="space-y-3 mb-8">
                    {pkg.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${pkg.highlight ? "text-white" : "text-brand"}`} />
                        <span className={`text-sm leading-relaxed ${pkg.highlight ? "text-white/90" : "text-text-muted"}`}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => { trackScheduleCheckup(pkg.title); openWhatsApp(`checkup_pkg_${pkg.title}`, "Olá! Gostaria de agendar o " + pkg.title + "."); }}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                      pkg.highlight
                        ? "bg-white text-brand hover:bg-white/90"
                        : "bg-brand text-white hover:bg-brand-dark"
                    }`}
                  >
                    Agendar {pkg.title.split(" ")[1]}
                    <ArrowUpRight className="w-3.5 h-3.5 inline ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container">
          <div className="text-center mb-16 reveal">
            <p className="text-sm font-semibold text-brand mb-4 tracking-wide">BENEFÍCIOS</p>
            <h2 className="heading-display text-4xl lg:text-5xl mb-6">
              Por que fazer um <span className="text-brand">check-up</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="reveal bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-all">
                  <Icon className="w-12 h-12 text-brand mb-4" />
                  <h3 className="text-xl font-bold mb-3 text-text">{benefit.title}</h3>
                  <p className="text-text-muted leading-relaxed">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="reveal-left">
              <p className="text-sm font-semibold text-brand mb-4 tracking-wide">COMO FUNCIONA</p>
              <h2 className="heading-display text-4xl lg:text-5xl mb-8">
                Processo <span className="text-brand">simples</span>
              </h2>

              <div className="space-y-6">
                {processSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-brand text-white font-bold text-lg">
                        {step.num}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text mb-2">{step.title}</h3>
                      <p className="text-text-muted leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal-right">
              <img src={PROCESS_IMG} alt="Etapas do check-up preventivo na clínica Total Quality em Caraguatatuba - SP" className="w-full rounded-lg shadow-lg" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ: o servidor publicava estas perguntas (e o FAQPage) e a pagina
          nao as mostrava (SEO nov/2026, Fase 1). */}
      <section className="py-20 px-4 bg-white">
        <div className="container max-w-3xl">
          <h2 className="reveal heading-display text-4xl lg:text-5xl mb-8">
            Perguntas <span className="text-brand">frequentes</span>
          </h2>
          <div className="space-y-4">
            {CHECKUP_FAQS.map((faq) => (
              <details key={faq.q} className="group bg-gray-50 rounded-lg border border-black/5 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-semibold text-text pr-4">{faq.q}</span>
                  <ChevronRight className="w-5 h-5 text-text-muted shrink-0 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-6 pb-6 text-text-muted leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <OndeFazer
        className="bg-gray-50 px-4"
        mensagem="Agende seu check-up preventivo pelo WhatsApp e faça os exames em uma única visita, no Centro de Caraguatatuba."
      />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-brand text-white">
        <div className="container text-center reveal">
          <h2 className="heading-display text-4xl lg:text-5xl mb-6">
            Pronto para cuidar da sua saúde?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Agende seu check-up agora e comece sua jornada em direção a uma vida mais saudável e preventiva.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => { trackScheduleCheckup("geral"); openWhatsApp("checkup_geral", "Olá! Gostaria de agendar um Check-Up."); }}
              className="btn-pill bg-white text-brand hover:bg-white/90"
            >
              Agendar pelo WhatsApp
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={() => abrirTelefone("checkup_rodape")} className="btn-pill bg-transparent text-white border border-white/30 hover:bg-white/10">
              Ligar: (12) 3887-3535
            </button>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
