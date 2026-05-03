import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CheckUp from "./pages/CheckUp";
import Bioimpedancia from "./pages/Bioimpedancia";
import Dashboard from "./pages/Dashboard";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Admin from "./pages/Admin";
import ExamePage from "./pages/ExamePage";
import LaboratorioCaraguatatuba from "./pages/LaboratorioCaraguatatuba";
import CallRedirect from "./pages/CallRedirect";
import ThankYouCall from "./pages/ThankYouCall";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/checkup"} component={CheckUp} />
      <Route path={"/bioimpedancia"} component={Bioimpedancia} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogPost} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/laboratorio-caraguatatuba"} component={LaboratorioCaraguatatuba} />
      <Route path={"/exames/:slug"} component={ExamePage} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/admin/:tab"} component={Admin} />
      <Route path={"/ligar"} component={CallRedirect} />
      <Route path={"/obrigado-chamada"} component={ThankYouCall} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
