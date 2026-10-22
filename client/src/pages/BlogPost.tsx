/*
 * Style: Optik Editorial — Blog post detail page
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 * Layout: Editorial article with large hero image and clean typography
 */
import { useEffect, useMemo, useState } from "react";
import { trackWhatsAppConversion } from "@/lib/tracking";
import { useWhatsAppRedirect } from "@/contexts/ContatoLeadContext";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowUpRight, Clock, Calendar, Tag, Share2 } from "lucide-react";
import { allBlogPosts, blogPosts, loadBlogPost, extractFaqs } from "@/lib/blogData";
import { linhaRevisao, blogModifiedIso, relatedPosts as pickRelated, tableOfContents, isPublished } from "@/lib/blogMeta";
import { renderBlogContent } from "@/lib/renderBlogContent";
import { trpc } from "@/lib/trpc";
import { trackEventDirect } from "@/hooks/useAnalyticsTracker";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { useBreadcrumbSchema, useBlogArticleSchema, useFAQSchema, useCanonical, useMetaDescription } from "@/components/SEOHead";
import GiscusComments from "@/components/GiscusComments";
import ExamCTA from "@/components/ExamCTA";
import MedicalFooter from "@/components/MedicalFooter";

export default function BlogPost() {
  const openWhatsApp = useWhatsAppRedirect();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  // Rascunho tambem abre pela URL (para o Alex revisar no ar), mas com noindex
  // e fora de listagem, sitemap e relacionados — ver lib/blogMeta.ts.
  const meta = useMemo(() => allBlogPosts.find((p) => p.slug === slug), [slug]);
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

  // Os tres escolhidos a mao no campo related; sem eles, mesma categoria/tag.
  const relatedPosts = useMemo(() => (post ? pickRelated(post, blogPosts) : []), [post]);
  const toc = useMemo(() => tableOfContents(post?.content ?? []), [post?.content]);

  useEffect(() => {
    if (!meta || isPublished(meta)) return;
    const robots = document.querySelector('meta[name="robots"]');
    const anterior = robots?.getAttribute("content") ?? null;
    robots?.setAttribute("content", "noindex, nofollow");
    return () => {
      if (robots && anterior !== null) robots.setAttribute("content", anterior);
    };
  }, [meta]);

  const blogViewMutation = trpc.blog.trackView.useMutation();
  const { data: viewData } = trpc.blog.viewCount.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    if (post) {
      // Mesmo <title> do prerender (routes-metadata.ts le metaTitle do index.json).
      document.title = post.metaTitle ?? `${post.title} | Blog Total Quality Medicina Diagnóstica`;

      // Registrar visualização no banco de dados
      blogViewMutation.mutate({ slug: post.slug });
      trackEventDirect("blog_view", "content", { slug: post.slug, title: post.title });
    }
  }, [post?.slug]);

  // SEO: Meta description
  useMetaDescription(
    post?.excerpt || "Blog Total Quality Medicina Diagnóstica - Artigos sobre saúde e bem-estar"
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

  // SEO: BlogPosting schema — o mesmo objeto do prerender (blogPostingLd).
  useBlogArticleSchema(meta);

  // SEO: FAQPage schema — extraido da secao "## Perguntas frequentes" do
  // corpo, quando o artigo tiver uma (mesmo padrao de ExamePage.tsx).
  const faqs = useMemo(() => extractFaqs(post?.content ?? []), [post?.content]);
  useFAQSchema(faqs);

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
          <Link href="/" className="py-3 font-semibold uppercase tracking-[0.15em] text-text-muted hover:text-brand transition-colors">
            Início
          </Link>
          <span className="text-text-muted">/</span>
          <Link href="/blog" className="py-3 font-semibold uppercase tracking-[0.15em] text-text-muted hover:text-brand transition-colors">
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

          {/* DM Sans em caixa normal: titulo de artigo e frase inteira, e a Bebas
              em caixa alta virava um bloco de 4 linhas dificil de ler no celular. */}
          <h1 className="font-semibold tracking-tight text-3xl md:text-5xl text-text mb-6 leading-[1.15]">
            {post.title}
          </h1>

          <p className="text-xl text-text-light leading-relaxed mb-8">
            {post.subtitle}
          </p>

          <div className="flex items-center justify-between border-t border-b border-black/10 py-4">
            {/* Autoria e revisao (E-E-A-T de conteudo de saude): a clinica
                assina, o responsavel tecnico revisa. Mesmo texto do prerender
                (linhaRevisao, em blogMeta.ts). */}
            <div>
              <p className="text-sm font-semibold text-text">{post.author} · {post.authorRole}</p>
              <p className="text-xs text-text-muted">{linhaRevisao(post)}</p>
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
          alt={post.imageAlt ?? post.title}
          width={1024}
          height={576}
          fetchPriority="high"
          decoding="async"
          className="w-full aspect-[16/9] object-cover"
        />
      </div>

      {/* Article Content */}
      <article className="pb-16">
        <div className="container max-w-3xl mx-auto">
          {toc.length > 0 && (
            <nav aria-label="Sumário" className="mb-10 p-6 border border-black/10 bg-surface-light/50">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-3">Neste artigo</p>
              <ol className="list-decimal pl-5 space-y-1.5 text-sm">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="inline-block py-1.5 text-text hover:text-brand underline-offset-2 hover:underline">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="space-y-6">
            {/* Interpreta a formatacao markdown leve do corpo (##/###, **negrito**,
                listas, tabelas) e aplica a linkagem interna automática (mesmo
                mapa do prerender — internalLinkTargets.ts): informacional →
                página estratégica. */}
            {renderBlogContent(post.content, `/blog/${post.slug}`, (key) =>
              post.examName ? (
                <ExamCTA key={key} examName={post.examName} examType={post.examType} horaMarcada={post.horaMarcada} examPages={post.examPages} posicao="meio" />
              ) : null
            )}
          </div>

          {post.examName && <ExamCTA examName={post.examName} examType={post.examType} horaMarcada={post.horaMarcada} examPages={post.examPages} posicao="fim" />}

          <MedicalFooter
            dateModified={blogModifiedIso(post)}
            lastReviewed={post.lastReviewed}
            draft={!isPublished(post)}
          />

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

          {/* CTA dos artigos que nao tratam de um exame de laboratorio (os que
              tratam usam o ExamCTA acima). Sem "Agende seus exames": a coleta
              laboratorial e sem agendamento, por ordem de chegada. */}
          {!post.examName && (
          <div className="mt-12 p-8 bg-surface-light border border-black/5 text-center">
            <h2 className="heading-display text-3xl text-text mb-3">FALE COM A TOTAL QUALITY</h2>
            <p className="text-text-light text-sm mb-6 max-w-md mx-auto">
              Coleta laboratorial sem agendamento, por ordem de chegada, de segunda a sexta, das 7h30 às 18h. Exames de imagem com hora marcada pelo WhatsApp (12) 3887-3535.
            </p>
            <button
              type="button"
              onClick={() => {
                trackWhatsAppConversion("artigo_cta", "blog");
                openWhatsApp("artigo_cta", `Olá! Li o artigo sobre ${post.title} e tenho uma dúvida.`);
              }}
              className="btn-pill-brand inline-flex items-center gap-2"
            >
              Falar pelo WhatsApp <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          )}
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
