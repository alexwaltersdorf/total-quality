/*
 * Style: Optik Editorial — Blog preview section for Home page
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 * Shows latest 3 blog posts in editorial grid
 */
import { Link } from "wouter";
import { ArrowUpRight, Clock } from "lucide-react";
import { blogPosts } from "@/lib/blogData";

export default function BlogPreviewSection() {
  const latestPosts = blogPosts.slice(0, 3);

  return (
    <section className="py-20 md:py-28 border-t border-black/10" id="blog">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-14">
          <div>
            <span className="section-label mb-4 block">Saúde &amp; Bem-Estar</span>
            <h2 className="heading-display text-5xl md:text-6xl lg:text-7xl text-text mt-4">
              BLOG
            </h2>
          </div>
          <Link
            href="/blog"
            className="btn-pill inline-flex items-center gap-2"
          >
            Ver Todos os Artigos <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {latestPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block space-y-4">
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
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
                    {post.category}
                  </span>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                </div>
                <h3 className="heading-display text-2xl text-text group-hover:text-brand transition-colors duration-300 leading-tight">
                  {post.title}
                </h3>
                <p className="text-text-light text-sm leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-text-muted">{post.date}</p>
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-brand flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                    Ler <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
