/*
 * Regras do blog que valem igual no cliente e no prerender (out/2026).
 *
 * Arquivo PURO — sem import.meta.glob, sem react, sem node — para que
 * server/_core/seo-content.ts e server/_core/routes-metadata.ts importem daqui
 * em vez de duplicar a logica (antes parseBlogDate existia em dois lugares).
 *
 * RASCUNHO (draft: true): artigo escrito e ainda nao aprovado pelo Alex depois
 * da revisao medica. A URL responde 200 com noindex, para ele revisar no ar,
 * mas o artigo fica FORA do sitemap, da listagem /blog, do bloco da home, dos
 * "artigos relacionados" e de qualquer link de pagina publicada. Para publicar:
 * trocar draft para false (ou apagar o campo), reviewStatus para "aprovado" e
 * preencher lastReviewed. Os guard-rails de server/blog-exames.test.ts
 * impedem publicar com marcador {{PRAZO}} pendente.
 */

export type ReviewStatus = "revisao_medica_pendente" | "aprovado";

export interface BlogPostMeta {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  /** Texto alternativo da imagem destacada. Sem ele, usa o titulo. */
  imageAlt?: string;
  draft?: boolean;
  reviewStatus?: ReviewStatus;
  /** ISO (AAAA-MM-DD). Vira dateModified no schema e lastmod no sitemap. */
  dateModified?: string;
  /** ISO (AAAA-MM-DD) da ultima revisao medica. So preencher quando houver. */
  lastReviewed?: string;
  /** Nome do exame como entra numa frase ("hemoglobina glicada"). Liga o quadro de contato. */
  examName?: string;
  /** exam_type do evento whatsapp_click (chave de LEAD_VALUES). */
  examType?: string;
  /**
   * true quando o exame do artigo e feito com hora marcada (imagem, MAPA,
   * coleta ginecologica). Muda o texto do quadro de contato: a coleta
   * laboratorial e sem agendamento; esses exames, nao.
   */
  horaMarcada?: boolean;
  /**
   * Paginas de exame que o quadro de contato do artigo linka (botao "Ver a
   * pagina"). Caminhos de PAGINA_EXAME_LABEL. Sem isso, so o WhatsApp.
   */
  examPages?: string[];
  /** Tres slugs escolhidos a mao para "Artigos relacionados". */
  related?: string[];
  /** <title> da pagina, quando diferente do H1. Fonte: routes-metadata.ts. */
  metaTitle?: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string[];
}

/** Bloco do corpo que vira o quadro de contato (ExamCTA) no meio do artigo. */
export const CTA_MARKER = "[[cta]]";

/** Artigos com mais palavras que isto ganham sumario com ancoras dos H2. */
export const TOC_MIN_WORDS = 1000;

/** Rotulo do botao de cada pagina que o quadro de contato pode linkar. */
export const PAGINA_EXAME_LABEL: Record<string, string> = {
  "/exames/exames-de-sangue": "Exames de sangue",
  "/exames/hemograma": "Hemograma completo",
  "/exames/eletrocardiograma": "Eletrocardiograma",
  "/exames/holter": "Holter 24h",
  "/exames/mapa": "MAPA 24h",
  "/exames/ultrassonografia": "Ultrassonografia",
  "/exames/mamografia": "Mamografia",
  "/exames/raio-x": "Raio-X",
  "/exames/tomografia-computadorizada": "Tomografia computadorizada",
  "/exames/exame-admissional": "Exames ocupacionais",
  "/exames/exame-toxicologico": "Exame toxicológico",
  "/checkup": "Check-up",
  "/laboratorio-caraguatatuba": "Análises clínicas",
};

/** Titulo do quadro: a ligacao local ("em Caraguatatuba") fica aqui, nao no title do artigo. */
export function tituloContato(examName: string): string {
  if (examName === "coleta domiciliar") return "Coleta domiciliar em Caraguatatuba";
  return `${examName[0].toUpperCase()}${examName.slice(1)} em Caraguatatuba`;
}

/**
 * Mensagem do WhatsApp do quadro. Exame com hora marcada: "quero agendar".
 * Coleta laboratorial e sem agendamento, entao a mensagem e de duvida.
 */
export function mensagemContato(examName: string, horaMarcada?: boolean): string {
  if (examName === "coleta domiciliar") return "Olá! Vim pelo blog e quero informações sobre a coleta domiciliar.";
  return horaMarcada
    ? `Olá! Vim pelo blog e quero agendar ${examName}.`
    : `Olá! Vim pelo blog e tenho uma dúvida sobre ${examName}.`;
}

