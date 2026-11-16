/*
 * Conteudo do modelo de pagina (SEO nov/2026, Fase 3) para /especialidades/:slug.
 *
 * Fontes: client/src/lib/especialidadesData.ts (texto das consultas, decisoes
 * do Alex de 24/10/2026), client/src/lib/examesData.ts (exames que a clinica
 * faz e que o especialista pode pedir), artigos publicados do blog (ASO,
 * eletrocardiograma, ultrassom) e client/src/lib/bairrosAtendidos.ts.
 *
 * Cardiologista e pediatra: o Alex confirmou em 14/11/2026 que a clinica
 * atende ("SIM, ATENDEMOS. PODE CRIAR"), substituindo a informacao de 31/10.
 * Nao ha no repositorio NENHUM dado sobre essas consultas: as paginas dizem
 * so o que vale para toda consulta da clinica (hora marcada, endereco,
 * horario, convenios) e o que ja esta nos dados dos exames. Sem nome de
 * medico (decisao de 24/10/2026). Os TODO(alex) abaixo listam o que falta.
 *
 * Nunca citar ecocardiograma nem teste ergometrico (a clinica nao realiza;
 * guard-rail em server/seo-content.test.ts).
 */
import { CONVENIOS_TEXTO } from "@shared/const";
import { REVISAO_FASE_3, type ConteudoPagina } from "../modeloPagina";

const HORA_MARCADA_CONSULTA = "Consulta com hora marcada pelo WhatsApp (12) 3887-3535; dias e horários do especialista são confirmados no atendimento";
const CONVENIOS_CONSULTA = `Particular ou pelos convênios ${CONVENIOS_TEXTO}`;
const FOTO_RECEPCAO = {
  slug: "recepcao",
  widths: [480, 768, 1024],
  width: 1024,
  height: 576,
};

