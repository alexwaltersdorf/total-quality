# Guia de Backup Automatizado — Total Quality Medicina Diagnóstica

Este documento descreve como configurar backups automatizados do banco de dados MySQL na Hostinger usando cron jobs.

## Visão Geral

O sistema de backup automatizado realiza as seguintes tarefas:

- **Backup diário** do banco de dados MySQL com compressão gzip
- **Retenção automática** de backups (mantém últimos 30 dias ou 10 backups)
- **Cópia local** de backups para redundância
- **Notificações por email** em caso de sucesso ou falha
- **Restauração rápida** em caso de necessidade

## Estrutura de Scripts

| Script | Descrição | Frequência |
|--------|-----------|-----------|
| `scripts/backup.sh` | Realiza backup completo do banco de dados | Diária (2h da manhã) |
| `scripts/restore.sh` | Restaura banco de dados a partir de backup | Manual (conforme necessário) |
| `scripts/.env.backup` | Template de variáveis de ambiente | Configuração única |

## Pré-requisitos

Antes de configurar os backups, certifique-se de ter:

1. **Acesso SSH** ao servidor Hostinger
2. **MySQL Client** instalado (`mysql` e `mysqldump`)
3. **Gzip** instalado (geralmente pré-instalado)
4. **Permissões** para criar diretórios e executar cron jobs
5. **Credenciais** do banco de dados MySQL

## Instalação e Configuração

### 1. Criar Diretórios de Backup

```bash
# SSH no servidor Hostinger
ssh seu-usuario@seu-servidor.com

# Criar diretórios
mkdir -p ~/backups/mysql
mkdir -p ~/total-quality-backups
chmod 700 ~/backups/mysql
chmod 700 ~/total-quality-backups
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.backup` no diretório `scripts/`:

```bash
cd ~/total-quality/scripts
cat > .env.backup << 'EOF'
# ===== CREDENCIAIS DO BANCO DE DADOS =====
export DB_BACKUP_USER="seu_usuario_mysql"
export DB_BACKUP_PASSWORD="sua_senha_mysql"
export DB_BACKUP_HOST="localhost"
export DB_BACKUP_PORT="3306"
export DB_BACKUP_NAME="totalquality"

# ===== DIRETÓRIOS DE BACKUP =====
export BACKUP_DIR="/home/seu-usuario/backups/mysql"
export LOCAL_BACKUP_DIR="/home/seu-usuario/total-quality-backups"

# ===== CONFIGURAÇÕES DE RETENÇÃO =====
export RETENTION_DAYS="30"
export MAX_BACKUPS="10"

# ===== NOTIFICAÇÕES (OPCIONAL) =====
export NOTIFICATION_EMAIL="seu-email@example.com"
EOF

chmod 600 .env.backup
```

**Importante:** O arquivo `.env.backup` contém credenciais sensíveis. Nunca o sincronize com Git.

### 3. Tornar Scripts Executáveis

```bash
chmod +x ~/total-quality/scripts/backup.sh
chmod +x ~/total-quality/scripts/restore.sh
```

### 4. Testar o Script de Backup

Antes de agendar com cron, teste manualmente:

```bash
# Carregar variáveis de ambiente
source ~/total-quality/scripts/.env.backup

# Executar script de backup
~/total-quality/scripts/backup.sh
```

Verifique se:
- O backup foi criado em `~/backups/mysql/`
- Uma cópia foi criada em `~/total-quality-backups/`
- O arquivo tem extensão `.sql.gz`
- Não há erros no log

## Configuração de Cron Jobs

### Adicionar Cron Job

Abra o editor de cron:

```bash
crontab -e
```

Adicione a seguinte linha para executar backup diariamente às 2h da manhã:

```cron
# Backup diário do MySQL às 2h da manhã
0 2 * * * source /home/seu-usuario/total-quality/scripts/.env.backup && /home/seu-usuario/total-quality/scripts/backup.sh >> /home/seu-usuario/backups/mysql/cron.log 2>&1
```

### Explicação da Sintaxe Cron

```
0 2 * * * comando
│ │ │ │ │
│ │ │ │ └─ Dia da semana (0-6, 0=domingo)
│ │ │ └─── Mês (1-12)
│ │ └───── Dia do mês (1-31)
│ └─────── Hora (0-23)
└───────── Minuto (0-59)
```

### Exemplos de Agendamento

| Frequência | Sintaxe Cron | Descrição |
|-----------|-------------|-----------|
| Diariamente às 2h | `0 2 * * *` | Backup todos os dias às 2h da manhã |
| Duas vezes por dia | `0 2,14 * * *` | Backup às 2h e 14h |
| A cada 6 horas | `0 */6 * * *` | Backup a cada 6 horas (0h, 6h, 12h, 18h) |
| Semanalmente | `0 2 * * 0` | Backup todo domingo às 2h |
| Mensalmente | `0 2 1 * *` | Backup no primeiro dia do mês às 2h |

### Verificar Cron Jobs Configurados

```bash
# Listar todos os cron jobs do usuário
crontab -l

# Ver logs de execução do cron
grep CRON /var/log/syslog | tail -20
```

## Monitoramento e Manutenção

### Verificar Status dos Backups

