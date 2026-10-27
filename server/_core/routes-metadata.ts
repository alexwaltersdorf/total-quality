/**
 * Meta tags dinâmicas por rota para SEO
 * Este arquivo mapeia cada rota para seus meta tags únicos
 * Evita duplicação de conteúdo e garante indexação correta pelo Google
 */

import {
  anosDeAtuacao,
  HOME_TITLE,
  homeDescription,
  ANALISES_TITLE,
  ANALISES_DESCRIPTION,
  CHECKUP_TITLE,
  CHECKUP_DESCRIPTION,
} from "@shared/const";
import blogIndex from "../../client/src/content/blog/index.json";
import { blogDateIso, blogModifiedIso, isPublished, type BlogPostMeta } from "../../client/src/lib/blogMeta";
import { especialidadesData, ESPECIALIDADES_BASE } from "../../client/src/lib/especialidadesData";

export interface RouteMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical: string;
  priority?: number; // Para sitemap.xml (0.0 a 1.0)
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  /** AAAA-MM-DD da ultima alteracao real. Sem ele, o sitemap omite o lastmod. */
  lastmod?: string;
  /** og:type da pagina (padrao do index.html: "website"). */
  ogType?: "website" | "article";
  /** true = <meta name="robots" content="noindex, nofollow"> e fora do sitemap. */
  noindex?: boolean;
  /** Artigo do blog: datas em ISO para article:published_time / modified_time. */
  publishedTime?: string;
  modifiedTime?: string;
  /** Texto alternativo da imagem de compartilhamento (padrao do index.html: a fachada). */
  ogImageAlt?: string;
}

