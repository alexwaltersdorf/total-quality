/*
 * Design: "Warm Clinical" — Humanized Material Design 3
 * Footer: Clean footer with links, contact info, and social
 */
import { Phone, MessageCircle, Instagram, Facebook, MapPin } from "lucide-react";

const footerLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Exames", href: "#exames" },
  { label: "Sobre Nós", href: "#sobre" },
  { label: "Contato", href: "#contato" },
];

export default function Footer() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-teal-900 text-white">
      <div className="container py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white font-bold text-lg">
                TQ
              </div>
              <div>
                <p className="font-bold text-white text-base leading-tight">Total Quality</p>
                <p className="text-[11px] text-teal-300 leading-tight tracking-wide">Medicina Diagnóstica</p>
              </div>
            </div>
            <p className="text-teal-200/70 text-sm leading-relaxed mt-4">
              Desde 2003, oferecendo diagnósticos precisos com tecnologia de última geração e atendimento humanizado.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Navegação</h4>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-teal-200/70 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-300 mt-0.5 shrink-0" />
                <p className="text-teal-200/70 text-sm">
                  Rua Padre Anchieta, 1010<br />
                  Centro, Caraguatatuba-SP
                </p>
              </div>
              <a href="tel:1238873535" className="flex items-center gap-2.5 text-teal-200/70 hover:text-white text-sm transition-colors">
                <Phone className="w-4 h-4 text-teal-300" />
                (12) 3887-3535
              </a>
              <a href="https://wa.me/5512997743535" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-teal-200/70 hover:text-white text-sm transition-colors">
                <MessageCircle className="w-4 h-4 text-teal-300" />
                (12) 99774-3535
              </a>
            </div>
          </div>

          {/* Social & hours */}
          <div>
            <h4 className="font-semibold text-white mb-4">Horário</h4>
            <p className="text-teal-200/70 text-sm mb-1">Segunda a Sexta</p>
            <p className="text-white font-medium text-sm mb-6">08h às 18h</p>

            <h4 className="font-semibold text-white mb-3">Redes Sociais</h4>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/totalqualitymedicina"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-teal-200/50 text-sm">
            &copy; {new Date().getFullYear()} Total Quality Medicina Diagnóstica. Todos os direitos reservados.
          </p>
          <p className="text-teal-200/50 text-sm">
            CNPJ: 00.000.000/0001-00 | CRM/SP
          </p>
        </div>
      </div>
    </footer>
  );
}