```bash
# Listar backups criados
ls -lh ~/backups/mysql/backup-*.sql.gz

# Ver tamanho total de backups
du -sh ~/backups/mysql/

# Ver últimas linhas do log
tail -20 ~/backups/mysql/backup.log
```

### Verificar Logs de Cron

```bash
# Ver últimas execuções do cron
grep backup /var/log/syslog | tail -10

# Ver logs de erro
cat ~/backups/mysql/backup-error.log
```

### Limpeza Manual de Backups Antigos

Se precisar remover backups manualmente:

```bash
# Remover backups mais antigos que 30 dias
find ~/backups/mysql/ -name "backup-*.sql.gz" -mtime +30 -delete

# Remover todos os backups exceto os 5 mais recentes
ls -1t ~/backups/mysql/backup-*.sql.gz | tail -n +6 | xargs rm -f
```

## Restauração de Backup

### Restaurar Banco de Dados

Para restaurar a partir de um backup:

```bash
# Carregar variáveis de ambiente
source ~/total-quality/scripts/.env.backup

# Executar restauração
~/total-quality/scripts/restore.sh ~/backups/mysql/backup-totalquality-20260430-020000.sql.gz
```

O script pedirá confirmação antes de sobrescrever o banco de dados.

### Restauração Manual (sem script)

Se preferir restaurar manualmente:

```bash
# Descompactar e restaurar
gunzip -c ~/backups/mysql/backup-totalquality-20260430-020000.sql.gz | \
mysql -u seu_usuario -p -h localhost totalquality
```

## Troubleshooting

### Problema: "Permission denied" ao executar script

**Solução:**

```bash
chmod +x ~/total-quality/scripts/backup.sh
chmod +x ~/total-quality/scripts/restore.sh
```

### Problema: "mysqldump: command not found"

**Solução:** Instale o MySQL Client:

```bash
# Debian/Ubuntu
sudo apt-get install mysql-client

# CentOS/RHEL
sudo yum install mysql
```

### Problema: "Access denied for user"

**Solução:** Verifique as credenciais no `.env.backup`:

```bash
# Testar conexão
mysql -h localhost -u seu_usuario -p -e "SELECT 1;"
```

### Problema: Cron job não está executando

**Solução:**

1. Verifique se o cron está ativo: `sudo systemctl status cron`
2. Verifique a sintaxe do cron: `crontab -e`
3. Verifique permissões: `ls -la ~/total-quality/scripts/backup.sh`
4. Verifique logs: `grep CRON /var/log/syslog`

### Problema: Backups não estão sendo criados

**Solução:**

1. Teste manualmente: `~/total-quality/scripts/backup.sh`
2. Verifique permissões do diretório: `chmod 700 ~/backups/mysql`
3. Verifique espaço em disco: `df -h`
4. Verifique logs: `cat ~/backups/mysql/backup.log`

## Boas Práticas

### Segurança

- **Proteja o arquivo `.env.backup`** com permissões restritivas (`chmod 600`)
- **Nunca sincronize credenciais** com Git
- **Teste regularmente** a restauração de backups
- **Mantenha backups offline** (copie periodicamente para seu computador)

### Armazenamento

- **Monitore espaço em disco** regularmente
- **Configure retenção apropriada** (30 dias é recomendado)
- **Mantenha cópias locais** para redundância
- **Considere backup em nuvem** para maior segurança

### Monitoramento

- **Revise logs regularmente** para erros
- **Configure notificações por email** para falhas
- **Teste restauração mensalmente** para garantir integridade
- **Documente procedimentos** de recuperação

## Exemplo Completo de Configuração

```bash
# 1. Criar diretórios
mkdir -p ~/backups/mysql ~/total-quality-backups
chmod 700 ~/backups/mysql ~/total-quality-backups

# 2. Configurar variáveis de ambiente
cat > ~/total-quality/scripts/.env.backup << 'EOF'
export DB_BACKUP_USER="totalquality_user"
export DB_BACKUP_PASSWORD="senha_super_segura"
export DB_BACKUP_HOST="localhost"
export DB_BACKUP_PORT="3306"
export DB_BACKUP_NAME="totalquality"
export BACKUP_DIR="/home/seu-usuario/backups/mysql"
export LOCAL_BACKUP_DIR="/home/seu-usuario/total-quality-backups"
export RETENTION_DAYS="30"
export MAX_BACKUPS="10"
export NOTIFICATION_EMAIL="seu-email@example.com"
EOF
chmod 600 ~/total-quality/scripts/.env.backup

# 3. Tornar scripts executáveis
chmod +x ~/total-quality/scripts/backup.sh
chmod +x ~/total-quality/scripts/restore.sh

# 4. Testar script
source ~/total-quality/scripts/.env.backup
~/total-quality/scripts/backup.sh

# 5. Adicionar ao cron
crontab -e
# Adicionar: 0 2 * * * source /home/seu-usuario/total-quality/scripts/.env.backup && /home/seu-usuario/total-quality/scripts/backup.sh >> /home/seu-usuario/backups/mysql/cron.log 2>&1
```

## Suporte

Para dúvidas ou problemas com backups:

- Consulte [DEPLOYMENT.md](./DEPLOYMENT.md) para mais informações de deployment
- Verifique logs em `~/backups/mysql/backup.log`
- Entre em contato com o suporte Hostinger para problemas de servidor

---

**Última atualização:** Abril de 2026  
**Versão:** 1.0
