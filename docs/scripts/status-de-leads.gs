/**
 * Status do lead na planilha Total_Quality_Leads.
 * Ver docs/status-de-leads.md no repositorio do site.
 *
 * COLE ESTE ARQUIVO NO FIM DO Code.gs EXISTENTE. Nao apague o doPost: e ele
 * que recebe os leads do site. As colunas novas entram no FIM (U, V, W) —
 * inserir coluna no meio desloca o que o doPost escreve e quebra a gravacao
 * em silencio.
 *
 * Rode uma vez: configurarStatus(), depois criarResumo().
 */

var ABA_LEADS = 'Leads';
var ABA_RESUMO = 'Resumo';

var COL_ORIGEM = 6;        // F
var COL_STATUS = 19;       // S
var COL_DATA_STATUS = 21;  // U
var COL_EXAME = 22;        // V
var COL_VALOR = 23;        // W

/** A ordem importa: e a do funil, e o Resumo depende dela. */
var ETAPAS = [
  'Novo',
  'Em contato',
  'Agendado',
  'Compareceu',
  'Não compareceu',
  'Sem retorno',
  'Perdido'
];

/** Cor de fundo por etapa, para a lista ser legivel de relance. */
var CORES = {
  'Novo': '#fff2cc',
  'Em contato': '#d9e7fd',
  'Agendado': '#d9ead3',
  'Compareceu': '#b7e1cd',
  'Não compareceu': '#fce5cd',
  'Sem retorno': '#efefef',
  'Perdido': '#f4cccc'
};

/**
 * Execute UMA VEZ. Cria os cabecalhos novos, a lista suspensa de status e as
 * cores. Pode ser executada de novo sem estragar nada.
 */
function configurarStatus() {
  var aba = SpreadsheetApp.getActive().getSheetByName(ABA_LEADS);
  if (!aba) throw new Error('Aba "' + ABA_LEADS + '" nao encontrada.');

  /*
   * A planilha nasceu com 20 colunas (A ate T). Escrever na U, V ou W sem
   * cria-las antes faz getRange() lancar erro. insertColumnsAfter acrescenta
   * no FIM, que e o unico lugar seguro: inserir no meio deslocaria o que o
   * doPost escreve e quebraria a gravacao dos leads em silencio.
   */
  var faltam = COL_VALOR - aba.getMaxColumns();
  if (faltam > 0) aba.insertColumnsAfter(aba.getMaxColumns(), faltam);

  aba.getRange(1, COL_DATA_STATUS).setValue('Data do Status');
  aba.getRange(1, COL_EXAME).setValue('Exame agendado');
  aba.getRange(1, COL_VALOR).setValue('Valor (R$)');
  aba.getRange(1, COL_DATA_STATUS, 1, 3).setFontWeight('bold');

  /*
   * A validacao vai ate o fim da planilha para valer tambem nas linhas que o
   * site ainda vai gravar. Validacao e formatacao NAO contam como conteudo,
   * entao getLastRow() nao muda e o appendRow do doPost continua achando a
   * primeira linha livre. Escrever valor nessas linhas, ao contrario, jogaria
   * todo lead novo para o fim da planilha.
   */
  var ultimaLinha = aba.getMaxRows();
  var faixaStatus = aba.getRange(2, COL_STATUS, ultimaLinha - 1, 1);

  var regra = SpreadsheetApp.newDataValidation()
    .requireValueInList(ETAPAS, true)
    .setAllowInvalid(false)
    .setHelpText('Escolha uma etapa da lista.')
    .build();
  faixaStatus.setDataValidation(regra);

  aba.getRange(2, COL_DATA_STATUS, ultimaLinha - 1, 1)
     .setNumberFormat('dd/MM/yyyy HH:mm');
  aba.getRange(2, COL_VALOR, ultimaLinha - 1, 1)
     .setNumberFormat('R$ #,##0.00');

  var regras = aba.getConditionalFormatRules().filter(function (r) {
    // Remove so as nossas, para nao duplicar a cada execucao.
    var c = r.getBooleanCondition();
    return !(c && c.getCriteriaValues().some(function (v) {
      return ETAPAS.indexOf(v) !== -1;
    }));
  });
  ETAPAS.forEach(function (etapa) {
    regras.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo(etapa)
        .setBackground(CORES[etapa])
        .setRanges([faixaStatus])
        .build()
    );
  });
  aba.setConditionalFormatRules(regras);

  aba.setFrozenRows(1);
  SpreadsheetApp.getActive().toast('Status configurado. Agora rode criarResumo().');
}

/**
 * Carimba a data quando alguem muda a etapa.
 *
 * Preenchimento manual de data nao acontece: quem atende esta com o paciente
 * na linha. Sem o carimbo automatico nao da para medir quanto tempo o lead
 * levou do contato ao agendamento.
 *
 * SE O Code.gs JA TIVER UM onEdit, junte os corpos numa funcao so: duas com o
 * mesmo nome fazem a ultima sobrescrever a primeira, em silencio.
 */
