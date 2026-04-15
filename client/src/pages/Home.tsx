/*
 * Style: Optik Editorial — Minimalist, uppercase display type, brand #9B212B
 * Home page: Composes all sections in editorial flow
 * Hero → Diferenciais → Exames → Cartão → Sobre → Contato → Footer
 * SEO: Semantic HTML structure with proper heading hierarchy
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

export default function Home() {
  const scrollRef = useScrollReveal();

  useEffect(() => {
    document.title = "Total Quality Medicina Diagnóstica | Exames em Caraguatatuba-SP";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Total Quality Medicina Diagnóstica em Caraguatatuba-SP. Tomografia, ultrassonografia, mamografia, raio-X, ecocardiograma, holter, MAPA, bioimpedância, check-up e exames laboratoriais. Mais de 3.000 tipos de exames com tecnologia de última geração.");
    }
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
