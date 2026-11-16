/*
 * /bioimpedancia — SEO nov/2026, Fase 3: desenhada pelo modelo unico
 * (components/PaginaServico.tsx) com o conteudo de lib/paginasServico.ts
 * (PAGINA_BIOIMPEDANCIA). FAQ: BIO_FAQS, a mesma lista do FAQPage do servidor.
 *
 * Sairam os numeros soltos do topo ("10min", "6+", "0 dor"): a duracao
 * verificada e "5 a 10 minutos" (quadro do exame) e fica no Resumo rapido.
 *
 * Rastreamento: os mesmos eventos de antes (trackScheduleBioimpedancia +
 * bioimpedancia_cta; telefone bioimpedancia_cta).
 */
import { useEffect } from "react";
import { trackScheduleBioimpedancia } from "@/lib/tracking";
import { useWhatsAppRedirect } from "@/contexts/ContatoLeadContext";
import { useCanonical, useMetaDescription } from "@/components/SEOHead";
import { BIO_FAQS, PAGINA_BIOIMPEDANCIA } from "@/lib/paginasServico";
import { BIOIMPEDANCIA_TITLE, BIOIMPEDANCIA_H1, BIOIMPEDANCIA_DESCRIPTION } from "@shared/const";
import PaginaServico from "@/components/PaginaServico";
import { mensagemSobre } from "@/contexts/AssuntoPagina";

const ASSUNTO = "bioimpedância";

export default function Bioimpedancia() {
  const openWhatsApp = useWhatsAppRedirect();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = BIOIMPEDANCIA_TITLE;
  }, []);

  // SEO: title e description da mesma fonte do servidor (shared/const.ts).
  useMetaDescription(BIOIMPEDANCIA_DESCRIPTION);
  useCanonical("/bioimpedancia");

  // FAQPage, MedicalWebPage e BreadcrumbList: emitidos pelo servidor no
  // <head>, dos mesmos dados (seo-content.ts).

  // Mensagem da pagina (Fase 2): "Olá, vim pelo site e quero informações sobre bioimpedância".
  const mensagem = mensagemSobre(ASSUNTO);
  const agendar = () => { trackScheduleBioimpedancia(); openWhatsApp("bioimpedancia_cta", mensagem); };

  return (
    <PaginaServico
      assunto={ASSUNTO}
      h1={BIOIMPEDANCIA_H1}
      rotulo="Composição corporal"
      migalha="Bioimpedância"
      conteudo={PAGINA_BIOIMPEDANCIA}
      faqs={BIO_FAQS}
      artigos={[]}
      mensagem={mensagem}
      agendar={agendar}
      textoCta="Agendar Exame"
      telefone={{ topo: "bioimpedancia_cta", rodape: "bioimpedancia_cta" }}
      ctaFinal={{
        titulo: <>Conheça seu corpo <span className="text-brand">por dentro</span></>,
        texto: "Agende sua bioimpedância e leve os dados de composição corporal para a conversa com seu médico, nutricionista ou educador físico.",
        botao: "Agendar pelo WhatsApp",
      }}
    />
  );
}
