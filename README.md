# Total Quality Medicina Diagnóstica

Laboratório de análises clínicas e medicina diagnóstica em Caraguatatuba-SP, oferecendo mais de 3.000 tipos de exames com equipamentos de última geração.

**Website:** [totalquality.med.br](https://www.totalquality.med.br)

## Visão Geral do Projeto

Total Quality é uma aplicação web moderna desenvolvida com React 19, Express 4 e tRPC 11, integrada com autenticação Manus OAuth e banco de dados MySQL. O site oferece informações sobre exames, agendamento online, blog educativo e painéis administrativos para gerenciar conteúdo e pacientes.

### Funcionalidades Principais

- **Catálogo de Exames:** Mais de 3.000 tipos de exames laboratoriais, diagnósticos por imagem e cardiológicos
- **Agendamento Online:** Sistema de agendamento integrado com WhatsApp
- **Blog Educativo:** Artigos sobre saúde, prevenção e bem-estar
- **Painel de Admin:** Gerenciamento de conteúdo, usuários e agendamentos
- **Dashboard:** Visualização de métricas e relatórios
- **SEO Otimizado:** Schema Markup, sitemap.xml, robots.txt e meta tags otimizadas

## Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React | 19 |
| Build Tool | Vite | 6 |
| Styling | Tailwind CSS | 4 |
| Backend | Express | 4 |
| RPC Framework | tRPC | 11 |
| Banco de Dados | MySQL/TiDB | 8.0+ |
| ORM | Drizzle | 0.44.5 |
| Autenticação | Manus OAuth | - |
| Armazenamento | AWS S3 | - |
| Testing | Vitest | - |

## Estrutura do Projeto

```
total-quality/
├── client/                    # Frontend React + Vite
│   ├── src/
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── lib/              # Funções utilitárias
│   │   └── App.tsx           # Roteamento principal
│   ├── public/               # Arquivos estáticos (favicon, robots.txt, sitemap.xml)
│   └── index.html            # HTML principal
├── server/                    # Backend Express + tRPC
│   ├── routers.ts            # Definição de procedures tRPC
│   ├── db.ts                 # Query helpers
│   ├── storage.ts            # Integração com S3
│   └── _core/                # Infraestrutura (OAuth, contexto, LLM, etc.)
├── drizzle/                   # Schema e migrações do banco de dados
├── shared/                    # Tipos e constantes compartilhadas
├── DEPLOYMENT.md             # Guia de deployment na Hostinger
├── ENVIRONMENT_TEMPLATE.md   # Template de variáveis de ambiente
├── ADMIN_GUIDE.md            # Guia de uso dos painéis de admin
└── package.json              # Dependências do projeto

```

## Começando

### Pré-requisitos

- Node.js 22.13.0 ou superior
- pnpm 10.4.1 ou superior
- MySQL 8.0 ou superior

### Instalação Local

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/total-quality.git
cd total-quality

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp ENVIRONMENT_TEMPLATE.md .env
# Editar .env com as credenciais reais

# Preparar banco de dados
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Desenvolvimento

### Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia o servidor de desenvolvimento |
| `pnpm build` | Compila frontend e backend para produção |
| `pnpm test` | Executa testes com Vitest |
| `pnpm format` | Formata código com Prettier |
| `pnpm db:push` | Sincroniza schema do banco de dados |

### Fluxo de Desenvolvimento

1. **Atualizar schema:** Edite `drizzle/schema.ts`
2. **Sincronizar banco:** Execute `pnpm db:push`
3. **Adicionar query helpers:** Implemente em `server/db.ts`
4. **Criar procedures tRPC:** Defina em `server/routers.ts`
5. **Implementar UI:** Crie componentes em `client/src/pages/` ou `client/src/components/`
6. **Testar:** Escreva testes em `server/*.test.ts`
7. **Fazer commit:** Sincronize com `git push`

## Deployment

Para fazer deploy na Hostinger, consulte o guia completo em [DEPLOYMENT.md](./DEPLOYMENT.md).

### Resumo Rápido

```bash
# 1. SSH no servidor Hostinger
ssh usuario@seu-servidor.com

# 2. Clonar repositório
git clone https://github.com/seu-usuario/total-quality.git
cd total-quality

# 3. Instalar e configurar
pnpm install
cp ENVIRONMENT_TEMPLATE.md .env
# Editar .env com credenciais

# 4. Build e deploy
pnpm db:push
pnpm build
pm2 start dist/index.js --name "total-quality"
```

## Acessar Painéis de Admin e Dashboard

### Admin Panel

**URL:** `https://www.totalquality.med.br/admin`

O painel de admin permite gerenciar:
- Conteúdo do site (exames, blog, seções)
- Usuários e permissões
- Agendamentos
- Relatórios

Consulte [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) para instruções detalhadas.

### Dashboard

**URL:** `https://www.totalquality.med.br/dashboard`

O dashboard exibe:
- Métricas de tráfego
- Agendamentos recentes
- Estatísticas de exames
- Relatórios de desempenho

## Variáveis de Ambiente

As variáveis de ambiente são armazenadas em `.env` (não sincronizado com Git). Consulte [ENVIRONMENT_TEMPLATE.md](./ENVIRONMENT_TEMPLATE.md) para a lista completa de variáveis necessárias.

**Importante:** Nunca faça commit de `.env` ou credenciais no repositório.

## Banco de Dados

O projeto usa MySQL com Drizzle ORM para gerenciar o schema e migrações.

### Estrutura de Tabelas

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários do sistema |
| `exames` | Catálogo de exames |
| `agendamentos` | Agendamentos de pacientes |
| `blog_posts` | Artigos do blog |
| `sessions` | Sessões de autenticação |

### Migrações

```bash
# Aplicar migrações
pnpm db:push

# Gerar migration
pnpm drizzle-kit generate
```

## SEO e Otimizações

O site inclui otimizações completas para SEO:

- **Schema Markup:** LocalBusiness, MedicalClinic, FAQPage, BlogPosting
- **Meta Tags:** Titles e descriptions otimizados para cada página
- **Sitemap:** `public/sitemap.xml` com 24 URLs
- **Robots.txt:** `public/robots.txt` com regras de crawling
- **Canonical URLs:** Implementadas em todas as páginas
- **Breadcrumbs:** Estruturados com JSON-LD

## Testes

Execute os testes com:

```bash
pnpm test
```

Os testes cobrem:
- Autenticação e logout
- Procedures tRPC
- Query helpers
- Validação de dados

## Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feature/sua-feature`
2. Faça commit das mudanças: `git commit -m "feat: descrição da feature"`
3. Faça push para a branch: `git push origin feature/sua-feature`
4. Abra um Pull Request

## Segurança

- Todas as credenciais são armazenadas em variáveis de ambiente
- Senhas nunca são commitadas no repositório
- OAuth é usado para autenticação de usuários
- HTTPS é obrigatório em produção
- SQL Injection é prevenido com Drizzle ORM

## Suporte

Para dúvidas ou problemas, consulte:

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Guia de deployment
- [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) — Guia de uso dos painéis
- [ENVIRONMENT_TEMPLATE.md](./ENVIRONMENT_TEMPLATE.md) — Variáveis de ambiente

## Licença

Propriedade de Total Quality Medicina Diagnóstica. Todos os direitos reservados.

---

**Última atualização:** Abril de 2026  
**Mantido por:** Manus AI
