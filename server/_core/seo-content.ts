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

import { examesData, examH1, type ExamData } from "../../client/src/lib/examesData";
import { renderSsrPage, isSsrPath } from "../../client/src/entry-server";
import { LAB_FAQS, CHECKUP_FAQS, BIO_FAQS, HOME_FAQS } from "../../client/src/lib/paginasServico";
import { especialidadesData, ESPECIALIDADES_BASE } from "../../client/src/lib/especialidadesData";
import { conteudoDaRota } from "../../client/src/lib/paginasCatalogo";
import { SCHEMA_EXAMES } from "./schema-exames";
import { linkifyText } from "../../client/src/lib/internalLinkTargets";
import { blogLinksFor, examesDeSangueLista } from "../../client/src/lib/examBlogLinks";
import { CONVENIOS_FAQS } from "../../client/src/lib/conveniosData";
import { BAIRROS_TITULO, BAIRROS_INTRO, BAIRROS_GRUPOS, BAIRROS_PARAGRAFOS } from "../../client/src/lib/bairrosAtendidos";
import blogIndex from "../../client/src/content/blog/index.json";
import {
  AVISO_INFORMATIVO,
  blogDateIso,
  blogModifiedIso,
  blogPostingLd,
  REVISOR_LD,
  linhaRevisao,
  datasArtigo,
  conteudoComCta,
  rotuloPaginaExame,
  IDENTIFICACAO,
  CTA_MARKER,
  extractFaqs,
  headingId,
  isoToBr,
  isPublished,
  parseBlogDate,
  relatedPosts,
  tableOfContents,
  textoContato,
  tituloContato,
  mensagemContato,
  PAGINA_EXAME_LABEL,
  type BlogPost as BlogPostFull,
  type BlogPostMeta,
} from "../../client/src/lib/blogMeta";
import {
  anosDeAtuacao,
  HOME_H1,
  ANALISES_H1,
  ANALISES_TITLE,
  ANALISES_DESCRIPTION,
  CHECKUP_TITLE,
  CHECKUP_DESCRIPTION,
  BIOIMPEDANCIA_TITLE,
  BIOIMPEDANCIA_DESCRIPTION,
  SOBRE_TITLE,
  SOBRE_DESCRIPTION,
  CONTATO_TITLE,
  CONTATO_DESCRIPTION,
  ESPECIALIDADES_TITLE,
  ESPECIALIDADES_DESCRIPTION,
  CONVENIOS_TEXTO,
  whatsappUrl,
} from "@shared/const";

type BlogPost = BlogPostFull;

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
  const meta = blogPosts.find((b) => b.slug === slug);
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

/** Todos os artigos, rascunhos inclusive (a URL do rascunho prerenderiza, com noindex). */
const blogPosts = blogIndex as BlogPostMeta[];

const NAP = {
  name: "Total Quality Laboratório e Medicina Diagnóstica",
  street: "Rua Padre Anchieta, 1010 – Centro",
  city: "Caraguatatuba – SP, 11660-010",
  phoneDisplay: "(12) 3887-3535",
  phoneHref: "tel:+551238873535",
  whatsappHref: whatsappUrl(),
  hours: "Segunda a sexta, das 7h30 às 18h · Sábado e domingo fechado",
};

/*
 * Identificação obrigatória — art. 5º da Resolução CFM nº 2.336/2023.
 *
 * A norma pede o nome do estabelecimento com o número de registro E o nome do
 * responsável técnico com o dele, em local visível, em TODA peça do
 * estabelecimento. Até out/2026 o site não trazia isso em nenhuma página: nem
 * no rodapé renderizado, nem no pré-render de nenhuma das rotas.
 *
 * Entra aqui, dentro do bloco de NAP, porque esse bloco acompanha todas as
 * rotas pré-renderizadas — assim a conformidade não depende de alguém lembrar
 * de repetir o texto a cada página nova. O equivalente que o visitante com
 * JavaScript vê está em client/src/components/Footer.tsx; os dois precisam
 * dizer a mesma coisa.
 *
 * Sem a sigla do conselho em texto renderizado: apenas os dígitos.
 */
const IDENTIFICACAO_CFM = {
  estabelecimento: "Total Quality Medicina Diagnóstica",
  registro: "970616",
  responsavelTecnico: "Alex Waltersdorf - 267.339",
};

function identificacaoHtml(): string {
  return `
    <p>
      <strong>${escapeHtml(IDENTIFICACAO_CFM.estabelecimento)}</strong> — Registro ${escapeHtml(IDENTIFICACAO_CFM.registro)} ·
      Responsável Técnico: ${escapeHtml(IDENTIFICACAO_CFM.responsavelTecnico)}
    </p>`;
}

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
    <p>${escapeHtml(ctaMessage)}</p>
    ${identificacaoHtml()}`;
}

function internalLinksHtml(currentPath: string): string {
  const links: Array<[string, string]> = [
    ["/laboratorio-caraguatatuba", "Análises clínicas"],
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
    // Especialidades (24/10/2026): consultas e medicina do trabalho.
    ["/especialidades/endocrinologista", "Consulta com endocrinologista"],
    ["/especialidades/gastroenterologista", "Consulta com gastroenterologista"],
    ["/especialidades/medicina-do-trabalho", "Medicina do trabalho (PCMSO e ASO)"],
    // Fase 3 (15/11/2026): consultas confirmadas pelo Alex em 14/11 e o indice.
    ["/especialidades/cardiologista", "Consulta com cardiologista"],
    ["/especialidades/pediatra", "Consulta com pediatra"],
    ["/especialidades", "Todas as especialidades"],
    ["/exames/exame-admissional", "Exame admissional e ASO"],
    ["/blog", "Blog: saúde e diagnóstico"],
  ];
  const items = links
    .filter(([href]) => href !== currentPath)
    .map(([href, label]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`)
    .join("");
  return `<h2>Outros exames na Total Quality</h2><ul>${items}</ul>`;
}

