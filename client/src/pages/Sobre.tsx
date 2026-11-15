/*
 * /sobre — pagina institucional (SEO nov/2026, Fase 2).
 *
 * Ate aqui /sobre fazia 301 para a ancora /#sobre: o Google nao tinha uma URL
 * para a historia, a estrutura e a identificacao da clinica. So fatos que ja
 * estavam no site (SobreSection, PorQueEscolherSection, index.html, briefing
 * de 14/11/2026) — nada de numero novo. Renderizada no servidor e hidratada
 * (entry-server.tsx), como as paginas de exame.
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowUpRight, CheckCircle, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import ResponsiveImage from "@/components/ResponsiveImage";
import OndeFazer from "@/components/OndeFazer";
import CtaWhatsApp from "@/components/CtaWhatsApp";
import { values, timeline } from "@/components/SobreSection";
import { useCanonical, useMetaDescription } from "@/components/SEOHead";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useTelefoneRedirect, useWhatsAppRedirect } from "@/contexts/ContatoLeadContext";
import { trackWhatsAppClick } from "@/lib/tracking";
import { anosDeAtuacao, SOBRE_TITLE, SOBRE_DESCRIPTION, SOBRE_H1 } from "@shared/const";

/** Estrutura: so o que as paginas do site ja descrevem, cada item com a sua pagina. */
const estrutura: Array<{ nome: string; href: string }> = [
  { nome: "Laboratório de análises clínicas com equipamentos automatizados", href: "/laboratorio-caraguatatuba" },
  { nome: "Tomografia computadorizada multislice", href: "/exames/tomografia-computadorizada" },
  { nome: "Ultrassonografia geral e com Doppler", href: "/exames/ultrassonografia" },
  { nome: "Raio-X digital", href: "/exames/raio-x" },
  { nome: "Eletrocardiograma, Holter 24h e MAPA 24h", href: "/exames/eletrocardiograma" },
  { nome: "Eletroencefalograma", href: "/exames/eletroencefalograma" },
  { nome: "Espirometria", href: "/exames/espirometria" },
  { nome: "Bioimpedância", href: "/bioimpedancia" },
  { nome: "Medicina do trabalho (PCMSO e ASO)", href: "/especialidades/medicina-do-trabalho" },
];

const MENSAGEM = "Olá! Gostaria de mais informações.";

