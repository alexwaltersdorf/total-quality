/*
 * Design: "Warm Clinical" — Humanized Material Design 3
 * Navbar: Sticky top bar with teal primary, pill-shaped buttons, M3 elevation
 * Mobile: Hamburger menu with slide-in drawer
 */
import { useState, useEffect } from "react";
import { Phone, Menu, X, Clock, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Exames", href: "#exames" },
  { label: "Sobre Nós", href: "#sobre" },
  { label: "Contato", href: "#contato" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Top info bar */}
      <div className="bg-teal-700 text-white text-sm hidden md:block">
        <div className="container flex items-center justify-between py-2">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Rua Padre Anchieta, 1010 - Centro, Caraguatatuba-SP
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Seg-Sex: 08h às 18h
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:1238873535" className="flex items-center gap-1.5 hover:text-teal-200 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              (12) 3887-3535
            </a>
            <a href="https://wa.me/5512997743535" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-teal-200 transition-colors">
              <MessageCircle className="w-3.5 h-3.5" />
              (12) 99774-3535
            </a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-md"
            : "bg-white"
        }`}
      >
        <div className="container flex items-center justify-between py-3">
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-2 group" onClick={(e) => { e.preventDefault(); scrollTo("#inicio"); }}>
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:shadow-md transition-shadow">
              TQ
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-teal-800 text-base leading-tight">Total Quality</p>
              <p className="text-[11px] text-teal-600/80 leading-tight tracking-wide">Medicina Diagnóstica</p>
            </div>
          </a>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-teal-700 hover:bg-teal-50 rounded-full transition-all duration-200"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 text-sm"
              onClick={() => window.open("https://totalquality.med.br", "_blank")}
            >
              Resultados Online
            </Button>
            <Button
              className="rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow-md transition-all text-sm ripple-effect"
              onClick={() => window.open("https://wa.me/5512997743535?text=Olá! Gostaria de agendar um exame.", "_blank")}
            >
              Agendar Exame
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-teal-50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6 text-teal-700" /> : <Menu className="w-6 h-6 text-teal-700" />}
          </button>
        </div>

        {/* Mobile drawer */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="container pb-6 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="block w-full text-left px-4 py-3 text-base font-medium text-foreground/80 hover:text-teal-700 hover:bg-teal-50 rounded-2xl transition-all"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-4 space-y-3">
              <Button
                variant="outline"
                className="w-full rounded-full border-teal-200 text-teal-700"
                onClick={() => window.open("https://totalquality.med.br", "_blank")}
              >
                Resultados Online
              </Button>
              <Button
                className="w-full rounded-full bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => window.open("https://wa.me/5512997743535?text=Olá! Gostaria de agendar um exame.", "_blank")}
              >
                Agendar Exame
              </Button>
            </div>
            {/* Mobile contact info */}
            <div className="pt-4 space-y-2 text-sm text-muted-foreground">
              <a href="tel:1238873535" className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> (12) 3887-3535
              </a>
              <a href="https://wa.me/5512997743535" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> (12) 99774-3535
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
