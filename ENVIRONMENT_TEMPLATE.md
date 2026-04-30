# Variáveis de Ambiente — Total Quality Medicina Diagnóstica

Este documento descreve todas as variáveis de ambiente necessárias para executar a aplicação Total Quality. **Nunca faça commit do arquivo `.env` com valores reais no repositório.**

## Como Usar Este Template

1. Copie este arquivo para `.env` na raiz do projeto:
   ```bash
   cp ENVIRONMENT_TEMPLATE.md .env
   ```

2. Edite o arquivo `.env` com os valores reais das suas credenciais

3. O arquivo `.env` está no `.gitignore` e não será sincronizado com o Git

## Variáveis de Ambiente

### Banco de Dados

```env
# Conexão com o banco de dados MySQL
# Formato: mysql://usuario:senha@host:porta/banco_dados
DATABASE_URL=mysql://usuario:senha@localhost:3306/totalquality
```

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão MySQL completa | `mysql://root:senha123@localhost:3306/totalquality` |

### Autenticação e Segurança

```env
# Chave secreta para assinar JWT e cookies
# Gere com: openssl rand -base64 32
JWT_SECRET=seu-secret-aleatorio-muito-longo-aqui

# Ambiente de execução
NODE_ENV=production

# Porta da aplicação
PORT=3000
```

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `JWT_SECRET` | Chave para assinar tokens JWT | `abc123xyz789...` (mínimo 32 caracteres) |
| `NODE_ENV` | Ambiente (development, production) | `production` |
| `PORT` | Porta onde a aplicação roda | `3000` |

### Manus OAuth (Autenticação)

```env
# ID da aplicação registrada no Manus
VITE_APP_ID=seu-app-id-aqui

# URL do servidor OAuth Manus
OAUTH_SERVER_URL=https://oauth.manus.im

# URL do portal de login Manus (frontend)
VITE_OAUTH_PORTAL_URL=https://login.manus.im
```

| Variável | Descrição | Obtenha em |
|----------|-----------|-----------|
| `VITE_APP_ID` | ID único da aplicação no Manus | Painel Manus → Configurações → OAuth |
| `OAUTH_SERVER_URL` | Endpoint do servidor OAuth | Documentação Manus |
| `VITE_OAUTH_PORTAL_URL` | URL do portal de login | Documentação Manus |

### Informações do Proprietário

```env
# OpenID único do proprietário no Manus
OWNER_OPEN_ID=seu-owner-id-aqui

# Nome do proprietário/empresa
OWNER_NAME=Total Quality Medicina Diagnóstica
```

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `OWNER_OPEN_ID` | ID único do proprietário | `owner-123456789` |
| `OWNER_NAME` | Nome da empresa/clínica | `Total Quality Medicina Diagnóstica` |

### Manus Built-in APIs (LLM, Storage, Notifications)

```env
# URL base da API Manus (backend)
BUILT_IN_FORGE_API_URL=https://api.manus.im

# Chave de API para backend (server-side)
BUILT_IN_FORGE_API_KEY=sua-api-key-backend-aqui

# Chave de API para frontend (client-side)
VITE_FRONTEND_FORGE_API_KEY=sua-api-key-frontend-aqui

# URL da API para frontend
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

| Variável | Descrição | Uso |
|----------|-----------|-----|
| `BUILT_IN_FORGE_API_URL` | Endpoint da API Manus | Backend (server-side) |
| `BUILT_IN_FORGE_API_KEY` | Chave de autenticação backend | Chamadas LLM, Storage, Notifications |
| `VITE_FRONTEND_FORGE_API_KEY` | Chave de autenticação frontend | Chamadas de API do navegador |
| `VITE_FRONTEND_FORGE_API_URL` | URL da API para frontend | Requisições CORS do navegador |

### Credenciais de Admin (Opcional)

```env
# Email do admin padrão
ADMIN_EMAIL=admin@totalquality.med.br

