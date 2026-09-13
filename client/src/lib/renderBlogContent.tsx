/*
 * Renderiza o corpo de um artigo do blog (client/src/content/blog/<slug>.json)
 * interpretando a formatacao markdown leve usada nos textos: "## "/"### " para
 * titulos, "**negrito**" para enfase, "[texto](url)" para links explicitos,
 * linhas "- item" para listas e tabelas "| col | col |". Antes disso, cada
 * string do array virava um <p> literal — o visitante via os caracteres ##,
 * ** e | crus na pagina.
 *
 * A linkagem interna automatica (linkifyText) continua rodando em cima do
 * texto puro de cada trecho, entao um termo em negrito que tambem seja alvo
 * de link (ex: "**hemograma completo**") sai em negrito E como link. Um link
 * explicito "[texto](url)" registra seu destino em usedHrefs para que o
 * auto-linker nao duplique outro link para o mesmo alvo mais adiante.
 */
import type { ReactNode } from "react";
import { Link } from "wouter";
import { linkifyText } from "@/lib/internalLinkTargets";

const SITE_ORIGIN = "https://totalquality.med.br";

function toRelativeHref(url: string): string {
  return url.startsWith(SITE_ORIGIN) ? url.slice(SITE_ORIGIN.length) || "/" : url;
}

function renderInline(text: string, currentPath: string, usedHrefs: Set<string>, keyPrefix: string): ReactNode[] {
  const linkParts = text.split(/(\[[^\]]+\]\([^)]+\))/g).filter((p) => p.length > 0);
  const nodes: ReactNode[] = [];

  linkParts.forEach((part, li) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, linkText, url] = linkMatch;
      const isInternal = url.startsWith(SITE_ORIGIN) || url.startsWith("/");
      const href = toRelativeHref(url);
      if (isInternal) usedHrefs.add(href);
      nodes.push(
        isInternal ? (
          <Link key={`${keyPrefix}-${li}`} href={href} className="text-brand underline underline-offset-2 hover:opacity-80">
            {linkText}
          </Link>
        ) : (
          <a key={`${keyPrefix}-${li}`} href={url} target="_blank" rel="noopener noreferrer" className="text-brand underline underline-offset-2 hover:opacity-80">
            {linkText}
          </a>
        )
      );
      return;
    }

    const boldParts = part.split(/(\*\*[^*]+\*\*)/g).filter((p) => p.length > 0);
    boldParts.forEach((bp, bi) => {
      const isBold = bp.startsWith("**") && bp.endsWith("**");
      const raw = isBold ? bp.slice(2, -2) : bp;
      const spans = linkifyText(raw, currentPath, usedHrefs).map((span, j) =>
        span.href ? (
          <Link key={`${keyPrefix}-${li}-${bi}-${j}`} href={span.href} className="text-brand underline underline-offset-2 hover:opacity-80">
            {span.text}
          </Link>
        ) : (
          <span key={`${keyPrefix}-${li}-${bi}-${j}`}>{span.text}</span>
        )
      );
      nodes.push(isBold ? <strong key={`${keyPrefix}-${li}-${bi}`}>{spans}</strong> : <span key={`${keyPrefix}-${li}-${bi}`}>{spans}</span>);
    });
  });

  return nodes;
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function renderBlogContent(content: string[], currentPath: string): ReactNode[] {
  const usedHrefs = new Set<string>();
  let firstParagraphRendered = false;

  return content.map((block, i) => {
    const trimmed = block.trimStart();
    const key = `block-${i}`;

    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={key} className="heading-display text-2xl text-text mt-8 mb-3">
          {renderInline(trimmed.slice(4), currentPath, usedHrefs, key)}
        </h3>
      );
    }

    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={key} className="heading-display text-3xl text-text mt-10 mb-4">
          {renderInline(trimmed.slice(3), currentPath, usedHrefs, key)}
        </h2>
      );
    }

    if (trimmed.startsWith("|")) {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      const [headerLine, separatorLine, ...bodyLines] = lines;
      const header = parseTableRow(headerLine);
      const rows = (/^\|?[\s:|-]+\|?$/.test(separatorLine ?? "") ? bodyLines : [separatorLine, ...bodyLines].filter(Boolean)).map(parseTableRow);

      return (
        <div key={key} className="overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse border border-black/10">
            <thead>
              <tr className="bg-surface-light">
                {header.map((cell, c) => (
                  <th key={c} className="border border-black/10 px-4 py-2 text-left font-semibold text-text">
                    {renderInline(cell, currentPath, usedHrefs, `${key}-th-${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} className="border border-black/10 px-4 py-2 text-text-light align-top">
                      {renderInline(cell, currentPath, usedHrefs, `${key}-td-${r}-${c}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (trimmed.startsWith("- ")) {
      const items = block.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
      return (
        <ul key={key} className="list-disc pl-6 space-y-1.5 text-text leading-[1.85]">
          {items.map((item, it) => (
            <li key={it}>{renderInline(item, currentPath, usedHrefs, `${key}-li-${it}`)}</li>
          ))}
        </ul>
      );
    }

    const isFirst = !firstParagraphRendered;
    firstParagraphRendered = true;
    return (
      <p
        key={key}
        className={`text-text leading-[1.85] ${isFirst ? "text-lg first-letter:text-5xl first-letter:font-display first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:text-brand first-letter:leading-none" : "text-base"}`}
      >
        {renderInline(block, currentPath, usedHrefs, key)}
      </p>
    );
  });
}
