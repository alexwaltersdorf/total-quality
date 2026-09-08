/**
 * Webhook da planilha "LEADS - SITE Total Quality".
 *
 * Instalação:
 * 1. Na planilha: Extensões > Apps Script.
 * 2. Cole este arquivo no editor e execute setupPlanilha uma vez.
 * 3. Em Configurações do projeto > Propriedades do script, crie
 *    ORGANIC_LEADS_WEBHOOK_SECRET com o mesmo valor configurado no servidor.
 * 4. Implantar > Nova implantação > App da Web. Executar como "Eu" e permitir
 *    acesso a "Qualquer pessoa". Guarde a URL terminada em /exec no servidor.
 */

const SPREADSHEET_ID = "1IpWdhuK6GqQsM3VxytlYBAYSUm1qOldRZpD6wfhhbp0";
const SHEET_NAME = "Leads";
const HEADERS = [
  "Data",
  "Nome",
  "Telefone",
  "E-mail",
  "Tipo",
  "Canal",
  "Origem do botão",
  "Página de entrada",
  "Página da conversão",
  "Campanha",
  "Status",
  "ID do evento",
];

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

// Impede que texto controlado pelo visitante seja interpretado como fórmula.
function safeCell_(value) {
  const text = String(value == null ? "" : value).slice(0, 1000);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('A aba "' + SHEET_NAME + '" não foi encontrada.');
  return sheet;
}

function setupPlanilha() {
  const sheet = getSheet_();
  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  const current = range.getValues()[0];
  const merged = HEADERS.map((header, index) => current[index] || header);
  range.setValues([merged]).setFontWeight("bold");
  sheet.setFrozenRows(1);
  sheet.hideColumns(HEADERS.length);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const expectedSecret = PropertiesService.getScriptProperties()
      .getProperty("ORGANIC_LEADS_WEBHOOK_SECRET");

    if (!expectedSecret || data.secret !== expectedSecret) {
      return jsonResponse_({ ok: false, error: "Não autorizado" });
    }
    if (!data.eventId) {
      return jsonResponse_({ ok: false, error: "ID do evento ausente" });
    }

    lock.waitLock(10000);
    const sheet = getSheet_();

    // O ID fica numa coluna oculta e evita duplicidade em reenvios.
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const duplicate = sheet
        .getRange(2, HEADERS.length, lastRow - 1, 1)
        .createTextFinder(String(data.eventId))
        .matchEntireCell(true)
        .findNext();
      if (duplicate) return jsonResponse_({ ok: true, duplicate: true });
    }

    sheet.appendRow([
      data.occurredAt ? new Date(data.occurredAt) : new Date(),
      safeCell_(data.name),
      safeCell_(data.phone),
      safeCell_(data.email),
      safeCell_(data.type),
      safeCell_(data.channel),
      safeCell_(data.buttonSource),
      safeCell_(data.landingPage),
      safeCell_(data.conversionPage),
      safeCell_(data.campaign),
      safeCell_(data.status || "Novo"),
      safeCell_(data.eventId),
    ]);

    return jsonResponse_({ ok: true });
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error && error.message || error) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}
