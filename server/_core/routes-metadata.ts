/**
 * Meta tags dinâmicas por rota para SEO
 * Este arquivo mapeia cada rota para seus meta tags únicos
 * Evita duplicação de conteúdo e garante indexação correta pelo Google
 */

import { anosDeAtuacao } from "@shared/const";

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
}

// Dados dos exames para reutilização
const examesMetadata: Record<string, RouteMetadata> = {
  "exames-de-sangue": {
    title: "Exames de Sangue em Caraguatatuba | Total Quality",
    description: "Exames de sangue em Caraguatatuba - SP na Total Quality: hemograma, glicemia, colesterol, hormônios, vitamina D, PSA e TSH. Resultados rápidos. Agende.",
    keywords: "exames de sangue, hemograma, glicemia, colesterol, hormônios, vitamina D, PSA, laboratório, análises clínicas, Caraguatatuba",
    ogTitle: "Exames de Sangue | Total Quality Medicina Diagnóstica",
    ogDescription: "Mais de 3.000 tipos de exames de sangue com tecnologia de última geração. Hemograma, glicemia, colesterol, hormônios e muito mais.",
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
    description: "Ultrassonografia em Caraguatatuba - SP. Exame de imagem com equipamento de última geração. Ultrassom geral, doppler e especializado.",
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
    ogDescription: "Teste de função pulmonar com equipamento de última geração.",
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
    description: "Exame toxicológico em Caraguatatuba - SP. Teste de drogas. Resultado rápido e confiável. Agende seu exame.",
    keywords: "exame toxicológico, teste de drogas, toxicologia, Caraguatatuba",
    ogTitle: "Exame Toxicológico | Total Quality",
    ogDescription: "Teste toxicológico com resultado rápido e confiável.",
    canonical: "https://totalquality.med.br/exames/exame-toxicologico",
    priority: 0.8,
    changefreq: "monthly",
  },

  "hemograma": {
    title: "Hemograma Completo em Caraguatatuba | Total Quality",
    description: "Hemograma completo em Caraguatatuba: o que é, se precisa de jejum, o que detecta e em quanto tempo sai o resultado. Faça na Total Quality, resultado em até 24h.",
    keywords: "hemograma, hemograma completo, hemograma precisa de jejum, exame de sangue, análises clínicas, Caraguatatuba",
    ogTitle: "Hemograma Completo | Total Quality",
    ogDescription: "Tudo sobre o hemograma completo: o que avalia, preparo e resultado em até 24h.",
    canonical: "https://totalquality.med.br/exames/hemograma",
    priority: 0.9,
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
    description: "Mamografia digital em Caraguatatuba - SP. Diagnóstico de câncer de mama. Tecnologia de última geração. Agende seu exame.",
    keywords: "mamografia, mamografia digital, câncer de mama, diagnóstico, Caraguatatuba",
    ogTitle: "Mamografia Digital | Total Quality",
    ogDescription: "Exame de mamografia com tecnologia digital de alta resolução.",
    canonical: "https://totalquality.med.br/exames/mamografia",
    priority: 0.9,
    changefreq: "monthly",
  },
};

