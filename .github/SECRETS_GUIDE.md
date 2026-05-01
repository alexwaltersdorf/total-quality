# Configuração dos secrets para o GitHub Action de deploy

Para o deploy automático funcionar, configure os 5 secrets abaixo em:
**Repo → Settings → Secrets and variables → Actions → New repository secret**

URL direta: https://github.com/alexwaltersdorf/total-quality/settings/secrets/actions

| Nome do secret      | Valor                                               | Como obter |
|---------------------|------------------------------------------------------|------------|
| `HOSTINGER_HOST`    | IP ou hostname do servidor Hostinger                 | Painel hPanel → Servidores → IP |
| `HOSTINGER_USER`    | Usuário SSH (ex: `root` ou `u123456`)               | Mesmo do hPanel SSH |
| `HOSTINGER_PORT`    | Porta SSH (geralmente `22` ou `65002`)              | hPanel → Avançado → Acesso SSH |
| `HOSTINGER_SSH_KEY` | Chave SSH PRIVADA (PEM, conteúdo completo)          | Veja abaixo  |
| `HOSTINGER_PATH`    | Caminho absoluto do repo no servidor (ex: `/home/u123456/total-quality`) | `pwd` no servidor |

## Como gerar a SSH key

No seu terminal local (PowerShell):

```powershell
ssh-keygen -t ed25519 -C "github-deploy@total-quality" -f $env:USERPROFILE\.ssh\hostinger_deploy
```

Aperta Enter quando pedir senha (deixa vazio para o GitHub Action conseguir usar).

Isso gera dois arquivos:
- `hostinger_deploy` → chave PRIVADA (vai no secret `HOSTINGER_SSH_KEY`)
- `hostinger_deploy.pub` → chave PÚBLICA (vai no servidor)

### Adicionar a pública no servidor Hostinger

Conecta via SSH no servidor com sua autenticação atual e roda:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "<conteudo-do-arquivo-hostinger_deploy.pub>" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Colocar a privada no GitHub

1. Abre o arquivo `hostinger_deploy` (a chave privada) no editor
2. Copia TODO o conteúdo, incluindo as linhas `-----BEGIN OPENSSH PRIVATE KEY-----` e `-----END OPENSSH PRIVATE KEY-----`
3. Cola no secret `HOSTINGER_SSH_KEY` no GitHub

## Pré-requisitos no servidor

Antes do primeiro deploy automático funcionar, certifique-se de que no servidor:

1. **Repo está clonado:** `git clone https://github.com/alexwaltersdorf/total-quality.git` no path que vai virar `HOSTINGER_PATH`
2. **Node + pnpm instalados:** `node --version` e `pnpm --version` precisam responder
3. **`.env` configurado:** copie de `ENVIRONMENT_TEMPLATE.md` e preencha
4. **Gerenciador de processo:** instale o PM2 (`npm install -g pm2`) e inicie a app uma vez:
   ```bash
   pm2 start dist/index.js --name total-quality
   pm2 save
   pm2 startup   # para auto-restart no reboot
   ```

## Como testar o deploy

Depois de configurar os 5 secrets:

**Opção 1 — Disparar manualmente:** vai em Actions → "Deploy to Hostinger" → "Run workflow"

**Opção 2 — Mergear um PR na main:** o workflow dispara sozinho

Acompanhe o progresso em: https://github.com/alexwaltersdorf/total-quality/actions

## Troubleshooting

| Sintoma | Causa provável |
|---------|---------------|
| "Permission denied (publickey)" | Chave pública não está no `authorized_keys` do servidor |
| "Host key verification failed" | Servidor mudou de host key. Adicione `host_key: ""` no step |
| "pnpm: command not found" | PATH do GitHub Action não acha o pnpm. Edite o `export PATH=` no script |
| "frozen-lockfile" error | `pnpm-lock.yaml` desatualizado. Rode `pnpm install` local e commite |
| App não reinicia | PM2/systemd não estão configurados. Veja "Pré-requisitos" acima |