// Dados dos exames para reutilização
const examesMetadata: Record<string, RouteMetadata> = {
  "exames-de-sangue": {
    title: "Exames de Sangue em Caraguatatuba | Total Quality",
    description: "Exames de sangue em Caraguatatuba na Total Quality. Coleta por ordem de chegada, sem agendamento. Consulte preparo, prazos, convênios e orçamento pelo WhatsApp.",
    keywords: "exames de sangue, hemograma, glicemia, colesterol, hormônios, vitamina D, PSA, laboratório, análises clínicas, Caraguatatuba",
    ogTitle: "Exames de Sangue | Total Quality Medicina Diagnóstica",
    ogDescription: "Mais de 3.000 tipos de exames de sangue. Hemograma, glicemia, colesterol, hormônios e muito mais.",
    ogImage: "https://totalquality.med.br/images/laboratorio-1440.webp",
    canonical: "https://totalquality.med.br/exames/exames-de-sangue",
    priority: 0.9,
    changefreq: "monthly",
  },

  "tomografia-computadorizada": {
    title: "Tomografia Computadorizada em Caraguatatuba | Total Quality",
    description: "Tomografia computadorizada em Caraguatatuba - SP na Total Quality. Tomógrafo multislice para crânio, tórax, abdômen e coluna. Laudo rápido. Agende.",
    keywords: "tomografia, tomografia computadorizada, TC, tomógrafo, diagnóstico por imagem, Caraguatatuba",
    ogTitle: "Tomografia Computadorizada | Total Quality",
    ogDescription: "Exame de diagnóstico por imagem com equipamento multislice de alta resolução.",
    ogImage: "https://totalquality.med.br/images/tomografia-1440.webp",
    canonical: "https://totalquality.med.br/exames/tomografia-computadorizada",
    priority: 0.9,
    changefreq: "monthly",
  },

  "raio-x": {
    title: "Raio-X em Caraguatatuba | Clínica Total Quality",
    description: "Raio-X digital em Caraguatatuba na Total Quality. Faça exame de tórax, coluna, membros e seios da face com alta resolução. Agende o seu atendimento online.",
    keywords: "raio-x, radiografia, diagnóstico por imagem, raio-x digital, Caraguatatuba",
    ogTitle: "Raio-X Digital | Total Quality",
    ogDescription: "Exame de radiografia com tecnologia digital de alta definição.",
    canonical: "https://totalquality.med.br/exames/raio-x",
    priority: 0.9,
    changefreq: "monthly",
  },

  "ultrassonografia": {
    title: "Ultrassonografia em Caraguatatuba | Total Quality",
    description: "Ultrassonografia em Caraguatatuba - SP. Exame de imagem sem radiação. Ultrassom geral, doppler e especializado.",
    keywords: "ultrassonografia, ultrassom, doppler, diagnóstico por imagem, Caraguatatuba",
    ogTitle: "Ultrassonografia | Total Quality",
    ogDescription: "Exame de ultrassom com equipamento de alta resolução.",
    canonical: "https://totalquality.med.br/exames/ultrassonografia",
    priority: 0.9,
    changefreq: "monthly",
  },

  "mapa": {
    title: "MAPA 24h em Caraguatatuba | Total Quality",
    description: "MAPA em Caraguatatuba - SP. Monitoramento de pressão arterial por 24 horas. Diagnóstico de hipertensão. Agende seu exame.",
    keywords: "MAPA, monitoramento ambulatorial, pressão arterial, hipertensão, Caraguatatuba",
    ogTitle: "MAPA - Monitoramento de Pressão | Total Quality",
    ogDescription: "Monitoramento ambulatorial da pressão arterial por 24 horas.",
    canonical: "https://totalquality.med.br/exames/mapa",
    priority: 0.8,
    changefreq: "monthly",
  },

  "holter": {
    title: "Holter 24h em Caraguatatuba | Total Quality",
    description: "Holter 24h em Caraguatatuba - SP. Monitoramento contínuo do coração. Diagnóstico de arritmias. Agende seu exame.",
    keywords: "holter, monitoramento cardíaco, arritmia, eletrocardiograma, Caraguatatuba",
    ogTitle: "Holter 24h | Total Quality",
    ogDescription: "Monitoramento contínuo do coração por 24 horas.",
    canonical: "https://totalquality.med.br/exames/holter",
    priority: 0.8,
    changefreq: "monthly",
  },

  "espirometria": {
    title: "Espirometria em Caraguatatuba | Teste de Função Pulmonar",
    description: "Espirometria em Caraguatatuba - SP. Teste de função pulmonar para diagnóstico de doenças respiratórias. Agende seu exame.",
    keywords: "espirometria, função pulmonar, teste respiratório, DPOC, asma, Caraguatatuba",
    ogTitle: "Espirometria | Total Quality",
    ogDescription: "Teste de função pulmonar com laudo médico.",
    canonical: "https://totalquality.med.br/exames/espirometria",
    priority: 0.8,
    changefreq: "monthly",
  },

  "eletrocardiograma": {
    title: "Eletrocardiograma (ECG) em Caraguatatuba | Total Quality",
    description: "Eletrocardiograma em Caraguatatuba - SP. Diagnóstico de problemas cardíacos. Exame rápido e não invasivo. Agende.",
    keywords: "eletrocardiograma, ECG, coração, diagnóstico cardíaco, Caraguatatuba",
    ogTitle: "Eletrocardiograma | Total Quality",
    ogDescription: "Exame do coração rápido e não invasivo.",
    canonical: "https://totalquality.med.br/exames/eletrocardiograma",
    priority: 0.8,
    changefreq: "monthly",
  },

  "eletroencefalograma": {
    title: "Eletroencefalograma (EEG) em Caraguatatuba | Total Quality",
    description: "Eletroencefalograma em Caraguatatuba - SP. Diagnóstico de problemas neurológicos. Exame não invasivo. Agende seu EEG.",
    keywords: "eletroencefalograma, EEG, neurologia, cérebro, epilepsia, Caraguatatuba",
    ogTitle: "Eletroencefalograma | Total Quality",
    ogDescription: "Exame neurológico não invasivo para diagnóstico de problemas cerebrais.",
    canonical: "https://totalquality.med.br/exames/eletroencefalograma",
    priority: 0.8,
    changefreq: "monthly",
  },

  "exame-toxicologico": {
    title: "Exame Toxicológico em Caraguatatuba | Total Quality",
    description: "Exame toxicológico em Caraguatatuba para CNH C, D e E e motorista profissional: coleta de cabelo ou pelo, laboratório credenciado. Dúvidas no WhatsApp.",
    keywords: "exame toxicológico, exames toxicológicos, toxicológico CNH, toxicológico motorista profissional, teste de drogas, Caraguatatuba",
    ogTitle: "Exame Toxicológico para CNH | Total Quality",
    ogDescription: "Toxicológico para CNH C, D e E e motorista profissional, com coleta na unidade e laboratório credenciado.",
    canonical: "https://totalquality.med.br/exames/exame-toxicologico",
    priority: 0.8,
    changefreq: "monthly",
  },

  "hemograma": {
    title: "Hemograma Completo em Caraguatatuba | Total Quality",
    description: "Hemograma completo em Caraguatatuba: o que é, se precisa de jejum, o que detecta e em quanto tempo sai o resultado. Faça na Total Quality, resultado em curto prazo.",
    keywords: "hemograma, hemograma completo, hemograma precisa de jejum, exame de sangue, análises clínicas, Caraguatatuba",
    ogTitle: "Hemograma Completo | Total Quality",
    ogDescription: "Tudo sobre o hemograma completo: o que avalia, preparo e resultado em curto prazo.",
    canonical: "https://totalquality.med.br/exames/hemograma",
    priority: 0.9,
    changefreq: "monthly",
  },

  "sexagem-fetal": {
    title: "Sexagem Fetal em Caraguatatuba | Total Quality",
    description: "Sexagem fetal em Caraguatatuba: exame de sangue da gestante que identifica o sexo do bebê a partir da 8ª semana. Sem jejum. Dúvidas e valores pelo WhatsApp.",
    keywords: "sexagem fetal, exame de sexagem fetal, sexo do bebê, DNA fetal, exame de sangue gravidez, Caraguatatuba",
    ogTitle: "Sexagem Fetal | Total Quality",
    ogDescription: "Exame de sangue da gestante que identifica o sexo do bebê a partir da 8ª semana de gestação.",
    canonical: "https://totalquality.med.br/exames/sexagem-fetal",
    priority: 0.8,
    changefreq: "monthly",
  },

  "exame-admissional": {
    title: "Exame Admissional e ASO em Caraguatatuba | Total Quality",
    description: "Exame admissional, periódico, demissional e ASO em Caraguatatuba. Medicina ocupacional completa para empresas do Litoral Norte, com agilidade. Agende.",
    keywords: "exame admissional, ASO, exame ocupacional, exame demissional, medicina do trabalho, Caraguatatuba",
    ogTitle: "Exames Ocupacionais e ASO | Total Quality",
    ogDescription: "Admissional, periódico, demissional e ASO para empresas de Caraguatatuba e região.",
    canonical: "https://totalquality.med.br/exames/exame-admissional",
    priority: 0.9,
    changefreq: "monthly",
  },

  "mamografia": {
    title: "Mamografia Digital em Caraguatatuba | Total Quality",
    description: "Mamografia digital em Caraguatatuba - SP. Rastreamento do câncer de mama com mamógrafo digital. Agende seu exame.",
    keywords: "mamografia, mamografia digital, câncer de mama, diagnóstico, Caraguatatuba",
    ogTitle: "Mamografia Digital | Total Quality",
    ogDescription: "Exame de mamografia com tecnologia digital de alta resolução.",
    canonical: "https://totalquality.med.br/exames/mamografia",
    priority: 0.9,
    changefreq: "monthly",
  },
};

