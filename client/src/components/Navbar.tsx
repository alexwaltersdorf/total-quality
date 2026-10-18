/*
 * Style: Optik Editorial — Minimalist, uppercase nav
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 * Tracking: nav clicks, CTA clicks, phone clicks, results clicks
 */
import { useState, useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Menu, X, ArrowUpRight, ChevronDown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trackNavClick, trackScheduleExam, trackResultsClick, trackWhatsAppClick } from "@/lib/tracking";
import { useTelefoneRedirect, useWhatsAppRedirect } from "@/contexts/ContatoLeadContext";

/*
 * Menu (decisao do Alex, 18/10/2026): Inicio · Sobre · Contato · Nossos Exames ·
 * Blog · Resultados · Agendar. "Diferenciais", "Exames" (duplicava "Nossos
 * Exames") e "Cartao" sairam do menu; o Cartao segue no rodape do dropdown de
 * exames e na home. Cor: cinza para todos, vinho so no item da pagina atual —
 * antes 4 itens eram vinho sem criterio e a cor deixava de significar algo.
 */
const RESULTADOS_URL = "https://app.totalquality.med.br/";

const ancoras = [
  { label: "Sobre", href: "#sobre" },
  { label: "Contato", href: "#contato" },
];

const extrasExames = [
  { label: "Check-up", href: "/checkup" },
  { label: "Bioimpedância", href: "/bioimpedancia" },
  { label: "Cartão Total Quality", href: "/cartao" },
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
  const openWhatsApp = useWhatsAppRedirect();
  const abrirTelefone = useTelefoneRedirect();
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [examesDropdownOpen, setExamesDropdownOpen] = useState(false);
  const [mobileExamesOpen, setMobileExamesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Ancoras da home (#sobre, #contato). Fora da home o querySelector nao acha
  // nada e o clique morria em silencio; agora leva a home na secao certa.
  const scrollTo = (href: string) => {
    setMobileOpen(false);
    trackNavClick(href.replace("#", ""));
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else window.location.assign("/" + href);
  };

  const ativo = (href: string) => (href === "/" ? location === "/" : location.startsWith(href));
  const itemDesktop = (on: boolean) =>
    `relative py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-200 ${
      on ? "text-brand after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-0.5 after:bg-brand" : "text-text-light hover:text-text"
    }`;

  const handleHomeClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (location === "/") {
      event.preventDefault();
      scrollTo("#inicio");
      return;
    }

    setMobileOpen(false);
    trackNavClick("início");
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  };

  const handleScheduleClickNavbar = () => {
    setMobileOpen(false);
    trackScheduleExam("navbar_cta", "geral");
    openWhatsApp("navbar_cta", "Olá! Gostaria de agendar um exame.");
  };

  const handleWhatsAppClickNavbar = () => {
    setMobileOpen(false);
    trackWhatsAppClick("navbar");
    openWhatsApp("navbar", "Olá! Gostaria de agendar um exame.");
  };

  const handlePhoneClickNavbar = () => {
    setMobileOpen(false);
    abrirTelefone("navbar");
  };

  const handleScheduleClick = handleScheduleClickNavbar;

  const handleResultsClick = () => {
    setMobileOpen(false);
    trackResultsClick();
    // Era "https://totalquality.med.br" — abria o proprio site, nao os laudos.
    window.open(RESULTADOS_URL, "_blank", "noopener,noreferrer");
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
          <picture>
            <source type="image/avif" srcSet="/images/logo-276.avif 276w, /images/logo-414.avif 414w" sizes="138px" />
            <source type="image/webp" srcSet="/images/logo-276.webp 276w, /images/logo-414.webp 414w" sizes="138px" />
            <img
              src="/images/logo-276.webp"
              alt="Total Quality Medicina Diagnóstica"
              className="h-10 md:h-12 w-auto object-contain"
              width={276}
              height={96}
              fetchPriority="high"
              decoding="sync"
            />
          </picture>
        </a>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-8">
          <Link href="/" className={itemDesktop(ativo("/"))} onClick={handleHomeClick}>
            Início
          </Link>
          {ancoras.map((link) => (
            <button key={link.href} type="button" onClick={() => scrollTo(link.href)} className={itemDesktop(false)}>
              {link.label}
            </button>
          ))}

          {/* Exames Dropdown */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              type="button"
              className={`flex items-center gap-1 ${itemDesktop(ativo("/exames") || ativo("/checkup") || ativo("/bioimpedancia") || ativo("/cartao"))}`}
              onClick={() => setExamesDropdownOpen(!examesDropdownOpen)}
              aria-expanded={examesDropdownOpen}
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
              <div className="border-t border-black/10 py-2">
                {extrasExames.map((x) => (
                  <Link
                    key={x.href}
                    href={x.href}
                    className="block px-5 py-2.5 text-sm font-semibold text-text hover:text-brand hover:bg-brand/5 transition-colors"
                    onClick={() => { setExamesDropdownOpen(false); trackNavClick(x.label.toLowerCase()); }}
                  >
                    {x.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="/blog" className={itemDesktop(ativo("/blog"))} onClick={() => trackNavClick("blog")}>
            Blog
          </Link>
          <button type="button" onClick={handleResultsClick} className={itemDesktop(false)}>
            Resultados
          </button>
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center">
          <button type="button" onClick={handleScheduleClick} className="btn-pill">
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
            <Link href="/" className="block w-full text-left py-4 border-b border-black/10" onClick={handleHomeClick}>
              <span className={`heading-display text-4xl ${ativo("/") ? "text-brand" : "text-text"}`}>INÍCIO</span>
            </Link>
            {ancoras.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollTo(link.href)}
                className="block w-full text-left py-4 border-b border-black/10"
              >
                <span className="heading-display text-4xl text-text">{link.label.toUpperCase()}</span>
              </button>
            ))}

            {/* Mobile Exames Accordion */}
            <div className="border-b border-black/10">
              <button
                type="button"
                onClick={() => setMobileExamesOpen(!mobileExamesOpen)}
                className="flex items-center justify-between w-full text-left py-4"
                aria-expanded={mobileExamesOpen}
              >
                <span className="heading-display text-4xl text-text">NOSSOS EXAMES</span>
                <ChevronDown className={`w-6 h-6 text-text transition-transform duration-200 ${mobileExamesOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${mobileExamesOpen ? "max-h-[800px] pb-4" : "max-h-0"}`}>
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
                  {extrasExames.map((x) => (
                    <Link
                      key={x.href}
                      href={x.href}
                      className="block py-2.5 text-lg font-semibold text-text"
                      onClick={() => { setMobileOpen(false); trackNavClick(x.label.toLowerCase()); }}
                    >
                      {x.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/blog"
              className="block w-full text-left py-4 border-b border-black/10"
              onClick={() => { setMobileOpen(false); trackNavClick("blog"); }}
            >
              <span className={`heading-display text-4xl ${ativo("/blog") ? "text-brand" : "text-text"}`}>BLOG</span>
            </Link>
          </div>
          <div className="mt-10 space-y-4">
            <button
              type="button"
              onClick={handleScheduleClick}
              className="btn-pill w-full"
            >
              Agendar
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResultsClick}
              className="btn-pill-outline w-full"
            >
              Resultados Online
            </button>
          </div>
          <div className="mt-10 text-xs text-text-muted space-y-1">
            <p>R. Padre Anchieta, 1010 - Centro, Caraguatatuba - SP</p>
            <p>Seg-Sex: 07h30 às 18h</p>
            <button
              type="button"
              className="block text-left hover:text-brand py-3"
              onClick={() => { setMobileOpen(false); abrirTelefone("mobile_menu"); }}
            >
              (12) 3887-3535
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
