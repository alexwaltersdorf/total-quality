# Guia de Deployment — Total Quality Medicina Diagnóstica

## Visão Geral

Este documento descreve como fazer deploy da aplicação Total Quality Medicina Diagnóstica na Hostinger após a migração do Manus para um servidor próprio.

## Arquitetura da Aplicação

A aplicação é uma stack moderna composta por:

| Componente | Tecnologia | Função |
|-----------|-----------|--------|
| Frontend | React 19 + Vite | Interface do usuário (SPA) |
| Backend | Express 4 + tRPC 11 | API e lógica de negócio |
| Banco de Dados | MySQL/TiDB | Persistência de dados |
| Autenticação | Manus OAuth | Gerenciamento de usuários |
| Armazenamento | AWS S3 (CloudFront) | Arquivos estáticos e mídia |

## Pré-requisitos para Deployment

Antes de fazer o deploy na Hostinger, certifique-se de ter:

1. **Acesso SSH** ao servidor Hostinger
2. **Node.js 22.13.0** ou superior instalado
3. **pnpm 10.4.1** ou superior instalado
4. **MySQL 8.0** ou superior (ou TiDB compatível)
5. **Domínio** `totalquality.med.br` apontando para o servidor Hostinger
6. **Certificado SSL** (HTTPS) configurado

## Passos de Deployment

### 1. Clonar o Repositório

```bash
cd /home/seu-usuario
git clone https://github.com/seu-usuario/total-quality.git
cd total-quality
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as variáveis necessárias. Veja `ENVIRONMENT_TEMPLATE.md` para a lista completa de variáveis.

```bash
cp ENVIRONMENT_TEMPLATE.md .env
# Edite o arquivo .env com as credenciais reais
nano .env
```

### 4. Preparar o Banco de Dados

Execute as migrações do Drizzle para criar as tabelas:

```bash
pnpm db:push
```

### 5. Build da Aplicação

```bash
pnpm build
```

Este comando irá:
- Compilar o frontend React com Vite
- Fazer bundle do backend Express com esbuild
- Gerar arquivos otimizados em `dist/`

### 6. Iniciar a Aplicação em Produção

```bash
NODE_ENV=production node dist/index.js
```

A aplicação estará disponível em `http://localhost:3000` (ou a porta configurada em `PORT`).

### 7. Configurar Reverse Proxy (Nginx)

Configure o Nginx para rotear o tráfego do domínio `totalquality.med.br` para a porta da aplicação:

```nginx
server {
    listen 80;
    server_name totalquality.med.br www.totalquality.med.br;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name totalquality.med.br www.totalquality.med.br;
    
    # Certificados SSL
    ssl_certificate /etc/ssl/certs/totalquality.med.br.crt;
    ssl_certificate_key /etc/ssl/private/totalquality.med.br.key;
    
    # Configurações de segurança SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Proxy para a aplicação Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Reinicie o Nginx:

```bash
sudo systemctl restart nginx
```

### 8. Configurar Process Manager (PM2)

Para manter a aplicação rodando continuamente, use PM2:

```bash
npm install -g pm2
pm2 start dist/index.js --name "total-quality" --env production
pm2 startup
pm2 save
```

## Variáveis de Ambiente Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão MySQL | `mysql://user:pass@localhost/totalquality` |
| `JWT_SECRET` | Chave para assinar JWT | `seu-secret-aleatorio-aqui` |
| `PORT` | Porta da aplicação | `3000` |
| `NODE_ENV` | Ambiente | `production` |
| `VITE_APP_ID` | ID da aplicação Manus OAuth | `app-id-aqui` |
| `OAUTH_SERVER_URL` | URL do servidor OAuth | `https://oauth.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | URL do portal de login | `https://login.manus.im` |
| `OWNER_OPEN_ID` | OpenID do proprietário | `owner-id-aqui` |
| `OWNER_NAME` | Nome do proprietário | `Total Quality` |
| `BUILT_IN_FORGE_API_URL` | URL da API Manus | `https://api.manus.im` |
| `BUILT_IN_FORGE_API_KEY` | Chave da API Manus | `api-key-aqui` |
| `VITE_FRONTEND_FORGE_API_KEY` | Chave da API para frontend | `frontend-key-aqui` |
| `VITE_FRONTEND_FORGE_API_URL` | URL da API para frontend | `https://api.manus.im` |

## Monitoramento e Logs

### Logs da Aplicação

Os logs estão disponíveis em `.manus-logs/`:

```bash
tail -f .manus-logs/devserver.log
tail -f .manus-logs/browserConsole.log
tail -f .manus-logs/networkRequests.log
```

### Verificar Status do PM2

```bash
pm2 status
pm2 logs total-quality
```

## Backup e Recuperação

### Backup do Banco de Dados

```bash
mysqldump -u usuario -p totalquality > backup-$(date +%Y%m%d).sql
```

### Restaurar Banco de Dados

```bash
mysql -u usuario -p totalquality < backup-20260430.sql
```

## Troubleshooting

### Erro: "Cannot proceed with the frozen installation"

Execute:

```bash
pnpm install --no-frozen-lockfile
```

### Erro: "Port 3000 already in use"

Altere a porta em `.env`:

```bash
PORT=3001
```

### Erro: "Connection refused" (Banco de dados)

Verifique se o MySQL está rodando:

```bash
sudo systemctl status mysql
sudo systemctl start mysql
```

## Atualizações Futuras

Para atualizar o site com novas mudanças:

```bash
git pull origin main
pnpm install
pnpm db:push
pnpm build
pm2 restart total-quality
```

## Contato e Suporte

Para dúvidas sobre o deployment, consulte a documentação no GitHub ou entre em contato com o time de desenvolvimento.
