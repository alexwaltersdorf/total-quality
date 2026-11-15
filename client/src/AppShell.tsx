/*
 * Casca da aplicacao, compartilhada pelo cliente (App.tsx) e pelo servidor
 * (entry-server.tsx). SEO nov/2026, Fase 1 — fonte unica de conteudo.
 *
 * Por que existe: nas rotas de template (exames, especialidades, analises
 * clinicas, check-up, bioimpedancia, /sobre e /contato) o servidor passou a
 * renderizar o MESMO componente React que o navegador mostra, e o navegador
 * hidrata esse HTML (hydrateRoot) em vez de apaga-lo. Para a hidratacao
 * casar, a arvore do servidor tem de ser identica a do cliente — mesmos
 * providers, mesmos <Suspense> nas mesmas posicoes, mesmas rotas. Por isso a
 * arvore vive aqui uma vez so; muda apenas o mapa de paginas: o cliente passa
 * componentes em React.lazy (um chunk por rota), o servidor passa os mesmos
 * componentes importados estaticamente (sem nada a esperar).
 *
 * Regra ao editar: nada que dependa do navegador (localStorage, consentimento,
 * tamanho de tela) pode mudar o PRIMEIRO render. Isso vai para useEffect ou
 * para <ClientOnly>, senao o React acusa divergencia de hidratacao.
 */
import { Suspense, lazy, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { Route, Router, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { useInteractionTracking } from "@/hooks/useInteractionTracking";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ContatoLeadProvider } from "./contexts/ContatoLeadContext";

export type PageKey =
  | "Home"
  | "CheckUp"
  | "Bioimpedancia"
  | "Blog"
  | "BlogPost"
  | "ExamesHub"
  | "ExamePage"
  | "LaboratorioCaraguatatuba"
  | "Sobre"
  | "Contato"
  | "CallRedirect"
  | "ThankYouCall"
  | "FormSubmissionSuccess"
  | "CartaoPage"
  | "Privacidade"
  | "Convenios"
  | "OutubroRosa"
  | "AutoSeoArticle"
  | "NotFound";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PageMap = Record<PageKey, ComponentType<any>>;

function Routes({ pages }: { pages: PageMap }) {
  return (
    <Suspense fallback={null}>
    <Switch>
      <Route path={"/"} component={pages.Home} />
      <Route path={"/checkup"} component={pages.CheckUp} />
      <Route path={"/bioimpedancia"} component={pages.Bioimpedancia} />
      <Route path={"/blog"} component={pages.Blog} />
      <Route path={"/blog/:slug"} component={pages.BlogPost} />
      <Route path={"/laboratorio-caraguatatuba"} component={pages.LaboratorioCaraguatatuba} />
      <Route path={"/sobre"} component={pages.Sobre} />
      <Route path={"/contato"} component={pages.Contato} />
      <Route path={"/exames"} component={pages.ExamesHub} />
      <Route path={"/exames/:slug"} component={pages.ExamePage} />
      <Route path={"/especialidades/:slug"} component={pages.ExamePage} />
      <Route path={"/ligar"} component={pages.CallRedirect} />
      <Route path={"/obrigado-chamada"} component={pages.ThankYouCall} />
      <Route path={"/formulario-sucesso"} component={pages.FormSubmissionSuccess} />
      <Route path={"/cartao"} component={pages.CartaoPage} />
      <Route path={"/privacidade"} component={pages.Privacidade} />
      <Route path={"/convenios"} component={pages.Convenios} />
      <Route path={"/outubro-rosa"} component={pages.OutubroRosa} />
      {/* Catch-all de artigos AutoSEO: DEVE ficar por ultimo, depois das rotas estaticas,
          para nao interceptar /laboratorio-caraguatatuba, /cartao, /dashboard, etc. */}
      <Route path={"/:slug"} component={pages.AutoSeoArticle} />
      <Route path={"/404"} component={pages.NotFound} />
      <Route component={pages.NotFound} />
    </Switch>
    </Suspense>
  );
}

/** Renderiza os filhos so depois da hidratacao (servidor e 1o render: nada). */
export function ClientOnly({ children }: { children: ReactNode }) {
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  return montado ? <>{children}</> : null;
}

const Toaster = lazy(() => import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })));
const CookieConsent = lazy(() => import("@/components/CookieConsent"));

/**
 * Carrega o Toaster (sonner) apos o navegador ficar ocioso. Toasts sempre
 * partem de uma acao do usuario (envio de formulario), que ocorre bem depois
 * do carregamento inicial — manter sonner fora do caminho critico reduz o TBT.
 */
function DeferredToaster() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const show = () => setReady(true);
    const idle = typeof window.requestIdleCallback === "function" ? window.requestIdleCallback : null;
    if (idle) {
      const id = idle(show, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(show, 2000);
    return () => window.clearTimeout(id);
  }, []);

  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <Toaster />
    </Suspense>
  );
}

/**
 * O JSON-LD da rota pre-renderizada vai no <head> (data-route-ld), injetado
 * pelo servidor. Numa navegacao interna ele deixaria de valer para a pagina
 * nova; sai na primeira troca de rota.
 */
function useLimpaJsonLdDaRotaInicial() {
  const [location] = useLocation();
  const inicial = useRef(location);
  useEffect(() => {
    if (location === inicial.current) return;
    document.querySelectorAll("script[data-route-ld]").forEach((el) => el.remove());
  }, [location]);
}

function App({ pages }: { pages: PageMap }) {
  // Fonte unica de page_view do site (ver docs/analytics.md).
  usePageViewTracking();
  useInteractionTracking();
  useLimpaJsonLdDaRotaInicial();

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <ContatoLeadProvider>
          <DeferredToaster />
          <ClientOnly>
            <Suspense fallback={null}>
              <CookieConsent />
            </Suspense>
          </ClientOnly>
          <Routes pages={pages} />
        </ContatoLeadProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export function AppShell({ pages, ssrPath }: { pages: PageMap; ssrPath?: string }) {
  // No servidor o wouter precisa saber o caminho; no navegador ele le a URL.
  // <Router> nao gera DOM, entao nao altera a hidratacao.
  const app = <App pages={pages} />;
  return ssrPath === undefined ? app : <Router ssrPath={ssrPath}>{app}</Router>;
}