// Paginas de especialidade (/especialidades/:slug), 24/10/2026. Title e
// description sao os mesmos do client/src/lib/especialidadesData.ts.
const especialidadesMetadata: Record<string, RouteMetadata> = Object.fromEntries(
  especialidadesData.map((e) => [
    e.slug,
    {
      title: e.metaTitle,
      description: e.metaDescription,
      keywords: e.keywords.join(", "),
      ogTitle: e.metaTitle,
      ogDescription: e.metaDescription,
      canonical: `https://totalquality.med.br${ESPECIALIDADES_BASE}/${e.slug}`,
      priority: 0.8,
      changefreq: "monthly",
    } satisfies RouteMetadata,
  ])
);

// Dados dos artigos de blog
/*
 * Metadados escritos a mao dos artigos antigos. Artigo novo NAO precisa entrar
 * aqui: blogRoute() deriva title (metaTitle), description (excerpt), og e
 * lastmod do client/src/content/blog/index.json. Uma entrada daqui so
 * sobrescreve os textos — lastmod, og:type e noindex vem sempre do indice.
 */
const blogMetadata: Record<string, RouteMetadata> = {









  "tomografia-computadorizada-como-funciona": {
    title: "Tomografia Computadorizada: Como Funciona? | Total Quality",
    description: "Entenda como funciona a tomografia computadorizada, como é feito o exame, quando o contraste é necessário, quanto tempo dura e se dói.",
    keywords: "tomografia computadorizada, tomografia, como funciona a tomografia, contraste, diagnóstico por imagem, Caraguatatuba",
    ogTitle: "Tomografia Computadorizada: Como Funciona?",
    ogDescription: "Entenda como é feito o exame, se dói, quanto tempo dura e quando o contraste é necessário.",
    ogImage: "https://totalquality.med.br/images/blog/tomografia-computadorizada-como-funciona.webp",
    canonical: "https://totalquality.med.br/blog/tomografia-computadorizada-como-funciona",
    priority: 0.7,
    changefreq: "monthly",
  },

  "mapa-ou-holter-diferenca": {
    title: "MAPA ou Holter: Qual a Diferença? | Total Quality",
    description: "Entenda a diferença entre MAPA e Holter: o que cada exame monitora, para que serve, se podem ser feitos juntos e como se preparar.",
    keywords: "MAPA, Holter, monitorização ambulatorial da pressão arterial, exame cardiológico, arritmia, Caraguatatuba",
    ogTitle: "MAPA ou Holter: Qual a Diferença?",
    ogDescription: "Entenda o que cada exame monitora, para que serve e como se preparar.",
    ogImage: "https://totalquality.med.br/images/blog/mapa-ou-holter-diferenca.webp",
    canonical: "https://totalquality.med.br/blog/mapa-ou-holter-diferenca",
    priority: 0.7,
    changefreq: "monthly",
  },

  "check-up-medico-quais-exames-fazer": {
    title: "Check-up Médico: Quais Exames Fazer? | Total Quality",
    description: "Entenda o que compõe um check-up médico: exames laboratoriais, cardiológicos e de imagem, com que frequência repetir e como se preparar.",
    keywords: "check-up médico, check-up preventivo, quais exames fazer, exames laboratoriais, medicina preventiva, Caraguatatuba",
    ogTitle: "Check-up Médico: Quais Exames Fazer?",
    ogDescription: "Entenda como o check-up se organiza entre exames laboratoriais, cardiológicos e de imagem.",
    ogImage: "https://totalquality.med.br/images/blog/check-up-medico-quais-exames-fazer.webp",
    canonical: "https://totalquality.med.br/blog/check-up-medico-quais-exames-fazer",
    priority: 0.7,
    changefreq: "monthly",
  },

  "diferenca-ultrassom-comum-doppler": {
    title: "Ultrassom Comum e com Doppler: Diferença | Total Quality",
    description: "Descubra a diferença entre ultrassom comum e ultrassom com Doppler, o que cada modalidade avalia e como pode ser o preparo.",
    keywords: "diferença entre ultrassom e Doppler, ultrassom com Doppler, ultrassonografia, exame de imagem, Caraguatatuba",
    ogTitle: "Ultrassom Comum e com Doppler: Qual a Diferença?",
    ogDescription: "Entenda o que o Doppler acrescenta ao exame, quando é utilizado e como se preparar.",
    ogImage: "https://totalquality.med.br/images/cardiologia-1024.webp",
    canonical: "https://totalquality.med.br/blog/diferenca-ultrassom-comum-doppler",
    priority: 0.7,
    changefreq: "monthly",
  },

  "mamografia-ultrassom-mamas-diferencas": {
    title: "Mamografia e Ultrassom das Mamas: Diferenças | Total Quality",
    description: "Mamografia e ultrassom das mamas não são iguais. Entenda como cada exame funciona, suas diferenças e por que um não substitui automaticamente o outro.",
    keywords: "diferença entre mamografia e ultrassom da mama, mamografia, ultrassom das mamas, saúde da mulher, Caraguatatuba",
    ogTitle: "Mamografia e Ultrassom das Mamas: Diferenças",
    ogDescription: "Por que um exame não substitui automaticamente o outro.",
    ogImage: "https://totalquality.med.br/images/blog/mamografia-ultrassom-mamas-diferencas.webp",
    canonical: "https://totalquality.med.br/blog/mamografia-ultrassom-mamas-diferencas",
    priority: 0.7,
    changefreq: "monthly",
  },

  "diferenca-raio-x-tomografia": {
    title: "Raio-X e Tomografia: Qual a Diferença? | Total Quality",
    description: "Saiba como raio-X e tomografia funcionam, as diferenças nas imagens, quando o contraste pode ser usado e como é o preparo.",
    keywords: "diferença entre raio-X e tomografia, raio-x, tomografia computadorizada, diagnóstico por imagem, Caraguatatuba",
    ogTitle: "Raio-X e Tomografia: Quais as Diferenças?",
    ogDescription: "Entenda quando o contraste é usado, quem tem mais detalhe e como se preparar.",
    ogImage: "https://totalquality.med.br/images/blog/diferenca-raio-x-tomografia.webp",
    canonical: "https://totalquality.med.br/blog/diferenca-raio-x-tomografia",
    priority: 0.7,
    changefreq: "monthly",
  },

  "aso-exames-ocupacionais": {
    title: "ASO: O Que É e Quando Deve Ser Emitido | Total Quality",
    description: "Entenda o que é ASO, quando o documento é emitido, sua relação com os exames ocupacionais e as responsabilidades de empresas e trabalhadores.",
    keywords: "o que é ASO, exame ocupacional, PCMSO, NR-7, atestado de saúde ocupacional, Caraguatatuba",
    ogTitle: "ASO: O Que É e Quando Deve Ser Emitido",
    ogDescription: "Entenda a diferença entre o exame ocupacional e o documento, e o que a NR-7 exige.",
    ogImage: "https://totalquality.med.br/images/blog/aso-exames-ocupacionais.webp",
    canonical: "https://totalquality.med.br/blog/aso-exames-ocupacionais",
    priority: 0.6,
    changefreq: "monthly",
  },

  "exame-toxicologico-cnh": {
    title: "Exame Toxicológico para CNH: Quem Precisa? | Total Quality",
    description: "Entenda quem precisa fazer exame toxicológico para CNH, quando ele pode ser exigido, como consultar o prazo e quais documentos levar.",
    keywords: "exame toxicológico para CNH, exame toxicológico, Senatran, Detran, CNH, Caraguatatuba",
    ogTitle: "Exame Toxicológico para CNH: Quem Precisa Fazer?",
    ogDescription: "Entenda a janela de detecção, como consultar o prazo e quais documentos levar.",
    ogImage: "https://totalquality.med.br/images/blog/exame-toxicologico-cnh.webp",
    canonical: "https://totalquality.med.br/blog/exame-toxicologico-cnh",
    priority: 0.6,
    changefreq: "monthly",
  },


  // SEO local da regiao sul (out/2026). O termo "laboratorio em Caraguatatuba"
  // pertence a /laboratorio-caraguatatuba; estes artigos atacam a cauda longa
  // dos bairros do sul (Pereque-Mirim, Travessao, Porto Novo, Morro do
  // Algodao), que nenhuma pagina do site disputava.

  "como-escolher-laboratorio-analises-clinicas": {
    title: "Como Escolher um Laboratório: 8 Critérios Técnicos",
    description: "Licença sanitária, responsável técnico, controle externo de qualidade e prazo por exame: os 8 critérios que mostram se um laboratório é confiável.",
    keywords: "como escolher laboratório, laboratório confiável, controle de qualidade análises clínicas, RDC 302 Anvisa, responsável técnico laboratório, PNCQ ControlLab",
    ogTitle: "Como Escolher um Laboratório de Análises Clínicas",
    ogDescription: "Oito critérios verificáveis que dizem mais sobre o seu resultado do que marca, fachada ou preço.",
    ogImage: "https://totalquality.med.br/images/laboratorio-1024.webp",
    canonical: "https://totalquality.med.br/blog/como-escolher-laboratorio-analises-clinicas",
    priority: 0.7,
    changefreq: "monthly",
  },

  "hipoglicemia-sintomas-e-exames": {
    title: "Hipoglicemia: Sintomas, Causas e Quais Exames Fazer",
    description: "Hipoglicemia é a glicose abaixo de 70 mg/dL. Sinais de alerta, quando procurar emergência e quais exames investigam a causa.",
    keywords: "hipoglicemia, glicose baixa, glicemia de jejum, curva glicêmica, hemoglobina glicada, insulina e peptídeo C, Caraguatatuba",
    ogTitle: "Hipoglicemia: Sintomas, Causas e Quais Exames Fazer",
    ogDescription: "Quando a glicose cai abaixo de 70 mg/dL, o que fazer na hora e quais exames investigam a causa.",
    ogImage: "https://totalquality.med.br/images/blog/hipoglicemia-sintomas-e-exames.webp",
    canonical: "https://totalquality.med.br/blog/hipoglicemia-sintomas-e-exames",
    priority: 0.7,
    changefreq: "monthly",
  },

  "resultado-de-exames-online-seguranca": {
    title: "Resultado de Exames Online: Acesso Seguro e LGPD",
    description: "Como acessar seu resultado de exames online com segurança, quem pode recebê-lo e o que a LGPD garante sobre o seu dado sensível de saúde.",
    keywords: "resultado de exames online, resultado de exames Caraguatatuba, LGPD saúde, dado sensível de saúde, sigilo de resultado de exame",
    ogTitle: "Resultado de Exames Online: Como Acessar com Segurança",
    ogDescription: "Quem pode receber, o que a LGPD garante e por que o laudo nunca vai para um grupo de mensagens.",
    ogImage: "https://totalquality.med.br/images/blog/resultado-de-exames-online-seguranca.webp",
    canonical: "https://totalquality.med.br/blog/resultado-de-exames-online-seguranca",
    priority: 0.7,
    changefreq: "monthly",
  },

};

