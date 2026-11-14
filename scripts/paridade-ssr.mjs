#!/usr/bin/env node
/*
 * Paridade servidor x navegador nas rotas de template (SEO nov/2026, Fase 1).
 *
 * Para cada rota de amostra compara o HTML que o servidor entrega (o que o
 * curl e o Googlebot veem, lido aqui com JavaScript DESLIGADO) com a pagina
 * ja hidratada no navegador:
 *   - H1, sequencia de H2/H3, perguntas e respostas do FAQ e links do #root
 *     iguais;
 *   - o FAQPage do JSON-LD igual ao FAQ visivel;
 *   - nenhum aviso/erro de hidratacao no console;
 *   - o React reaproveitou o DOM do servidor (o mesmo <h1>, nao um novo).
 *
 * Uso (com o servidor de producao no ar: pnpm build && pnpm start):
 *   node scripts/paridade-ssr.mjs http://localhost:3000
 *   node scripts/paridade-ssr.mjs http://localhost:3000 /bioimpedancia /exames/raio-x
 *
 * Precisa do Playwright com o Chromium instalado (nao e dependencia do
 * projeto). Sai com codigo 1 se qualquer rota divergir.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Playwright nao encontrado. Instale com: npx playwright install chromium (e npm i -g playwright)");
  process.exit(2);
}

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
// Amostra do plano; outras rotas podem vir depois da URL na linha de comando.
const ROTAS = process.argv.length > 3 ? process.argv.slice(3) : [
  "/exames/hemograma",
  "/exames/ultrassonografia",
  "/especialidades/endocrinologista",
  "/laboratorio-caraguatatuba",
  "/checkup",
];
const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const AVISO_HIDRATACAO = /hydrat|did not match|server rendered|Minified React error #(418|419|421|422|423|425)/i;

/** Roda dentro da pagina: estrutura do #root. */
function extrair() {
  const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
  const root = document.getElementById("root");
  const fora = (el) => el.closest('[role="dialog"]');
  const texto = (el) => {
    const c = el.cloneNode(true);
    c.querySelectorAll('[aria-hidden="true"]').forEach((x) => x.remove());
    return norm(c.textContent);
  };
  const headings = [...root.querySelectorAll("h1, h2, h3")].filter((h) => !fora(h)).map((h) => `${h.tagName}:${texto(h)}`);
  const faq = [...root.querySelectorAll("details")].filter((d) => !fora(d)).map((d) => {
    const s = d.querySelector("summary");
    const c = d.cloneNode(true);
    c.querySelector("summary")?.remove();
    return { q: texto(s), a: norm(c.textContent) };
  });
  const links = [...root.querySelectorAll("a[href]")].filter((a) => !fora(a)).map((a) => a.getAttribute("href"));
  const ld = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .map((s) => { try { return JSON.parse(s.textContent); } catch { return null; } })
    .filter(Boolean);
  const faqLd = (ld.find((b) => b["@type"] === "FAQPage")?.mainEntity || []).map((q) => ({
    q: norm(q.name),
    a: norm(q.acceptedAnswer?.text),
  }));
  return {
    h1: [...root.querySelectorAll("h1")].map(texto),
    headings,
    faq,
    links,
    faqLd,
    ssr: root.hasAttribute("data-ssr"),
  };
}

const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function diff(nome, a, b) {
  if (igual(a, b)) return [];
  const linhas = [`  ${nome} diverge`];
  const n = Math.max(a.length ?? 0, b.length ?? 0);
  for (let i = 0; i < n; i++) {
    if (!igual(a[i], b[i])) {
      linhas.push(`    [${i}] servidor: ${JSON.stringify(a[i])}`);
      linhas.push(`    [${i}] navegador: ${JSON.stringify(b[i])}`);
      break;
    }
  }
  return linhas;
}

const browser = await chromium.launch();
let falhas = 0;
for (const rota of ROTAS) {
  const url = BASE + rota;

  // 1) O que o servidor entrega (JavaScript desligado = curl/Googlebot sem render)
  const semJs = await browser.newContext({ javaScriptEnabled: false, userAgent: IPHONE });
  const p1 = await semJs.newPage();
  const resp = await p1.goto(url, { waitUntil: "domcontentloaded" });
  const servidor = await p1.evaluate(extrair);
  await semJs.close();

  // 2) A pagina hidratada
  const comJs = await browser.newContext({ userAgent: IPHONE, viewport: { width: 390, height: 844 } });
  // terceiros fora: o teste e do codigo do site
  await comJs.route(/googletagmanager|google-analytics|facebook|doubleclick|\/metrics\//, (r) => r.abort());
  await comJs.addInitScript(() => {
    // banner de cookies fechado: visitante que ja escolheu
    try { localStorage.setItem("tq-consent", "granted"); } catch {}
    document.addEventListener("DOMContentLoaded", () => { window.__h1Servidor = document.querySelector("#root h1"); });
  });
  const p2 = await comJs.newPage();
  const mensagens = [];
  p2.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") mensagens.push(`${m.type()}: ${m.text()}`);
  });
  p2.on("pageerror", (e) => mensagens.push(`pageerror: ${e.message}`));
  await p2.goto(url, { waitUntil: "networkidle" });
  await p2.waitForTimeout(1500);
  const navegador = await p2.evaluate(extrair);
  const reaproveitou = await p2.evaluate(() => window.__h1Servidor === document.querySelector("#root h1") && !!window.__h1Servidor);
  await comJs.close();

  const problemas = [];
  if (resp?.status() !== 200) problemas.push(`  status ${resp?.status()}`);
  if (!servidor.ssr) problemas.push("  o #root nao veio marcado com data-ssr");
  if (servidor.h1.length !== 1) problemas.push(`  ${servidor.h1.length} H1 no HTML do servidor`);
  problemas.push(...diff("H1", servidor.h1, navegador.h1));
  problemas.push(...diff("H2/H3", servidor.headings, navegador.headings));
  problemas.push(...diff("FAQ", servidor.faq, navegador.faq));
  problemas.push(...diff("links", servidor.links, navegador.links));
  problemas.push(...diff("FAQPage x FAQ visivel", servidor.faqLd, servidor.faq));
  if (!servidor.faq.length) problemas.push("  sem FAQ visivel");
  if (servidor.faq.some((f) => f.a.length < 20)) problemas.push("  resposta do FAQ ausente do HTML do servidor");
  if (!servidor.headings.includes("H2:Onde fazer em Caraguatatuba")) problemas.push('  sem "Onde fazer em Caraguatatuba"');
  const hidratacao = mensagens.filter((m) => AVISO_HIDRATACAO.test(m));
  if (hidratacao.length) problemas.push(...hidratacao.map((m) => `  console: ${m.slice(0, 300)}`));
  if (!reaproveitou) problemas.push("  o React redesenhou o #root em vez de hidratar (H1 trocado)");

  const resumo = `H1 "${servidor.h1[0]}" · ${servidor.headings.length} H2/H3 · ${servidor.faq.length} FAQ · ${servidor.links.length} links`;
  if (problemas.length) {
    falhas++;
    console.log(`FALHA ${rota} — ${resumo}`);
    console.log(problemas.join("\n"));
  } else {
    console.log(`ok    ${rota} — ${resumo} · hidratacao sem aviso`);
  }
}
await browser.close();
if (falhas) {
  console.log(`\n${falhas} rota(s) divergente(s).`);
  process.exit(1);
}
console.log("\nParidade servidor x navegador: ok nas", ROTAS.length, "rotas.");
