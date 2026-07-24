/*
 * Style: Optik Editorial — Clean WhatsApp FAB
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 */
import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { trackWhatsAppClick } from "@/lib/tracking";
import { trackLeadDirect } from "@/hooks/useAnalyticsTracker";

export default function WhatsAppFAB() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      }`}
    >
      {/* Expanded tooltip */}
      <div
        className={`absolute bottom-full right-0 mb-3 transition-all duration-300 ${
          expanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="bg-white shadow-xl p-5 w-64 border border-black/10">
          <p className="font-semibold text-text text-sm mb-1">Precisa de ajuda?</p>
          <p className="text-text-muted text-xs mb-3">Agende seu exame pelo WhatsApp de forma rápida.</p>
          <a
            href="https://wa.me/551238873535?text=Olá! Gostaria de agendar um exame."
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { trackWhatsAppClick("fab_iniciar_conversa"); trackLeadDirect("whatsapp_fab"); }}
            className="block w-full text-center bg-[#25D366] hover:bg-[#1da851] text-white text-xs font-semibold uppercase tracking-wider py-3 transition-colors"
          >
            Iniciar Conversa
          </a>
        </div>
      </div>

      {/* FAB Button */}
      <button
        onClick={() => { if (!expanded) { trackWhatsAppClick("fab_open"); } setExpanded(!expanded); }}
        aria-label={expanded ? "Fechar opções de WhatsApp" : "Agendar exame pelo WhatsApp"}
        className={`w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ${
          expanded
            ? "bg-text hover:bg-text-light"
            : "bg-[#25D366] hover:bg-[#1da851] animate-bounce-gentle"
        }`}
        style={{
          animation: expanded ? "none" : undefined,
        }}
      >
        {expanded ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
