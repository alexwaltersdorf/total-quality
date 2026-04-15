/*
 * Style: Optik Editorial — Minimalist, uppercase display type, brand #9B212B
 * Home page: Composes all sections in editorial flow
 * Hero → Diferenciais → Exames → Cartão → Sobre → Contato → Footer
 * SEO: Semantic HTML structure with proper heading hierarchy
 * Tracking: Full dataLayer integration for GTM/GA4/Meta/TikTok
 */
import { useEffect } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DiferenciaisSection from "@/components/DiferenciaisSection";
import ExamesSection from "@/components/ExamesSection";
import CartaoSection from "@/components/CartaoSection";
import SobreSection from "@/components/SobreSection";
import ContatoSection from "@/components/ContatoSection";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import {
  trackPageView,
  initScrollTracking,
  initTimeTracking,
  initSectionObserver,
} from "@/lib/tracking";

export default function Home() {
  const scrollRef = useScrollReveal();

  useEffect(() => {
    document.title = "Total Quality Medicina Diagnóstica | Exames de Sangue e Laboratoriais em Caraguatatuba-SP";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Total Quality Medicina Diagnóstica e Laboratorial em Caraguatatuba-SP. Exames de sangue, hemograma, glicemia, colesterol, triglicerídeos, TSH, T4 livre, PSA, vitamina D, ácido úrico, ureia, creatinina, TGO, TGP. Tomografia, ultrassonografia, mamografia, ecocardiograma, check-up e mais de 3.000 tipos de exames laboratoriais.");
    }

    // Tracking: page view + engagement metrics
    trackPageView("Home");
    const cleanupScroll = initScrollTracking();
    const cleanupTime = initTimeTracking();

    // Small delay to ensure sections are rendered before observing
    const sectionTimeout = setTimeout(() => {
      initSectionObserver();
    }, 500);

    return () => {
      cleanupScroll();
      cleanupTime();
      clearTimeout(sectionTimeout);
    };
  }, []);

  return (
    <div ref={scrollRef} className="min-h-screen">
      <Navbar />
      <main role="main">
        <HeroSection />
        <DiferenciaisSection />
        <ExamesSection />
        <CartaoSection />
        <SobreSection />
        <ContatoSection />
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
