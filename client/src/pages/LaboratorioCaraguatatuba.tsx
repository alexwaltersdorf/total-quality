/*
 * Landing page dedicada para a keyword "laboratorio caraguatatuba"
 * URL: /laboratorio-caraguatatuba
 * SEO: H1 + H2s geolocalizados, 800-1000 palavras, schema BreadcrumbList
 */
import ResponsiveImage from "@/components/ResponsiveImage";
import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowUpRight, MapPin, Phone, Clock, CheckCircle, Stethoscope, Microscope, Heart, Brain, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCanonical, useMetaDescription } from "@/components/SEOHead";
import { trackScheduleExam } from "@/lib/tracking";


/*
 * Os itens com `href` viram links internos reais (auditoria de links internos,
 * jul/2026). Antes a lista inteira era <div> + <span>: o Google via os nomes
 * dos exames como texto solto, sem caminho para as paginas que os aprofundam.
 *
 * Regra ao editar: so colocar `href` para pagina que EXISTE — item sem pagina
 * fica como texto. Link para rota inexistente cai no 404 real de
 * `resolveHttpStatus` e desperdica rastreamento.
 */
type ExamLink = { name: string; href?: string };

const examesLaboratoriais: ExamLink[] = [
  { name: "Hemograma completo", href: "/exames/hemograma" },
  { name: "Glicemia em jejum" },
  { name: "Colesterol total e frações" },
  { name: "Triglicerídeos" },
  { name: "TSH e T4 livre" },
  { name: "PSA total e livre" },
  { name: "Vitamina D", href: "/blog/vitamina-d-importancia-saude" },
  { name: "Hemoglobina glicada" },
  { name: "Ureia e creatinina" },
  { name: "TGO e TGP" },
  { name: "Ácido úrico" },
  { name: "Hormônios" },
  { name: "Marcadores tumorais" },
  { name: "Coagulograma" },
  { name: "Exame de urina" },
  { name: "Exame toxicológico", href: "/exames/exame-toxicologico" },
  { name: "Sorologias" },
  { name: "Parasitológico de fezes" },
];

const examesImagem: Array<ExamLink & { icon: typeof Microscope }> = [
  { icon: Microscope, name: "Tomografia Computadorizada Multislice", href: "/exames/tomografia-computadorizada" },
  { icon: Stethoscope, name: "Ultrassonografia Geral e Doppler", href: "/exames/ultrassonografia" },
  { icon: Shield, name: "Mamografia Digital", href: "/exames/mamografia" },
  { icon: Microscope, name: "Raio-X Digital", href: "/exames/raio-x" },
  { icon: Heart, name: "Ecocardiograma" },
  // Holter e MAPA estavam num card so; separados, cada um leva a sua pagina.
  { icon: Heart, name: "Holter 24h", href: "/exames/holter" },
  { icon: Heart, name: "MAPA 24h", href: "/exames/mapa" },
  { icon: Heart, name: "Eletrocardiograma", href: "/exames/eletrocardiograma" },
  { icon: Brain, name: "Eletroencefalograma", href: "/exames/eletroencefalograma" },
  { icon: Stethoscope, name: "Espirometria", href: "/exames/espirometria" },
  { icon: Stethoscope, name: "Bioimpedância", href: "/bioimpedancia" },
];

const convenios = [
  "Unimed", "Bradesco Saúde", "SulAmérica", "Amil", "Porto Seguro",
  "NotreDame Intermédica", "Hapvida", "Cassi", "Geap", "Outros",
];

