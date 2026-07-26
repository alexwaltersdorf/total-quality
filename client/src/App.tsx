import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

// Rotas secundarias em lazy loading: mantem Admin/Dashboard (recharts etc.)
// fora do bundle inicial que o paciente baixa na home.
const CheckUp = lazy(() => import("./pages/CheckUp"));
const Bioimpedancia = lazy(() => import("./pages/Bioimpedancia"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Admin = lazy(() => import("./pages/Admin"));
const ExamesHub = lazy(() => import("./pages/ExamesHub"));
const ExamePage = lazy(() => import("./pages/ExamePage"));
const LaboratorioCaraguatatuba = lazy(() => import("./pages/LaboratorioCaraguatatuba"));
const CallRedirect = lazy(() => import("./pages/CallRedirect"));
const ThankYouCall = lazy(() => import("./pages/ThankYouCall"));
const FormSubmissionSuccess = lazy(() => import("./pages/FormSubmissionSuccess"));
const CartaoPage = lazy(() => import("./pages/CartaoPage"));
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
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/laboratorio-caraguatatuba"} component={LaboratorioCaraguatatuba} />
      <Route path={"/exames"} component={ExamesHub} />
      <Route path={"/exames/:slug"} component={ExamePage} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/admin/:tab"} component={Admin} />
      <Route path={"/ligar"} component={CallRedirect} />
      <Route path={"/obrigado-chamada"} component={ThankYouCall} />
      <Route path={"/formulario-sucesso"} component={FormSubmissionSuccess} />
      <Route path={"/cartao"} component={CartaoPage} />
      {/* Catch-all de artigos AutoSEO: DEVE ficar por ultimo, depois das rotas estaticas,
          para nao interceptar /laboratorio-caraguatatuba, /cartao, /dashboard, etc. */}
      <Route path={"/:slug"} component={AutoSeoArticle} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
