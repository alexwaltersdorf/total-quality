/*
 * Design: "Warm Clinical" — Humanized Material Design 3
 * Home page: Composes all sections in the patient journey order
 * Hero → Diferenciais → Exames → Cartão → Sobre → Contato → Footer
 */
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

  return (
    <div ref={scrollRef} className="min-h-screen">
      <Navbar />
      <main>
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