/** Mesmo bloco do ExamePage.tsx: lista de exames de sangue e artigos do blog. */
function examBlogSectionHtml(examSlug: string): string {
  const publicados = blogPosts.filter(isPublished);
  const lista =
    examSlug === "exames-de-sangue"
      ? `<h2>Exames de sangue que realizamos</h2><ul>${examesDeSangueLista(publicados)
          .map((i) => `<li>${i.href ? `<a href="${i.href}">${escapeHtml(i.nome)}</a>` : escapeHtml(i.nome)}</li>`)
          .join("")}</ul>`
      : "";
  const artigos = blogLinksFor(examSlug, publicados);
  const blog = artigos.length
    ? `<h2>Saiba mais no nosso blog</h2><ul>${artigos
        .map((p) => `<li><a href="/blog/${p.slug}">${escapeHtml(p.title)}</a></li>`)
        .join("")}</ul>`
    : "";
  return lista + blog;
}

/** Especialidade do schema.org por pagina de especialidade (sem enum para medicina do trabalho). */
const SCHEMA_SPECIALTY: Record<string, string> = {
  endocrinologista: "https://schema.org/Endocrine",
  gastroenterologista: "https://schema.org/Gastroenterologic",
  // Fase 3 (15/11/2026): paginas criadas com a decisao do Alex de 14/11.
  cardiologista: "https://schema.org/Cardiovascular",
  pediatra: "https://schema.org/Pediatric",
};

/*
 * Revisao visivel na pagina (Fase 3): "Revisado por Dr. Alex Waltersdorf -
 * 267.339 · Atualizado em <time>". O schema diz o mesmo — e so isso.
 */
function revisaoLd(rota: string): object {
  const c = conteudoDaRota(rota);
  if (!c) return {};
  return {
    lastReviewed: c.atualizadoEm,
    // Fase 5 (15/11/2026): a mesma Person (@id) do reviewedBy dos artigos do
    // blog — uma entidade revisora so no grafo. Nome igual ao da linha
    // visivel (REVISOR_PAGINAS) sem o tratamento e sem o numero.
    reviewedBy: REVISOR_LD,
  };
}

/** MedicalTest da pagina, com condicao/aparelho so quando o dado da pagina os cita (schema-exames.ts). */
function medicalTestLd(exam: ExamData, canonical: string): object {
  const extra = SCHEMA_EXAMES[exam.slug] ?? {};
  return {
    "@type": "MedicalTest",
    "@id": `${canonical}#exame`,
    name: exam.shortTitle,
    description: exam.whatIs,
    ...(extra.usedToDiagnose && {
      usedToDiagnose: extra.usedToDiagnose.map((name) => ({ "@type": "MedicalCondition", name })),
    }),
    ...(extra.usesDevice && { usesDevice: { "@type": "MedicalDevice", name: extra.usesDevice } }),
  };
}

/**
 * Consulta (Fase 5): a pagina e sobre um medico GENERICO da especialidade na
 * clinica — sem nome de pessoa (decisao do Alex de 14/11/2026: nenhum nome de
 * medico em pagina nenhuma). A especialidade vai em `specialty` (enumeracao
 * do schema.org) e no medicalSpecialty do Physician.
 */
function physicianLd(exam: ExamData, canonical: string): object {
  const especialidade = SCHEMA_SPECIALTY[exam.slug];
  return {
    "@type": "Physician",
    "@id": `${canonical}#medico`,
    name: `${exam.shortTitle} — Total Quality Medicina Diagnóstica`,
    description: exam.whatIs,
    ...(especialidade && { medicalSpecialty: especialidade }),
    parentOrganization: { "@id": BUSINESS_ID },
  };
}

/**
 * JSON-LD da pagina de exame/especialidade (MedicalWebPage sobre um
 * MedicalTest/MedicalSpecialty, ancorado no #medicalbusiness do index.html,
 * mais o breadcrumb e o FAQPage). O FAQPage sai de exam.faqs — a MESMA lista
 * que a pagina renderiza dentro dos <details>.
 */