function onEdit(e) {
  if (!e || !e.range) return;
  var aba = e.range.getSheet();
  if (aba.getName() !== ABA_LEADS) return;
  // Sem as colunas novas nao ha onde carimbar: rode configurarStatus() antes.
  if (aba.getMaxColumns() < COL_DATA_STATUS) return;

  // A edicao pode ser um bloco colado, nao so uma celula.
  if (e.range.getColumn() > COL_STATUS || e.range.getLastColumn() < COL_STATUS) return;

  var primeira = Math.max(e.range.getRow(), 2);
  var ultima = e.range.getLastRow();
  if (ultima < primeira) return;

  var agora = new Date();
  for (var linha = primeira; linha <= ultima; linha++) {
    var status = aba.getRange(linha, COL_STATUS).getValue();
    aba.getRange(linha, COL_DATA_STATUS).setValue(status ? agora : '');
  }
}

/**
 * Execute UMA VEZ. Monta a aba Resumo com formulas que leem a aba Leads ao
 * vivo — nao ha nada para atualizar a mao.
 *
 * As formulas sao escritas com virgula porque setFormula() sempre usa a
 * convencao americana, independente do idioma da planilha; o Sheets converte
 * para ponto e virgula sozinho ao exibir. Escrever ";" aqui daria erro.
 */
function criarResumo() {
  var ss = SpreadsheetApp.getActive();
  var aba = ss.getSheetByName(ABA_RESUMO) || ss.insertSheet(ABA_RESUMO);
  aba.clear();

  var L = "'" + ABA_LEADS + "'!";
  var totalLeads = 'COUNTA(' + L + 'A2:A)';
  var qtd = function (etapa) {
    return 'COUNTIF(' + L + 'S2:S,"' + etapa + '")';
  };
  // Quem chegou a marcar, tenha comparecido ou nao.
  var agendou = '(' + qtd('Agendado') + '+' + qtd('Compareceu') + '+' + qtd('Não compareceu') + ')';
  var pct = function (numerador, denominador) {
    return '=IFERROR(' + numerador + '/' + denominador + ',0)';
  };

  var linhas = [
    ['FUNIL DE LEADS', ''],
    ['Total de leads', '=' + totalLeads],
    ['Leads com telefone e e-mail', '=COUNTIFS(' + L + 'C2:C,"<>",' + L + 'D2:D,"<>")'],
    ['', ''],
    ['POR ETAPA', ''],
    ['Novo', '=' + qtd('Novo')],
    ['Em contato', '=' + qtd('Em contato')],
    ['Agendado', '=' + qtd('Agendado')],
    ['Compareceu', '=' + qtd('Compareceu')],
    ['Não compareceu', '=' + qtd('Não compareceu')],
    ['Sem retorno', '=' + qtd('Sem retorno')],
    ['Perdido', '=' + qtd('Perdido')],
    ['', ''],
    ['TAXAS', ''],
    ['Taxa de agendamento', pct(agendou, totalLeads)],
    ['Taxa de comparecimento', pct(qtd('Compareceu'), agendou)],
    ['Receita registrada', '=IFERROR(SUM(' + L + 'W2:W),0)'],
    ['Ticket médio dos atendidos', '=IFERROR(SUM(' + L + 'W2:W)/' + qtd('Compareceu') + ',0)'],
    ['', ''],
    ['WHATSAPP x TELEFONE', ''],
    ['Leads por telefone', '=COUNTIF(' + L + 'F2:F,"telefone_*")'],
    ['Leads por WhatsApp', '=' + totalLeads + '-COUNTIF(' + L + 'F2:F,"telefone_*")'],
    ['Agendados vindos do telefone', '=COUNTIFS(' + L + 'F2:F,"telefone_*",' + L + 'S2:S,"Agendado")'],
    ['Agendados vindos do WhatsApp', '=' + qtd('Agendado') + '-COUNTIFS(' + L + 'F2:F,"telefone_*",' + L + 'S2:S,"Agendado")'],
    ['', ''],
    ['POR CANAL DE AQUISIÇÃO', '']
  ];

  aba.getRange(1, 1, linhas.length, 2).setValues(linhas);

  // QUERY para o canal: a lista cresce sozinha conforme novos canais aparecem.
  aba.getRange(linhas.length + 1, 1).setFormula(
    '=IFERROR(QUERY(' + L + 'A2:S,' +
    '"select E, count(A) where A is not null group by E order by count(A) desc ' +
    'label E \'Canal\', count(A) \'Leads\'",0),"sem dados")'
  );

  // Formatos: percentual nas taxas, moeda na receita.
  aba.getRange(15, 2, 2, 1).setNumberFormat('0.0%');
  aba.getRange(17, 2, 2, 1).setNumberFormat('R$ #,##0.00');

  ['FUNIL DE LEADS', 'POR ETAPA', 'TAXAS', 'WHATSAPP x TELEFONE', 'POR CANAL DE AQUISIÇÃO']
    .forEach(function (titulo) {
      for (var i = 0; i < linhas.length; i++) {
        if (linhas[i][0] === titulo) {
          aba.getRange(i + 1, 1, 1, 2).setFontWeight('bold').setBackground('#e8eaed');
        }
      }
    });

  aba.setColumnWidth(1, 260);
  aba.setColumnWidth(2, 140);
  ss.toast('Aba Resumo criada.');
}
