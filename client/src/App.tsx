import NotFound from "@/pages/NotFound";
import { lazy } from "react";
import { AppShell, type PageMap } from "./AppShell";
import Home from "./pages/Home";

// Rotas secundarias em lazy loading: cada pagina vira um chunk proprio,
// fora do bundle inicial que o paciente baixa na home. A arvore (rotas,
// providers, Suspense) vive em AppShell.tsx, compartilhada com o servidor
// (entry-server.tsx), que renderiza as mesmas paginas sem lazy.
export const lazyPages: PageMap = {
  Home,
  CheckUp: lazy(() => import("./pages/CheckUp")),
  Bioimpedancia: lazy(() => import("./pages/Bioimpedancia")),
  Blog: lazy(() => import("./pages/Blog")),
  BlogPost: lazy(() => import("./pages/BlogPost")),
  ExamesHub: lazy(() => import("./pages/ExamesHub")),
  ExamePage: lazy(() => import("./pages/ExamePage")),
  LaboratorioCaraguatatuba: lazy(() => import("./pages/LaboratorioCaraguatatuba")),
  CallRedirect: lazy(() => import("./pages/CallRedirect")),
  ThankYouCall: lazy(() => import("./pages/ThankYouCall")),
  FormSubmissionSuccess: lazy(() => import("./pages/FormSubmissionSuccess")),
  CartaoPage: lazy(() => import("./pages/CartaoPage")),
  Privacidade: lazy(() => import("./pages/Privacidade")),
  Convenios: lazy(() => import("./pages/Convenios")),
  OutubroRosa: lazy(() => import("./pages/OutubroRosa")),
  AutoSeoArticle: lazy(() => import("./pages/AutoSeoArticle")),
  NotFound,
};

/**
 * Pre-carrega o chunk da rota antes de hidratar o HTML do servidor
 * (main.tsx). Sem isso a hidratacao espera o chunk dentro do <Suspense> —
 * funciona, mas atrasa os botoes. So as rotas renderizadas no servidor.
 */
export function preloadSsrRoute(pathname: string): Promise<unknown> {
  if (/^\/(exames|especialidades)\/[^/]+\/?$/.test(pathname)) return import("./pages/ExamePage");
  if (/^\/laboratorio-caraguatatuba\/?$/.test(pathname)) return import("./pages/LaboratorioCaraguatatuba");
  if (/^\/checkup\/?$/.test(pathname)) return import("./pages/CheckUp");
  if (/^\/bioimpedancia\/?$/.test(pathname)) return import("./pages/Bioimpedancia");
  return Promise.resolve();
}

export default function App() {
  return <AppShell pages={lazyPages} />;
}
