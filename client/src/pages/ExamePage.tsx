/*
 * Style: Optik Editorial — Giant display type, asymmetric layout, brand #9B212B
 * Theme: White background, dark gray #5A5A5A text
 * Page: Dynamic Exam Page (reusable for all exams)
 */
import { useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { ArrowUpRight, ArrowLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { getExamBySlug, examesData } from "@/lib/examesData";
import { useBreadcrumbSchema, useFAQSchema, useMedicalTestSchema, useCanonical } from "@/components/SEOHead";
const ScrollVideo = lazy(() => import("@/components/ScrollVideo"));

export default function ExamePage() {
  const params = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const exam = getExamBySlug(params.slug || "");

  useEffect(() => { window.scrollTo(0, 0); }, [params.slug]);

  // SEO: Dynamic meta tags
  useEffect(() => {
    if (exam) {
      document.title = exam.metaTitle;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", exam.metaDescription);
    }
  }, [exam]);

  // SEO: Structured Data — BreadcrumbList
  const breadcrumbs = useMemo(() => exam ? [
    { name: "Início", url: "/" },
    { name: "Exames", url: "/#exames" },
    { name: exam.shortTitle, url: `/exames/${exam.slug}` },
  ] : [], [exam]);
  useBreadcrumbSchema(breadcrumbs);

  // SEO: Structured Data — FAQPage
  const faqs = useMemo(() => exam?.faqs || [], [exam]);
  useFAQSchema(faqs);

  // SEO: Structured Data — MedicalTest
  useMedicalTestSchema({
    name: exam?.title || "",
    description: exam?.metaDescription || "",
    url: `/exames/${exam?.slug || ""}`,
  });

  // SEO: Canonical URL
  useCanonical(`/exames/${params.slug || ""}`);

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
  }, [exam]);

  if (!exam) {
    navigate("/404");
    return null;
  }

  const otherExams = examesData.filter((e) => e.slug !== exam.slug).slice(0, 4);

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
            onClick={() => window.open(`https://wa.me/551238873535?text=${encodeURIComponent(exam.whatsappMessage)}`, "_blank")}
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
          <div className="pt-8 lg:pt-16 max-w-4xl">
            {/* Breadcrumb */}
            <div className="reveal flex items-center gap-2 text-xs text-text-muted mb-6">
              <Link href="/" className="hover:text-brand transition-colors">Início</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-brand">{exam.shortTitle}</span>
            </div>

            <div className="reveal">
              <span className="section-label mb-6 block">{exam.subtitle}</span>
            </div>

            <h1 className="reveal heading-display text-[clamp(2.5rem,8vw,6rem)] leading-[0.85] mb-8" style={{ transitionDelay: "100ms" }}>
              {exam.title.split(" ").map((word, i) => (
                <span key={i} className={i === 0 ? "text-text" : "text-brand"}>
                  {word}{" "}
                </span>
              ))}
            </h1>

            <p className="reveal text-text-light text-lg lg:text-xl leading-relaxed max-w-3xl mb-10" style={{ transitionDelay: "200ms" }}>
              {exam.heroDescription}
            </p>

            <div className="reveal flex flex-wrap gap-4 mb-16" style={{ transitionDelay: "300ms" }}>
              <button
                onClick={() => window.open(`https://wa.me/551238873535?text=${encodeURIComponent(exam.whatsappMessage)}`, "_blank")}
                className="btn-pill"
              >
                Agendar pelo WhatsApp
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <a href="tel:1238873535" className="btn-pill !bg-transparent !text-text border border-black/20 hover:!bg-black/5">
                Ligar: (12) 3887-3535
              </a>
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
                O QUE É O <span className="text-brand">{exam.shortTitle.toUpperCase()}?</span>
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
              O QUE É O <span className="text-brand">{exam.shortTitle.toUpperCase()}?</span>
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
            QUANDO <span className="text-brand">REALIZAR?</span>
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
                COMO SE <span className="text-brand">PREPARAR</span>
              </h2>
              <p className="reveal text-text-muted mt-4" style={{ transitionDelay: "100ms" }}>
                Siga as orientações abaixo para garantir a qualidade do seu exame.
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

      {/* FAQ */}
      <section className="py-16 lg:py-24 bg-surface">
        <div className="container">
          <h2 className="reveal heading-display text-4xl lg:text-5xl text-text mb-12">
            PERGUNTAS <span className="text-brand">FREQUENTES</span>
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
            OUTROS <span className="text-brand">EXAMES</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherExams.map((other, i) => (
              <Link
                key={other.slug}
                href={`/exames/${other.slug}`}
                className="reveal group p-6 bg-surface rounded-xl border border-black/5 hover:border-brand/30 transition-all duration-300"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">{other.subtitle}</span>
                <h3 className="heading-display text-xl text-text mt-2 mb-3 group-hover:text-brand transition-colors">
                  {other.shortTitle.toUpperCase()}
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
            AGENDE SEU <span className="text-brand">{exam.shortTitle.toUpperCase()}</span>
          </h2>
          <p className="reveal text-text-muted text-lg mb-10 max-w-2xl mx-auto" style={{ transitionDelay: "100ms" }}>
            Entre em contato conosco para agendar seu exame. Atendemos de segunda a sexta, das 08h às 18h.
          </p>
          <div className="reveal flex flex-wrap gap-4 justify-center" style={{ transitionDelay: "200ms" }}>
            <button
              onClick={() => window.open(`https://wa.me/551238873535?text=${encodeURIComponent(exam.whatsappMessage)}`, "_blank")}
              className="btn-pill"
            >
              Agendar pelo WhatsApp
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <a href="tel:1238873535" className="btn-pill !bg-transparent !text-text border border-black/20 hover:!bg-black/5">
              Ligar: (12) 3887-3535
            </a>
          </div>
        </div>
      </section>

      {/* SEO Footer */}
      <footer className="py-8 border-t border-black/10">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="heading-display text-xl text-text hover:text-brand transition-colors">
              TOTAL QUALITY
            </Link>
            <p className="text-text-muted text-xs text-center">
              {exam.keywords.join(" • ")}
            </p>
          </div>
        </div>
      </footer>

      <WhatsAppFAB />
    </div>
  );
}
