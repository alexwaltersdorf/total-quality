# Configuração de secrets — Deploy automático Hostinger

> Servidor identificado: **Hostinger Premium** (CloudLinux + Phusion Passenger)
> App em: `/home/u666428935/domains/totalquality.med.br/nodejs/`
> Node: 22.18.0 (alt-nodejs22)
> Restart: Phusion Passenger via `touch tmp/restart.txt`

## Os 5 secrets

Cadastre em: 👉 https://github.com/alexwaltersdorf/total-quality/settings/secrets/actions

| Nome do secret      | Valor                                                                       |
|---------------------|------------------------------------------------------------------------------|
| `HOSTINGER_HOST`    | `185.211.7.136`                                                             |
| `HOSTINGER_USER`    | `u666428935`                                                                |
| `HOSTINGER_PORT`    | `65002` (porta SSH padrão do Hostinger Premium)                             |
| `HOSTINGER_PATH`    | `/home/u666428935/domains/totalquality.med.br/nodejs`                       |
| `HOSTINGER_SSH_KEY` | (chave PRIVADA — gere abaixo)                                               |

> **Confirme `HOSTINGER_PORT`:** veja em hPanel → Avançado → Acesso SSH. Pode ser 22 ou 65002 dependendo da configuração.

## Como gerar a chave SSH e cadastrar

### Etapa 1 — Gerar chave SSH no SERVIDOR Hostinger

Conecta no SSH do servidor (mesma sessão que você está usando) e roda:

```bash
ssh-keygen -t ed25519 -C "github-deploy@total-quality" -f ~/.ssh/github_deploy -N ""
```

Isso cria dois arquivos:
- `~/.ssh/github_deploy` — chave PRIVADA (vai pro GitHub Secret)
- `~/.ssh/github_deploy.pub` — chave PÚBLICA (fica no servidor)

### Etapa 2 — Adicionar a chave pública nas chaves autorizadas do servidor

```bash
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

Isso autoriza o GitHub Action a fazer SSH no servidor usando essa chave.

### Etapa 3 — Copiar a chave privada para o GitHub Secret

No servidor, mostra a chave privada:

```bash
cat ~/.ssh/github_deploy
```

Copia **TUDO** que aparece (incluindo as linhas `-----BEGIN OPENSSH PRIVATE KEY-----` e `-----END OPENSSH PRIVATE KEY-----`).

No GitHub, vai em https://github.com/alexwaltersdorf/total-quality/settings/secrets/actions, clica **"New repository secret"**:
- Name: `HOSTINGER_SSH_KEY`
- Secret: cola o conteúdo da chave privada

Salva.

### Etapa 4 — Cadastra os outros 4 secrets

Repete o "New repository secret" para cada um:

| Nome | Valor |
|------|-------|
| `HOSTINGER_HOST` | `185.211.7.136` |
| `HOSTINGER_USER` | `u666428935` |
| `HOSTINGER_PORT` | `65002` (ou outro, conforme hPanel) |
| `HOSTINGER_PATH` | `/home/u666428935/domains/totalquality.med.br/nodejs` |

## Testar antes do primeiro merge real

Depois dos 5 secrets cadastrados:

1. Vai em https://github.com/alexwaltersdorf/total-quality/actions
2. Clica em "Deploy to Hostinger" no menu lateral
3. Clica "Run workflow" → seleciona branch `main` → "Run workflow"
4. Acompanha o progresso. Se rodar verde, está tudo certo.

## Como funciona o ciclo a partir daí

1. Você (ou qualquer pessoa) faz merge na main no GitHub
2. O Action dispara automaticamente em ~30 segundos
3. SSH no servidor → git pull + pnpm install + pnpm build → touch tmp/restart.txt
4. Phusion Passenger detecta o restart.txt e recarrega a app
5. Em ~3-5 minutos o site está atualizado
6. Confere em https://www.totalquality.med.br/

## Troubleshooting

| Sintoma | Causa provável |
|---------|----------------|
| `Permission denied (publickey)` | Chave pública não foi adicionada em `~/.ssh/authorized_keys`. Refaz a etapa 2. |
| `Host key verification failed` | Adicione `host_key_check: false` ou `host_key: ""` no step do workflow |
| `pnpm: command not found` | PATH errado no script. Já está corrigido pra alt-nodejs22 — se mudar a versão, ajusta |
| `frozen-lockfile` error | `pnpm-lock.yaml` desatualizado entre o que está commitado e o que o servidor tem. Roda `pnpm install` local e commita |
| `App não reinicia após deploy` | Passenger pode estar com cache. Verifica `tmp/restart.txt` foi criado. Se não, gera com `mkdir -p tmp && touch tmp/restart.txt` manual |
| `git pull` pede credencial | Repo voltou a ser privado. Configurar Deploy Key SSH no GitHub e trocar remote pra `git@github.com:...` |

## Próxima evolução (opcional)

Se quiser blindar contra o repo virar privado:

1. Gera outra chave SSH no servidor (ou usa a mesma)
2. Cadastra a pública como **Deploy Key** em https://github.com/alexwaltersdorf/total-quality/settings/keys
3. No servidor: `git remote set-url origin git@github.com:alexwaltersdorf/total-quality.git`
4. Pronto: pull funciona via SSH key, sem precisar de credencial HTTPS
