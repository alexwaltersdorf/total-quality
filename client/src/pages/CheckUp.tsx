/*
 * /checkup — SEO nov/2026, Fase 3: desenhada pelo modelo unico
 * (components/PaginaServico.tsx) com o conteudo de lib/paginasServico.ts
 * (PAGINA_CHECKUP). Os planos entram como bloco proprio, com o detalhe de cada
 * um (lista abaixo, a mesma que a pagina ja publicava). Sem preco.
 *
 * Saiu o selo "MAIS POPULAR" do plano Select: e afirmacao de comparacao sem
 * dado que a sustente (CFM 2.336/2023).
 *
 * Rastreamento: os mesmos eventos de antes (trackScheduleCheckup; WhatsApp
 * checkup_geral e checkup_pkg_<plano>; telefone checkup_topo e checkup_rodape).
 */
import { useEffect } from "react";
import { trackScheduleCheckup } from "@/lib/tracking";
import { useWhatsAppRedirect } from "@/contexts/ContatoLeadContext";
import { ArrowUpRight, CheckCircle } from "lucide-react";
import { useCanonical, useMetaDescription } from "@/components/SEOHead";
import { CHECKUP_TITLE, CHECKUP_H1, CHECKUP_DESCRIPTION } from "@shared/const";
import { CHECKUP_FAQS, PAGINA_CHECKUP } from "@/lib/paginasServico";
import CtaWhatsApp from "@/components/CtaWhatsApp";
import PaginaServico, { artigosDaPagina, type BlocoExtra } from "@/components/PaginaServico";
import { mensagemSobre } from "@/contexts/AssuntoPagina";

const checkupPackages = [
  {
    title: "Check-Up Básico",
    subtitle: "19 exames · avaliação essencial",
    items: [
      "Hemograma Completo",
      "Glicemia",
      "Hemoglobina Glicada",
      "Insulina",
      "Ferritina",
      "Avaliação básica da Tiroíde: TSH",
      "Perfil Lipídico (Colesterol Total, LDL, HDL, NÃO-HDL, VLDL, Triglicerídeos)",
      "Avaliação da Função do Fígado: TGO, TGP, Gama GT",
      "Avaliação da Função dos Rins: Ureia, Creatinina, Ácido Úrico, Urina Tipo I",
    ],
  },
  {
    title: "Check-Up Select",
    // TODO(alex): o subtitulo dizia "30 exames", mas a lista abaixo soma 31
    // dosagens (contando cada fracao do perfil lipidico). Sem o numero ate
    // voce confirmar.
    subtitle: "Avaliação abrangente",
    items: [
      "Avaliação Cardiológica: Eletrocardiograma, Espirometria, RX Tórax",
      "Testosterona (Hormônio relacionado à massa muscular, saúde óssea e libido)",
      "VHS (Avalia processo de inflamação no Organismo)",
      "Sódio",
      "Potássio",
      "Fosfatase Alcalina",
      "Vitamina B12",
      "Vitamina D",
      "Hemograma Completo",
      "Glicemia",
      "Hemoglobina Glicada",
      "Insulina",
      "Ferritina",
      "Avaliação da Tiroíde: TSH, T3, T4 Livre",
      "Perfil Lipídico (Colesterol Total, LDL, HDL, NÃO-HDL, VLDL, Triglicerídeos)",
      "Avaliação da Função do Fígado: TGO, TGP, Gama GT",
      "Avaliação da Função dos Rins: Ureia, Creatinina, Ácido Úrico, Urina Tipo I",
    ],
  },
  {
    title: "Check-Up Premium",
    subtitle: "39 exames · avaliação ampliada, com raio-X",
    items: [
      "Avaliação Cerebral: Eletroencefalograma",
      "Avaliação Pulmonar: Espirometria",
      "Avaliação Cardiológica: MAPA, Holter, RX Tórax",
      "Testosterona",
      "VHS (Avalia processo de inflamação no Organismo)",
      "Cortisol (Hormônio relacionado ao Estresse)",
      "PCR",
      "Sódio",
      "Potássio",
      "Vitamina B12",
      "Vitamina D",
      "Vitamina C",
      "Hemograma Completo",
      "Glicemia",
      "Hemoglobina Glicada",
      "Insulina",
      "Ferritina",
      "Avaliação da Tiroíde: TSH, T3, T4 Livre",
      "Colesterol Total, LDL, HDL, NÃO-HDL, VLDL, Triglicerídeos",
      "TGO, TGP, Gama GT, Fosfatase Alcalina",
      "Ureia, Creatinina, Ácido Úrico, Urina Tipo I",
      "CEA, CA 19-9, Sangue Oculto nas Fezes",
    ],
  },
];

