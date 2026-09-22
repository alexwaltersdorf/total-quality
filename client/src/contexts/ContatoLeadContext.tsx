/*
 * Formulario de qualificacao que antecede TODO pedido de contato do site:
 * WhatsApp e ligacao telefonica.
 *
 * Um unico provider global (montado no App.tsx) evita repetir o modal em cada
 * um dos ~25 pontos de clique: o componente chama useWhatsAppRedirect() ou
 * useTelefoneRedirect(), recebe a funcao que abre o formulario, e so depois do
 * envio o paciente sai para a conversa ou para o discador.
 *
 * HISTORICO. Ate 14/09/2026 o fluxo pedia so o nome, e so no WhatsApp. Em
 * 20/09 passou a pedir nome, telefone e e-mail. Em 21/09, a pedido do Alex,
 * passou a valer tambem para os botoes de ligacao — ate entao metade dos
 * pedidos de contato saia do site sem deixar registro, porque um
 * <a href=tel:...> entrega o numero ao sistema operacional e a clinica so
 * descobre o lead se a chamada completar e alguem anotar.
 *
 * ATENCAO AO CUSTO, E ELE E MAIOR NO TELEFONE. Tres campos obrigatorios antes
 * do WhatsApp ja eram atrito; antes de uma ligacao sao mais, porque quem toca
 * em "Ligar" no celular espera o discador abrir na hora. As duas valvulas de
 * escape estao logo abaixo e valem uma linha cada:
 *   - CAMPOS_OBRIGATORIOS  -> o que trava o envio;
 *   - CANAIS_QUALIFICADOS  -> onde o formulario aparece. Tirar "telefone"
 *     devolve o discador imediato e mantem o WhatsApp qualificado.
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
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { gerarCodigoTQ, registrarCliqueWhatsApp } from "@/lib/adsClickTracker";
import { trackLeadDirect } from "@/hooks/useAnalyticsTracker";
import {
  trackLeadQualificado,
  trackPhoneClick,
  trackWhatsAppModalOpen,
  trackWhatsAppRedirectRequested,
} from "@/lib/tracking";
import { consentState, readFbCookies, readGaClientId } from "@/lib/conversionContext";
import { examTypeAtual } from "@/lib/pageContext";
import { resolveLeadValue } from "@/lib/leadValues";

const WHATSAPP_NUMBER = "551238873535";

/**
 * Mesmo numero, no formato que o discador entende. NAO e exportado de
 * proposito: se qualquer componente pudesse importar a constante, poderia
 * discar por fora do formulario sem que o guard-rail percebesse.
 */
const TELEFONE_HREF = "tel:+551238873535";

export type Canal = "whatsapp" | "telefone";

/**
 * Marca de passagem pelo formulario, usada so pelo par /ligar ->
 * /obrigado-chamada. A pagina que disca tem URL propria e seria um desvio
 * trivial do formulario se bastasse abri-la; a marca fecha essa porta.
 *
 * Vale para UMA discagem e some ao ser lida — assim voltar para a pagina pelo
 * historico nao disca de novo. Fica em sessionStorage, que nao sai da aba nem
 * vira dado nosso: e controle de navegacao, nao medicao (a copia de eventos no
 * navegador foi removida em set/2026 e ha guard-rail contra a volta dela).
 */
const CHAVE_LIGACAO = "tq_ligacao_qualificada";

export const MARCA_LIGACAO_QUALIFICADA = {
  marcar() {
    try {
      sessionStorage.setItem(CHAVE_LIGACAO, "1");
    } catch {
      // Navegacao anonima com storage bloqueado: sem marca, a pagina de
      // discagem pede o formulario de novo. Pedir duas vezes e melhor que
      // deixar passar sem lead.
    }
  },
  consumir(): boolean {
    try {
      const marcada = sessionStorage.getItem(CHAVE_LIGACAO) === "1";
      if (marcada) sessionStorage.removeItem(CHAVE_LIGACAO);
      return marcada;
    } catch {
      return false;
    }
  },
};

/**
 * Canais que passam pelo formulario. Tirar um daqui devolve o comportamento
 * antigo (sair direto) sem mexer em nenhum ponto de clique.
 */
