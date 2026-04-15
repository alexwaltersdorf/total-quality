/*
 * Style: Optik Editorial — Minimalist, uppercase nav
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 * Tracking: nav clicks, CTA clicks, phone clicks, results clicks
 */
import { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trackNavClick, trackScheduleExam, trackResultsClick, trackPhoneClick } from "@/lib/tracking";

const navLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Exames", href: "#exames" },
  { label: "Sobre", href: "#sobre" },
  { label: "Contato", href: "#contato" },
];

const serviceLinks = [
  { label: "Check-Up", href: "/checkup" },
  { label: "Bioimpedância", href: "/bioimpedancia" },
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
    trackNavClick(href.replace("#", ""));
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleScheduleClick = () => {
    setMobileOpen(false);
    trackScheduleExam("navbar_cta", "geral");
    window.open("https://wa.me/5512997743535?text=Olá! Gostaria de agendar um exame.", "_blank");
  };

  const handleResultsClick = () => {
    setMobileOpen(false);
    trackResultsClick();
    window.open("https://totalquality.med.br", "_blank");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-black/5 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between py-5">
        {/* Logo */}
        <a
          href="#inicio"
          className="flex items-center gap-3 group"
          onClick={(e) => { e.preventDefault(); scrollTo("#inicio"); }}
        >
          <span className="heading-display text-3xl tracking-tight text-text group-hover:text-brand transition-colors">
            TOTAL QUALITY
          </span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-xs font-semibold uppercase tracking-[0.15em] text-text-light hover:text-brand transition-colors duration-300"
            >
              {link.label}
            </button>
          ))}
          {serviceLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-[0.15em] text-brand hover:text-brand-dark transition-colors duration-300"
              onClick={() => trackNavClick(link.label.toLowerCase())}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={handleResultsClick}
            className="text-xs font-semibold uppercase tracking-[0.15em] text-text-light hover:text-brand transition-colors"
          >
            Resultados
          </button>
          <button
            onClick={handleScheduleClick}
            className="btn-pill"
          >
            Agendar
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 text-text"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 top-0 bg-white z-40 transition-all duration-500 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="container pt-24 pb-8">
          <div className="space-y-1">
            {navLinks.map((link, i) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="block w-full text-left py-4 border-b border-black/10"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="heading-display text-4xl text-text hover:text-brand transition-colors">
                  {link.label.toUpperCase()}
                </span>
              </button>
            ))}
            {serviceLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className="block w-full text-left py-4 border-b border-black/10"
                style={{ animationDelay: `${(navLinks.length + i) * 50}ms` }}
                onClick={() => { setMobileOpen(false); trackNavClick(link.label.toLowerCase()); }}
              >
                <span className="heading-display text-4xl text-brand hover:text-brand-dark transition-colors">
                  {link.label.toUpperCase()}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-10 space-y-4">
            <button
              onClick={handleScheduleClick}
              className="btn-pill w-full justify-center"
            >
              Agendar Exame
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResultsClick}
              className="btn-pill w-full justify-center !bg-transparent !text-text border border-black/20 hover:!bg-black/5"
            >
              Resultados Online
            </button>
          </div>
          <div className="mt-10 text-xs text-text-muted space-y-1">
            <p>Rua Padre Anchieta, 1010 - Centro, Caraguatatuba-SP</p>
            <p>Seg-Sex: 08h às 18h</p>
            <a
              href="tel:1238873535"
              className="block hover:text-brand"
              onClick={() => trackPhoneClick("mobile_menu")}
            >
              (12) 3887-3535
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
