import { useEffect } from "react";

/**
 * Hook para adicionar Schema.org LocalBusiness estruturado em JSON-LD.
 *
 * Auditoria de ago/2026: este hook carregava um aggregateRating FABRICADO
 * (4.8 com 127 avaliacoes — o real e 4,5 com 348), @id/url do dominio de
 * staging da Manus, CEP e geo errados e perfis sociais inexistentes. Alem de
 * conteudo inveridico (vedado pela CFM 2.336/2023), criava uma SEGUNDA
 * entidade conflitante com o MedicalBusiness do index.html. Corrigido para a
 * mesma entidade canonica (@id #medicalbusiness) e sem nota autodeclarada —
 * autoavaliacao de rating nao gera estrelas no Google desde 2019.
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
}) {
  useEffect(() => {
    // Dados padrão para Total Quality
    const defaultData = {
      name: "Total Quality Medicina Diagnóstica",
      description: "Laboratório de análises clínicas e medicina diagnóstica em Caraguatatuba",
      url: "https://totalquality.med.br/",
      phone: "+55 (12) 3887-3535",
      email: "contato@totalquality.med.br",
      address: {
        streetAddress: "R. Padre Anchieta, 1010",
        addressLocality: "Caraguatatuba",
        addressRegion: "SP",
        postalCode: "11660-010",
        addressCountry: "BR",
      },
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/checkup-hero-DYtfLmtu8bZzaLQHsJcbup.webp",
      priceRange: "$$",
    };

    // Mesclar opções fornecidas com dados padrão
    const data = { ...defaultData, ...options };

    // Criar schema LocalBusiness
    const schema = {
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "@id": "https://totalquality.med.br/#medicalbusiness",
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
        latitude: "-23.6225",
        longitude: "-45.4132",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "07:30",
          closes: "18:00",
        },
      ],
      sameAs: [
        "https://www.instagram.com/totalqualitymedicina/",
      ],
      knowsAbout: [
        "Hemograma",
        "Colesterol",
        "Glicemia",
        "Tomografia",
        "Ultrassom",
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
      url: "https://totalquality.med.br/",
      logo: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/logo.png",
      description: "Laboratório de análises clínicas e medicina diagnóstica em Caraguatatuba",
      foundingDate: "2003",
      telephone: "+55 (12) 3887-3535",
      email: "contato@totalquality.med.br",
      sameAs: [
        "https://www.instagram.com/totalqualitymedicina/",
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
        postalCode: "11660-010",
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
