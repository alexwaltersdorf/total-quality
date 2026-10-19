/**
 * Gravacao de lead POR NOME DE CABECALHO, nao por posicao.
 * Ver docs/incidente-coluna-planilha-2026-09-22.md.
 *
 * POR QUE ISTO EXISTE. Em 21/09/2026, entre 16:31:58 e 17:53:22, a aba Leads
 * ganhou uma vigesima coluna: "Observacoes" passou a ocupar a posicao 19 e
 * "Status do Lead" foi empurrada para a 20. O doPost continuou montando uma
 * linha de 19 posicoes com appendRow, que escreve por POSICAO, e o "Novo"
 * que fechava a linha passou a cair em Observacoes.
 *
 * O estrago e menor do que parece a primeira vista: nome, telefone, e-mail,
 * canal, origem, UTMs, referrer e session ID continuam nas colunas certas.
 * Apenas o status inicial desceu uma casa. Seis leads entraram assim.
 *
 * A falha e silenciosa dos dois lados: o Apps Script nao reclama de uma
 * linha mais curta que o cabecalho, e o syncLeadToSheet do site nunca lanca
 * erro de proposito, para uma falha na planilha nao derrubar o lead no banco.
 *
 * Gravar por cabecalho resolve a classe inteira do problema: inserir coluna,
 * mover coluna, renomear, acrescentar as colunas de agendamento — nada disso
 * quebra mais. Coluna que o site nao conhece fica em branco; campo que o site
 * manda e a planilha nao tem e ignorado.
 *
 * SUBSTITUI o appendRow do doPost. Mantenha o resto do doPost como esta.
 */

var ABA_LEADS_GRAVACAO = 'Leads';

/**
 * De cada campo que o site envia para o cabecalho correspondente na planilha.
 * A chave e o nome EXATO do cabecalho; o valor e o campo do payload.
 *
 * Para aceitar um cabecalho renomeado, acrescente o nome novo aqui apontando
 * para o mesmo campo — os dois passam a funcionar.
 */
var MAPA_CABECALHOS = {
  'Nome': 'name',
  'Telefone': 'phone',
  'Email': 'email',
  'E-mail': 'email',
  'Canal': 'channel',
  'Origem (source)': 'source',
  'Origem': 'source',
  'Página': 'page',
  'Pagina': 'page',
  'Campanha (UTM)': 'utmCampaign',
  'UTM Source': 'utmSource',
  'UTM Medium': 'utmMedium',
  'UTM Term': 'utmTerm',
  'UTM Content': 'utmContent',
  'Cidade': 'city',
  'Estado': 'state',
  'CEP': 'zipCode',
  'Endereço': 'address',
  'Endereco': 'address',
  'Referrer': 'referrer',
  'Session ID': 'sessionId'
};

/** Cabecalhos preenchidos por regra, nao pelo payload. */
var CABECALHOS_ESPECIAIS = {
  'Data/Hora': function () { return new Date(); },
  'Status do Lead': function () { return 'Novo'; }
};

/**
 * Grava um lead na aba Leads respeitando a ORDEM ATUAL dos cabeçalhos.
 *
 * Chame no lugar do appendRow do doPost:
 *     gravarLeadPorCabecalho(lead);
 *
 * Devolve o numero da linha gravada, para log.
 */
function gravarLeadPorCabecalho(lead) {
  var aba = SpreadsheetApp.getActive().getSheetByName(ABA_LEADS_GRAVACAO);
  if (!aba) throw new Error('Aba "' + ABA_LEADS_GRAVACAO + '" nao encontrada.');

  var totalColunas = aba.getLastColumn();
  if (totalColunas < 1) throw new Error('A aba nao tem cabecalho.');

  var cabecalhos = aba.getRange(1, 1, 1, totalColunas).getValues()[0];
  var linha = [];

  for (var c = 0; c < totalColunas; c++) {
    var titulo = String(cabecalhos[c] == null ? '' : cabecalhos[c]).trim();

    if (CABECALHOS_ESPECIAIS[titulo]) {
      linha.push(CABECALHOS_ESPECIAIS[titulo]());
      continue;
    }

    var campo = MAPA_CABECALHOS[titulo];
    if (campo && lead[campo] != null && lead[campo] !== '') {
      linha.push(lead[campo]);
      continue;
    }

    // Cabecalho que o site nao alimenta (Observações, Data do Status, Exame
    // agendado, Valor, ou qualquer coluna futura) fica em branco. Nunca
    // empurra o resto da linha.
    linha.push('');
  }

  aba.appendRow(linha);
  return aba.getLastRow();
}

/**
 * Confere, sem gravar nada, se a planilha e o site ainda se entendem.
 *
 * Rode depois de qualquer mexida em coluna. Mostra quais cabecalhos o site
 * alimenta, quais ficarao em branco, e avisa se algum campo que o site manda
 * nao tem coluna para cair.
 */
