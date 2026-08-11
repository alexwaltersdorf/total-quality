/*
 * Transporte do lead entre o formulario de contato e /formulario-sucesso.
 *
 * Nunca por query string. Nome, telefone e e-mail sao dado pessoal; combinados
 * ao tipo de exame viram dado de saude (art. 11 da LGPD, dado sensivel). Numa
 * URL eles entrariam no page_location do GA4, o que viola a politica de dados
 * pessoais do Google Analytics — risco de exclusao da propriedade — alem da
 * propria LGPD.
 *
 * O dado vive em sessionStorage por poucos segundos e e apagado na PRIMEIRA
 * leitura (consumeLeadHandoff), nao no unmount: refresh, link direto ou aba
 * nova caem no estado neutro da pagina de sucesso.
 */
export type LeadHandoff = {
  nome: string;
  telefone: string;
  email: string;
  tipoExame: string;
  mensagem: string;
};

const STORAGE_KEY = "tq-lead-handoff";

/** Guarda o lead para a proxima tela. Silencioso se o storage nao existir. */
export function storeLeadHandoff(lead: LeadHandoff) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lead));
  } catch {
    // sessionStorage indisponivel (navegacao privada, cota): a pagina de
    // sucesso degrada para o estado neutro em vez de quebrar.
  }
}

/** Le o lead e o remove do storage no mesmo passo. */
export function consumeLeadHandoff(): LeadHandoff | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LeadHandoff>;
    return {
      nome: parsed.nome ?? "",
      telefone: parsed.telefone ?? "",
      email: parsed.email ?? "",
      tipoExame: parsed.tipoExame ?? "",
      mensagem: parsed.mensagem ?? "",
    };
  } catch {
    return null;
  }
}
