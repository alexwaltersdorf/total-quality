#!/bin/bash

################################################################################
# Script de Restauração de Backup do MySQL
# Total Quality Medicina Diagnóstica
#
# Descrição: Restaura banco de dados a partir de um arquivo de backup
# Uso: ./restore.sh <caminho-do-backup.sql.gz>
# Exemplo: ./restore.sh /home/seu-usuario/backups/mysql/backup-totalquality-20260430-020000.sql.gz
################################################################################

set -e

# ===== CONFIGURAÇÕES =====

DB_USER="${DB_BACKUP_USER:-root}"
DB_PASSWORD="${DB_BACKUP_PASSWORD:-}"
DB_HOST="${DB_BACKUP_HOST:-localhost}"
DB_PORT="${DB_BACKUP_PORT:-3306}"
DB_NAME="${DB_BACKUP_NAME:-totalquality}"

LOG_FILE="/tmp/restore-${DB_NAME}-$(date '+%Y%m%d-%H%M%S').log"

# ===== FUNÇÕES =====

log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] $1" | tee -a "${LOG_FILE}"
}

error() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] ERROR: $1" | tee -a "${LOG_FILE}"
}

# ===== VALIDAÇÕES =====

if [ $# -ne 1 ]; then
    error "Uso: $0 <caminho-do-backup.sql.gz>"
    error "Exemplo: $0 /home/seu-usuario/backups/mysql/backup-totalquality-20260430-020000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
    error "Arquivo de backup não encontrado: ${BACKUP_FILE}"
    exit 1
fi

if [[ ! "${BACKUP_FILE}" =~ \.sql\.gz$ ]]; then
    error "Arquivo deve ser um backup comprimido (.sql.gz)"
    exit 1
fi

# ===== CONFIRMAÇÃO =====

log "===== RESTAURAÇÃO DE BACKUP ====="
log "Arquivo de backup: ${BACKUP_FILE}"
log "Banco de dados: ${DB_NAME}"
log "Host: ${DB_HOST}"
log ""
log "AVISO: Esta operação irá SOBRESCREVER todos os dados do banco de dados ${DB_NAME}!"
log "Certifique-se de ter um backup atual antes de continuar."
log ""

read -p "Deseja continuar? (sim/não): " confirm

if [ "${confirm}" != "sim" ]; then
    log "Restauração cancelada pelo usuário."
    exit 0
fi

# ===== RESTAURAÇÃO =====

log "Iniciando restauração..."

if ! mysqladmin ping -h"${DB_HOST}" -u"${DB_USER}" -p"${DB_PASSWORD}" --silent > /dev/null 2>&1; then
    error "Não foi possível conectar ao banco de dados em ${DB_HOST}"
    exit 1
fi

log "Restaurando banco de dados..."

if gunzip -c "${BACKUP_FILE}" | mysql \
    -h"${DB_HOST}" \
    -u"${DB_USER}" \
    -p"${DB_PASSWORD}" \
    -P"${DB_PORT}" \
    "${DB_NAME}"; then
    
    log "===== RESTAURAÇÃO CONCLUÍDA COM SUCESSO ====="
    log "Banco de dados ${DB_NAME} foi restaurado a partir de: ${BACKUP_FILE}"
    log "Log: ${LOG_FILE}"
    exit 0
else
    error "Falha ao restaurar banco de dados"
    error "Verifique o arquivo de backup e as credenciais"
    log "Log: ${LOG_FILE}"
    exit 1
fi