function examJsonLd(exam: ExamData, base = "/exames"): object[] {
  const canonical = `${SITE}${base}/${exam.slug}`;
  const isEspecialidade = base === ESPECIALIDADES_BASE;
  return [
    {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: exam.metaTitle,
      headline: examH1(exam),
      description: exam.metaDescription,
      about: isEspecialidade ? physicianLd(exam, canonical) : medicalTestLd(exam, canonical),
      ...(SCHEMA_SPECIALTY[exam.slug] && { specialty: SCHEMA_SPECIALTY[exam.slug] }),
      ...revisaoLd(`${base}/${exam.slug}`),
      provider: { "@id": BUSINESS_ID },
    },
    breadcrumbLd([
      ["Início", "/"],
      // O indice /especialidades existe desde a Fase 3 (antes 404).
      ...(isEspecialidade
        ? ([["Especialidades", ESPECIALIDADES_BASE]] as Array<[string, string]>)
        : ([["Exames", "/exames"]] as Array<[string, string]>)),
      [exam.shortTitle, `${base}/${exam.slug}`],
    ]),
    faqPageLd(exam.faqs),
  ];
}

/*
 * /laboratorio-caraguatatuba, /bioimpedancia, /checkup e as paginas de exame e
 * especialidade nao tem mais HTML escrito a mao aqui: o servidor renderiza o
 * proprio componente React (client/src/entry-server.tsx) e o navegador o
 * hidrata. Aqui ficou so o JSON-LD de cada uma, gerado dos mesmos dados.
 */
function laboratorioJsonLd(): object[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      "@id": `${SITE}/laboratorio-caraguatatuba#webpage`,
      url: `${SITE}/laboratorio-caraguatatuba`,
      name: ANALISES_TITLE,
      ...revisaoLd("/laboratorio-caraguatatuba"),
      description: ANALISES_DESCRIPTION,
      about: { "@id": BUSINESS_ID },
      provider: { "@id": BUSINESS_ID },
    },
    faqPageLd(LAB_FAQS),
    breadcrumbLd([
      ["Início", "/"],
      ["Análises clínicas", "/laboratorio-caraguatatuba"],
    ]),
  ];
}

function bioimpedanciaJsonLd(): object[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      "@id": `${SITE}/bioimpedancia#webpage`,
      url: `${SITE}/bioimpedancia`,
      name: BIOIMPEDANCIA_TITLE,
      ...revisaoLd("/bioimpedancia"),
      description: BIOIMPEDANCIA_DESCRIPTION,
      about: { "@type": "MedicalTest", name: "Bioimpedância" },
      provider: { "@id": BUSINESS_ID },
    },
    faqPageLd(BIO_FAQS),
    breadcrumbLd([
      ["Início", "/"],
      ["Bioimpedância", "/bioimpedancia"],
    ]),
  ];
}

function checkupJsonLd(): object[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      "@id": `${SITE}/checkup#webpage`,
      url: `${SITE}/checkup`,
      name: CHECKUP_TITLE,
      ...revisaoLd("/checkup"),
      description: CHECKUP_DESCRIPTION,
      provider: { "@id": BUSINESS_ID },
    },
    faqPageLd(CHECKUP_FAQS),
    breadcrumbLd([
      ["Início", "/"],
      ["Check-up", "/checkup"],
    ]),
  ];
}

/** /sobre (AboutPage) e /contato (ContactPage) — Fase 2, sobre a mesma entidade. */
function institucionalJsonLd(path: "/sobre" | "/contato"): object[] {
  const sobre = path === "/sobre";
  return [
    {
      "@context": "https://schema.org",
      "@type": sobre ? "AboutPage" : "ContactPage",
      "@id": `${SITE}${path}#webpage`,
      url: `${SITE}${path}`,
      name: sobre ? SOBRE_TITLE : CONTATO_TITLE,
      description: sobre ? SOBRE_DESCRIPTION : CONTATO_DESCRIPTION,
      about: { "@id": BUSINESS_ID },
      mainEntity: { "@id": BUSINESS_ID },
    },
    breadcrumbLd([
      ["Início", "/"],
      [sobre ? "Sobre" : "Contato", path],
    ]),
  ];
}

/** /especialidades — indice das consultas (Fase 3). */
function especialidadesJsonLd(): object[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${SITE}${ESPECIALIDADES_BASE}#webpage`,
      url: `${SITE}${ESPECIALIDADES_BASE}`,
      name: ESPECIALIDADES_TITLE,
      description: ESPECIALIDADES_DESCRIPTION,
      about: { "@id": BUSINESS_ID },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: especialidadesData.map((e, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: e.shortTitle,
          url: `${SITE}${ESPECIALIDADES_BASE}/${e.slug}`,
        })),
      },
    },
    breadcrumbLd([
      ["Início", "/"],
      ["Especialidades", ESPECIALIDADES_BASE],
    ]),
  ];
}

/** JSON-LD de uma rota renderizada no servidor (vai para o <head>). */
function ssrJsonLd(path: string): object[] {
  if (path === "/sobre" || path === "/contato") return institucionalJsonLd(path);
  if (path === ESPECIALIDADES_BASE) return especialidadesJsonLd();
  if (path === "/laboratorio-caraguatatuba") return laboratorioJsonLd();
  if (path === "/bioimpedancia") return bioimpedanciaJsonLd();
  if (path === "/checkup") return checkupJsonLd();
  const exame = path.match(/^\/exames\/([a-z0-9\-]+)$/);
  if (exame) {
    const e = examesData.find((x) => x.slug === exame[1]);
    if (e) return examJsonLd(e);
  }
  const esp = path.match(/^\/especialidades\/([a-z0-9\-]+)$/);
  if (esp) {
    const e = especialidadesData.find((x) => x.slug === esp[1]);
    if (e) return examJsonLd(e, ESPECIALIDADES_BASE);
  }
  return [];
}

