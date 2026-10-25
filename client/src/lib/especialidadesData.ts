/*
 * Paginas de especialidade (/especialidades/:slug), criadas a pedido do Alex
 * em 24/10/2026. Usam o mesmo modelo das paginas de exame (ExamData) e o
 * mesmo componente (ExamePage), com textos de consulta no lugar de exame.
 *
 * Decisoes do Alex (24/10/2026), que este arquivo nao pode contrariar:
 *   - as paginas NAO citam o nome do medico (sem nome, a identificacao do
 *     art. 5o da Resolucao CFM 2.336/2023 e a da clinica e do RT);
 *   - a clinica NAO faz endoscopia nem colonoscopia: a gastroenterologia e
 *     so consulta (a pagina diz isso com todas as letras);
 *   - medicina do trabalho inclui o PCMSO para empresas, alem do ASO;
 *   - consultas: particular e os tres convenios (Cartao de Todos, Solumedi
 *     e Leader).
 *
 * Uma URL por intencao: /especialidades/medicina-do-trabalho e a pagina da
 * empresa que procura "medicina do trabalho" e PCMSO; /exames/exame-admissional
 * continua dona de "exame admissional", a busca de quem vai fazer o exame.
 */
import { Clock, FileText, CheckCircle, Stethoscope, AlertTriangle, Users } from "lucide-react";
import type { ExamData } from "./examesData";
import { CONVENIOS_TEXTO } from "@shared/const";

export const ESPECIALIDADES_BASE = "/especialidades";

