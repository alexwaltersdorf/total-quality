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

/*
 * O nome no dado estruturado tem de bater EXATAMENTE com o Perfil da Empresa
 * no Google, que e a referencia de toda citacao local. Lido pela API em
 * 06/09/2026: "Total Quality Laboratório e Medicina Diagnóstica Caraguatatuba".
 *
 * O site exibia duas formas — 50 ocorrencias de "Total Quality Medicina
 * Diagnóstica" e 1 de "Total Quality Laboratório e Medicina Diagnóstica" — e
 * nenhuma batia com o perfil. As formas curtas continuam validas como
 * alternateName; o que nao pode e o `name` divergir do perfil, porque e por
 * ele que o Google consolida a entidade.
 */
describe("GUARD-RAIL: nome canonico do Perfil da Empresa (nao remover)", () => {
  const NOME_DO_PERFIL = "Total Quality Laboratório e Medicina Diagnóstica Caraguatatuba";

  /*
   * Vale para os blocos de NEGOCIO (LocalBusiness, MedicalBusiness,
   * MedicalClinic). O bloco WebSite descreve o site, nao a empresa, e usa
   * legitimamente o nome curto.
   *
   * O JSON e PARSEADO, nao casado por regex: um dos blocos declara tipo
   * multiplo (`"@type": ["MedicalClinic", "LocalBusiness"]`) e as duas
   * primeiras versoes desta trava reprovaram por nao enxergar esse formato —
   * o codigo estava certo e o teste e que estava fragil.
   */
  it("os blocos de negocio usam o nome do perfil no campo name", () => {
    const html = ler("client/index.html");
    const blocos = [...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    )].map((m) => JSON.parse(m[1]));
    expect(blocos.length, "blocos JSON-LD parseados").toBeGreaterThanOrEqual(3);

    const TIPOS_DE_NEGOCIO = ["LocalBusiness", "MedicalBusiness", "MedicalClinic"];
    const negocios = blocos.filter((b) => {
      const tipos = Array.isArray(b["@type"]) ? b["@type"] : [b["@type"]];
      return tipos.some((t: string) => TIPOS_DE_NEGOCIO.includes(t));
    });
    expect(negocios.length, "blocos de negócio encontrados").toBeGreaterThanOrEqual(2);

    for (const bloco of negocios) {
      expect(bloco.name, `campo name de ${JSON.stringify(bloco["@type"])}`).toBe(
        NOME_DO_PERFIL,
      );
    }
  });

  it("as formas curtas seguem declaradas como alternateName", () => {
    const html = ler("client/index.html");
    expect(html).toMatch(/"alternateName":\s*\[[^\]]*Total Quality Medicina Diagnóstica/);
  });

  it("o hook do client nao volta a divergir do perfil", () => {
    const hook = ler("client/src/hooks/useSchemaLocalBusiness.ts");
    expect(hook).not.toMatch(/name:\s*"Total Quality Medicina Diagnóstica"/);
  });
});
