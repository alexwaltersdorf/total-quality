import NotFound from "@/pages/NotFound";
import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { getTrackingSessionId } from "@/lib/leadTracker";
import { captureUTMParams, getUTMForAPI } from "@/lib/utmTracker";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

// Rotas secundarias em lazy loading: cada pagina vira um chunk proprio,
// fora do bundle inicial que o paciente baixa na home.
const CheckUp = lazy(() => import("./pages/CheckUp"));
const Bioimpedancia = lazy(() => import("./pages/Bioimpedancia"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const ExamesHub = lazy(() => import("./pages/ExamesHub"));
const ExamePage = lazy(() => import("./pages/ExamePage"));
const LaboratorioCaraguatatuba = lazy(() => import("./pages/LaboratorioCaraguatatuba"));
const CallRedirect = lazy(() => import("./pages/CallRedirect"));
const ThankYouCall = lazy(() => import("./pages/ThankYouCall"));
const FormSubmissionSuccess = lazy(() => import("./pages/FormSubmissionSuccess"));
const CartaoPage = lazy(() => import("./pages/CartaoPage"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const Convenios = lazy(() => import("./pages/Convenios"));
const AutoSeoArticle = lazy(() => import("./pages/AutoSeoArticle"));

function Router() {
  return (
    <Suspense fallback={null}>
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/checkup"} component={CheckUp} />
      <Route path={"/bioimpedancia"} component={Bioimpedancia} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogPost} />
      <Route path={"/laboratorio-caraguatatuba"} component={LaboratorioCaraguatatuba} />
      <Route path={"/exames"} component={ExamesHub} />
      <Route path={"/exames/:slug"} component={ExamePage} />
      <Route path={"/ligar"} component={CallRedirect} />
      <Route path={"/obrigado-chamada"} component={ThankYouCall} />
      <Route path={"/formulario-sucesso"} component={FormSubmissionSuccess} />
      <Route path={"/cartao"} component={CartaoPage} />
      <Route path={"/privacidade"} component={Privacidade} />
      <Route path={"/convenios"} component={Convenios} />
      {/* Catch-all de artigos AutoSEO: DEVE ficar por ultimo, depois das rotas estaticas,
          para nao interceptar /laboratorio-caraguatatuba, /cartao, /dashboard, etc. */}
      <Route path={"/:slug"} component={AutoSeoArticle} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

const Toaster = lazy(() => import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })));
const CookieConsent = lazy(() => import("@/components/CookieConsent"));

/**
 * Captura a primeira origem da visita em qualquer rota de entrada. Antes isso
 * existia apenas na Home, então uma entrada orgânica direta em /blog ou
 * /exames perdia a atribuição antes da conversão.
 */
function useAttributionSession() {
  useEffect(() => {
    captureUTMParams();
    const utm = getUTMForAPI();
    const sessionId = getTrackingSessionId();

    fetch("/api/trpc/session.track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      keepalive: true,
      body: JSON.stringify({ json: {
        sessionId,
        ...utm,
        landingPage: utm.landingPage || window.location.pathname,
        device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : /Tablet|iPad/i.test(navigator.userAgent) ? "tablet" : "desktop",
        browser: navigator.userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)/)?.[1] || "Outro",
        os: navigator.platform || "Desconhecido",
      }}),
    }).catch(() => {
      // A medição nunca pode impedir o carregamento do site.
    });
  }, []);
}

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

function App() {
  useAttributionSession();
  // Fonte unica de page_view do site (ver docs/analytics.md).
  usePageViewTracking();

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <DeferredToaster />
        <Suspense fallback={null}>
          <CookieConsent />
        </Suspense>
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
