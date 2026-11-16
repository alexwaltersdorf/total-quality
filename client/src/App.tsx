import { lazy } from "react";
import { AppShell, type PageMap } from "./AppShell";

/*
 * SEO nov/2026, Fase 6 — divisao do JS por rota. A Home (com todas as secoes)
 * e a pagina 404 eram import estatico: todo visitante de exame, artigo ou
 * consulta baixava o codigo da home no bundle de entrada. Agora a Home e um
 * chunk proprio, que o main.tsx busca ANTES do primeiro render quando a rota e
 * "/" (sem tela vazia de Suspense na pagina mais visitada).
 */
const carregarHome = () => import("./pages/Home");

// Rotas secundarias em lazy loading: cada pagina vira um chunk proprio,
// fora do bundle inicial que o paciente baixa na home. A arvore (rotas,
// providers, Suspense) vive em AppShell.tsx, compartilhada com o servidor
// (entry-server.tsx), que renderiza as mesmas paginas sem lazy.
export const lazyPages: PageMap = {
  Home: lazy(carregarHome),
  CheckUp: lazy(() => import("./pages/CheckUp")),
  Bioimpedancia: lazy(() => import("./pages/Bioimpedancia")),
  Blog: lazy(() => import("./pages/Blog")),
  BlogPost: lazy(() => import("./pages/BlogPost")),
  ExamesHub: lazy(() => import("./pages/ExamesHub")),
  ExamePage: lazy(() => import("./pages/ExamePage")),
  EspecialidadesHub: lazy(() => import("./pages/EspecialidadesHub")),
  LaboratorioCaraguatatuba: lazy(() => import("./pages/LaboratorioCaraguatatuba")),
  Sobre: lazy(() => import("./pages/Sobre")),
  Contato: lazy(() => import("./pages/Contato")),
  CallRedirect: lazy(() => import("./pages/CallRedirect")),
  ThankYouCall: lazy(() => import("./pages/ThankYouCall")),
  FormSubmissionSuccess: lazy(() => import("./pages/FormSubmissionSuccess")),
  CartaoPage: lazy(() => import("./pages/CartaoPage")),
  Privacidade: lazy(() => import("./pages/Privacidade")),
  Convenios: lazy(() => import("./pages/Convenios")),
  AutoSeoArticle: lazy(() => import("./pages/AutoSeoArticle")),
  NotFound: lazy(() => import("./pages/NotFound")),
};

/** Chunk da rota que o createRoot vai desenhar primeiro (so a home hoje). */
export function preloadRotaInicial(pathname: string): Promise<unknown> {
  if (pathname === "/" || pathname === "") return carregarHome();
  return Promise.resolve();
}

/**
 * Pre-carrega o chunk da rota antes de hidratar o HTML do servidor
 * (main.tsx). Sem isso a hidratacao espera o chunk dentro do <Suspense> —
 * funciona, mas atrasa os botoes. So as rotas renderizadas no servidor.
 */
export function preloadSsrRoute(pathname: string): Promise<unknown> {
  if (/^\/(exames|especialidades)\/[^/]+\/?$/.test(pathname)) return import("./pages/ExamePage");
  if (/^\/especialidades\/?$/.test(pathname)) return import("./pages/EspecialidadesHub");
  if (/^\/laboratorio-caraguatatuba\/?$/.test(pathname)) return import("./pages/LaboratorioCaraguatatuba");
  if (/^\/checkup\/?$/.test(pathname)) return import("./pages/CheckUp");
  if (/^\/bioimpedancia\/?$/.test(pathname)) return import("./pages/Bioimpedancia");
  if (/^\/sobre\/?$/.test(pathname)) return import("./pages/Sobre");
  if (/^\/contato\/?$/.test(pathname)) return import("./pages/Contato");
  return Promise.resolve();
}

export default function App() {
  return <AppShell pages={lazyPages} />;
}
