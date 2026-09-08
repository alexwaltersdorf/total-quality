/*
 * Style: Optik Editorial — Minimalist, uppercase display type, brand #9B212B
 * Home page: Composes all sections in editorial flow
 * Hero → Diferenciais → Exames → Cartão → Blog → Sobre → Contato → Footer
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
import BlogPreviewSection from "@/components/BlogPreviewSection";
import SobreSection from "@/components/SobreSection";
import PorQueEscolherSection from "@/components/PorQueEscolherSection";
import ContatoSection from "@/components/ContatoSection";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import {
  initScrollTracking,
  initTimeTracking,
  initSectionObserver,
} from "@/lib/tracking";
import { trackEventDirect } from "@/hooks/useAnalyticsTracker";
import { getUTMForAPI } from "@/lib/utmTracker";
import { startPageTracking } from "@/lib/engagementTracker";

export default function Home() {
  const scrollRef = useScrollReveal();

  useEffect(() => {
    document.title = "Laboratório em Caraguatatuba | Total Quality | Ligue Agora";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Laboratório de análises clínicas em Caraguatatuba - SP. Exames de sangue, tomografia, ultrassom e check-up. Agende pelo WhatsApp (12) 3887-3535.");
    }

    // A origem e a sessão são inicializadas globalmente no App, inclusive
    // quando a primeira página visitada não é a Home.
    const utmForAPI = getUTMForAPI();

    // Start page engagement tracking (time on page, scroll depth, quartiles)
    const cleanupEngagement = startPageTracking("/", "Home");

    // O page_view do dataLayer sai do usePageViewTracking (App.tsx), fonte
    // unica. Aqui fica so o registro no painel proprio (banco da clinica).
    trackEventDirect("page_view", "navigation", { page: "Home", ...utmForAPI });
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
      if (cleanupEngagement) cleanupEngagement();
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
        <BlogPreviewSection />
        <SobreSection />
        <PorQueEscolherSection />
        <ContatoSection />
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
