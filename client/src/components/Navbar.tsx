/*
 * Style: Optik Editorial — Minimalist, uppercase nav
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 * Tracking: nav clicks, CTA clicks, phone clicks, results clicks
 */
import { useState, useEffect, useRef } from "react";
import { Menu, X, ArrowUpRight, ChevronDown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trackNavClick, trackScheduleExam, trackResultsClick, trackPhoneClick } from "@/lib/tracking";
import { useGoogleAdsConversion } from "@/hooks/useGoogleAdsConversion";

const navLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Exames", href: "#exames" },
  { label: "Sobre", href: "#sobre" },
  { label: "Cartão", href: "/cartao" },
  { label: "Contato", href: "#contato" },
];

const serviceLinks = [
  { label: "Check-Up", href: "/checkup" },
  { label: "Bioimpedância", href: "/bioimpedancia" },
  { label: "Blog", href: "/blog" },
];

const examSitelinks = [
  { label: "Exames de Sangue", href: "/exames/exames-de-sangue" },
  { label: "Tomografia Computadorizada", href: "/exames/tomografia-computadorizada" },
  { label: "Raio-X", href: "/exames/raio-x" },
  { label: "Ultrassonografia", href: "/exames/ultrassonografia" },
  { label: "Mamografia Digital", href: "/exames/mamografia" },
  { label: "MAPA", href: "/exames/mapa" },
  { label: "Holter", href: "/exames/holter" },
  { label: "Espirometria", href: "/exames/espirometria" },
  { label: "Eletrocardiograma", href: "/exames/eletrocardiograma" },
  { label: "Eletroencefalograma", href: "/exames/eletroencefalograma" },
  { label: "Exame Toxicológico", href: "/exames/exame-toxicologico" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [examesDropdownOpen, setExamesDropdownOpen] = useState(false);
  const [mobileExamesOpen, setMobileExamesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { trackScheduleClick, trackWhatsAppClick, trackPhoneClick: trackPhoneClickAds } = useGoogleAdsConversion();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExamesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    trackNavClick(href.replace("#", ""));
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleScheduleClickNavbar = () => {
    setMobileOpen(false);
    trackScheduleClick('navbar');
    trackScheduleExam("navbar_cta", "geral");
    window.open("https://wa.me/551238873535?text=Olá! Gostaria de agendar um exame.", "_blank");
  };

  const handleWhatsAppClickNavbar = () => {
    setMobileOpen(false);
    trackWhatsAppClick('5512388735350');
    window.open("https://wa.me/551238873535?text=Olá! Gostaria de agendar um exame.", "_blank");
  };

  const handlePhoneClickNavbar = () => {
    setMobileOpen(false);
    trackPhoneClickAds('5512388735350');
    trackPhoneClick();
    window.location.href = 'tel:+5512388735350';
  };

  const handleScheduleClick = handleScheduleClickNavbar;

  const handleResultsClick = () => {
    setMobileOpen(false);
    trackResultsClick();
    window.open("https://totalquality.med.br", "_blank");
  };

  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setExamesDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setExamesDropdownOpen(false), 200);
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
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/total-quality-logo_ce648054.png"
            alt="Total Quality Medicina Diagnóstica"
            className="h-10 md:h-12 w-auto object-contain"
          />
        </a>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            if (link.href === "/cartao") {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-semibold uppercase tracking-[0.15em] text-brand hover:text-brand-dark transition-colors duration-300"
                  onClick={() => trackNavClick(link.label.toLowerCase())}
                >
                  {link.label}
                </Link>
              );
            }
            return (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="text-xs font-semibold uppercase tracking-[0.15em] text-text-light hover:text-brand transition-colors duration-300"
              >
                {link.label}
              </button>
            );
          })}

          {/* Exames Dropdown */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.15em] text-brand hover:text-brand-dark transition-colors duration-300"
              onClick={() => setExamesDropdownOpen(!examesDropdownOpen)}
            >
              Nossos Exames
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${examesDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown menu */}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-white rounded-xl shadow-xl border border-black/10 overflow-hidden transition-all duration-200 ${
                examesDropdownOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="py-2">
                {examSitelinks.map((exam) => (
                  <Link
                    key={exam.href}
                    href={exam.href}
                    className="block px-5 py-2.5 text-sm text-text-light hover:text-brand hover:bg-brand/5 transition-colors"
                    onClick={() => { setExamesDropdownOpen(false); trackNavClick(exam.label.toLowerCase()); }}
                  >
                    {exam.label}
                  </Link>
                ))}
              </div>
              <div className="border-t border-black/10 p-3">
                <Link
                  href="/checkup"
                  className="block px-2 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-brand hover:text-brand-dark transition-colors"
                  onClick={() => { setExamesDropdownOpen(false); trackNavClick("checkup"); }}
                >
                  Check-Up Preventivo →
                </Link>
                <Link
                  href="/bioimpedancia"
                  className="block px-2 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-brand hover:text-brand-dark transition-colors"
                  onClick={() => { setExamesDropdownOpen(false); trackNavClick("bioimpedancia"); }}
                >
                  Bioimpedância →
                </Link>
              </div>
            </div>
          </div>

          {serviceLinks.filter(l => l.label === "Blog").map((link) => (
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
          aria-label={mobileOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 top-0 bg-white z-40 transition-all duration-500 overflow-y-auto ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="container pt-24 pb-8">
          <div className="space-y-1">
            {navLinks.map((link, i) => {
              if (link.href === "/cartao") {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block w-full text-left py-4 border-b border-black/10"
                    onClick={() => { setMobileOpen(false); trackNavClick(link.label.toLowerCase()); }}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <span className="heading-display text-4xl text-brand hover:text-brand-dark transition-colors">
                      {link.label.toUpperCase()}
                    </span>
                  </Link>
                );
              }
              return (
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
              );
            })}

            {/* Mobile Exames Accordion */}
            <div className="border-b border-black/10">
              <button
                onClick={() => setMobileExamesOpen(!mobileExamesOpen)}
                className="flex items-center justify-between w-full text-left py-4"
              >
                <span className="heading-display text-4xl text-brand">NOSSOS EXAMES</span>
                <ChevronDown className={`w-6 h-6 text-brand transition-transform duration-200 ${mobileExamesOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${mobileExamesOpen ? "max-h-[600px] pb-4" : "max-h-0"}`}>
                <div className="pl-4 space-y-1">
                  {examSitelinks.map((exam) => (
                    <Link
                      key={exam.href}
                      href={exam.href}
                      className="block py-2.5 text-lg text-text-light hover:text-brand transition-colors"
                      onClick={() => { setMobileOpen(false); trackNavClick(exam.label.toLowerCase()); }}
                    >
                      {exam.label}
                    </Link>
                  ))}
                  <Link
                    href="/checkup"
                    className="block py-2.5 text-lg font-semibold text-brand"
                    onClick={() => { setMobileOpen(false); trackNavClick("checkup"); }}
                  >
                    Check-Up Preventivo →
                  </Link>
                  <Link
                    href="/bioimpedancia"
                    className="block py-2.5 text-lg font-semibold text-brand"
                    onClick={() => { setMobileOpen(false); trackNavClick("bioimpedancia"); }}
                  >
                    Bioimpedância →
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/blog"
              className="block w-full text-left py-4 border-b border-black/10"
              onClick={() => { setMobileOpen(false); trackNavClick("blog"); }}
            >
              <span className="heading-display text-4xl text-brand hover:text-brand-dark transition-colors">
                BLOG
              </span>
            </Link>
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
            <p>R. Padre Anchieta, 1010 - Centro, Caraguatatuba - SP</p>
            <p>Seg-Sex: 08h às 18h</p>
            <a
              href="tel:+551238873535"
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