// Rotas estáticas principais
const staticRoutes: Record<string, RouteMetadata> = {
  // A home e a DONA de "laboratorio" (ver HOME_TITLE em shared/const.ts):
  // decisao por Search Console, nao por opiniao. Nao entregar o termo a outra pagina.
  "/": {
    title: HOME_TITLE,
    description: homeDescription(),
    keywords: "laboratório Caraguatatuba, exames de sangue, tomografia, ultrassom, check-up",
    ogTitle: "Total Quality Medicina Diagnóstica e Laboratorial | Exames de Sangue em Caraguatatuba - SP",
    ogDescription: "Laboratório de análises clínicas e clínica de medicina diagnóstica em Caraguatatuba - SP. Exames de sangue, hemograma, glicemia, colesterol, hormônios, tomografia, ultrassonografia, mamografia e mais de 3.000 tipos de exames. Agende pelo WhatsApp.",
    ogImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/optik-hero_756f938d.png",
    canonical: "https://totalquality.med.br/",
    priority: 1.0,
    changefreq: "weekly",
  },

  "/checkup": {
    title: CHECKUP_TITLE,
    description: CHECKUP_DESCRIPTION,
    keywords: "check-up completo Caraguatatuba, check-up, check-up preventivo, exames preventivos, Caraguatatuba",
    ogTitle: "Check-up Preventivo | Total Quality",
    ogDescription: "Planos de check-up preventivo com exames completos para sua saúde.",
    canonical: "https://totalquality.med.br/checkup",
    priority: 0.9,
    changefreq: "monthly",
  },

  "/bioimpedancia": {
    title: "Bioimpedância em Caraguatatuba | Total Quality",
    description: "Bioimpedância em Caraguatatuba - SP. Análise de composição corporal (gordura, músculo, água). Agende seu exame.",
    keywords: "bioimpedância, composição corporal, gordura corporal, análise de corpo, Caraguatatuba",
    ogTitle: "Bioimpedância | Total Quality",
    ogDescription: "Análise de composição corporal com tecnologia de bioimpedância.",
    canonical: "https://totalquality.med.br/bioimpedancia",
    priority: 0.8,
    changefreq: "monthly",
  },

  "/blog": {
    title: "Blog Total Quality | Artigos sobre Saúde e Diagnóstico",
    description: "Blog Total Quality: artigos sobre saúde, diagnóstico, exames preventivos e bem-estar. Informações de especialistas.",
    keywords: "blog saúde, artigos médicos, diagnóstico, exames, bem-estar",
    ogTitle: "Blog Total Quality | Saúde e Diagnóstico",
    ogDescription: "Leia artigos sobre saúde, diagnóstico e bem-estar de especialistas.",
    canonical: "https://totalquality.med.br/blog",
    priority: 0.8,
    changefreq: "weekly",
  },

  "/privacidade": {
    title: "Política de Privacidade | Total Quality Medicina Diagnóstica",
    description: "Como a Total Quality coleta, usa e protege seus dados pessoais e de saúde, conforme a LGPD. Seus direitos e como exercê-los.",
    keywords: "política de privacidade, LGPD, proteção de dados, dados de saúde",
    ogTitle: "Política de Privacidade | Total Quality",
    ogDescription: "Tratamento de dados pessoais e de saúde na Total Quality, conforme a LGPD.",
    canonical: "https://totalquality.med.br/privacidade",
    priority: 0.3,
    changefreq: "yearly",
  },

  "/exames": {
    title: "Exames Laboratoriais e de Imagem | Total Quality",
    description: "Todos os exames da Total Quality em Caraguatatuba: exames laboratoriais, hemograma, ultrassom, tomografia, cardiológicos, ocupacionais e mais. Veja a lista completa.",
    keywords: "exames laboratoriais, exames Caraguatatuba, análises clínicas, exames de imagem, lista de exames",
    ogTitle: "Exames | Total Quality Medicina Diagnóstica",
    ogDescription: "Lista completa de exames laboratoriais, de imagem e cardiológicos em Caraguatatuba.",
    canonical: "https://totalquality.med.br/exames",
    priority: 0.9,
    changefreq: "weekly",
  },

  "/convenios": {
    title: "Convênios Aceitos | Laboratório Total Quality Caraguatatuba",
    description: "Convênios aceitos no laboratório Total Quality em Caraguatatuba: Cartão de Todos, Solumedi e Leader. Fora deles, atendimento particular. Confirme pelo WhatsApp.",
    keywords: "convênios laboratório Caraguatatuba, Cartão de Todos Caraguatatuba, Solumedi, Leader",
    ogTitle: "Convênios Aceitos | Total Quality Caraguatatuba",
    ogDescription: "Convênios aceitos para exames laboratoriais e de imagem em Caraguatatuba: Cartão de Todos, Solumedi e Leader.",
    canonical: "https://totalquality.med.br/convenios",
    priority: 0.7,
    changefreq: "monthly",
  },

  /*
   * Campanha Check-up Outubro Rosa. Rota sazonal: quando a campanha encerrar,
   * tirar esta entrada (sai do sitemap), tirar a rota do App.tsx e o bloco do
   * seo-content.ts. O passo a passo esta em docs/campanha-outubro-rosa.md.
   *
   * priority abaixo da landing de laboratorio de proposito: campanha nao
   * disputa a pagina permanente que sustenta o termo o ano inteiro.
   */
  "/outubro-rosa": {
    title: "Check-up Outubro Rosa em Caraguatatuba | Total Quality",
    description: "Check-up Outubro Rosa na Total Quality: ultrassonografia das mamas, transvaginal e Papanicolau por R$ 399,90. Agende em Caraguatatuba.",
    keywords: "check-up outubro rosa Caraguatatuba, ultrassonografia das mamas, ultrassonografia transvaginal, papanicolau Caraguatatuba, preventivo",
    ogTitle: "Check-up Outubro Rosa | Total Quality",
    ogDescription: "Ultrassonografia das mamas, transvaginal e Papanicolau por R$ 399,90, em Caraguatatuba. Fale com a equipe pelo WhatsApp.",
    ogImage: "https://totalquality.med.br/images/outubro-rosa-og.webp",
    canonical: "https://totalquality.med.br/outubro-rosa",
    priority: 0.7,
    changefreq: "weekly",
  },

  "/laboratorio-caraguatatuba": {
    // Esta pagina e de "analises clinicas"; "laboratorio" e da home. A versao
    // anterior separava so no title do servidor e o React reescrevia o titulo
    // para "Laboratorio em Caraguatatuba" — o mesmo termo da home.
    title: ANALISES_TITLE,
    description: ANALISES_DESCRIPTION,
    keywords: "análises clínicas Caraguatatuba, exames laboratoriais, hemograma, exames de sangue",
    ogTitle: ANALISES_TITLE,
    ogDescription: ANALISES_DESCRIPTION,
    canonical: "https://totalquality.med.br/laboratorio-caraguatatuba",
    priority: 0.8,
    changefreq: "monthly",
  },

  "/cartao": {
    title: "Cartão Total Quality Care | Benefícios e Cashback",
    description: "Cartão Total Quality Care: benefícios, cashback, planos e preços. Saúde preventiva com vantagens financeiras.",
    keywords: "cartão de saúde, total quality care, cashback, benefícios",
    ogTitle: "Cartão Total Quality Care | Benefícios e Cashback",
    ogDescription: "Cartão de saúde com cashback e benefícios exclusivos para sua família.",
    canonical: "https://totalquality.med.br/cartao",
    priority: 0.8,
    changefreq: "monthly",
  },
};

