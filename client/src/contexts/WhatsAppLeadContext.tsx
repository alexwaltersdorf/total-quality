/*
 * Formulario de qualificacao que antecede todo clique de WhatsApp do site.
 *
 * Um unico provider global (montado no App.tsx) evita repetir o modal em cada
 * um dos ~15 pontos de clique: qualquer componente chama useWhatsAppRedirect()
 * e recebe a funcao que abre o formulario, monta a mensagem final e so entao
 * abre o WhatsApp — o clique em si (trackWhatsAppClick / trackScheduleExam)
 * continua disparando antes disso, sem mudanca no GTM.
 *
 * HISTORICO. Ate 14/09/2026 pedia so o nome. Passou a pedir nome, telefone e
 * e-mail a pedido do Alex (20/09), para o lead chegar qualificado ao banco e
 * as plataformas de anuncio.
 *
 * ATENCAO AO CUSTO. Tres campos obrigatorios antes do WhatsApp e mais atrito
 * que um, e atrito no caminho principal de conversao do site custa lead. Se os
 * numeros piorarem, a mudanca e de uma linha: `CAMPOS_OBRIGATORIOS` abaixo
 * define o que trava o envio. Deixar telefone e e-mail opcionais mantem a
 * captura de quem quiser preencher sem barrar quem nao quiser.
 *
 * ONDE OS DADOS VAO (nesta ordem, e nenhuma etapa derruba a seguinte):
 *   1. dataLayer -> GTM -> GA4, Google Ads e Meta, com contato so em hash
 *      SHA-256 e apenas com consentimento de marketing (lib/userData.ts);
 *   2. banco (lead.create) -> planilha do Google e e-mail para a clinica;
 *   3. servidor -> Meta Conversions API e GA4 Measurement Protocol
 *      (server/_core/conversions.ts), compartilhando o event_id da etapa 1
 *      para as plataformas nao contarem a mesma conversao duas vezes.
 */
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { trackLeadDirect } from "@/hooks/useAnalyticsTracker";
import {
  trackLeadQualificado,
  trackWhatsAppModalOpen,
  trackWhatsAppRedirectRequested,
} from "@/lib/tracking";
import { consentState, readFbCookies, readGaClientId } from "@/lib/conversionContext";
import { examTypeAtual } from "@/lib/pageContext";
import { resolveLeadValue } from "@/lib/leadValues";

const WHATSAPP_NUMBER = "551238873535";

/**
 * O que barra o envio. Tirar "telefone" e/ou "email" daqui transforma o campo
 * em opcional sem mexer em mais nada — os dois continuam sendo capturados e
 * enviados quando preenchidos.
 */
const CAMPOS_OBRIGATORIOS = ["nome", "telefone", "email"] as const;
type Campo = "nome" | "telefone" | "email";

const obrigatorio = (campo: Campo) =>
  (CAMPOS_OBRIGATORIOS as readonly string[]).includes(campo);

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
 */
function buildMessageWithName(name: string, message: string): string {
  const trimmed = name.trim();
  if (/^olá!?\s*/i.test(message)) {
    return message.replace(/^olá!?\s*/i, `Olá! Meu nome é ${trimmed}. `);
  }
  return `Meu nome é ${trimmed}. ${message}`;
}

/** (12) 98765-4321 — formata enquanto a pessoa digita, sem travar o apagar. */
function mascaraTelefone(bruto: string): string {
  const d = bruto.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Fixo (10) ou celular (11) com DDD. */
function telefoneValido(valor: string): boolean {
  const d = valor.replace(/\D/g, "");
  return d.length === 10 || d.length === 11;
}

function emailValido(valor: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim());
}

type Erros = Partial<Record<Campo, string>>;

function validar(nome: string, telefone: string, email: string): Erros {
  const erros: Erros = {};
  if (nome.trim().length < 2) erros.nome = "Informe seu nome.";
  if (obrigatorio("telefone") && !telefone.trim()) {
    erros.telefone = "Informe seu telefone.";
  } else if (telefone.trim() && !telefoneValido(telefone)) {
    erros.telefone = "Telefone incompleto — inclua o DDD.";
  }
  if (obrigatorio("email") && !email.trim()) {
    erros.email = "Informe seu e-mail.";
  } else if (email.trim() && !emailValido(email)) {
    erros.email = "E-mail inválido.";
  }
  return erros;
}