export interface SsrPage {
  /** HTML do React para dentro do #root. */
  body: string;
  /** Para o <head>: o JSON-LD da rota (data-route-ld). */
  jsonLd: string;
  /** Para o <head>: <link rel="preload" as="image"> que o React emitiu. */
  preloads: string;
  /**
   * true = o navegador hidrata (hydrateRoot). Com barra final ou outra grafia
   * do caminho o wouter do navegador pode nao casar a rota do mesmo jeito; ai
   * o HTML vai, mas o React redesenha (createRoot), como antes.
   */
  hydrate: boolean;
}

/*
 * renderToString custa alguns milissegundos por pagina, e o resultado so muda
 * com o deploy — ou com a data (anosDeAtuacao, ano do rodape). Cache por dia.
 */
const ssrCache = new Map<string, SsrPage>();

export function getSsrPage(pathname: string): SsrPage | null {
  const raw = pathname.split("?")[0];
  if (!isSsrPath(raw)) return null;
  const path = raw.replace(/\/$/, "") || "/";
  const chave = `${new Date().toISOString().slice(0, 10)} ${raw}`;
  const emCache = ssrCache.get(chave);
  if (emCache) return emCache;
  const html = renderSsrPage(path);
  if (html === null) return null;
  // O React 19 abre o HTML com <link rel="preload" as="image"> das imagens sem
  // loading="lazy". Dentro do #root eles quebrariam a hidratacao (no o
  // cliente nao renderiza); no <head> sao o preload certo da imagem da rota.
  const preloads: string[] = [];
  const body = html.replace(/<link rel="preload" as="image"[^>]*\/>/g, (tag) => {
    preloads.push(tag);
    return "";
  });
  const page: SsrPage = {
    body,
    jsonLd: jsonLd(ssrJsonLd(path)).replace(/<script type="application\/ld\+json">/g, '<script type="application/ld+json" data-route-ld="">'),
    preloads: preloads.join("\n"),
    hydrate: raw === path,
  };
  if (ssrCache.size > 500) ssrCache.clear();
  ssrCache.set(chave, page);
  return page;
}

/**
 * Pagina /convenios: "aceita meu convenio?" e o principal desempate local
 * entre laboratorios (lacuna verificada na auditoria de 01/08: as queries
 * transacionais de convenio caiam num post de blog). Esta pagina e o destino
 * transacional. O antigo post /blog/convenios-laboratorio-caraguatatuba foi
 * consolidado aqui com 301 em 22/10/2026 (uma URL por intencao).
 *
 * A lista vive tambem em client/src/lib/conveniosData.ts (o client nao pode
 * importar deste modulo, que usa node:fs). Ao mudar um convenio, mudar NOS
 * DOIS — o teste de paridade em seo-content.test.ts compara as duas listas.
 */
export const CONVENIOS = [
  "Cartão de Todos", "Solumedi", "Leader",
];


/** Link para o artigo de coleta domiciliar — so depois de publicado. */
function coletaDomiciliarLinkHtml(): string {
  const post = blogPosts.find((p) => p.slug === "coleta-domiciliar-exames-caraguatatuba");
  if (!post || !isPublished(post)) return "";
  return `<p>Não pode vir até a unidade? Veja como funciona a <a href="/blog/${post.slug}">coleta domiciliar de exames</a>.</p>`;
}

