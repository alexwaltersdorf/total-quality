/*
 * /especialidades — indice das consultas (SEO nov/2026, Fase 3). Ate aqui a
 * URL respondia 404, embora existissem /especialidades/:slug. Renderizada no
 * servidor e hidratada, como as paginas de exame.
 *
 * Lista o que esta em especialidadesData (consultas e medicina do trabalho).
 * Sem nome de medico (decisao do Alex, 24/10/2026).
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import OndeFazer from "@/components/OndeFazer";
import { useCanonical, useMetaDescription } from "@/components/SEOHead";
import { especialidadesData, ESPECIALIDADES_BASE } from "@/lib/especialidadesData";
import { ESPECIALIDADES_TITLE, ESPECIALIDADES_DESCRIPTION, ESPECIALIDADES_H1, CONVENIOS_TEXTO } from "@shared/const";
import { FOTO_FACHADA } from "@/lib/modeloPagina";

export default function EspecialidadesHub() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = ESPECIALIDADES_TITLE;
  }, []);
  useCanonical(ESPECIALIDADES_BASE);
  useMetaDescription(ESPECIALIDADES_DESCRIPTION);

  const consultas = especialidadesData.filter((e) => e.category === "consulta");
  const empresas = especialidadesData.filter((e) => e.category !== "consulta");

  const cartao = (e: (typeof especialidadesData)[number]) => (
    <Link
      key={e.slug}
      href={`${ESPECIALIDADES_BASE}/${e.slug}`}
      className="group block border border-black/10 rounded-2xl p-6 hover:border-brand transition-colors duration-300"
    >
      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">{e.subtitle}</span>
      <h3 className="heading-display text-2xl text-text group-hover:text-brand transition-colors duration-300 mt-2 mb-3">
        {e.shortTitle}
      </h3>
      <p className="text-text-light leading-relaxed text-sm">{e.description}</p>
      <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.1em] text-brand mt-4">
        Ver página <ArrowUpRight className="w-4 h-4" />
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <section className="pt-24 lg:pt-28 bg-surface-light">
          <div className="container pt-8 lg:pt-16 pb-12 lg:pb-16 max-w-4xl">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-text-muted mb-4">
              <Link href="/" className="py-3 hover:text-brand transition-colors">Início</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-brand">Especialidades</span>
            </nav>
            <span className="section-label mb-6 block">Consultas e medicina do trabalho</span>
            <h1 className="heading-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] text-text mb-6">
              {ESPECIALIDADES_H1}
            </h1>
            <p className="text-text-light text-lg leading-relaxed">
              Consultas com especialistas, com hora marcada pelo WhatsApp, e medicina do trabalho para empresas, no
              mesmo endereço do laboratório e dos exames de imagem, no Centro de Caraguatatuba. Atendimento particular
              e pelos convênios {CONVENIOS_TEXTO}. Exames de sangue, ultrassom, eletrocardiograma, Holter e MAPA
              pedidos pelo médico são feitos na própria clínica — veja a lista de{" "}
              <Link href="/exames" className="text-brand underline underline-offset-2">exames</Link>.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="container">
            <h2 className="heading-display text-3xl text-text mb-8">Consultas com especialistas</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{consultas.map(cartao)}</div>
          </div>
        </section>

        {empresas.length > 0 && (
          <section className="py-12 lg:py-16 bg-surface">
            <div className="container">
              <h2 className="heading-display text-3xl text-text mb-8">Para empresas</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{empresas.map(cartao)}</div>
            </div>
          </section>
        )}

        <OndeFazer
          titulo="Onde fazer consulta em Caraguatatuba"
          mensagem="Agende a consulta pelo WhatsApp ou telefone: dias e horários de cada especialista são confirmados no atendimento."
          foto={FOTO_FACHADA}
          comoChegar
        />
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
