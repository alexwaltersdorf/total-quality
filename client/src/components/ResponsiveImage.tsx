/**
 * ResponsiveImage — entrega de imagem otimizada para Core Web Vitals.
 *
 * Emite <picture> com AVIF (primario), WebP (fallback) e srcset por largura,
 * sempre com width/height explicitos para reservar espaco e manter CLS em zero.
 *
 * As variantes vivem em /public/images e sao servidas pelo proprio dominio
 * (Cache-Control: immutable + Brotli + CDN da Hostinger), e nao pelo bucket
 * S3/CloudFront, que devolve os objetos como application/octet-stream e sem
 * Cache-Control — ver SEO_STANDARDS.md, regra de imagens.
 *
 * Para gerar novas variantes: scripts/optimize-images.mjs
 */

export interface ResponsiveImageProps {
  /** Slug do arquivo em /public/images, sem largura nem extensao (ex.: "hero-clinica") */
  slug: string;
  alt: string;
  /** Larguras geradas para este slug, em ordem crescente */
  widths: number[];
  /** Valor do atributo sizes; descreve o espaco ocupado no layout */
  sizes: string;
  /** Dimensoes intrinsecas usadas para reservar espaco (evita layout shift) */
  width: number;
  height: number;
  className?: string;
  /** true apenas para o LCP da pagina: carrega imediatamente e com prioridade alta */
  priority?: boolean;
}

function srcSet(slug: string, widths: number[], ext: "avif" | "webp"): string {
  return widths.map((w) => `/images/${slug}-${w}.${ext} ${w}w`).join(", ");
}

export default function ResponsiveImage({
  slug,
  alt,
  widths,
  sizes,
  width,
  height,
  className,
  priority = false,
}: ResponsiveImageProps) {
  const fallbackWidth = widths[widths.length - 1];

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(slug, widths, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(slug, widths, "webp")} sizes={sizes} />
      <img
        src={`/images/${slug}-${fallbackWidth}.webp`}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
      />
    </picture>
  );
}