function conveniosHtml(): string {
  const lista = CONVENIOS.map((c) => `<li>${escapeHtml(c)}</li>`).join("");
  return `
    <h1>Convênios Aceitos no Laboratório em Caraguatatuba</h1>
    <p>A Total Quality Medicina Diagnóstica atende Cartão de Todos, Solumedi e Leader em Caraguatatuba – SP, para <a href="/exames/exames-de-sangue">exames de sangue</a>, <a href="/laboratorio-caraguatatuba">exames laboratoriais</a>, <a href="/exames/tomografia-computadorizada">tomografia</a>, <a href="/exames/ultrassonografia">ultrassonografia</a> e <a href="/checkup">check-up</a>.</p>
    <h2>Convênios e cartões atendidos</h2>
    <ul>${lista}</ul>
    <p>Não trabalhamos com outros convênios ou planos de saúde: fora dessa lista, o atendimento é particular. Confirme condições e valores pelo WhatsApp <a href="${NAP.whatsappHref}">(12) 3887-3535</a> antes de vir.</p>
    ${coletaDomiciliarLinkHtml()}
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
    <h1>${HOME_H1}</h1>
    <p>Há mais de ${anosDeAtuacao()} anos no Litoral Norte, a Total Quality reúne em um só lugar <a href="/laboratorio-caraguatatuba">análises clínicas</a> e centro de diagnóstico por imagem em Caraguatatuba – SP: mais de 3.000 tipos de <a href="/exames/exames-de-sangue">exames de sangue</a>, <a href="/exames/tomografia-computadorizada">tomografia computadorizada</a>, <a href="/exames/ultrassonografia">ultrassonografia com Doppler</a>, <a href="/exames/raio-x">raio-X</a>, <a href="/exames/mapa">MAPA</a>, <a href="/exames/holter">Holter 24h</a>, <a href="/exames/eletrocardiograma">eletrocardiograma</a>, <a href="/exames/eletroencefalograma">eletroencefalograma</a>, <a href="/exames/espirometria">espirometria</a>, <a href="/exames/exame-toxicologico">exame toxicológico</a>, <a href="/bioimpedancia">bioimpedância</a>, <a href="/checkup">check-up preventivo</a> e <a href="/exames/exame-admissional">medicina ocupacional</a>. Também oferece <a href="/especialidades/medicina-do-trabalho">medicina do trabalho</a> para empresas, com PCMSO e ASO, e <a href="/especialidades">consultas</a> com <a href="/especialidades/cardiologista">cardiologista</a>, <a href="/especialidades/endocrinologista">endocrinologista</a>, <a href="/especialidades/gastroenterologista">gastroenterologista</a> e <a href="/especialidades/pediatra">pediatra</a>.</p>
    <ul>
      <li>Resultados online em curto prazo para a maioria dos exames</li>
      <li>Coleta laboratorial sem agendamento, por ordem de chegada — e coleta domiciliar mediante agendamento</li>
      <li>Atendimento particular, empresas e os convênios ${CONVENIOS_TEXTO}</li>
      <li>Mais de 400 avaliações no Google</li>
    </ul>
    <h2>Como funciona o laboratório</h2>
    <p>Para <a href="/exames/exames-de-sangue">exames de sangue</a> e demais exames laboratoriais, basta vir com o pedido médico e um documento com foto, de segunda a sexta, das 7h30 às 18h — o atendimento é por ordem de chegada. Antes, confira as <a href="/blog/alimentacao-e-exames-laboratoriais">orientações de preparo e jejum</a>. Quem não pode se deslocar pode pedir a coleta domiciliar pelo WhatsApp (12) 3887-3535, que confirma área atendida, horário e valor. Os resultados ficam disponíveis online.</p>
    <p>Exames de imagem e cardiológicos, como tomografia, ultrassonografia, MAPA e Holter, são agendados pelo WhatsApp ou telefone, porque dependem de horário com o médico e de preparo específico.</p>
    ${faqSectionHtml(HOME_FAQS)}
    ${napHtml("Agende seus exames pelo WhatsApp (12) 3887-3535 ou visite-nos no Centro de Caraguatatuba.")}
    ${internalLinksHtml("/")}`;

/**
 * Retorna o HTML SEO da rota, ou null para rotas sem pré-renderização.
 */
export function getSeoContentForPath(pathname: string): string | null {
  const path = pathname.split("?")[0].replace(/\/$/, "") || "/";

  // Rotas renderizadas pelo React no servidor: devolve o que a resposta leva
  // de conteudo — o HTML do #root mais o JSON-LD que vai para o <head>. Os
  // guard-rails que leem esta funcao passam a valer sobre a pagina de verdade.
  const ssr = getSsrPage(path);
  if (ssr) return `${ssr.body}\n${ssr.jsonLd}`;

  if (path === "/") return wrap(homeHtml);

  if (path === "/privacidade") return wrap(privacidadeHtml);
  if (path === "/convenios") return wrap(conveniosHtml());
  if (path === "/exames") return wrap(examesHubHtml());

  if (path === "/blog") return wrap(blogIndexHtml());

  const blogMatch = path.match(/^\/blog\/([a-z0-9\-]+)$/);
  if (blogMatch) {
    const post = loadBlogPostFromDisk(blogMatch[1]);
    if (post) return wrap(renderBlogHtml(post));
  }

  return null;
}

/*
 * Pagina 404 (SEO nov/2026, Fase 6). Antes o 404 saia com o HTML da home:
 * robots "index, follow", canonical da home e, no React, texto em ingles com
 * um botao so. Agora: status 404 mantido, noindex, sem canonical
 * (routes-metadata.ts, injectNotFoundMeta) e este texto em portugues com os
 * caminhos que o visitante mais procura.
 */
export function notFoundHtml(): string {
  return wrap(`
    <h1>Página não encontrada</h1>
    <p>O endereço que você abriu não existe ou mudou de lugar. Veja se encontra o que procura por aqui:</p>
    <ul>
      <li><a href="/exames">Exames laboratoriais e de imagem</a></li>
      <li><a href="/especialidades">Consultas e especialidades</a></li>
      <li><a href="/blog">Blog: saúde e diagnóstico</a></li>
      <li><a href="/">Página inicial da Total Quality</a></li>
    </ul>
    ${napHtml("Não encontrou? Fale com a nossa equipe pelo WhatsApp (12) 3887-3535.")}`);
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
    <p>A Total Quality reúne em um só endereço, no Centro de Caraguatatuba, mais de 3.000 tipos de exames laboratoriais, exames de imagem, cardiológicos e ocupacionais — com resultados online em curto prazo para a maioria dos exames laboratoriais e equipe especializada há mais de ${anosDeAtuacao()} anos no Litoral Norte.</p>
    ${sections}
    <p><a href="/bioimpedancia">Bioimpedância</a> — análise completa de composição corporal.</p>
    <p><a href="/checkup">Check-up preventivo</a> — planos Básico, Select e Premium.</p>
    <h2>Consultas e medicina do trabalho</h2>
    <ul>${especialidadesData.map((e) => `<li><a href="${ESPECIALIDADES_BASE}/${e.slug}">${escapeHtml(e.shortTitle)}</a> — ${escapeHtml(e.description)}</li>`).join("")}</ul>
    <p><a href="${ESPECIALIDADES_BASE}">Todas as especialidades</a></p>
    ${napHtml("Não encontrou o exame que procura? Fale com a gente pelo WhatsApp — realizamos mais de 3.000 tipos de exames.")}
    ${jsonLd([colecaoLd("/exames", "Exames Laboratoriais e de Imagem em Caraguatatuba"), breadcrumbLd([["Início", "/"], ["Exames", "/exames"]])])}`;
}

function blogIndexHtml(): string {
  const items = blogPosts
    .filter(isPublished)
    .sort((a, b) => parseBlogDate(b.date) - parseBlogDate(a.date))
    .map((b) => `<li><a href="/blog/${b.slug}">${escapeHtml(b.title)}</a> — ${escapeHtml(b.excerpt)}</li>`)
    .join("");
  return `
    <h1>Blog Total Quality — Saúde e Diagnóstico</h1>
    <p>Artigos escritos pela equipe da Total Quality Medicina Diagnóstica sobre exames, prevenção e saúde no Litoral Norte.</p>
    <ul>${items}</ul>
    ${identificacaoHtml()}
    ${internalLinksHtml("/blog")}
    ${jsonLd([colecaoLd("/blog", "Blog Total Quality — Saúde e Diagnóstico"), breadcrumbLd([["Início", "/"], ["Blog", "/blog"]])])}`;
}

/** Indices /exames e /blog (Fase 5): CollectionPage do site, publicada pela clinica. */
function colecaoLd(path: string, name: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE}${path}#webpage`,
    url: `${SITE}${path}`,
    name,
    publisher: { "@id": BUSINESS_ID },
  };
}