/** Texto do quadro de contato — o mesmo no ExamCTA.tsx e no prerender. */
export function textoContato(horaMarcada?: boolean): string[] {
  const convenios = "Convênios: Cartão de Todos, Solumedi e Leader. Fora deles, o atendimento é particular.";
  return horaMarcada
    ? [
        "Na unidade da Rua Padre Anchieta, 1010 – Centro, este exame é feito com hora marcada pelo WhatsApp (12) 3887-3535, de segunda a sexta, das 7h30 às 18h. Traga o pedido médico e um documento com foto.",
        "A coleta de exames laboratoriais do mesmo pedido é sem agendamento, por ordem de chegada. Dúvidas de preparo e convênio também pelo WhatsApp.",
        convenios,
      ]
    : [
        "Na unidade da Rua Padre Anchieta, 1010 – Centro, a coleta de exames laboratoriais é sem agendamento, por ordem de chegada, de segunda a sexta, das 7h30 às 18h. Traga o pedido médico e um documento com foto.",
        "Também fazemos coleta domiciliar: área atendida, horário e valor são confirmados pelo WhatsApp (12) 3887-3535, que também tira dúvidas de preparo e convênio.",
        convenios,
      ];
}

/**
 * Aviso padrao do fim de todo artigo — texto literal do modelo de fechamento
 * definido pelo Alex em 22/10/2026 (MODELO-FECHAMENTO-ARTIGO.md, repo de SEO).
 */
export const AVISO_INFORMATIVO =
  "Este conteúdo é informativo e não substitui a consulta médica. A interpretação dos resultados deve ser feita pelo seu médico.";

/**
 * Responsavel tecnico que assina a revisao dos artigos publicados (system
 * prompt do blog, 21/10/2026, fase 2). Sem a sigla do conselho: so o nome e
 * o cargo aqui; o numero vai no rodape, no bloco padrao de identificacao.
 */
export const REVISOR = { name: "Alex Waltersdorf", jobTitle: "Responsável Técnico" } as const;

/**
 * Identificacao do art. 5o da Resolucao CFM 2.336/2023 no fim de cada artigo:
 * as tres linhas do modelo de fechamento do Alex (22/10/2026) — clinica com o
 * registro, responsavel tecnico, endereco e telefone. Sem a sigla do conselho.
 */
export const IDENTIFICACAO = [
  "Total Quality Medicina Diagnóstica — Registro 970616",
  "Responsável Técnico: Alex Waltersdorf - 267.339",
  "Rua Padre Anchieta, 1010 – Centro – Caraguatatuba-SP · (12) 3887-3535",
] as const;

/**
 * Linha visivel no topo do artigo. Rascunho nunca diz "revisado": a revisao
 * medica e justamente o que falta para ele ser publicado.
 */
export function linhaRevisao(post: Pick<BlogPostMeta, "draft" | "date" | "dateModified">): string {
  const atualizado = `Atualizado em ${isoToBr(blogModifiedIso(post))}`;
  return isPublished(post)
    ? `Revisado por ${REVISOR.name}, ${REVISOR.jobTitle} · ${atualizado}`
    : `Rascunho — revisão médica pendente · ${atualizado}`;
}

export function isPublished(post: Pick<BlogPostMeta, "draft">): boolean {
  return post.draft !== true;
}

const PT_MONTHS: Record<string, number> = {
  jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5,
  jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11,
};

/**
 * Converte a data em texto do post (ex: "12 Set 2026") para timestamp
 * ordenável. O construtor nativo `Date()` não reconhece meses abreviados em
 * português e devolve Invalid Date/NaN para todo post — a ordenação por
 * "mais recente" nunca funcionou de fato, e o post em destaque/primeiro do
 * grid ficava por ordem de inserção no index.json, não por data.
 */
export function parseBlogDate(date: string): number {
  const match = date.match(/^(\d{1,2})\s+([A-Za-zçÇ]+)\s+(\d{4})$/);
  if (match) {
    const [, day, monthStr, year] = match;
    const month = PT_MONTHS[monthStr.toLowerCase()];
    if (month !== undefined) {
      return Date.UTC(Number(year), month, Number(day));
    }
  }
  const fallback = new Date(date).getTime();
  return Number.isNaN(fallback) ? 0 : fallback;
}

/**
 * "12 Set 2026" → "2026-09-12". O schema BlogPosting recebia a data em texto,
 * que o Google não lê como data (datePublished inválido em todo artigo).
 */
export function blogDateIso(date: string): string {
  const ts = parseBlogDate(date);
  return ts ? new Date(ts).toISOString().slice(0, 10) : "";
}

/** Data da ultima alteracao do artigo, em ISO: dateModified ou, sem ele, a publicacao. */
export function blogModifiedIso(post: Pick<BlogPostMeta, "date" | "dateModified">): string {
  return post.dateModified || blogDateIso(post.date);
}

