/*
 * Catalogo das paginas de servico (SEO nov/2026, Fase 3): para cada rota, o
 * conteudo do modelo (lib/modeloPagina.ts) e o cartao usado em "Exames
 * relacionados" e no indice /especialidades. Puro: cliente e servidor.
 */
import { examesData } from "./examesData";
import { especialidadesData, ESPECIALIDADES_BASE } from "./especialidadesData";
import { PAGINAS_EXAMES } from "./paginas/exames";
import { PAGINAS_ESPECIALIDADES } from "./paginas/especialidades";
import { PAGINA_BIOIMPEDANCIA, PAGINA_CHECKUP, PAGINA_LABORATORIO } from "./paginasServico";
import type { ConteudoPagina } from "./modeloPagina";

export interface CartaoServico {
  href: string;
  rotulo: string;
  titulo: string;
  descricao: string;
}

const CARTOES_FIXOS: Record<string, CartaoServico> = {
  "/laboratorio-caraguatatuba": {
    href: "/laboratorio-caraguatatuba",
    rotulo: "Laboratório",
    titulo: "Análises clínicas",
    descricao: "Mais de 3.000 tipos de exames laboratoriais, com coleta por ordem de chegada.",
  },
  "/checkup": {
    href: "/checkup",
    rotulo: "Saúde preventiva",
    titulo: "Check-up",
    descricao: "Planos Básico, Select e Premium, com os exames feitos em um único dia.",
  },
  "/bioimpedancia": {
    href: "/bioimpedancia",
    rotulo: "Composição corporal",
    titulo: "Bioimpedância",
    descricao: "Gordura, massa muscular, água e taxa metabólica, com resultado na hora.",
  },
  [ESPECIALIDADES_BASE]: {
    href: ESPECIALIDADES_BASE,
    rotulo: "Consultas",
    titulo: "Especialidades",
    descricao: "Consultas com especialistas e medicina do trabalho para empresas.",
  },
};

/** Cartao de uma rota de servico, ou undefined se a rota nao existe. */
export function cartaoDaRota(rota: string): CartaoServico | undefined {
  if (CARTOES_FIXOS[rota]) return CARTOES_FIXOS[rota];
  const exame = rota.match(/^\/exames\/([a-z0-9-]+)$/);
  const e = exame
    ? examesData.find((x) => x.slug === exame[1])
    : especialidadesData.find((x) => `${ESPECIALIDADES_BASE}/${x.slug}` === rota);
  if (!e) return undefined;
  return { href: rota, rotulo: e.subtitle, titulo: e.shortTitle, descricao: e.description };
}

/** Conteudo do modelo de pagina para a rota (sem barra final). */
export function conteudoDaRota(rota: string): ConteudoPagina | undefined {
  if (rota === "/laboratorio-caraguatatuba") return PAGINA_LABORATORIO;
  if (rota === "/checkup") return PAGINA_CHECKUP;
  if (rota === "/bioimpedancia") return PAGINA_BIOIMPEDANCIA;
  const exame = rota.match(/^\/exames\/([a-z0-9-]+)$/);
  if (exame) return PAGINAS_EXAMES[exame[1]];
  const esp = rota.match(new RegExp(`^${ESPECIALIDADES_BASE}/([a-z0-9-]+)$`));
  if (esp) return PAGINAS_ESPECIALIDADES[esp[1]];
  return undefined;
}

/** Todas as rotas do modelo, com o conteudo (teste, sitemap, relatorio). */
export function rotasDoModelo(): Array<[string, ConteudoPagina]> {
  const rotas = [
    "/laboratorio-caraguatatuba",
    "/checkup",
    "/bioimpedancia",
    ...examesData.map((e) => `/exames/${e.slug}`),
    ...especialidadesData.map((e) => `${ESPECIALIDADES_BASE}/${e.slug}`),
  ];
  return rotas.map((r) => [r, conteudoDaRota(r)]).filter((x): x is [string, ConteudoPagina] => Boolean(x[1]));
}
