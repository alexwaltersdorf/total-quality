/*
 * Pagina 404 (SEO nov/2026, Fase 6). Antes: texto em ingles ("Page Not
 * Found"), um botao so e, no HTML do servidor, robots "index, follow" com o
 * canonical da home. Agora o servidor responde 404 com noindex e sem canonical
 * (server/_core/vite.ts, paginaNaoEncontrada) e o mesmo texto desta pagina;
 * numa navegacao interna ate uma rota inexistente, o efeito abaixo faz o
 * mesmo no <head> e desfaz ao sair.
 */
import { useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LINKS: Array<[string, string]> = [
  ["/exames", "Exames laboratoriais e de imagem"],
  ["/especialidades", "Consultas e especialidades"],
  ["/blog", "Blog: saúde e diagnóstico"],
  ["/", "Página inicial da Total Quality"],
];

export default function NotFound() {
  useEffect(() => {
    const tituloAnterior = document.title;
    document.title = "Página não encontrada | Total Quality";
    const robots = document.querySelector('meta[name="robots"]');
    const robotsAnterior = robots?.getAttribute("content") ?? null;
    robots?.setAttribute("content", "noindex, follow");
    const canonical = document.querySelector('link[rel="canonical"]');
    const pai = canonical?.parentNode ?? null;
    canonical?.remove();
    return () => {
      document.title = tituloAnterior;
      if (robots && robotsAnterior !== null) robots.setAttribute("content", robotsAnterior);
      if (canonical && pai) pai.appendChild(canonical);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-36 pb-20">
        <div className="container max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand mb-3">Erro 404</p>
          <h1 className="heading-display text-5xl md:text-6xl text-text mb-4">Página não encontrada</h1>
          <p className="text-text-light leading-relaxed mb-8">
            O endereço que você abriu não existe ou mudou de lugar. Veja se encontra o que procura por aqui:
          </p>
          <ul className="space-y-3 mb-10">
            {LINKS.map(([href, rotulo]) => (
              <li key={href}>
                <Link href={href} className="text-brand underline underline-offset-4 hover:opacity-80 text-lg">
                  {rotulo}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-sm text-text-muted">
            Não encontrou? Fale com a nossa equipe pelo WhatsApp (12) 3887-3535, de segunda a sexta, das 7h30 às 18h.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