# Senha do admin padrão (hash bcrypt)
ADMIN_PASSWORD=seu-hash-bcrypt-aqui
```

| Variável | Descrição | Nota |
|----------|-----------|------|
| `ADMIN_EMAIL` | Email de login do admin | Usado apenas na primeira inicialização |
| `ADMIN_PASSWORD` | Senha do admin (hash bcrypt) | Gere com: `bcrypt('sua-senha')` |

### Analytics (Opcional)

```env
# Endpoint de analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im

# ID do website para analytics
VITE_ANALYTICS_WEBSITE_ID=seu-website-id-aqui
```

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_ANALYTICS_ENDPOINT` | URL do serviço de analytics | `https://analytics.manus.im` |
| `VITE_ANALYTICS_WEBSITE_ID` | ID único do website | `totalquality-med-br-123` |

### Título e Logo da Aplicação

```env
# Título exibido na aba do navegador e meta tags
VITE_APP_TITLE=Total Quality Medicina Diagnóstica

# URL do logo da aplicação
VITE_APP_LOGO=https://cdn.example.com/logo.png
```

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_APP_TITLE` | Título da aplicação | `Total Quality Medicina Diagnóstica` |
| `VITE_APP_LOGO` | URL do logo | `https://cdn.example.com/logo.png` |

## Exemplo Completo de `.env`

```env
# ===== BANCO DE DADOS =====
DATABASE_URL=mysql://totalquality_user:senha_super_segura_123@localhost:3306/totalquality_db

# ===== AUTENTICAÇÃO E SEGURANÇA =====
JWT_SECRET=abcdefghijklmnopqrstuvwxyz1234567890ABCD
NODE_ENV=production
PORT=3000

# ===== MANUS OAUTH =====
VITE_APP_ID=app-totalquality-prod-123
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im

# ===== PROPRIETÁRIO =====
OWNER_OPEN_ID=owner-totalquality-123456
OWNER_NAME=Total Quality Medicina Diagnóstica

# ===== MANUS APIs =====
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=forge-key-backend-xyz789
VITE_FRONTEND_FORGE_API_KEY=forge-key-frontend-abc123
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# ===== ADMIN (OPCIONAL) =====
ADMIN_EMAIL=admin@totalquality.med.br
ADMIN_PASSWORD=$2b$10$...hash-bcrypt...

# ===== ANALYTICS (OPCIONAL) =====
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=totalquality-med-br-001

# ===== APLICAÇÃO =====
VITE_APP_TITLE=Total Quality Medicina Diagnóstica
VITE_APP_LOGO=https://cdn.totalquality.med.br/logo.png
```

## Geração de Valores

### Gerar JWT_SECRET

```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Gerar Hash Bcrypt (ADMIN_PASSWORD)

```bash
# Node.js
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('sua-senha', 10))"

# Ou use uma ferramenta online: https://bcrypt-generator.com/
```

## Validação de Variáveis

Antes de fazer deploy, verifique se todas as variáveis obrigatórias estão configuradas:

```bash
# Verificar se .env existe
test -f .env && echo ".env encontrado" || echo "ERRO: .env não encontrado"

# Verificar variáveis obrigatórias
grep -E "^(DATABASE_URL|JWT_SECRET|VITE_APP_ID|OAUTH_SERVER_URL)" .env
```

## Segurança

- **Nunca compartilhe** valores de `.env` por email ou mensagens
- **Nunca faça commit** do arquivo `.env` no Git
- **Rotacione regularmente** as chaves de API e JWT_SECRET
- **Use diferentes valores** para desenvolvimento e produção
- **Proteja o arquivo** `.env` com permissões de arquivo restritivas:
  ```bash
  chmod 600 .env
  ```

## Suporte

Se tiver dúvidas sobre como obter as credenciais, consulte:

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Guia de deployment
- [README.md](./README.md) — Visão geral do projeto
- Documentação oficial do Manus: https://docs.manus.im

---

**Importante:** Este é um template. Sempre use valores reais e seguros em produção.
