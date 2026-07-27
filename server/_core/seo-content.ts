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
import blogIndex from "../../client/src/content/blog/index.json";

type BlogPost = (typeof blogIndex)[number] & { content: string[] };

/**
 * Corpo dos artigos lido do disco: os JSONs em client/src/content/blog sao a
 * fonte unica (o cliente carrega os mesmos arquivos sob demanda).
 */
function loadBlogPostFromDisk(slug: string): BlogPost | null {
  const meta = blogIndex.find((b) => b.slug === slug);
  if (!meta) return null;
  const file = nodePath.resolve(
    import.meta.dirname,
    "../../client/src/content/blog",
    `${slug}.json`
  );
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as BlogPost;
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
  hours: "Segunda a quinta das 7h30 às 18h · Sexta das 7h30 às 17h30",
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
  ];
  const items = links
    .filter(([href]) => href !== currentPath)
    .map(([href, label]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`)
    .join("");
  return `<h2>Outros exames na Total Quality</h2><ul>${items}</ul>`;
}

function renderExamHtml(exam: ExamData): string {
  const h1 = exam.metaTitle.split("|")[0].trim();
  const indications = exam.indications
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const preparations = exam.preparations
    .map((prep) => `<li>${escapeHtml(prep.text)}</li>`)
    .join("");
  const faqs = exam.faqs
    .map(
      (faq) =>
        `<h3>${escapeHtml(faq.q)}</h3><p>${escapeHtml(faq.a)}</p>`
    )
    .join("");

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
    <h2>Perguntas frequentes</h2>
    ${faqs}
    ${napHtml(`Agende seu exame de ${exam.shortTitle.toLowerCase()} pelo WhatsApp ou telefone e faça em um só lugar todos os seus exames laboratoriais e de imagem.`)}
    ${internalLinksHtml(`/exames/${exam.slug}`)}`;
}

const laboratorioHtml = `
    <h1>Laboratório de Análises Clínicas em Caraguatatuba</h1>
    <p>A Total Quality é um laboratório de análises clínicas e clínica de medicina diagnóstica em Caraguatatuba – SP, com mais de 23 anos de atuação no Litoral Norte. Realizamos mais de 3.000 tipos de exames laboratoriais e de imagem em um só lugar, com equipamentos automatizados de alta precisão, equipe especializada e resultados disponíveis online.</p>
    <h2>Exames laboratoriais realizados</h2>
    <ul>
      <li>Hemograma completo e exames de sangue em geral</li>
      <li>Glicemia, hemoglobina glicada e curva glicêmica</li>
      <li>Colesterol total e frações, triglicerídeos (perfil lipídico)</li>
      <li>Hormônios: TSH, T4 livre, testosterona, estradiol e outros</li>
      <li>Vitamina D, vitamina B12 e ferritina</li>
      <li>PSA e marcadores tumorais</li>
      <li>Exames de urina e fezes</li>
      <li>Sorologias e exames toxicológicos</li>
      <li>Exames ocupacionais (admissional, periódico, demissional e ASO)</li>
    </ul>
    <h2>Por que escolher a Total Quality</h2>
    <ul>
      <li>Mais de 23 anos de experiência em Caraguatatuba</li>
      <li>Mais de 340 avaliações no Google com nota 4,5</li>
      <li>Coleta rápida, ambiente confortável e estacionamento no Centro</li>
      <li>Resultados online em até 24 horas para a maioria dos exames</li>
      <li>Atendimento particular, convênios e empresas de Caraguatatuba, Ubatuba, São Sebastião e Ilhabela</li>
    </ul>
    <h2>Perguntas frequentes</h2>
    <h3>Preciso agendar para fazer exames de sangue?</h3>
    <p>Para a maioria dos exames laboratoriais não é necessário agendamento: basta comparecer com o pedido médico e documento com foto. Exames de imagem e procedimentos especiais podem ser agendados pelo WhatsApp.</p>
    <h3>Quais convênios são aceitos?</h3>
    <p>Atendemos os principais convênios e planos de saúde da região, além de atendimento particular. Consulte seu convênio pelo WhatsApp (12) 3887-3535.</p>
    <h3>Em quanto tempo sai o resultado?</h3>
    <p>A maioria dos exames de sangue fica pronta em até 24 horas, com resultados disponíveis online. Exames específicos podem levar até 7 dias úteis.</p>
    ${napHtml("Venha fazer seus exames laboratoriais no Centro de Caraguatatuba, a poucos minutos da Praça Cândido Mota.")}
    ${internalLinksHtml("/laboratorio-caraguatatuba")}`;

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

const homeHtml = `
    <h1>Laboratório de Análises Clínicas e Medicina Diagnóstica em Caraguatatuba</h1>
    <p>Há mais de 23 anos no Litoral Norte, a Total Quality reúne em um só lugar laboratório de análises clínicas e centro de diagnóstico por imagem em Caraguatatuba – SP: mais de 3.000 tipos de exames de sangue, tomografia computadorizada, ultrassonografia com Doppler, mamografia digital, raio-X, MAPA, Holter 24h, espirometria, exame toxicológico, bioimpedância, check-up preventivo e medicina ocupacional.</p>
    <ul>
      <li>Resultados online em até 24 horas para a maioria dos exames</li>
      <li>Equipamentos modernos e equipe especializada</li>
      <li>Atendimento particular, convênios e empresas</li>
      <li>Mais de 340 avaliações no Google com nota 4,5</li>
    </ul>
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

  if (path === "/checkup") return wrap(checkupHtml);
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

const checkupHtml = `
    <h1>Check-up Preventivo em Caraguatatuba</h1>
    <p>O check-up preventivo da Total Quality reúne exames laboratoriais, cardiológicos e de imagem em pacotes por faixa etária — Básico, Select e Premium — realizados em um só lugar, no Centro de Caraguatatuba, com resultados rápidos e orientação da nossa equipe.</p>
    <h2>O que os pacotes incluem</h2>
    <ul>
      <li>Exames de sangue: hemograma completo, glicemia, perfil lipídico (colesterol e triglicerídeos), função renal e hepática</li>
      <li>Hormônios: TSH e T4 livre para avaliação da tireoide</li>
      <li>Vitamina D e vitamina B12</li>
      <li>Avaliação cardiológica: eletrocardiograma e, nos pacotes completos, ecocardiograma</li>
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
    <p>A Total Quality reúne em um só endereço, no Centro de Caraguatatuba, mais de 3.000 tipos de exames laboratoriais, exames de imagem, cardiológicos e ocupacionais — com resultados online em até 24 horas para a maioria dos exames laboratoriais e equipe especializada há mais de 23 anos no Litoral Norte.</p>
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
  const paragraphs = post.content.map((par) => `<p>${escapeHtml(par)}</p>`).join("");
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
