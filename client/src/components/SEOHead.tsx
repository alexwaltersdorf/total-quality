/*
 * SEOHead — Injects dynamic JSON-LD structured data into the page head.
 * Supports: BreadcrumbList, FAQPage, MedicalTest, BlogPosting
 * Uses React Helmet-like approach via useEffect + DOM manipulation.
 */
import { useEffect } from "react";

const SITE_URL = "https://www.totalquality.med.br";
const ORG_NAME = "Total Quality Medicina Diagnóstica";

// ── Breadcrumb Schema ──
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function useBreadcrumbSchema(items: BreadcrumbItem[]) {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
      })),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "schema-breadcrumb";
    script.textContent = JSON.stringify(schema);

    // Remove existing if present
    document.getElementById("schema-breadcrumb")?.remove();
    document.head.appendChild(script);

    return () => { document.getElementById("schema-breadcrumb")?.remove(); };
  }, [items]);
}

// ── FAQ Schema ──
interface FAQItem {
  q: string;
  a: string;
}

export function useFAQSchema(faqs: FAQItem[]) {
  useEffect(() => {
    if (!faqs || faqs.length === 0) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "schema-faq";
    script.textContent = JSON.stringify(schema);

    document.getElementById("schema-faq")?.remove();
    document.head.appendChild(script);

    return () => { document.getElementById("schema-faq")?.remove(); };
  }, [faqs]);
}

// ── MedicalTest Schema (for exam pages) ──
interface MedicalTestSchemaProps {
  name: string;
  description: string;
  url: string;
  bodyLocation?: string;
}

export function useMedicalTestSchema(props: MedicalTestSchemaProps) {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "MedicalTest",
      name: props.name,
      description: props.description,
      url: props.url.startsWith("http") ? props.url : `${SITE_URL}${props.url}`,
      ...(props.bodyLocation && { bodyLocation: props.bodyLocation }),
      provider: {
        "@type": "MedicalBusiness",
        name: ORG_NAME,
        url: SITE_URL,
        telephone: "+55-12-3887-3535",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Rua Padre Anchieta, 1010",
          addressLocality: "Caraguatatuba",
          addressRegion: "SP",
          postalCode: "11660-010",
          addressCountry: "BR",
        },
      },
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "schema-medicaltest";
    script.textContent = JSON.stringify(schema);

    document.getElementById("schema-medicaltest")?.remove();
    document.head.appendChild(script);

    return () => { document.getElementById("schema-medicaltest")?.remove(); };
  }, [props.name, props.description, props.url, props.bodyLocation]);
}

// ── BlogPosting Schema ──
interface BlogPostingSchemaProps {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  imageUrl?: string;
}

export function useBlogPostingSchema(props: BlogPostingSchemaProps) {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: props.title,
      description: props.description,
      url: props.url.startsWith("http") ? props.url : `${SITE_URL}${props.url}`,
      datePublished: props.datePublished,
      dateModified: props.dateModified || props.datePublished,
      author: {
        "@type": "Person",
        name: props.authorName,
      },
      publisher: {
        "@type": "Organization",
        name: ORG_NAME,
        url: SITE_URL,
      },
      ...(props.imageUrl && {
        image: {
          "@type": "ImageObject",
          url: props.imageUrl,
        },
      }),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "schema-blogposting";
    script.textContent = JSON.stringify(schema);

    document.getElementById("schema-blogposting")?.remove();
    document.head.appendChild(script);

    return () => { document.getElementById("schema-blogposting")?.remove(); };
  }, [props.title, props.description, props.url, props.datePublished, props.dateModified, props.authorName, props.imageUrl]);
}

// ── Canonical URL helper ──
export function useCanonical(path: string) {
  useEffect(() => {
    const url = path.startsWith("http") ? path : `${SITE_URL}${path}`;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (link) {
      link.href = url;
    } else {
      link = document.createElement("link");
      link.rel = "canonical";
      link.href = url;
      document.head.appendChild(link);
    }
  }, [path]);
}

// ── Meta Description helper ──
export function useMetaDescription(description: string) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (meta) {
      meta.setAttribute("content", description);
    }
  }, [description]);
}
