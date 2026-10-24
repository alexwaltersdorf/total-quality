import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { getSeoContentForPath } from "./_core/seo-content";
import { getAllRoutes, getRouteMetadata } from "./_core/routes-metadata";
import {
  HOME_TITLE,
  HOME_H1,
  ANALISES_TITLE,
  ANALISES_H1,
  CONVENIOS_TEXTO,
} from "@shared/const";

/*
 * Travas da REGRA DE OURO (out/2026), derivada do documento do Google "Como a
 * Pesquisa Google determina a classificação de resultados": significado,
 * relevância, qualidade, usabilidade e contexto. Ver a regra 22 do
 * SEO_STANDARDS.md. Cada bloco diz qual indicador protege.
 */

const RAIZ = resolve(import.meta.dirname, "..");
const ler = (p: string) => readFileSync(resolve(RAIZ, p), "utf-8");

function arquivos(dir: string, ext: RegExp): string[] {
  const out: string[] = [];
  for (const nome of readdirSync(resolve(RAIZ, dir))) {
    const rel = join(dir, nome);
    if (statSync(resolve(RAIZ, rel)).isDirectory()) out.push(...arquivos(rel, ext));
    else if (ext.test(nome)) out.push(rel);
  }
  return out;
}

const h1De = (html: string) =>
  (html.match(/<h1>([\s\S]*?)<\/h1>/)?.[1] ?? "").replace(/<[^>]+>/g, "").trim();

