/*
 * Antes de qualquer clique em WhatsApp redirecionar o paciente, pedimos o
 * nome dele. Sem isso, o lead cai na planilha (Total_Quality_Leads) sem
 * identificacao — so da pra saber que "alguem" clicou, nao quem.
 *
 * Um unico provider global (montado no App.tsx) evita repetir o modal em
 * cada um dos ~15 pontos de clique de WhatsApp do site: qualquer componente
 * chama useWhatsAppRedirect() e recebe a funcao que abre o popup, monta a
 * mensagem final e so entao abre o WhatsApp — o clique em si (trackWhatsAppClick
 * / trackScheduleExam etc.) continua disparando normalmente antes disso, sem
 * nenhuma mudanca de comportamento no GTM/dataLayer.
 */
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { trackLeadDirect } from "@/hooks/useAnalyticsTracker";
import { trackWhatsAppModalOpen, trackWhatsAppRedirectRequested } from "@/lib/tracking";

const WHATSAPP_NUMBER = "551238873535";

interface PendingRedirect {
  source: string;
  message: string;
  flowId: string;
}

type OpenWhatsApp = (source: string, message: string) => void;

const WhatsAppLeadContext = createContext<OpenWhatsApp | undefined>(undefined);

/**
 * Insere "Meu nome é X" logo apos a saudacao, para a mensagem continuar
 * soando natural (ex.: "Olá! Meu nome é Ana. Gostaria de agendar...").
 * Sem saudacao reconhecida, so antepoe a apresentacao.
 */
function buildMessageWithName(name: string, message: string): string {
  const trimmed = name.trim();
  if (/^olá!?\s*/i.test(message)) {
    return message.replace(/^olá!?\s*/i, `Olá! Meu nome é ${trimmed}. `);
  }
  return `Meu nome é ${trimmed}. ${message}`;
}

export function WhatsAppLeadProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingRedirect | null>(null);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);

  const openWhatsApp = useCallback<OpenWhatsApp>((source, message) => {
    setName("");
    setSubmitting(false);
    submitLock.current = false;
    setPending({ source, message, flowId: trackWhatsAppModalOpen(source) });
  }, []);

  const close = useCallback(() => {
    setPending(null);
    setName("");
    setSubmitting(false);
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = name.trim();
      if (!pending || trimmed.length < 2 || submitLock.current) return;

      submitLock.current = true;
      setSubmitting(true);
      trackLeadDirect(pending.source, { name: trimmed });

      const finalMessage = buildMessageWithName(trimmed, pending.message);
      trackWhatsAppRedirectRequested(pending.source, pending.flowId);
      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(finalMessage)}`,
        "_blank",
        "noopener,noreferrer"
      );

      close();
    },
    [pending, name, close]
  );

  return (
    <WhatsAppLeadContext.Provider value={openWhatsApp}>
      {children}
      {pending && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={close}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-light">Antes de continuar...</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Fechar"
                className="text-text-light hover:text-brand transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-semibold text-text-light mb-2">
                Qual é o seu nome?
              </label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                placeholder="Seu nome"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand mb-4"
              />
              <button
                type="submit"
                disabled={submitting || name.trim().length < 2}
                className="w-full bg-[#25D366] hover:bg-[#1da851] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold uppercase tracking-wider py-3 rounded-lg transition-colors"
              >
                Continuar para o WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}
    </WhatsAppLeadContext.Provider>
  );
}

/** Retorna a funcao para abrir o fluxo de WhatsApp com captura de nome. */
export function useWhatsAppRedirect(): OpenWhatsApp {
  const ctx = useContext(WhatsAppLeadContext);
  if (!ctx) {
    throw new Error("useWhatsAppRedirect deve ser usado dentro de WhatsAppLeadProvider");
  }
  return ctx;
}
