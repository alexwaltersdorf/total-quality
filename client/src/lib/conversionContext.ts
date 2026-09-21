/*
 * O que o servidor precisa saber para reportar a conversao no lugar do
 * navegador (ver server/_core/conversions.ts).
 *
 * Nada aqui e dado pessoal: sao identificadores tecnicos que as proprias
 * plataformas ja gravaram como cookie no dispositivo, mais o estado do
 * consentimento. Contato (nome, telefone, e-mail) NAO passa por este modulo —
 * ele viaja no corpo do lead.create, que ja e um canal proprio nosso, e so vira
 * hash no servidor.
 */
const CONSENT_KEY = "tq-consent";

function readCookie(nome: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const achado = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${nome}=`));
  return achado ? decodeURIComponent(achado.slice(nome.length + 1)) : undefined;
}

/**
 * client_id do GA4, extraido do cookie `_ga`.
 *
 * O cookie tem o formato `GA1.1.<client_id>`, em que o client_id e o par
 * "<aleatorio>.<timestamp>" — as duas ultimas partes. Sem ele o Measurement
 * Protocol nao consegue costurar o evento a sessao que o navegador abriu, e o
 * lead apareceria no GA4 como um usuario solto, sem origem.
 *
 * Ausente quando o visitante negou analytics (sem cookie) ou e a primeira
 * visita antes do GA4 escrever — nesses casos o servidor simplesmente nao
 * envia ao GA4.
 */
export function readGaClientId(): string | undefined {
  const bruto = readCookie("_ga");
  if (!bruto) return undefined;
  const partes = bruto.split(".");
  return partes.length >= 4 ? `${partes[2]}.${partes[3]}` : undefined;
}

/**
 * Cookies de clique do Meta. `_fbc` so existe quando a pessoa chegou por um
 * anuncio (o fbclid da URL); `_fbp` identifica o navegador. Sao o que permite
 * ao Meta casar a conversao com o anuncio que a gerou.
 */
export function readFbCookies(): { fbc?: string; fbp?: string } {
  return { fbc: readCookie("_fbc"), fbp: readCookie("_fbp") };
}

/**
 * Estado do consentimento, lido da mesma chave que o banner grava
 * (components/CookieConsent.tsx). Hoje o banner e tudo-ou-nada: "Aceitar
 * cookies" libera as duas finalidades, "Somente essenciais" nao libera
 * nenhuma. Se um dia o banner passar a ter escolha por finalidade, e aqui que
 * a leitura muda — o servidor ja trata as duas separadamente.
 */
export function consentState(): { marketing: boolean; analytics: boolean } {
  if (typeof window === "undefined") return { marketing: false, analytics: false };
  let salvo: string | null = null;
  try {
    salvo = window.localStorage.getItem(CONSENT_KEY);
  } catch {
    salvo = null;
  }
  const concedido = salvo === "granted";
  return { marketing: concedido, analytics: concedido };
}