// Dados dos artigos de blog
const blogMetadata: Record<string, RouteMetadata> = {
  "check-up-preventivo-quando-fazer": {
    title: "Check-up Preventivo: Quando Fazer | Total Quality",
    description: "Guia completo sobre check-up preventivo: quando fazer, quais exames incluir e como manter a saúde. Dicas de especialistas.",
    keywords: "check-up preventivo, exames preventivos, saúde preventiva, quando fazer check-up",
    ogTitle: "Check-up Preventivo: Quando Fazer",
    ogDescription: "Saiba quando fazer seu check-up preventivo e quais exames são essenciais para manter a saúde.",
    canonical: "https://totalquality.med.br/blog/check-up-preventivo-quando-fazer",
    priority: 0.7,
    changefreq: "monthly",
  },

  "hemograma-caraguatatuba": {
    title: "Hemograma em Caraguatatuba | Total Quality",
    description: "Hemograma em Caraguatatuba: entenda o que é, para que serve e como é realizado. Resultados rápidos na Total Quality.",
    keywords: "hemograma, hemograma completo, análise de sangue, laboratório, Caraguatatuba",
    ogTitle: "Hemograma em Caraguatatuba",
    ogDescription: "Tudo sobre hemograma: o que é, para que serve e como é realizado.",
    canonical: "https://totalquality.med.br/blog/hemograma-caraguatatuba",
    priority: 0.7,
    changefreq: "monthly",
  },

  "ultrassonografia-caraguatatuba": {
    title: "Guia de Ultrassonografia em Caraguatatuba | Total Quality",
    description: "Ultrassonografia em Caraguatatuba: tipos, indicações, preparo e como é realizado. Diagnóstico rápido e preciso.",
    keywords: "ultrassonografia, ultrassom, diagnóstico por imagem, Caraguatatuba",
    ogTitle: "Ultrassonografia em Caraguatatuba",
    ogDescription: "Guia completo sobre ultrassonografia: tipos, indicações e como é realizado.",
    canonical: "https://totalquality.med.br/blog/ultrassonografia-caraguatatuba",
    priority: 0.7,
    changefreq: "monthly",
  },

  "tomografia-caraguatatuba": {
    title: "Tomografia em Caraguatatuba: O que Saber | Total Quality",
    description: "Tomografia em Caraguatatuba: indicações, preparo, como funciona e segurança. Diagnóstico preciso com tecnologia de ponta.",
    keywords: "tomografia, tomografia computadorizada, diagnóstico por imagem, Caraguatatuba",
    ogTitle: "Tomografia em Caraguatatuba",
    ogDescription: "Guia completo sobre tomografia: indicações, preparo e como funciona.",
    canonical: "https://totalquality.med.br/blog/tomografia-caraguatatuba",
    priority: 0.7,
    changefreq: "monthly",
  },

  "alimentacao-e-exames-laboratoriais": {
    title: "Como a Alimentação Influencia Seus Exames | Total Quality",
    description: "Saiba como a alimentação afeta seus exames de sangue. Guia completo sobre jejum, alimentos que interferem e preparo correto para exames precisos.",
    keywords: "alimentação, exames laboratoriais, jejum, nutrição, preparo para exames",
    ogTitle: "Alimentação e Exames Laboratoriais",
    ogDescription: "Entenda como sua dieta influencia os resultados dos seus exames de sangue.",
    canonical: "https://totalquality.med.br/blog/alimentacao-e-exames-laboratoriais",
    priority: 0.7,
    changefreq: "monthly",
  },

  "vitamina-d-importancia-saude": {
    title: "Vitamina D: Deficiência é Comum? | Total Quality",
    description: "60% dos brasileiros têm deficiência de vitamina D. Saiba por que, os riscos e como manter seus níveis adequados. Dicas de especialistas.",
    keywords: "vitamina D, deficiência, saúde óssea, imunidade, bem-estar",
    ogTitle: "Vitamina D: Deficiência e Importância",
    ogDescription: "Descubra por que a deficiência de vitamina D é tão comum e como resolver.",
    canonical: "https://totalquality.med.br/blog/vitamina-d-importancia-saude",
    priority: 0.7,
    changefreq: "monthly",
  },

  "saude-do-coracao-prevencao": {
    title: "Saúde do Coração: 7 Hábitos Essenciais | Total Quality",
    description: "Doenças cardiovasculares são a principal causa de morte no Brasil. Conheça os 7 hábitos comprovados que protegem seu coração.",
    keywords: "cardiologia, saúde do coração, prevenção, eletrocardiograma",
    ogTitle: "Saúde do Coração: 7 Hábitos",
    ogDescription: "Descubra os 7 hábitos que podem salvar sua vida e proteger seu coração.",
    canonical: "https://totalquality.med.br/blog/saude-do-coracao-prevencao",
    priority: 0.7,
    changefreq: "monthly",
  },

  "exames-de-sangue-guia-completo": {
    title: "Exames de Sangue: Guia de Resultados | Total Quality",
    description: "Hemograma, glicemia, colesterol e mais — o que cada exame revela sobre sua saúde. Guia completo para entender seus resultados.",
    keywords: "exames de sangue, hemograma, glicemia, colesterol, laboratório",
    ogTitle: "Exames de Sangue: Guia Completo",
    ogDescription: "Entenda o que cada exame de sangue revela sobre sua saúde.",
    canonical: "https://totalquality.med.br/blog/exames-de-sangue-guia-completo",
    priority: 0.7,
    changefreq: "monthly",
  },

  "convenios-laboratorio-caraguatatuba": {
    title: "Convênios Aceitos em Caraguatatuba | Total Quality",
    description: "Veja os convênios aceitos no laboratório Total Quality em Caraguatatuba - SP: Cartão de Todos, Solumedi e Leader. Nos demais casos, atendimento particular.",
    keywords: "convênios, laboratório Caraguatatuba, Cartão de Todos, Solumedi, Leader",
    ogTitle: "Convênios Aceitos | Total Quality",
    ogDescription: "Confira a lista completa de convênios aceitos no laboratório.",
    canonical: "https://totalquality.med.br/blog/convenios-laboratorio-caraguatatuba",
    priority: 0.7,
    changefreq: "monthly",
  },

  "hemograma-completo-o-que-avalia": {
    title: "Hemograma Completo: O Que o Exame Avalia? | Total Quality",
    description: "Entenda o que o hemograma completo avalia, quais células são analisadas, para que serve e se o exame precisa de jejum.",
    keywords: "hemograma completo, hemograma, exame de sangue, hemácias, leucócitos, plaquetas, Caraguatatuba",
    ogTitle: "Hemograma Completo: O Que o Exame Avalia?",
    ogDescription: "Entenda quais células e parâmetros são analisados no hemograma completo.",
    ogImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/blog-checkup-preventivo-H3wYYGRF5gsNjaJi3J89XG.webp",
    canonical: "https://totalquality.med.br/blog/hemograma-completo-o-que-avalia",
    priority: 0.7,
    changefreq: "monthly",
  },

  "tomografia-computadorizada-como-funciona": {
    title: "Tomografia Computadorizada: Como Funciona? | Total Quality",
    description: "Entenda como funciona a tomografia computadorizada, como é feito o exame, quando o contraste é necessário, quanto tempo dura e se dói.",
    keywords: "tomografia computadorizada, tomografia, como funciona a tomografia, contraste, diagnóstico por imagem, Caraguatatuba",
    ogTitle: "Tomografia Computadorizada: Como Funciona?",
    ogDescription: "Entenda como é feito o exame, se dói, quanto tempo dura e quando o contraste é necessário.",
    ogImage: "https://totalquality.med.br/images/tomografia-1024.webp",
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
    ogImage: "https://totalquality.med.br/images/cardiologia-1024.webp",
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
    ogImage: "https://totalquality.med.br/images/hero-clinica-1024.webp",
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
    ogImage: "https://totalquality.med.br/images/recepcao-1024.webp",
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
    ogImage: "https://totalquality.med.br/images/tomografia-1024.webp",
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
    ogImage: "https://totalquality.med.br/images/hero-clinica-1024.webp",
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
    ogImage: "https://totalquality.med.br/images/recepcao-1024.webp",
    canonical: "https://totalquality.med.br/blog/exame-toxicologico-cnh",
    priority: 0.6,
    changefreq: "monthly",
  },

  "eletrocardiograma-o-que-e-como-e-feito": {
    title: "Eletrocardiograma (ECG): O Que É | Total Quality",
    description: "Entenda o que é o eletrocardiograma, como funciona, se dói, quanto tempo dura e em quais situações o médico costuma solicitar o exame.",
    keywords: "eletrocardiograma, ECG, o que é eletrocardiograma, exame cardiológico, saúde do coração, Caraguatatuba",
    ogTitle: "Eletrocardiograma (ECG): O Que É e Como É Feito",
    ogDescription: "Entenda como funciona o exame, se dói, quanto tempo dura e quando costuma ser solicitado.",
    ogImage: "https://totalquality.med.br/images/cardiologia-1024.webp",
    canonical: "https://totalquality.med.br/blog/eletrocardiograma-o-que-e-como-e-feito",
    priority: 0.7,
    changefreq: "monthly",
  },
};

