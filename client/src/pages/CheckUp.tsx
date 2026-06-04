/*
 * Style: Optik Editorial — Giant display type, asymmetric layout, brand #9B212B
 * Theme: White background, dark gray #5A5A5A text
 * Page: Check-Up Preventivo
 */
import { useEffect, useRef } from "react";
import { ArrowUpRight, Heart, Shield, Activity, Clock, CheckCircle, Stethoscope, FlaskConical, Brain } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { useCanonical, useMetaDescription } from "@/components/SEOHead";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/checkup-hero-DYtfLmtu8bZzaLQHsJcbup.webp";
const PROCESS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/checkup-process-5wKyH9PSvZxL2VqGetV3Ee.webp";
const BENEFITS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/checkup-benefits-njjKnjogX8LscDAYEdH4o9.webp";

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
  { icon: Shield, title: "Prevenção", desc: "Detecte condições de saúde antes que se tornem problemas graves. A prevenção é o melhor tratamento." },
  { icon: Activity, title: "Monitoramento", desc: "Acompanhe a evolução dos seus indicadores de saúde ao longo do tempo com relatórios comparativos." },
  { icon: Clock, title: "Agilidade", desc: "Todos os exames realizados em um único dia, com resultados em até 48 horas úteis." },
  { icon: Heart, title: "Cuidado Integral", desc: "Equipe multidisciplinar que analisa seus resultados de forma integrada e personalizada." },
];

const processSteps = [
  { num: "01", title: "Agendamento", desc: "Entre em contato pelo WhatsApp ou telefone e escolha a melhor data. Enviaremos as orientações de preparo." },
  { num: "02", title: "Coleta e Exames", desc: "No dia agendado, realize todos os exames laboratoriais e de imagem em nossa clínica, com conforto e agilidade." },
  { num: "03", title: "Análise Médica", desc: "Nossa equipe médica analisa todos os resultados de forma integrada, identificando padrões e riscos." },
  { num: "04", title: "Laudo e Orientação", desc: "Receba seu laudo completo com recomendações personalizadas e, se necessário, encaminhamento especializado." },
];

export default function CheckUp() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Check-Up Preventivo em Caraguatatuba | Laboratório Total Quality";
  }, []);

  // SEO: Meta description e canonical
  useMetaDescription("Check-up preventivo em Caraguatatuba - SP na Total Quality. Pacotes Básico, Select e Premium com hemograma, colesterol, tomografia e ecocardiograma. Agende.");
  useCanonical("/checkup");

  useEffect(() => {
    const root = wrapperRef.current;
    if (!root) return;
    const els = root.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pb-24 px-4 bg-white">
        <div className="container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="reveal-left">
            <p className="text-sm font-semibold text-brand mb-4 tracking-wide">SAÚDE PREVENTIVA</p>
            <h1 className="heading-display text-5xl lg:text-6xl mb-6 leading-tight">
              CHECK-UP <span className="text-brand">PREVENTIVO</span>
            </h1>
            <p className="text-lg text-text-muted mb-8 max-w-lg leading-relaxed">
              Avaliação completa da sua saúde com exames laboratoriais e de imagem. Escolha o plano que melhor se adequa às suas necessidades.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.open("https://wa.me/551238873535?text=Olá! Gostaria de agendar um Check-Up.", "_blank")}
                className="btn-pill !bg-brand !text-white hover:!bg-brand-dark"
              >
                Agendar Check-Up
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <a href="tel:+551238873535" className="btn-pill bg-transparent !text-text border border-black/20 hover:!bg-black/5">
                Ligar: (12) 3887-3535
              </a>
            </div>
          </div>
          <div className="reveal-right">
            <img src={HERO_IMG} alt="Check-Up Preventivo" className="w-full rounded-lg shadow-lg" />
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16 reveal">
            <p className="text-sm font-semibold text-brand mb-4 tracking-wide">NOSSOS PACOTES</p>
            <h2 className="heading-display text-4xl lg:text-5xl mb-6">
              ESCOLHA SEU <span className="text-brand">CHECK-UP</span>
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
                    onClick={() => window.open("https://wa.me/551238873535?text=Olá! Gostaria de agendar o " + pkg.title + ".", "_blank")}
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
              POR QUE FAZER UM <span className="text-brand">CHECK-UP</span>
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
                PROCESSO <span className="text-brand">SIMPLES</span>
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
              <img src={PROCESS_IMG} alt="Processo de Check-Up" className="w-full rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-brand text-white">
        <div className="container text-center reveal">
          <h2 className="heading-display text-4xl lg:text-5xl mb-6">
            PRONTO PARA CUIDAR DA SUA SAÚDE?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Agende seu check-up agora e comece sua jornada em direção a uma vida mais saudável e preventiva.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.open("https://wa.me/551238873535?text=Olá! Gostaria de agendar um Check-Up.", "_blank")}
              className="btn-pill bg-white text-brand hover:bg-white/90"
            >
              Agendar pelo WhatsApp
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <a href="tel:+551238873535" className="btn-pill bg-transparent text-white border border-white/30 hover:bg-white/10">
              Ligar: (12) 3887-3535
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