/**
 * Obter meta tags para uma rota específica
 */
export function getRouteMetadata(pathname: string): RouteMetadata | null {
  // Remover query string e trailing slash
  const path = pathname.split("?")[0].replace(/\/$/, "") || "/";

  // Verificar rotas estáticas exatas
  if (staticRoutes[path]) {
    return staticRoutes[path];
  }

  // Verificar rotas de exames (/exames/:slug)
  const examMatch = path.match(/^\/exames\/([a-z0-9\-]+)$/);
  if (examMatch) {
    const slug = examMatch[1];
    if (examesMetadata[slug]) {
      return examesMetadata[slug];
    }
  }

  // Verificar rotas de especialidade (/especialidades/:slug)
  const espMatch = path.match(/^\/especialidades\/([a-z0-9\-]+)$/);
  if (espMatch && especialidadesMetadata[espMatch[1]]) {
    return especialidadesMetadata[espMatch[1]];
  }

  // Verificar rotas de blog (/blog/:slug)
  const blogMatch = path.match(/^\/blog\/([a-z0-9\-]+)$/);
  if (blogMatch) {
    const route = blogRoute(blogMatch[1]);
    if (route) return route;
  }

  // Rota não encontrada
  return null;
}

/**
 * Slugs de blog com metadata conhecida (usado na resolução de 404)
 */
