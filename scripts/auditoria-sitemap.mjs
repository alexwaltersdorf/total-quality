#!/usr/bin/env node
/*
 * Auditoria de todas as URLs do sitemap (SEO nov/2026, Fase 7).
 *
 * Le <base>/sitemap.xml e, para CADA <loc>, abre <base><caminho> e confere no
 * HTML que o servidor entrega (JavaScript desligado = o que o curl e o
 * Googlebot leem antes de renderizar):
 *   - status 200 (sem redirecionamento);
 *   - exatamente um <h1>; nas paginas de servico (/exames/*, /especialidades/*,
 *     /laboratorio-caraguatatuba, /checkup, /bioimpedancia) ele contem
 *     "Caraguatatuba";
 *   - <title> com ate 60 caracteres;
 *   - meta description entre 120 e 160 caracteres;
 *   - canonical igual a propria URL do sitemap;
 *   - todo bloco JSON-LD faz parse (e ha pelo menos um);
 *   - toda <img> com alt, width e height.
 * Depois abre a mesma URL com JavaScript (pagina montada pelo React) e confere:
 *   - title, description e canonical continuam os do servidor (o React nao
 *     troca por outros depois de montar);
 *   - link de WhatsApp (api.whatsapp.com) em toda URL;
 *   - CTA "Ligar" nas paginas de servico e na home. O "Ligar" e de proposito
 *     um <button> que abre o formulario de qualificacao antes da ligacao
 *     (decisao do Alex, 15/11/2026; guard-rail em server/seo-content.test.ts)
 *     — por isso o script procura o botao, nao um link tel:. Nas demais
 *     paginas (blog, institucionais) o contato e so pelo WhatsApp/ExamCTA, e
 *     a coluna e informativa;
 *   - toda <img> da pagina montada com alt, width e height.
 * Tambem mede, no conteudo principal (<main>, ou o #root sem menu/rodape
 * quando nao ha <main>): palavras, H2, links internos distintos e imagens —
 * a mesma conta serve para o "antes x depois".
 *
 * Uso (servidor de producao no ar: pnpm build && pnpm start):
 *   node scripts/auditoria-sitemap.mjs http://localhost:3000
 *   node scripts/auditoria-sitemap.mjs http://localhost:3000 --json saida.json
 *
 * Precisa do Playwright com o Chromium (nao e dependencia do projeto). Sai com
 * codigo 1 se alguma URL falhar em alguma checagem.
 */
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Playwright nao encontrado. Instale com: npx playwright install chromium (e npm i -g playwright)");
  process.exit(2);
}

const args = process.argv.slice(2);
const iJson = args.indexOf("--json");
const SAIDA_JSON = iJson >= 0 ? args[iJson + 1] : null;
const BASE = (args.find((a, i) => !a.startsWith("--") && i !== iJson + 1) || "http://localhost:3000").replace(/\/$/, "");

const SERVICO = /^\/(exames\/[^/]+|especialidades\/[^/]+|laboratorio-caraguatatuba|checkup|bioimpedancia)$/;
const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

const sitemap = await fetch(`${BASE}/sitemap.xml`).then((r) => {
  if (!r.ok) throw new Error(`sitemap.xml respondeu ${r.status}`);
  return r.text();
});
const locs = [...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
if (!locs.length) {
  console.error("Nenhuma <loc> no sitemap.");
  process.exit(2);
}

/** Roda dentro da pagina (sem JavaScript do site). */
function extrair() {
  const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
  const root = document.getElementById("root") || document.body;
  const main = document.querySelector("main");
  let conteudo;
  if (main) {
    conteudo = main.cloneNode(true);
  } else {
    conteudo = root.cloneNode(true);
    conteudo.querySelectorAll("nav, header, footer, [role=dialog]").forEach((x) => x.remove());
  }
  conteudo.querySelectorAll("script, style, noscript, template").forEach((x) => x.remove());
  const palavras = norm(conteudo.textContent).split(" ").filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  const internos = new Set(
    [...conteudo.querySelectorAll("a[href]")]
      .map((a) => a.getAttribute("href"))
      .filter((h) => /^\/(?!\/)/.test(h) || /^https:\/\/totalquality\.med\.br(\/|$)/.test(h))
      .map((h) => h.replace(/^https:\/\/totalquality\.med\.br/, "").replace(/#.*$/, "") || "/"),
  );
  const imgs = [...document.querySelectorAll("img")];
  const imgsRuins = imgs
    .filter((i) => !i.hasAttribute("alt") || !i.getAttribute("width") || !i.getAttribute("height"))
    .map((i) => {
      const faltam = ["alt", "width", "height"].filter((a) => (a === "alt" ? !i.hasAttribute(a) : !i.getAttribute(a)));
      return `${i.getAttribute("src")} (sem ${faltam.join("/")})`;
    });
  const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
    try {
      JSON.parse(s.textContent);
      return true;
    } catch {
      return false;
    }
  });
  return {
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? null,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
    h1: [...document.querySelectorAll("h1")].map((h) => norm(h.textContent)),
    h2: conteudo.querySelectorAll("h2").length,
    palavras,
    linksInternos: internos.size,
    imagensConteudo: conteudo.querySelectorAll("img").length,
    imagens: imgs.length,
    imgsRuins,
    ldTotal: ld.length,
    ldInvalidos: ld.filter((ok) => !ok).length,
    whatsapp: document.querySelectorAll('a[href^="https://api.whatsapp.com/send"]').length,
    ligar: [...document.querySelectorAll("button")].filter((b) => /^\s*Ligar\b/i.test(b.textContent)).length,
    tel: document.querySelectorAll('a[href^="tel:"]').length,
  };
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ javaScriptEnabled: false, userAgent: IPHONE });
const page = await ctx.newPage();
// Pagina montada: so o codigo do site (terceiros bloqueados) e cookies ja escolhidos.
const ctxJs = await browser.newContext({ userAgent: IPHONE, viewport: { width: 390, height: 844 } });
await ctxJs.route((u) => !u.href.startsWith(BASE), (r) => r.abort());
await ctxJs.addInitScript(() => {
  try { localStorage.setItem("tq-consent", "granted"); } catch {}
});
const pageJs = await ctxJs.newPage();
const resultados = [];