describe("REGRA DE OURO — relevância: a home é a dona de 'laboratório'", () => {
  /*
   * Decidido por Search Console (90 dias até 16/10/2026): a home é a URL que o
   * Google escolhe para "laboratório caraguatatuba" e "laboratório", e é a URL
   * do perfil do Google. Entregar o termo a outra página derruba a melhor URL.
   */
  it("o title da home vem da fonte única e abre com o termo", () => {
    expect(HOME_TITLE).toMatch(/^Laborat[óo]rio em Caraguatatuba \| Total Quality$/);
    expect(getRouteMetadata("/")!.title).toBe(HOME_TITLE);
  });

  it("o index.html estático usa o mesmo title", () => {
    expect(ler("client/index.html")).toContain(`<title>${HOME_TITLE}</title>`);
  });

  it("o H1 do pré-render e o do React são o mesmo texto", () => {
    expect(h1De(getSeoContentForPath("/")!)).toBe(HOME_H1);
    expect(HOME_H1).toMatch(/^Laborat[óo]rio em Caraguatatuba/);
    expect(ler("client/src/components/HeroSection.tsx")).toContain("{HOME_H1}");
  });

  it("o React da home não escreve o próprio title", () => {
    const home = ler("client/src/pages/Home.tsx");
    expect(home).toContain("document.title = HOME_TITLE");
    expect(home).not.toMatch(/document\.title\s*=\s*["'`]/);
  });

  it("nenhuma outra rota abre o title com 'Laboratório em Caraguatatuba'", () => {
    const outras = getAllRoutes()
      .filter((r) => new URL(r.canonical).pathname !== "/")
      .filter((r) => /^Laborat[óo]rio em Caraguatatuba/i.test(r.title))
      .map((r) => r.canonical);
    expect(outras).toEqual([]);
  });
});

describe("REGRA DE OURO — significado: a landing é de 'análises clínicas'", () => {
  /*
   * A canibalização real estava no React: o servidor dizia "Laboratório de
   * Análises Clínicas" e o document.title reescrevia para "Laboratório em
   * Caraguatatuba"; o H1 renderizado era "LABORATÓRIO EM CARAGUATATUBA". O
   * Google lê a página renderizada — via as duas páginas como a mesma.
   */
  it("title, H1 e React da landing usam a fonte única de análises clínicas", () => {
    expect(getRouteMetadata("/laboratorio-caraguatatuba")!.title).toBe(ANALISES_TITLE);
    expect(h1De(getSeoContentForPath("/laboratorio-caraguatatuba")!)).toBe(ANALISES_H1);
    const pagina = ler("client/src/pages/LaboratorioCaraguatatuba.tsx");
    expect(pagina).toContain("document.title = ANALISES_TITLE");
    expect(pagina).toContain("{ANALISES_H1}");
    expect(pagina).not.toMatch(/document\.title\s*=\s*["'`]/);
    expect(pagina).not.toMatch(/LABORAT[ÓO]RIO EM/);
  });

  it("nem o title nem o H1 da landing começam por 'Laboratório'", () => {
    expect(ANALISES_TITLE).not.toMatch(/^Laborat/i);
    expect(ANALISES_H1).not.toMatch(/^Laborat/i);
  });

  it("a landing passa a autoridade do termo para a home com link de âncora exata", () => {
    const html = getSeoContentForPath("/laboratorio-caraguatatuba")!;
    expect(html).toMatch(/<a href="\/">laborat[óo]rio em Caraguatatuba<\/a>/i);
  });
});

describe("REGRA DE OURO — qualidade: só o que é verdade e se sustenta", () => {
  /*
   * "Conhecimento, legitimidade e confiabilidade" (Google) e CFM 2.336/2023
   * apontam na mesma direção. Três classes de texto envelheciam ou mentiam no
   * site em out/2026: convênios genéricos (são três), superlativos e nota
   * declarada pelo próprio site.
   */
  const FONTES = [
    ...arquivos("client/src", /\.(tsx?|json)$/),
    ...arquivos("server/_core", /\.ts$/),
    "client/index.html",
    "shared/const.ts",
  ];

  it("nenhum texto diz 'diversos' ou 'principais' convênios", () => {
    const achados = FONTES.filter((f) =>
      /(diversos|principais)\s+conv[êe]nios/i.test(ler(f)),
    );
    expect(achados, `a lista é fechada em ${CONVENIOS_TEXTO}`).toEqual([]);
  });

  it("nenhum texto usa 'última geração'", () => {
    const achados = FONTES.filter((f) => /[úu]ltima gera[çc][ãa]o/i.test(ler(f)));
    expect(achados).toEqual([]);
  });

  it("nenhum texto diz que a clínica é a 'mais completa'", () => {
    const re = /(cl[íi]nica|laborat[óo]rio)[^."\n]{0,80}mais complet[oa]/i;
    const achados = FONTES.filter((f) => re.test(ler(f)));
    expect(achados).toEqual([]);
  });

  it.each(["/", "/laboratorio-caraguatatuba"])("%s não anuncia nota própria", (rota) => {
    expect(getSeoContentForPath(rota)!).not.toMatch(/nota\s*[45][,.]\d/i);
    expect(getRouteMetadata(rota)!.description).not.toMatch(/nota\s*[45][,.]\d/i);
  });

  it("a FAQ de convênios da home nomeia os três", () => {
    expect(getSeoContentForPath("/")!).toContain(CONVENIOS_TEXTO);
  });
});

describe("REGRA DE OURO — contexto: uma entidade só, tipada como laboratório", () => {
  /*
   * O index.html declarava a clínica duas vezes (#localbusiness e
   * #medicalbusiness). Duas entidades para o mesmo endereço diluem o sinal
   * local. Agora é um nó, com DiagnosticLab e o link do perfil no Maps.
   */
  const blocos = [...ler("client/index.html").matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  )].map((m) => JSON.parse(m[1]));
  const negocio = blocos.filter((b) => b["@id"]?.includes("#"));

  it("há exatamente um nó de negócio, com o @id canônico", () => {
    expect(negocio.map((b) => b["@id"])).toEqual(["https://totalquality.med.br/#medicalbusiness"]);
    expect(ler("client/index.html")).not.toContain("#localbusiness");
  });

  it("o nó é tipado como laboratório e aponta o mapa do perfil", () => {
    const [n] = negocio;
    expect(n["@type"]).toEqual(expect.arrayContaining(["MedicalBusiness", "DiagnosticLab"]));
    expect(n.hasMap).toContain("query_place_id=ChIJl9cmhfhjzZQRANUzZnnRLF8");
  });

  it("bloco MedicalClinic do Alex (24/10/2026) entrou no mesmo nó, sem criar #clinica", () => {
    // O bloco enviado pelo Alex declarava a clínica com outro @id (#clinica).
    // Os dados novos foram fundidos aqui: cidades atendidas, aceita pacientes
    // novos, exames ocupacionais e coleta domiciliar.
    const [n] = negocio;
    expect(ler("client/index.html")).not.toContain("#clinica");
    expect(n.isAcceptingNewPatients).toBe(true);
    const cidades = n.areaServed.filter((a: { "@type": string }) => a["@type"] === "City").map((a: { name: string }) => a.name);
    expect(cidades).toEqual(["Caraguatatuba", "Ubatuba", "São Sebastião", "Ilhabela"]);
    const servicos = n.availableService.map((s: { name: string }) => s.name).join(" | ");
    expect(servicos).toMatch(/Exames Ocupacionais/);
    expect(servicos).toMatch(/Coleta Domiciliar/);
  });

  it("especialidade no schema só se o site oferece (sem pediatria nem gastro sem página)", () => {
    // Schema que declara o que a página não mostra é dado estruturado
    // enganoso para o Google e serviço não prestado para o CFM.
    const [n] = negocio;
    expect(n.medicalSpecialty.join(" ")).not.toMatch(/Pediatric|Gastroenterologic/);
  });
});