const CANAIS_QUALIFICADOS: readonly Canal[] = ["whatsapp", "telefone"];

const canalQualificado = (canal: Canal) => CANAIS_QUALIFICADOS.includes(canal);

/**
 * O que barra o envio. Tirar "telefone" e/ou "email" daqui transforma o campo
 * em opcional sem mexer em mais nada — os dois continuam sendo capturados e
 * enviados quando preenchidos.
 */
const CAMPOS_OBRIGATORIOS = ["nome", "telefone", "email"] as const;
type Campo = "nome" | "telefone" | "email";

const obrigatorio = (campo: Campo) =>
  (CAMPOS_OBRIGATORIOS as readonly string[]).includes(campo);

/** Texto e cor do modal por canal. So muda a casca; o fluxo e o mesmo. */
const COPY: Record<Canal, {
  titulo: string;
  subtitulo: string;
  acao: string;
  acaoCarregando: string;
  classeBotao: string;
}> = {
  whatsapp: {
    titulo: "Antes de continuar...",
    subtitulo: "Assim conseguimos retornar mesmo se a conversa cair.",
    acao: "Continuar para o WhatsApp",
    acaoCarregando: "Abrindo...",
    classeBotao: "bg-[#25D366] hover:bg-[#1da851]",
  },
  telefone: {
    titulo: "Antes de ligar...",
    subtitulo: "Assim conseguimos retornar se a ligação não completar.",
    acao: "Continuar para a ligação",
    acaoCarregando: "Chamando...",
    classeBotao: "bg-brand hover:bg-brand-dark",
  },
};

interface PendingContato {
  canal: Canal;
  /** Origem ja prefixada (ver abrirTelefone): e o que chega ao banco. */
  source: string;
  /** So no WhatsApp: a mensagem que sera pre-preenchida na conversa. */
  message?: string;
  /** So no WhatsApp: liga o modal_open ao redirect_requested. */
  flowId?: string;
  /**
   * So no telefone: substitui a discagem no fim do fluxo. Existe para a rota
   * /ligar, que precisa passar por /obrigado-chamada antes de discar — e essa
   * URL pode ser gatilho de conversao no GTM.
   */
  aposEnviar?: () => void;
}

type AbrirWhatsApp = (source: string, message: string) => void;
type AbrirTelefone = (source: string, aposEnviar?: () => void) => void;

interface ContatoLead {
  abrirWhatsApp: AbrirWhatsApp;
  abrirTelefone: AbrirTelefone;
}

const ContatoLeadContext = createContext<ContatoLead | undefined>(undefined);

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

/**
 * Acrescenta o codigo TQ-XXXXX que liga esta conversa ao clique no anuncio.
 *
 * Só acrescenta se o beacon do ADS-01 tiver mesmo sido enviado — ou seja, se
 * VITE_ADS_CLICK_WEBHOOK_URL estiver configurada. Sem o webhook no ar o codigo
 * nao liga coisa nenhuma, e seria apenas uma sigla estranha na frente de quem
 * quer marcar um exame. Uma variavel de ambiente liga e desliga tudo, e
 * enquanto ela nao existe a mensagem sai exatamente como sai hoje.
 *
 * Ver docs/gclid-e-conversoes-offline.md.
 */
function mensagemComCodigo(message: string, source: string): string {
  const codigo = gerarCodigoTQ();
  return registrarCliqueWhatsApp(codigo, source) ? `${message}\n\n[${codigo}]` : message;
}

/**
 * Nova aba, sempre: tirar o paciente do site encerra a sessao e derruba a
 * atribuicao. O trackWhatsAppRedirectRequested de quem chama fica logo acima.
 */
