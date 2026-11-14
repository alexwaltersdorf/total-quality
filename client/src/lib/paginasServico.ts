/*
 * Textos das paginas de servico que nao sao de exame (analises clinicas,
 * check-up, bioimpedancia). SEO nov/2026, Fase 1: cada lista daqui alimenta
 * AO MESMO TEMPO a pagina React (renderizada no servidor e hidratada) e o
 * JSON-LD do <head> (server/_core/seo-content.ts). Pergunta visivel e FAQPage
 * nunca divergem porque saem do mesmo array.
 *
 * Origem dos textos: o pre-render escrito a mao em seo-content.ts (o que o
 * Google indexava) — nenhum fato novo. Onde o React e o pre-render diziam
 * coisas diferentes, ficou a versao mais conservadora, e a diferenca esta
 * anotada.
 */
import { CONVENIOS_TEXTO, anosDeAtuacao } from "@shared/const";

export type Faq = { q: string; a: string };

/** /laboratorio-caraguatatuba — eram as 4 perguntas do pre-render (o React nao tinha FAQ). */
export const LAB_FAQS: Faq[] = [
  {
    q: "Preciso agendar para fazer exames de sangue?",
    a: "Para a maioria dos exames laboratoriais não é necessário agendamento: basta comparecer com o pedido médico e documento com foto, de segunda a sexta das 7h30 às 18h. Exames de imagem e procedimentos especiais podem ser agendados pelo WhatsApp (12) 3887-3535.",
  },
  {
    q: "Quais convênios são aceitos?",
    a: `Atendemos ${CONVENIOS_TEXTO}. Fora deles, o atendimento é particular, com tabela própria. Tire dúvidas pelo WhatsApp (12) 3887-3535.`,
  },
  {
    q: "Em quanto tempo sai o resultado?",
    a: "A maioria dos exames de sangue tem resultado em curto prazo, disponível online. Exames específicos podem levar até 7 dias úteis.",
  },
  {
    q: "Vocês fazem coleta domiciliar?",
    a: "Sim. Realizamos coleta domiciliar de exames laboratoriais em Caraguatatuba. Agende pelo WhatsApp (12) 3887-3535 para confirmar disponibilidade, horários e valores.",
  },
];

/** /laboratorio-caraguatatuba — "Por que escolher", do pre-render. */
export function labDiferenciais(): string[] {
  return [
    `Mais de ${anosDeAtuacao()} anos de experiência em Caraguatatuba`,
    "Mais de 400 avaliações no Google",
    "Coleta rápida, ambiente confortável e estacionamento no Centro",
    "Resultados online em curto prazo para a maioria dos exames",
    "Atendimento particular, convênios e empresas de Caraguatatuba, Ubatuba, São Sebastião e Ilhabela",
  ];
}

/** /checkup — as 2 perguntas do pre-render; a pagina React nao mostrava FAQ. */
export const CHECKUP_FAQS: Faq[] = [
  {
    q: "Preciso de pedido médico para fazer check-up?",
    a: "Para os pacotes de check-up da Total Quality não é necessário pedido médico — nossa equipe orienta o pacote mais adequado ao seu perfil e histórico.",
  },
  {
    q: "Quanto tempo demoram os resultados?",
    a: "A maioria dos exames laboratoriais tem resultado em curto prazo, com acesso online. Exames de imagem têm laudo geralmente em poucos dias.",
  },
];
// TODO(alex): o pre-render antigo de /checkup tinha "Para quem é indicado"
// (20 a 35 anos a cada dois anos; anual a partir dos 40; protocolo ampliado a
// partir dos 50). E recomendacao medica sem fonte no repositorio: ficou fora
// da pagina ate voce confirmar o texto.

/*
 * /bioimpedancia — as 7 perguntas do pre-render. O React tinha outras 5, que
 * contradiziam o pre-render em fato medico: "recomendamos a cada 3 meses" (o
 * pre-render: quem define e o profissional que acompanha) e "nao e
 * recomendado para gestantes" (o pre-render: gestantes consultam o medico).
 * Ficou o pre-render, que e o mais conservador e o que tem guard-rail
 * (schema-semrush.test.ts: marca-passo, desfibrilador, "nao um diagnostico").
 */
