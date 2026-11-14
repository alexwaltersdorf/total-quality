import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot, hydrateRoot } from "react-dom/client";
import superjson from "superjson";
import App, { preloadSsrRoute } from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

const arvore = (
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);

/*
 * SEO nov/2026, Fase 1. Nas rotas de template o servidor manda o HTML do
 * proprio React (client/src/entry-server.tsx) e marca o #root com data-ssr.
 * Ai o React HIDRATA esse HTML: o primeiro paint ja e o layout final, sem a
 * troca de bloco que causava o CLS. O chunk da rota e baixado antes, para os
 * botoes responderem assim que a hidratacao termina.
 *
 * Nas demais rotas segue o comportamento anterior: o pre-render de
 * seo-content.ts e substituido pela aplicacao (createRoot).
 */
const root = document.getElementById("root")!;
if (root.hasAttribute("data-ssr")) {
  preloadSsrRoute(window.location.pathname)
    .catch(() => undefined)
    .then(() => {
      hydrateRoot(root, arvore);
    });
} else {
  // A animacao de entrada (.reveal) so esconde com esta classe; aqui nao ha
  // HTML do servidor a preservar (ver hooks/useScrollReveal.ts).
  document.documentElement.classList.add("reveal-on");
  createRoot(root).render(arvore);
}