export default function LaboratorioCaraguatatuba() {
  const scrollRef = useScrollReveal();

  useEffect(() => {
    document.title = "Laboratório em Caraguatatuba | Total Quality — Exames e Diagnósticos";
  }, []);

  useCanonical("https://totalquality.med.br/laboratorio-caraguatatuba");
  useMetaDescription("Laboratório de análises clínicas e diagnósticos em Caraguatatuba - SP. Hemograma, tomografia, ultrassom, mamografia e mais de 3.000 exames. Agende agora!");

  // Inject BreadcrumbList schema
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://totalquality.med.br/" },
        { "@type": "ListItem", "position": 2, "name": "Laboratório em Caraguatatuba", "item": "https://totalquality.med.br/laboratorio-caraguatatuba" },
      ],
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const handleScheduleClick = () => {
    trackScheduleExam("lab_caraguatatuba_cta", "geral");
    window.open("https://wa.me/551238873535?text=Olá! Gostaria de agendar um exame na Total Quality.", "_blank");
  };

  return (
    <div ref={scrollRef} className="min-h-screen bg-white">
      <Navbar />

      <main role="main">
        {/* Hero */}
        <section className="pt-28 lg:pt-36 pb-16 lg:pb-24">
          <div className="container">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7">
                <nav className="reveal text-sm text-text-light mb-6" aria-label="Breadcrumb">
                  <a href="/" className="hover:text-brand transition-colors">Início</a>
                  <span className="mx-2">›</span>
                  <span className="text-text">Laboratório em Caraguatatuba</span>
                </nav>

                <span className="section-label mb-4 block">Laboratório de Análises Clínicas</span>

                <h1 className="reveal heading-display text-4xl lg:text-5xl xl:text-6xl text-text mb-6">
                  LABORATÓRIO EM{" "}
                  <span className="text-brand">CARAGUATATUBA</span>
                  <span className="block text-2xl lg:text-3xl text-text-light font-light mt-2">
                    Total Quality Medicina Diagnóstica
                  </span>
                </h1>

                <p className="reveal text-lg text-text-light leading-relaxed max-w-2xl mb-8">
                  A Total Quality é o laboratório de análises clínicas e medicina diagnóstica mais completo de
                  Caraguatatuba - SP. Desde 2003, realizamos mais de 3.000 tipos de exames com tecnologia de
                  última geração, equipe médica especializada e resultados disponíveis online. Localizado no
                  centro de Caraguatatuba, com fácil acesso e atendimento humanizado.
                </p>

                <div className="reveal flex flex-wrap gap-4">
                  <button
                    onClick={handleScheduleClick}
                    className="btn-pill-brand btn-pill"
                    aria-label="Agendar exame via WhatsApp"
                  >
                    Agendar Exame
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href="tel:+551238873535"
                    className="btn-pill !bg-transparent !text-text border border-black/15 hover:!bg-black/5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    (12) 3887-3535
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5">
                <ResponsiveImage
                  slug="hero-clinica"
                  widths={[480, 768, 1024]}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  width={1024}
                  height={572}
                  alt="Laboratório Total Quality em Caraguatatuba - SP - Interior da clínica"
                  className="reveal w-full rounded-2xl shadow-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Exames Laboratoriais */}
        <section className="py-16 lg:py-24 bg-neutral-50">
          <div className="container">
            <h2 className="reveal heading-display text-3xl lg:text-4xl text-text mb-4">
              EXAMES LABORATORIAIS EM <span className="text-brand">CARAGUATATUBA</span>
            </h2>
            <p className="reveal text-text-light text-lg leading-relaxed max-w-3xl mb-10">
              Nosso laboratório em Caraguatatuba realiza mais de 3.000 tipos de exames laboratoriais com
              equipamentos automatizados de alta precisão. A coleta é feita por profissionais treinados em
              ambiente confortável e seguro. Os resultados ficam disponíveis online em até 24 horas para a
              maioria dos{" "}
              <Link href="/exames/exames-de-sangue" className="text-brand hover:underline">
                exames de sangue em Caraguatatuba
              </Link>
              . Se a ideia é acompanhar a saúde de forma preventiva, veja também o{" "}
              <Link href="/checkup" className="text-brand hover:underline">
                check-up completo
              </Link>{" "}
              e as{" "}
              <Link href="/blog/alimentacao-e-exames-laboratoriais" className="text-brand hover:underline">
                orientações de preparo e jejum
              </Link>
              .
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {examesLaboratoriais.map((exame, i) => {
                const conteudo = (
                  <>
                    <CheckCircle className="w-4 h-4 text-brand flex-shrink-0" />
                    <span className="text-sm text-text">{exame.name}</span>
                  </>
                );
                const base =
                  "reveal flex items-center gap-2 bg-white rounded-lg px-4 py-3 border border-black/5";
                const delay = { transitionDelay: `${i * 30}ms` };

                return exame.href ? (
                  <Link
                    key={exame.name}
                    href={exame.href}
                    className={`${base} hover:border-brand hover:shadow-sm transition-all`}
                    style={delay}
                  >
                    {conteudo}
                  </Link>
                ) : (
                  <div key={exame.name} className={base} style={delay}>
                    {conteudo}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Diagnóstico por Imagem */}
        <section className="py-16 lg:py-24">
          <div className="container">
            <h2 className="reveal heading-display text-3xl lg:text-4xl text-text mb-4">
              DIAGNÓSTICO POR IMAGEM EM <span className="text-brand">CARAGUATATUBA</span>
            </h2>
            <p className="reveal text-text-light text-lg leading-relaxed max-w-3xl mb-10">
              A Total Quality é a clínica de diagnóstico por imagem mais completa de Caraguatatuba - SP.
              Contamos com equipamentos de última geração e equipe médica especializada em radiologia,
              cardiologia e neurologia para laudos detalhados e confiáveis.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {examesImagem.map((exame, i) => {
                const conteudo = (
                  <>
                    <exame.icon className="w-6 h-6 text-brand flex-shrink-0" />
                    <span className="text-text font-medium">{exame.name}</span>
                  </>
                );
                const base =
                  "reveal flex items-center gap-4 bg-neutral-50 rounded-xl px-6 py-5 border border-black/5 hover:shadow-md transition-shadow";
                const delay = { transitionDelay: `${i * 50}ms` };

                return exame.href ? (
                  <Link
                    key={exame.name}
                    href={exame.href}
                    className={`${base} hover:border-brand`}
                    style={delay}
                  >
                    {conteudo}
                  </Link>
                ) : (
                  <div key={exame.name} className={base} style={delay}>
                    {conteudo}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Como Chegar */}
        <section className="py-16 lg:py-24 bg-neutral-50">
          <div className="container">
            <h2 className="reveal heading-display text-3xl lg:text-4xl text-text mb-8">
              COMO CHEGAR AO LABORATÓRIO EM <span className="text-brand">CARAGUATATUBA</span>
            </h2>

            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5">
                <div className="reveal bg-white rounded-2xl p-8 border border-black/5">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-text">Endereço</p>
                        <p className="text-text-light">R. Padre Anchieta, 1010, Centro</p>
                        <p className="text-text-light">Caraguatatuba - SP, CEP 11660-010</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Phone className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-text">Telefone e WhatsApp</p>
                        <a href="tel:+551238873535" className="text-brand hover:underline">(12) 3887-3535</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Clock className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-text">Horários de Atendimento</p>
                        <p className="text-text-light">Segunda a Sexta: 08h às 18h</p>
                      </div>
                    </div>
                  </div>

                  <a
                    href="https://www.google.com/maps/dir//Total+Quality+Medicina+Diagn%C3%B3stica,+Rua+Padre+Anchieta,+1010+-+Centro,+Caraguatatuba+-+SP,+11660-010"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-pill-brand btn-pill mt-8 w-full justify-center"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Ver no Google Maps
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="reveal w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-black/5">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3653.8!2d-45.4132!3d-23.6225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cd5a0a0a0a0a0a%3A0x0!2sRua+Padre+Anchieta%2C+1010+-+Centro%2C+Caraguatatuba+-+SP%2C+11660-010!5e0!3m2!1spt-BR!2sbr!4v1"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "400px" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mapa - Laboratório Total Quality em Caraguatatuba"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Convênios */}
        <section className="py-16 lg:py-24">
          <div className="container">
            <h2 className="reveal heading-display text-3xl lg:text-4xl text-text mb-4">
              CONVÊNIOS ACEITOS NO LABORATÓRIO EM <span className="text-brand">CARAGUATATUBA</span>
            </h2>
            <p className="reveal text-text-light text-lg leading-relaxed max-w-3xl mb-10">
              O laboratório Total Quality em Caraguatatuba aceita diversos convênios de saúde. Veja a{" "}
              <Link
                href="/blog/convenios-laboratorio-caraguatatuba"
                className="text-brand hover:underline"
              >
                lista completa de convênios aceitos
              </Link>{" "}
              ou entre em contato pelo WhatsApp para verificar se o seu plano é aceito e agendar seus exames
              com praticidade.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              {convenios.map((convenio) => (
                <span
                  key={convenio}
                  className="reveal inline-flex items-center gap-2 bg-neutral-50 border border-black/5 rounded-full px-5 py-2.5 text-text font-medium"
                >
                  <CheckCircle className="w-4 h-4 text-brand" />
                  {convenio}
                </span>
              ))}
            </div>

            <p className="reveal text-text-light text-sm">
              * A lista de convênios pode variar. Consulte disponibilidade pelo WhatsApp ou telefone (12) 3887-3535.
            </p>
          </div>
        </section>

        {/* Horários */}
        <section className="py-16 lg:py-24 bg-neutral-50">
          <div className="container">
            <h2 className="reveal heading-display text-3xl lg:text-4xl text-text mb-8">
              HORÁRIOS DE <span className="text-brand">ATENDIMENTO</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-8 max-w-2xl">
              <div className="reveal bg-white rounded-2xl p-8 border border-black/5">
                <h3 className="heading-display text-xl text-text mb-4">COLETA LABORATORIAL</h3>
                <div className="space-y-2 text-text-light">
                  <p>Segunda a Sexta: <strong className="text-text">06h30 às 16h</strong></p>
                  <p>Sábado: <strong className="text-text">06h30 às 11h</strong></p>
                </div>
              </div>
              <div className="reveal bg-white rounded-2xl p-8 border border-black/5">
                <h3 className="heading-display text-xl text-text mb-4">EXAMES DE IMAGEM</h3>
                <div className="space-y-2 text-text-light">
                  <p>Segunda a Sexta: <strong className="text-text">08h às 18h</strong></p>
                  <p className="text-sm italic">Agendamento prévio necessário</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 lg:py-24 bg-brand text-white">
          <div className="container text-center">
            <h2 className="reveal heading-display text-3xl lg:text-4xl mb-6">
              AGENDE SEU EXAME NO LABORATÓRIO EM CARAGUATATUBA
            </h2>
            <p className="reveal text-white/80 text-lg max-w-2xl mx-auto mb-10">
              Entre em contato conosco para agendar seu exame. Atendimento rápido e humanizado,
              com resultados online e equipe especializada.
            </p>
            <div className="reveal flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleScheduleClick}
                className="btn-pill !bg-white !text-brand hover:!bg-white/90"
              >
                Agendar pelo WhatsApp
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <a
                href="tel:+551238873535"
                className="btn-pill !bg-transparent !text-white border border-white/30 hover:!bg-white/10"
              >
                <Phone className="w-3.5 h-3.5" />
                (12) 3887-3535
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
