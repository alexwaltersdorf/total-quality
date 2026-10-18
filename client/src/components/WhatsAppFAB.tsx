/*
 * Botao flutuante de contato.
 * Auditoria de design (18/10/2026): era o unico elemento quadrado num site de
 * botoes arredondados, e o verde puro do WhatsApp brigava com o vinho da
 * marca. Agora redondo, na cor da marca, como os demais botoes principais.
 */
import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { trackCtaClick, trackWhatsAppClick } from "@/lib/tracking";
import { useWhatsAppRedirect } from "@/contexts/ContatoLeadContext";

export default function WhatsAppFAB({ laboratory = false }: { laboratory?: boolean }) {
  const openWhatsApp = useWhatsAppRedirect();
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
        <div className="bg-white shadow-xl p-5 w-64 border border-black/10 rounded-2xl">
          <p className="font-semibold text-text text-sm mb-1">Precisa de ajuda?</p>
          <p className="text-text-muted text-xs mb-3">{laboratory ? "Consulte preparo e orçamento pelo WhatsApp." : "Tire dúvidas de preparo, convênio e horários pelo WhatsApp."}</p>
          <button
            type="button"
            onClick={() => {
              trackWhatsAppClick("fab_iniciar_conversa");
              openWhatsApp("whatsapp_fab", laboratory ? "Olá! Gostaria de consultar preparo e orçamento de exames laboratoriais." : "Olá! Gostaria de agendar um exame.");
            }}
            className="btn-pill w-full"
          >
            Iniciar Conversa
          </button>
        </div>
      </div>

      {/* FAB Button */}
      <button
        onClick={() => { if (!expanded) { trackCtaClick("fab_open"); } setExpanded(!expanded); }}
        aria-label={expanded ? "Fechar opções de WhatsApp" : laboratory ? "Consultar o laboratório pelo WhatsApp" : "Agendar exame pelo WhatsApp"}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-colors duration-200 ${
          expanded ? "bg-text hover:bg-text-light" : "bg-brand hover:bg-brand-dark"
        }`}
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
