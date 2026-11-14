/*
 * Renderizacao no servidor das rotas de template (SEO nov/2026, Fase 1).
 *
 * Antes, server/_core/seo-content.ts escrevia a mao um HTML "parecido" com a
 * pagina e o React o apagava ao montar (createRoot). As duas versoes se
 * separaram: H1 em outra caixa, H2 em outra ordem, FAQ do check-up so no
 * servidor, description diferente. Agora o servidor renderiza o PROPRIO
 * componente React — o que o Google le e o que o paciente ve saem da mesma
 * funcao — e o navegador hidrata esse HTML (main.tsx) em vez de redesenhar.
 *
 * So as rotas de SSR_PAGES. As demais seguem com o pre-render de
 * seo-content.ts ate migrarem.
 *
 * Nada aqui pode tocar window/document/localStorage durante o render: os
 * componentes fazem isso em useEffect. renderToString nao roda efeitos.
 */
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "@/lib/trpc";
import { AppShell, type PageMap } from "./AppShell";
import ExamePage from "./pages/ExamePage";
import LaboratorioCaraguatatuba from "./pages/LaboratorioCaraguatatuba";
import CheckUp from "./pages/CheckUp";
import Bioimpedancia from "./pages/Bioimpedancia";
import { examesData } from "@/lib/examesData";
import { especialidadesData, ESPECIALIDADES_BASE } from "@/lib/especialidadesData";

const Nada = () => null;

/** Paginas renderizadas no servidor; o resto do mapa nunca e alcancado aqui. */
const SSR_PAGES: PageMap = {
  Home: Nada,
  CheckUp,
  Bioimpedancia,
  Blog: Nada,
  BlogPost: Nada,
  ExamesHub: Nada,
  ExamePage,
  LaboratorioCaraguatatuba,
  CallRedirect: Nada,
  ThankYouCall: Nada,
  FormSubmissionSuccess: Nada,
  CartaoPage: Nada,
  Privacidade: Nada,
  Convenios: Nada,
  OutubroRosa: Nada,
  AutoSeoArticle: Nada,
  NotFound: Nada,
};

const EXAM_SLUGS = new Set(examesData.map((e) => e.slug));
const ESPECIALIDADE_SLUGS = new Set(especialidadesData.map((e) => e.slug));

/** Caminho normalizado (sem barra final e sem query) se a rota e de SSR. */
export function isSsrPath(pathname: string): boolean {
  const path = pathname.split("?")[0].replace(/\/$/, "") || "/";
  if (["/laboratorio-caraguatatuba", "/checkup", "/bioimpedancia"].includes(path)) return true;
  const exame = path.match(/^\/exames\/([a-z0-9-]+)$/);
  if (exame) return EXAM_SLUGS.has(exame[1]);
  const esp = path.match(new RegExp(`^${ESPECIALIDADES_BASE}/([a-z0-9-]+)$`));
  if (esp) return ESPECIALIDADE_SLUGS.has(esp[1]);
  return false;
}

/*
 * Os providers de dados nao geram DOM: entram aqui so para os hooks que os
 * exigem (formulario de contato) funcionarem igual no servidor. Nenhuma
 * consulta e disparada durante o render.
 */
const trpcClient = trpc.createClient({
  links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })],
});

/**
 * HTML do #root para a rota, ou null se ela nao e renderizada no servidor.
 * `pathname` e o caminho como o navegador o vera (o wouter casa as rotas com
 * ele dos dois lados).
 */
export function renderSsrPage(pathname: string): string | null {
  if (!isSsrPath(pathname)) return null;
  const path = pathname.split("?")[0].replace(/\/$/, "") || "/";
  const queryClient = new QueryClient();
  return renderToString(
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppShell pages={SSR_PAGES} ssrPath={path} />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
