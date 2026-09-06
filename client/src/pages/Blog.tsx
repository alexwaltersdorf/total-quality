/*
 * Style: Optik Editorial — Blog listing page
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 * Layout: Editorial grid with featured post + grid of posts
 */
import { useState, useEffect } from "react";
import { trackWhatsAppConversion } from "@/lib/tracking";
import { Link } from "wouter";
import { ArrowUpRight, ArrowLeft, Clock, Search } from "lucide-react";
import { blogPosts, blogCategories, type BlogPostMeta } from "@/lib/blogData";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { useCanonical, useMetaDescription } from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

function BlogCard({ post, featured = false }: { post: BlogPostMeta; featured?: boolean }) {
  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <article className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full aspect-[16/10] object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">{post.category}</span>
              <span className="text-xs text-text-muted">{post.date}</span>
            </div>
            <h2 className="heading-display text-4xl md:text-5xl lg:text-6xl text-text group-hover:text-brand transition-colors duration-300">
              {post.title}
            </h2>
            <p className="text-text-light leading-relaxed text-lg">{post.excerpt}</p>
            <div className="flex items-center gap-4 pt-2">
              <div>
                <p className="text-sm font-semibold text-text">{post.author}</p>
                <p className="text-xs text-text-muted">{post.readTime} de leitura</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.1em] text-brand group-hover:gap-3 transition-all duration-300">
              Ler Artigo <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="space-y-4">
        <div className="overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full aspect-[16/10] object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">{post.category}</span>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" /> {post.readTime}
            </span>
          </div>
          <h3 className="heading-display text-2xl md:text-3xl text-text group-hover:text-brand transition-colors duration-300 leading-tight">
            {post.title}
          </h3>
          <p className="text-text-light text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-text-muted">{post.date}</p>
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-brand flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
              Ler <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Carregar artigos do AutoSEO
  const { data: autoSeoArticles = [], isLoading: isLoadingAutoSeo } = trpc.autoSeo.getArticles.useQuery(
    { limit: 100, offset: 0 },
    { staleTime: 60000 }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Blog | Total Quality Medicina Diagnóstica — Artigos sobre Saúde e Bem-Estar";
  }, []);

  // SEO: Meta description e canonical
  useMetaDescription("Blog da Total Quality Medicina Diagnóstica em Caraguatatuba - SP. Artigos sobre saúde preventiva, exames laboratoriais, cardiologia, nutrição e bem-estar. Dicas de especialistas para cuidar da sua saúde.");
  useCanonical("/blog");

  // Combinar artigos estáticos com artigos do AutoSEO
  const allPosts = [...blogPosts, ...autoSeoArticles.map((article: any) => ({
    id: `autoseo-${article.id}`,
    slug: article.slug,
    title: article.title,
    subtitle: article.category,
    excerpt: article.excerpt || "",
    category: article.category || "Saúde",
    author: article.author || "Total Quality",
    authorRole: article.authorRole || "Equipe Médica",
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR"),
    readTime: article.readTime || "5 min",
    image: article.heroImage || "https://images.unsplash.com/photo-1576091160550-112173f7f869?w=800&h=500&fit=crop",
    tags: [],
    content: [],
  }))].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredPosts = allPosts.filter((post) => {
    const matchesCategory = activeCategory === "Todos" || post.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 border-b border-black/10">
        <div className="container">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/" className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted hover:text-brand transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Início
            </Link>
            <span className="text-text-muted">/</span>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">Blog</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-end">
            <div>
              <span className="section-label mb-4 block">Saúde &amp; Bem-Estar</span>
              <h1 className="heading-display text-7xl md:text-8xl lg:text-9xl text-text mt-4">
                BLOG
              </h1>
            </div>
            <div className="lg:text-right">
              <p className="text-text-light text-lg leading-relaxed max-w-md lg:ml-auto">
                Artigos sobre saúde, medicina preventiva, exames laboratoriais e dicas de bem-estar
                escritos pela equipe médica da Total Quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-black/10 sticky top-[72px] bg-white/95 backdrop-blur-md z-30">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {blogCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] rounded-full border transition-all duration-300 ${
                    activeCategory === cat
                      ? "bg-brand text-white border-brand"
                      : "bg-transparent text-text-light border-black/15 hover:border-brand hover:text-brand"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Buscar artigos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface-light border border-black/10 rounded-full focus:outline-none focus:border-brand text-text placeholder:text-text-muted"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16 md:py-24">
        <div className="container">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="heading-display text-4xl text-text-muted mb-4">NENHUM ARTIGO ENCONTRADO</p>
              <p className="text-text-light">Tente outra categoria ou termo de busca.</p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featuredPost && (
                <div className="mb-16 pb-16 border-b border-black/10">
                  <BlogCard post={featuredPost} featured />
                </div>
              )}

              {/* Grid */}
              {gridPosts.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {gridPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Soro Widget */}
      <section className="py-16 border-t border-black/10">
        <div className="container">
          <div id="soro-blog" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-surface-light border-t border-black/10">
        <div className="container text-center">
          <span className="section-label mb-4 inline-block">Cuide da sua saúde</span>
          <h2 className="heading-display text-4xl md:text-5xl text-text mt-4 mb-6">
            AGENDE SEUS EXAMES
          </h2>
          <p className="text-text-light max-w-lg mx-auto mb-8">
            Na Total Quality em Caraguatatuba, oferecemos exames laboratoriais, diagnóstico por imagem
            e cardiologia com resultados rápidos e atendimento humanizado.
          </p>
          <a
            onClick={() => trackWhatsAppConversion("blog_cta", "blog")}
            href="https://wa.me/551238873535?text=Olá! Gostaria de agendar um exame."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pill-brand inline-flex items-center gap-2"
          >
            Agendar pelo WhatsApp <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
