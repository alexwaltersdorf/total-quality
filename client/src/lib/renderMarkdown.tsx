/*
 * Renderizador de markdown enxuto para os artigos do AutoSEO.
 *
 * Substitui a biblioteca `streamdown` (removida em 21/08/2026), que existia
 * para renderizar markdown de IA em streaming com destaque de sintaxe. Num site
 * de laboratorio de analises clinicas isso custava caro sem servir a ninguem: a
 * pagina de artigo baixava 271,8 KB gzip e o build carregava 73 gramaticas de
 * linguagem (463 KB gzip) — emacs-lisp, C++, WebAssembly, Wolfram — alem de
 * mermaid e cytoscape.
 *
 * SEGURANCA: o conteudo vem de um webhook externo (server/_core/syncAutoSeo.ts).
 * Este renderizador devolve ELEMENTOS REACT e nunca injeta HTML cru — o React
 * escapa todo texto, entao markdown malicioso vira texto inofensivo em vez de
 * HTML executavel. Construcoes nao suportadas degradam para texto puro, nunca
 * quebram a pagina. Ha guard-rail de teste garantindo essa propriedade.
 *
 * Suporta o que artigos de saude usam: titulos, paragrafos, negrito, italico,
 * codigo inline, links, listas e citacoes.
 */
import type { ReactNode } from "react";

/** Divide uma linha em spans de negrito, italico, codigo inline e links. */
function renderInline(texto: string, chaveBase: string): ReactNode[] {
  // Ordem importa: link antes de enfase, para nao quebrar [texto](url).
  const padrao =
    /(\[[^\]]+\]\([^)\s]+\))|(\*\*[^*]+\*\*)|(__[^_]+__)|(\*[^*]+\*)|(_[^_]+_)|(`[^`]+`)/g;
  const saida: ReactNode[] = [];
  let ultimo = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = padrao.exec(texto)) !== null) {
    if (m.index > ultimo) saida.push(texto.slice(ultimo, m.index));
    const t = m[0];
    const k = `${chaveBase}-i${i++}`;

    if (t.startsWith("[")) {
      const fim = t.indexOf("](");
      const rotulo = t.slice(1, fim);
      const href = t.slice(fim + 2, -1);
      // Só http(s) e caminhos internos: bloqueia javascript: e data:.
      const seguro = /^(https?:\/\/|\/)/i.test(href);
      saida.push(
        seguro ? (
          <a
            key={k}
            href={href}
            {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {rotulo}
          </a>
        ) : (
          <span key={k}>{rotulo}</span>
        )
      );
    } else if (t.startsWith("**") || t.startsWith("__")) {
      saida.push(<strong key={k}>{t.slice(2, -2)}</strong>);
    } else if (t.startsWith("`")) {
      saida.push(<code key={k}>{t.slice(1, -1)}</code>);
    } else {
      saida.push(<em key={k}>{t.slice(1, -1)}</em>);
    }
    ultimo = m.index + t.length;
  }

  if (ultimo < texto.length) saida.push(texto.slice(ultimo));
  return saida;
}

/** Converte markdown em elementos React. */
export function renderMarkdown(markdown: string): ReactNode[] {
  const linhas = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocos: ReactNode[] = [];
  let paragrafo: string[] = [];
  let lista: { ordenada: boolean; itens: string[] } | null = null;
  let citacao: string[] = [];
  let n = 0;

  const fecharParagrafo = () => {
    if (paragrafo.length === 0) return;
    const texto = paragrafo.join(" ").trim();
    if (texto) blocos.push(<p key={`p${n++}`}>{renderInline(texto, `p${n}`)}</p>);
    paragrafo = [];
  };

  const fecharLista = () => {
    if (!lista || lista.itens.length === 0) {
      lista = null;
      return;
    }
    const itens = lista.itens.map((it, j) => <li key={j}>{renderInline(it, `l${n}-${j}`)}</li>);
    blocos.push(lista.ordenada ? <ol key={`l${n++}`}>{itens}</ol> : <ul key={`l${n++}`}>{itens}</ul>);
    lista = null;
  };

  const fecharCitacao = () => {
    if (citacao.length === 0) return;
    const texto = citacao.join(" ").trim();
    if (texto) blocos.push(<blockquote key={`q${n++}`}>{renderInline(texto, `q${n}`)}</blockquote>);
    citacao = [];
  };

  const fecharTudo = () => {
    fecharParagrafo();
    fecharLista();
    fecharCitacao();
  };

  for (const bruta of linhas) {
    const linha = bruta.trimEnd();

    if (!linha.trim()) {
      fecharTudo();
      continue;
    }

    // Cerca de código: o conteúdo vira texto puro, sem destaque de sintaxe.
    if (/^```/.test(linha)) {
      fecharTudo();
      continue;
    }

    const titulo = /^(#{1,6})\s+(.*)$/.exec(linha);
    if (titulo) {
      fecharTudo();
      const nivel = titulo[1].length;
      const conteudo = renderInline(titulo[2], `h${n}`);
      // h1 fica reservado ao título do artigo; markdown começa em h2.
      const Tag = (nivel === 1 ? "h2" : `h${Math.min(nivel, 6)}`) as "h2";
      blocos.push(<Tag key={`h${n++}`}>{conteudo}</Tag>);
      continue;
    }

    if (/^(\*\*\*|---|___)\s*$/.test(linha)) {
      fecharTudo();
      blocos.push(<hr key={`hr${n++}`} />);
      continue;
    }

    if (/^>\s?/.test(linha)) {
      fecharParagrafo();
      fecharLista();
      citacao.push(linha.replace(/^>\s?/, ""));
      continue;
    }

    const naoOrdenada = /^\s*[-*+]\s+(.*)$/.exec(linha);
    const ordenada = /^\s*\d+[.)]\s+(.*)$/.exec(linha);
    if (naoOrdenada || ordenada) {
      fecharParagrafo();
      fecharCitacao();
      const querOrdenada = Boolean(ordenada);
      if (!lista || lista.ordenada !== querOrdenada) {
        fecharLista();
        lista = { ordenada: querOrdenada, itens: [] };
      }
      lista.itens.push((naoOrdenada ?? ordenada)![1]);
      continue;
    }

    fecharLista();
    fecharCitacao();
    paragrafo.push(linha.trim());
  }

  fecharTudo();
  return blocos;
}
