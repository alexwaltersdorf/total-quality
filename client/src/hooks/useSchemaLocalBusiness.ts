import { useEffect } from "react";

/**
 * Hook para adicionar Schema.org LocalBusiness estruturado em JSON-LD
 * Melhora SEO local e exibição em resultados de busca
 */
export function useSchemaLocalBusiness(options?: {
  name?: string;
  description?: string;
  url?: string;
  phone?: string;
  email?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  image?: string;
  priceRange?: string;
  ratingValue?: number;
  ratingCount?: number;
  reviewCount?: number;
}) {
  useEffect(() => {
    // Dados padrão para Total Quality
    const defaultData = {
      name: "Total Quality Medicina Diagnóstica",
      description: "Laboratório de análises clínicas e medicina diagnóstica em Caraguatatuba",
      url: "https://totalqualmed-jl54vver.manus.space",
      phone: "+55 (12) 3887-3535",
      email: "contato@totalquality.med.br",
      address: {
        streetAddress: "R. Padre Anchieta, 1010",
        addressLocality: "Caraguatatuba",
        addressRegion: "SP",
        postalCode: "11660-000",
        addressCountry: "BR",
      },
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/checkup-hero-DYtfLmtu8bZzaLQHsJcbup.webp",
      priceRange: "$$",
      ratingValue: 4.8,
      ratingCount: 127,
      reviewCount: 45,
    };

    // Mesclar opções fornecidas com dados padrão
    const data = { ...defaultData, ...options };

    // Criar schema LocalBusiness
    const schema = {
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "@id": "https://totalqualmed-jl54vver.manus.space",
      name: data.name,
      description: data.description,
      url: data.url,
      telephone: data.phone,
      email: data.email,
      image: data.image,
      priceRange: data.priceRange,
      address: {
        "@type": "PostalAddress",
        streetAddress: data.address.streetAddress,
        addressLocality: data.address.addressLocality,
        addressRegion: data.address.addressRegion,
        postalCode: data.address.postalCode,
        addressCountry: data.address.addressCountry,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "-23.6545",
        longitude: "-45.4035",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: data.ratingValue,
        ratingCount: data.ratingCount,
        reviewCount: data.reviewCount,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: "18:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: "Saturday",
          opens: "08:00",
          closes: "12:00",
        },
      ],
      sameAs: [
        "https://www.facebook.com/totalqualitycaraguatatuba",
        "https://www.instagram.com/totalqualitycaraguatatuba",
        "https://www.google.com/maps/place/Total+Quality",
      ],
      knowsAbout: [
        "Hemograma",
        "Colesterol",
        "Glicemia",
        "Tomografia",
        "Ultrassom",
        "Ecocardiograma",
        "Check-up preventivo",
        "Exames de sangue",
      ],
      areaServed: {
        "@type": "City",
        name: "Caraguatatuba",
        sameAs: "https://pt.wikipedia.org/wiki/Caraguatatuba",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Service",
        telephone: data.phone,
        email: data.email,
        availableLanguage: ["pt-BR", "en"],
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Serviços Médicos",
        itemListElement: [
          {
            "@type": "Offer",
            name: "Check-Up Básico",
            description: "19 exames - Avaliação essencial",
            priceCurrency: "BRL",
            price: "299.90",
          },
          {
            "@type": "Offer",
            name: "Check-Up Select",
            description: "30 exames - Avaliação abrangente",
            priceCurrency: "BRL",
            price: "599.90",
          },
          {
            "@type": "Offer",
            name: "Check-Up Premium",
            description: "45+ exames - Avaliação completa",
            priceCurrency: "BRL",
            price: "999.90",
          },
        ],
      },
    };

    // Criar elemento script e adicionar ao document
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    script.id = "schema-local-business";

    // Remover script anterior se existir
    const existing = document.getElementById("schema-local-business");
    if (existing) {
      existing.remove();
    }

    // Adicionar novo script ao head
    document.head.appendChild(script);

    // Cleanup: remover script ao desmontar componente
    return () => {
      const script = document.getElementById("schema-local-business");
      if (script) {
        script.remove();
      }
    };
  }, [options]);
}

/**
 * Hook para adicionar Schema.org Organization (alternativa para homepage)
 */
export function useSchemaOrganization(options?: any) {
  useEffect(() => {
    const defaultData = {
      name: "Total Quality Medicina Diagnóstica",
      url: "https://totalqualmed-jl54vver.manus.space",
      logo: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/logo.png",
      description: "Laboratório de análises clínicas e medicina diagnóstica em Caraguatatuba",
      foundingDate: "2003",
      telephone: "+55 (12) 3887-3535",
      email: "contato@totalquality.med.br",
      sameAs: [
        "https://www.facebook.com/totalqualitycaraguatatuba",
        "https://www.instagram.com/totalqualitycaraguatatuba",
      ],
    };

    const data = { ...defaultData, ...options };

    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: data.name,
      url: data.url,
      logo: data.logo,
      description: data.description,
      foundingDate: data.foundingDate,
      telephone: data.telephone,
      email: data.email,
      sameAs: data.sameAs,
      address: {
        "@type": "PostalAddress",
        streetAddress: "R. Padre Anchieta, 1010",
        addressLocality: "Caraguatatuba",
        addressRegion: "SP",
        postalCode: "11660-000",
        addressCountry: "BR",
      },
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    script.id = "schema-organization";

    const existing = document.getElementById("schema-organization");
    if (existing) {
      existing.remove();
    }

    document.head.appendChild(script);

    return () => {
      const script = document.getElementById("schema-organization");
      if (script) {
        script.remove();
      }
    };
  }, [options]);
}

/**
 * Hook para adicionar Schema.org BreadcrumbList (navegação)
 */
export function useSchemaBreadcrumb(items: Array<{ name: string; url: string }>) {
  useEffect(() => {
    const breadcrumbItems = items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    }));

    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems,
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    script.id = "schema-breadcrumb";

    const existing = document.getElementById("schema-breadcrumb");
    if (existing) {
      existing.remove();
    }

    document.head.appendChild(script);

    return () => {
      const script = document.getElementById("schema-breadcrumb");
      if (script) {
        script.remove();
      }
    };
  }, [items]);
}

/**
 * Hook para adicionar Schema.org FAQPage
 */
export function useSchemaFAQ(faqs: Array<{ question: string; answer: string }>) {
  useEffect(() => {
    const mainEntity = faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    }));

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity,
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    script.id = "schema-faq";

    const existing = document.getElementById("schema-faq");
    if (existing) {
      existing.remove();
    }

    document.head.appendChild(script);

    return () => {
      const script = document.getElementById("schema-faq");
      if (script) {
        script.remove();
      }
    };
  }, [faqs]);
}
