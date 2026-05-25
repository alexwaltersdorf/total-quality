/**
 * Giscus Comments Component
 * Integra comentários baseados em GitHub Discussions
 * Reutilizável em páginas de artigos (BlogPost e AutoSeoArticle)
 */
import { useEffect, useRef } from "react";

interface GiscusCommentsProps {
  articleId: string; // Slug do artigo para usar como identificador único
  articleTitle: string; // Título do artigo para a discussion
  theme?: "light" | "dark"; // Tema dos comentários
}

export default function GiscusComments({
  articleId,
  articleTitle,
  theme = "light",
}: GiscusCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Limpar comentários anteriores se existirem
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    // Criar script do Giscus
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";

    // Configurar atributos do Giscus
    script.setAttribute("data-repo", "totalqualitymedicina/total-quality-blog");
    script.setAttribute("data-repo-id", "R_kgDON2Z4Yw"); // Será atualizado após criar o repo
    script.setAttribute("data-category", "Blog Artigos");
    script.setAttribute("data-category-id", "DIC_kwDON2Z4Yc4CkAZu"); // Será atualizado após criar o repo
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", articleId); // Usa o slug como identificador único
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", theme);
    script.setAttribute("data-lang", "pt");
    script.setAttribute("data-loading", "lazy");

    // Adicionar script ao container
    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }
  }, [articleId, theme]);

  return (
    <div
      ref={containerRef}
      className="giscus-container mt-12 pt-8 border-t border-black/10"
      id={`giscus-${articleId}`}
    />
  );
}
