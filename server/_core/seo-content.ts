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

// Rotas de exames priorizadas para pré-renderização
const PRIORITY_EXAM_SLUGS = [
  "exames-de-sangue",
  "tomografia-computadorizada",
  "ultrassonografia",
  "mapa",
  "holter",
  "exame-toxicologico",
  "espirometria",
];

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

  const examMatch = path.match(/^\/exames\/([a-z0-9\-]+)$/);
  if (examMatch && PRIORITY_EXAM_SLUGS.includes(examMatch[1])) {
    const exam = examesData.find((e) => e.slug === examMatch[1]);
    if (exam) return wrap(renderExamHtml(exam));
  }

  return null;
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
  "/checkup",
  "/bioimpedancia",
  "/blog",
  "/dashboard",
  "/laboratorio-caraguatatuba",
  "/admin",
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

  if (CLIENT_ROUTES.has(path)) return 200;
  if (path.startsWith("/admin/")) return 200;

  const examMatch = path.match(/^\/exames\/([a-z0-9\-]+)$/);
  if (examMatch) return VALID_EXAM_SLUGS.has(examMatch[1]) ? 200 : 404;

  const blogMatch = path.match(/^\/blog\/([a-z0-9\-]+)$/);
  if (blogMatch) return knownBlogSlugs.has(blogMatch[1]) ? 200 : 404;

  // Slug de primeiro nível: pode ser artigo AutoSEO dinâmico
  if (/^\/[a-z0-9\-]+$/i.test(path)) return 200;

  return 404;
}
