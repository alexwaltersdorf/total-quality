/*
 * Style: Optik Editorial — Minimal footer with large display text
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 */
import { Phone, MessageCircle, Instagram, MapPin, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import type { MouseEvent as ReactMouseEvent } from "react";
import { trackScheduleExam, trackWhatsAppClick, trackExternalLink } from "@/lib/tracking";
import { useTelefoneRedirect, useWhatsAppRedirect } from "@/contexts/ContatoLeadContext";
import { useMensagemWhatsApp } from "@/contexts/AssuntoPagina";
import CtaWhatsApp from "@/components/CtaWhatsApp";
import { BLOG_EXTERNO_URL } from "@shared/const";

/*
 * Navegacao do rodape como links de verdade (SEO nov/2026, Fase 2). Sobre e
 * Contato sao paginas; "Diferenciais" e uma secao da home (/#diferenciais),
 * que antes so funcionava estando na home.
 */
const footerLinks = [
  { label: "Início", href: "/", isRoute: true },
  { label: "Diferenciais", href: "/#diferenciais", anchor: true },
  { label: "Sobre", href: "/sobre", isRoute: true },
  { label: "Contato", href: "/contato", isRoute: true },
  { label: "Blog", href: "/blog", isRoute: true },
  { label: "Mais artigos de saúde", href: BLOG_EXTERNO_URL, external: true },
  { label: "Check-Up Preventivo", href: "/checkup", isRoute: true },
  { label: "Bioimpedância", href: "/bioimpedancia", isRoute: true },
];

const examSitelinks = [
  { label: "Exames de Sangue", href: "/exames/exames-de-sangue" },
  { label: "Tomografia Computadorizada", href: "/exames/tomografia-computadorizada" },
  { label: "Raio-X", href: "/exames/raio-x" },
  { label: "Ultrassonografia", href: "/exames/ultrassonografia" },
  // Mamografia saiu daqui em 31/10/2026: a clinica NAO realiza no momento
  // (decisao do Alex). /exames/mamografia faz 301 para /exames/ultrassonografia.
  { label: "MAPA", href: "/exames/mapa" },
  { label: "Holter", href: "/exames/holter" },
  { label: "Espirometria", href: "/exames/espirometria" },
  { label: "Eletrocardiograma", href: "/exames/eletrocardiograma" },
  { label: "Eletroencefalograma", href: "/exames/eletroencefalograma" },
  { label: "Exame Toxicológico", href: "/exames/exame-toxicologico" },
  { label: "Endocrinologista", href: "/especialidades/endocrinologista" },
  { label: "Gastroenterologista", href: "/especialidades/gastroenterologista" },
  { label: "Medicina do Trabalho", href: "/especialidades/medicina-do-trabalho" },
];

export default function Footer({ laboratory = false }: { laboratory?: boolean }) {
  const openWhatsApp = useWhatsAppRedirect();
  const abrirTelefone = useTelefoneRedirect();
  const mensagemCta = useMensagemWhatsApp(
    laboratory ? "Olá! Gostaria de consultar preparo e orçamento de exames laboratoriais." : "Olá! Gostaria de agendar um exame."
  );
  const mensagemContato = useMensagemWhatsApp("Olá! Gostaria de mais informações.");
  // Na home, a ancora rola ate a secao; fora dela o link leva a home nela.
  const irParaSecao = (e: ReactMouseEvent<HTMLAnchorElement>, href: string) => {
    const el = document.querySelector(href.replace("/", ""));
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-surface-dark text-text" role="contentinfo" aria-label="Rodapé Total Quality Medicina Diagnóstica Caraguatatuba">
      {/* CTA strip */}
      <div className="border-b border-black/10">
        <div className="container py-16 lg:py-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <h2 className="heading-display text-4xl sm:text-5xl lg:text-6xl text-text">
            {laboratory ? "TIRE SUAS" : "AGENDE SEU"}{" "}
            <br />
            <span className="text-brand">{laboratory ? "DÚVIDAS" : "EXAME AGORA"}</span>
          </h2>
          <CtaWhatsApp
            mensagem={mensagemCta}
            onClick={() => { trackScheduleExam("footer_cta", "geral"); openWhatsApp("footer_cta", mensagemCta); }}
            className="btn-pill"
          >
            {laboratory ? "Consultar pelo WhatsApp" : "Agendar pelo WhatsApp"}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </CtaWhatsApp>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <span className="heading-display text-3xl text-text block mb-4">TOTAL QUALITY</span>
            <p className="text-text-muted text-sm leading-relaxed">
              Laboratório de análises clínicas e medicina diagnóstica em Caraguatatuba - SP. Desde 2003 no Centro de Caraguatatuba.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-6">Navegação</h3>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  {"external" in link && link.external ? (
                    <a href={link.href} className="text-text-light hover:text-brand text-sm transition-colors">
                      {link.label}
                    </a>
                  ) : "isRoute" in link && link.isRoute ? (
                    <Link
                      href={link.href}
                      className="text-text-light hover:text-brand text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      onClick={(e) => irParaSecao(e, link.href)}
                      className="text-text-light hover:text-brand text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Exames Sitelinks */}
          <div className="lg:col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-6">Nossos Exames</h3>
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
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-6">Contato</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                <p className="text-text-light text-sm">
                  R. Padre Anchieta, 1010<br />
                  Centro, Caraguatatuba - SP<br />
                  CEP 11660-010
                </p>
              </div>
              <button
                type="button"
                className="flex items-center gap-3 text-text-light hover:text-brand text-sm transition-colors"
                onClick={() => abrirTelefone("footer")}
              >
                <Phone className="w-4 h-4 text-brand" />
                (12) 3887-3535
              </button>
              <CtaWhatsApp
                mensagem={mensagemContato}
                className="flex items-center gap-3 text-text-light hover:text-brand text-sm transition-colors"
                onClick={() => { trackWhatsAppClick("footer"); openWhatsApp("footer_contact", mensagemContato); }}
              >
                <MessageCircle className="w-4 h-4 text-brand" />
                (12) 3887-3535
              </CtaWhatsApp>
            </div>
          </div>

          {/* Hours & Social */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-6">Horário</h3>
            <p className="text-text-light text-sm mb-1">Segunda a Sexta</p>
            <p className="text-text font-medium text-sm mb-8">07h30 às 18h</p>

            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-4">Social</h3>
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

      {/* Identificação obrigatória — art. 5º da Resolução CFM nº 2.336/2023.
          O número vai sem a sigla do conselho em texto renderizado, apenas os
          dígitos; há guard-rail que quebra o build se a sigla reaparecer.
          Fica no rodapé, e não só em /quem-somos, porque a norma pede "local
          visível" em toda peça do estabelecimento — o rodapé é a única parte
          que acompanha todas as páginas. O equivalente pré-renderizado está
          em napHtml(), em server/_core/seo-content.ts. */}
      <div className="border-t border-black/10">
        <div className="container py-5 text-center">
          <p className="text-text-muted text-xs leading-relaxed">
            <span className="text-text-light">Total Quality Medicina Diagnóstica</span> — Registro 970616
            <span className="hidden sm:inline"> · </span>
            <br className="sm:hidden" />
            Responsável Técnico: Alex Waltersdorf - 267.339
          </p>
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
