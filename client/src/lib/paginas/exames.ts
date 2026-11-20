/*
 * Conteudo do modelo de pagina (SEO nov/2026, Fase 3) para /exames/:slug.
 *
 * Fonte de cada fato (nada novo foi inventado — briefing de 14/11/2026):
 *   - client/src/lib/examesData.ts (o dado que a pagina ja publicava);
 *   - artigos PUBLICADOS do blog (client/src/content/blog/*.json): hemograma,
 *     alimentacao e exames, ultrassom x Doppler, ultrassom das mamas,
 *     tomografia, raio-X x tomografia, MAPA x Holter, eletrocardiograma, ASO,
 *     exame toxicologico da CNH;
 *   - client/src/lib/bairrosAtendidos.ts (exames de imagem e cardiologicos
 *     com hora marcada).
 * Rascunho do blog NAO e fonte (nao foi revisado).
 *
 * Bloco sem fato verificado fica de fora e ganha um TODO(alex). A pagina nao
 * mostra placeholder.
 *
 * Arquivo PURO (sem React): lido pela pagina e pelo servidor (JSON-LD, sitemap).
 */
import { CONVENIOS_TEXTO } from "@shared/const";
import { REVISAO_FASE_3, type ConteudoPagina } from "../modeloPagina";

const CONVENIOS = `${CONVENIOS_TEXTO}; fora deles, atendimento particular`;
const ORDEM_DE_CHEGADA = "Sem agendamento, por ordem de chegada, de segunda a sexta, das 7h30 às 18h";
const HORA_MARCADA = "Com hora marcada pelo WhatsApp (12) 3887-3535, de segunda a sexta, das 7h30 às 18h";
const PEDIDO = "Traga o pedido médico e um documento com foto";
// Exames de imagem e cardiologicos: artigo publicado
// resultado-de-exames-online-seguranca ("dependem da emissao do laudo pelo
// profissional da especialidade, e o prazo e informado no dia do exame").
const LAUDO = "Laudo emitido pelo médico da especialidade; o prazo é informado no dia do exame";

const FOTO_LABORATORIO = {
  slug: "laboratorio",
  widths: [480, 768, 1024, 1440],
  width: 1440,
  height: 1075,
};

