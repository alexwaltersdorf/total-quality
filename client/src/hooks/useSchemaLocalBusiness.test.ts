import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  useSchemaLocalBusiness,
  useSchemaOrganization,
  useSchemaBreadcrumb,
  useSchemaFAQ,
} from "./useSchemaLocalBusiness";

describe("Schema.org Hooks", () => {
  beforeEach(() => {
    // Limpar scripts anteriores
    document.querySelectorAll("script[type='application/ld+json']").forEach((el) => el.remove());
  });

  afterEach(() => {
    // Limpar scripts após cada teste
    document.querySelectorAll("script[type='application/ld+json']").forEach((el) => el.remove());
  });

  describe("useSchemaLocalBusiness", () => {
    it("deve criar script com schema LocalBusiness", () => {
      renderHook(() => useSchemaLocalBusiness());

      const script = document.querySelector("#schema-local-business");
      expect(script).toBeTruthy();
      expect(script?.type).toBe("application/ld+json");
    });

    it("deve conter dados corretos de LocalBusiness", () => {
      renderHook(() => useSchemaLocalBusiness());

      const script = document.querySelector("#schema-local-business");
      const data = JSON.parse(script?.textContent || "{}");

      expect(data["@type"]).toBe("MedicalBusiness");
      expect(data.name).toBe("Total Quality Medicina Diagnóstica");
      expect(data.telephone).toBe("+55 (12) 3887-3535");
      expect(data.address.addressLocality).toBe("Caraguatatuba");
    });

    it("deve conter horário de funcionamento", () => {
      renderHook(() => useSchemaLocalBusiness());

      const script = document.querySelector("#schema-local-business");
      const data = JSON.parse(script?.textContent || "{}");

      expect(data.openingHoursSpecification).toBeDefined();
      expect(data.openingHoursSpecification.length).toBeGreaterThan(0);
      expect(data.openingHoursSpecification[0].opens).toBe("08:00");
    });

    it("deve conter informações de rating", () => {
      renderHook(() => useSchemaLocalBusiness());

      const script = document.querySelector("#schema-local-business");
      const data = JSON.parse(script?.textContent || "{}");

      expect(data.aggregateRating).toBeDefined();
      expect(data.aggregateRating.ratingValue).toBe(4.8);
      expect(data.aggregateRating.ratingCount).toBe(127);
    });

    it("deve conter ofertas de serviços", () => {
      renderHook(() => useSchemaLocalBusiness());

      const script = document.querySelector("#schema-local-business");
      const data = JSON.parse(script?.textContent || "{}");

      expect(data.hasOfferCatalog).toBeDefined();
      expect(data.hasOfferCatalog.itemListElement.length).toBe(3);
      expect(data.hasOfferCatalog.itemListElement[0].name).toBe("Check-Up Básico");
    });

    it("deve aceitar opções customizadas", () => {
      renderHook(() =>
        useSchemaLocalBusiness({
          name: "Custom Business",
          phone: "+55 (12) 9999-9999",
        })
      );

      const script = document.querySelector("#schema-local-business");
      const data = JSON.parse(script?.textContent || "{}");

      expect(data.name).toBe("Custom Business");
      expect(data.telephone).toBe("+55 (12) 9999-9999");
    });

    it("deve remover script anterior ao desmontar", () => {
      const { unmount } = renderHook(() => useSchemaLocalBusiness());

      let script = document.querySelector("#schema-local-business");
      expect(script).toBeTruthy();

      unmount();

      script = document.querySelector("#schema-local-business");
      expect(script).toBeFalsy();
    });
  });

  describe("useSchemaOrganization", () => {
    it("deve criar script com schema Organization", () => {
      renderHook(() => useSchemaOrganization());

      const script = document.querySelector("#schema-organization");
      expect(script).toBeTruthy();
      expect(script?.type).toBe("application/ld+json");
    });

    it("deve conter dados corretos de Organization", () => {
      renderHook(() => useSchemaOrganization());

      const script = document.querySelector("#schema-organization");
      const data = JSON.parse(script?.textContent || "{}");

      expect(data["@type"]).toBe("Organization");
      expect(data.name).toBe("Total Quality Medicina Diagnóstica");
      expect(data.foundingDate).toBe("2003");
    });

    it("deve conter redes sociais", () => {
      renderHook(() => useSchemaOrganization());

      const script = document.querySelector("#schema-organization");
      const data = JSON.parse(script?.textContent || "{}");

      expect(data.sameAs).toBeDefined();
      expect(data.sameAs.length).toBeGreaterThan(0);
    });
  });

  describe("useSchemaBreadcrumb", () => {
    it("deve criar script com schema BreadcrumbList", () => {
      const items = [
        { name: "Home", url: "https://example.com" },
        { name: "Products", url: "https://example.com/products" },
      ];

      renderHook(() => useSchemaBreadcrumb(items));

      const script = document.querySelector("#schema-breadcrumb");
      expect(script).toBeTruthy();
      expect(script?.type).toBe("application/ld+json");
    });

    it("deve conter items de breadcrumb corretos", () => {
      const items = [
        { name: "Home", url: "https://example.com" },
        { name: "Products", url: "https://example.com/products" },
      ];

      renderHook(() => useSchemaBreadcrumb(items));

      const script = document.querySelector("#schema-breadcrumb");
      const data = JSON.parse(script?.textContent || "{}");

      expect(data["@type"]).toBe("BreadcrumbList");
      expect(data.itemListElement.length).toBe(2);
      expect(data.itemListElement[0].position).toBe(1);
      expect(data.itemListElement[0].name).toBe("Home");
    });
  });

  describe("useSchemaFAQ", () => {
    it("deve criar script com schema FAQPage", () => {
      const faqs = [
        { question: "O que é?", answer: "É um teste" },
        { question: "Como funciona?", answer: "Funciona assim" },
      ];

      renderHook(() => useSchemaFAQ(faqs));

      const script = document.querySelector("#schema-faq");
      expect(script).toBeTruthy();
      expect(script?.type).toBe("application/ld+json");
    });

    it("deve conter FAQs corretos", () => {
      const faqs = [
        { question: "O que é?", answer: "É um teste" },
        { question: "Como funciona?", answer: "Funciona assim" },
      ];

      renderHook(() => useSchemaFAQ(faqs));

      const script = document.querySelector("#schema-faq");
      const data = JSON.parse(script?.textContent || "{}");

      expect(data["@type"]).toBe("FAQPage");
      expect(data.mainEntity.length).toBe(2);
      expect(data.mainEntity[0].name).toBe("O que é?");
      expect(data.mainEntity[0].acceptedAnswer.text).toBe("É um teste");
    });
  });

  describe("JSON-LD Validation", () => {
    it("deve gerar JSON-LD válido", () => {
      renderHook(() => useSchemaLocalBusiness());

      const script = document.querySelector("#schema-local-business");
      expect(() => {
        JSON.parse(script?.textContent || "{}");
      }).not.toThrow();
    });

    it("todos os scripts devem ter type application/ld+json", () => {
      renderHook(() => useSchemaLocalBusiness());
      renderHook(() => useSchemaOrganization());
      renderHook(() => useSchemaBreadcrumb([{ name: "Home", url: "https://example.com" }]));

      const scripts = document.querySelectorAll("script[type='application/ld+json']");
      expect(scripts.length).toBeGreaterThan(0);

      scripts.forEach((script) => {
        expect(script.type).toBe("application/ld+json");
      });
    });
  });
});
