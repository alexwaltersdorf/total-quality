# 📋 Padrões de SEO - Total Quality Medicina Diagnóstica

**Última atualização:** 16 de Julho de 2026

---

## 🎯 Objetivo

Este documento estabelece os **padrões obrigatórios de SEO** para todas as alterações no site Total Quality. Qualquer nova página, rota ou conteúdo DEVE seguir estas diretrizes.

**Responsabilidade:** Consulte este documento ANTES de criar/modificar qualquer página que impacte SEO.

---

## ⚠️ Problema Crítico Resolvido

**Situação anterior (ERRADA):**
```
GET /checkup → HTML com canonical: https://totalquality.med.br/
GET /exames/mamografia → HTML com canonical: https://totalquality.med.br/
GET /blog/hemograma → HTML com canonical: https://totalquality.med.br/
```
**Resultado:** Google via todas como duplicatas da home → 13% indexação

**Situação atual (CORRETA):**
```
GET /checkup → HTML com canonical: https://totalquality.med.br/checkup
GET /exames/mamografia → HTML com canonical: https://totalquality.med.br/exames/mamografia
GET /blog/hemograma → HTML com canonical: https://totalquality.med.br/blog/hemograma
```
**Resultado:** Google indexa cada página como entidade única → 100% indexação esperada

---

## 📁 Arquitetura de SEO

### Arquivos Críticos (NÃO EDITAR SEM CONSULTAR ESTE MD)

| Arquivo | Responsabilidade | Quando Editar |
|---------|------------------|---------------|
| `server/_core/routes-metadata.ts` | Mapeamento de meta tags por rota | Ao adicionar nova página/rota |
| `server/_core/vite.ts` | Injeção de meta tags no HTML | Ao mudar lógica de SSR |
| `server/_core/sitemap-handler.ts` | Geração de sitemap.xml | Ao adicionar/remover rotas |
| `server/_core/index.ts` | Rotas `/sitemap.xml` e `/robots.txt` | Ao bloquear novas seções |

### Fluxo de Meta Tags

```
1. Requisição chega em Express (server/_core/index.ts)
   ↓
2. Vite middleware (server/_core/vite.ts) intercepta
   ↓
3. Busca meta tags em routes-metadata.ts baseado na rota
   ↓
4. Injeta meta tags no HTML antes de enviar ao cliente
   ↓
5. Cliente recebe HTML com meta tags corretos
```

---

## 🔧 Como Adicionar Nova Página

### Passo 1: Registre a Rota em `routes-metadata.ts`

**Localização:** `/home/ubuntu/total-quality/server/_core/routes-metadata.ts`

**Estrutura de Meta Tags:**

```typescript
"sua-nova-rota": {
  title: "Seu Título | Total Quality",           // 30-60 caracteres
  description: "Sua descrição breve",            // 120-160 caracteres
  keywords: "palavra-chave1, palavra-chave2",    // Separadas por vírgula
  ogTitle: "Título para Open Graph",             // Pode ser diferente do title
  ogDescription: "Descrição para redes sociais", // Pode ser diferente
  ogImage: "https://cdn.../imagem.png",          // URL da imagem (1200x630px)
  canonical: "https://totalquality.med.br/sua-nova-rota",
  priority: 0.8,                                 // 0.6-1.0
  changefreq: "monthly",                         // weekly/monthly/yearly
}
```

**Exemplo Real - Página de Exame:**

```typescript
"exames/novo-exame": {
  title: "Novo Exame em Caraguatatuba | Total Quality",
  description: "Descubra tudo sobre o novo exame oferecido pela Total Quality em Caraguatatuba.",
  keywords: "novo exame, diagnóstico, Caraguatatuba",
  ogTitle: "Novo Exame | Total Quality",
  ogDescription: "Saiba mais sobre nosso novo exame.",
  ogImage: "https://d2xsxph8kpxj0f.cloudfront.net/.../novo-exame.png",
  canonical: "https://totalquality.med.br/exames/novo-exame",
  priority: 0.9,
  changefreq: "monthly",
}
```

### Passo 2: Crie a Página React

**Localização:** `/home/ubuntu/total-quality/client/src/pages/`

**Template Obrigatório:**