export const especialidadesData: ExamData[] = [
  {
    slug: "endocrinologista",
    title: "ENDOCRINOLOGIA",
    shortTitle: "Endocrinologista",
    subtitle: "Consulta com especialista",
    description: "Consulta com médico endocrinologista para diabetes, tireoide, obesidade e alterações hormonais.",
    metaTitle: "Endocrinologista em Caraguatatuba | Total Quality",
    metaDescription: "Consulta com endocrinologista em Caraguatatuba: diabetes, tireoide, obesidade e hormônios. Particular e convênios. Agende pelo WhatsApp (12) 3887-3535.",
    heroDescription: `Consulta com médico endocrinologista na Rua Padre Anchieta, 1010, no Centro de Caraguatatuba, com hora marcada pelo WhatsApp. Atendimento particular e pelos convênios ${CONVENIOS_TEXTO}. Os exames de sangue que o médico pedir podem ser coletados na própria clínica, sem agendamento.`,
    whatIs: "O endocrinologista é o médico que cuida das glândulas e dos hormônios do corpo. Ele acompanha doenças como diabetes, alterações da tireoide (hipotireoidismo, hipertireoidismo e nódulos), obesidade, colesterol alto, osteoporose e alterações hormonais que afetam o crescimento, o peso, a menstruação e a fertilidade.",
    howItWorks: "Na consulta, o médico conversa sobre os sintomas, o histórico de saúde e da família e os remédios em uso, faz o exame físico (peso, pressão, palpação da tireoide) e avalia os exames que você levar. Conforme o caso, pede exames de sangue, como glicemia, hemoglobina glicada, TSH, T4 livre e perfil lipídico, ou exames de imagem, como o ultrassom de tireoide, e define o tratamento e o retorno.",
    indications: [
      "Diabetes ou glicemia alterada em exame de sangue",
      "Alteração no TSH ou no T4 livre, ou nódulo na tireoide",
      "Ganho ou perda de peso sem explicação",
      "Cansaço persistente, queda de cabelo ou intolerância ao frio ou ao calor",
      "Colesterol ou triglicerídeos alterados",
      "Osteoporose ou risco de fratura",
      "Alterações menstruais ou hormonais",
      "Encaminhamento de outro médico",
    ],
    preparations: [
      { icon: FileText, text: "Leve exames de sangue e de imagem anteriores, mesmo antigos" },
      { icon: CheckCircle, text: "Leve a lista ou as caixas dos remédios que você usa" },
      { icon: Clock, text: "Consulta com hora marcada pelo WhatsApp (12) 3887-3535" },
      { icon: Users, text: `Particular ou pelos convênios ${CONVENIOS_TEXTO}` },
    ],
    faqs: [
      { q: "Preciso de encaminhamento para consultar com o endocrinologista?", a: "Não. Você pode marcar a consulta direto pelo WhatsApp (12) 3887-3535. Se tiver encaminhamento ou exames de outro médico, leve no dia." },
      { q: "Preciso estar em jejum para a consulta?", a: "Não. A consulta não exige jejum. Se o médico pedir exames de sangue, o preparo de cada um é informado no pedido e pode ser confirmado pelo WhatsApp." },
      { q: "Posso fazer os exames pedidos pelo endocrinologista na própria clínica?", a: "Sim. Os exames de sangue são coletados na Total Quality sem agendamento, por ordem de chegada, de segunda a sexta, das 7h30 às 18h. O ultrassom de tireoide é feito com hora marcada." },
      { q: "A consulta é coberta por convênio?", a: `A consulta é atendida de forma particular e pelos convênios ${CONVENIOS_TEXTO}. Outros planos não são atendidos. Valores e disponibilidade são confirmados pelo WhatsApp.` },
      { q: "Onde fazer consulta com endocrinologista em Caraguatatuba?", a: "Na Total Quality Medicina Diagnóstica, na Rua Padre Anchieta, 1010 – Centro, Caraguatatuba-SP. A consulta é com hora marcada: dias e horários do especialista são confirmados pelo WhatsApp (12) 3887-3535. A clínica atende de segunda a sexta, das 7h30 às 18h." },
    ],
    whatsappMessage: "Olá! Gostaria de agendar uma consulta com endocrinologista.",
    category: "consulta",
    keywords: ["endocrinologista", "endocrinologista Caraguatatuba", "endocrinologia", "consulta endocrinologista", "tireoide", "diabetes", "Caraguatatuba"],
  },
  {
    slug: "gastroenterologista",
    title: "GASTROENTEROLOGIA",
    shortTitle: "Gastroenterologista",
    subtitle: "Consulta com especialista",
    description: "Consulta com médico gastroenterologista para refluxo, gastrite, dor abdominal e alterações do intestino e do fígado.",
    metaTitle: "Gastroenterologista em Caraguatatuba | Total Quality",
    metaDescription: "Consulta com gastroenterologista em Caraguatatuba: refluxo, gastrite, dor abdominal, intestino e fígado. Particular e convênios. WhatsApp (12) 3887-3535.",
    heroDescription: `Consulta com médico gastroenterologista na Rua Padre Anchieta, 1010, no Centro de Caraguatatuba, com hora marcada pelo WhatsApp. Atendimento particular e pelos convênios ${CONVENIOS_TEXTO}. A Total Quality não realiza endoscopia nem colonoscopia; ultrassom e exames de sangue pedidos pelo médico podem ser feitos na própria clínica.`,
    whatIs: "O gastroenterologista é o médico que cuida do sistema digestivo: esôfago, estômago, intestino, fígado, vesícula e pâncreas. Ele acompanha queixas como azia e refluxo, gastrite, dor ou inchaço abdominal, prisão de ventre, diarreia que não passa, intolerâncias alimentares e alterações do fígado em exames.",
    howItWorks: "Na consulta, o médico pergunta sobre os sintomas, a alimentação, os remédios em uso e o histórico da família, examina o abdome e avalia os exames que você levar. Conforme o caso, pede exames de sangue, de fezes ou de imagem, como o ultrassom de abdome total, e define o tratamento. Se for preciso endoscopia ou colonoscopia, o médico faz o pedido e orienta onde realizar, porque esses dois exames não são feitos na Total Quality.",
    indications: [
      "Azia, queimação ou refluxo frequentes",
      "Dor, inchaço ou desconforto abdominal que se repete",
      "Prisão de ventre ou diarreia que não passa",
      "Alteração de exames do fígado (TGO, TGP, GGT) ou gordura no fígado no ultrassom",
      "Suspeita de intolerância alimentar",
      "Acompanhamento de gastrite, úlcera ou doença intestinal já diagnosticada",
      "Encaminhamento de outro médico",
    ],
    preparations: [
      { icon: FileText, text: "Leve exames anteriores, como endoscopia, colonoscopia, ultrassom e exames de sangue" },
      { icon: CheckCircle, text: "Leve a lista ou as caixas dos remédios que você usa" },
      { icon: Clock, text: "Consulta com hora marcada pelo WhatsApp (12) 3887-3535" },
      { icon: AlertTriangle, text: "Vômito com sangue, fezes pretas ou dor abdominal forte e súbita são urgência: SAMU 192 ou pronto-socorro" },
    ],
    faqs: [
      { q: "A Total Quality faz endoscopia ou colonoscopia?", a: "Não. A clínica oferece a consulta com o gastroenterologista. Se o médico pedir endoscopia ou colonoscopia, ele faz o pedido e orienta onde realizar. Ultrassom de abdome total e exames de sangue podem ser feitos na própria Total Quality." },
      { q: "Preciso de encaminhamento para consultar com o gastroenterologista?", a: "Não. Você pode marcar a consulta direto pelo WhatsApp (12) 3887-3535. Se tiver encaminhamento ou exames de outro médico, leve no dia." },
      { q: "Quando a dor abdominal é urgência?", a: "Dor abdominal forte e repentina, vômito com sangue, fezes pretas ou com sangue, febre alta com dor ou pele e olhos amarelados pedem atendimento imediato: ligue para o SAMU 192 ou procure o pronto-socorro. A consulta com hora marcada é para queixas que podem esperar." },
      { q: "A consulta é coberta por convênio?", a: `A consulta é atendida de forma particular e pelos convênios ${CONVENIOS_TEXTO}. Outros planos não são atendidos. Valores e disponibilidade são confirmados pelo WhatsApp.` },
      { q: "Onde fazer consulta com gastroenterologista em Caraguatatuba?", a: "Na Total Quality Medicina Diagnóstica, na Rua Padre Anchieta, 1010 – Centro, Caraguatatuba-SP. A consulta é com hora marcada: dias e horários do especialista são confirmados pelo WhatsApp (12) 3887-3535. A clínica atende de segunda a sexta, das 7h30 às 18h." },
    ],
    whatsappMessage: "Olá! Gostaria de agendar uma consulta com gastroenterologista.",
    category: "consulta",
    keywords: ["gastroenterologista", "gastroenterologista Caraguatatuba", "gastroenterologia", "consulta gastroenterologista", "refluxo", "gastrite", "Caraguatatuba"],
  },
  {
    slug: "medicina-do-trabalho",
    title: "MEDICINA DO TRABALHO",
    shortTitle: "Medicina do Trabalho",
    subtitle: "PCMSO e ASO para empresas",
    description: "Medicina do trabalho para empresas do Litoral Norte: PCMSO, exames ocupacionais e ASO.",
    metaTitle: "Medicina do Trabalho em Caraguatatuba | Total Quality",
    metaDescription: "Medicina do trabalho em Caraguatatuba para empresas: PCMSO, ASO admissional, periódico e demissional e exames complementares no mesmo local.",
    heroDescription: "Medicina do trabalho para empresas de Caraguatatuba, Ubatuba, São Sebastião e Ilhabela: elaboração do PCMSO, exames ocupacionais com emissão do ASO e exames complementares no mesmo endereço, na Rua Padre Anchieta, 1010, no Centro de Caraguatatuba.",
    whatIs: "A medicina do trabalho cuida da saúde do trabalhador em relação aos riscos da função. Pela Norma Regulamentadora nº 7 (NR-7), a empresa precisa manter o PCMSO, o Programa de Controle Médico de Saúde Ocupacional, e realizar os exames ocupacionais previstos nele. Cada exame termina com o ASO, o Atestado de Saúde Ocupacional, que registra se o trabalhador está apto ou inapto para a função.",
    howItWorks: "A Total Quality elabora o PCMSO da empresa a partir dos riscos de cada função e realiza os exames que ele prevê: admissional, periódico, demissional, de retorno ao trabalho e de mudança de risco ocupacional. A avaliação clínica é feita por médico do trabalho, e os exames complementares definidos para cada função, como audiometria, espirometria, acuidade visual, eletrocardiograma, raio-X e exames laboratoriais, são feitos no mesmo local. Para motorista profissional, o exame toxicológico pode ser feito na mesma ida, com resultado à parte do ASO.",
    indications: [
      "Empresa que precisa elaborar ou atualizar o PCMSO",
      "Contratação de funcionário (exame admissional)",
      "Exame periódico previsto no PCMSO",
      "Desligamento (exame demissional)",
      "Retorno ao trabalho após afastamento",
      "Mudança de função com novos riscos",
      "Motorista profissional que precisa do exame toxicológico",
    ],
    preparations: [
      { icon: FileText, text: "Empresa: envie a descrição das funções e dos riscos para o PCMSO" },
      { icon: Users, text: "Trabalhador: leve documento com foto e o encaminhamento da empresa" },
      { icon: Clock, text: "Agendamento pelo WhatsApp (12) 3887-3535, de segunda a sexta" },
      { icon: Stethoscope, text: "Alguns exames complementares pedem preparo: a equipe orienta no agendamento" },
    ],
    faqs: [
      { q: "Qual a diferença entre PCMSO e ASO?", a: "O PCMSO é o programa da empresa, previsto na NR-7, que define quais exames cada função precisa e com que frequência. O ASO é o atestado emitido em cada exame ocupacional, dizendo se o trabalhador está apto ou inapto para a função." },
      { q: "A Total Quality elabora o PCMSO da empresa?", a: "Sim. A clínica elabora o PCMSO a partir das funções e dos riscos informados pela empresa e realiza os exames ocupacionais que ele prevê, com a emissão do ASO." },
      { q: "Os exames complementares são feitos no mesmo lugar?", a: "Sim. Audiometria, espirometria, acuidade visual, eletrocardiograma, raio-X e exames laboratoriais são feitos na própria Total Quality, conforme o que o PCMSO prevê para cada função." },
      { q: "O exame toxicológico entra no ASO?", a: "Não. Para motorista profissional, o exame toxicológico pode ser feito na mesma ida à clínica, mas, pela Portaria MTP nº 672/2021, o resultado segue à parte e não é registrado no ASO. Na Total Quality, a janela de detecção é de 180 dias e o resultado sai em 5 dias úteis." },
      { q: "Onde fazer medicina do trabalho em Caraguatatuba?", a: "Na Total Quality Medicina Diagnóstica, na Rua Padre Anchieta, 1010 – Centro, Caraguatatuba-SP. Empresas e trabalhadores agendam pelo WhatsApp (12) 3887-3535, de segunda a sexta, das 7h30 às 18h." },
    ],
    whatsappMessage: "Olá! Gostaria de informações sobre medicina do trabalho (PCMSO e ASO) para minha empresa.",
    category: "ocupacional",
    keywords: ["medicina do trabalho", "medicina do trabalho Caraguatatuba", "PCMSO", "ASO", "exame ocupacional", "NR-7", "Caraguatatuba"],
  },
];

export function getEspecialidadeBySlug(slug: string): ExamData | undefined {
  return especialidadesData.find((e) => e.slug === slug);
}
