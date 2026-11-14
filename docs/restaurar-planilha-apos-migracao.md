# Restaurar leads no Sheets apos migracao da Hostinger

Diagnostico em 04/11/2026: a chamada real de `lead.create` retornou HTTP 500,
`Database not available`. A aba Leads da planilha `Total_Quality_Leads_v2`
terminava em 03/11/2026 10:31:08. O fluxo antigo lancava erro no banco antes de
sequer tentar o webhook. A nova instalacao foi criada somente com NODE_ENV;
variaveis e dados externos ao Git precisam ser migrados separadamente.

## Configuracao necessaria no hPanel

No app Node.js que atende totalquality.med.br, restaurar do ambiente anterior:

- `GOOGLE_SHEETS_WEBHOOK_URL`: URL da implantacao existente do Apps Script,
  terminada em `/exec`, que grava na planilha
  `1lHGm3CNDKHrT8s7TNJNMRbpovXtl5EnVfrLqPf6cd0Q`, aba `Leads`.
  Localizar em Extensoes > Apps Script > Implantar > Gerenciar implantacoes.
  Nao colar essa URL no Git, no cliente, em logs ou no dataLayer.
- `DATABASE_URL`: conexao do banco que contem as tabelas Drizzle do site.
  Restaurar os dados do banco anterior; criar banco vazio nao recupera leads.

Salvar e reimplantar/reiniciar o aplicativo. Nao confundir o app atual com o
site antigo movido para um dominio temporario. Conferir tambem os destinos
HOSTINGER_* do workflow antes de presumir que o SSH aponta ao novo ambiente.

## Correcao no codigo

Banco e Sheets sao tentados independentemente, antes da notificacao opcional.
A captura confirma sucesso somente se pelo menos um deles aceitar o registro.
O webhook tem prazo de 15 segundos; nao ha repeticao automatica de POST que
poderia duplicar uma linha quando a resposta se perde. Redirect de login e
JSON de erro nao contam como sucesso. Um redirect de ContentService confirma
somente que o Apps Script respondeu: a verificacao definitiva e a linha na aba.

## Validacao de producao

1. Enviar pelo formulario um contato sintetico identificado TESTE TECNICO,
   sem dados de pacientes e sem consentimento de marketing/analytics.
2. Conferir a nova linha em Leads (nome, origem, pagina e Event ID) e o retorno
   da API. Sucesso no banco isoladamente nao comprova preenchimento no Sheets.
3. Conferir o mapeamento por cabecalho conforme docs/scripts/gravar-lead-por-cabecalho.gs.
4. Preservar as colunas manuais e marcar a linha como teste para a recepcao.

Sem acesso ao hPanel e a URL do webhook nao e possivel concluir a ativacao de
producao apenas alterando codigo no GitHub. A correcao nao recupera contatos
perdidos antes de existir qualquer persistencia; eles precisam de fonte real.