```tsx
import { useEffect } from "react";
import { useCanonical, useMetaDescription } from "@/components/SEOHead";

export default function SuaNovaPage() {
  useEffect(() => {
    // Título que aparece na aba do navegador
    document.title = "Seu Título | Total Quality";
    window.scrollTo(0, 0);
  }, []);

  // Meta description - OBRIGATÓRIO
  useMetaDescription("Sua descrição breve para SEO");

  // Canonical URL - OBRIGATÓRIO
  useCanonical("/sua-nova-rota");

  return (
    <div className="min-h-screen bg-white">
      {/* Seu conteúdo aqui */}
    </div>
  );
}
```

### Passo 3: Registre a Rota em `App.tsx`

**Localização:** `/home/ubuntu/total-quality/client/src/App.tsx`

```tsx
import SuaNovaPage from "@/pages/SuaNovaPage";

export default function App() {
  return (
    <Router>
      <Route path="/sua-nova-rota" component={SuaNovaPage} />
      {/* outras rotas */}
    </Router>
  );
}
```

### Passo 4: Valide a Implementação

**Teste com curl:**

```bash
curl -s http://localhost:3000/sua-nova-rota | grep "<title>"
curl -s http://localhost:3000/sua-nova-rota | grep 'rel="canonical"'
curl -s http://localhost:3000/sua-nova-rota | grep 'name="description"'
curl -s http://localhost:3000/sua-nova-rota | grep 'property="og:url"'
```

**Resultado esperado:**

```html
<title>Seu Título | Total Quality</title>
<link rel="canonical" href="https://totalquality.med.br/sua-nova-rota">
<meta name="description" content="Sua descrição breve para SEO">
<meta property="og:url" content="https://totalquality.med.br/sua-nova-rota">
```

---

## 📝 Checklist de SEO para Novas Páginas

**ANTES de fazer commit/publicar, valide:**

- [ ] Meta tags adicionados em `routes-metadata.ts`
- [ ] Title único (30-60 caracteres)
- [ ] Description único (120-160 caracteres)
- [ ] Canonical URL correto (não apontando para home)
- [ ] og:url correto
- [ ] og:image fornecido (1200x630px)
- [ ] Rota registrada em `App.tsx`
- [ ] Página React criada com `useCanonical()` e `useMetaDescription()`
- [ ] Testado com curl - title, canonical, description, og:url corretos
- [ ] Sitemap.xml atualizado automaticamente (verificar com `curl http://localhost:3000/sitemap.xml`)

---

## 🎨 Boas Práticas de Meta Tags

### Title Tags

**✅ Bom:**
- "Check-up Preventivo em Caraguatatuba | Planos e Preços | Total Quality"
- "Mamografia Digital em Caraguatatuba | Total Quality"
- "Hemograma em Caraguatatuba: Como Agendar, Preparo e Resultados"

**❌ Ruim:**
- "Home" (genérico)
- "Página 1" (sem contexto)
- "Total Quality" (sem diferenciação)
- Muito longo (>60 caracteres)

### Meta Descriptions

**✅ Bom:**
- "Check-up preventivo em Caraguatatuba: planos básico, select e premium. Exames completos com resultados rápidos. Agende agora."
- "Mamografia digital em Caraguatatuba - SP. Diagnóstico de câncer de mama. Tecnologia de última geração. Agende seu exame."

**❌ Ruim:**
- "Clique aqui para saber mais" (genérico)
- Muito curto (<120 caracteres)
- Muito longo (>160 caracteres)
- Duplicado de outra página

### Keywords

**✅ Bom:**
- "check-up, check-up preventivo, exames preventivos, Caraguatatuba"
- "mamografia, mamografia digital, diagnóstico de mama, Caraguatatuba"

**❌ Ruim:**
- Sem keywords
- Keywords não relacionadas ao conteúdo
- Keyword stuffing (repetir palavra 10x)

---

## 🔍 Estrutura de Rotas Atual

### Rotas Estáticas (6)

| Rota | Title | Priority |
|------|-------|----------|
| `/` | Laboratório em Caraguatatuba | 1.0 |
| `/checkup` | Check-up Preventivo em Caraguatatuba | 0.9 |
| `/bioimpedancia` | Bioimpedância - Análise de Composição Corporal | 0.8 |
| `/blog` | Blog Total Quality | 0.8 |
| `/cartao` | Cartão Total Quality Care | 0.8 |
| `/laboratorio-caraguatatuba` | Laboratório em Caraguatatuba | 0.8 |

### Rotas de Exames (11)

