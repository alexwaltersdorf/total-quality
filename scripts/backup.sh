#!/bin/bash

################################################################################
# Script de Backup Automático do MySQL
# Total Quality Medicina Diagnóstica
#
# Descrição: Realiza backup completo do banco de dados MySQL com compressão
# Uso: ./backup.sh
# Cron: 0 2 * * * /home/seu-usuario/total-quality/scripts/backup.sh
################################################################################

set -e  # Sair em caso de erro

# ===== CONFIGURAÇÕES =====

# Credenciais do banco de dados (carregue do .env ou configure aqui)
DB_USER="${DB_BACKUP_USER:-root}"
DB_PASSWORD="${DB_BACKUP_PASSWORD:-}"
DB_HOST="${DB_BACKUP_HOST:-localhost}"
DB_PORT="${DB_BACKUP_PORT:-3306}"
DB_NAME="${DB_BACKUP_NAME:-totalquality}"

# Diretório de backup
BACKUP_DIR="${BACKUP_DIR:-/home/seu-usuario/backups/mysql}"
LOCAL_BACKUP_DIR="${LOCAL_BACKUP_DIR:-/home/seu-usuario/total-quality-backups}"

# Configurações de retenção
RETENTION_DAYS="${RETENTION_DAYS:-30}"  # Manter backups por 30 dias
MAX_BACKUPS="${MAX_BACKUPS:-10}"        # Manter máximo de 10 backups

# Email para notificações (opcional)
NOTIFICATION_EMAIL="${NOTIFICATION_EMAIL:-}"

# Log
LOG_FILE="${BACKUP_DIR}/backup.log"
ERROR_LOG="${BACKUP_DIR}/backup-error.log"

# ===== FUNÇÕES =====

# Função para logging
log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] $1" | tee -a "${LOG_FILE}"
}

# Função para erro
error() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] ERROR: $1" | tee -a "${ERROR_LOG}"
}

# Função para enviar notificação por email
send_notification() {
    if [ -z "${NOTIFICATION_EMAIL}" ]; then
        return
    fi
    
    local subject="$1"
    local message="$2"
    
    echo "${message}" | mail -s "${subject}" "${NOTIFICATION_EMAIL}" || true
}

# Função para criar diretórios
ensure_directories() {
    mkdir -p "${BACKUP_DIR}"
    mkdir -p "${LOCAL_BACKUP_DIR}"
    chmod 700 "${BACKUP_DIR}"
    chmod 700 "${LOCAL_BACKUP_DIR}"
}

# Função para validar conexão com banco de dados
validate_connection() {
    if ! mysqladmin ping -h"${DB_HOST}" -u"${DB_USER}" -p"${DB_PASSWORD}" --silent > /dev/null 2>&1; then
        error "Não foi possível conectar ao banco de dados ${DB_NAME} em ${DB_HOST}"
        send_notification "Backup Falhou" "Erro: Não foi possível conectar ao banco de dados."
        exit 1
    fi
}

# Função para realizar backup
perform_backup() {
    local backup_filename="backup-${DB_NAME}-$(date '+%Y%m%d-%H%M%S').sql.gz"
    local backup_path="${BACKUP_DIR}/${backup_filename}"
    local local_backup_path="${LOCAL_BACKUP_DIR}/${backup_filename}"
    
    log "Iniciando backup do banco de dados: ${DB_NAME}"
    
    # Realizar dump e comprimir
    if mysqldump \
        -h"${DB_HOST}" \
        -u"${DB_USER}" \
        -p"${DB_PASSWORD}" \
        -P"${DB_PORT}" \
        --single-transaction \
        --quick \
        --lock-tables=false \
        "${DB_NAME}" | gzip > "${backup_path}"; then
        
        log "Backup criado com sucesso: ${backup_filename}"
        
        # Copiar para backup local também
        cp "${backup_path}" "${local_backup_path}" 2>/dev/null || true
        
        # Obter informações do arquivo
        local file_size=$(du -h "${backup_path}" | cut -f1)
        log "Tamanho do backup: ${file_size}"
        
        return 0
    else
        error "Falha ao criar backup do banco de dados"
        send_notification "Backup Falhou" "Erro: Falha ao criar backup do banco de dados ${DB_NAME}."
        return 1
    fi
}

# Função para limpar backups antigos
cleanup_old_backups() {
    log "Limpando backups antigos (retenção: ${RETENTION_DAYS} dias, máximo: ${MAX_BACKUPS})"
    
    # Remover backups mais antigos que RETENTION_DAYS
    find "${BACKUP_DIR}" -name "backup-${DB_NAME}-*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
    find "${LOCAL_BACKUP_DIR}" -name "backup-${DB_NAME}-*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
    
    # Manter apenas os MAX_BACKUPS mais recentes
    local backup_count=$(ls -1 "${BACKUP_DIR}"/backup-${DB_NAME}-*.sql.gz 2>/dev/null | wc -l)
    if [ ${backup_count} -gt ${MAX_BACKUPS} ]; then
        log "Número de backups (${backup_count}) excede o máximo (${MAX_BACKUPS}). Removendo antigos."
        ls -1t "${BACKUP_DIR}"/backup-${DB_NAME}-*.sql.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f
        ls -1t "${LOCAL_BACKUP_DIR}"/backup-${DB_NAME}-*.sql.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f || true
    fi
}

# Função para gerar relatório
generate_report() {
    local backup_count=$(ls -1 "${BACKUP_DIR}"/backup-${DB_NAME}-*.sql.gz 2>/dev/null | wc -l)
    local total_size=$(du -sh "${BACKUP_DIR}" 2>/dev/null | cut -f1)
    
    log "===== RELATÓRIO DE BACKUP ====="
    log "Banco de dados: ${DB_NAME}"
    log "Host: ${DB_HOST}"
    log "Total de backups: ${backup_count}"
    log "Tamanho total: ${total_size}"
    log "Diretório: ${BACKUP_DIR}"
    log "Local backup: ${LOCAL_BACKUP_DIR}"
    log "=============================="
}

# ===== EXECUÇÃO PRINCIPAL =====

main() {
    log "===== INICIANDO BACKUP ====="
    
    # Criar diretórios se não existirem
    ensure_directories
    
    # Validar conexão com banco de dados
    validate_connection
    
    # Realizar backup
    if perform_backup; then
        # Limpar backups antigos
        cleanup_old_backups
        
        # Gerar relatório
        generate_report
        
        log "===== BACKUP CONCLUÍDO COM SUCESSO ====="
        send_notification "Backup Realizado" "Backup do banco de dados ${DB_NAME} foi realizado com sucesso."
        exit 0
    else
        error "===== BACKUP FALHOU ====="
        exit 1
    fi
}

# Executar função principal
main "$@"
