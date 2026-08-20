import type { Express, Request, Response } from "express";

/**
 * Gateway da tag do Google (Google tag gateway for advertisers) — configuração
 * MANUAL, já que a Hostinger não está entre as plataformas com setup
 * automático (Cloudflare, CloudFront etc.).
 *
 * O que faz: serve o GTM e os hits de medição pelo NOSSO domínio
 * (totalquality.med.br/metrics/...) fazendo reverse proxy para a
 * infraestrutura first-party do Google (<TAG_ID>.fps.goog), conforme
 * https://developers.google.com/tag-platform/tag-manager/gateway/setup-guide?setup=manual
 *
 * Verificação pós-deploy: https://totalquality.med.br/metrics/healthy → "ok".
 *
 * IMPORTANTE: registrar ANTES de express.json()/urlencoded() — os POSTs de
 * medição precisam chegar aqui como stream bruto, não como body já consumido.
 *
 * Limitação documentada: os headers de geolocalização por visitante
 * (X-Forwarded-Country/Region) são opcionais e exigem uma base GeoIP que a
 * Hostinger não expõe; sem eles o Google usa o IP encaminhado em
 * X-Forwarded-For. O teste /metrics/?validate_geo=healthy pode não passar,
 * mas a medição principal funciona.
 */

const TAG_ID = "GTM-WLR7JD57";
const UPSTREAM = `https://${TAG_ID}.fps.goog`;
export const GATEWAY_PATH = "/metrics";

const FORWARD_REQUEST_HEADERS = [
  "content-type",
  "user-agent",
  "accept",
  "accept-language",
  "referer",
  "origin",
  "cookie",
];

const FORWARD_RESPONSE_HEADERS = [
  "content-type",
  "location",
  "cache-control",
  "expires",
  "pragma",
  "access-control-allow-origin",
  "access-control-allow-credentials",
  "access-control-allow-headers",
  "access-control-allow-methods",
];

function clientIp(req: Request): string {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) return xff.split(",")[0].trim();
  return req.socket.remoteAddress ?? "";
}

async function readRawBody(req: Request, limit = 1024 * 1024): Promise<Buffer | undefined> {
  if (req.method === "GET" || req.method === "HEAD") return undefined;
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > limit) throw new Error("payload acima do limite do gateway");
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
}

export function registerTagGateway(app: Express): void {
  app.all(new RegExp(`^${GATEWAY_PATH}(/.*)?$`), async (req: Request, res: Response) => {
    try {
      const headers: Record<string, string> = {};
      for (const name of FORWARD_REQUEST_HEADERS) {
        const value = req.headers[name];
        if (typeof value === "string") headers[name] = value;
      }
      headers["x-forwarded-for"] = clientIp(req);
      headers["x-forwarded-proto"] = "https";

      const body = await readRawBody(req);
      const upstream = await fetch(`${UPSTREAM}${req.originalUrl}`, {
        method: req.method,
        headers,
        body: body && body.length > 0 ? new Uint8Array(body) : undefined,
        redirect: "manual",
        signal: AbortSignal.timeout(10_000),
      });

      res.status(upstream.status);
      for (const name of FORWARD_RESPONSE_HEADERS) {
        const value = upstream.headers.get(name);
        if (value) res.setHeader(name, value);
      }
      // Cookies first-party do gateway (podem vir múltiplos)
      const setCookies =
        typeof upstream.headers.getSetCookie === "function"
          ? upstream.headers.getSetCookie()
          : [];
      if (setCookies.length > 0) res.setHeader("set-cookie", setCookies);

      const payload = Buffer.from(await upstream.arrayBuffer());
      res.send(payload);
    } catch {
      // Falha do gateway nunca derruba a página: o loader do index.html tem
      // fallback automático para googletagmanager.com via onerror.
      res.status(502).end();
    }
  });
}
