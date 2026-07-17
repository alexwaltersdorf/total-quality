# ⚡ Guia Rápido de SEO - Total Quality

**Use este arquivo para referência rápida. Para detalhes completos, consulte `SEO_STANDARDS.md`**

---

## 🚀 Adicionar Nova Página em 4 Passos

### 1️⃣ Registre em `routes-metadata.ts`

```typescript
// server/_core/routes-metadata.ts
"sua-rota": {
  title: "Seu Título | Total Quality",
  description: "Descrição breve (120-160 chars)",
  keywords: "palavra-chave1, palavra-chave2",
  ogTitle: "Título para redes sociais",
  ogDescription: "Descrição para redes sociais",
  ogImage: "https://cdn.../imagem.png",
  canonical: "https://totalquality.med.br/sua-rota",
  priority: 0.8,
  changefreq: "monthly",
}
```

### 2️⃣ Crie a Página React

```tsx
// client/src/pages/SuaPage.tsx
import { useCanonical, useMetaDescription } from "@/components/SEOHead";

export default function SuaPage() {
  useEffect(() => {
    document.title = "Seu Título | Total Quality";
  }, []);

  useMetaDescription("Descrição breve");
  useCanonical("/sua-rota");

  return <div>Seu conteúdo</div>;
}
```

### 3️⃣ Registre em `App.tsx`

```tsx
import SuaPage from "@/pages/SuaPage";

<Route path="/sua-rota" component={SuaPage} />
```

### 4️⃣ Teste com Curl

```bash
curl -s http://localhost:3000/sua-rota | grep -E "<title>|canonical|og:url"
```

---

## ✅ Checklist Rápido

- [ ] Meta tags em `routes-metadata.ts`
- [ ] Página React com `useCanonical()` e `useMetaDescription()`
- [ ] Rota em `App.tsx`
- [ ] Testado com curl
- [ ] Sitemap.xml atualizado
- [ ] Checkpoint feito

---

## 🔍 Validações Rápidas

**Ver todas as rotas:**
```bash
curl -s http://localhost:3000/sitemap.xml | grep "<loc>"
```

**Ver meta tags de uma rota:**
```bash
curl -s http://localhost:3000/sua-rota | grep -E "<title>|canonical|description|og:url"
```

**Contar URLs no sitemap:**
```bash
curl -s http://localhost:3000/sitemap.xml | grep "<loc>" | wc -l
```

---

## ⚠️ Erros Comuns

| Erro | Solução |
|------|---------|
| Canonical apontando para home | Verifique `routes-metadata.ts` - canonical deve ser URL da página |
| Title duplicado em 2 páginas | Cada página precisa de title único |
| Sem og:image | Adicione URL de imagem em `ogImage` (1200x630px) |
| Página não aparece no sitemap | Verifique se está em `routes-metadata.ts` |
| Página não renderiza | Verifique se está em `App.tsx` |

---

## 📞 Quando Consultar `SEO_STANDARDS.md`

- ❓ Dúvida sobre estrutura de meta tags
- ❓ Qual é a prioridade correta?
- ❓ Como adicionar nova categoria de páginas?
- ❓ Problema de indexação no Google?
- ❓ Preciso adicionar schema JSON-LD?

---

**Última atualização:** 17 de Julho de 2026
