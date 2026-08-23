import fs from "node:fs";
import nodePath from "node:path";
/**
 * Conteúdo SEO pré-renderizado por rota.
 *
 * O site é uma SPA React: sem este módulo, o HTML inicial chega ao Google
 * com o <div id="root"> vazio e nenhum texto rastreável. Aqui geramos o
 * conteúdo real de cada página prioritária como HTML estático e o servidor
 * injeta dentro do #root antes de enviar a resposta. Quando o React monta,
 * createRoot().render() substitui esse conteúdo pela aplicação — o usuário
 * final vê a página normal, e o crawler vê o conteúdo completo no primeiro
 * rastreio, sem depender da fila de renderização de JavaScript.
 *
 * Fonte de conteúdo: client/src/lib/examesData.ts (mesmo texto exibido pelo
 * React em /exames/:slug), evitando duplicação de copy.
 */

import { examesData, type ExamData } from "../../client/src/lib/examesData";
import { linkifyText } from "../../client/src/lib/internalLinkTargets";
import blogIndex from "../../client/src/content/blog/index.json";
import { anosDeAtuacao } from "@shared/const";

type BlogPost = (typeof blogIndex)[number] & { content: string[] };

/**
 * Corpo dos artigos lido do disco: os JSONs em client/src/content/blog sao a
 * fonte unica (o cliente carrega os mesmos arquivos sob demanda).
 */
/*
 * Do source (server/_core/) o diretorio do blog esta em ../../client/...;
 * do bundle de producao (dist/index.js) esta em ../client/... — o caminho
 * unico anterior fazia TODO artigo prerenderizar sem corpo em producao
 * (o catch devolvia content: [] em silencio). Testar os dois candidatos.
 */
const BLOG_CONTENT_DIR = [
  nodePath.resolve(import.meta.dirname, "../../client/src/content/blog"),
  nodePath.resolve(import.meta.dirname, "../client/src/content/blog"),
].find((dir) => fs.existsSync(dir));

function loadBlogPostFromDisk(slug: string): BlogPost | null {
  const meta = blogIndex.find((b) => b.slug === slug);
  if (!meta) return null;
  if (!BLOG_CONTENT_DIR) {
    console.error("[seo-content] diretorio de artigos do blog nao encontrado — prerender sem corpo");
    return { ...meta, content: [] } as BlogPost;
  }
  try {
    return JSON.parse(
      fs.readFileSync(nodePath.resolve(BLOG_CONTENT_DIR, `${slug}.json`), "utf-8")
    ) as BlogPost;
  } catch {
    return { ...meta, content: [] } as BlogPost;
  }
}

const blogPosts = blogIndex;

const NAP = {
  name: "Total Quality Laboratório e Medicina Diagnóstica",
  street: "R. Padre Anchieta, 1010 – Centro",
  city: "Caraguatatuba – SP, 11660-010",
  phoneDisplay: "(12) 3887-3535",
  phoneHref: "tel:+551238873535",
  whatsappHref: "https://wa.me/551238873535",
  hours: "Segunda a sexta, das 7h30 às 18h · Sábado e domingo fechado",
};

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

const SITE = "https://totalquality.med.br";
const BUSINESS_ID = `${SITE}/#medicalbusiness`;

/**
 * Emite blocos <script type="application/ld+json"> DENTRO do conteúdo
 * pré-renderizado. JSON-LD é válido em qualquer ponto do documento — o Google
 * lê o HTML servido antes de o React montar. Assim cada rota carrega o schema
 * DELA (MedicalWebPage/FAQPage/BreadcrumbList), em vez de todas as rotas
 * repetirem o FAQPage genérico da home, como acontecia com o bloco estático do
 * index.html (schema duplicado/conflitante nas páginas de exame).
 */
function jsonLd(objects: object[]): string {
  return objects
    .map(
      (obj) =>
        // `<` escapado: impede que um "</script>" em texto quebre o bloco.
        `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`
    )
    .join("\n");
}

type Faq = { q: string; a: string };

function faqPageLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

