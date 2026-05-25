# Configuração do Giscus - Sistema de Comentários

## O que é Giscus?

Giscus é um sistema de comentários baseado em **GitHub Discussions**. Os comentários são armazenados como discussions no seu repositório GitHub, permitindo engajamento direto com os leitores.

## Passos para Configurar

### 1. Criar o Repositório GitHub

Você já solicitou a criação do repositório `total-quality-blog` no GitHub. Se ainda não foi criado:

```bash
# Autentique no GitHub
gh auth login

# Crie o repositório
gh repo create total-quality-blog --public --source=/home/ubuntu/total-quality --remote=origin --push
```

### 2. Habilitar GitHub Discussions

1. Acesse seu repositório: `https://github.com/totalqualitymedicina/total-quality-blog`
2. Clique em **Settings** (Configurações)
3. Role até **Features** (Recursos)
4. Marque a caixa **Discussions** para habilitar
5. Clique em **Save**

### 3. Criar Categoria de Discussions

1. Vá para a aba **Discussions** no seu repositório
2. Clique em **New discussion**
3. Crie uma categoria chamada **"Blog Artigos"**
4. Copie o **Category ID** (aparecerá na URL)

### 4. Configurar Giscus

1. Acesse [giscus.app](https://giscus.app)
2. Preencha os campos:
   - **Repository**: `totalqualitymedicina/total-quality-blog`
   - **Repository ID**: (será preenchido automaticamente)
   - **Category**: `Blog Artigos`
   - **Category ID**: (copie da URL)
   - **Page ↔️ Discussion Mapping**: Selecione `Specific term`
   - **Discussion title contains**: Deixe em branco
   - **Theme**: `Light`
   - **Language**: `Portuguese (Brazil)`

3. Copie o código gerado (será um `<script>`)

### 5. Atualizar o Componente GiscusComments.tsx

No arquivo `/home/ubuntu/total-quality/client/src/components/GiscusComments.tsx`, atualize:

```typescript
script.setAttribute("data-repo", "totalqualitymedicina/total-quality-blog");
script.setAttribute("data-repo-id", "SEU_REPO_ID_AQUI"); // Copie do giscus.app
script.setAttribute("data-category", "Blog Artigos");
script.setAttribute("data-category-id", "SEU_CATEGORY_ID_AQUI"); // Copie do giscus.app
```

### 6. Testar

1. Acesse qualquer página de artigo no seu site
2. Role até a seção "DEIXE SEU COMENTÁRIO"
3. Clique em "Sign in with GitHub" para comentar
4. Seu comentário aparecerá como uma Discussion no repositório

## Benefícios

✅ **Comentários armazenados no GitHub** - Backup automático  
✅ **Moderação integrada** - Use as ferramentas do GitHub  
✅ **Sem banco de dados extra** - Tudo via GitHub  
✅ **Engajamento direto** - Leitores podem discutir no GitHub  
✅ **Gratuito** - Sem custos adicionais  

## Suporte

Para mais informações, visite: [giscus.app](https://giscus.app)