Padrão: `/exames/{slug}`

| Exame | Slug | Priority |
|-------|------|----------|
| Exames de Sangue | `exames-de-sangue` | 0.9 |
| Tomografia | `tomografia-computadorizada` | 0.9 |
| Raio-X | `raio-x` | 0.9 |
| Ultrassom | `ultrassom` | 0.9 |
| Mamografia | `mamografia` | 0.9 |
| Ecocardiograma | `ecocardiograma` | 0.9 |
| Eletrocardiograma | `eletrocardiograma` | 0.9 |
| Bioimpedância | `bioimpedancia` | 0.9 |
| Densitometria Óssea | `densitometria-ossea` | 0.9 |
| Teste de Esforço | `teste-esforco` | 0.9 |
| Holter 24h | `holter-24h` | 0.9 |

### Rotas de Blog (11)

Padrão: `/blog/{slug}`

| Artigo | Slug | Priority |
|--------|------|----------|
| Check-up Preventivo | `check-up-preventivo-quando-fazer` | 0.7 |
| Exames de Sangue | `exames-de-sangue-guia-completo` | 0.7 |
| Saúde do Coração | `saude-do-coracao-prevencao` | 0.7 |
| Alimentação | `alimentacao-e-exames-laboratoriais` | 0.7 |
| Vitamina D | `vitamina-d-importancia-saude` | 0.7 |
| Exame de Sangue Caraguatatuba | `exame-de-sangue-caraguatatuba` | 0.8 |
| Convênios | `convenios-laboratorio-caraguatatuba` | 0.7 |
| Hemograma | `hemograma-caraguatatuba` | 0.8 |
| Ultrassonografia | `ultrassonografia-caraguatatuba` | 0.7 |
| Tomografia | `tomografia-caraguatatuba` | 0.7 |
| Convênios (alt) | `convênios-laboratório-caraguatatuba` | 0.6 |

---

## 🚀 Validação Automática

### Verificar Sitemap

```bash
curl -s http://localhost:3000/sitemap.xml | grep "<loc>" | wc -l
# Deve retornar: 29 (ou mais se adicionou rotas)
```

### Verificar Robots.txt

```bash
curl -s http://localhost:3000/robots.txt
# Deve bloquear: /admin, /api, /dashboard
```

### Verificar Meta Tags de Uma Rota

```bash
curl -s http://localhost:3000/sua-rota | grep -E "<title>|canonical|og:url|name=\"description\""
```

---

## 📊 Monitoramento no Google Search Console

**Após publicar, monitore:**

1. **Indexação → Páginas**
   - Procure por "Duplicada, o Google escolheu um canônico diferente"
   - Deve estar VAZIO agora (antes tinha 13 URLs)

2. **Cobertura**
   - Deve mostrar "Válida" para todas as 29+ URLs
   - Antes: 13% HTML, 77% "outro tipo de arquivo"
   - Agora: 100% HTML

3. **Melhorias**
   - Monitore "Mobile Usability"
   - Monitore "Experiência na Página"

---

## 🔐 Regras Obrigatórias

**NUNCA:**
- ❌ Adicione rota sem registrar em `routes-metadata.ts`
- ❌ Crie página sem `useCanonical()` e `useMetaDescription()`
- ❌ Use canonical apontando para home (exceto na home)
- ❌ Duplique meta tags de outra página
- ❌ Deixe og:image vazio
- ❌ Crie rota sem testar com curl

**SEMPRE:**
- ✅ Consulte este documento ANTES de criar/modificar página
- ✅ Valide com curl ANTES de fazer commit
- ✅ Teste sitemap.xml ANTES de publicar
- ✅ Atualize todo.md com novo item
- ✅ Faça checkpoint ANTES de publicar

---

## 📞 Suporte

**Dúvidas sobre SEO?**
1. Consulte este documento
2. Verifique exemplo em `routes-metadata.ts`
3. Teste com curl
4. Valide no sitemap.xml

**Problema de indexação?**
1. Verifique canonical URLs em `routes-metadata.ts`
2. Verifique se rota está em `App.tsx`
3. Verifique se página usa `useCanonical()` e `useMetaDescription()`
4. Teste com curl
5. Resubmeta sitemap.xml ao GSC

---

**Versão:** 1.0  
**Criado:** 16 de Julho de 2026  
**Próxima revisão:** Quando adicionar nova categoria de páginas