export function WhatsAppLeadProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingRedirect | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const idBase = useId();

  const openWhatsApp = useCallback<OpenWhatsApp>((source, message) => {
    setNome("");
    setTelefone("");
    setEmail("");
    setErros({});
    setSubmitting(false);
    submitLock.current = false;
    setPending({ source, message, flowId: trackWhatsAppModalOpen(source) });
  }, []);

  const close = useCallback(() => {
    setPending(null);
    setErros({});
    setSubmitting(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!pending || submitLock.current) return;

      const encontrados = validar(nome, telefone, email);
      setErros(encontrados);
      if (Object.keys(encontrados).length > 0) return;

      submitLock.current = true;
      setSubmitting(true);

      const nomeLimpo = nome.trim();
      const telefoneLimpo = telefone.trim() || undefined;
      const emailLimpo = email.trim() || undefined;
      const examType = examTypeAtual();

      /*
       * Ordem importa. O evento do navegador sai primeiro e devolve o
       * event_id; o servidor recebe o MESMO id e as plataformas deduplicam.
       * Se o push falhar, seguimos assim mesmo — o lead no banco vale mais
       * que a conversao no relatorio.
       */
      let eventId: string | undefined;
      try {
        eventId = await trackLeadQualificado(pending.source, examType, {
          email: emailLimpo,
          telefone: telefoneLimpo,
        });
      } catch {
        eventId = undefined;
      }

      const consent = consentState();
      const { fbc, fbp } = readFbCookies();
      void trackLeadDirect(
        pending.source,
        { name: nomeLimpo, phone: telefoneLimpo, email: emailLimpo },
        eventId
          ? {
              eventId,
              examType,
              value: resolveLeadValue(pending.source, examType),
              clientId: readGaClientId(),
              fbc,
              fbp,
              consentMarketing: consent.marketing,
              consentAnalytics: consent.analytics,
            }
          : undefined
      );

      const finalMessage = buildMessageWithName(nomeLimpo, pending.message);
      trackWhatsAppRedirectRequested(pending.source, pending.flowId);
      // Nova aba: o paciente continua com o site aberto atras da conversa.
      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(finalMessage)}`,
        "_blank",
        "noopener,noreferrer"
      );

      close();
    },
    [pending, nome, telefone, email, close]
  );

  const campoClasse = (campo: Campo) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand ${
      erros[campo] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <WhatsAppLeadContext.Provider value={openWhatsApp}>
      {children}
      {pending && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${idBase}-titulo`}
            className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-1 gap-3">
              <h2 id={`${idBase}-titulo`} className="text-lg font-bold text-text-light">
                Antes de continuar...
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Fechar"
                className="text-text-light hover:text-brand transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-text-light/80 mb-4">
              Assim conseguimos retornar mesmo se a conversa cair.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label
                  htmlFor={`${idBase}-nome`}
                  className="block text-sm font-semibold text-text-light mb-1"
                >
                  Nome{obrigatorio("nome") && " *"}
                </label>
                <input
                  autoFocus
                  id={`${idBase}-nome`}
                  name="nome"
                  type="text"
                  autoComplete="name"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  aria-invalid={Boolean(erros.nome)}
                  aria-describedby={erros.nome ? `${idBase}-nome-erro` : undefined}
                  placeholder="Seu nome"
                  className={campoClasse("nome")}
                />
                {erros.nome && (
                  <p id={`${idBase}-nome-erro`} className="text-xs text-red-600 mt-1">
                    {erros.nome}
                  </p>
                )}
              </div>

              <div className="mb-3">
                <label
                  htmlFor={`${idBase}-telefone`}
                  className="block text-sm font-semibold text-text-light mb-1"
                >
                  Telefone{obrigatorio("telefone") && " *"}
                </label>
                <input
                  id={`${idBase}-telefone`}
                  name="telefone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                  aria-invalid={Boolean(erros.telefone)}
                  aria-describedby={erros.telefone ? `${idBase}-telefone-erro` : undefined}
                  placeholder="(12) 98765-4321"
                  className={campoClasse("telefone")}
                />
                {erros.telefone && (
                  <p id={`${idBase}-telefone-erro`} className="text-xs text-red-600 mt-1">
                    {erros.telefone}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor={`${idBase}-email`}
                  className="block text-sm font-semibold text-text-light mb-1"
                >
                  E-mail{obrigatorio("email") && " *"}
                </label>
                <input
                  id={`${idBase}-email`}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(erros.email)}
                  aria-describedby={erros.email ? `${idBase}-email-erro` : undefined}
                  placeholder="seu@email.com"
                  className={campoClasse("email")}
                />
                {erros.email && (
                  <p id={`${idBase}-email-erro`} className="text-xs text-red-600 mt-1">
                    {erros.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#25D366] hover:bg-[#1da851] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold uppercase tracking-wider py-3 rounded-lg transition-colors"
              >
                {submitting ? "Abrindo..." : "Continuar para o WhatsApp"}
              </button>
              <p className="text-[11px] leading-snug text-text-light/60 mt-3">
                Usamos seus dados apenas para retornar o contato. Nada é publicado
                nem compartilhado fora disso.
              </p>
            </form>
          </div>
        </div>
      )}
    </WhatsAppLeadContext.Provider>
  );
}

/** Retorna a funcao para abrir o fluxo de WhatsApp com qualificacao do lead. */
export function useWhatsAppRedirect(): OpenWhatsApp {
  const ctx = useContext(WhatsAppLeadContext);
  if (!ctx) {
    throw new Error("useWhatsAppRedirect deve ser usado dentro de WhatsAppLeadProvider");
  }
  return ctx;
}
