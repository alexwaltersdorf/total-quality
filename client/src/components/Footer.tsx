/*
 * Style: Optik Editorial — Minimal footer with large display text
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 */
import { Phone, MessageCircle, Instagram, MapPin, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { trackScheduleExam, trackPhoneClick, trackWhatsAppClick, trackExternalLink } from "@/lib/tracking";

const footerLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Sobre", href: "#sobre" },
  { label: "Contato", href: "#contato" },
  { label: "Blog", href: "/blog", isRoute: true },
  { label: "Check-Up Preventivo", href: "/checkup", isRoute: true },
  { label: "Bioimpedância", href: "/bioimpedancia", isRoute: true },
];

const examSitelinks = [
  { label: "Exames de Sangue", href: "/exames/exames-de-sangue" },
  { label: "Tomografia Computadorizada", href: "/exames/tomografia-computadorizada" },
  { label: "Raio-X", href: "/exames/raio-x" },
  { label: "Ultrassonografia", href: "/exames/ultrassonografia" },
  { label: "MAPA", href: "/exames/mapa" },
  { label: "Holter", href: "/exames/holter" },
  { label: "Espirometria", href: "/exames/espirometria" },
  { label: "Eletrocardiograma", href: "/exames/eletrocardiograma" },
  { label: "Eletroencefalograma", href: "/exames/eletroencefalograma" },
  { label: "Exame Toxicológico", href: "/exames/exame-toxicologico" },
];

export default function Footer() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-surface-dark text-text" role="contentinfo" aria-label="Rodapé Total Quality Medicina Diagnóstica Caraguatatuba">
      {/* CTA strip */}
      <div className="border-b border-black/10">
        <div className="container py-16 lg:py-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <h3 className="heading-display text-4xl sm:text-5xl lg:text-6xl text-text">
            AGENDE SEU
            <br />
            <span className="text-brand">EXAME AGORA</span>
          </h3>
          <button
            onClick={() => { trackScheduleExam("footer_cta", "geral"); window.open("https://wa.me/551238873535?text=Olá! Gostaria de agendar um exame.", "_blank"); }}
            className="btn-pill"
          >
            Agendar pelo WhatsApp
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <span className="heading-display text-3xl text-text block mb-4">TOTAL QUALITY</span>
            <p className="text-text-muted text-sm leading-relaxed">
              Laboratório de análises clínicas e medicina diagnóstica em Caraguatatuba - SP. Desde 2003, tecnologia de última geração para cuidar da sua saúde.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-6">Navegação</h4>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  {"isRoute" in link && link.isRoute ? (
                    <Link
                      href={link.href}
                      className="text-text-light hover:text-brand text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => scrollTo(link.href)}
                      className="text-text-light hover:text-brand text-sm transition-colors"
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Exames Sitelinks */}
          <div className="lg:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-6">Nossos Exames</h4>
            <ul className="space-y-3">
              {examSitelinks.map((exam) => (
                <li key={exam.href}>
                  <Link
                    href={exam.href}
                    className="text-text-light hover:text-brand text-sm transition-colors"
                  >
                    {exam.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-6">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                <p className="text-text-light text-sm">
                  R. Padre Anchieta, 1010<br />
                  Centro, Caraguatatuba - SP<br />
                  CEP 11660-010
                </p>
              </div>
              <a href="tel:+551238873535" className="flex items-center gap-3 text-text-light hover:text-brand text-sm transition-colors" onClick={() => trackPhoneClick("footer")}>
                <Phone className="w-4 h-4 text-brand" />
                (12) 3887-3535
              </a>
              <a href="https://wa.me/551238873535" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-text-light hover:text-brand text-sm transition-colors" onClick={() => trackWhatsAppClick("footer")}>
                <MessageCircle className="w-4 h-4 text-brand" />
                (12) 3887-3535
              </a>
            </div>
          </div>

          {/* Hours & Social */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-6">Horário</h4>
            <p className="text-text-light text-sm mb-1">Segunda a Sexta</p>
            <p className="text-text font-medium text-sm mb-8">08h às 18h</p>

            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-4">Social</h4>
            <a
              href="https://www.instagram.com/totalqualitymedicina"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-text-light hover:text-brand text-sm transition-colors"
              onClick={() => trackExternalLink("instagram", "https://www.instagram.com/totalqualitymedicina")}
            >
              <Instagram className="w-5 h-5" />
              @totalqualitymedicina
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-black/10">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-muted text-xs">
            &copy; {new Date().getFullYear()} Total Quality Medicina Diagnóstica. Todos os direitos reservados.
          </p>
          <p className="text-text-muted text-xs text-center">
            Exames de Sangue • Tomografia • Raio-X • Ultrassonografia • Eletrocardiograma • Caraguatatuba - SP
          </p>
        </div>
      </div>
    </footer>
  );
}