export const PAGINAS_ESPECIALIDADES: Record<string, ConteudoPagina> = {
  gastroenterologista: {
    respostaCurta:
      "O gastroenterologista é o médico do sistema digestivo: esôfago, estômago, intestino, fígado, vesícula e pâncreas. A consulta serve para queixas como refluxo, gastrite, dor abdominal e alterações do intestino ou do fígado. Na Total Quality, ela é com hora marcada pelo WhatsApp; a clínica não realiza endoscopia nem colonoscopia.",
    resumo: {
      jejum: "Não é necessário para a consulta",
      preparo: "Leve exames anteriores (endoscopia, colonoscopia, ultrassom, exames de sangue) e a lista dos remédios em uso",
      pedidoMedico: "Não é preciso encaminhamento; se tiver, leve no dia",
      atendimento: HORA_MARCADA_CONSULTA,
      convenios: CONVENIOS_CONSULTA,
    },
    imagem: { ...FOTO_RECEPCAO, alt: "Recepção da Total Quality em Caraguatatuba, onde os pacientes das consultas são recebidos" },
    secoes: [
      {
        id: "o-que-faz",
        titulo: "O que faz o gastroenterologista?",
        paragrafos: [
          "Cuida do sistema digestivo inteiro, do esôfago ao intestino, e também do fígado, da vesícula e do pâncreas. Acompanha queixas como azia e refluxo, gastrite, dor ou inchaço abdominal, prisão de ventre, diarreia que não passa, intolerâncias alimentares e alterações do fígado em exames.",
        ],
      },
      {
        id: "quando-procurar",
        titulo: "Quando procurar um gastroenterologista?",
        paragrafos: [
          "Quando o sintoma digestivo se repete ou não passa, quando um exame do fígado vem alterado ou quando outro médico encaminha. A consulta com hora marcada é para queixas que podem esperar.",
        ],
        lista: [
          "Azia, queimação ou refluxo frequentes",
          "Dor, inchaço ou desconforto abdominal que se repete",
          "Prisão de ventre ou diarreia que não passa",
          "TGO, TGP ou GGT alterados, ou gordura no fígado no ultrassom",
          "Suspeita de intolerância alimentar",
          "Gastrite, úlcera ou doença intestinal já diagnosticada",
        ],
      },
      {
        id: "como-e-a-consulta",
        titulo: "Como é a consulta?",
        paragrafos: [
          "O médico pergunta sobre os sintomas, a alimentação, os remédios em uso e o histórico da família, examina o abdome e avalia os exames que você levar. Conforme o caso, pede exames de sangue, de fezes ou de imagem, como o ultrassom de abdome total, e define o tratamento.",
          "Se for preciso endoscopia ou colonoscopia, o médico faz o pedido e orienta onde realizar, porque esses dois exames não são feitos na Total Quality. O ultrassom de abdome total e os exames de sangue podem ser feitos na própria clínica.",
        ],
      },
      {
        id: "urgencia",
        titulo: "Quando a dor abdominal é urgência?",
        paragrafos: [
          "Dor abdominal forte e repentina, vômito com sangue, fezes pretas ou com sangue, febre alta com dor ou pele e olhos amarelados pedem atendimento imediato: ligue para o SAMU 192 ou procure o pronto-socorro.",
        ],
      },
    ],
    nomeOndeFazer: "consulta com gastroenterologista",
    mensagemOndeFazer: `Agende a consulta com gastroenterologista pelo WhatsApp ou telefone: dias e horários são confirmados no atendimento. Atendimento particular e pelos convênios ${CONVENIOS_TEXTO}.`,
    blog: ["siglas-exames-laboratoriais", "exames-de-sangue-guia-completo"],
    relacionados: ["/exames/ultrassonografia", "/exames/exames-de-sangue", "/especialidades/endocrinologista", "/especialidades"],
    atualizadoEm: REVISAO_FASE_3,
  },

  endocrinologista: {
    respostaCurta:
      "O endocrinologista é o médico das glândulas e dos hormônios: acompanha diabetes, tireoide, obesidade, colesterol alto, osteoporose e alterações hormonais. Na Total Quality, a consulta é com hora marcada pelo WhatsApp, particular ou pelos convênios atendidos, e os exames de sangue pedidos podem ser coletados na própria clínica, sem agendamento.",
    resumo: {
      jejum: "Não é necessário para a consulta",
      preparo: "Leve exames de sangue e de imagem anteriores, mesmo antigos, e a lista dos remédios em uso",
      pedidoMedico: "Não é preciso encaminhamento; se tiver, leve no dia",
      atendimento: HORA_MARCADA_CONSULTA,
      convenios: CONVENIOS_CONSULTA,
    },
    imagem: { ...FOTO_RECEPCAO, alt: "Recepção da Total Quality em Caraguatatuba, onde os pacientes das consultas são recebidos" },
    secoes: [
      {
        id: "o-que-faz",
        titulo: "O que faz o endocrinologista?",
        paragrafos: [
          "Cuida das glândulas e dos hormônios do corpo. Acompanha diabetes, alterações da tireoide (hipotireoidismo, hipertireoidismo e nódulos), obesidade, colesterol alto, osteoporose e alterações hormonais que afetam o crescimento, o peso, a menstruação e a fertilidade.",
        ],
      },
      {
        id: "quando-procurar",
        titulo: "Quando procurar um endocrinologista?",
        paragrafos: ["Muitas vezes, a consulta começa com um exame de sangue alterado ou com um encaminhamento de outro médico."],
        lista: [
          "Diabetes ou glicemia alterada",
          "TSH ou T4 livre alterados, ou nódulo na tireoide",
          "Ganho ou perda de peso sem explicação",
          "Cansaço persistente, queda de cabelo, intolerância ao frio ou ao calor",
          "Colesterol ou triglicerídeos alterados",
          "Osteoporose ou risco de fratura",
          "Alterações menstruais ou hormonais",
        ],
      },
      {
        id: "como-e-a-consulta",
        titulo: "Como é a consulta?",
        paragrafos: [
          "O médico conversa sobre os sintomas, o histórico de saúde e da família e os remédios em uso, faz o exame físico (peso, pressão, palpação da tireoide) e avalia os exames que você levar. Conforme o caso, pede exames de sangue — glicemia, hemoglobina glicada, TSH, T4 livre, perfil lipídico — ou de imagem, como o ultrassom de tireoide, e define o tratamento e o retorno.",
        ],
      },
      {
        id: "exames",
        titulo: "Os exames pedidos podem ser feitos na clínica?",
        paragrafos: [
          "Sim. Os exames de sangue são coletados na Total Quality sem agendamento, por ordem de chegada, de segunda a sexta, das 7h30 às 18h, com resultado online. O ultrassom de tireoide é feito com hora marcada e não exige preparo especial.",
        ],
      },
    ],
    nomeOndeFazer: "consulta com endocrinologista",
    mensagemOndeFazer: `Agende a consulta com endocrinologista pelo WhatsApp ou telefone: dias e horários são confirmados no atendimento. Atendimento particular e pelos convênios ${CONVENIOS_TEXTO}.`,
    blog: ["siglas-exames-laboratoriais", "exames-de-sangue-guia-completo", "hipoglicemia-sintomas-e-exames"],
    relacionados: ["/exames/exames-de-sangue", "/exames/ultrassonografia", "/exames/hemograma", "/especialidades"],
    atualizadoEm: REVISAO_FASE_3,
  },

  "medicina-do-trabalho": {
    respostaCurta:
      "A medicina do trabalho cuida da saúde do trabalhador em relação aos riscos da função. A Total Quality elabora o PCMSO da empresa, faz os exames ocupacionais previstos na NR-7 — admissional, periódico, demissional, retorno e mudança de risco — e emite o ASO, com exames complementares no mesmo endereço. Agendamento pelo WhatsApp.",
    resumo: {
      preparo: "Empresa: descrição das funções e dos riscos. Trabalhador: documento com foto e encaminhamento da empresa",
      duracao: "Avaliação clínica de 20 a 30 minutos; exames complementares no mesmo local",
      resultado: "ASO ao final de cada exame ocupacional; o toxicológico sai à parte, em 5 dias úteis",
      atendimento: "Agendamento pelo WhatsApp (12) 3887-3535, de segunda a sexta, das 7h30 às 18h",
    },
    // TODO(alex): sem foto real de atendimento ocupacional em /images (a do PR
    // #87 depende da sua aprovacao).
    secoes: [
      {
        id: "o-que-e",
        titulo: "O que é medicina do trabalho?",
        paragrafos: [
          "É a área que acompanha a saúde do trabalhador conforme os riscos de cada função. Pela Norma Regulamentadora nº 7 (NR-7), a empresa precisa manter o PCMSO, o Programa de Controle Médico de Saúde Ocupacional, e fazer os exames ocupacionais previstos nele. Cada exame termina com o ASO, o Atestado de Saúde Ocupacional.",
        ],
      },
      {
        id: "pcmso-e-aso",
        titulo: "Qual a diferença entre PCMSO e ASO?",
        paragrafos: [
          "O PCMSO é o programa da empresa: define quais exames cada função precisa e com que frequência, a partir dos riscos identificados. O ASO é o atestado emitido em cada exame ocupacional, dizendo se o trabalhador está apto ou inapto para aquela função. O ASO não é um atestado de saúde geral, e não serve para qualquer função: uma mudança de riscos pode exigir nova avaliação.",
        ],
      },
      {
        id: "como-funciona",
        titulo: "Como funciona o atendimento para empresas?",
        paragrafos: [
          "A Total Quality elabora o PCMSO a partir das funções e dos riscos informados pela empresa e realiza os exames que ele prevê. A avaliação clínica é feita por médico do trabalho; os exames complementares definidos para cada função — audiometria, espirometria, acuidade visual, eletrocardiograma, raio-X e exames laboratoriais — são feitos no mesmo local.",
          "Para motorista profissional, o exame toxicológico pode ser feito na mesma ida. Pela Portaria MTP nº 672/2021, o resultado segue à parte e não é registrado no ASO; na Total Quality, a janela de detecção é de 180 dias e o resultado sai em 5 dias úteis.",
        ],
      },
      {
        id: "o-que-organizar",
        titulo: "O que a empresa organiza antes do atendimento?",
        paragrafos: ["Esse alinhamento evita retrabalho e ajuda o médico a conduzir a avaliação certa para cada função."],
        lista: [
          "PCMSO atualizado",
          "Função, atividades e riscos de cada trabalhador",
          "Tipo de exame ocupacional",
          "Exames complementares previstos",
          "Agendamento e identificação do trabalhador",
          "Como o ASO será recebido e arquivado",
        ],
      },
      {
        id: "quem-paga",
        titulo: "Quem paga os exames ocupacionais?",
        paragrafos: [
          "O empregador. Os procedimentos do controle médico ocupacional são responsabilidade da empresa, nos termos da legislação trabalhista, nunca do trabalhador.",
        ],
      },
    ],
    empresa: {
      titulo: "Serviços para empresas",
      paragrafos: [
        "Atendemos empresas de Caraguatatuba, Ubatuba, São Sebastião e Ilhabela, com atendimento contínuo para a demanda de admissionais, periódicos e demissionais.",
      ],
      itens: [
        "Elaboração do PCMSO (NR-7)",
        "ASO admissional, periódico e demissional",
        "Retorno ao trabalho e mudança de risco ocupacional",
        "Audiometria, espirometria e acuidade visual",
        "Eletrocardiograma, raio-X e exames laboratoriais",
        "Toxicológico do motorista profissional",
      ],
      cta: "Solicitar proposta para empresa",
      mensagem: "Olá, vim pelo site e quero solicitar uma proposta de medicina do trabalho (PCMSO e ASO) para a minha empresa",
    },
    nomeOndeFazer: "medicina do trabalho",
    mensagemOndeFazer:
      "Empresas e trabalhadores agendam pelo WhatsApp ou telefone. PCMSO, exames ocupacionais, ASO e exames complementares no mesmo endereço.",
    blog: ["aso-exames-ocupacionais", "exame-toxicologico-cnh"],
    relacionados: ["/exames/exame-admissional", "/exames/exame-toxicologico", "/exames/espirometria", "/exames/raio-x"],
    atualizadoEm: REVISAO_FASE_3,
  },

  cardiologista: {
    // TODO(alex): para completar a pagina faltam — dias e horarios do
    // cardiologista; o que acontece na consulta (o que o medico avalia e pede);
    // se atende retorno com laudo de exame; faixa etaria; convenios aceitos na
    // consulta (hoje: o padrao das consultas, a confirmar pelo WhatsApp).
    respostaCurta:
      "O cardiologista é o médico que cuida do coração e da circulação. Na Total Quality, a consulta é com hora marcada pelo WhatsApp, e o eletrocardiograma, o Holter 24h e o MAPA 24h que o médico pedir podem ser feitos na própria clínica, no Centro de Caraguatatuba.",
    resumo: {
      preparo: "Leve exames anteriores do coração (eletrocardiograma, Holter, MAPA, exames de sangue) e a lista dos remédios em uso",
      atendimento: HORA_MARCADA_CONSULTA,
      convenios: `Convênios atendidos na clínica: ${CONVENIOS_TEXTO}; fora deles, particular. A cobertura da consulta é confirmada pelo WhatsApp`,
    },
    imagem: { ...FOTO_RECEPCAO, alt: "Recepção da Total Quality em Caraguatatuba, onde os pacientes das consultas são recebidos" },
    secoes: [
      {
        id: "quando-procurar",
        titulo: "Quando procurar um cardiologista?",
        paragrafos: [
          "Situações que levam o médico a pedir exames do coração — e que costumam motivar a consulta — estão abaixo. A consulta com hora marcada é para o que pode esperar.",
        ],
        lista: [
          "Palpitações ou batimentos irregulares",
          "Pressão alta",
          "Tonturas ou desmaios",
          "Falta de ar",
          "Acompanhamento de arritmia ou de hipertensão já diagnosticadas",
          "Avaliação antes de cirurgia ou de prática esportiva",
        ],
      },
      {
        id: "exames",
        titulo: "Quais exames do coração são feitos na clínica?",
        paragrafos: [
          "O eletrocardiograma registra a atividade elétrica do coração em poucos minutos, em repouso. O Holter grava o ritmo do coração por 24 horas, durante a rotina e o sono. O MAPA mede a pressão arterial automaticamente ao longo de 24 horas. Os três são feitos com hora marcada, e os exames de sangue do pedido são coletados por ordem de chegada, no mesmo endereço.",
        ],
      },
      {
        id: "urgencia",
        titulo: "Quando é urgência?",
        paragrafos: [
          "Dor ou aperto no peito, falta de ar súbita, desmaio ou mal-estar intenso são sinais de emergência: ligue para o SAMU 192 ou procure o pronto-socorro mais próximo. A consulta e os exames com hora marcada não substituem esse atendimento.",
        ],
      },
    ],
    nomeOndeFazer: "consulta com cardiologista",
    mensagemOndeFazer:
      "Agende a consulta com cardiologista pelo WhatsApp ou telefone: dias e horários são confirmados no atendimento.",
    blog: ["eletrocardiograma-o-que-e-como-e-feito", "mapa-ou-holter-diferenca", "saude-do-coracao-prevencao"],
    relacionados: ["/exames/eletrocardiograma", "/exames/holter", "/exames/mapa", "/especialidades"],
    atualizadoEm: REVISAO_FASE_3,
  },

  pediatra: {
    // TODO(alex): para completar a pagina faltam — faixa etaria atendida;
    // dias e horarios do pediatra; o que levar (caderneta de saude, cartao de
    // vacina?); se a clinica vacina (nao inventar); quais exames infantis sao
    // coletados na clinica; convenios aceitos na consulta.
    respostaCurta:
      "O pediatra é o médico que acompanha a saúde de bebês, crianças e adolescentes. Na Total Quality, a consulta com pediatra é com hora marcada pelo WhatsApp, no Centro de Caraguatatuba, de segunda a sexta. Dias e horários do especialista são confirmados no atendimento.",
    resumo: {
      atendimento: HORA_MARCADA_CONSULTA,
      convenios: `Convênios atendidos na clínica: ${CONVENIOS_TEXTO}; fora deles, particular. A cobertura da consulta é confirmada pelo WhatsApp`,
    },
    imagem: { ...FOTO_RECEPCAO, alt: "Recepção da Total Quality em Caraguatatuba, onde os pacientes das consultas são recebidos" },
    secoes: [
      {
        id: "como-agendar",
        titulo: "Como agendar a consulta com pediatra?",
        paragrafos: [
          "Pelo WhatsApp (12) 3887-3535 ou pelo telefone. A clínica funciona de segunda a sexta, das 7h30 às 18h, e fecha aos sábados e domingos. Leve exames anteriores da criança e a lista dos remédios em uso, se houver.",
        ],
      },
      {
        id: "exames",
        titulo: "Os exames pedidos pelo pediatra podem ser feitos na clínica?",
        paragrafos: [
          "Confirme pelo WhatsApp quais exames do pedido são feitos na Total Quality e o preparo de cada um. A espirometria, por exemplo, pode ser feita por crianças em geral a partir dos 6 anos, quando já conseguem colaborar com as manobras respiratórias.",
        ],
      },
      {
        id: "urgencia",
        titulo: "Quando é urgência?",
        paragrafos: [
          "A clínica não é serviço de urgência. Febre alta que não cede, falta de ar ou dor forte pedem a UPA; em situação grave, ligue para o SAMU 192.",
        ],
      },
    ],
    nomeOndeFazer: "consulta com pediatra",
    mensagemOndeFazer:
      "Agende a consulta com pediatra pelo WhatsApp ou telefone: dias e horários são confirmados no atendimento.",
    relacionados: ["/exames/espirometria", "/exames/exames-de-sangue", "/especialidades/endocrinologista", "/especialidades"],
    atualizadoEm: REVISAO_FASE_3,
  },
};
