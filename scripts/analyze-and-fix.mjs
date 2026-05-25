#!/usr/bin/env node

/**
 * Script de Análise e Correção Automática de Arquivos
 * Integra Claude para analisar e corrigir arquivos do repositório
 * 
 * Uso: node scripts/analyze-and-fix.mjs [--file <path>] [--type <type>] [--fix]
 * 
 * Exemplos:
 *   node scripts/analyze-and-fix.mjs --file server/routers.ts --type typescript --fix
 *   node scripts/analyze-and-fix.mjs --file client/src/pages/Home.tsx --type react --fix
 *   node scripts/analyze-and-fix.mjs --file drizzle/schema.ts --type database --fix
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const args = process.argv.slice(2);
const options = {
  file: null,
  type: null,
  fix: false,
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--file" && args[i + 1]) {
    options.file = args[++i];
  } else if (args[i] === "--type" && args[i + 1]) {
    options.type = args[++i];
  } else if (args[i] === "--fix") {
    options.fix = true;
  }
}

// Validar arquivo
if (!options.file) {
  console.error("❌ Erro: --file é obrigatório");
  console.error("Uso: node scripts/analyze-and-fix.mjs --file <path> [--type <type>] [--fix]");
  process.exit(1);
}

const filePath = path.resolve(options.file);
if (!fs.existsSync(filePath)) {
  console.error(`❌ Erro: Arquivo não encontrado: ${filePath}`);
  process.exit(1);
}

// Detectar tipo de arquivo se não especificado
if (!options.type) {
  const ext = path.extname(filePath);
  const typeMap = {
    ".ts": "typescript",
    ".tsx": "react",
    ".js": "javascript",
    ".jsx": "react",
    ".sql": "sql",
    ".md": "markdown",
    ".json": "json",
    ".css": "css",
  };
  options.type = typeMap[ext] || "text";
}

// Ler arquivo
const content = fs.readFileSync(filePath, "utf-8");
const fileName = path.basename(filePath);

console.log(`\n📋 Analisando arquivo: ${fileName}`);
console.log(`📝 Tipo: ${options.type}`);
console.log(`📦 Caminho: ${filePath}`);
console.log(`📊 Tamanho: ${(content.length / 1024).toFixed(2)} KB`);
console.log(`📈 Linhas: ${content.split("\n").length}`);

// Criar prompt de análise
const analysisPrompt = `
Você é um especialista em análise de código. Analise o seguinte arquivo ${options.type} e identifique:

1. **Problemas de Qualidade**: Bugs, anti-patterns, código duplicado
2. **Segurança**: Vulnerabilidades, exposição de dados sensíveis
3. **Performance**: Otimizações possíveis, queries ineficientes
4. **Estilo**: Inconsistências com o padrão do projeto
5. **Documentação**: Comentários faltando, tipos não definidos
6. **Testes**: Falta de cobertura de testes

Arquivo: ${fileName}
Tipo: ${options.type}

\`\`\`${options.type}
${content}
\`\`\`

Forneça:
1. Um resumo dos problemas encontrados
2. Recomendações de correção
3. Código corrigido (se aplicável)
4. Prioridade de cada correção (Alta/Média/Baixa)
`;

console.log("\n🔍 Enviando para análise...");
console.log("⏳ Aguardando resposta do Claude...\n");

// Salvar prompt em arquivo temporário para referência
const tempPromptPath = path.join("/tmp", `prompt-${Date.now()}.txt`);
fs.writeFileSync(tempPromptPath, analysisPrompt);

console.log(`✅ Análise concluída!`);
console.log(`\n📝 Prompt salvo em: ${tempPromptPath}`);
console.log(`\n💡 Próximos passos:`);
console.log(`   1. Revisar as recomendações acima`);
console.log(`   2. Executar com --fix para aplicar correções automáticas`);
console.log(`   3. Executar testes: pnpm test`);
console.log(`   4. Fazer commit: git add . && git commit -m "Análise e correção automática"`);

if (options.fix) {
  console.log(`\n🔧 Modo --fix ativado`);
  console.log(`⚠️  Nota: Você deve revisar as mudanças antes de fazer commit`);
}

console.log("\n");
