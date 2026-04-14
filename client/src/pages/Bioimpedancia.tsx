/*
 * Style: Optik Editorial — Giant display type, asymmetric layout, brand #9B212B
 * Theme: Dark gray background, white text
 * Page: Bioimpedância
 */
import { useEffect, useRef } from "react";
import { ArrowUpRight, ArrowLeft, Zap, TrendingUp, Droplets, Bone, Flame, Scale, Target, Users, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import WhatsAppFAB from "@/components/WhatsAppFAB";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/bioimpedancia-hero-JBi4rGhcubZh8PJVdKomAz.webp";
const DETAIL_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/bioimpedancia-detail-impYZJEExk9frRXt9avf3V.webp";

const metrics = [
  { icon: Scale, title: "Massa Muscular", desc: "Quantidade total de músculo esquelético no corpo, essencial para metabolismo e mobilidade." },
  { icon: Droplets, title: "Gordura Corporal", desc: "Percentual de tecido adiposo em relação ao peso total, indicador-chave de saúde metabólica." },
  { icon: Zap, title: "Água Corporal", desc: "Nível de hidratação intra e extracelular, fundamental para o funcionamento dos órgãos." },
  { icon: Bone, title: "Massa Óssea", desc: "Densidade mineral dos ossos, importante para prevenir osteoporose e fraturas." },
  { icon: Flame, title: "Taxa Metabólica Basal", desc: "Calorias que seu corpo queima em repouso, base para planejamento nutricional." },
  { icon: BarChart3, title: "Gordura Visceral", desc: "Gordura ao redor dos órgãos internos, fator de risco para doenças cardiovasculares." },
];

const whoNeeds = [
  { icon: TrendingUp, title: "Atletas e Esportistas", desc: "Otimize sua composição corporal para melhor desempenho e recuperação." },
  { icon: Target, title: "Emagrecimento", desc: "Monitore se está perdendo gordura ou massa muscular durante a dieta." },
  { icon: Users, title: "Acompanhamento Nutricional", desc: "Dados precisos para nutricionistas ajustarem planos alimentares." },
  { icon: Flame, title: "Saúde Metabólica", desc: "Avalie riscos metabólicos como resistência à insulina e síndrome metabólica." },
];

const faqs = [
  { q: "O exame de bioimpedância dói?", a: "Não. O exame é completamente indolor e não invasivo. Uma corrente elétrica de baixíssima intensidade percorre o corpo, imperceptível ao paciente." },
  { q: "Quanto tempo dura o exame?", a: "O exame leva aproximadamente 5 a 10 minutos. Os resultados são gerados instantaneamente após a medição." },
  { q: "Preciso de algum preparo?", a: "Sim. Recomendamos jejum de 4 horas, não praticar exercícios 12 horas antes, não consumir álcool 24 horas antes e estar bem hidratado." },
  { q: "Com que frequência devo repetir?", a: "Para acompanhamento, recomendamos a cada 3 meses. Para atletas ou programas de emagrecimento, pode ser mensal." },
  { q: "Gestantes podem fazer?", a: "Não é recomendado para gestantes e portadores de marcapasso cardíaco. Consulte seu médico antes de realizar o exame." },
];

export default function Bioimpedancia() {
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
    <div ref={wrapperRef} className="min-h-screen bg-surface">
      {/* Sticky top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-dark/95 backdrop-blur-md border-b border-white/10">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <ArrowLeft className="w-5 h-5 text-white/50 group-hover:text-brand transition-colors" />
            <span className="heading-display text-2xl tracking-tight text-white group-hover:text-brand transition-colors">
              TOTAL QUALITY
            </span>
          </Link>
          <button
            onClick={() => window.open("https://wa.me/5512997743535?text=Olá! Gostaria de agendar um exame de Bioimpedância.", "_blank")}
            className="btn-pill"
          >
            Agendar Exame
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
                <span className="section-label mb-6 block">Composição Corporal</span>
              </div>
              <h1 className="reveal heading-display text-[clamp(3rem,8vw,6.5rem)] text-white leading-[0.85] mb-6" style={{ transitionDelay: "100ms" }}>
                BIO
                <br />
                <span className="text-brand">IMPEDÂNCIA</span>
              </h1>
              <p className="reveal text-lg text-white/60 leading-relaxed max-w-md mb-8" style={{ transitionDelay: "200ms" }}>
                Conheça seu corpo por dentro. A bioimpedância é o exame mais preciso e acessível para analisar sua composição corporal completa: gordura, músculo, água e muito mais.
              </p>
              <div className="reveal flex flex-wrap gap-4 mb-12" style={{ transitionDelay: "300ms" }}>
                <button
                  onClick={() => window.open("https://wa.me/5512997743535?text=Olá! Gostaria de agendar um exame de Bioimpedância.", "_blank")}
                  className="btn-pill-brand btn-pill"
                >
                  Agendar Exame
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { const el = document.querySelector("#metricas"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
                  className="btn-pill bg-transparent !text-white border border-white/20 hover:!bg-white/10"
                >
                  O que Analisa
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="reveal grid grid-cols-3 gap-6" style={{ transitionDelay: "400ms" }}>
                {[
                  { value: "10min", label: "Duração\ndo Exame" },
                  { value: "6+", label: "Métricas\nAnalisadas" },
                  { value: "0", label: "Dor ou\nDesconforto" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="heading-display text-4xl text-brand">{stat.value}</p>
                    <p className="text-xs text-white/50 uppercase tracking-wider mt-1 whitespace-pre-line">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7 reveal-right">
              <div className="relative">
                <img src={HERO_IMG} alt="Exame de Bioimpedância" className="w-full h-[50vh] lg:h-[75vh] object-cover" />
                <div className="absolute bottom-6 left-6 bg-surface-dark/95 backdrop-blur-sm p-5 max-w-xs">
                  <p className="text-xs uppercase tracking-[0.15em] font-semibold text-brand mb-1">Não Invasivo</p>
                  <p className="text-sm text-white/60">Exame rápido, indolor e com resultados imediatos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Bioimpedance */}
      <section className="py-24 lg:py-32 border-t border-white/10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <span className="section-label mb-6 block">O Exame</span>
              <h2 className="heading-display text-[clamp(2.5rem,5vw,4.5rem)] text-white leading-[0.9] mb-6">
                O QUE É A<br /><span className="text-brand">BIOIMPEDÂNCIA?</span>
              </h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  A bioimpedância elétrica (BIA) é um método de avaliação da composição corporal que utiliza uma corrente elétrica de baixa intensidade para medir a resistência dos diferentes tecidos do corpo.
                </p>
                <p>
                  Como a água conduz eletricidade e os tecidos magros contêm mais água que o tecido adiposo, o exame consegue diferenciar com precisão a quantidade de gordura, músculo, água e massa óssea do seu corpo.
                </p>
                <p>
                  Na Total Quality, utilizamos equipamentos de bioimpedância multifrequencial, que oferecem resultados segmentados por região do corpo (braços, pernas, tronco), proporcionando uma análise muito mais detalhada e precisa.
                </p>
              </div>
            </div>
            <div className="reveal-right">
              <img src={DETAIL_IMG} alt="Relatório de composição corporal" className="w-full h-auto object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section id="metricas" className="py-24 lg:py-32 bg-surface-dark">
        <div className="container">
          <div className="reveal text-center mb-16">
            <span className="section-label mb-6 inline-block">Métricas Analisadas</span>
            <h2 className="heading-display text-[clamp(2.5rem,5vw,4.5rem)] text-white leading-[0.9] mb-4">
              O QUE O EXAME <span className="text-brand">REVELA</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Cada métrica oferece informações valiosas sobre sua saúde e composição corporal.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {metrics.map((m, i) => (
              <div
                key={m.title}
                className="reveal bg-surface p-8 border border-white/10 hover:border-brand/30 transition-all duration-300 group"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-surface-dark text-brand flex-shrink-0 group-hover:bg-brand group-hover:text-white transition-all duration-300">
                    <m.icon className="w-5 h-5" />
                  </div>
                  <h3 className="heading-display text-xl text-white pt-2">{m.title}</h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Needs Section */}
      <section className="py-24 lg:py-32 bg-surface">
        <div className="container">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5">
              <div className="reveal lg:sticky lg:top-28">
                <span className="section-label mb-6 block">Indicações</span>
                <h2 className="heading-display text-[clamp(2.5rem,5vw,4.5rem)] text-white leading-[0.9] mb-6">
                  PARA QUEM É<br /><span className="text-brand">INDICADO?</span>
                </h2>
                <p className="text-white/60 text-lg leading-relaxed">
                  A bioimpedância é uma ferramenta versátil, útil tanto para atletas de alto rendimento quanto para quem busca melhorar a saúde e a forma física.
                </p>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="space-y-0">
                {whoNeeds.map((item, i) => (
                  <div key={item.title} className="reveal flex gap-6 py-8 border-b border-white/10" style={{ transitionDelay: `${i * 100}ms` }}>
                    <div className="w-14 h-14 flex items-center justify-center bg-surface-dark text-brand flex-shrink-0">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="heading-display text-2xl text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preparation Section */}
      <section className="py-24 lg:py-32 bg-surface-dark">
        <div className="container">
          <div className="reveal text-center mb-16">
            <span className="section-label mb-6 inline-block">Preparo</span>
            <h2 className="heading-display text-[clamp(2.5rem,5vw,4.5rem)] text-white leading-[0.9] mb-4">
              COMO SE <span className="text-brand">PREPARAR</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: "01", title: "Jejum", desc: "Manter jejum de 4 horas antes do exame." },
              { num: "02", title: "Exercícios", desc: "Não praticar atividade física 12 horas antes." },
              { num: "03", title: "Álcool", desc: "Evitar consumo de álcool 24 horas antes." },
              { num: "04", title: "Hidratação", desc: "Manter-se bem hidratado nas 24 horas anteriores." },
            ].map((step, i) => (
              <div key={step.num} className="reveal text-center" style={{ transitionDelay: `${i * 100}ms` }}>
                <span className="number-outline text-7xl block mb-4">{step.num}</span>
                <h3 className="heading-display text-xl text-white mb-2">{step.title}</h3>
                <p className="text-sm text-white/50">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 lg:py-32 bg-surface">
        <div className="container">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4">
              <div className="reveal lg:sticky lg:top-28">
                <span className="section-label mb-6 block">Dúvidas</span>
                <h2 className="heading-display text-[clamp(2.5rem,5vw,4rem)] text-white leading-[0.9] mb-6">
                  PERGUNTAS<br /><span className="text-brand">FREQUENTES</span>
                </h2>
                <p className="text-white/60 leading-relaxed">
                  Tire suas dúvidas sobre o exame de bioimpedância. Se precisar de mais informações, entre em contato conosco.
                </p>
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="space-y-0">
                {faqs.map((faq, i) => (
                  <details key={i} className="reveal group border-b border-white/10" style={{ transitionDelay: `${i * 80}ms` }}>
                    <summary className="flex items-center justify-between py-6 cursor-pointer list-none">
                      <h3 className="heading-display text-xl text-white group-hover:text-brand transition-colors pr-4">{faq.q}</h3>
                      <span className="heading-display text-2xl text-brand flex-shrink-0 transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <div className="pb-6 pr-12">
                      <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-brand text-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="reveal">
              <h2 className="heading-display text-[clamp(2.5rem,5vw,5rem)] leading-[0.85] mb-6">
                CONHEÇA SEU<br /><span className="text-white/80">CORPO POR DENTRO</span>
              </h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-md mb-8">
                Agende seu exame de bioimpedância e tenha dados precisos para tomar as melhores decisões sobre sua saúde, nutrição e treino.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => window.open("https://wa.me/5512997743535?text=Olá! Gostaria de agendar um exame de Bioimpedância.", "_blank")}
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
                <h3 className="heading-display text-2xl mb-6">INFORMAÇÕES DO EXAME</h3>
                <div className="space-y-4">
                  {[
                    { label: "Duração", value: "5 a 10 minutos" },
                    { label: "Preparo", value: "Jejum de 4h, sem exercícios 12h antes" },
                    { label: "Resultado", value: "Imediato, entregue na hora" },
                    { label: "Contraindicação", value: "Gestantes e portadores de marcapasso" },
                    { label: "Frequência", value: "Recomendado a cada 3 meses" },
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
      <section className="py-12 border-t border-white/10 bg-surface-dark">
        <div className="container flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-white/50 hover:text-brand transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </Link>
          <Link href="/checkup" className="flex items-center gap-2 text-sm text-white/50 hover:text-brand transition-colors">
            Check-Up Preventivo
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <WhatsAppFAB />
    </div>
  );
}