function parseMarkdownTableRow(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

const SITE_ORIGIN = "https://totalquality.med.br";

function toRelativeHref(url: string): string {
  return url.startsWith(SITE_ORIGIN) ? url.slice(SITE_ORIGIN.length) || "/" : url;
}

/**
 * "[texto](url)" — link explicito no corpo do artigo. Registra o destino em
 * usedHrefs (quando interno) para o auto-linker nao duplicar outro link para
 * o mesmo alvo mais adiante no mesmo artigo.
 */
function renderInlineHtml(text: string, currentPath: string, usedHrefs: Set<string>): string {
  return text
    .split(/(\[[^\]]+\]\([^)]+\))/g)
    .filter((part) => part.length > 0)
    .map((part) => {
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, linkText, url] = linkMatch;
        const isInternal = url.startsWith(SITE_ORIGIN) || url.startsWith("/");
        const href = toRelativeHref(url);
        if (isInternal) usedHrefs.add(href);
        return isInternal
          ? `<a href="${href}">${escapeHtml(linkText)}</a>`
          : `<a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(linkText)}</a>`;
      }

      return part
        .split(/(\*\*[^*]+\*\*)/g)
        .filter((p) => p.length > 0)
        .map((bp) => {
          const isBold = bp.startsWith("**") && bp.endsWith("**");
          const raw = isBold ? bp.slice(2, -2) : bp;
          const html = linkifyText(raw, currentPath, usedHrefs)
            .map((s) => (s.href ? `<a href="${s.href}">${escapeHtml(s.text)}</a>` : escapeHtml(s.text)))
            .join("");
          return isBold ? `<strong>${html}</strong>` : html;
        })
        .join("");
    })
    .join("");
}

/**
 * Corpo do artigo em HTML: interpreta a formatacao markdown leve usada nos
 * textos (##/### para titulos, **negrito**, listas "- item" e tabelas
 * "| col |") e aplica a linkagem interna automatica (client/src/lib/
 * internalLinkTargets.ts, fonte unica — mesma logica usada pelo
 * renderBlogContent.tsx no cliente). Antes disso cada item do array virava
 * um <p> literal, entao o crawler via os caracteres ##, ** e | crus no HTML.
 */