/** "2026-10-17" → "17/10/2026", para exibir na pagina. */
export function isoToBr(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

/**
 * Extrai os pares pergunta/resposta da seção "## Perguntas frequentes" do
 * corpo de um artigo (títulos "### " dentro dela viram perguntas), para
 * alimentar o FAQPage schema — no cliente (useFAQSchema) e no prerender, da
 * mesma fonte que o leitor vê. Artigos sem essa seção devolvem array vazio.
 */
export function extractFaqs(content: string[]): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];
  let inFaqSection = false;
  let current: { q: string; a: string[] } | null = null;

  const flush = () => {
    if (current && current.a.length > 0) faqs.push({ q: current.q, a: current.a.join(" ") });
    current = null;
  };

  for (const block of content) {
    const trimmed = block.trimStart();
    if (trimmed.startsWith("## ")) {
      flush();
      inFaqSection = /perguntas frequentes/i.test(trimmed.slice(3));
      continue;
    }
    if (!inFaqSection) continue;
    if (trimmed.startsWith("### ")) {
      flush();
      current = { q: trimmed.slice(4), a: [] };
      continue;
    }
    if (current && trimmed !== CTA_MARKER) current.a.push(stripInlineMarkdown(block));
  }
  flush();

  return faqs;
}

/** Tira **negrito** e [texto](url) — o schema leva texto puro. */
export function stripInlineMarkdown(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
}

/** Id de ancora estavel para um H2: "Precisa de jejum?" → "precisa-de-jejum". */
export function headingId(text: string): string {
  return stripInlineMarkdown(text)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Contagem de palavras do corpo, sem marcacao. */
export function wordCount(content: string[]): number {
  return content
    .filter((b) => b.trim() !== CTA_MARKER)
    .map((b) => stripInlineMarkdown(b).replace(/[#|*-]/g, " "))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** H2 do artigo para o sumario: texto + ancora. */
export function tableOfContents(content: string[]): { id: string; text: string }[] {
  if (wordCount(content) <= TOC_MIN_WORDS) return [];
  return content
    .map((b) => b.trimStart())
    .filter((b) => b.startsWith("## "))
    .map((b) => {
      const text = stripInlineMarkdown(b.slice(3));
      return { id: headingId(text), text };
    });
}

/**
 * Relacionados: os escolhidos a mao (campo related), so entre publicados; se
 * faltarem, completa com a regra antiga (mesma categoria ou tag em comum).
 */
export function relatedPosts<T extends BlogPostMeta>(post: BlogPostMeta, all: T[], limit = 3): T[] {
  const publicados = all.filter((p) => isPublished(p) && p.slug !== post.slug);
  const escolhidos = (post.related ?? [])
    .map((slug) => publicados.find((p) => p.slug === slug))
    .filter((p): p is T => Boolean(p));
  const resto = publicados.filter(
    (p) =>
      !escolhidos.includes(p) &&
      (p.category === post.category || p.tags.some((t) => post.tags.includes(t)))
  );
  return [...escolhidos, ...resto].slice(0, limit);
}

const SITE = "https://totalquality.med.br";
const BUSINESS_ID = `${SITE}/#medicalbusiness`;

/**
 * Schema do artigo, igual no prerender e no cliente.
 *
 * publisher e (quando o autor e a equipe) author apontam para a MESMA
 * entidade do index.json (#medicalbusiness): a regra de ouro do ranking pede
 * uma entidade so — antes cada artigo declarava uma Organization nova.
 * A pagina e uma MedicalWebPage sobre um MedicalTest quando o artigo trata de
 * um exame; reviewedBy (o responsavel tecnico) e lastReviewed so em artigo
 * publicado — rascunho ainda nao passou pela revisao medica.
 */
export function blogPostingLd(post: BlogPostMeta): object {
  const url = `${SITE}/blog/${post.slug}`;
  const published = blogDateIso(post.date);
  const revisado = isPublished(post);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    url,
    inLanguage: "pt-BR",
    ...(published && { datePublished: published }),
    dateModified: blogModifiedIso(post) || published,
    // Autor e a clinica (a mesma entidade do index.html). Os nomes de medicos
    // que assinavam artigos antigos nao correspondiam a pessoas da equipe e
    // sairam em 22/10/2026 — conteudo de saude nao pode ter autoria inventada.
    author: { "@id": BUSINESS_ID },
    publisher: { "@id": BUSINESS_ID },
    image: { "@type": "ImageObject", url: post.image },
    mainEntityOfPage: {
      "@type": "MedicalWebPage",
      "@id": `${url}#webpage`,
      url,
      ...(revisado && {
        reviewedBy: { "@type": "Person", name: REVISOR.name, jobTitle: REVISOR.jobTitle, worksFor: { "@id": BUSINESS_ID } },
        lastReviewed: post.lastReviewed || blogModifiedIso(post),
      }),
      ...(post.examName && { about: { "@type": "MedicalTest", name: post.examName } }),
    },
  };
}
