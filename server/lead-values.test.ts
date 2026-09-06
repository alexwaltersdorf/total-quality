import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LEAD_VALUES, LEAD_VALUE_PADRAO, resolveLeadValue } from "../client/src/lib/leadValues";
import { examTypeFromPath, CONTEXTO_PADRAO } from "../client/src/lib/pageContext";

const raiz = resolve(__dirname, "..");
const ler = (p: string) => readFileSync(resolve(raiz, p), "utf-8");

/*
 * Valores por tipo de lead informados pelo Alex em 06/09/2026. Sao informacao
 * de negocio: se mudarem, o Alex muda. O teste existe para que ninguem os
 * altere por engano num refactor — e para quebrar o build quando um exame novo
 * entrar sem valor, situacao em que o lead cairia silenciosamente no padrao.
 */
describe("GUARD-RAIL: valor por tipo de lead (nao remover)", () => {
  const TABELA_DO_ALEX: Record<string, number> = {
    "exames-de-sangue": 135,
    hemograma: 135,
    laboratorio: 135,
    exames: 135,
    "exame-toxicologico": 160,
    "tomografia-computadorizada": 300,
    ultrassonografia: 150,
    "raio-x": 120,
    mapa: 165,
    holter: 165,
    eletrocardiograma: 100,
    eletroencefalograma: 200,
    espirometria: 165,
    checkup: 399,
  };

  it("cada tipo vale exatamente o que o Alex informou", () => {
    for (const [chave, valor] of Object.entries(TABELA_DO_ALEX)) {
      expect(LEAD_VALUES[chave], `valor de ${chave}`).toBe(valor);
    }
  });

  it("os valores nao sao todos iguais — e o que permite otimizar por valor", () => {
    const distintos = new Set(Object.values(LEAD_VALUES));
    expect(distintos.size).toBeGreaterThan(1);
  });

  it("todo slug de exame com valor informado casa pelo slug, nao pelo padrao", () => {
    for (const slug of [
      "tomografia-computadorizada",
      "raio-x",
      "exame-toxicologico",
      "ultrassonografia",
      "eletroencefalograma",
    ]) {
      expect(resolveLeadValue("exame", slug), `slug ${slug}`).toBe(TABELA_DO_ALEX[slug]);
    }
  });

  it("pacote de check-up casa pelo prefixo", () => {
    expect(resolveLeadValue("checkup", "checkup_completo")).toBe(399);
    expect(resolveLeadValue("checkup", "checkup_basico")).toBe(399);
  });

  it("tipo desconhecido cai no padrao, e o padrao e conservador", () => {
    const valor = resolveLeadValue("origem_nova", "exame_que_nao_existe");
    expect(valor).toBe(LEAD_VALUE_PADRAO);

    // Lead frio nunca pode valer mais que a media: superestimar faz o
    // algoritmo perseguir contato que nao se paga.
    const valores = Object.values(LEAD_VALUES);
    const media = valores.reduce((a, b) => a + b, 0) / valores.length;
    expect(LEAD_VALUE_PADRAO).toBeLessThan(media);
  });

  it("todo exame publicado tem valor OU cai no padrao de forma consciente", () => {
    // Quebra quando um exame novo entra em examesData sem decisao de valor.
    const CONHECIDOS_SEM_VALOR = ["mamografia", "exame-admissional"];
    const fonte = ler("client/src/lib/examesData.ts");
    const slugs = [...fonte.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
    expect(slugs.length).toBeGreaterThan(5);

    const semValor = slugs.filter((s) => !(s in LEAD_VALUES));
    expect(
      semValor.sort(),
      `exame(s) sem valor definido: ${semValor.join(", ")}. Pedir o ticket ao Alex e adicionar em leadValues.ts, ou incluir na lista de excecoes conscientes.`,
    ).toEqual(CONHECIDOS_SEM_VALOR.sort());
  });
});

/*
 * O contexto de exame vindo da rota e o que da significado ao exam_type nos
 * CTAs de alcance geral (botao flutuante, rodape, navbar).
 */
describe("GUARD-RAIL: contexto de exame derivado da rota (nao remover)", () => {
  it("pagina de exame devolve o slug, que e a chave do valor", () => {
    expect(examTypeFromPath("/exames/tomografia-computadorizada")).toBe("tomografia-computadorizada");
    expect(resolveLeadValue("fab", examTypeFromPath("/exames/tomografia-computadorizada"))).toBe(300);
    expect(resolveLeadValue("fab", examTypeFromPath("/exames/raio-x"))).toBe(120);
  });

  it("rotas tematicas devolvem a categoria", () => {
    expect(examTypeFromPath("/checkup")).toBe("checkup");
    expect(examTypeFromPath("/cartao")).toBe("cartao");
    expect(examTypeFromPath("/convenios")).toBe("convenios");
    expect(examTypeFromPath("/laboratorio-caraguatatuba")).toBe("laboratorio");
  });

  it("blog e artigo devolvem blog", () => {
    expect(examTypeFromPath("/blog")).toBe("blog");
    expect(examTypeFromPath("/blog/hemograma-completo-o-que-avalia")).toBe("blog");
  });

  it("tolera barra final, query string e ancora", () => {
    expect(examTypeFromPath("/exames/holter/")).toBe("holter");
    expect(examTypeFromPath("/checkup?utm_source=google")).toBe("checkup");
    expect(examTypeFromPath("/cartao#planos")).toBe("cartao");
  });

  it("rota desconhecida devolve o padrao", () => {
    expect(examTypeFromPath("/")).toBe(CONTEXTO_PADRAO);
    expect(examTypeFromPath("/qualquer-artigo-autoseo")).toBe(CONTEXTO_PADRAO);
  });

  it("o evento canonico nao volta a fixar exam_type geral", () => {
    const tracking = ler("client/src/lib/tracking.ts");
    expect(tracking).toContain("examTypeAtual");
    expect(tracking).not.toMatch(/examType:\s*string\s*=\s*"geral"/);
    expect(tracking).not.toMatch(/examType\s*\|\|\s*"geral"/);
  });
});