function renderBlogBodyHtml(content: string[], currentPath: string, ctaHtml = ""): string {
  const usedHrefs = new Set<string>();

  return content
    .map((block) => {
      const trimmed = block.trimStart();

      if (trimmed.startsWith("### ")) {
        return `<h3>${renderInlineHtml(trimmed.slice(4), currentPath, usedHrefs)}</h3>`;
      }
      if (trimmed.trim() === CTA_MARKER) return ctaHtml;
      if (trimmed.startsWith("## ")) {
        return `<h2 id="${headingId(trimmed.slice(3))}">${renderInlineHtml(trimmed.slice(3), currentPath, usedHrefs)}</h2>`;
      }
      if (trimmed.startsWith("|")) {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        const [headerLine, separatorLine, ...bodyLines] = lines;
        const header = parseMarkdownTableRow(headerLine);
        const isSeparator = /^\|?[\s:|-]+\|?$/.test(separatorLine ?? "");
        const rows = (isSeparator ? bodyLines : [separatorLine, ...bodyLines].filter(Boolean)).map(parseMarkdownTableRow);
        const thead = `<tr>${header.map((c) => `<th>${renderInlineHtml(c, currentPath, usedHrefs)}</th>`).join("")}</tr>`;
        const tbody = rows
          .map((r) => `<tr>${r.map((c) => `<td>${renderInlineHtml(c, currentPath, usedHrefs)}</td>`).join("")}</tr>`)
          .join("");
        return `<table><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
      }
      if (trimmed.startsWith("- ")) {
        const items = block
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.startsWith("- "))
          .map((l) => l.slice(2));
        return `<ul>${items.map((it) => `<li>${renderInlineHtml(it, currentPath, usedHrefs)}</li>`).join("")}</ul>`;
      }

      return `<p>${renderInlineHtml(block, currentPath, usedHrefs)}</p>`;
    })
    .join("");
}

/**
 * Quadro de contato do artigo de exame — mesmo texto do ExamCTA.tsx. A coleta
 * laboratorial e sem agendamento (decisao de 01/08/2026); o WhatsApp tira
 * duvidas e combina a coleta domiciliar.
 */
function examCtaHtml(examName: string, horaMarcada?: boolean, examPages: string[] = []): string {
  const paragrafos = textoContato(horaMarcada).map((t) => `<p>${escapeHtml(t)}</p>`).join("\n      ");
  const paginas = examPages
    .filter((href) => PAGINA_EXAME_LABEL[href])
    .map((href) => `<a href="${href}">${escapeHtml(rotuloPaginaExame(href))}</a>`)
    .join(" · ");
  const whats = whatsappUrl(mensagemContato(examName, horaMarcada));
  return `
    <aside>
      <p><strong>${escapeHtml(tituloContato(examName))}</strong></p>
      ${paragrafos}
      <p><a href="${escapeHtml(whats)}" target="_blank" rel="noopener noreferrer">${horaMarcada ? "Agendar pelo WhatsApp" : "Tirar dúvidas pelo WhatsApp"}</a>${paginas ? ` · ${paginas}` : ""}</p>
    </aside>`;
}

/** Rodape do artigo — mesmo texto do MedicalFooter.tsx. */
function blogFooterHtml(post: BlogPost): string {
  const revisao = post.lastReviewed
    ? `<p>Última revisão médica: ${isoToBr(post.lastReviewed)}</p>`
    : isPublished(post)
      ? ""
      : "<p>Rascunho — revisão médica pendente.</p>";
  return `
    <footer>
      <p><strong>${AVISO_INFORMATIVO}</strong></p>
      <p>${IDENTIFICACAO.join("<br>")}</p>
      <p>Publicado em ${isoToBr(blogDateIso(post.date))} · Última atualização: ${isoToBr(blogModifiedIso(post))}</p>
      ${revisao}
    </footer>`;
}

function renderBlogHtml(post: BlogPost): string {
  const currentPath = `/blog/${post.slug}`;
  const cta = post.examName ? examCtaHtml(post.examName, post.horaMarcada, post.examPages) : "";
  // Quadro do meio no primeiro terco do texto (Fase 4, 15/11/2026).
  const bodyHtml = renderBlogBodyHtml(conteudoComCta(post.content), currentPath, cta);
  const datas = datasArtigo(post);
  const datasHtml = `Publicado em <time datetime="${datas.publicado.iso}">${datas.publicado.br}</time>${
    datas.atualizado ? ` · Atualizado em <time datetime="${datas.atualizado.iso}">${datas.atualizado.br}</time>` : ""
  }`;
  const toc = tableOfContents(post.content);
  const tocHtml = toc.length
    ? `<nav aria-label="Sumário"><p>Neste artigo</p><ol>${toc
        .map((t) => `<li><a href="#${t.id}">${escapeHtml(t.text)}</a></li>`)
        .join("")}</ol></nav>`
    : "";
  const related = relatedPosts(post, blogPosts);
  const relatedHtml = related.length
    ? `<h2>Artigos relacionados</h2><ul>${related
        .map((r) => `<li><a href="/blog/${r.slug}">${escapeHtml(r.title)}</a></li>`)
        .join("")}</ul>`
    : "";
  const faqs = extractFaqs(post.content);
  return `
    <nav aria-label="Trilha de navegação"><a href="/">Início</a> › <a href="/blog">Blog</a> › ${escapeHtml(post.title)}</nav>
    <article>
      <h1>${escapeHtml(post.title)}</h1>
      <p><em>${escapeHtml(post.subtitle)}</em></p>
      <p>${escapeHtml(post.author)} · ${escapeHtml(post.authorRole)} · ${escapeHtml(post.readTime)} de leitura</p>
      <p>${escapeHtml(linhaRevisao(post))}</p>
      <p>${datasHtml}</p>
      ${tocHtml}
      ${bodyHtml}
      ${cta}
      ${blogFooterHtml(post)}
    </article>
    ${relatedHtml}
    ${napHtml("Coleta laboratorial sem agendamento, por ordem de chegada, e resultados online. Dúvidas de preparo e convênio pelo WhatsApp.")}
    ${internalLinksHtml("/blog/" + post.slug)}
    ${jsonLd([
      blogPostingLd(post, post.content),
      breadcrumbLd([
        ["Início", "/"],
        ["Blog", "/blog"],
        [post.title, currentPath],
      ]),
      ...(faqs.length ? [faqPageLd(faqs)] : []),
    ])}`;
}

function wrap(inner: string): string {
  // Markup semântico simples; o React substitui este bloco ao montar.
  return `<main class="seo-prerender">${inner}</main>`;
}

/**
 * Injeta o conteúdo SEO dentro do <div id="root"> do HTML.
 */
export function injectSeoContent(html: string, content: string): string {
  /*
   * Fase 5 (15/11/2026): o JSON-LD do pre-render sai do #root e vai para o
   * <head> (data-route-ld), como nas rotas SSR. Dentro do #root ele sumia
   * quando o React montava (createRoot apaga o bloco): na home e em
   * /convenios o FAQPage desaparecia da pagina renderizada; no blog os hooks
   * do cliente recolocavam outra copia no <head>. Agora ha uma copia so, no
   * <head>, que os hooks do cliente substituem (SEOHead.tsx) em vez de
   * duplicar, e que sai na primeira navegacao interna (AppShell.tsx).
   */
  const scripts: string[] = [];
  const corpo = content.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, (tag) => {
    scripts.push(tag.trim().replace('<script type="application/ld+json">', '<script type="application/ld+json" data-route-ld="">'));
    return "";
  });
  const out = html.replace(
    /(<div id="root">)(\s*)(<\/div>)/,
    (_m, open, _ws, close) => `${open}${corpo}${close}`
  );
  return scripts.length ? out.replace("</head>", `${scripts.join("\n")}\n</head>`) : out;
}

/**
 * Monta a resposta de uma rota renderizada no servidor:
 *   - o HTML do React dentro do #root, com data-ssr quando o navegador deve
 *     hidratar (main.tsx le o atributo);
 *   - o JSON-LD da rota no <head>;
 *   - a folha de estilo principal volta a BLOQUEAR o primeiro paint. O
 *     nonBlockingCss (vite.config.ts) existe porque o pre-render antigo tinha
 *     estilo proprio inline; o HTML do React depende das classes do Tailwind, e
 *     pintar sem a folha seria trocar um salto de layout por outro.
 */
export function injectSsrPage(html: string, page: SsrPage): string {
  let out = html.replace(
    /(<div id="root")(>)(\s*)(<\/div>)/,
    (_m, open, gt, _ws, close) => `${open}${page.hydrate ? ' data-ssr=""' : ""}${gt}${page.body}${close}`
  );
  out = out.replace(
    /<link rel="preload" as="style"([^>]*?)href="([^"]+)"([^>]*?) onload="this\.onload=null;this\.rel='stylesheet'"><noscript><link rel="stylesheet"[^>]*><\/noscript>/g,
    (_m, before, href, after) => `<link rel="stylesheet"${before}href="${href}"${after}>`
  );
  return out.replace("</head>", `${page.preloads}\n${page.jsonLd}\n</head>`);
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
  // Indice das especialidades (Fase 3, 15/11/2026); antes 404.
  "/especialidades",
  // Paginas reais desde a Fase 2 de SEO (14/11/2026); antes, 301 para a home.
  "/sobre",
  "/contato",
  "/ligar",
  "/obrigado-chamada",
  "/formulario-sucesso",
  "/cartao",
  "/404",
  // Esquecer uma rota de primeiro nivel aqui NAO quebra a pagina: o servidor
  // entrega o documento inteiro, so que com status 404. O Google nao indexa
  // pagina servida assim, e um anuncio pago leva o clique para uma URL
  // marcada como inexistente. Foi o que aconteceu com /outubro-rosa entre
  // 18 e 19/10/2026, numa pagina de campanha com preco anunciado. (A rota
  // saiu em 15/11/2026, campanha encerrada: 301 em legacy-redirects.ts.)
]);

const VALID_EXAM_SLUGS = new Set(examesData.map((exam) => exam.slug));
const VALID_ESPECIALIDADE_SLUGS = new Set(especialidadesData.map((e) => e.slug));

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
  knownBlogSlugs: Set<string>,
  knownAutoSeoSlugs?: Set<string> | null
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

  const espMatch = path.match(/^\/especialidades\/([a-z0-9\-]+)$/);
  if (espMatch) return VALID_ESPECIALIDADE_SLUGS.has(espMatch[1]) ? 200 : 404;

  const blogMatch = path.match(/^\/blog\/([a-z0-9\-]+)$/);
  if (blogMatch) return knownBlogSlugs.has(blogMatch[1]) ? 200 : 404;

  // Slug de primeiro nivel: rota catch-all dos artigos AutoSEO. So devolve 200
  // se o slug existir de fato. Quando a lista ainda nao carregou (banco fora do
  // ar, boot em andamento) `knownAutoSeoSlugs` vem null e mantemos o 200 antigo
  // — melhor um soft 404 transitorio que 404 num artigo real.
  if (/^\/[a-z0-9\-]+$/i.test(path)) {
    if (!knownAutoSeoSlugs) return 200;
    return knownAutoSeoSlugs.has(path.slice(1)) ? 200 : 404;
  }

  return 404;
}
