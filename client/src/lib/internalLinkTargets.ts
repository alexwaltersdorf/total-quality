/*
 * Linkagem interna automática dos corpos de artigo do blog (ago/2026).
 *
 * Motivação: os artigos são a camada informacional do site e não linkavam
 * NADA — zero repasse de autoridade para as páginas estratégicas. A linkagem
 * interna é o que diz ao Google qual página é a mais importante para cada
 * palavra-chave (blog informacional → página transacional).
 *
 * Este mapa é a fonte única, usado pelo prerender (server/_core/seo-content.ts)
 * e pelo BlogPost.tsx. Arquivo PURO: sem imports de node nem react.
 *
 * Regras aplicadas por linkifyText:
 * - frases mais longas têm prioridade (ordem do array);
 * - no máximo UM link por destino em cada artigo (primeira ocorrência);
 * - nunca linka para a própria página;
 * - limite de MAX_AUTO_LINKS por artigo para não virar spam.
 */
export type LinkTarget = { terms: string[]; href: string };

export const LINK_TARGETS: LinkTarget[] = [
  { terms: ["laboratório de análises clínicas em Caraguatatuba", "laboratório em Caraguatatuba", "exames laboratoriais", "exame laboratorial"], href: "/laboratorio-caraguatatuba" },
  { terms: ["exames de sangue", "exame de sangue"], href: "/exames/exames-de-sangue" },
  { terms: ["hemograma completo", "hemograma"], href: "/exames/hemograma" },
  { terms: ["tomografia computadorizada", "tomografia"], href: "/exames/tomografia-computadorizada" },
  { terms: ["ultrassonografia"], href: "/exames/ultrassonografia" },
  { terms: ["mamografia digital", "mamografia"], href: "/exames/mamografia" },
  { terms: ["raio-x"], href: "/exames/raio-x" },
  { terms: ["eletrocardiograma"], href: "/exames/eletrocardiograma" },
  { terms: ["eletroencefalograma"], href: "/exames/eletroencefalograma" },
  { terms: ["espirometria"], href: "/exames/espirometria" },
  { terms: ["exame toxicológico"], href: "/exames/exame-toxicologico" },
  { terms: ["exame admissional"], href: "/exames/exame-admissional" },
  { terms: ["bioimpedância"], href: "/bioimpedancia" },
  { terms: ["check-up preventivo", "check-up"], href: "/checkup" },
  { terms: ["convênios"], href: "/convenios" },
];

export const MAX_AUTO_LINKS = 8;

export type TextSpan = { text: string; href?: string };

const BOUNDARY = "A-Za-zÀ-ÖØ-öø-ÿ0-9";

/**
 * Divide um parágrafo em trechos de texto e trechos-link, aplicando as regras
 * acima. `usedHrefs` acumula os destinos já linkados no artigo (passar o mesmo
 * Set para todos os parágrafos, na ordem em que aparecem na página).
 */
export function linkifyText(
  paragraph: string,
  currentPath: string,
  usedHrefs: Set<string>
): TextSpan[] {
  let spans: TextSpan[] = [{ text: paragraph }];
  for (const target of LINK_TARGETS) {
    if (target.href === currentPath) continue;
    if (usedHrefs.has(target.href)) continue;
    if (usedHrefs.size >= MAX_AUTO_LINKS) break;
    for (const term of target.terms) {
      const re = new RegExp(
        `(?<![${BOUNDARY}])(${term.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&")})(?![${BOUNDARY}])`,
        "i"
      );
      let linked = false;
      spans = spans.flatMap((span) => {
        if (span.href || linked) return [span];
        const m = re.exec(span.text);
        if (!m || m.index === undefined) return [span];
        linked = true;
        usedHrefs.add(target.href);
        const before = span.text.slice(0, m.index);
        const after = span.text.slice(m.index + m[1].length);
        const out: TextSpan[] = [];
        if (before) out.push({ text: before });
        out.push({ text: m[1], href: target.href });
        if (after) out.push({ text: after });
        return out;
      });
      if (linked) break;
    }
  }
  return spans;
}
