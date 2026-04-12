/*
 * Style: Optik Editorial — Minimal footer with large display text
 * Footer: Clean layout with brand, links, contact info
 */
import { Phone, MessageCircle, Instagram, MapPin, ArrowUpRight } from "lucide-react";

const footerLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Exames", href: "#exames" },
  { label: "Sobre", href: "#sobre" },
  { label: "Contato", href: "#contato" },
];

export default function Footer() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-foreground text-white">
      {/* CTA strip */}
      <div className="border-b border-white/10">
        <div className="container py-16 lg:py-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <h3 className="heading-display text-4xl sm:text-5xl lg:text-6xl text-white">
            AGENDE SEU
            <br />
            <span className="text-brand-light">EXAME AGORA</span>
          </h3>
          <button
            onClick={() => window.open("https://wa.me/5512997743535?text=Olá! Gostaria de agendar um exame.", "_blank")}
            className="btn-pill bg-white !text-foreground hover:!bg-brand hover:!text-white"
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
            <span className="heading-display text-3xl text-white block mb-4">TOTAL QUALITY</span>
            <p className="text-white/40 text-sm leading-relaxed">
              Desde 2003, oferecendo diagnósticos precisos com tecnologia de última geração e atendimento humanizado.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-6">Navegação</h4>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-6">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-light mt-0.5 shrink-0" />
                <p className="text-white/60 text-sm">
                  Rua Padre Anchieta, 1010<br />
                  Centro, Caraguatatuba-SP
                </p>
              </div>
              <a href="tel:1238873535" className="flex items-center gap-3 text-white/60 hover:text-white text-sm transition-colors">
                <Phone className="w-4 h-4 text-brand-light" />
                (12) 3887-3535
              </a>
              <a href="https://wa.me/5512997743535" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/60 hover:text-white text-sm transition-colors">
                <MessageCircle className="w-4 h-4 text-brand-light" />
                (12) 99774-3535
              </a>
            </div>
          </div>

          {/* Hours & Social */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-6">Horário</h4>
            <p className="text-white/60 text-sm mb-1">Segunda a Sexta</p>
            <p className="text-white font-medium text-sm mb-8">08h às 18h</p>

            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">Social</h4>
            <a
              href="https://www.instagram.com/totalqualitymedicina"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-white/60 hover:text-white text-sm transition-colors"
            >
              <Instagram className="w-5 h-5" />
              @totalqualitymedicina
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} Total Quality Medicina Diagnóstica. Todos os direitos reservados.
          </p>
          <p className="text-white/30 text-xs">
            Caraguatatuba-SP
          </p>
        </div>
      </div>
    </footer>
  );
}
