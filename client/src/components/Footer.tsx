/*
 * Style: Optik Editorial — Minimal footer with large display text
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 */
import { Phone, MessageCircle, Instagram, MapPin, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { trackScheduleExam, trackPhoneClick, trackWhatsAppClick, trackExternalLink } from "@/lib/tracking";

const footerLinks = [
  { label: "Início", href: "#inicio", isRoute: false },
  { label: "Diferenciais", href: "#diferenciais", isRoute: false },
  { label: "Exames", href: "#exames", isRoute: false },
  { label: "Sobre", href: "#sobre", isRoute: false },
  { label: "Contato", href: "#contato", isRoute: false },
];

const serviceLinks = [
  { label: "Check-Up Preventivo", href: "/checkup" },
  { label: "Bioimpedância", href: "/bioimpedancia" },
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
            onClick={() => { trackScheduleExam("footer_cta", "geral"); window.open("https://wa.me/5512997743535?text=Olá! Gostaria de agendar um exame.", "_blank"); }}
            className="btn-pill"
          >
            Agendar pelo WhatsApp
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <span className="heading-display text-3xl text-text block mb-4">TOTAL QUALITY</span>
            <p className="text-text-muted text-sm leading-relaxed">
              Laboratório de análises clínicas e clínica de medicina diagnóstica em Caraguatatuba-SP. Desde 2003, oferecendo exames de sangue, hemograma, glicemia, colesterol, hormônios, tomografia, ultrassonografia, mamografia, ecocardiograma e check-up preventivo com tecnologia de última geração.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-6">Navegação</h4>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-text-light hover:text-brand text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-4 mt-8">Serviços</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-light hover:text-brand text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/dashboard"
                  className="text-text-light hover:text-brand text-sm transition-colors"
                >
                  Dashboard Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-6">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                <p className="text-text-light text-sm">
                  Rua Padre Anchieta, 1010<br />
                  Centro, Caraguatatuba-SP
                </p>
              </div>
              <a href="tel:1238873535" className="flex items-center gap-3 text-text-light hover:text-brand text-sm transition-colors" onClick={() => trackPhoneClick("footer")}>
                <Phone className="w-4 h-4 text-brand" />
                (12) 3887-3535
              </a>
              <a href="https://wa.me/5512997743535" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-text-light hover:text-brand text-sm transition-colors" onClick={() => trackWhatsAppClick("footer")}>
                <MessageCircle className="w-4 h-4 text-brand" />
                (12) 99774-3535
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
          <p className="text-text-muted text-xs">
            Exames de Sangue • Laboratório • Medicina Diagnóstica • Caraguatatuba-SP • Litoral Norte
          </p>
        </div>
      </div>
    </footer>
  );
}
