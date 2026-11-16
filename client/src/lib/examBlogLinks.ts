/*
 * Linkagem das paginas de exame para o blog (diagnostico de SEO, 17/10/2026).
 *
 * A pagina /exames/<slug> e a transacional; os artigos sao a camada
 * informativa. O auto-linker (internalLinkTargets.ts) leva o artigo ate a
 * pagina; este mapa faz o caminho de volta, na secao "Saiba mais no nosso
 * blog". Arquivo PURO: usado pelo ExamePage.tsx e pelo prerender.
 *
 * Rascunho nunca aparece: quem chama passa so os artigos publicados. Quando o
 * Alex aprovar um artigo (draft: false), o link nasce sozinho aqui.
 */

/** Slugs de artigo por pagina de exame, na ordem em que aparecem. */
export const EXAM_BLOG_LINKS: Record<string, string[]> = {
  "exames-de-sangue": [
    "exames-laboratoriais-tipos-e-preparo",
    "siglas-exames-laboratoriais",
    "exames-de-sangue-guia-completo",
    "hemoglobina-glicada-exame",
    "glicemia-de-jejum-exame",
    "exame-tsh-t4-livre-tireoide",
    "exame-de-colesterol-lipidograma",
    "exames-diagnostico-diabetes",
    "alimentacao-e-exames-laboratoriais",
    "coleta-domiciliar-exames-caraguatatuba",
    // Auditoria de indexacao (23/10/2026): artigos publicados sem nenhuma
    // impressao no Search Console e com 1 ou 2 links internos.
    "exame-de-urina-eas-como-coletar",
    "resultado-de-exames-online-seguranca",
    "como-escolher-laboratorio-analises-clinicas",
  ],
  hemograma: [
    "hemograma-completo-o-que-avalia",
    "siglas-exames-laboratoriais",
    "exames-de-sangue-guia-completo",
    "alimentacao-e-exames-laboratoriais",
  ],
  "exame-toxicologico": [
    "exame-toxicologico-cnh",
    "exame-toxicologico-clt-motorista",
    "aso-exames-ocupacionais",
  ],
  "exame-admissional": [
    "aso-exames-ocupacionais",
    "exame-toxicologico-clt-motorista",
    "exame-toxicologico-cnh",
  ],
  "tomografia-computadorizada": [
    "tomografia-computadorizada-como-funciona",
    "tomografia-com-contraste",
    "diferenca-raio-x-tomografia",
  ],
  "raio-x": ["diferenca-raio-x-tomografia"],
  ultrassonografia: [
    "ultrassom-abdome-total-preparo",
    "ultrassom-transvaginal-preparo",
    "diferenca-ultrassom-comum-doppler",
    "mamografia-ultrassom-mamas-diferencas",
  ],
  mapa: [
    "exames-diagnostico-hipertensao",
    "mapa-ou-holter-diferenca",
    "check-up-cardiologico-prevencao-infarto",
  ],
  holter: [
    "mapa-ou-holter-diferenca",
    "exames-diagnostico-infarto",
    "check-up-cardiologico-prevencao-infarto",
  ],
  // Especialidades (/especialidades/:slug, 24/10/2026)
  endocrinologista: ["siglas-exames-laboratoriais", "exame-tsh-t4-livre-tireoide", "hemoglobina-glicada-exame"],
  gastroenterologista: ["ultrassom-abdome-total-preparo", "siglas-exames-laboratoriais"],
  "medicina-do-trabalho": ["aso-exames-ocupacionais", "exame-toxicologico-clt-motorista", "exame-toxicologico-cnh"],
  eletrocardiograma: [
    "eletrocardiograma-o-que-e-como-e-feito",
    "check-up-cardiologico-prevencao-infarto",
    "exames-diagnostico-infarto",
  ],
};

/**
 * "Exames de sangue que realizamos", em /exames/exames-de-sangue. Cada item
 * linka a pagina do exame ou o artigo; se o artigo ainda for rascunho, o nome
 * aparece sem link (nunca link para pagina com noindex).
 */
export const EXAMES_DE_SANGUE_LISTA: {
  nome: string;
  href?: string;
  blog?: string;
}[] = [
  { nome: "Hemograma completo", href: "/exames/hemograma" },
  { nome: "Hemoglobina glicada (HbA1c)", blog: "hemoglobina-glicada-exame" },
  { nome: "Glicemia de jejum", blog: "glicemia-de-jejum-exame" },
  {
    nome: "Curva glicêmica (TOTG)",
    blog: "curva-glicemica-teste-tolerancia-glicose",
  },
  { nome: "TSH e T4 livre (tireoide)", blog: "exame-tsh-t4-livre-tireoide" },
  { nome: "Beta HCG", blog: "beta-hcg-exame-de-gravidez" },
  {
    nome: "Colesterol e triglicerídeos (lipidograma)",
    blog: "exame-de-colesterol-lipidograma",
  },
  {
    nome: "Lipoproteína(a) e apolipoproteína B",
    blog: "lipoproteina-a-apolipoproteina-b",
  },
  { nome: "Vitamina D", blog: "vitamina-d-importancia-saude" },
];

type Publicado = { slug: string; title: string };

/** Artigos publicados ligados a um exame, na ordem do mapa. */
export function blogLinksFor<T extends Publicado>(
  examSlug: string,
  publicados: T[]
): T[] {
  return (EXAM_BLOG_LINKS[examSlug] ?? [])
    .map(slug => publicados.find(p => p.slug === slug))
    .filter((p): p is T => Boolean(p));
}

/** Lista de exames de sangue com o destino resolvido (ou sem link). */
export function examesDeSangueLista(
  publicados: Publicado[]
): { nome: string; href?: string }[] {
  return EXAMES_DE_SANGUE_LISTA.map(item => {
    if (item.href) return { nome: item.nome, href: item.href };
    const post = publicados.find(p => p.slug === item.blog);
    return post
      ? { nome: item.nome, href: `/blog/${post.slug}` }
      : { nome: item.nome };
  });
}