function breadcrumbLd(items: Array<[string, string]>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, url], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${SITE}${url}`,
    })),
  };
}

/** Seção visível de FAQ + schema FAQPage, gerados da MESMA fonte. */
function faqSectionHtml(faqs: Faq[]): string {
  const visible = faqs
    .map((faq) => `<h3>${escapeHtml(faq.q)}</h3><p>${escapeHtml(faq.a)}</p>`)
    .join("");
  return `<h2>Perguntas frequentes</h2>${visible}${jsonLd([faqPageLd(faqs)])}`;
}

function napHtml(ctaMessage: string): string {
  return `
    <h2>Onde fazer em Caraguatatuba</h2>
    <address>
      <strong>${escapeHtml(NAP.name)}</strong><br />
      ${escapeHtml(NAP.street)}<br />
      ${escapeHtml(NAP.city)}<br />
      Telefone: <a href="${NAP.phoneHref}">${escapeHtml(NAP.phoneDisplay)}</a> ·
      <a href="${NAP.whatsappHref}">Agende pelo WhatsApp</a><br />
      Horário de atendimento: ${escapeHtml(NAP.hours)}
    </address>
    <p>${escapeHtml(ctaMessage)}</p>`;
}

function internalLinksHtml(currentPath: string): string {
  const links: Array<[string, string]> = [
    ["/laboratorio-caraguatatuba", "Laboratório de análises clínicas"],
    ["/exames/exames-de-sangue", "Exames de sangue"],
    ["/exames/tomografia-computadorizada", "Tomografia computadorizada"],
    ["/exames/ultrassonografia", "Ultrassonografia"],
    ["/exames/mapa", "MAPA 24h"],
    ["/exames/holter", "Holter 24h"],
    ["/exames/exame-toxicologico", "Exame toxicológico"],
    ["/exames/espirometria", "Espirometria"],
    ["/bioimpedancia", "Bioimpedância"],
    ["/checkup", "Check-up preventivo"],
    // Estas duas o Google conhecia mas nunca rastreou (auditoria do Search
    // Console): recebiam pouquissimos links internos.
    ["/exames/eletrocardiograma", "Eletrocardiograma (ECG)"],
    ["/blog", "Blog: saúde e diagnóstico"],
  ];
  const items = links
    .filter(([href]) => href !== currentPath)
    .map(([href, label]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`)
    .join("");
  return `<h2>Outros exames na Total Quality</h2><ul>${items}</ul>`;
}

function renderExamHtml(exam: ExamData): string {
  const h1 = exam.metaTitle.split("|")[0].trim();
  const canonical = `${SITE}/exames/${exam.slug}`;
  const indications = exam.indications
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const preparations = exam.preparations
    .map((prep) => `<li>${escapeHtml(prep.text)}</li>`)
    .join("");

  // Schema proprio da pagina de exame: MedicalWebPage sobre um MedicalTest,
  // ancorado na mesma entidade canonica do index.html (#medicalbusiness) para
  // nao criar entidade duplicada, mais o breadcrumb ate o hub /exames.
  const pageLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: exam.metaTitle,
    description: exam.metaDescription,
    about: {
      "@type": "MedicalTest",
      name: exam.shortTitle,
      description: exam.whatIs,
    },
    provider: { "@id": BUSINESS_ID },
  };

  return `
    <h1>${escapeHtml(h1)}</h1>
    <p>${escapeHtml(exam.heroDescription)}</p>
    <h2>O que é</h2>
    <p>${escapeHtml(exam.whatIs)}</p>
    <h2>Como funciona</h2>
    <p>${escapeHtml(exam.howItWorks)}</p>
    <h2>Indicações</h2>
    <ul>${indications}</ul>
    <h2>Preparo para o exame</h2>
    <ul>${preparations}</ul>
    ${faqSectionHtml(exam.faqs)}
    ${napHtml(
      exam.category === "laboratorio"
        ? `Faça seu exame de ${exam.shortTitle.toLowerCase()} sem agendamento: a coleta é por ordem de chegada, de segunda a sexta, das 7h30 às 18h. Dúvidas de preparo e convênio pelo WhatsApp.`
        : `Agende seu exame de ${exam.shortTitle.toLowerCase()} pelo WhatsApp ou telefone e faça em um só lugar todos os seus exames laboratoriais e de imagem.`
    )}
    ${internalLinksHtml(`/exames/${exam.slug}`)}
    ${jsonLd([
      pageLd,
      breadcrumbLd([
        ["Início", "/"],
        ["Exames", "/exames"],
        [exam.shortTitle, `/exames/${exam.slug}`],
      ]),
    ])}`;
}