function conferirCabecalhos() {
  var aba = SpreadsheetApp.getActive().getSheetByName(ABA_LEADS_GRAVACAO);
  if (!aba) throw new Error('Aba "' + ABA_LEADS_GRAVACAO + '" nao encontrada.');

  var cabecalhos = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0];
  var alimentados = [];
  var embranco = [];
  var camposCobertos = {};

  for (var c = 0; c < cabecalhos.length; c++) {
    var titulo = String(cabecalhos[c] == null ? '' : cabecalhos[c]).trim();
    var letra = colunaParaLetra(c + 1);
    if (CABECALHOS_ESPECIAIS[titulo]) {
      alimentados.push(letra + ' ' + titulo + ' (automatico)');
    } else if (MAPA_CABECALHOS[titulo]) {
      alimentados.push(letra + ' ' + titulo + ' -> ' + MAPA_CABECALHOS[titulo]);
      camposCobertos[MAPA_CABECALHOS[titulo]] = true;
    } else {
      embranco.push(letra + ' ' + (titulo || '(sem titulo)'));
    }
  }

  var semColuna = [];
  for (var cab in MAPA_CABECALHOS) {
    if (!camposCobertos[MAPA_CABECALHOS[cab]]) semColuna.push(MAPA_CABECALHOS[cab]);
  }
  semColuna = semColuna.filter(function (v, i, a) { return a.indexOf(v) === i; });

  var msg = 'PREENCHIDOS PELO SITE (' + alimentados.length + '):\n  ' +
    alimentados.join('\n  ') +
    '\n\nFICAM EM BRANCO (' + embranco.length + '):\n  ' +
    (embranco.join('\n  ') || '(nenhum)') +
    '\n\nCAMPOS DO SITE SEM COLUNA (' + semColuna.length + '):\n  ' +
    (semColuna.join(', ') || '(nenhum)');

  SpreadsheetApp.getUi().alert('Conferencia de cabecalhos', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  return msg;
}

function colunaParaLetra(n) {
  var s = '';
  while (n > 0) {
    var r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/**
 * Reparo pontual das linhas que entraram com o status uma coluna a esquerda.
 *
 * Move o valor de "Observacoes" para "Status do Lead" APENAS quando as tres
 * condicoes valem ao mesmo tempo:
 *   1. "Status do Lead" esta vazio na linha;
 *   2. "Observacoes" contem um valor que e reconhecidamente um status;
 *   3. os dois cabecalhos existem.
 *
 * Uma observacao escrita a mao pela equipe ("paciente pediu retorno na
 * segunda") nao se parece com status nenhum e por isso nao e tocada. Rodar
 * duas vezes nao faz efeito na segunda: depois do reparo o status deixa de
 * estar vazio.
 */
var STATUS_RECONHECIDOS = [
  'Novo', 'Contatado', 'Sem retorno', 'Agendado', 'Compareceu',
  'Nao compareceu', 'Não compareceu', 'Convertido', 'Perdido'
];

function repararStatusDeslocado() {
  var aba = SpreadsheetApp.getActive().getSheetByName(ABA_LEADS_GRAVACAO);
  if (!aba) throw new Error('Aba "' + ABA_LEADS_GRAVACAO + '" nao encontrada.');

  var cabecalhos = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0];
  var colObs = -1, colStatus = -1;
  for (var c = 0; c < cabecalhos.length; c++) {
    var t = String(cabecalhos[c] == null ? '' : cabecalhos[c]).trim();
    if (t === 'Observações' || t === 'Observacoes') colObs = c + 1;
    if (t === 'Status do Lead') colStatus = c + 1;
  }
  if (colObs < 0 || colStatus < 0) {
    throw new Error('Nao encontrei as colunas "Observações" e "Status do Lead".');
  }

  var ultima = aba.getLastRow();
  if (ultima < 2) return 'Nada a reparar: a aba so tem cabecalho.';

  var obs = aba.getRange(2, colObs, ultima - 1, 1).getValues();
  var status = aba.getRange(2, colStatus, ultima - 1, 1).getValues();
  var reparadas = [];

  for (var i = 0; i < obs.length; i++) {
    var valor = String(obs[i][0] == null ? '' : obs[i][0]).trim();
    var statusAtual = String(status[i][0] == null ? '' : status[i][0]).trim();
    if (statusAtual !== '') continue;
    if (STATUS_RECONHECIDOS.indexOf(valor) === -1) continue;
    status[i][0] = valor;
    obs[i][0] = '';
    reparadas.push(i + 2);
  }

  if (reparadas.length === 0) return 'Nada a reparar: nenhuma linha com status deslocado.';

  aba.getRange(2, colStatus, ultima - 1, 1).setValues(status);
  aba.getRange(2, colObs, ultima - 1, 1).setValues(obs);

  return 'Reparadas ' + reparadas.length + ' linha(s): ' + reparadas.join(', ');
}