function abrirConversa(message: string, source: string) {
  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagemComCodigo(message, source))}`,
    "_blank",
    "noopener,noreferrer"
  );
}

/**
 * Mesma aba, de proposito e ao contrario do WhatsApp: tel: nao abre aba
 * nenhuma — entrega o numero ao discador do sistema e a pagina continua onde
 * estava. Um window.open aqui deixaria uma aba em branco para tras no desktop
 * e e ignorado pelo Safari no iOS.
 */
function abrirDiscador() {
  window.location.href = TELEFONE_HREF;
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

export function ContatoLeadProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingContato | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const idBase = useId();

  const limpar = useCallback(() => {
    setNome("");
    setTelefone("");
    setEmail("");
    setErros({});
    setSubmitting(false);
    submitLock.current = false;
  }, []);

  const abrirWhatsApp = useCallback<AbrirWhatsApp>(
    (source, message) => {
      if (!canalQualificado("whatsapp")) {
        trackWhatsAppRedirectRequested(source, "sem_qualificacao");
        abrirConversa(message, source);
        return;
      }
      limpar();
      setPending({
        canal: "whatsapp",
        source,
        message,
        flowId: trackWhatsAppModalOpen(source),
      });
    },
    [limpar]
  );

  const abrirTelefone = useCallback<AbrirTelefone>(
    (source, aposEnviar) => {
      /*
       * O phone_click sai no mesmo instante em que saia quando isto era um
       * <a href=tel:...>: a serie do GTM nao tem descontinuidade, e a origem
       * continua sendo a mesma string de antes ("footer", "checkup_topo"...).
       */
      trackPhoneClick(source);
      if (!canalQualificado("telefone")) {
        (aposEnviar ?? abrirDiscador)();
        return;
      }
      limpar();
      // Prefixo so no lead: separa no banco e na planilha quem pediu ligacao
      // de quem pediu conversa, sem renomear a origem que o GTM ja conhece.
      setPending({ canal: "telefone", source: `telefone_${source}`, aposEnviar });
    },
    [limpar]
  );

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
        eventId = await trackLeadQualificado(
          pending.source,
          examType,
          { email: emailLimpo, telefone: telefoneLimpo },
          pending.canal
        );
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
              leadChannel: pending.canal,
              clientId: readGaClientId(),
              fbc,
              fbp,
              consentMarketing: consent.marketing,
              consentAnalytics: consent.analytics,
            }
          : undefined
      );

      if (pending.canal === "telefone") {
        (pending.aposEnviar ?? abrirDiscador)();
      } else {
        trackWhatsAppRedirectRequested(pending.source, pending.flowId ?? "");
        abrirConversa(buildMessageWithName(nomeLimpo, pending.message ?? ""), pending.source);
      }

      close();
    },
    [pending, nome, telefone, email, close]
  );

  const campoClasse = (campo: Campo) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand ${
      erros[campo] ? "border-red-500" : "border-gray-300"
    }`;

  const valor = useMemo<ContatoLead>(
    () => ({ abrirWhatsApp, abrirTelefone }),
    [abrirWhatsApp, abrirTelefone]
  );
  const copy = pending ? COPY[pending.canal] : null;

  return (
    <ContatoLeadContext.Provider value={valor}>
      {children}
      {pending && copy && (
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
                {copy.titulo}
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
            <p className="text-sm text-text-light/80 mb-4">{copy.subtitulo}</p>

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
                className={`w-full ${copy.classeBotao} disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold uppercase tracking-wider py-3 rounded-lg transition-colors`}
              >
                {submitting ? copy.acaoCarregando : copy.acao}
              </button>
              <p className="text-[11px] leading-snug text-text-light/60 mt-3">
                Usamos seus dados apenas para retornar o contato. Nada é publicado
                nem compartilhado fora disso.
              </p>
            </form>
          </div>
        </div>
      )}
    </ContatoLeadContext.Provider>
  );
}

function useContatoLead(hook: string): ContatoLead {
  const ctx = useContext(ContatoLeadContext);
  if (!ctx) {
    throw new Error(`${hook} deve ser usado dentro de ContatoLeadProvider`);
  }
  return ctx;
}

/** Abre o formulario e, no envio, leva a conversa do WhatsApp. */
export function useWhatsAppRedirect(): AbrirWhatsApp {
  return useContatoLead("useWhatsAppRedirect").abrirWhatsApp;
}

/** Abre o formulario e, no envio, entrega o numero ao discador. */
export function useTelefoneRedirect(): AbrirTelefone {
  return useContatoLead("useTelefoneRedirect").abrirTelefone;
}
