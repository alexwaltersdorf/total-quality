/*
 * Design: "Warm Clinical" — Humanized Material Design 3
 * FAB: Floating Action Button for WhatsApp (M3 style - rounded square)
 */
import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

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
        <div className="bg-white rounded-2xl shadow-xl p-4 border border-border/50 w-64">
          <p className="font-semibold text-foreground text-sm mb-1">Olá! Precisa de ajuda?</p>
          <p className="text-muted-foreground text-xs mb-3">Agende seu exame pelo WhatsApp de forma rápida e fácil.</p>
          <a
            href="https://wa.me/5512997743535?text=Olá! Gostaria de agendar um exame."
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2.5 rounded-full transition-colors"
          >
            Iniciar Conversa
          </a>
        </div>
        <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-border/50 rotate-45" />
      </div>

      {/* FAB Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-14 h-14 rounded-[18px] flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ${
          expanded
            ? "bg-gray-600 hover:bg-gray-700 rotate-0"
            : "bg-green-600 hover:bg-green-700 animate-bounce-gentle"
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
