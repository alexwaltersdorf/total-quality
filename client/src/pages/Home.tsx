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
  trackPageView,
  initScrollTracking,
  initTimeTracking,
  initSectionObserver,
} from "@/lib/tracking";
import { initAnalyticsCapture } from "@/lib/analyticsStore";
import { trackEventDirect } from "@/hooks/useAnalyticsTracker";
import { captureUTMParams, getUTMForAPI } from "@/lib/utmTracker";
import { startPageTracking } from "@/lib/engagementTracker";

export default function Home() {
  const scrollRef = useScrollReveal();

  useEffect(() => {
    document.title = "Laboratório em Caraguatatuba | Total Quality Diagnóstica";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Laboratório de análises clínicas em Caraguatatuba-SP. Mais de 3.000 exames: hemograma, tomografia, ultrassom e muito mais. Agende pelo WhatsApp!");
    }

    // Initialize analytics capture for dashboard
    initAnalyticsCapture();

    // Capture UTM params and track session
    const utmData = captureUTMParams();
    const utmForAPI = getUTMForAPI();
    const sessionId = sessionStorage.getItem("tq_session_id") || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    if (!sessionStorage.getItem("tq_session_id")) sessionStorage.setItem("tq_session_id", sessionId);

    // Track session with UTM data
    fetch("/api/trpc/session.track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ json: {
        sessionId,
        ...utmForAPI,
        landingPage: window.location.pathname,
        device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : /Tablet|iPad/i.test(navigator.userAgent) ? "tablet" : "desktop",
        browser: navigator.userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)/)?.[1] || "Outro",
        os: navigator.platform || "Desconhecido",
      }}),
    }).catch(() => {});

    // Start page engagement tracking (time on page, scroll depth, quartiles)
    const cleanupEngagement = startPageTracking("/", "Home");

    // Tracking: page view + engagement metrics
    trackPageView("Home");
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