for (const loc of locs) {
  const caminho = new URL(loc).pathname;
  const url = BASE + caminho;
  const r = await fetch(url, { redirect: "manual" });
  const html = await r.text();
  // Le o MESMO HTML que o fetch recebeu, sem pedir de novo nem rodar o JS do site.
  await page.setContent(html, { waitUntil: "domcontentloaded" });
  const d = await page.evaluate(extrair);
  await pageJs.goto(url, { waitUntil: "load" });
  await pageJs.waitForTimeout(800);
  const m = await pageJs.evaluate(extrair);
  const falhas = [];
  if (r.status !== 200) falhas.push(`status ${r.status}`);
  if (d.h1.length !== 1) falhas.push(`${d.h1.length} H1`);
  if (SERVICO.test(caminho) && !d.h1.some((h) => /Caraguatatuba/.test(h))) falhas.push('H1 sem "Caraguatatuba"');
  if (d.title.length > 60) falhas.push(`title ${d.title.length} car.`);
  const nDesc = d.description?.length ?? 0;
  if (nDesc < 120 || nDesc > 160) falhas.push(`description ${d.description == null ? "ausente" : nDesc + " car."}`);
  if (d.canonical !== loc) falhas.push(`canonical ${d.canonical ?? "ausente"}`);
  if (!d.ldTotal) falhas.push("sem JSON-LD");
  if (d.ldInvalidos) falhas.push(`${d.ldInvalidos} JSON-LD invalido(s)`);
  if (m.title !== d.title) falhas.push(`title muda no navegador: "${m.title}" (${m.title.length} car.)`);
  if (m.description !== d.description) falhas.push(`description muda no navegador (${m.description?.length ?? 0} car.)`);
  if (m.canonical !== d.canonical) falhas.push(`canonical muda no navegador: ${m.canonical}`);
  if (!m.whatsapp) falhas.push("sem link api.whatsapp.com na pagina montada");
  const exigeLigar = SERVICO.test(caminho) || caminho === "/";
  if (exigeLigar && !m.ligar) falhas.push('sem botao "Ligar" na pagina montada');
  const imgsRuins = [...new Set([...d.imgsRuins, ...m.imgsRuins])];
  if (imgsRuins.length) falhas.push(`${imgsRuins.length} img sem alt/width/height: ${imgsRuins.join(", ")}`);
  resultados.push({
    caminho,
    status: r.status,
    ...d,
    imgsRuins,
    waServidor: d.whatsapp,
    whatsapp: m.whatsapp,
    ligar: m.ligar,
    exigeLigar,
    imagensMontada: m.imagens,
    servico: SERVICO.test(caminho),
    falhas,
  });
}
await browser.close();

const ok = (b) => (b ? "ok" : "**X**");
console.log(`Auditoria de ${resultados.length} URLs do sitemap em ${BASE}\n`);
console.log("| URL | Status | H1 | Title | Desc. | Canonical | JSON-LD | Palavras | H2 | Links int. | Imgs (serv./mont.) | WhatsApp (serv./mont.) | Ligar | Img alt/w/h | Resultado |");
console.log("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
for (const x of resultados) {
  const nDesc = x.description?.length ?? 0;
  console.log(
    `| ${x.caminho} | ${x.status} | ${ok(x.h1.length === 1 && (!x.servico || /Caraguatatuba/.test(x.h1[0])))} | ${x.title.length}${x.title.length > 60 ? " **X**" : ""} | ${nDesc}${nDesc < 120 || nDesc > 160 ? " **X**" : ""} | ${ok(x.canonical === BASE_LOC(x))} | ${x.ldTotal}${x.ldInvalidos ? ` (${x.ldInvalidos} **X**)` : ""} | ${x.palavras} | ${x.h2} | ${x.linksInternos} | ${x.imagens}/${x.imagensMontada} | ${x.waServidor}/${x.whatsapp}${x.whatsapp ? "" : " **X**"} | ${x.ligar ? "ok" : x.exigeLigar ? "**X**" : "—"} | ${ok(!x.imgsRuins.length)} | ${x.falhas.length ? "FALHA" : "ok"} |`,
  );
}
function BASE_LOC(x) {
  return locs.find((l) => new URL(l).pathname === x.caminho);
}
const comFalha = resultados.filter((x) => x.falhas.length);
console.log(`\n${resultados.length - comFalha.length}/${resultados.length} URLs passam em todas as checagens.`);
for (const x of comFalha) console.log(`- ${x.caminho}: ${x.falhas.join("; ")}`);
if (SAIDA_JSON) writeFileSync(SAIDA_JSON, JSON.stringify(resultados, null, 2));
process.exit(comFalha.length ? 1 : 0);