export function getKnownBlogSlugs(): Set<string> {
  // Rascunho incluso: a URL responde 200 (com noindex) para revisao.
  return new Set(blogPostsMeta.map((p) => p.slug));
}

const blogPostsMeta = blogIndex as BlogPostMeta[];

/** Metadados da rota de um artigo, a partir do indice do blog. */
function blogRoute(slug: string): RouteMetadata | null {
  const post = blogPostsMeta.find((p) => p.slug === slug);
  if (!post) return null;
  const canonical = `https://totalquality.med.br/blog/${slug}`;
  const base: RouteMetadata = blogMetadata[slug] ?? {
    title: post.metaTitle ?? post.title,
    description: post.excerpt,
    keywords: post.tags.join(", "),
    ogTitle: post.title,
    ogDescription: post.excerpt,
    ogImage: post.image,
    canonical,
    priority: 0.7,
    changefreq: "monthly",
  };
  return {
    ...base,
    ogType: "article",
    lastmod: blogModifiedIso(post),
    publishedTime: blogDateIso(post.date),
    modifiedTime: blogModifiedIso(post),
    ogImageAlt: post.title,
    ...(isPublished(post) ? {} : { noindex: true }),
  };
}

/**
 * Gerar lista de todas as rotas para sitemap.xml
 */