// Rotas estáticas principais
const staticRoutes: Record<string, RouteMetadata> = {
  "/": {
    title: "Laboratório em Caraguatatuba | Total Quality | Ligue Agora",
    description: `Laboratório em Caraguatatuba com resultados em até 24h. Há ${anosDeAtuacao()} anos no Litoral Norte: exames de sangue, tomografia, ultrassom e check-up. Nota 4,5 no Google.`,
    keywords: "laboratório Caraguatatuba, exames de sangue, tomografia, ultrassom, check-up",
    ogTitle: "Total Quality Medicina Diagnóstica e Laboratorial | Exames de Sangue em Caraguatatuba - SP",
    ogDescription: "Laboratório de análises clínicas e clínica de medicina diagnóstica em Caraguatatuba - SP. Exames de sangue, hemograma, glicemia, colesterol, hormônios, tomografia, ultrassonografia, mamografia e mais de 3.000 tipos de exames. Agende pelo WhatsApp.",
    ogImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/optik-hero_756f938d.png",
    canonical: "https://totalquality.med.br/",
    priority: 1.0,
    changefreq: "weekly",
  },

  "/checkup": {
    title: "Check-up Preventivo: Planos e Preços | Total Quality",
    description: "Check-up preventivo em Caraguatatuba: planos básico, select e premium. Exames completos com resultados rápidos. Agende agora.",
    keywords: "check-up, check-up preventivo, exames preventivos, Caraguatatuba",
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

  "/laboratorio-caraguatatuba": {
    // Intencao distinta da home para evitar canibalizacao: home = "laboratório em
    // caraguatatuba" (transacional); esta pagina = "laboratório de análises clínicas".
    title: "Laboratório de Análises Clínicas | Total Quality",
    description: "Laboratório de análises clínicas em Caraguatatuba: hemograma, exames de sangue, hormônios e mais de 3.000 exames. Resultados em até 24h. Agende.",
    keywords: "laboratório Caraguatatuba, análises clínicas, exames de sangue, diagnóstico",
    ogTitle: "Laboratório de Análises Clínicas em Caraguatatuba | Total Quality",
    ogDescription: "Laboratório de análises clínicas com mais de 3.000 tipos de exames e resultados em até 24h.",
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

  // Verificar rotas de blog (/blog/:slug)
  const blogMatch = path.match(/^\/blog\/([a-z0-9\-]+)$/);
  if (blogMatch) {
    const slug = blogMatch[1];
    if (blogMetadata[slug]) {
      return blogMetadata[slug];
    }
  }

  // Rota não encontrada
  return null;
}

/**
 * Slugs de blog com metadata conhecida (usado na resolução de 404)
 */
export function getKnownBlogSlugs(): Set<string> {
  return new Set(Object.keys(blogMetadata));
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

  // Adicionar rotas de blog
  routes.push(...Object.values(blogMetadata));

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
