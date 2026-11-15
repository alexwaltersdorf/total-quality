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
import { REVISAO_FASE_3, type ConteudoPagina } from "./modeloPagina";

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
  // Fase 3 (15/11/2026): do artigo publicado resultado-de-exames-online-seguranca.
  {
    q: "Quem pode receber o resultado do meu exame?",
    a: "O próprio paciente, identificado; o representante legal, como pai, mãe ou responsável de menor, ou quem tem procuração ou curatela; e o médico solicitante. Resultado de exame é dado pessoal sensível de saúde, protegido pela LGPD e pelo sigilo profissional.",
  },
  {
    q: "Posso receber o resultado pelo WhatsApp?",
    a: "O WhatsApp serve para tirar dúvidas de preparo, convênios e agendamento. O laudo é entregue pelo acesso online nominal, com os dados informados no atendimento, como exige a proteção de dado sensível.",
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
  // Fase 3 (15/11/2026): dos planos de CheckUp.tsx e do artigo publicado
  // check-up-medico-quais-exames-fazer.
  {
    q: "Qual a diferença entre os planos Básico, Select e Premium?",
    a: "O Básico reúne exames de sangue e de urina para uma avaliação essencial. O Select acrescenta eletrocardiograma, espirometria, raio-X de tórax, hormônios e vitaminas. O Premium inclui eletroencefalograma, espirometria, MAPA, Holter, raio-X de tórax e marcadores como CEA e CA 19-9, além dos exames de sangue. A lista completa de cada plano está nesta página.",
  },
  {
    q: "Todo mundo precisa fazer os mesmos exames?",
    a: "Não. A composição do check-up depende de idade, sexo, histórico familiar, hábitos de vida e sintomas. A equipe orienta o plano mais adequado ao seu perfil, e a definição dos exames e da frequência deve partir da avaliação de um médico.",
  },
  {
    q: "Os exames do check-up são feitos no mesmo dia?",
    a: "Sim. Os exames laboratoriais e de imagem do plano são feitos em um único dia, na clínica, depois do agendamento pelo WhatsApp ou telefone, quando a equipe envia as orientações de preparo.",
  },
  {
    q: "Preciso de jejum para o check-up?",
    a: "Depende dos exames do plano: exames laboratoriais podem exigir jejum, e exames de imagem têm orientações próprias. A equipe envia o preparo de cada exame no agendamento.",
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

/* ------------------------------------------------------------------------
 * Modelo de pagina (SEO nov/2026, Fase 3): conteudo de /laboratorio-caraguatatuba,
 * /checkup e /bioimpedancia no mesmo formato das paginas de exame
 * (lib/modeloPagina.ts). Fontes: o texto que estas paginas ja publicavam, as
 * listas acima e os artigos publicados do blog (alimentacao e exames,
 * resultado online, check-up). Nada novo.
 * --------------------------------------------------------------------- */

export const PAGINA_LABORATORIO: ConteudoPagina = {
  respostaCurta:
    "A Total Quality é um laboratório de análises clínicas no Centro de Caraguatatuba que realiza mais de 3.000 tipos de exames, com equipamentos automatizados e resultados online. A coleta laboratorial é sem agendamento, por ordem de chegada, de segunda a sexta, das 7h30 às 18h; exames de imagem são feitos com hora marcada.",
  resumo: {
    jejum: "Depende dos exames do pedido; quando houver mais de um, vale o preparo mais exigente",
    preparo: "Informe medicamentos e suplementos em uso; a equipe orienta o preparo de cada exame",
    duracao: "A coleta leva poucos minutos",
    resultado: "A maioria em curto prazo, com acesso online; exames específicos podem levar até 7 dias úteis",
    pedidoMedico: "Traga o pedido médico e um documento com foto",
    atendimento: "Coleta sem agendamento, por ordem de chegada, de segunda a sexta, das 7h30 às 18h; coleta domiciliar mediante agendamento",
    convenios: `${CONVENIOS_TEXTO}; fora deles, atendimento particular`,
  },
  imagem: {
    slug: "laboratorio",
    widths: [480, 768, 1024, 1440],
    width: 1440,
    height: 1075,
    alt: "Bancada do laboratório de análises clínicas da Total Quality em Caraguatatuba",
  },
  secoes: [
    {
      id: "como-funciona",
      titulo: "Como funciona a coleta no laboratório?",
      paragrafos: [
        "Para exames de sangue e demais exames laboratoriais, basta vir com o pedido médico e um documento com foto: o atendimento é por ordem de chegada, sem agendamento. A coleta é feita por profissionais treinados, e as amostras são processadas em equipamentos automatizados.",
        "Ultrassonografia, tomografia, raio-X, eletrocardiograma, MAPA e Holter são feitos com hora marcada pelo WhatsApp, porque dependem de horário com o médico e de preparo específico. Se o pedido junta exames de laboratório e de imagem, pergunte se dá para fazer tudo no mesmo dia.",
      ],
    },
    {
      id: "jejum-e-preparo",
      titulo: "Precisa de jejum ou preparo?",
      paragrafos: [
        "O preparo muda de um exame para outro: o hemograma isolado não exige jejum, a glicemia de jejum pede em geral 8 horas, e alguns exames de fezes têm orientações próprias, informadas no atendimento junto com o frasco de coleta. Se o pedido tem exame com jejum, as horas contam a partir da última refeição em casa — o trajeto até o Centro entra dentro do jejum.",
      ],
    },
    {
      id: "resultado",
      titulo: "Quando sai o resultado e como acessar?",
      paragrafos: [
        "A maioria dos exames de sangue tem resultado em curto prazo; exames específicos podem levar até 7 dias úteis. O laudo fica disponível no acesso online nominal, com os dados informados no atendimento, e traz o resultado e o valor de referência do método usado — a interpretação é do seu médico.",
        "Ao abrir o laudo, confira o nome completo e a data de nascimento no cabeçalho e baixe o arquivo, em vez de depender do link aberto num navegador compartilhado. Se perder o acesso, refaça pelo canal oficial, com identificação.",
      ],
    },
  ],
  nomeOndeFazer: "exames laboratoriais",
  mensagemOndeFazer:
    "Venha fazer seus exames laboratoriais no Centro de Caraguatatuba: a coleta é por ordem de chegada, de segunda a sexta, das 7h30 às 18h.",
  // Fase 4 (15/11/2026): o artigo do EAS (exame de urina) aponta para esta
  // pagina — o caminho de volta entra aqui no lugar do guia de exames de
  // sangue, que ja e linkado por /exames/exames-de-sangue.
  blog: [
    "como-escolher-laboratorio-analises-clinicas",
    "resultado-de-exames-online-seguranca",
    "alimentacao-e-exames-laboratoriais",
    "exame-de-urina-eas-como-coletar",
  ],
  relacionados: ["/exames/exames-de-sangue", "/exames/hemograma", "/checkup", "/exames/sexagem-fetal"],
  atualizadoEm: REVISAO_FASE_3,
};

export const PAGINA_CHECKUP: ConteudoPagina = {
  respostaCurta:
    "O check-up preventivo reúne exames laboratoriais, cardiológicos e de imagem para acompanhar a saúde e identificar alterações antes que causem sintomas. Na Total Quality, há três planos — Básico, Select e Premium —, os exames são feitos em um único dia e o agendamento é pelo WhatsApp, com as orientações de preparo enviadas pela equipe.",
  resumo: {
    jejum: "Depende dos exames do plano; a equipe envia o preparo no agendamento",
    duracao: "Todos os exames do plano em um único dia",
    resultado: "Laboratoriais em curto prazo, com acesso online; exames de imagem com laudo geralmente em poucos dias",
    pedidoMedico: "Não é necessário para os pacotes de check-up",
    atendimento: "Com agendamento pelo WhatsApp (12) 3887-3535 ou telefone, de segunda a sexta, das 7h30 às 18h",
  },
  // TODO(alex): convenios no check-up — o dado nao diz se os pacotes sao
  // cobertos pelo Cartao de Todos, Solumedi ou Leader. Linha fora do resumo.
  imagem: {
    slug: "recepcao",
    widths: [480, 768, 1024],
    width: 1024,
    height: 576,
    alt: "Recepção da Total Quality em Caraguatatuba, onde começa o dia do check-up",
  },
  secoes: [
    {
      id: "o-que-e",
      titulo: "O que é um check-up?",
      paragrafos: [
        "É uma avaliação preventiva, feita de forma programada, que reúne exames laboratoriais, cardiológicos e, em alguns casos, de imagem. Diferente de uma consulta motivada por um sintoma, serve para acompanhar indicadores de saúde ao longo do tempo e criar um histórico de referência, que facilita a leitura de exames futuros.",
      ],
    },
    {
      id: "como-funciona",
      titulo: "Como funciona o check-up na Total Quality?",
      paragrafos: [
        "Você entra em contato pelo WhatsApp ou telefone, escolhe a data e recebe as orientações de preparo. No dia agendado, faz todos os exames laboratoriais e de imagem do plano na clínica. A equipe médica analisa os resultados de forma integrada, e você recebe o laudo com as orientações e, se necessário, encaminhamento para um especialista.",
      ],
    },
    {
      id: "quem-deve-fazer",
      titulo: "Quem deve fazer e com que frequência?",
      paragrafos: [
        "Não existe uma lista única de exames nem uma idade única para começar. A composição e a frequência dependem de idade, sexo, histórico familiar, hábitos de vida e sintomas: quem tem fatores de risco costuma precisar de acompanhamento mais frequente. Essa definição deve partir da avaliação de um médico; a equipe da clínica orienta o plano mais adequado ao seu perfil.",
      ],
    },
    {
      id: "preparo",
      titulo: "Precisa de jejum ou preparo?",
      paragrafos: [
        "Varia conforme os exames incluídos. Exames laboratoriais podem exigir jejum; exames de imagem e cardiológicos têm orientações próprias. Siga as instruções enviadas no agendamento — elas consideram o conjunto de exames do seu plano.",
      ],
    },
  ],
  nomeOndeFazer: "check-up",
  mensagemOndeFazer:
    "Agende seu check-up preventivo pelo WhatsApp e faça os exames em uma única visita, no Centro de Caraguatatuba.",
  blog: ["check-up-medico-quais-exames-fazer", "exames-de-sangue-guia-completo", "saude-do-coracao-prevencao"],
  relacionados: ["/exames/exames-de-sangue", "/exames/eletrocardiograma", "/bioimpedancia", "/laboratorio-caraguatatuba"],
  atualizadoEm: REVISAO_FASE_3,
};

export const PAGINA_BIOIMPEDANCIA: ConteudoPagina = {
  respostaCurta:
    "A bioimpedância é um exame rápido e não invasivo que analisa a composição corporal — gordura, massa muscular, água e taxa metabólica — com uma corrente elétrica de baixa intensidade. Serve para acompanhar emagrecimento, treino e plano alimentar. Na Total Quality, o exame é agendado pelo WhatsApp e o resultado sai na hora.",
  resumo: {
    jejum: "4 horas antes do exame",
    preparo: "Sem atividade física nas 12 horas anteriores, sem álcool nas 24 horas anteriores e bem hidratado",
    duracao: "De 5 a 10 minutos",
    resultado: "Na hora, com laudo da composição corporal",
    pedidoMedico: "Não é obrigatório",
    atendimento: "Agendamento pelo WhatsApp (12) 3887-3535, de segunda a sexta, das 7h30 às 18h",
  },
  // TODO(alex): convenios na bioimpedancia — o dado nao diz se o exame e
  // coberto. Linha fora do resumo. Sem foto do aparelho em /images (a pagina
  // usava a foto do laboratorio).
  imagem: {
    slug: "laboratorio",
    widths: [480, 768, 1024, 1440],
    width: 1440,
    height: 1075,
    alt: "Laboratório da Total Quality em Caraguatatuba, onde também é feita a bioimpedância",
  },
  secoes: [
    {
      id: "o-que-e",
      titulo: "O que é a bioimpedância?",
      paragrafos: [
        "A bioimpedância elétrica (BIA) é um método de avaliação da composição corporal que usa uma corrente elétrica de baixa intensidade para medir a resistência dos diferentes tecidos. Como a água conduz eletricidade e os tecidos magros têm mais água que o tecido adiposo, o exame diferencia gordura, músculo, água e massa óssea.",
        "Na Total Quality, o equipamento é multifrequencial e mostra os resultados segmentados por região do corpo: braços, pernas e tronco.",
      ],
    },
    {
      id: "o-que-mostra",
      titulo: "O que o exame mostra?",
      paragrafos: [
        "Diferente do IMC, que relaciona só peso e altura, a bioimpedância separa do que o peso é feito — e por isso permite acompanhar mudanças mesmo quando o número da balança não muda.",
      ],
      lista: [
        "Massa muscular",
        "Percentual de gordura corporal",
        "Água corporal, intra e extracelular",
        "Massa óssea",
        "Taxa metabólica basal (calorias gastas em repouso)",
        "Gordura visceral, ao redor dos órgãos",
      ],
    },
    {
      id: "quem-deve-fazer",
      titulo: "Para quem é indicada?",
      paragrafos: [
        "Pode ser feita por indicação médica, nutricional ou por interesse próprio no acompanhamento da saúde. O laudo é um dado de acompanhamento, não um diagnóstico: ganha sentido quando lido pelo médico ou nutricionista junto ao histórico.",
      ],
      lista: [
        "Atletas e esportistas",
        "Quem está emagrecendo e quer saber se perde gordura ou músculo",
        "Acompanhamento nutricional",
        "Avaliação de saúde metabólica",
      ],
    },
    {
      id: "preparo",
      titulo: "Precisa de jejum ou preparo?",
      paragrafos: [
        "Sim: jejum de 4 horas antes do exame, nenhuma atividade física nas 12 horas anteriores, nada de álcool nas 24 horas anteriores e boa hidratação nas 24 horas que antecedem o exame.",
      ],
    },
    {
      id: "contraindicacao",
      titulo: "Tem contraindicação?",
      paragrafos: [
        "Por usar corrente elétrica, mesmo de baixa intensidade, a bioimpedância não é indicada para quem tem marca-passo, desfibrilador implantável ou outro dispositivo eletrônico interno. Gestantes devem consultar o médico antes. Informe a equipe no agendamento se algum desses casos se aplica a você.",
      ],
    },
  ],
  nomeOndeFazer: "bioimpedância",
  mensagemOndeFazer: "Agende sua bioimpedância pelo WhatsApp e acompanhe sua composição corporal.",
  relacionados: ["/checkup", "/especialidades/endocrinologista", "/exames/exames-de-sangue", "/laboratorio-caraguatatuba"],
  atualizadoEm: REVISAO_FASE_3,
};
