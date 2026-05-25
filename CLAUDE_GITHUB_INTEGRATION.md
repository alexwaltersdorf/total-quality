# Integração Claude + GitHub para Análise e Correção Automática

## Visão Geral

Esta documentação descreve como usar Claude (via Manus) para analisar, revisar e corrigir automaticamente arquivos do repositório GitHub.

## Configuração

### 1. Repositório GitHub Conectado ✅

- **URL**: https://github.com/alexwaltersdorf/total-quality
- **Status**: Sincronizado e autenticado
- **Token**: Configurado com permissões de leitura/escrita

### 2. Fluxo de Trabalho

```
┌─────────────────────────────────────────────────────────────┐
│                  Fluxo de Análise e Correção                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Você identifica arquivo para análise                   │
│     ↓                                                       │
│  2. Execute: node scripts/analyze-and-fix.mjs --file <path>│
│     ↓                                                       │
│  3. Claude analisa o arquivo                               │
│     ↓                                                       │
│  4. Recebe recomendações de correção                       │
│     ↓                                                       │
│  5. Aplica correções com --fix (opcional)                  │
│     ↓                                                       │
│  6. Revisa mudanças: git diff                              │
│     ↓                                                       │
│  7. Faz commit e push: git push user_github main           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Uso

### Analisar um Arquivo

```bash
# Análise básica (detecta tipo automaticamente)
node scripts/analyze-and-fix.mjs --file server/routers.ts

# Análise com tipo específico
node scripts/analyze-and-fix.mjs --file client/src/pages/Home.tsx --type react

# Análise com correção automática
node scripts/analyze-and-fix.mjs --file drizzle/schema.ts --type database --fix
```

### Exemplos de Análise

#### 1. Arquivo TypeScript
```bash
node scripts/analyze-and-fix.mjs --file server/db.ts --type typescript --fix
```

**Claude irá verificar:**
- ✅ Tipos TypeScript corretos
- ✅ Funções sem documentação
- ✅ Imports não utilizados
- ✅ Tratamento de erros
- ✅ Performance de queries

#### 2. Arquivo React
```bash
node scripts/analyze-and-fix.mjs --file client/src/pages/CartaoPage.tsx --type react --fix
```

**Claude irá verificar:**
- ✅ Hooks corretamente utilizados
- ✅ Re-renders desnecessários
- ✅ Acessibilidade (a11y)
- ✅ Performance (useMemo, useCallback)
- ✅ Padrões de erro

#### 3. Schema de Banco de Dados
```bash
node scripts/analyze-and-fix.mjs --file drizzle/schema.ts --type database --fix
```

**Claude irá verificar:**
- ✅ Índices apropriados
- ✅ Constraints de integridade
- ✅ Tipos de dados corretos
- ✅ Relacionamentos entre tabelas
- ✅ Performance de queries

## Tipos de Análise Suportados

| Tipo | Extensões | Verificações |
|------|-----------|-------------|
| `typescript` | `.ts` | Tipos, imports, funções, erros |
| `react` | `.tsx`, `.jsx` | Hooks, performance, a11y, padrões |
| `javascript` | `.js` | Sintaxe, performance, segurança |
| `database` | `.ts` (schema) | Índices, constraints, performance |
| `sql` | `.sql` | Sintaxe, performance, segurança |
| `markdown` | `.md` | Formatação, links, estrutura |
| `json` | `.json` | Validação, formatação |
| `css` | `.css` | Especificidade, performance |

## Prioridades de Correção

### 🔴 Alta Prioridade
- Vulnerabilidades de segurança
- Bugs críticos
- Erros de tipo TypeScript
- Performance crítica

### 🟡 Média Prioridade
- Código duplicado
- Anti-patterns
- Documentação faltando
- Testes faltando

### 🟢 Baixa Prioridade
- Formatação
- Nomes de variáveis
- Comentários
- Estilo de código

## Workflow Recomendado

### 1. Análise Inicial (sem correção)
```bash
node scripts/analyze-and-fix.mjs --file server/routers.ts
```

### 2. Revisar Recomendações
Leia as sugestões de Claude e avalie se concorda com as correções.

### 3. Aplicar Correções
```bash
node scripts/analyze-and-fix.mjs --file server/routers.ts --fix
```

### 4. Revisar Mudanças
```bash
git diff server/routers.ts
```

### 5. Testar
```bash
pnpm test
pnpm build
```

### 6. Commit e Push
```bash
git add server/routers.ts
git commit -m "Análise e correção automática: server/routers.ts"
git push user_github main
```

## Análise em Batch

Para analisar múltiplos arquivos:

```bash
# Analisar todos os arquivos TypeScript
find server -name "*.ts" -type f | while read file; do
  node scripts/analyze-and-fix.mjs --file "$file"
done

# Analisar todos os arquivos React
find client/src -name "*.tsx" -type f | while read file; do
  node scripts/analyze-and-fix.mjs --file "$file" --type react
done
```

## Integração com CI/CD

Você pode adicionar análise automática ao seu pipeline CI/CD:

```yaml
# .github/workflows/analyze.yml
name: Análise e Correção Automática

on:
  pull_request:
    paths:
      - 'server/**'
      - 'client/src/**'
      - 'drizzle/**'

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: node scripts/analyze-and-fix.mjs --file ${{ github.event.pull_request.head.sha }}
```

## Limitações e Considerações

### ✅ O que Claude pode fazer
- Analisar código estático
- Identificar padrões e anti-patterns
- Sugerir melhorias de performance
- Revisar segurança
- Corrigir erros óbvios
- Adicionar documentação

### ⚠️ O que Claude NÃO pode fazer
- Testar código em tempo real
- Acessar banco de dados
- Executar queries
- Validar comportamento dinâmico
- Acessar APIs externas

## Boas Práticas

1. **Sempre revisar antes de aplicar correções**
   - Leia as recomendações do Claude
   - Entenda o porquê de cada mudança
   - Teste localmente antes de fazer push

2. **Use --fix com cuidado**
   - Comece com arquivos menores
   - Revise todas as mudanças com `git diff`
   - Faça backup antes de aplicar mudanças em massa

3. **Mantenha histórico de análises**
   - Salve prompts em arquivo
   - Documente decisões
   - Rastreie melhorias ao longo do tempo

4. **Combine com testes**
   - Execute `pnpm test` após correções
   - Valide comportamento esperado
   - Adicione testes para novos padrões

## Troubleshooting

### Erro: "Arquivo não encontrado"
```bash
# Verifique o caminho relativo
ls -la server/routers.ts

# Use caminho absoluto se necessário
node scripts/analyze-and-fix.mjs --file /home/ubuntu/total-quality/server/routers.ts
```

### Erro: "Tipo desconhecido"
```bash
# Especifique o tipo manualmente
node scripts/analyze-and-fix.mjs --file arquivo.custom --type typescript
```

### Mudanças não aplicadas com --fix
- Verifique permissões do arquivo
- Certifique-se de que o arquivo é editável
- Revise os logs de erro

## Próximos Passos

1. **Integrar com GitHub Actions** - Análise automática em PRs
2. **Criar dashboard de análise** - Histórico de correções
3. **Adicionar métricas** - Rastrear qualidade ao longo do tempo
4. **Integrar com linters** - ESLint, Prettier, TypeScript

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs: `cat /tmp/prompt-*.txt`
2. Revise o código do script: `cat scripts/analyze-and-fix.mjs`
3. Consulte a documentação do Claude
4. Abra uma issue no repositório GitHub