export function getAllRoutes(): RouteMetadata[] {
  const routes: RouteMetadata[] = [];

  // Adicionar rotas estáticas
  routes.push(...Object.values(staticRoutes));

  // Adicionar rotas de exames
  routes.push(...Object.values(examesMetadata));

  // Adicionar rotas de especialidade
  routes.push(...Object.values(especialidadesMetadata));

  // Adicionar rotas de blog — so as publicadas; rascunho nunca entra no sitemap
  for (const post of blogPostsMeta) {
    const route = blogRoute(post.slug);
    if (route && !route.noindex) routes.push(route);
  }

  return routes;
}

/**
 * Injetar meta tags no HTML
 */
export function injectMetaTags(html: string, metadata: RouteMetadata): string {
  let result = html;

  // Injetar title
  result = result.replace(
    /<title>.*?<\/title>/,
    `<title>${escapeHtml(metadata.title)}</title>`
  );

  // Injetar meta description
  result = result.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${escapeHtml(metadata.description)}"`
  );

  // Injetar canonical
  result = result.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${escapeHtml(metadata.canonical)}"`
  );

  // Injetar og:title
  result = result.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${escapeHtml(metadata.ogTitle || metadata.title)}"`
  );

  // Injetar og:description
  result = result.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${escapeHtml(metadata.ogDescription || metadata.description)}"`
  );

  // Injetar og:url
  result = result.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${escapeHtml(metadata.canonical)}"`
  );

  if (metadata.ogType) {
    result = result.replace(
      /<meta property="og:type" content="[^"]*"/,
      `<meta property="og:type" content="${metadata.ogType}"`
    );
  }

  // Twitter/X: ate 27/10/2026 o title, a description e a imagem do cartao
  // ficavam com o texto da home em TODAS as paginas, porque so as tags og eram
  // trocadas. Passam a seguir as mesmas da pagina (system prompt do blog, 27/10).
  const ogTitle = escapeHtml(metadata.ogTitle || metadata.title);
  const ogDesc = escapeHtml(metadata.ogDescription || metadata.description);
  result = result
    .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${ogTitle}"`)
    .replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${ogDesc}"`);
  if (metadata.ogImage) {
    result = result.replace(
      /<meta name="twitter:image" content="[^"]*"/,
      `<meta name="twitter:image" content="${escapeHtml(metadata.ogImage)}"`
    );
  }
  if (metadata.ogImageAlt) {
    result = result.replace(
      /<meta property="og:image:alt" content="[^"]*"/,
      `<meta property="og:image:alt" content="${escapeHtml(metadata.ogImageAlt)}"`
    );
  }
  // Datas do artigo, logo depois do og:type
  if (metadata.ogType === "article" && metadata.publishedTime) {
    const datas =
      `<meta property="article:published_time" content="${escapeHtml(metadata.publishedTime)}" />` +
      (metadata.modifiedTime ? `\n    <meta property="article:modified_time" content="${escapeHtml(metadata.modifiedTime)}" />` : "");
    result = result.replace(/(<meta property="og:type" content="article"\s*\/?>)/, `$1\n    ${datas}`);
  }

  // Rascunho do blog: acessivel para revisao, mas fora do indice do Google
  if (metadata.noindex) {
    result = result.replace(
      /<meta name="robots" content="[^"]*"/,
      `<meta name="robots" content="noindex, nofollow"`
    );
  }

  // Injetar og:image se fornecido
  if (metadata.ogImage) {
    result = result.replace(
      /<meta property="og:image" content="[^"]*"/,
      `<meta property="og:image" content="${escapeHtml(metadata.ogImage)}"`
    );
  }

  // Injetar keywords se fornecido
  if (metadata.keywords) {
    result = result.replace(
      /<meta name="keywords" content="[^"]*"/,
      `<meta name="keywords" content="${escapeHtml(metadata.keywords)}"`
    );
  }

  return result;
}

/**
 * Escapar caracteres especiais em HTML
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, (char) => map[char]);
}
