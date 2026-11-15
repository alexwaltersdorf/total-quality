/*
 * Style: Optik Editorial — Giant display type, asymmetric layout, brand #9B212B
 * Theme: White background, dark gray #5A5A5A text
 * Page: Dynamic Exam Page (reusable for all exams)
 */
import { useEffect, lazy, Suspense } from "react";
import { trackScheduleExam } from "@/lib/tracking";
import { useTelefoneRedirect, useWhatsAppRedirect } from "@/contexts/ContatoLeadContext";
import { ArrowUpRight, ChevronRight, CheckCircle } from "lucide-react";
import { useParams, useLocation, Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { getExamBySlug, examesData, type ExamData } from "@/lib/examesData";
import { getEspecialidadeBySlug, especialidadesData, ESPECIALIDADES_BASE } from "@/lib/especialidadesData";
import { blogPosts } from "@/lib/blogPublicados";
import { blogLinksFor, examesDeSangueLista } from "@/lib/examBlogLinks";
import { useCanonical } from "@/components/SEOHead";
import OndeFazer from "@/components/OndeFazer";
import CtaWhatsApp from "@/components/CtaWhatsApp";
import { AssuntoPagina, mensagemSobre } from "@/contexts/AssuntoPagina";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { CONVENIOS_TEXTO } from "@shared/const";
const ScrollVideo = lazy(() => import("@/components/ScrollVideo"));

/** "MAPA" fica em caixa alta; "Raio-X" vira "raio-x"; "(ECG)" fica. */
function emMinusculas(texto: string): string {
  return texto
    .split(" ")
    .map((p) => (p === p.toUpperCase() ? p : p.toLowerCase()))
    .join(" ");
}

/**
 * Assunto da mensagem do WhatsApp nesta pagina (Fase 2): "Olá, vim pelo site
 * e quero informações sobre hemograma completo".
 */
function assuntoDaPagina(exam: ExamData): string {
  if (exam.category === "consulta") return `consulta com ${emMinusculas(exam.title)}`;
  return emMinusculas(exam.title);
}

/** Frase do bloco "Onde fazer" por tipo de pagina (texto do antigo pre-render). */
function mensagemOndeFazer(exam: ExamData): string {
  // "Exame Toxicológico" nao vira "exame de exame toxicológico".
  const nome = emMinusculas(exam.shortTitle);
  const exame = nome.startsWith("exame") ? nome : `exame de ${nome}`;
  if (exam.category === "laboratorio") {
    return `Faça ${exam.slug === "exames-de-sangue" ? "seus exames de sangue" : `seu ${exame}`} sem agendamento: a coleta é por ordem de chegada, de segunda a sexta, das 7h30 às 18h. Dúvidas de preparo e convênio pelo WhatsApp.`;
  }
  if (exam.category === "consulta") {
    return `Agende a consulta com ${exam.shortTitle.toLowerCase()} pelo WhatsApp ou telefone: dias e horários são confirmados no atendimento. Atendimento particular e pelos convênios ${CONVENIOS_TEXTO}.`;
  }
  if (exam.category === "ocupacional") {
    return "Empresas e trabalhadores agendam pelo WhatsApp ou telefone. PCMSO, exames ocupacionais, ASO e exames complementares no mesmo endereço.";
  }
  return `Agende seu ${exame} pelo WhatsApp ou telefone e faça em um só lugar todos os seus exames laboratoriais e de imagem.`;
}

export default function ExamePage() {
  const openWhatsApp = useWhatsAppRedirect();
  const abrirTelefone = useTelefoneRedirect();
  const params = useParams<{ slug: string }>();
  const [location, navigate] = useLocation();
  // A mesma pagina serve /exames/:slug e /especialidades/:slug (consultas e
  // medicina do trabalho, 24/10/2026): muda a fonte dos dados e os textos.
  const isEspecialidade = location.startsWith(`${ESPECIALIDADES_BASE}/`);
  const base = isEspecialidade ? ESPECIALIDADES_BASE : "/exames";
  const exam = isEspecialidade ? getEspecialidadeBySlug(params.slug || "") : getExamBySlug(params.slug || "");

  useEffect(() => { window.scrollTo(0, 0); }, [params.slug]);

  // SEO: title e description da MESMA fonte que o servidor injeta
  // (examesData -> routes-metadata.ts); numa navegacao interna ficam certos.
  useEffect(() => {
    if (exam) {
      document.title = exam.metaTitle;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", exam.metaDescription);
    }
  }, [exam]);

  // JSON-LD (MedicalWebPage, BreadcrumbList, FAQPage): emitido pelo servidor
  // no <head>, gerado dos mesmos dados desta pagina (seo-content.ts,
  // examJsonLd). Os hooks que o repetiam no navegador sairam (Fase 1): eram
  // um segundo grafo, diferente do do servidor.

  // SEO: Canonical URL
  useCanonical(`${base}/${params.slug || ""}`);

  const wrapperRef = useScrollReveal([exam]);

  useEffect(() => {
    if (!exam) navigate("/404");
  }, [exam, navigate]);

  if (!exam) return null;

  // Medicina do trabalho aponta para o exame admissional (uma URL por
  // intencao: a empresa aqui, quem vai fazer o exame la).
  const examesDaEspecialidade = exam.category === "ocupacional"
    ? examesData.filter((e) => e.slug === "exame-admissional" || e.slug === "exames-de-sangue")
    : examesData.slice(0, 2);
  const otherExams = isEspecialidade
    ? [...especialidadesData.filter((e) => e.slug !== exam.slug), ...examesDaEspecialidade]
    : examesData.filter((e) => e.slug !== exam.slug).slice(0, 4);
  const otherHref = (slug: string) =>
    especialidadesData.some((e) => e.slug === slug) ? `${ESPECIALIDADES_BASE}/${slug}` : `/exames/${slug}`;
  const questionPrefix = exam.category === "consulta"
    ? "O que faz o"
    : exam.category === "ocupacional"
      ? "O que é a"
      : exam.slug === "exames-de-sangue" ? "O que são os" : `O que é ${exam.slug === "ultrassonografia" ? "a" : "o"}`;

  const assunto = assuntoDaPagina(exam);
  const mensagem = mensagemSobre(assunto);
  const agendar = () => { trackScheduleExam(`exame_${exam.slug}`, exam.slug); openWhatsApp(`exame_${exam.slug}`, mensagem); };

  return (
    <AssuntoPagina value={assunto}>
    <div ref={wrapperRef} className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      {/* Fundo liso (auditoria de design, 18/10/2026): a foto de banco lavada a
          15% ficava atras do texto, tirava contraste e mostrava "ADVANCED
          DIAGNOSTICS" em ingles na parede. Volta quando houver foto real. */}
      <section className="pt-24 lg:pt-28 relative overflow-hidden bg-surface-light">
        <div className="container relative z-10">
          <div className="pt-8 lg:pt-16 max-w-4xl">
            {/* Breadcrumb */}
            <div className="reveal flex items-center gap-2 text-xs text-text-muted mb-4">
              <Link href="/" className="py-3 hover:text-brand transition-colors">Início</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-brand">{exam.shortTitle}</span>
            </div>

            <div className="reveal">
              <span className="section-label mb-6 block">{exam.subtitle}</span>
            </div>

            {/* H1 = examH1(exam): "[Nome] em Caraguatatuba", o mesmo texto no
                servidor e no navegador. Caixa alta so pelo CSS (.heading-display). */}
            <h1 className="reveal heading-display leading-[0.85] mb-8" style={{ transitionDelay: "100ms" }}>
              <span className="block text-[clamp(2.5rem,8vw,6rem)]">
                {exam.title.split(" ").map((word, i) => (
                  <span key={i} className={i === 0 ? "text-text" : "text-brand"}>
                    {word}{" "}
                  </span>
                ))}
              </span>
              <span className="block font-sans text-base lg:text-lg text-text-light font-light tracking-wide mt-4 normal-case leading-normal">
                em Caraguatatuba
              </span>
            </h1>

            <p className="reveal text-text-light text-lg lg:text-xl leading-relaxed max-w-3xl mb-10" style={{ transitionDelay: "200ms" }}>
              {exam.heroDescription}
            </p>

            <div className="reveal flex flex-wrap gap-4 mb-16" style={{ transitionDelay: "300ms" }}>
              <CtaWhatsApp mensagem={mensagem} onClick={agendar} className="btn-pill">
                {exam.category === "laboratorio" ? "Consultar preparo e orçamento" : "Agendar pelo WhatsApp"}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </CtaWhatsApp>
              <button type="button" onClick={() => abrirTelefone("exame_topo")} className="btn-pill-outline">
                Ligar: (12) 3887-3535
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Image */}
      {exam.heroImage && (
        <section className="pb-8 lg:pb-12">
          <div className="container">
            <div className="reveal rounded-2xl overflow-hidden shadow-lg" style={{ transitionDelay: "400ms" }}>
              <img
                src={exam.heroImage}
                alt={`${exam.shortTitle} - Total Quality Medicina Diagnóstica em Caraguatatuba`}
                className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
                loading="eager"
              />
            </div>
          </div>
        </section>
      )}

      {/* Divider */}
      <div className="container"><div className="border-t border-black/10" /></div>

      {/* What is — hidden on desktop when video exists (text shown beside video instead) */}
      <section className={`py-16 lg:py-24 ${exam.videoUrl ? 'lg:hidden' : ''}`}>
        <div className="container">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <h2 className="reveal heading-display text-4xl lg:text-5xl text-text mb-4">
                {questionPrefix}{" "}<span className="text-brand">{exam.shortTitle}?</span>
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="reveal text-text-light text-lg leading-relaxed mb-8">
                {exam.whatIs}
              </p>
              <p className="reveal text-text-light text-lg leading-relaxed" style={{ transitionDelay: "100ms" }}>
                {exam.howItWorks}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll-driven Video (between "O que é" and "Quando Realizar") */}
      {exam.videoUrl && (
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center bg-white">
            <div className="w-10 h-10 border-3 border-black/20 border-t-brand rounded-full animate-spin" />
          </div>
        }>
          <ScrollVideo src={exam.videoUrl} alt={`Vídeo de ${exam.shortTitle} - Total Quality`}>
            <h2 className="heading-display text-3xl xl:text-4xl text-text mb-6">
              {questionPrefix}{" "}<span className="text-brand">{exam.shortTitle}?</span>
            </h2>
            <p className="text-text-light text-base xl:text-lg leading-relaxed mb-6">
              {exam.whatIs}
            </p>
            <p className="text-text-light text-base xl:text-lg leading-relaxed">
              {exam.howItWorks}
            </p>
          </ScrollVideo>
        </Suspense>
      )}

      {/* Divider */}
      <div className="container"><div className="border-t border-black/10" /></div>

      {/* Indications */}
      <section className="py-16 lg:py-24 bg-surface">
        <div className="container">
          <h2 className="reveal heading-display text-4xl lg:text-5xl text-text mb-12">
            {isEspecialidade ? <>Quando <span className="text-brand">procurar?</span></> : <>Quando <span className="text-brand">realizar?</span></>}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {exam.indications.map((indication, i) => (
              <div
                key={i}
                className="reveal flex items-start gap-4 p-6 bg-white rounded-xl border border-black/5"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <CheckCircle className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <span className="text-text-light">{indication}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preparations */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <h2 className="reveal heading-display text-4xl lg:text-5xl text-text mb-4">
                {isEspecialidade ? <>O que <span className="text-brand">levar</span></> : <>Como se <span className="text-brand">preparar</span></>}
              </h2>
              <p className="reveal text-text-muted mt-4" style={{ transitionDelay: "100ms" }}>
                {isEspecialidade
                  ? "Organize os documentos abaixo antes do atendimento."
                  : "Siga as orientações abaixo antes do seu exame."}
              </p>
            </div>
            <div className="lg:col-span-7 space-y-6">
              {exam.preparations.map((prep, i) => {
                const Icon = prep.icon;
                return (
                  <div
                    key={i}
                    className="reveal flex items-start gap-5 p-6 bg-surface rounded-xl border border-black/5"
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-brand" />
                    </div>
                    <p className="text-text-light text-lg leading-relaxed">{prep.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container"><div className="border-t border-black/10" /></div>

      {/* Exames de sangue que realizamos + Saiba mais no nosso blog: o caminho
          da pagina transacional para os artigos (lib/examBlogLinks.ts). So
          artigos publicados — rascunho nunca recebe link. */}
      {(exam.slug === "exames-de-sangue" || blogLinksFor(exam.slug, blogPosts).length > 0) && (
        <section className="py-16 lg:py-24">
          <div className="container max-w-4xl">
            {exam.slug === "exames-de-sangue" && (
              <div className="mb-12">
                <h2 className="heading-display text-3xl lg:text-4xl text-text mb-6">
                  Exames de sangue que <span className="text-brand">realizamos</span>
                </h2>
                <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 list-disc pl-5 text-text-light">
                  {examesDeSangueLista(blogPosts).map((item) => (
                    <li key={item.nome}>
                      {item.href ? (
                        <Link href={item.href} className="text-brand underline underline-offset-2 hover:opacity-80">
                          {item.nome}
                        </Link>
                      ) : (
                        item.nome
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {blogLinksFor(exam.slug, blogPosts).length > 0 && (
              <>
                <h2 className="heading-display text-3xl lg:text-4xl text-text mb-6">
                  Saiba mais no <span className="text-brand">nosso blog</span>
                </h2>
                <ul className="space-y-3">
                  {blogLinksFor(exam.slug, blogPosts).map((post) => (
                    <li key={post.slug}>
                      <Link href={`/blog/${post.slug}`} className="text-brand underline underline-offset-2 hover:opacity-80">
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      )}

      {/* Onde fazer: antes so existia no HTML do servidor (Fase 1). */}
      <OndeFazer mensagem={mensagemOndeFazer(exam)} />

      {/* FAQ — a resposta fica no DOM desde o primeiro render (dentro do
          <details>), e e o mesmo texto do FAQPage do JSON-LD. */}
      <section className="py-16 lg:py-24 bg-surface">
        <div className="container">
          <h2 className="reveal heading-display text-4xl lg:text-5xl text-text mb-12">
            Perguntas <span className="text-brand">frequentes</span>
          </h2>
          <div className="max-w-3xl space-y-6">
            {exam.faqs.map((faq, i) => (
              <details
                key={i}
                className="reveal group bg-white rounded-xl border border-black/5 overflow-hidden"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-semibold text-text pr-4">{faq.q}</span>
                  <ChevronRight className="w-5 h-5 text-text-muted shrink-0 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-6 pb-6 text-text-light leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Other Exams */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <h2 className="reveal heading-display text-4xl lg:text-5xl text-text mb-12">
            {isEspecialidade ? <>Outros <span className="text-brand">atendimentos</span></> : <>Outros <span className="text-brand">exames</span></>}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherExams.map((other, i) => (
              <Link
                key={other.slug}
                href={otherHref(other.slug)}
                className="reveal group p-6 bg-surface rounded-xl border border-black/5 hover:border-brand/30 transition-all duration-300"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">{other.subtitle}</span>
                <h3 className="heading-display text-xl text-text mt-2 mb-3 group-hover:text-brand transition-colors">
                  {other.shortTitle}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">{other.description}</p>
                <span className="inline-flex items-center gap-1 text-brand text-sm font-medium mt-4">
                  Saiba mais <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 lg:py-24 bg-surface-dark">
        <div className="container text-center">
          <h2 className="reveal heading-display text-4xl sm:text-5xl lg:text-6xl text-text mb-6">
            {exam.category === "laboratorio" ? (
              <>Faça {exam.slug === "exames-de-sangue" ? "seus" : "seu"}{" "}<span className="text-brand">{exam.shortTitle}</span> sem agendamento</>
            ) : (
              isEspecialidade ? (
                <>Agende com a <span className="text-brand">Total Quality</span></>
              ) : (
                <>Agende {exam.slug === "ultrassonografia" ? "sua" : "seu"}{" "}<span className="text-brand">{exam.shortTitle}</span></>
              )
            )}
          </h2>
          <p className="reveal text-text-muted text-lg mb-10 max-w-2xl mx-auto" style={{ transitionDelay: "100ms" }}>
            {exam.category === "laboratorio"
              ? "A coleta é por ordem de chegada, sem agendamento: basta trazer o pedido médico e um documento com foto, de segunda a sexta, das 07h30 às 18h."
              : isEspecialidade
                ? "Agende pelo WhatsApp: dias e horários são confirmados no atendimento. A clínica funciona de segunda a sexta, das 07h30 às 18h."
                : "Entre em contato conosco para agendar seu exame. Atendemos de segunda a sexta, das 07h30 às 18h."}
          </p>
          <div className="reveal flex flex-wrap gap-4 justify-center" style={{ transitionDelay: "200ms" }}>
            <CtaWhatsApp mensagem={mensagem} onClick={agendar} className="btn-pill">
              {exam.category === "laboratorio" ? "Tirar dúvidas no WhatsApp" : "Agendar pelo WhatsApp"}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </CtaWhatsApp>
            <button type="button" onClick={() => abrirTelefone("exame_rodape")} className="btn-pill-outline">
              Ligar: (12) 3887-3535
            </button>
          </div>
        </div>
      </section>

      <Footer laboratory={exam.category === "laboratorio"} />

      <WhatsAppFAB laboratory={exam.category === "laboratorio"} />
    </div>
    </AssuntoPagina>
  );
}
