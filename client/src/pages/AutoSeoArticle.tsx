/**
 * Style: Optik Editorial — Auto SEO article detail page
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 * Layout: Editorial article with large hero image and clean typography
 */
import { useEffect, useMemo } from "react";
import { trackWhatsAppConversion } from "@/lib/tracking";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowUpRight, Clock, Calendar, Share2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { trackEventDirect } from "@/hooks/useAnalyticsTracker";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { useBreadcrumbSchema, useBlogPostingSchema, useCanonical, useMetaDescription } from "@/components/SEOHead";
import { renderMarkdown } from "@/lib/renderMarkdown";
import GiscusComments from "@/components/GiscusComments";

export default function AutoSeoArticle() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  // Carregar artigo do AutoSEO
  const { data: article, isLoading } = trpc.autoSeo.getArticleBySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  // Carregar artigos relacionados (todos os artigos do AutoSEO)
  const { data: allArticles = [] } = trpc.autoSeo.getArticles.useQuery(
    { limit: 100, offset: 0 },
    { staleTime: 60000 }
  );

  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return allArticles
      .filter((a: any) => a.id !== article.id)
      .filter((a: any) => a.category === article.category)
      .slice(0, 3);
  }, [article, allArticles]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (article) {
      document.title = `${article.title} | Blog Total Quality Medicina Diagnóstica`;
      trackEventDirect("blog_view", "content", { slug: article.slug, title: article.title });
    }
  }, [article?.slug]);

  // SEO: Meta description
  useMetaDescription(article?.metaDescription || article?.excerpt || "Blog Total Quality Medicina Diagnóstica - Artigos sobre saúde e bem-estar");

  // SEO: Canonical URL
  useCanonical(`/blog/${slug || ""}`);

  // SEO: BreadcrumbList
  const breadcrumbs = useMemo(() => article ? [
    { name: "Início", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: article.title, url: `/blog/${article.slug}` },
  ] : [], [article]);
  useBreadcrumbSchema(breadcrumbs);

  // SEO: BlogPosting schema
  useBlogPostingSchema({
    title: article?.title || "",
    description: article?.metaDescription || article?.excerpt || "",
    url: `/blog/${article?.slug || ""}`,
    datePublished: article?.publishedAt ? new Date(article.publishedAt).toISOString() : "",
    authorName: article?.author || "Total Quality",
    imageUrl: article?.heroImage,
  });

  // SEO: quando o artigo nao existe, marcar a pagina como noindex
  // para o Google nao indexar este soft-404 (status 200 com "ARTIGO NAO ENCONTRADO").
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const notFound = !isLoading && !article;
    if (meta) {
      meta.setAttribute(
        "content",
        notFound
          ? "noindex, follow"
          : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      );
    }
    return () => {
      const m = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
      if (m) {
        m.setAttribute(
          "content",
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        );
      }
    };
  }, [isLoading, article]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-40 pb-20 text-center container">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand" />
          <p className="text-text-light">Carregando artigo...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-40 pb-20 text-center container">
          <h1 className="heading-display text-5xl text-text mb-4">ARTIGO NÃO ENCONTRADO</h1>
          <p className="text-text-light mb-8">O artigo que você procura não existe ou foi removido.</p>
          <Link href="/blog" className="btn-pill inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-28 pb-4 border-b border-black/5">
        <div className="container flex items-center gap-2 text-xs">
          <Link href="/" className="font-semibold uppercase tracking-[0.15em] text-text-muted hover:text-brand transition-colors">
            Início
          </Link>
          <span className="text-text-muted">/</span>
          <Link href="/blog" className="font-semibold uppercase tracking-[0.15em] text-text-muted hover:text-brand transition-colors">
            Blog
          </Link>
          <span className="text-text-muted">/</span>
          <span className="font-semibold uppercase tracking-[0.15em] text-brand truncate max-w-[200px]">
            {article.category}
          </span>
        </div>
      </div>

      {/* Article Header */}
      <header className="py-12 md:py-16">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">{article.category}</span>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {new Date(article.publishedAt || new Date()).toLocaleDateString("pt-BR")}
            </span>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" /> {article.readTime || "5 min"} de leitura
            </span>
          </div>

          <h1 className="heading-display text-5xl md:text-6xl lg:text-7xl text-text mb-6 leading-tight">
            {article.title}
          </h1>

          <p className="text-xl text-text-light leading-relaxed mb-8">
            {article.excerpt}
          </p>

          <div className="flex items-center justify-between border-t border-b border-black/10 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                <span className="text-brand font-bold text-sm">
                  {(article.author || "TQ").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{article.author || "Total Quality"}</p>
                <p className="text-xs text-text-muted">{article.authorRole || "Equipe Médica"}</p>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-text-light hover:text-brand transition-colors"
            >
              <Share2 className="w-4 h-4" /> Compartilhar
            </button>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      {article.heroImage && (
        <div className="container max-w-5xl mx-auto mb-12">
          <img
            src={article.heroImage}
            alt={article.title}
            className="w-full aspect-[16/9] object-cover rounded-lg"
          />
        </div>
      )}

      {/* Article Content */}
      <article className="pb-16">
        <div className="container max-w-3xl mx-auto">
          {/* Renderizar conteúdo HTML ou Markdown */}
          {article.contentMarkdown ? (
            <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-text prose-p:text-text prose-p:leading-[1.85] prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-strong:text-text prose-strong:font-semibold prose-code:text-brand prose-code:bg-surface-light prose-code:px-2 prose-code:py-1 prose-code:rounded">
              {renderMarkdown(article.contentMarkdown)}
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-lg text-text leading-[1.85] first-letter:text-5xl first-letter:font-display first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:text-brand first-letter:leading-none">
                {article.content}
              </p>
            </div>
          )}

          {/* Meta Keywords */}
          {article.metaKeywords && (
            <div className="mt-12 pt-8 border-t border-black/10">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-[0.05em] text-text-muted">Tags:</span>
                {article.metaKeywords.split(",").map((keyword: string) => (
                  <span
                    key={keyword.trim()}
                    className="px-3 py-1 text-xs font-medium uppercase tracking-[0.05em] bg-surface-light text-text-light rounded-full border border-black/5"
                  >
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 p-8 bg-surface-light border border-black/5 text-center">
            <h2 className="heading-display text-3xl text-text mb-3">AGENDE SEUS EXAMES</h2>
            <p className="text-text-light text-sm mb-6 max-w-md mx-auto">
              Na Total Quality em Caraguatatuba, cuidamos da sua saúde com tecnologia de ponta e atendimento humanizado.
            </p>
            <a
              onClick={() => trackWhatsAppConversion("artigo_cta", "blog")}
            href={`https://wa.me/551238873535?text=Olá! Li o artigo sobre ${article.title} e gostaria de agendar um exame.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pill-brand inline-flex items-center gap-2"
            >
              Agendar pelo WhatsApp <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <section className="py-16 bg-surface-light/50">
        <div className="container max-w-3xl mx-auto">
          <h2 className="heading-display text-3xl text-text mb-8">DEIXE SEU COMENTÁRIO</h2>
          <GiscusComments articleId={article.slug} articleTitle={article.title} />
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-16 border-t border-black/10">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <h2 className="heading-display text-4xl text-text">ARTIGOS RELACIONADOS</h2>
              <Link href="/blog" className="text-xs font-semibold uppercase tracking-[0.1em] text-brand flex items-center gap-1 hover:gap-2 transition-all">
                Ver todos <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedArticles.map((ra: any) => (
                <Link key={ra.id} href={`/blog/${ra.slug}`} className="group block space-y-3">
                  <div className="overflow-hidden">
                    <img
                      src={ra.heroImage || "https://images.unsplash.com/photo-1576091160550-112173f7f869?w=800&h=500&fit=crop"}
                      alt={ra.title}
                      className="w-full aspect-[16/10] object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">{ra.category}</span>
                  <h3 className="heading-display text-xl text-text group-hover:text-brand transition-colors leading-tight">
                    {ra.title}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {new Date(ra.publishedAt || new Date()).toLocaleDateString("pt-BR")} — {ra.readTime || "5 min"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