const ASSUNTO = "check-up";

export default function CheckUp() {
  const openWhatsApp = useWhatsAppRedirect();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = CHECKUP_TITLE;
  }, []);

  useMetaDescription(CHECKUP_DESCRIPTION);
  useCanonical("/checkup");

  // BreadcrumbList, MedicalWebPage e FAQPage: emitidos pelo servidor no <head>,
  // dos mesmos dados desta pagina (seo-content.ts). Nao reintroduzir aqui o
  // bloco MedicalBusiness removido em 06/09/2026 (duplicava o @id do schema).

  // Mensagem da pagina (Fase 2): "Olá, vim pelo site e quero informações sobre check-up".
  const mensagem = mensagemSobre(ASSUNTO);
  const agendar = () => { trackScheduleCheckup("geral"); openWhatsApp("checkup_geral", mensagem); };

  const extras: BlocoExtra[] = [
    {
      id: "planos",
      rotulo: "Quais exames cada plano inclui?",
      node: (
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="container">
            <h2 className="heading-display text-3xl lg:text-4xl text-text mb-4">
              Quais exames cada <span className="text-brand">plano</span> inclui?
            </h2>
            <p className="text-text-light text-lg leading-relaxed max-w-3xl mb-10">
              Três planos para necessidades diferentes de prevenção. A equipe orienta o plano mais adequado ao seu
              perfil e histórico; valores e preparo pelo WhatsApp.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {checkupPackages.map((pkg) => (
                <div key={pkg.title} className="rounded-lg overflow-hidden bg-white text-text shadow-lg">
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-2 text-brand">{pkg.title}</h3>
                    <p className="text-sm mb-6 text-text-muted">{pkg.subtitle}</p>
                    <ul className="space-y-3 mb-8">
                      {pkg.items.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-brand" />
                          <span className="text-sm leading-relaxed text-text-muted">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <CtaWhatsApp
                      mensagem={mensagemSobre(`o ${pkg.title}`)}
                      onClick={() => { trackScheduleCheckup(pkg.title); openWhatsApp(`checkup_pkg_${pkg.title}`, mensagemSobre(`o ${pkg.title}`)); }}
                      className="block text-center w-full py-3 px-4 rounded-lg font-semibold transition-all bg-brand text-white hover:bg-brand-dark"
                    >
                      Agendar {pkg.title.split(" ")[1]}
                      <ArrowUpRight className="w-3.5 h-3.5 inline ml-2" />
                    </CtaWhatsApp>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ),
    },
  ];

  return (
    <PaginaServico
      assunto={ASSUNTO}
      h1={CHECKUP_H1}
      rotulo="Saúde preventiva"
      migalha="Check-up"
      conteudo={PAGINA_CHECKUP}
      faqs={CHECKUP_FAQS}
      artigos={artigosDaPagina(PAGINA_CHECKUP.blog ?? [])}
      mensagem={mensagem}
      agendar={agendar}
      textoCta="Agendar Check-Up"
      telefone={{ topo: "checkup_topo", rodape: "checkup_rodape" }}
      extras={extras}
      ctaFinal={{
        titulo: <>Agende seu <span className="text-brand">check-up</span></>,
        texto: "Agende pelo WhatsApp: a equipe envia as orientações de preparo, e os exames do plano são feitos em um único dia, de segunda a sexta, das 7h30 às 18h.",
        botao: "Agendar pelo WhatsApp",
      }}
    />
  );
}
