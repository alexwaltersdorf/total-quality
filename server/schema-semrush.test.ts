import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ler = (p: string) => readFileSync(resolve(__dirname, "..", p), "utf-8");

/*
 * Travas dos achados do Site Audit do Semrush de 06/09/2026. O relatorio
 * apontou 12 paginas com dado estruturado invalido e 1 titulo longo demais.
 * Cada teste registra o que estava errado, para ninguem reverter sem saber.
 */
describe("GUARD-RAIL: achados do Semrush 06/09 (nao remover)", () => {
  it("medicalSpecialty usa a enumeracao do schema.org, nunca texto livre", () => {
    const html = ler("client/index.html");
    // "Diagnostic Imaging", "Cardiology" e "Clinical Laboratory" nao sao
    // membros da enumeracao MedicalSpecialty — era o que invalidava o bloco.
    expect(html).not.toMatch(/"medicalSpecialty"[\s\S]{0,200}"Diagnostic Imaging"/);
    expect(html).not.toMatch(/"medicalSpecialty"[\s\S]{0,200}"Clinical Laboratory"/);
    expect(html).toMatch(/"medicalSpecialty"[\s\S]{0,400}https:\/\/schema\.org\/Radiography/);
    expect(html).toMatch(/"medicalSpecialty"[\s\S]{0,400}https:\/\/schema\.org\/LaboratoryScience/);
  });

  it("cada especialidade declarada tem exame correspondente no availableService", () => {
    const html = ler("client/index.html");
    const parear: Array<[string, RegExp]> = [
      ["Radiography", /Raio-X|Tomografia|Mamografia|Ultrassonografia/],
      ["LaboratoryScience", /Exames Laboratoriais|Hemograma/],
      ["Cardiovascular", /Eletrocardiograma|Holter|MAPA/],
      ["Pulmonary", /Espirometria/],
      ["Neurologic", /Eletroencefalograma/],
      ["Toxicologic", /Exame Toxicol/],
    ];
    for (const [especialidade, exame] of parear) {
      expect(html, `especialidade ${especialidade} declarada`).toContain(
        `https://schema.org/${especialidade}`,
      );
      expect(html, `exame que sustenta ${especialidade}`).toMatch(exame);
    }
  });

  it("nenhuma pagina injeta um segundo MedicalBusiness com o mesmo @id", () => {
    // /checkup fazia isso via useSchemaLocalBusiness e era uma das 12 paginas
    // marcadas. Dois nos com o mesmo @id e dados diferentes sao ambiguos.
    const checkup = ler("client/src/pages/CheckUp.tsx");
    expect(checkup).not.toMatch(/useSchemaLocalBusiness\(\)/);
  });

  it("nenhum titulo de rota passa de 70 caracteres", () => {
    const meta = ler("server/_core/routes-metadata.ts");
    const titulos = [...meta.matchAll(/title:\s*"([^"]+)"/g)].map((m) => m[1]);
    expect(titulos.length).toBeGreaterThan(5);
    const longos = titulos.filter((t) => t.length > 70);
    expect(longos, `títulos acima de 70 caracteres: ${longos.join(" | ")}`).toEqual([]);
  });
});
