/*
 * Style: Optik Editorial — Blog post detail page
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 * Layout: Editorial article with large hero image and clean typography
 */
import { useEffect, useMemo, useState } from "react";
import { trackWhatsAppConversion } from "@/lib/tracking";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowUpRight, Clock, Calendar, Tag, Share2 } from "lucide-react";
import { blogPosts, loadBlogPost } from "@/lib/blogData";
import { linkifyText } from "@/lib/internalLinkTargets";
import { trpc } from "@/lib/trpc";
import { trackEventDirect } from "@/hooks/useAnalyticsTracker";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { useBreadcrumbSchema, useBlogPostingSchema, useCanonical, useMetaDescription } from "@/components/SEOHead";
import GiscusComments from "@/components/GiscusComments";

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const meta = useMemo(() => blogPosts.find((p) => p.slug === slug), [slug]);
  const [content, setContent] = useState<string[] | null>(null);

  // O corpo do artigo vive em client/src/content/blog/<slug>.json e vira um
  // chunk proprio — nao pesa no bundle de quem nunca abre o blog.
  useEffect(() => {
    let cancelled = false;
    if (!slug) return;
    loadBlogPost(slug).then((full) => {
      if (!cancelled) setContent(full?.content ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const post = useMemo(
    () => (meta ? { ...meta, content: content ?? [] } : undefined),
    [meta, content]
  );

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return blogPosts
      .filter((p) => p.id !== post.id)
      .filter((p) => p.category === post.category || p.tags.some((t) => post.tags.includes(t)))
      .slice(0, 3);
  }, [post]);

  const blogViewMutation = trpc.blog.trackView.useMutation();
  const { data: viewData } = trpc.blog.viewCount.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    if (post) {
      document.title =
        post.slug === "exame-de-sangue-caraguatatuba"
          ? "Exame de Sangue em Caraguatatuba: Onde Fazer?"
          : `${post.title} | Blog Total Quality Medicina Diagnóstica`;

      // Registrar visualização no banco de dados
      blogViewMutation.mutate({ slug: post.slug });
      trackEventDirect("blog_view", "content", { slug: post.slug, title: post.title });
    }
  }, [post?.slug]);

  // SEO: Meta description
  useMetaDescription(
    post?.slug === "exame-de-sangue-caraguatatuba"
      ? "Saiba onde fazer exame de sangue em Caraguatatuba, quais cuidados podem ser necessários e como escolher um laboratório para realizar seus exames."
      : post?.excerpt || "Blog Total Quality Medicina Diagnóstica - Artigos sobre saúde e bem-estar"
  );

  // SEO: Canonical URL
  useCanonical(`/blog/${slug || ""}`);

  // SEO: BreadcrumbList
  const breadcrumbs = useMemo(() => post ? [
    { name: "Início", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ] : [], [post]);
  useBreadcrumbSchema(breadcrumbs);

  // SEO: BlogPosting schema
  useBlogPostingSchema({
    title: post?.title || "",
    description: post?.excerpt || "",
    url: `/blog/${post?.slug || ""}`,
    datePublished: post?.date || "",
    authorName: post?.author || "",
    imageUrl: post?.image,
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência!");
    }
  };

  if (!post) {
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
            {post.category}
          </span>
        </div>
      </div>

      {/* Article Header */}
      <header className="py-12 md:py-16">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">{post.category}</span>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {post.date}
            </span>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" /> {post.readTime} de leitura
            </span>
          </div>

          <h1 className="heading-display text-5xl md:text-6xl lg:text-7xl text-text mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-text-light leading-relaxed mb-8">
            {post.subtitle}
          </p>

          <div className="flex items-center justify-between border-t border-b border-black/10 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                <span className="text-brand font-bold text-sm">{post.author.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{post.author}</p>
                <p className="text-xs text-text-muted">{post.authorRole}</p>
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
      <div className="container max-w-5xl mx-auto mb-12">
        <img
          src={post.image}
          alt={post.title}
          className="w-full aspect-[16/9] object-cover"
        />
      </div>

      {/* Article Content */}
      <article className="pb-16">
        <div className="container max-w-3xl mx-auto">
          <div className="space-y-6">
            {/* Linkagem interna automática (mesmo mapa do prerender —
                internalLinkTargets.ts): informacional → página estratégica. */}
            {(() => {
              const usedHrefs = new Set<string>();
              return post.content.map((paragraph, i) => (
                <p
                  key={i}
                  className={`text-text leading-[1.85] ${i === 0 ? "text-lg first-letter:text-5xl first-letter:font-display first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:text-brand first-letter:leading-none" : "text-base"}`}
                >
                  {linkifyText(paragraph, `/blog/${post.slug}`, usedHrefs).map((span, j) =>
                    span.href ? (
                      <Link key={j} href={span.href} className="text-brand underline underline-offset-2 hover:opacity-80">
                        {span.text}
                      </Link>
                    ) : (
                      <span key={j}>{span.text}</span>
                    )
                  )}
                </p>
              ));
            })()}
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-black/10">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-text-muted" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-medium uppercase tracking-[0.05em] bg-surface-light text-text-light rounded-full border border-black/5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 bg-surface-light border border-black/5 text-center">
            <h2 className="heading-display text-3xl text-text mb-3">AGENDE SEUS EXAMES</h2>
            <p className="text-text-light text-sm mb-6 max-w-md mx-auto">
              Na Total Quality em Caraguatatuba, cuidamos da sua saúde com tecnologia de ponta e atendimento humanizado.
            </p>
            <a
              onClick={() => trackWhatsAppConversion("artigo_cta", "blog", "geral")}
              href={`https://wa.me/551238873535?text=Olá! Li o artigo sobre ${post.title} e gostaria de agendar um exame.`}
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
          <GiscusComments articleId={post.slug} articleTitle={post.title} />
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 border-t border-black/10">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <h2 className="heading-display text-4xl text-text">ARTIGOS RELACIONADOS</h2>
              <Link href="/blog" className="text-xs font-semibold uppercase tracking-[0.1em] text-brand flex items-center gap-1 hover:gap-2 transition-all">
                Ver todos <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((rp) => (
                <Link key={rp.id} href={`/blog/${rp.slug}`} className="group block space-y-3">
                  <div className="overflow-hidden">
                    <img
                      src={rp.image}
                      alt={rp.title}
                      className="w-full aspect-[16/10] object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">{rp.category}</span>
                  <h3 className="heading-display text-xl text-text group-hover:text-brand transition-colors leading-tight">
                    {rp.title}
                  </h3>
                  <p className="text-xs text-text-muted">{rp.date} — {rp.readTime}</p>
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
