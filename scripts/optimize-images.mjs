/**
 * Gera as variantes AVIF + WebP servidas por client/public/images.
 *
 * Por que as imagens vivem aqui e não no bucket S3/CloudFront: os objetos do
 * bucket voltam com `Content-Type: application/octet-stream` e sem
 * `Cache-Control`, então o navegador não os trata como imagem nem os
 * cacheia. Servidas pelo próprio domínio, herdam os headers corretos
 * (immutable + Brotli) e passam pelo CDN da Hostinger.
 *
 * Uso:
 *   node scripts/optimize-images.mjs <arquivo-de-origem> <slug> [larguras]
 *
 * Exemplo:
 *   node scripts/optimize-images.mjs ./nova-foto.jpg sala-coleta 480,768,1024,1440
 *
 * Depois, no componente:
 *   <ResponsiveImage slug="sala-coleta" widths={[480,768,1024,1440]} … />
 *
 * Regra (SEO_STANDARDS.md): toda imagem nova passa por aqui. Nunca referenciar
 * PNG/JPG multi-MB direto de CDN externo — foi a causa do LCP de 6,4 s medido
 * em jul/2026.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.resolve(import.meta.dirname, "..", "client", "public", "images");

const [, , src, slug, widthsArg] = process.argv;

if (!src || !slug) {
  console.error("Uso: node scripts/optimize-images.mjs <origem> <slug> [larguras]");
  process.exit(1);
}

const widths = (widthsArg ?? "480,768,1024,1440,1920").split(",").map(Number);

fs.mkdirSync(OUT_DIR, { recursive: true });

const meta = await sharp(src).metadata();
const applicable = widths.filter((w) => w <= meta.width);

/*
 * Geotag EXIF da clínica (R. Padre Anchieta, 1010 — Caraguatatuba/SP).
 * -23.6225 → 23°37'21"S · -45.4132 → 45°24'47.5"W
 * Honestidade sobre o efeito: o Google declara que não usa EXIF para
 * ranqueamento; o valor aqui é consistência de procedência (autoria +
 * local) a custo zero na geração. Não esperar ganho de posição por isso.
 * Requer sharp >= 0.33 (withExif); se a versão local for mais antiga,
 * remover o .withExif() abaixo e atualizar o sharp.
 */
const EXIF_CLINICA = {
  IFD0: {
    Copyright: "Total Quality Medicina Diagnóstica - Caraguatatuba/SP",
    Artist: "Total Quality Medicina Diagnóstica",
  },
  IFD3: {
    GPSLatitudeRef: "S",
    GPSLatitude: "23/1 37/1 2100/100",
    GPSLongitudeRef: "W",
    GPSLongitude: "45/1 24/1 4752/100",
  },
};

console.log(`${slug}: origem ${meta.width}x${meta.height} (${Math.round(fs.statSync(src).size / 1024)} KB)`);

for (const width of applicable) {
  for (const [format, options] of [
    ["avif", { quality: 55, effort: 6 }],
    ["webp", { quality: 72 }],
  ]) {
    const file = path.join(OUT_DIR, `${slug}-${width}.${format}`);
    await sharp(src)
      .resize({ width })
      .withExif(EXIF_CLINICA)
      .toFormat(format, options)
      .toFile(file);
    console.log(`  ${slug}-${width}.${format}: ${Math.round(fs.statSync(file).size / 1024)} KB`);
  }
}

console.log(
  `\nUse no componente: widths={[${applicable.join(", ")}]} width={${applicable.at(-1)}} height={${Math.round(
    applicable.at(-1) * (meta.height / meta.width)
  )}}`
);