export const PAGINAS_EXAMES: Record<string, ConteudoPagina> = {
  hemograma: {
    // Intencao desta URL: FAZER o exame (preparo, prazo, onde, como). O que
    // cada serie do hemograma mostra e do artigo
    // /blog/hemograma-completo-o-que-avalia — aqui so um resumo e o link.
    respostaCurta:
      "O hemograma completo é o exame de sangue que avalia glóbulos vermelhos, glóbulos brancos e plaquetas em uma única amostra. O hemograma isolado não exige jejum. Na Total Quality, em Caraguatatuba, a coleta é sem agendamento, por ordem de chegada, e o resultado sai em curto prazo, com acesso online.",
    resumo: {
      jejum: "Não é necessário para o hemograma isolado; se o pedido tiver glicemia ou outros exames com jejum, vale o jejum deles",
      preparo: "Evite atividade física intensa logo antes e informe os medicamentos em uso",
      duracao: "A coleta leva poucos minutos",
      resultado: "Em curto prazo, com acesso online",
      pedidoMedico: PEDIDO,
      atendimento: ORDEM_DE_CHEGADA,
      convenios: CONVENIOS,
    },
    imagem: {
      ...FOTO_LABORATORIO,
      alt: "Bancada do laboratório da Total Quality em Caraguatatuba, onde as amostras de sangue são processadas",
    },
    // Ordem (20/11/2026, GSC 21/10–17/11): "hemograma precisa de jejum" (919
    // impressoes, quase todas nesta URL) e "quanto tempo fica pronto" vem
    // primeiro, com a resposta na primeira frase. O que cada serie mostra e
    // o laudo ficam no artigo do blog.
    secoes: [
      {
        id: "jejum-e-preparo",
        titulo: "Hemograma precisa de jejum?",
        paragrafos: [
          "Não: o hemograma isolado não exige jejum. Se o mesmo pedido trouxer glicemia de jejum ou outros exames com preparo próprio, siga a orientação do exame mais exigente e faça tudo na mesma coleta — assim você vem uma vez só.",
          "Evite atividade física intensa imediatamente antes da coleta e informe na recepção os medicamentos que usa, sem suspender nenhum por conta própria: alguns interferem no resultado, e o médico precisa saber deles para ler o laudo.",
        ],
      },
      {
        id: "resultado",
        titulo: "Quando sai o resultado do hemograma?",
        paragrafos: [
          "Em curto prazo: o processamento é automatizado e o laudo é liberado online, sem precisar voltar ao laboratório. Se o pedido tiver outros exames, o prazo de cada um é informado no atendimento.",
        ],
      },
      {
        id: "como-e-feito",
        titulo: "Como é feita a coleta do hemograma?",
        paragrafos: [
          "A coleta é uma punção venosa no braço e leva poucos minutos. A amostra é processada em analisador hematológico automatizado e revisada pela equipe do laboratório; os valores de referência do método vêm impressos no laudo.",
          "Não precisa marcar horário: basta chegar com o pedido médico e um documento com foto, de segunda a sexta, das 7h30 às 18h, e a coleta segue a ordem de chegada. Para quem não pode se deslocar, existe coleta domiciliar, com área, horário e valor confirmados pelo WhatsApp.",
        ],
      },
      {
        id: "o-que-e",
        titulo: "O que é o hemograma completo?",
        paragrafos: [
          "Apesar do nome, o hemograma completo é um exame só, feito com uma única amostra de sangue. O laudo vem organizado em três partes: a série vermelha (eritrograma), a série branca (leucograma) e as plaquetas. Glicemia, colesterol, ferritina ou TSH, que muitas vezes vêm no mesmo pedido, são exames separados, cada um com o seu preparo.",
          "O que cada parte do laudo mostra — hemácias, hemoglobina, hematócrito, índices como VCM e RDW, tipos de leucócitos e contagem de plaquetas — está explicado em detalhe no artigo do blog sobre o que o hemograma avalia. Esta página trata de como fazer o exame na Total Quality.",
        ],
      },
      {
        id: "para-que-serve",
        titulo: "Para que serve o hemograma?",
        paragrafos: [
          "É um exame de triagem: dá uma visão geral das células do sangue e ajuda o médico a investigar anemias, infecções, inflamações e alterações das plaquetas. Também serve de linha de base para comparar exames futuros. Um resultado fora da referência, sozinho, não fecha diagnóstico — quem interpreta é o médico, junto com o seu histórico.",
        ],
        lista: [
          "Check-up de rotina e avaliação geral de saúde",
          "Investigação de cansaço, palidez ou fraqueza",
          "Suspeita de infecções e inflamações",
          "Avaliação pré-operatória e pré-natal",
          "Acompanhamento de doenças crônicas e tratamentos",
          "Sangramentos ou manchas roxas frequentes",
        ],
      },
    ],
    nomeOndeFazer: "hemograma",
    mensagemOndeFazer:
      "Faça seu hemograma sem agendamento: a coleta é por ordem de chegada, de segunda a sexta, das 7h30 às 18h. Dúvidas de preparo e convênio pelo WhatsApp.",
    blog: ["hemograma-completo-o-que-avalia", "siglas-exames-laboratoriais", "exames-de-sangue-guia-completo", "alimentacao-e-exames-laboratoriais"],
    relacionados: ["/exames/exames-de-sangue", "/laboratorio-caraguatatuba", "/checkup", "/exames/sexagem-fetal"],
    atualizadoEm: "2026-11-20",
  },

  "exames-de-sangue": {
    respostaCurta:
      "Exames de sangue são análises feitas a partir de uma amostra colhida da veia do braço, usadas para avaliar órgãos, investigar sintomas, acompanhar tratamentos e fazer check-ups. A Total Quality realiza mais de 3.000 tipos de exames laboratoriais em Caraguatatuba, com coleta sem agendamento, por ordem de chegada, e resultados online.",
    resumo: {
      // O preparo depende do pedido; não impor jejum universal ao perfil lipídico.
      jejum: "Depende dos exames do pedido; quando houver mais de um, vale o preparo mais exigente. Água pode ser tomada normalmente",
      preparo: "Informe os medicamentos e suplementos em uso e evite exercício intenso nas 24 horas anteriores",
      duracao: "A coleta leva poucos minutos",
      resultado: "A maioria em curto prazo, com acesso online; exames específicos podem levar até 7 dias úteis",
      pedidoMedico: PEDIDO,
      atendimento: ORDEM_DE_CHEGADA,
      convenios: CONVENIOS,
    },
    imagem: {
      ...FOTO_LABORATORIO,
      alt: "Laboratório de análises clínicas da Total Quality em Caraguatatuba",
    },
    secoes: [
      {
        id: "o-que-sao",
        titulo: "O que são os exames de sangue?",
        paragrafos: [
          "São análises laboratoriais feitas a partir de uma amostra de sangue coletada por punção venosa. Cada exame do pedido mede uma coisa — células do sangue, glicose, gorduras, enzimas do fígado, função dos rins, hormônios, vitaminas, sorologias —, e o médico escolhe quais pedir conforme o seu caso.",
          "Na Total Quality, as amostras são processadas em equipamentos automatizados, e o laudo traz os valores de referência do método usado. Esses valores variam entre laboratórios: compare sempre com o que está impresso no seu laudo.",
        ],
      },
      {
        id: "para-que-servem",
        titulo: "Para que servem?",
        paragrafos: [
          "Servem para avaliar o funcionamento dos órgãos, ajudar a detectar doenças, monitorar tratamentos e acompanhar a saúde ao longo do tempo. A interpretação de qualquer resultado é do médico, que considera os sintomas e o histórico.",
        ],
        lista: [
          "Check-up preventivo",
          "Acompanhamento de diabetes, colesterol e tireoide",
          "Investigação de fadiga, tontura ou perda de peso",
          "Monitoramento de medicamentos",
          "Avaliação pré-operatória",
          "Pré-natal",
          "Detecção de infecções e doenças autoimunes",
        ],
      },
      {
        id: "jejum-e-preparo",
        titulo: "Precisa de jejum ou preparo?",
        paragrafos: [
          "Nem todo exame de sangue pede jejum: o hemograma, por exemplo, em geral não exige, e nos hormônios o preparo depende do exame e do pedido. A glicemia de jejum pede, em geral, 8 horas. Quando o pedido reúne vários exames, vale o preparo mais exigente — se houver glicemia de jejum, venha em jejum.",
          "Durante o jejum, água pode ser tomada normalmente; café, chá, sucos, refrigerante, bala e chiclete quebram o jejum. Ficar muito além do tempo indicado também atrapalha. Na véspera, prefira uma refeição leve no horário de costume e mantenha a alimentação habitual: dieta de última hora não mostra o seu padrão real.",
          "O álcool altera triglicerídeos e enzimas do fígado por alguns dias, e a orientação usual é evitá-lo nos três dias anteriores. Biotina, vitamina C em dose alta, vitamina D e ferro podem interferir em alguns exames: informe tudo o que usa, sem suspender nada por conta própria.",
        ],
      },
      {
        id: "resultado",
        titulo: "Quando sai o resultado?",
        paragrafos: [
          "A maioria dos exames de sangue tem resultado em curto prazo, disponível online. Alguns exames específicos podem levar até 7 dias úteis; o prazo de cada um é informado no atendimento.",
        ],
      },
      {
        id: "como-e-feita",
        titulo: "Como é feita a coleta?",
        paragrafos: [
          "A coleta é feita por profissionais treinados, sem agendamento: a ordem é a de chegada, de segunda a sexta, das 7h30 às 18h. Traga o pedido médico e um documento com foto. Se algum exame do pedido tiver horário específico de coleta, como certas dosagens hormonais feitas pela manhã, a equipe avisa. Também há coleta domiciliar, com área, horário e valor confirmados pelo WhatsApp.",
        ],
      },
    ],
    nomeOndeFazer: "exames de sangue",
    mensagemOndeFazer:
      "Faça seus exames de sangue sem agendamento: a coleta é por ordem de chegada, de segunda a sexta, das 7h30 às 18h. Dúvidas de preparo e convênio pelo WhatsApp.",
    blog: ["exames-de-sangue-guia-completo", "siglas-exames-laboratoriais", "alimentacao-e-exames-laboratoriais", "exame-de-urina-eas-como-coletar"],
    relacionados: ["/exames/hemograma", "/laboratorio-caraguatatuba", "/checkup", "/especialidades/endocrinologista"],
    atualizadoEm: REVISAO_FASE_3,
  },

  ultrassonografia: {
    respostaCurta:
      "A ultrassonografia, ou ultrassom, é um exame de imagem que usa ondas sonoras, sem radiação, para mostrar órgãos e estruturas do corpo em tempo real. Serve para avaliar abdome, pelve, tireoide, mamas, gestação e vasos, com o Doppler. Na Total Quality, o ultrassom é feito com hora marcada pelo WhatsApp.",
    resumo: {
      jejum: "Depende do tipo: o abdome total pede jejum de 6 a 8 horas; tireoide e mamas não pedem",
      preparo: "Varia conforme a região; a equipe envia as orientações no agendamento",
      duracao: "Em média, de 20 a 30 minutos",
      resultado: LAUDO,
      pedidoMedico: "Traga o pedido médico e exames anteriores da mesma região",
      atendimento: HORA_MARCADA,
      convenios: CONVENIOS,
    },
    imagem: {
      slug: "cardiologia",
      widths: [480, 768, 1024, 1440],
      width: 1440,
      height: 1075,
      alt: "Exame de ultrassom com Doppler colorido na Total Quality em Caraguatatuba",
    },
    secoes: [
      {
        id: "o-que-e",
        titulo: "O que é a ultrassonografia (ultrassom)?",
        paragrafos: [
          "Ultrassonografia, ultrassom e ecografia são nomes do mesmo exame. Um transdutor movimentado sobre a pele com gel emite ondas sonoras de alta frequência e capta os ecos dos tecidos; o computador transforma esses ecos em imagens que o médico acompanha em tempo real, no monitor.",
          "O método é indolor, não invasivo e não usa radiação ionizante — por isso é também o exame de imagem usado no acompanhamento da gravidez.",
        ],
      },
      {
        id: "para-que-serve",
        titulo: "Para que serve o ultrassom?",
        paragrafos: [
          "Serve para examinar órgãos e estruturas de várias regiões do corpo. A região e o protocolo vêm definidos no pedido médico.",
        ],
        lista: [
          "Órgãos do abdome: fígado, vesícula, rins e pâncreas",
          "Acompanhamento da gravidez (ultrassom obstétrico)",
          "Tireoide e nódulos",
          "Investigação de dores pélvicas",
          "Mamas",
          "Próstata",
          "Vasos sanguíneos, com Doppler",
        ],
      },
      {
        id: "como-e-feito",
        titulo: "Como é feito o exame de ultrassom?",
        paragrafos: [
          "Na maior parte dos exames, você fica deitado enquanto o médico movimenta o transdutor sobre a pele. Pode ser preciso mudar de posição ou prender a respiração por alguns segundos para algumas imagens. Sente-se apenas a pressão leve do transdutor; avise se houver desconforto.",
          "No ultrassom com Doppler, o equipamento também mostra a direção e a velocidade do sangue nos vasos, com cores sobre a imagem e sons parecidos com pulsações. As cores, sozinhas, não indicam problema: são a forma de o aparelho apresentar o fluxo.",
        ],
      },
      {
        id: "jejum-e-preparo",
        titulo: "Ultrassom precisa de jejum ou preparo?",
        paragrafos: [
          "Depende da região. O ultrassom de abdome total pede jejum de 6 a 8 horas e bexiga cheia; nas 24 horas anteriores, evite alimentos que formam gases, como feijão, refrigerante e leite, porque os gases atrapalham a visualização. O pélvico pede bexiga cheia (beber 4 copos de água 1 hora antes). Tireoide e mamas não exigem preparo especial.",
          "Não faça jejum nem tome grandes quantidades de água sem a orientação do seu exame: confira o nome completo do exame no pedido e confirme o preparo pelo WhatsApp no agendamento. Leve exames anteriores da mesma região para comparação.",
        ],
      },
      {
        id: "duracao",
        titulo: "Quanto tempo demora o ultrassom?",
        paragrafos: [
          "Em média, de 20 a 30 minutos, conforme a região examinada, a quantidade de estruturas avaliadas e o protocolo.",
        ],
      },
    ],
    subtipos: {
      id: "tipos",
      titulo: "Quais tipos de ultrassom a Total Quality faz?",
      intro: "Os tipos abaixo são os que a clínica realiza. Confira no pedido médico qual foi indicado.",
      itens: [
        { nome: "Ultrassom de abdome total", preparo: "jejum de 6 a 8 horas e bexiga cheia" },
        { nome: "Ultrassom pélvico", preparo: "bexiga cheia: beber 4 copos de água 1 hora antes" },
        { nome: "Ultrassom obstétrico" },
        { nome: "Ultrassom de tireoide", preparo: "sem preparo especial" },
        { nome: "Ultrassom das mamas", preparo: "sem preparo especial" },
        { nome: "Ultrassom de próstata" },
        { nome: "Ultrassom com Doppler", preparo: "varia conforme a região estudada" },
      ],
    },
    nomeOndeFazer: "ultrassom",
    mensagemOndeFazer:
      "Agende seu ultrassom pelo WhatsApp ou telefone: a equipe confirma o preparo do seu tipo de exame e faz, no mesmo endereço, os exames laboratoriais e de imagem do pedido.",
    blog: ["diferenca-ultrassom-comum-doppler", "mamografia-ultrassom-mamas-diferencas"],
    relacionados: ["/exames/tomografia-computadorizada", "/exames/raio-x", "/especialidades/gastroenterologista", "/exames/sexagem-fetal"],
    atualizadoEm: REVISAO_FASE_3,
  },

  "tomografia-computadorizada": {
    respostaCurta:
      "A tomografia computadorizada é um exame de imagem que usa raios-X e processamento por computador para produzir cortes detalhados de ossos, órgãos, vasos e tecidos. O médico a pede para regiões como crânio, tórax, abdome e coluna. Na Total Quality, o exame é feito com hora marcada pelo WhatsApp, em tomógrafo multislice.",
    resumo: {
      jejum: "Jejum de 4 horas para exames com contraste; sem contraste, a equipe informa se há preparo",
      preparo: "Informe alergias (especialmente a iodo ou contraste), problemas nos rins, medicamentos e gravidez",
      duracao: "Entre 10 e 30 minutos, conforme a região e o uso de contraste",
      resultado: LAUDO,
      pedidoMedico: "Traga o pedido médico, documento com foto e exames anteriores",
      atendimento: HORA_MARCADA,
      convenios: CONVENIOS,
    },
    imagem: {
      slug: "tomografia",
      widths: [480, 768, 1024, 1440],
      width: 1440,
      height: 960,
      alt: "Tomógrafo da Total Quality Medicina Diagnóstica em Caraguatatuba",
    },
    secoes: [
      {
        id: "o-que-e",
        titulo: "O que é a tomografia computadorizada?",
        paragrafos: [
          "É um exame de diagnóstico por imagem que usa raios-X para produzir imagens do corpo em cortes transversais. Diferente da radiografia comum, que gera uma imagem plana, o tomógrafo reúne imagens de vários ângulos e o computador as transforma em cortes — que podem ser reconstruídos em diferentes planos e até em três dimensões.",
        ],
      },
      {
        id: "para-que-serve",
        titulo: "Para que serve?",
        paragrafos: [
          "Permite ver ossos, órgãos internos, vasos sanguíneos e tecidos moles com mais detalhe que o raio-X. A escolha do exame, da região e do uso de contraste é do médico que pede.",
        ],
        lista: [
          "Investigação de dores de cabeça persistentes",
          "Avaliação de traumas e fraturas",
          "Doenças pulmonares",
          "Dores abdominais",
          "Coluna vertebral",
          "Estadiamento de tumores",
          "Planejamento cirúrgico",
        ],
      },
      {
        id: "como-e-feito",
        titulo: "Como é feito o exame?",
        paragrafos: [
          "Você se deita em uma mesa que desliza para dentro do aparelho, em formato de anel. O tubo de raios-X gira ao redor da região examinada, sem nenhum contato com o corpo. Durante a aquisição é preciso ficar imóvel; em exames de tórax ou abdome, a equipe pode pedir que você prenda a respiração por alguns instantes.",
          "O exame é indolor. Quando há contraste na veia, é comum sentir um calor passageiro.",
        ],
      },
      {
        id: "contraste-e-preparo",
        titulo: "Precisa de jejum, preparo ou contraste?",
        paragrafos: [
          "Nem toda tomografia usa contraste: depende da região e do que o médico precisa ver. Quando há contraste, ele pode ser dado na veia (EV) ou bebido (VO), conforme o pedido, e o exame pede jejum de 4 horas. Muitas tomografias sem contraste não pedem preparo especial; a orientação certa vem no agendamento.",
          "Antes de um exame com contraste, a equipe pergunta sobre alergias anteriores, função dos rins, medicamentos e gestação; em alguns protocolos, pode pedir exame de sangue recente. Nunca suspenda medicamentos nem faça preparo por conta própria. Leve exames anteriores para comparação.",
        ],
      },
      {
        id: "contraindicacao",
        titulo: "Tem contraindicação?",
        paragrafos: [
          "Quem tem problema nos rins deve avisar antes: o contraste é eliminado pelos rins, e o médico avalia se o exame com contraste é adequado. Alergia a iodo ou a contraste também precisa ser informada.",
          "Na gestação, a tomografia costuma ser evitada, salvo quando o médico avalia que o benefício supera o risco — informe a gravidez ou a suspeita de gravidez. Próteses metálicas, marcapassos e implantes não impedem o exame.",
        ],
      },
    ],
    subtipos: {
      id: "tipos",
      titulo: "Quais regiões a tomografia avalia?",
      itens: [
        { nome: "Tomografia de crânio" },
        { nome: "Tomografia de tórax" },
        { nome: "Tomografia de abdome" },
        { nome: "Tomografia de coluna" },
      ],
    },
    // TODO(alex): o artigo do blog cita a angiotomografia como modalidade de
    // tomografia, mas nao diz se a Total Quality a realiza. Ficou fora da lista.
    nomeOndeFazer: "tomografia",
    mensagemOndeFazer:
      "Agende sua tomografia pelo WhatsApp ou telefone: a equipe confirma se o exame terá contraste e envia o preparo da região pedida.",
    blog: ["tomografia-computadorizada-como-funciona", "diferenca-raio-x-tomografia"],
    relacionados: ["/exames/raio-x", "/exames/ultrassonografia", "/exames/exames-de-sangue", "/checkup"],
    atualizadoEm: REVISAO_FASE_3,
  },

  "raio-x": {
    respostaCurta:
      "O raio-X, ou radiografia, é um exame de imagem que usa radiação em dose baixa para mostrar ossos, pulmões e outras estruturas. O médico o pede para investigar fraturas, doenças pulmonares, dores na coluna e sinusite, entre outras situações. Na Total Quality, o raio-X digital é feito com hora marcada pelo WhatsApp.",
    resumo: {
      jejum: "Não é necessário",
      preparo: "Na maioria dos casos, nenhum preparo especial; retire objetos metálicos da região",
      duracao: "Alguns minutos; cada incidência leva poucos segundos",
      resultado: LAUDO,
      pedidoMedico: PEDIDO,
      atendimento: HORA_MARCADA,
      convenios: CONVENIOS,
    },
    // TODO(alex): nao ha foto da sala de raio-X em /images. A pagina usa so a
    // foto da fachada (bloco "Onde fazer"). Mande uma foto real do aparelho.
    secoes: [
      {
        id: "o-que-e",
        titulo: "O que é o raio-X?",
        paragrafos: [
          "A radiografia usa radiação ionizante em dose baixa: ela atravessa o corpo e é registrada por um detector. Ossos, ar, órgãos e tecidos absorvem os raios de maneiras diferentes, e é isso que forma a imagem. No raio-X digital, a imagem é gerada na hora, no computador.",
        ],
      },
      {
        id: "para-que-serve",
        titulo: "Para que serve?",
        paragrafos: [
          "É usado como avaliação inicial em muitas situações, sobretudo de ossos, articulações e tórax. Quando o médico precisa de mais detalhe, pode pedir uma tomografia; a escolha depende da pergunta clínica.",
        ],
        lista: [
          "Suspeita de fraturas e lesões ósseas",
          "Doenças pulmonares, como pneumonia e derrame pleural",
          "Dores na coluna",
          "Sinusite e seios da face",
          "Raio-X de tórax pré-operatório",
          "Acompanhamento ortopédico",
          "Dores articulares",
        ],
      },
      {
        id: "como-e-feito",
        titulo: "Como é feito o exame?",
        paragrafos: [
          "Você fica entre o emissor de raios-X e o detector — em pé, sentado ou deitado, conforme a região. O técnico orienta o posicionamento e pode pedir que você prenda a respiração por alguns segundos. A captura de cada imagem leva poucos segundos e não dói; o posicionamento pode incomodar quando já existe uma lesão.",
        ],
      },
      {
        id: "preparo",
        titulo: "Precisa de jejum ou preparo?",
        paragrafos: [
          "Na maioria dos casos, não há preparo especial nem jejum. Retire joias, piercings e outros objetos metálicos da região a ser examinada e leve o pedido médico, um documento com foto e exames anteriores, quando tiver.",
        ],
      },
      {
        id: "contraindicacao",
        titulo: "Tem contraindicação?",
        paragrafos: [
          "Na gravidez, o raio-X deve ser evitado, especialmente no primeiro trimestre; quando necessário, é feito com proteção abdominal e sob orientação médica. Informe sempre a gravidez ou a suspeita de gravidez antes do exame.",
        ],
      },
    ],
    subtipos: {
      id: "tipos",
      titulo: "Quais tipos de raio-X são feitos?",
      intro: "Para nenhum deles há preparo especial: retire os objetos metálicos da região.",
      itens: [
        { nome: "Raio-X de tórax" },
        { nome: "Raio-X de coluna" },
        { nome: "Raio-X de membros" },
        { nome: "Raio-X dos seios da face" },
      ],
    },
    nomeOndeFazer: "raio-X",
    mensagemOndeFazer:
      "Agende seu raio-X pelo WhatsApp ou telefone e faça, no mesmo endereço, os outros exames de imagem e de laboratório do pedido.",
    blog: ["diferenca-raio-x-tomografia", "tomografia-computadorizada-como-funciona"],
    relacionados: ["/exames/tomografia-computadorizada", "/exames/ultrassonografia", "/exames/exame-admissional", "/checkup"],
    atualizadoEm: REVISAO_FASE_3,
  },

  mapa: {
    respostaCurta:
      "O MAPA (Monitorização Ambulatorial da Pressão Arterial) registra a pressão automaticamente durante 24 horas, enquanto você mantém a rotina e dorme. Serve para investigar hipertensão, avaliar o tratamento e casos em que a pressão do consultório não reflete o dia a dia. Na Total Quality, o MAPA é instalado com hora marcada.",
    resumo: {
      jejum: "Não é necessário",
      preparo: "Roupa de manga larga; sem exercício físico durante o exame",
      duracao: "24 horas com o aparelho; depois, retorno para retirá-lo",
      resultado: LAUDO,
      pedidoMedico: PEDIDO,
      atendimento: HORA_MARCADA,
      convenios: CONVENIOS,
    },
    // TODO(alex): nao ha foto do aparelho de MAPA em /images.
    secoes: [
      {
        id: "o-que-e",
        titulo: "O que é o MAPA?",
        paragrafos: [
          "É um aparelho portátil com manguito, instalado no braço, que mede a pressão sozinho: a cada 15 a 20 minutos durante o dia e a cada 30 minutos à noite, ao longo de 24 horas. Ao contrário da medida feita uma vez no consultório, mostra como a pressão se comporta nas condições reais do seu dia.",
        ],
      },
      {
        id: "para-que-serve",
        titulo: "Para que serve?",
        paragrafos: [
          "O MAPA olha só para a pressão arterial. Se a dúvida do médico é o ritmo do coração, o exame é outro, o Holter — e um não substitui o outro.",
        ],
        lista: [
          "Diagnóstico de hipertensão arterial",
          "Pressão alta só no consultório (jaleco branco)",
          "Pressão normal no consultório e alta fora dele (hipertensão mascarada)",
          "Avaliação de remédios para pressão",
          "Hipertensão resistente ao tratamento",
          "Pressão durante o sono",
          "Gestantes com pré-eclâmpsia",
        ],
      },
      {
        id: "como-e-feito",
        titulo: "Como é feito o exame?",
        paragrafos: [
          "Na instalação, o manguito é colocado no braço e ligado ao aparelho. Você volta para casa e segue a rotina, inclusive trabalho e sono, anotando num diário os horários de sono, refeições, remédios e sintomas. Durante as medições, mantenha o braço relaxado. Depois de 24 horas, você retorna para retirar o aparelho, e os dados são analisados por software.",
          "O manguito infla sozinho, o que pode causar leve desconforto, mas a maioria das pessoas se adapta — inclusive para dormir, já que as medidas noturnas fazem parte da avaliação.",
        ],
      },
      {
        id: "preparo",
        titulo: "Precisa de jejum ou preparo?",
        paragrafos: [
          "Não precisa de jejum. Use roupa confortável, de manga larga. A diretriz brasileira orienta não fazer exercício físico durante o MAPA. O aparelho não pode ser molhado: não tome banho de chuveiro nas 24 horas — dá para fazer higiene parcial sem molhar o equipamento — e evite movimentos bruscos que desloquem o manguito.",
        ],
      },
      {
        id: "duracao",
        titulo: "Quanto tempo demora?",
        paragrafos: [
          "O registro dura 24 horas. A instalação é feita na clínica, com hora marcada, e você volta depois de 24 horas para retirar o aparelho.",
        ],
      },
    ],
    nomeOndeFazer: "MAPA",
    mensagemOndeFazer:
      "Agende o MAPA pelo WhatsApp ou telefone: a equipe marca a instalação e a retirada do aparelho e explica o diário de atividades.",
    blog: ["mapa-ou-holter-diferenca", "saude-do-coracao-prevencao"],
    relacionados: ["/exames/holter", "/exames/eletrocardiograma", "/especialidades/cardiologista", "/checkup"],
    atualizadoEm: REVISAO_FASE_3,
  },

  holter: {
    respostaCurta:
      "O Holter 24h registra continuamente a atividade elétrica do coração por um gravador portátil, durante a rotina e o sono. Serve para investigar palpitações, tonturas e desmaios e para acompanhar arritmias, captando alterações que podem não aparecer num eletrocardiograma comum. Na Total Quality, o Holter é instalado com hora marcada.",
    resumo: {
      jejum: "Não é necessário",
      preparo: "Tome banho antes da instalação e não passe creme ou óleo no tórax",
      duracao: "24 horas com o aparelho; depois, retorno para retirá-lo",
      resultado: LAUDO,
      pedidoMedico: PEDIDO,
      atendimento: HORA_MARCADA,
      convenios: CONVENIOS,
    },
    // TODO(alex): nao ha foto do Holter em /images.
    secoes: [
      {
        id: "o-que-e",
        titulo: "O que é o Holter?",
        paragrafos: [
          "É uma monitorização eletrocardiográfica contínua: eletrodos adesivos no tórax ficam ligados a um pequeno gravador digital, que registra todos os batimentos por 24 horas. Por gravar o dia inteiro, pode captar arritmias e outras alterações do ritmo que aparecem e somem — e que um eletrocardiograma de poucos minutos não pegaria.",
        ],
      },
      {
        id: "para-que-serve",
        titulo: "Para que serve?",
        paragrafos: [
          "O Holter responde a perguntas sobre o ritmo do coração. Dúvidas sobre a pressão arterial são do MAPA; em alguns casos, o médico pede os dois.",
        ],
        lista: [
          "Palpitações ou batimentos irregulares",
          "Tonturas e desmaios (síncope)",
          "Dor no peito a esclarecer",
          "Arritmias já diagnosticadas",
          "Controle de marcapasso",
          "Avaliação após infarto",
          "Acompanhamento de remédios antiarrítmicos",
        ],
      },
      {
        id: "como-e-feito",
        titulo: "Como é feito o exame?",
        paragrafos: [
          "Na instalação, os eletrodos são colados no tórax e ligados ao gravador. Você mantém as atividades normais — exercícios leves inclusive — e anota num diário os horários de sono, atividade física, refeições, remédios e, principalmente, qualquer sintoma, como palpitação, tontura, dor no peito ou falta de ar. Depois de 24 horas, o aparelho é retirado e os dados são analisados.",
          "O gravador é pequeno e leve. Os eletrodos podem dar uma leve coceira na pele.",
        ],
      },
      {
        id: "preparo",
        titulo: "Precisa de jejum ou preparo?",
        paragrafos: [
          "Não precisa de jejum. Tome banho antes da instalação, porque durante o exame o aparelho e os eletrodos não podem ser molhados, e não passe creme ou óleo no tórax, que atrapalham a fixação. Use roupa confortável, evite atividades que molhem ou desloquem os eletrodos e fique longe de ímãs e detectores de metal.",
        ],
      },
      {
        id: "duracao",
        titulo: "Quanto tempo demora?",
        paragrafos: [
          "O registro dura 24 horas, ou o período que o médico indicar. A instalação e a retirada são feitas na clínica.",
        ],
      },
    ],
    nomeOndeFazer: "Holter",
    mensagemOndeFazer:
      "Agende o Holter pelo WhatsApp ou telefone: a equipe marca a instalação e a retirada e explica o diário de sintomas.",
    blog: ["mapa-ou-holter-diferenca", "eletrocardiograma-o-que-e-como-e-feito", "saude-do-coracao-prevencao"],
    relacionados: ["/exames/mapa", "/exames/eletrocardiograma", "/especialidades/cardiologista", "/checkup"],
    atualizadoEm: REVISAO_FASE_3,
  },

  eletrocardiograma: {
    respostaCurta:
      "O eletrocardiograma (ECG) registra a atividade elétrica do coração por eletrodos colados na pele. Serve para avaliar o ritmo, a frequência e a condução elétrica dos batimentos em consultas de rotina, check-ups e antes de procedimentos. É rápido, indolor e não exige jejum. Na Total Quality, o ECG é feito com hora marcada.",
    resumo: {
      jejum: "Não é necessário",
      preparo: "Não passe creme ou óleo no tórax e use roupa fácil de tirar",
      duracao: "De 5 a 10 minutos; o exame todo costuma ficar abaixo de 15 minutos",
      resultado: LAUDO,
      pedidoMedico: "Traga o pedido médico, documento com foto e ECGs anteriores",
      atendimento: HORA_MARCADA,
      convenios: CONVENIOS,
    },
    // TODO(alex): a foto "cardiologia-*.webp" e de ULTRASSOM com Doppler, nao
    // de ECG (docs/creditos-imagens-blog.md). Sem foto do eletrocardiografo.
    secoes: [
      {
        id: "o-que-e",
        titulo: "O que é o eletrocardiograma?",
        paragrafos: [
          "ECG é a sigla de eletrocardiograma; em alguns pedidos aparece como ECG de repouso ou EKG — é o mesmo exame. Eletrodos no tórax, nos braços e nas pernas captam os sinais elétricos que o próprio coração produz, e o aparelho os transforma num traçado. Os eletrodos só registram: não enviam corrente nenhuma ao corpo.",
        ],
      },
      {
        id: "para-que-serve",
        titulo: "Para que serve?",
        paragrafos: [
          "Mostra o que acontece com o coração no momento do exame. Como o registro é pontual, alterações intermitentes podem não aparecer; nesses casos, o médico pode pedir o Holter. Um traçado normal não descarta, sozinho, um problema, e um alterado não fecha diagnóstico.",
        ],
        lista: [
          "Dor ou desconforto no peito",
          "Palpitações e arritmias",
          "Falta de ar",
          "Avaliação pré-operatória",
          "Check-up cardiológico",
          "Acompanhamento de hipertensão",
          "Avaliação para prática esportiva",
        ],
      },
      {
        id: "como-e-feito",
        titulo: "Como é feito o exame?",
        paragrafos: [
          "Você deixa o tórax descoberto e se deita na maca. A pele é limpa nos pontos de contato — em algumas pessoas é preciso aparar os pelos em pequenas áreas — e os eletrodos adesivos são ligados ao aparelho por cabos. Durante o registro, fique parado, relaxado, respirando normalmente. Ao final, os eletrodos são retirados e você volta às atividades.",
        ],
      },
      {
        id: "preparo",
        titulo: "Precisa de jejum ou preparo?",
        paragrafos: [
          "Não precisa de jejum. Evite creme, óleo ou hidratante no tórax no dia do exame, use blusa de botão ou camiseta fácil de tirar e chegue 10 minutos antes para relaxar. Não suspenda remédios por conta própria. Se o mesmo pedido tiver exames de sangue, siga o jejum deles — a coleta laboratorial é sem agendamento, no mesmo endereço.",
        ],
      },
      {
        id: "duracao",
        titulo: "Quanto tempo demora?",
        paragrafos: [
          "O registro do traçado leva poucos minutos; somando o posicionamento dos eletrodos, o exame fica entre 5 e 10 minutos e, em geral, abaixo de 15. O tempo na clínica pode variar com o movimento da recepção.",
        ],
      },
    ],
    nomeOndeFazer: "eletrocardiograma",
    mensagemOndeFazer:
      "Agende seu eletrocardiograma pelo WhatsApp ou telefone. Se o pedido tiver exames de sangue, a coleta é por ordem de chegada, no mesmo endereço.",
    blog: ["eletrocardiograma-o-que-e-como-e-feito", "mapa-ou-holter-diferenca", "saude-do-coracao-prevencao"],
    relacionados: ["/exames/holter", "/exames/mapa", "/especialidades/cardiologista", "/exames/exame-admissional"],
    atualizadoEm: REVISAO_FASE_3,
  },

  eletroencefalograma: {
    respostaCurta:
      "O eletroencefalograma (EEG) registra a atividade elétrica do cérebro por eletrodos colocados no couro cabeludo. Ajuda o médico a investigar epilepsia, convulsões, perda de consciência e distúrbios do sono. É indolor e não emite corrente. Na Total Quality, o EEG é agendado pelo WhatsApp, com orientações de preparo enviadas pela equipe.",
    resumo: {
      preparo: "Lave os cabelos na véspera sem condicionador ou gel e durma menos que o habitual na noite anterior",
      duracao: "De 20 a 40 minutos",
      resultado: LAUDO,
      pedidoMedico: "Traga o pedido médico, exames anteriores e a lista de remédios em uso",
      atendimento: "Agendamento pelo WhatsApp (12) 3887-3535, de segunda a sexta, das 7h30 às 18h",
      convenios: CONVENIOS,
    },
    // TODO(alex): o dado nao diz se o EEG exige jejum — a linha "Jejum" ficou
    // fora do resumo. Sem foto do aparelho de EEG em /images.
    secoes: [
      {
        id: "o-que-e",
        titulo: "O que é o eletroencefalograma?",
        paragrafos: [
          "É um exame neurofisiológico: eletrodos posicionados no couro cabeludo com pasta condutora captam a atividade elétrica do cérebro e geram um traçado com os padrões das ondas cerebrais. Os eletrodos só registram sinais — não aplicam corrente.",
        ],
      },
      {
        id: "para-que-serve",
        titulo: "Para que serve?",
        paragrafos: ["O traçado ajuda o médico a identificar alterações ligadas a várias condições neurológicas."],
        lista: [
          "Diagnóstico e acompanhamento de epilepsia",
          "Investigação de convulsões",
          "Perda de consciência",
          "Distúrbios do sono",
          "Encefalopatias",
          "Alterações comportamentais",
          "Avaliação pré-cirúrgica de epilepsia",
        ],
      },
      {
        id: "como-e-feito",
        titulo: "Como é feito o exame?",
        paragrafos: [
          "Você fica deitado ou sentado, confortável, enquanto o aparelho registra. Durante o exame, podem ser feitas estimulações, como a hiperventilação e a fotoestimulação, que provocam respostas cerebrais específicas.",
        ],
      },
      {
        id: "preparo",
        titulo: "Precisa de preparo?",
        paragrafos: [
          "Sim. Lave os cabelos na véspera sem condicionador, gel ou creme: esses produtos formam uma camada que dificulta a captação dos sinais. Durma menos que o habitual na noite anterior — a privação parcial de sono facilita o aparecimento de alterações que ajudam no diagnóstico, especialmente na epilepsia. Não suspenda remédios sem orientação médica e leve a lista do que usa.",
        ],
      },
      {
        id: "duracao",
        titulo: "Quanto tempo demora?",
        paragrafos: [
          "O exame dura entre 20 e 40 minutos. Em alguns casos, o médico pede um EEG prolongado, de várias horas.",
        ],
      },
    ],
    nomeOndeFazer: "eletroencefalograma",
    mensagemOndeFazer:
      "Agende seu eletroencefalograma pelo WhatsApp ou telefone: a equipe envia as orientações de cabelo e de sono para a véspera.",
    relacionados: ["/exames/eletrocardiograma", "/exames/holter", "/exames/espirometria", "/checkup"],
    atualizadoEm: REVISAO_FASE_3,
  },

  espirometria: {
    respostaCurta:
      "A espirometria, ou prova de função pulmonar, mede quanto ar entra e sai dos pulmões e com que velocidade. Ajuda o médico no diagnóstico e no acompanhamento de asma, DPOC e outras doenças respiratórias. Você sopra com força num bocal, sem dor. Na Total Quality, a espirometria é agendada pelo WhatsApp.",
    resumo: {
      preparo: "Não fume nas 4 horas anteriores, evite refeição pesada 2 horas antes e use roupa que não aperte o tórax",
      duracao: "De 15 a 30 minutos",
      resultado: LAUDO,
      pedidoMedico: "Traga o pedido médico e pergunte ao seu médico sobre os broncodilatadores",
      atendimento: "Agendamento pelo WhatsApp (12) 3887-3535, de segunda a sexta, das 7h30 às 18h",
      convenios: CONVENIOS,
    },
    // TODO(alex): o dado nao diz se ha jejum (so "evitar refeicoes pesadas 2 h
    // antes"): a linha "Jejum" ficou fora. O artigo espirometria-preparo ainda
    // e rascunho (nao entra como fonte nem como link). Sem foto do espirometro.
    secoes: [
      {
        id: "o-que-e",
        titulo: "O que é a espirometria?",
        paragrafos: [
          "É o exame que mede o volume e o fluxo de ar dos pulmões. Avalia a capacidade pulmonar e mostra se há obstrução ou restrição nas vias aéreas. Pode incluir um teste com broncodilatador, para ver se a obstrução melhora com o remédio.",
        ],
      },
      {
        id: "para-que-serve",
        titulo: "Para que serve?",
        paragrafos: ["É pedida no diagnóstico e no acompanhamento de doenças respiratórias e em avaliações ocupacionais."],
        lista: [
          "Diagnóstico de asma",
          "Diagnóstico e acompanhamento de DPOC",
          "Falta de ar (dispneia)",
          "Pré-operatório de cirurgias torácicas",
          "Doenças pulmonares ocupacionais",
          "Avaliação de fumantes",
          "Acompanhamento de tratamento respiratório",
        ],
      },
      {
        id: "como-e-feito",
        titulo: "Como é feito o exame?",
        paragrafos: [
          "Você sopra com força máxima num bocal ligado ao espirômetro, que mede o volume de ar expirado e a velocidade do fluxo. As manobras são repetidas algumas vezes para o resultado ser confiável. O exame não dói, mas exige esforço respiratório e pode dar uma leve tontura passageira.",
        ],
      },
      {
        id: "preparo",
        titulo: "Precisa de preparo?",
        paragrafos: [
          "Não fume por pelo menos 4 horas antes, evite refeições pesadas nas 2 horas anteriores e use roupa que não aperte o tórax. Pergunte ao seu médico se deve suspender broncodilatadores antes do teste — depende do objetivo do exame. Nunca suspenda remédios por conta própria.",
        ],
      },
      {
        id: "quem-pode-fazer",
        titulo: "Quem pode fazer?",
        paragrafos: [
          "Adultos e crianças, em geral a partir dos 6 anos, quando a criança já consegue colaborar com as manobras respiratórias.",
        ],
      },
    ],
    nomeOndeFazer: "espirometria",
    mensagemOndeFazer:
      "Agende sua espirometria pelo WhatsApp ou telefone. Para empresas, ela também entra nos exames complementares do PCMSO.",
    relacionados: ["/exames/exame-admissional", "/especialidades/medicina-do-trabalho", "/exames/raio-x", "/checkup"],
    atualizadoEm: REVISAO_FASE_3,
  },

  "exame-toxicologico": {
    respostaCurta:
      "O exame toxicológico detecta o uso de substâncias psicoativas em amostra de cabelo ou pelo. É exigido do motorista das categorias C, D e E na obtenção e na renovação da CNH e pode ser pedido em admissionais e demissionais. Na Total Quality, a janela de detecção é de 180 dias e o resultado sai em 5 dias úteis.",
    resumo: {
      jejum: "Não é necessário",
      preparo: "Cabelo ou pelo com pelo menos 3 cm; não raspe antes da coleta e informe os remédios em uso",
      duracao: "Coleta rápida, sem agulhas",
      resultado: "Em 5 dias úteis",
      atendimento: "De segunda a sexta, das 7h30 às 18h; confirme horário e documentos pelo WhatsApp (12) 3887-3535",
      convenios: CONVENIOS,
    },
    // TODO(alex): o dado pede documento com foto, mas nao diz se o exame exige
    // pedido medico — a linha "Pedido medico" ficou fora do resumo. Sem foto
    // da coleta em /images.
    secoes: [
      {
        id: "o-que-e",
        titulo: "O que é o exame toxicológico?",
        paragrafos: [
          "É uma análise laboratorial de larga janela de detecção: pesquisa substâncias num período retrospectivo maior que o de exames de sangue ou de urina. A amostra é queratínica — cabelo, ou pelo de outra região do corpo. A lei exige janela mínima de 90 dias; na Total Quality, a janela é de 180 dias.",
          "A Total Quality é posto de coleta: a amostra é identificada e enviada a laboratório credenciado, que analisa metabólitos de substâncias como maconha, cocaína, anfetaminas, metanfetaminas e opiáceos e emite o resultado em formato padronizado, aceito pelo DETRAN.",
        ],
      },
      {
        id: "quem-deve-fazer",
        titulo: "Quem deve fazer?",
        paragrafos: [
          "Condutores das categorias C, D e E, na obtenção, mudança, renovação e nos exames periódicos previstos na legislação. A Lei nº 15.153/2025 incluiu a exigência também na primeira habilitação das categorias A e B; como as regras mudam, confirme o seu prazo individual na Carteira Digital de Trânsito ou no Portal de Serviços da Senatran antes de começar o processo.",
        ],
        lista: [
          "Obtenção ou renovação da CNH C, D ou E",
          "Admissional de empresas de transporte",
          "Demissional e periódico de motoristas profissionais",
          "Processos judiciais e trabalhistas",
          "Concursos que exigem o exame",
          "Programas de prevenção em empresas",
        ],
      },
      {
        id: "como-e-feito",
        titulo: "Como é feita a coleta?",
        paragrafos: [
          "Um profissional treinado corta uma pequena amostra de cabelo; se o cabelo da cabeça for curto demais, pode ser coletado pelo de braço, perna ou tórax. O importante é ter no mínimo 3 cm. A coleta é rápida e não usa agulha. Não raspe cabelo nem pelos antes de receber orientação.",
          "Leve documento oficial com foto (RG ou CNH); CPF e dados da CNH podem ser pedidos no cadastro. Informe a finalidade — CNH, admissional, demissional ou periódico: a coleta é a mesma, o que muda é a finalidade: o da CNH segue o padrão do DETRAN, e o da empresa segue o pedido dela.",
        ],
      },
      {
        id: "preparo",
        titulo: "Precisa de jejum ou preparo?",
        paragrafos: [
          "Não precisa de jejum. Não suspenda remédios: informe os que usa na coleta e leve receita ou relatório médico quando pedido, porque alguns medicamentos geram metabólitos relevantes para a análise.",
        ],
      },
      {
        id: "resultado",
        titulo: "Quando sai o resultado?",
        paragrafos: [
          "Em 5 dias úteis. O resultado segue o fluxo oficial e fica ligado aos dados do condutor nos sistemas de trânsito. Prazo do resultado, janela de detecção (o período analisado) e validade administrativa são coisas diferentes: confirme cada uma na data do atendimento.",
        ],
      },
    ],
    nomeOndeFazer: "exame toxicológico",
    mensagemOndeFazer:
      "A coleta do exame toxicológico é feita de segunda a sexta, das 7h30 às 18h. Confirme horário e documentos pelo WhatsApp antes de vir.",
    blog: ["exame-toxicologico-cnh", "aso-exames-ocupacionais"],
    relacionados: ["/exames/exame-admissional", "/especialidades/medicina-do-trabalho", "/laboratorio-caraguatatuba", "/exames/exames-de-sangue"],
    atualizadoEm: REVISAO_FASE_3,
  },

  "sexagem-fetal": {
    respostaCurta:
      "A sexagem fetal é um exame de sangue feito na gestante que identifica o sexo do bebê a partir da 8ª semana de gestação, pela pesquisa do cromossomo Y no DNA fetal que circula no sangue da mãe. Não exige jejum. Na Total Quality, a coleta é por ordem de chegada ou com horário marcado pelo WhatsApp.",
    resumo: {
      jejum: "Não é necessário",
      preparo: "Informe a data da última menstruação ou a idade gestacional; avise se a gestação é de gêmeos ou se houve transfusão ou transplante",
      duracao: "A coleta leva poucos minutos",
      resultado: "O prazo é informado no atendimento; o laudo fica disponível online",
      atendimento: "Sem agendamento, por ordem de chegada, ou com horário marcado pelo WhatsApp, de segunda a sexta, das 7h30 às 18h",
      convenios: CONVENIOS,
    },
    // TODO(alex): o dado diz "se tiver duvida sobre pedido medico, fale com a
    // equipe" — nao diz se e exigido. Linha "Pedido medico" fora do resumo.
    imagem: {
      ...FOTO_LABORATORIO,
      alt: "Laboratório da Total Quality em Caraguatatuba, onde é feita a coleta da sexagem fetal",
    },
    secoes: [
      {
        id: "o-que-e",
        titulo: "O que é a sexagem fetal?",
        paragrafos: [
          "Durante a gravidez, fragmentos do DNA do bebê circulam no sangue da mãe. A sexagem fetal analisa esse DNA fetal livre em busca de sequências do cromossomo Y, que só existem no sexo masculino: se o Y é detectado, o resultado é masculino; se não é, feminino.",
          "O exame identifica apenas o sexo do bebê. Não diagnostica doenças e não substitui o pré-natal nem os ultrassons pedidos pelo médico.",
        ],
      },
      {
        id: "quando-fazer",
        titulo: "A partir de quantas semanas pode ser feita?",
        paragrafos: [
          "A partir da 8ª semana de gestação, contada pela data da última menstruação. Antes disso, a quantidade de DNA do bebê no sangue materno pode ser pequena demais para a análise — ela aumenta com o avanço da gravidez, e por isso é importante informar a idade gestacional na coleta.",
        ],
      },
      {
        id: "como-e-feita",
        titulo: "Como é feita a coleta?",
        paragrafos: [
          "É uma coleta de sangue comum, no braço da gestante, sem nenhum contato com o bebê, e leva poucos minutos. Pode ser feita sem agendamento, por ordem de chegada, de segunda a sexta, das 7h30 às 18h, ou com horário marcado pelo WhatsApp. Traga um documento com foto.",
        ],
      },
      {
        id: "gemeos",
        titulo: "E se a gravidez for de gêmeos?",
        paragrafos: [
          "Em gestação de gêmeos, o exame mostra se existe ao menos um bebê do sexo masculino, mas não diz o sexo de cada um; se o cromossomo Y não for detectado, os bebês são do sexo feminino. Informe a gestação gemelar no atendimento, assim como transfusão de sangue ou transplante.",
        ],
      },
    ],
    nomeOndeFazer: "sexagem fetal",
    mensagemOndeFazer:
      "Faça a sexagem fetal sem agendamento, por ordem de chegada, ou com horário marcado pelo WhatsApp. Atendemos gestantes de Caraguatatuba, Ubatuba, São Sebastião e Ilhabela.",
    relacionados: ["/exames/ultrassonografia", "/exames/exames-de-sangue", "/exames/hemograma", "/laboratorio-caraguatatuba"],
    atualizadoEm: REVISAO_FASE_3,
  },

  "exame-admissional": {
    respostaCurta:
      "O exame admissional é a avaliação médica ocupacional feita antes de o empregado assumir a função; termina com o ASO, o Atestado de Saúde Ocupacional, que registra se ele está apto ou inapto. A Total Quality também faz periódico, demissional, retorno ao trabalho e mudança de função, com agendamento pelo WhatsApp.",
    resumo: {
      preparo: "Documento com foto, guia ou encaminhamento da empresa e informações sobre remédios e histórico de saúde",
      duracao: "Avaliação clínica de 20 a 30 minutos; exames complementares no mesmo local",
      resultado: "ASO emitido ao final da avaliação; o toxicológico, quando pedido, sai à parte em 5 dias úteis",
      pedidoMedico: "Encaminhamento da empresa, com a função e os riscos do cargo",
      atendimento: "Com agendamento pelo WhatsApp (12) 3887-3535, de segunda a sexta, das 7h30 às 18h",
      // Sem linha "Convenios": exame ocupacional e pago pela empresa (secao "Quem paga").
    },
    // TODO(alex): sem foto real de atendimento ocupacional em /images. O PR #87
    // tem aso-medicina-do-trabalho-1672.jpg — so entra com a sua aprovacao.
    secoes: [
      {
        id: "o-que-e",
        titulo: "O que é o exame admissional?",
        paragrafos: [
          "É um dos exames médicos ocupacionais previstos na CLT e na Norma Regulamentadora nº 7 (NR-7), feito antes da contratação. O exame é a avaliação; o ASO é o documento emitido a partir dela, com a conclusão de apto ou inapto para aquela função específica, considerando os riscos do cargo e o PCMSO da empresa.",
          "Informações clínicas detalhadas ficam no prontuário médico e não vão para o ASO. A empresa trata os documentos ocupacionais com confidencialidade.",
        ],
      },
      {
        id: "tipos",
        titulo: "Quais exames ocupacionais a Total Quality faz?",
        paragrafos: [
          "Além do admissional, todos os exames previstos na NR-7, cada um com o seu ASO. As circunstâncias e os prazos de cada um seguem a NR-7 vigente e o PCMSO da empresa.",
        ],
        lista: [
          "Admissional: antes de assumir a função",
          "Periódico: durante o contrato, conforme o PCMSO",
          "Demissional: no encerramento do vínculo",
          "Retorno ao trabalho: após afastamento",
          "Mudança de função ou de riscos ocupacionais",
        ],
      },
      {
        id: "como-e-feito",
        titulo: "Como é feito?",
        paragrafos: [
          "A empresa ou o candidato agenda pelo WhatsApp ou telefone. A avaliação é um exame clínico com médico do trabalho e, conforme o risco da função, exames complementares: audiometria, espirometria, acuidade visual, eletrocardiograma, raio-X e exames laboratoriais, feitos no mesmo local, em geral na mesma visita.",
          "Para motorista profissional, o exame toxicológico também pode entrar no admissional, com resultado à parte, em 5 dias úteis. A documentação atende ao eSocial.",
        ],
      },
      {
        id: "preparo",
        titulo: "O que levar no dia?",
        paragrafos: [
          "Documento com foto e a guia ou encaminhamento da empresa. Chegue com 10 minutos de antecedência e informe os remédios em uso e o seu histórico de saúde. Alguns exames complementares pedem preparo próprio: a equipe orienta no agendamento.",
        ],
      },
      {
        id: "quem-paga",
        titulo: "Quem paga o exame admissional?",
        paragrafos: [
          "A empresa. O custo dos exames ocupacionais é sempre do empregador, nunca do trabalhador, e o trabalhador não deve contratar por conta própria exames definidos pelo PCMSO sem alinhamento com a empresa.",
        ],
      },
    ],
    empresa: {
      titulo: "Para empresas: exames ocupacionais e ASO",
      paragrafos: [
        "A Total Quality atende empresas de Caraguatatuba, Ubatuba, São Sebastião e Ilhabela com atendimento contínuo para admissionais, periódicos e demissionais. Para que o ASO seja coerente com a função, a empresa informa cargo, atividades e riscos de cada trabalhador.",
      ],
      itens: [
        "Exame admissional, periódico e demissional",
        "Retorno ao trabalho e mudança de função",
        "Emissão do ASO",
        "Exames complementares no mesmo endereço",
        "Toxicológico do motorista profissional",
        "Documentação para o eSocial",
      ],
      cta: "Solicitar proposta para empresa",
      mensagem: "Olá, vim pelo site e quero solicitar uma proposta de exames ocupacionais para a minha empresa",
    },
    nomeOndeFazer: "exame admissional",
    mensagemOndeFazer:
      "Empresas e candidatos agendam pelo WhatsApp ou telefone. Exame clínico, exames complementares e ASO no mesmo endereço.",
    blog: ["aso-exames-ocupacionais", "exame-toxicologico-cnh"],
    relacionados: ["/especialidades/medicina-do-trabalho", "/exames/exame-toxicologico", "/exames/espirometria", "/exames/eletrocardiograma"],
    atualizadoEm: REVISAO_FASE_3,
  },
};
