/*
 * Style: Optik Editorial — Giant display type, asymmetric layout, brand #9B212B
 * Theme: White background, dark gray #5A5A5A text
 * Page: Check-Up Preventivo
 */
import { useEffect, useRef } from "react";
import { ArrowUpRight, ArrowLeft, Heart, Shield, Activity, Clock, CheckCircle, Stethoscope, FlaskConical, Brain } from "lucide-react";
import { Link } from "wouter";
import WhatsAppFAB from "@/components/WhatsAppFAB";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/checkup-hero-DYtfLmtu8bZzaLQHsJcbup.webp";
const PROCESS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/checkup-process-5wKyH9PSvZxL2VqGetV3Ee.webp";
const BENEFITS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/checkup-benefits-njjKnjogX8LscDAYEdH4o9.webp";

const checkupPackages = [
  {
    title: "Check-Up Básico",
    subtitle: "Avaliação essencial",
    items: [
      "Hemograma completo", "Glicemia de jejum", "Colesterol total e frações",
      "Triglicerídeos", "Creatinina e Ureia", "TGO e TGP", "Urina tipo I", "Eletrocardiograma",
    ],
    highlight: false,
  },
  {
    title: "Check-Up Completo",
    subtitle: "Avaliação abrangente",
    items: [
      "Todos os exames do Básico", "TSH e T4 Livre", "PSA (homens) / Papanicolau (mulheres)",
      "Ácido úrico", "Vitamina D", "Hemoglobina glicada", "Raio-X de tórax",
      "Ultrassonografia abdominal", "Ecocardiograma", "Teste ergométrico",
    ],
    highlight: true,
  },
  {
    title: "Check-Up Premium",
    subtitle: "Avaliação completa + imagem",
    items: [
      "Todos os exames do Completo", "Tomografia de tórax", "Ressonância magnética",
      "Doppler de carótidas", "Holter 24h", "MAPA 24h", "Densitometria óssea",
      "Bioimpedância corporal", "Avaliação nutricional", "Consulta cardiológica",
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

  useEffect(() => { window.scrollTo(0, 0); }, []);

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
      {/* Sticky top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/10">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <ArrowLeft className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" />
            <span className="heading-display text-2xl tracking-tight text-text group-hover:text-brand transition-colors">
              TOTAL QUALITY
            </span>
          </Link>
          <button
            onClick={() => window.open("https://wa.me/5512997743535?text=Olá! Gostaria de agendar um Check-Up.", "_blank")}
            className="btn-pill"
          >
            Agendar Check-Up
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 lg:pt-28">
        <div className="container">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-5 pt-8 lg:pt-16">
              <div className="reveal">
                <span className="section-label mb-6 block">Saúde Preventiva</span>
              </div>
              <h1 className="reveal heading-display text-[clamp(3rem,8vw,7rem)] text-text leading-[0.85] mb-6" style={{ transitionDelay: "100ms" }}>
                CHECK-UP
                <br />
                <span className="text-brand">PREVENTIVO</span>
              </h1>
              <p className="reveal text-lg text-text-light leading-relaxed max-w-md mb-8" style={{ transitionDelay: "200ms" }}>
                Cuide da sua saúde de forma completa. Nossos pacotes de check-up combinam exames laboratoriais, de imagem e cardiológicos para uma avaliação abrangente do seu estado de saúde.
              </p>
              <div className="reveal flex flex-wrap gap-4 mb-12" style={{ transitionDelay: "300ms" }}>
                <button
                  onClick={() => window.open("https://wa.me/5512997743535?text=Olá! Gostaria de agendar um Check-Up.", "_blank")}
                  className="btn-pill-brand btn-pill"
                >
                  Agendar Agora
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { const el = document.querySelector("#pacotes"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
                  className="btn-pill bg-transparent !text-text border border-black/20 hover:!bg-black/5"
                >
                  Ver Pacotes
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="reveal grid grid-cols-3 gap-6" style={{ transitionDelay: "400ms" }}>
                {[
                  { value: "48h", label: "Resultado\nem até" },
                  { value: "30+", label: "Exames\nDisponíveis" },
                  { value: "1", label: "Dia para\nTodos Exames" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="heading-display text-4xl text-brand">{stat.value}</p>
                    <p className="text-xs text-text-muted uppercase tracking-wider mt-1 whitespace-pre-line">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7 reveal-right">
              <div className="relative">
                <img src={HERO_IMG} alt="Check-Up Preventivo" className="w-full h-[50vh] lg:h-[75vh] object-cover" />
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-5 max-w-xs shadow-sm">
                  <p className="text-xs uppercase tracking-[0.15em] font-semibold text-brand mb-1">Tecnologia Avançada</p>
                  <p className="text-sm text-text-light">Equipamentos de última geração para diagnósticos precisos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 reveal-left">
              <img src={BENEFITS_IMG} alt="Benefícios do check-up preventivo" className="w-full h-[400px] lg:h-[500px] object-cover" />
            </div>
            <div className="lg:col-span-7">
              <div className="reveal">
                <span className="section-label mb-6 block">Por que fazer?</span>
                <h2 className="heading-display text-[clamp(2.5rem,5vw,4.5rem)] text-text leading-[0.9] mb-4">
                  BENEFÍCIOS DO<br /><span className="text-brand">CHECK-UP</span>
                </h2>
                <p className="text-text-light text-lg leading-relaxed max-w-lg mb-12">
                  A medicina preventiva é a forma mais inteligente de cuidar da saúde. Descubra problemas antes que eles apareçam.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-8">
                {benefits.map((b, i) => (
                  <div key={b.title} className="reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-surface-dark text-brand flex-shrink-0">
                        <b.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="heading-display text-xl text-text mb-2">{b.title}</h3>
                        <p className="text-sm text-text-muted leading-relaxed">{b.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="pacotes" className="py-24 lg:py-32 bg-surface-dark">
        <div className="container">
          <div className="reveal text-center mb-16">
            <span className="section-label mb-6 inline-block">Nossos Pacotes</span>
            <h2 className="heading-display text-[clamp(2.5rem,5vw,4.5rem)] text-text leading-[0.9]">
              ESCOLHA SEU <span className="text-brand">CHECK-UP</span>
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {checkupPackages.map((pkg, i) => (
              <div
                key={pkg.title}
                className={`reveal p-8 lg:p-10 transition-all duration-300 ${
                  pkg.highlight
                    ? "bg-brand text-white ring-2 ring-brand"
                    : "bg-white border border-black/10 hover:border-brand/30"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {pkg.highlight && (
                  <span className="inline-block text-[10px] uppercase tracking-[0.2em] font-semibold bg-white text-brand px-3 py-1 mb-6">
                    Mais Popular
                  </span>
                )}
                <h3 className={`heading-display text-3xl mb-1 ${pkg.highlight ? "text-white" : "text-text"}`}>{pkg.title}</h3>
                <p className={`text-sm mb-8 ${pkg.highlight ? "text-white/70" : "text-text-muted"}`}>{pkg.subtitle}</p>
                <ul className="space-y-3 mb-10">
                  {pkg.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${pkg.highlight ? "text-white/80" : "text-brand"}`} />
                      <span className={`text-sm ${pkg.highlight ? "text-white/90" : "text-text-light"}`}>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => window.open(`https://wa.me/5512997743535?text=Olá! Gostaria de agendar o ${pkg.title}.`, "_blank")}
                  className={`w-full py-3.5 text-xs uppercase tracking-[0.15em] font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    pkg.highlight
                      ? "bg-white text-brand hover:bg-white/90"
                      : "bg-brand text-white hover:bg-brand-dark"
                  }`}
                >
                  Agendar {pkg.title}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-6">
              <div className="reveal">
                <span className="section-label mb-6 block">Como Funciona</span>
                <h2 className="heading-display text-[clamp(2.5rem,5vw,4.5rem)] text-text leading-[0.9] mb-12">
                  PROCESSO<br /><span className="text-brand">SIMPLIFICADO</span>
                </h2>
              </div>
              <div className="space-y-0">
                {processSteps.map((step, i) => (
                  <div key={step.num} className="reveal flex gap-6 py-8 border-b border-black/10" style={{ transitionDelay: `${i * 100}ms` }}>
                    <span className="number-outline text-6xl flex-shrink-0 w-20">{step.num}</span>
                    <div>
                      <h3 className="heading-display text-2xl text-text mb-2">{step.title}</h3>
                      <p className="text-sm text-text-muted leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-6 reveal-right lg:sticky lg:top-28">
              <img src={PROCESS_IMG} alt="Laboratório moderno" className="w-full h-[400px] lg:h-[600px] object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Who Should Section */}
      <section className="py-24 lg:py-32 bg-surface-dark">
        <div className="container">
          <div className="reveal text-center mb-16">
            <span className="section-label mb-6 inline-block">Indicações</span>
            <h2 className="heading-display text-[clamp(2.5rem,5vw,4.5rem)] text-text leading-[0.9] mb-4">
              QUEM DEVE FAZER <span className="text-brand">CHECK-UP?</span>
            </h2>
            <p className="text-text-light text-lg max-w-2xl mx-auto">
              O check-up é recomendado para todas as idades, mas é especialmente importante em determinadas situações.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: "Acima de 40 Anos", desc: "A partir desta idade, o risco de doenças cardiovasculares e metabólicas aumenta significativamente." },
              { icon: Stethoscope, title: "Histórico Familiar", desc: "Se há casos de diabetes, hipertensão, câncer ou doenças cardíacas na família." },
              { icon: Activity, title: "Sedentários", desc: "Pessoas com estilo de vida sedentário precisam monitorar indicadores metabólicos regularmente." },
              { icon: FlaskConical, title: "Pré-Operatório", desc: "Avaliação completa antes de procedimentos cirúrgicos para garantir segurança." },
              { icon: Brain, title: "Estresse Elevado", desc: "Profissionais com alta carga de estresse devem monitorar a saúde cardiovascular." },
              { icon: Shield, title: "Prevenção Geral", desc: "Qualquer pessoa que deseja manter a saúde em dia e prevenir doenças silenciosas." },
            ].map((item, i) => (
              <div
                key={item.title}
                className="reveal bg-white p-8 border border-black/10 hover:border-brand/30 transition-all duration-300"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <item.icon className="w-6 h-6 text-brand mb-4" />
                <h3 className="heading-display text-xl text-text mb-2">{item.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-brand text-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="reveal">
              <h2 className="heading-display text-[clamp(2.5rem,5vw,5rem)] leading-[0.85] mb-6">
                AGENDE SEU<br /><span className="text-white/80">CHECK-UP HOJE</span>
              </h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-md mb-8">
                Não espere os sintomas aparecerem. A prevenção é o melhor caminho para uma vida longa e saudável.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => window.open("https://wa.me/5512997743535?text=Olá! Gostaria de agendar um Check-Up.", "_blank")}
                  className="btn-pill !bg-white !text-brand hover:!bg-white/90"
                >
                  Agendar pelo WhatsApp
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <a href="tel:1238873535" className="btn-pill bg-transparent !text-white border border-white/30 hover:!bg-white/10">
                  (12) 3887-3535
                </a>
              </div>
            </div>
            <div className="reveal-right">
              <div className="bg-white/10 border border-white/20 p-8 lg:p-10">
                <h3 className="heading-display text-2xl mb-6">INFORMAÇÕES IMPORTANTES</h3>
                <div className="space-y-4">
                  {[
                    { label: "Horário", value: "Segunda a Sexta, 08h às 18h" },
                    { label: "Local", value: "Rua Padre Anchieta, 1010 - Centro, Caraguatatuba-SP" },
                    { label: "Preparo", value: "Jejum de 12 horas para exames laboratoriais" },
                    { label: "Resultados", value: "Disponíveis em até 48 horas úteis" },
                    { label: "Convênios", value: "Aceitamos os principais convênios médicos" },
                  ].map((info) => (
                    <div key={info.label} className="flex justify-between items-start py-3 border-b border-white/20">
                      <span className="text-xs uppercase tracking-[0.15em] font-semibold text-white/50">{info.label}</span>
                      <span className="text-sm text-white/90 text-right max-w-[60%]">{info.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="py-12 border-t border-black/10 bg-white">
        <div className="container flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-text-muted hover:text-brand transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </Link>
          <Link href="/bioimpedancia" className="flex items-center gap-2 text-sm text-text-muted hover:text-brand transition-colors">
            Bioimpedância
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <WhatsAppFAB />
    </div>
  );
}
