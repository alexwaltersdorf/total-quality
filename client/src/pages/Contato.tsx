/*
 * /contato — pagina de contato (SEO nov/2026, Fase 2).
 *
 * Ate aqui /contato fazia 301 para a ancora /#contato da home. A pagina usa a
 * mesma secao de contato da home (ContatoSection: telefone, WhatsApp, e-mail,
 * horario, mapa com carregamento preguicoso e o formulario, que ja emite o
 * lead qualificado). Renderizada no servidor e hidratada (entry-server.tsx).
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import ContatoSection from "@/components/ContatoSection";
import { ENDERECO } from "@/components/OndeFazer";
import { useCanonical, useMetaDescription } from "@/components/SEOHead";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { CONTATO_TITLE, CONTATO_DESCRIPTION, CONVENIOS_TEXTO } from "@shared/const";

export default function Contato() {
  const wrapperRef = useScrollReveal();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = CONTATO_TITLE;
  }, []);
  useMetaDescription(CONTATO_DESCRIPTION);
  useCanonical("/contato");

  return (
    <div ref={wrapperRef} className="min-h-screen bg-white">
      <Navbar />

      <main role="main">
        <section className="pt-28 lg:pt-36 pb-12 lg:pb-16">
          <div className="container max-w-4xl">
            <nav className="text-xs text-text-muted mb-4 flex items-center gap-2" aria-label="Trilha de navegação">
              <Link href="/" className="py-3 hover:text-brand transition-colors">Início</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-brand">Contato</span>
            </nav>
            <h1 className="reveal heading-display text-5xl lg:text-6xl text-text mb-8">
              Contato da <span className="text-brand">Total Quality</span>{" "}
              <span className="block font-sans text-base lg:text-lg text-text-light font-light tracking-wide mt-4 normal-case leading-normal">
                em Caraguatatuba
              </span>
            </h1>
            <address className="not-italic text-lg text-text-light leading-relaxed space-y-2">
              <p>
                {ENDERECO.nome} · {ENDERECO.rua}, {ENDERECO.cidade}
              </p>
              <p>Telefone e WhatsApp: {ENDERECO.telefone}</p>
              <p>Horário de atendimento: {ENDERECO.horario}</p>
            </address>
            <p className="text-text-light leading-relaxed mt-6">
              Coleta laboratorial sem agendamento, por ordem de chegada. Exames de imagem e consultas com hora
              marcada pelo WhatsApp ou telefone. Atendimento particular e pelos convênios {CONVENIOS_TEXTO}.{" "}
              <Link href="/convenios" className="text-brand hover:underline">Veja os convênios aceitos</Link>.
            </p>
          </div>
        </section>

        <ContatoSection />
      </main>

      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