export const BIO_FAQS: Faq[] = [
  {
    q: "Quanto tempo dura o exame de bioimpedância?",
    a: "O exame dura poucos minutos e o resultado sai na hora, com laudo detalhado da composição corporal.",
  },
  {
    q: "Preciso de pedido médico?",
    a: "Não é obrigatório: a bioimpedância pode ser feita por indicação médica, nutricional ou por interesse próprio no acompanhamento da saúde.",
  },
  {
    q: "Quem não deve fazer o exame?",
    a: "A bioimpedância funciona com a passagem de uma corrente elétrica de baixa intensidade pelo corpo. Por isso, não é indicada para pessoas com marca-passo, desfibrilador implantável ou outros dispositivos eletrônicos internos. Gestantes devem consultar o médico antes de realizar o exame. Informe a nossa equipe no agendamento se algum desses casos se aplica a você.",
  },
  {
    q: "Qual a diferença entre bioimpedância e IMC?",
    a: "O IMC relaciona apenas peso e altura, sem distinguir do que o peso é feito. A bioimpedância separa esse total em gordura, massa muscular e água, o que permite acompanhar mudanças na composição corporal mesmo quando o peso na balança não muda.",
  },
  {
    q: "De quanto em quanto tempo posso repetir?",
    a: "O intervalo depende do objetivo do acompanhamento e de quem o conduz. Em geral, repetições muito próximas mostram variações pouco significativas, já que a composição corporal muda de forma gradual. O profissional que acompanha o seu caso é quem define a periodicidade adequada.",
  },
  {
    q: "A bioimpedância substitui exames de sangue?",
    a: "Não. Ela descreve a composição corporal e não investiga alterações metabólicas, hormonais ou nutricionais, que dependem de exames laboratoriais. Os dois se complementam, e a interpretação conjunta cabe ao profissional que acompanha você.",
  },
  {
    q: "O resultado serve para diagnóstico?",
    a: "O laudo da bioimpedância é um dado de acompanhamento, não um diagnóstico. Ele ganha sentido quando lido pelo médico ou nutricionista junto ao histórico e ao restante da avaliação clínica.",
  },
];

/*
 * Home — as 4 perguntas do FAQPage da home. Ate 14/11/2026 elas existiam so
 * no pre-render (e no JSON-LD): a home React nao mostrava FAQ nenhum, e JSON-LD
 * de FAQ sem FAQ visivel contraria a diretriz do Google. Agora a home mostra
 * (HomeFaqSection) e o pre-render publica o FAQPage da mesma lista.
 */
export const HOME_FAQS: Faq[] = [
  {
    q: "Quais exames são realizados no laboratório em Caraguatatuba?",
    a: "A Total Quality realiza mais de 3.000 tipos de exames em Caraguatatuba - SP, incluindo exames de sangue (hemograma, glicemia, colesterol, hormônios), tomografia computadorizada, ultrassonografia, raio-X, eletrocardiograma, holter 24h, MAPA, bioimpedância e check-up preventivo.",
  },
  {
    q: "Qual o endereço do laboratório em Caraguatatuba?",
    a: "O laboratório Total Quality está localizado na Rua Padre Anchieta, 1010 - Centro, Caraguatatuba - SP. Funcionamento de segunda a sexta, das 07h30 às 18h.",
  },
  {
    q: "Como agendar exames no laboratório em Caraguatatuba?",
    a: "Exames laboratoriais e de sangue não precisam de agendamento: o atendimento é por ordem de chegada, de segunda a sexta, das 07h30 às 18h. Exames de imagem e procedimentos especiais podem ser agendados pelo WhatsApp ou telefone (12) 3887-3535, ou pelo site totalquality.med.br.",
  },
  {
    q: "O laboratório em Caraguatatuba aceita convênios?",
    a: `Atendemos ${CONVENIOS_TEXTO}. Fora desses três, o atendimento é particular, com tabela própria. Tire dúvidas pelo WhatsApp (12) 3887-3535.`,
  },
];
