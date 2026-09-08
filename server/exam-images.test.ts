import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getRouteMetadata } from "./_core/routes-metadata";

const projectRoot = path.resolve(import.meta.dirname, "..");
const examAssetSources = [
  "client/src/lib/examesData.ts",
  "client/src/pages/ExamePage.tsx",
  "client/src/pages/CheckUp.tsx",
  "client/src/pages/Bioimpedancia.tsx",
  "client/src/hooks/useSchemaLocalBusiness.ts",
];

describe("mídias das páginas de exames", () => {
  it("não dependem do CloudFront que retorna 403", () => {
    for (const relativePath of examAssetSources) {
      const source = fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
      expect(source, relativePath).not.toContain("d2xsxph8kpxj0f.cloudfront.net");
    }
  });

  it("referenciam somente arquivos locais existentes", () => {
    for (const relativePath of examAssetSources) {
      const source = fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
      const files = Array.from(source.matchAll(/(?:https:\/\/totalquality\.med\.br)?\/images\/([^"'`)]+)/g), (match) => match[1]);

      for (const file of files) {
        expect(
          fs.existsSync(path.join(projectRoot, "client/public/images", file)),
          `${relativePath} aponta para /images/${file}, mas o arquivo não existe`,
        ).toBe(true);
      }
    }
  });

  it("usa imagens locais nos previews dos exames que possuíam OG externo", () => {
    expect(getRouteMetadata("/exames/exames-de-sangue")?.ogImage)
      .toBe("https://totalquality.med.br/images/laboratorio-1440.webp");
    expect(getRouteMetadata("/exames/tomografia-computadorizada")?.ogImage)
      .toBe("https://totalquality.med.br/images/tomografia-1440.webp");
  });
});