export default function Sobre() {
  const openWhatsApp = useWhatsAppRedirect();
  const abrirTelefone = useTelefoneRedirect();
  const wrapperRef = useScrollReveal();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = SOBRE_TITLE;
  }, []);
  useMetaDescription(SOBRE_DESCRIPTION);
  useCanonical("/sobre");

  return (
    <div ref={wrapperRef} className="min-h-screen bg-white">
      <Navbar />

      <main role="main">
        <section className="pt-28 lg:pt-36 pb-16 lg:pb-24">
          <div className="container">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7">
                <nav className="text-xs text-text-muted mb-4 flex items-center gap-2" aria-label="Trilha de navegação">
                  <Link href="/" className="py-3 hover:text-brand transition-colors">Início</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-brand">Sobre</span>
                </nav>
                <span className="section-label mb-6 block">Desde 2003</span>
                <h1 className="reveal heading-display text-5xl lg:text-6xl text-text mb-8">
                  Sobre a <span className="text-brand">Total Quality</span>{" "}
                  <span className="block font-sans text-base lg:text-lg text-text-light font-light tracking-wide mt-4 normal-case leading-normal">
                    em Caraguatatuba
                  </span>
                </h1>
                <p className="text-lg text-text-light leading-relaxed mb-6">
                  Fundada em 2003 em Caraguatatuba - SP, a Total Quality Medicina Diagnóstica atende o Litoral Norte de
                  São Paulo no Centro da cidade. São mais de {anosDeAtuacao()} anos reunindo, no mesmo endereço,{" "}
                  <Link href="/laboratorio-caraguatatuba" className="text-brand hover:underline">análises clínicas</Link>{" "}
                  e{" "}
                  <Link href="/exames" className="text-brand hover:underline">diagnóstico por imagem</Link>: mais de 3.000
                  tipos de exames e mais de 30.000 famílias atendidas.
                </p>
                <p className="text-lg text-text-light leading-relaxed">
                  A coleta laboratorial é sem agendamento, por ordem de chegada; exames de imagem e consultas são
                  agendados pelo WhatsApp ou telefone. Os laudos são assinados por médicos e os resultados ficam
                  disponíveis online.
                </p>
              </div>
              <div className="lg:col-span-5">
                <ResponsiveImage
                  slug="fachada"
                  widths={[480, 768, 1024]}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  width={1024}
                  height={843}
                  alt="Fachada da Total Quality Medicina Diagnóstica, na Rua Padre Anchieta, Centro de Caraguatatuba - SP"
                  className="w-full rounded-2xl shadow-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-surface">
          <div className="container max-w-4xl">
            <h2 className="reveal heading-display text-4xl lg:text-5xl text-text mb-10">
              Nossa <span className="text-brand">história</span>
            </h2>
            <ol className="space-y-0">
              {timeline.map((item, i) => (
                <li key={item.year} className={`flex gap-6 py-8 ${i < timeline.length - 1 ? "border-b border-black/10" : ""}`}>
                  <span className="heading-display text-4xl text-brand shrink-0 w-20">{item.year}</span>
                  <div>
                    <h3 className="font-semibold text-text mb-1">{item.title}</h3>
                    <p className="text-text-light">{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="container max-w-4xl">
            <h2 className="reveal heading-display text-4xl lg:text-5xl text-text mb-6">
              Nossa <span className="text-brand">estrutura</span>
            </h2>
            <p className="text-text-light text-lg leading-relaxed mb-8">
              No mesmo endereço, no Centro de Caraguatatuba:
            </p>
            <ul className="grid sm:grid-cols-2 gap-3 mb-10">
              {estrutura.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="flex items-start gap-3 p-4 bg-surface rounded-xl border border-black/5 hover:border-brand/30 transition-colors">
                    <CheckCircle className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                    <span className="text-text">{item.nome}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="space-y-3 text-text-light">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <span>85% da energia da clínica vem de painéis solares.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <span>Parceria acadêmica: convênio com a UNITAU para ensino e pesquisa.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-surface">
          <div className="container">
            <h2 className="reveal heading-display text-4xl lg:text-5xl text-text mb-10">
              Missão, visão e <span className="text-brand">valores</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {values.map((item) => (
                <div key={item.title} className="bg-white p-8 rounded-xl border border-black/5">
                  <item.icon className="w-6 h-6 text-brand mb-4" />
                  <h3 className="heading-display text-2xl text-text mb-3">{item.title}</h3>
                  <p className="text-text-light leading-relaxed text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Identificacao do art. 5o da Resolucao CFM 2.336/2023: estabelecimento
            com o registro e responsavel tecnico com o dele. Sem a sigla do
            conselho, so os digitos (decisao do Alex). */}
        <section className="py-16 lg:py-24">
          <div className="container max-w-4xl">
            <h2 className="reveal heading-display text-4xl lg:text-5xl text-text mb-6">
              Responsável <span className="text-brand">técnico</span>
            </h2>
            <p className="text-text-light text-lg leading-relaxed">
              Total Quality Medicina Diagnóstica — Registro 970616 · Responsável Técnico: Alex Waltersdorf - 267.339
            </p>
          </div>
        </section>

        <OndeFazer
          titulo="Onde estamos"
          className="bg-surface"
          mapa
          mensagem="Fale com a nossa equipe pelo WhatsApp ou telefone para tirar dúvidas de preparo, convênio e agendamento."
        />

        <section className="py-16 lg:py-24 bg-surface-dark">
          <div className="container text-center">
            <h2 className="reveal heading-display text-4xl lg:text-5xl text-text mb-8">
              Fale com a <span className="text-brand">Total Quality</span>
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <CtaWhatsApp
                mensagem={MENSAGEM}
                onClick={() => { trackWhatsAppClick("sobre_cta"); openWhatsApp("sobre_cta", MENSAGEM); }}
                className="btn-pill"
              >
                Falar pelo WhatsApp
                <ArrowUpRight className="w-3.5 h-3.5" />
              </CtaWhatsApp>
              <button type="button" onClick={() => abrirTelefone("sobre_cta")} className="btn-pill-outline">
                Ligar: (12) 3887-3535
              </button>
              <Link href="/contato" className="btn-pill-outline">
                Página de contato
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