const laboratorioHtml = `
    <h1>Laboratório de Análises Clínicas em Caraguatatuba</h1>
    <p>A Total Quality é um laboratório de análises clínicas e clínica de medicina diagnóstica em Caraguatatuba – SP, com mais de ${anosDeAtuacao()} anos de atuação no Litoral Norte. Realizamos mais de 3.000 tipos de exames laboratoriais e de imagem em um só lugar, com equipamentos automatizados de alta precisão, equipe especializada e resultados disponíveis online.</p>
    <h2>Exames laboratoriais realizados</h2>
    <ul>
      <li><a href="/exames/hemograma">Hemograma completo</a> e <a href="/exames/exames-de-sangue">exames de sangue</a> em geral</li>
      <li>Glicemia, hemoglobina glicada e curva glicêmica</li>
      <li>Colesterol total e frações, triglicerídeos (perfil lipídico)</li>
      <li>Hormônios: TSH, T4 livre, testosterona, estradiol e outros</li>
      <li><a href="/blog/vitamina-d-importancia-saude">Vitamina D</a>, vitamina B12 e ferritina</li>
      <li>PSA e marcadores tumorais</li>
      <li>Exames de urina e fezes</li>
      <li>Sorologias e <a href="/exames/exame-toxicologico">exames toxicológicos</a></li>
      <li><a href="/exames/exame-admissional">Exames ocupacionais</a> (admissional, periódico, demissional e ASO)</li>
    </ul>
    <h2>Exames de imagem e cardiológicos</h2>
    <ul>
      <li><a href="/exames/tomografia-computadorizada">Tomografia computadorizada multislice</a></li>
      <li><a href="/exames/ultrassonografia">Ultrassonografia geral e com Doppler</a></li>
      <li><a href="/exames/mamografia">Mamografia digital</a></li>
      <li><a href="/exames/raio-x">Raio-X digital</a></li>
      <li><a href="/exames/eletrocardiograma">Eletrocardiograma</a>, <a href="/exames/holter">Holter 24h</a> e <a href="/exames/mapa">MAPA 24h</a></li>
      <li><a href="/exames/eletroencefalograma">Eletroencefalograma</a></li>
      <li><a href="/exames/espirometria">Espirometria</a> e <a href="/bioimpedancia">bioimpedância</a></li>
    </ul>
    <h2>Por que escolher a Total Quality</h2>
    <ul>
      <li>Mais de ${anosDeAtuacao()} anos de experiência em Caraguatatuba</li>
      <li>Mais de 340 avaliações no Google com nota 4,5</li>
      <li>Coleta rápida, ambiente confortável e estacionamento no Centro</li>
      <li>Resultados online em até 24 horas para a maioria dos exames</li>
      <li>Atendimento particular, convênios e empresas de Caraguatatuba, Ubatuba, São Sebastião e Ilhabela</li>
    </ul>
    <h2>Perguntas frequentes</h2>
    <h3>Preciso agendar para fazer exames de sangue?</h3>
    <p>Para a maioria dos exames laboratoriais não é necessário agendamento: basta comparecer com o pedido médico e documento com foto. Veja as <a href="/blog/alimentacao-e-exames-laboratoriais">orientações de preparo e jejum</a> antes de vir. Exames de imagem e procedimentos especiais podem ser agendados pelo WhatsApp.</p>
    <h3>Quais convênios são aceitos?</h3>
    <p>Atendemos os principais convênios e planos de saúde da região, além de atendimento particular. Veja a <a href="/convenios">lista completa de convênios aceitos</a> ou consulte seu plano pelo WhatsApp (12) 3887-3535.</p>
    <h3>Em quanto tempo sai o resultado?</h3>
    <p>A maioria dos exames de sangue fica pronta em até 24 horas, com resultados disponíveis online. Exames específicos podem levar até 7 dias úteis.</p>
    <h3>Vocês fazem coleta domiciliar?</h3>
    <p>Sim. Realizamos coleta domiciliar de <a href="/exames/exames-de-sangue">exames laboratoriais</a> em Caraguatatuba. Agende pelo WhatsApp (12) 3887-3535 para confirmar disponibilidade, horários e valores.</p>
    ${napHtml("Venha fazer seus exames laboratoriais no Centro de Caraguatatuba, a poucos minutos da Praça Cândido Mota.")}
    ${internalLinksHtml("/laboratorio-caraguatatuba")}
    ${jsonLd([
      {
        "@context": "https://schema.org",
        "@type": "MedicalWebPage",
        "@id": `${SITE}/laboratorio-caraguatatuba#webpage`,
        url: `${SITE}/laboratorio-caraguatatuba`,
        name: "Laboratório de Análises Clínicas em Caraguatatuba | Total Quality",
        description:
          "Laboratório de análises clínicas em Caraguatatuba: hemograma, exames de sangue, hormônios e mais de 3.000 exames. Resultados em até 24h.",
        about: { "@id": BUSINESS_ID },
        provider: { "@id": BUSINESS_ID },
      },
      faqPageLd([
        {
          q: "Preciso agendar para fazer exames de sangue?",
          a: "Para a maioria dos exames laboratoriais não é necessário agendamento: basta comparecer com o pedido médico e documento com foto, de segunda a sexta das 7h30 às 18h. Exames de imagem e procedimentos especiais podem ser agendados pelo WhatsApp (12) 3887-3535.",
        },
        {
          q: "Quais convênios são aceitos?",
          a: "Atendemos os principais convênios e planos de saúde da região, além de atendimento particular. Consulte seu plano pelo WhatsApp (12) 3887-3535.",
        },
        {
          q: "Em quanto tempo sai o resultado?",
          a: "A maioria dos exames de sangue fica pronta em até 24 horas, com resultados disponíveis online. Exames específicos podem levar até 7 dias úteis.",
        },
        {
          q: "Vocês fazem coleta domiciliar?",
          a: "Sim. Realizamos coleta domiciliar de exames laboratoriais em Caraguatatuba. Agende pelo WhatsApp (12) 3887-3535 para confirmar disponibilidade, horários e valores.",
        },
      ]),
      breadcrumbLd([
        ["Início", "/"],
        ["Laboratório em Caraguatatuba", "/laboratorio-caraguatatuba"],
      ]),
    ])}`;

const bioimpedanciaHtml = `
    <h1>Bioimpedância em Caraguatatuba</h1>
    <p>A bioimpedância é um exame rápido e não invasivo que analisa a composição corporal: percentual de gordura, massa muscular, água corporal e taxa metabólica. Na Total Quality, o exame é realizado com equipamento profissional e laudo completo para acompanhamento nutricional, esportivo e clínico.</p>
    <h2>O que o exame avalia</h2>
    <ul>
      <li>Percentual de gordura corporal e gordura visceral</li>
      <li>Massa muscular esquelética</li>
      <li>Água corporal total</li>
      <li>Taxa metabólica basal</li>
      <li>Idade metabólica</li>
    </ul>
    <h2>Preparo para o exame</h2>
    <ul>
      <li>Jejum de 4 horas antes do exame</li>
      <li>Não praticar exercícios físicos intensos nas 12 horas anteriores</li>
      <li>Evitar álcool e cafeína nas 24 horas anteriores</li>
      <li>Estar bem hidratado no dia anterior</li>
    </ul>
    <h2>Perguntas frequentes</h2>
    <h3>Quanto tempo dura o exame de bioimpedância?</h3>
    <p>O exame dura poucos minutos e o resultado sai na hora, com laudo detalhado da composição corporal.</p>
    <h3>Preciso de pedido médico?</h3>
    <p>Não é obrigatório: a bioimpedância pode ser feita por indicação médica, nutricional ou por interesse próprio no acompanhamento da saúde.</p>
    ${napHtml("Agende sua bioimpedância pelo WhatsApp e acompanhe sua composição corporal com precisão.")}
    ${internalLinksHtml("/bioimpedancia")}`;

/**
 * Pagina /convenios: "aceita meu convenio?" e o principal desempate local
 * entre laboratorios (lacuna verificada na auditoria de 01/08: as queries
 * transacionais de convenio caiam num post de blog). Esta pagina e o destino
 * transacional; o post /blog/convenios-laboratorio-caraguatatuba segue como
 * informacional.
 *
 * A lista vive tambem em client/src/lib/conveniosData.ts (o client nao pode
 * importar deste modulo, que usa node:fs). Ao mudar um convenio, mudar NOS
 * DOIS — o teste de paridade em seo-content.test.ts compara as duas listas.
 */
export const CONVENIOS = [
  "Unimed", "Bradesco Saúde", "SulAmérica", "Amil", "Porto Seguro Saúde",
  "NotreDame Intermédica", "Hapvida", "Cassi", "Geap", "Postal Saúde",
  "Economus", "Funasa",
];

const CONVENIOS_FAQS: Faq[] = [
  {
    q: "Meu convênio cobre exame de sangue e exames laboratoriais?",
    a: "Pela regulamentação da ANS, os planos de saúde cobrem os exames do Rol de Procedimentos, o que inclui a grande maioria dos exames laboratoriais de rotina (hemograma, glicemia, colesterol, hormônios) e exames de imagem como tomografia, ultrassonografia e mamografia. Confirme a cobertura do seu plano pelo WhatsApp (12) 3887-3535.",
  },
  {
    q: "Preciso de autorização prévia do convênio?",
    a: "Alguns convênios exigem autorização prévia para exames de maior complexidade, como tomografia. Nossa equipe orienta sobre a necessidade de autorização para o seu caso no momento do agendamento.",
  },
  {
    q: "O que preciso levar para usar o convênio?",
    a: "Carteirinha do plano de saúde atualizada, documento de identidade com foto e o pedido médico original.",
  },
  {
    q: "E se eu não tiver convênio?",
    a: "Atendemos particular com valores acessíveis e pagamento em dinheiro, cartão de crédito, débito ou PIX. Há condições especiais para check-ups e pacotes de exames.",
  },
];

function conveniosHtml(): string {
  const lista = CONVENIOS.map((c) => `<li>${escapeHtml(c)}</li>`).join("");
  return `
    <h1>Convênios Aceitos no Laboratório em Caraguatatuba</h1>
    <p>A Total Quality Medicina Diagnóstica aceita os principais convênios e planos de saúde em Caraguatatuba – SP, para <a href="/exames/exames-de-sangue">exames de sangue</a>, <a href="/laboratorio-caraguatatuba">exames laboratoriais</a>, <a href="/exames/tomografia-computadorizada">tomografia</a>, <a href="/exames/ultrassonografia">ultrassonografia</a>, <a href="/exames/mamografia">mamografia</a> e <a href="/checkup">check-up</a>.</p>
    <h2>Planos de saúde atendidos</h2>
    <ul>${lista}<li>Outros planos regionais e nacionais — consulte o seu</li></ul>
    <p>A lista é atualizada periodicamente. Confirme a aceitação do seu plano pelo WhatsApp <a href="${NAP.whatsappHref}">(12) 3887-3535</a> antes de agendar.</p>
    ${faqSectionHtml(CONVENIOS_FAQS)}
    ${napHtml("Confirme seu convênio pelo WhatsApp — a coleta laboratorial é sem agendamento, por ordem de chegada, de segunda a sexta, das 7h30 às 18h; exames de imagem com hora marcada.")}
    ${internalLinksHtml("/convenios")}
    ${jsonLd([
      breadcrumbLd([
        ["Início", "/"],
        ["Convênios", "/convenios"],
      ]),
    ])}`;
}

const homeHtml = `
    <h1>Laboratório em Caraguatatuba — Total Quality Medicina Diagnóstica</h1>
    <p>Há mais de ${anosDeAtuacao()} anos no Litoral Norte, a Total Quality reúne em um só lugar <a href="/laboratorio-caraguatatuba">laboratório de análises clínicas</a> e centro de diagnóstico por imagem em Caraguatatuba – SP: mais de 3.000 tipos de <a href="/exames/exames-de-sangue">exames de sangue</a>, <a href="/exames/tomografia-computadorizada">tomografia computadorizada</a>, <a href="/exames/ultrassonografia">ultrassonografia com Doppler</a>, <a href="/exames/mamografia">mamografia digital</a>, <a href="/exames/raio-x">raio-X</a>, <a href="/exames/mapa">MAPA</a>, <a href="/exames/holter">Holter 24h</a>, <a href="/exames/eletrocardiograma">eletrocardiograma</a>, <a href="/exames/eletroencefalograma">eletroencefalograma</a>, <a href="/exames/espirometria">espirometria</a>, <a href="/exames/exame-toxicologico">exame toxicológico</a>, <a href="/bioimpedancia">bioimpedância</a>, <a href="/checkup">check-up preventivo</a> e <a href="/exames/exame-admissional">medicina ocupacional</a>.</p>
    <ul>
      <li>Resultados online em até 24 horas para a maioria dos exames</li>
      <li>Coleta laboratorial sem agendamento, por ordem de chegada — e coleta domiciliar mediante agendamento</li>
      <li>Equipamentos modernos e equipe especializada</li>
      <li>Atendimento particular, convênios e empresas</li>
      <li>Mais de 340 avaliações no Google com nota 4,5</li>
    </ul>
    ${faqSectionHtml([
      {
        q: "Quais exames são realizados no laboratório em Caraguatatuba?",
        a: "A Total Quality realiza mais de 3.000 tipos de exames em Caraguatatuba - SP, incluindo exames de sangue (hemograma, glicemia, colesterol, hormônios), tomografia computadorizada, ultrassonografia, mamografia digital, raio-X, eletrocardiograma, holter 24h, MAPA, bioimpedância e check-up preventivo.",
      },
      {
        q: "Qual o endereço do laboratório em Caraguatatuba?",
        a: "O laboratório Total Quality está localizado na R. Padre Anchieta, 1010 - Centro, Caraguatatuba - SP. Funcionamento de segunda a sexta, das 07h30 às 18h.",
      },
      {
        q: "Como agendar exames no laboratório em Caraguatatuba?",
        a: "Exames laboratoriais e de sangue não precisam de agendamento: o atendimento é por ordem de chegada, de segunda a sexta, das 07h30 às 18h. Exames de imagem e procedimentos especiais podem ser agendados pelo WhatsApp ou telefone (12) 3887-3535, ou pelo site totalquality.med.br.",
      },
      {
        q: "O laboratório em Caraguatatuba aceita convênios?",
        a: "Sim, o laboratório Total Quality em Caraguatatuba aceita diversos convênios de saúde. Entre em contato pelo WhatsApp para verificar se seu plano é aceito.",
      },
    ])}
    ${napHtml("Agende seus exames pelo WhatsApp (12) 3887-3535 ou visite-nos no Centro de Caraguatatuba.")}
    ${internalLinksHtml("/")}`;

/**
 * Retorna o HTML SEO da rota, ou null para rotas sem pré-renderização.
 */
export function getSeoContentForPath(pathname: string): string | null {
  const path = pathname.split("?")[0].replace(/\/$/, "") || "/";

  if (path === "/") return wrap(homeHtml);
  if (path === "/laboratorio-caraguatatuba") return wrap(laboratorioHtml);
  if (path === "/bioimpedancia") return wrap(bioimpedanciaHtml);

  if (path === "/privacidade") return wrap(privacidadeHtml);
  if (path === "/checkup") return wrap(checkupHtml);
  if (path === "/convenios") return wrap(conveniosHtml());
  if (path === "/exames") return wrap(examesHubHtml());

  const examMatch = path.match(/^\/exames\/([a-z0-9\-]+)$/);
  if (examMatch) {
    const exam = examesData.find((e) => e.slug === examMatch[1]);
    if (exam) return wrap(renderExamHtml(exam));
  }

  if (path === "/blog") return wrap(blogIndexHtml());

  const blogMatch = path.match(/^\/blog\/([a-z0-9\-]+)$/);
  if (blogMatch) {
    const post = loadBlogPostFromDisk(blogMatch[1]);
    if (post) return wrap(renderBlogHtml(post));
  }

  return null;
}

const privacidadeHtml = `
    <h1>Política de Privacidade</h1>
    <p>A Total Quality Medicina Diagnóstica trata dados pessoais e dados de saúde conforme a LGPD — Lei Geral de Proteção de Dados (Lei 13.709/2018). Esta página explica quais dados coletamos, como usamos, por quanto tempo guardamos e como você exerce seus direitos.</p>
    <h2>Quais dados coletamos</h2>
    <ul>
      <li>Dados de contato informados no formulário do site ou pelo WhatsApp: nome, telefone, e-mail e exame de interesse.</li>
      <li>Dados de navegação: páginas visitadas, origem do acesso e dispositivo, por meio de cookies e ferramentas de análise.</li>
      <li>Dados de saúde: coletados apenas no atendimento presencial. O site não coleta nem armazena resultados de exames.</li>
    </ul>
    <h2>Dados de saúde e sigilo profissional</h2>
    <p>Resultados de exames são dados pessoais sensíveis, protegidos pelo sigilo profissional, e entregues somente ao paciente, ao seu representante legal ou ao médico solicitante, mediante identificação.</p>
    <h2>Seus direitos</h2>
    <p>Você pode confirmar a existência de tratamento, acessar, corrigir, anonimizar ou excluir seus dados, revogar consentimento e solicitar portabilidade. Para exercer qualquer desses direitos, fale com a gente pelo telefone (12) 3887-3535 ou pelo e-mail contato@totalquality.med.br.</p>
    ${napHtml("Dúvidas sobre o tratamento dos seus dados? Fale com a nossa equipe.")}`;

const checkupHtml = `
    <h1>Check-up Preventivo em Caraguatatuba</h1>
    <p>O check-up preventivo da Total Quality reúne exames laboratoriais, cardiológicos e de imagem em pacotes por faixa etária — Básico, Select e Premium — realizados em um só lugar, no Centro de Caraguatatuba, com resultados rápidos e orientação da nossa equipe.</p>
    <h2>O que os pacotes incluem</h2>
    <ul>
      <li>Exames de sangue: hemograma completo, glicemia, perfil lipídico (colesterol e triglicerídeos), função renal e hepática</li>
      <li>Hormônios: TSH e T4 livre para avaliação da tireoide</li>
      <li>Vitamina D e vitamina B12</li>
      <li>Avaliação cardiológica: <a href="/exames/eletrocardiograma">eletrocardiograma</a> e, conforme o pacote, <a href="/exames/holter">Holter 24h</a> ou <a href="/exames/mapa">MAPA 24h</a></li>
      <li>PSA para homens e exames específicos por faixa etária</li>
      <li>Exame de urina e outros conforme o pacote escolhido</li>
    </ul>
    <h2>Para quem é indicado</h2>
    <ul>
      <li>Adultos de 20 a 35 anos: check-up a cada dois anos</li>
      <li>A partir dos 40 anos: check-up anual com marcadores adicionais</li>
      <li>A partir dos 50 anos: protocolo ampliado com rastreamentos específicos</li>
    </ul>
    <h2>Perguntas frequentes</h2>
    <h3>Preciso de pedido médico para fazer check-up?</h3>
    <p>Para os pacotes de check-up da Total Quality não é necessário pedido médico — nossa equipe orienta o pacote mais adequado ao seu perfil e histórico.</p>
    <h3>Quanto tempo demoram os resultados?</h3>
    <p>A maioria dos exames laboratoriais fica pronta em até 24 horas, com acesso online. Exames de imagem têm laudo rápido, geralmente em poucos dias.</p>
    ${napHtml("Invista na sua saúde: agende seu check-up preventivo pelo WhatsApp e faça tudo em uma única visita.")}
    ${internalLinksHtml("/checkup")}`;

function examesHubHtml(): string {
  const categorias: Array<[string, string]> = [
    ["laboratorio", "Exames laboratoriais e análises clínicas"],
    ["imagem", "Diagnóstico por imagem"],
    ["cardiologia", "Exames cardiológicos"],
    ["neurologia", "Neurologia"],
    ["outros", "Medicina ocupacional e outros"],
  ];
  const sections = categorias
    .map(([cat, label]) => {
      const items = examesData
        .filter((e) => e.category === cat)
        .map((e) => `<li><a href="/exames/${e.slug}">${escapeHtml(e.shortTitle)}</a> — ${escapeHtml(e.description)}</li>`)
        .join("");
      return items ? `<h2>${escapeHtml(label)}</h2><ul>${items}</ul>` : "";
    })
    .join("");
  return `
    <h1>Exames Laboratoriais e de Imagem em Caraguatatuba</h1>
    <p>A Total Quality reúne em um só endereço, no Centro de Caraguatatuba, mais de 3.000 tipos de exames laboratoriais, exames de imagem, cardiológicos e ocupacionais — com resultados online em até 24 horas para a maioria dos exames laboratoriais e equipe especializada há mais de ${anosDeAtuacao()} anos no Litoral Norte.</p>
    ${sections}
    <p><a href="/bioimpedancia">Bioimpedância</a> — análise completa de composição corporal.</p>
    <p><a href="/checkup">Check-up preventivo</a> — pacotes completos por faixa etária.</p>
    ${napHtml("Não encontrou o exame que procura? Fale com a gente pelo WhatsApp — realizamos mais de 3.000 tipos de exames.")}`;
}

function blogIndexHtml(): string {
  const items = blogPosts
    .map((b) => `<li><a href="/blog/${b.slug}">${escapeHtml(b.title)}</a> — ${escapeHtml(b.excerpt)}</li>`)
    .join("");
  return `
    <h1>Blog Total Quality — Saúde e Diagnóstico</h1>
    <p>Artigos escritos pela equipe da Total Quality Medicina Diagnóstica sobre exames, prevenção e saúde no Litoral Norte.</p>
    <ul>${items}</ul>
    ${internalLinksHtml("/blog")}`;
}

function renderBlogHtml(post: BlogPost): string {
  // Linkagem interna automática: o corpo dos artigos não tinha NENHUM link —
  // a camada informacional não repassava autoridade às páginas estratégicas.
  // Mapa e regras em client/src/lib/internalLinkTargets.ts (fonte única,
  // compartilhada com o BlogPost.tsx).
  const usedHrefs = new Set<string>();
  const currentPath = `/blog/${post.slug}`;
  const paragraphs = post.content
    .map((par) => {
      const spans = linkifyText(par, currentPath, usedHrefs);
      const html = spans
        .map((s) => (s.href ? `<a href="${s.href}">${escapeHtml(s.text)}</a>` : escapeHtml(s.text)))
        .join("");
      return `<p>${html}</p>`;
    })
    .join("");
  return `
    <article>
      <h1>${escapeHtml(post.title)}</h1>
      <p><em>${escapeHtml(post.subtitle)}</em></p>
      <p>${escapeHtml(post.author)} · ${escapeHtml(post.authorRole)} · ${escapeHtml(post.date)} · ${escapeHtml(post.readTime)} de leitura</p>
      ${paragraphs}
    </article>
    ${napHtml("Precisa fazer seus exames? Agende pelo WhatsApp e tenha resultados online em até 24 horas.")}
    ${internalLinksHtml("/blog/" + post.slug)}`;
}

function wrap(inner: string): string {
  // Markup semântico simples; o React substitui este bloco ao montar.
  return `<main class="seo-prerender">${inner}</main>`;
}

/**
 * Injeta o conteúdo SEO dentro do <div id="root"> do HTML.
 */
export function injectSeoContent(html: string, content: string): string {
  return html.replace(
    /(<div id="root">)(\s*)(<\/div>)/,
    (_m, open, _ws, close) => `${open}${content}${close}`
  );
}

// Rotas exatas registradas no router do cliente (App.tsx)
const CLIENT_ROUTES = new Set([
  "/",
  "/exames",
  "/checkup",
  "/convenios",
  "/privacidade",
  "/bioimpedancia",
  "/blog",
  "/laboratorio-caraguatatuba",
  "/ligar",
  "/obrigado-chamada",
  "/formulario-sucesso",
  "/cartao",
  "/404",
]);

const VALID_EXAM_SLUGS = new Set(examesData.map((exam) => exam.slug));

/**
 * Resolve o status HTTP correto para uma rota de página.
 *
 * Antes, qualquer URL devolvia 200 com a homepage (soft-404). Agora:
 * - rotas conhecidas → 200
 * - /exames/:slug ou /blog/:slug desconhecidos → 404
 * - caminhos profundos sem correspondência → 404
 * - slugs de primeiro nível desconhecidos → 200 (artigos dinâmicos do
 *   AutoSEO são servidos pelo catch-all /:slug do cliente)
 */
export function resolveHttpStatus(
  pathname: string,
  knownBlogSlugs: Set<string>
): number {
  const path = pathname.split("?")[0].replace(/\/$/, "") || "/";

  // Rotas do painel administrativo removido: 404 explicito, senao caem na regra
  // de slug de primeiro nivel (artigos AutoSEO) e voltariam 200.
  if (path === "/admin" || path.startsWith("/admin/") || path === "/dashboard") {
    return 404;
  }

  if (CLIENT_ROUTES.has(path)) return 200;

  const examMatch = path.match(/^\/exames\/([a-z0-9\-]+)$/);
  if (examMatch) return VALID_EXAM_SLUGS.has(examMatch[1]) ? 200 : 404;

  const blogMatch = path.match(/^\/blog\/([a-z0-9\-]+)$/);
  if (blogMatch) return knownBlogSlugs.has(blogMatch[1]) ? 200 : 404;

  // Slug de primeiro nível: pode ser artigo AutoSEO dinâmico
  if (/^\/[a-z0-9\-]+$/i.test(path)) return 200;

  return 404;
}
