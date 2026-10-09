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
var ABA_AGENDAMENTOS = 'Agendamentos';

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
  'Perdido',
  'Duplicado'
];

/** Cor de fundo por etapa, para a lista ser legivel de relance. */
var CORES = {
  'Novo': '#fff2cc',
  'Em contato': '#d9e7fd',
  'Agendado': '#d9ead3',
  'Compareceu': '#b7e1cd',
  'Não compareceu': '#fce5cd',
  'Sem retorno': '#efefef',
  'Perdido': '#f4cccc',
  'Duplicado': '#e0e0e0'
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
  /*
   * A mesma pessoa preenche o formulario mais de uma vez (na planilha ja ha
   * casos de duas e tres). Contar essas linhas no denominador subestima a
   * taxa de agendamento justamente no numero que ela existe para medir, entao
   * o denominador sao os leads UNICOS.
   */
  var duplicados = 'COUNTIF(' + L + 'S2:S,"Duplicado")';
  var leadsUnicos = '(' + totalLeads + '-' + duplicados + ')';
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
    ['Duplicados (mesmo telefone)', '=' + duplicados],
    ['Leads únicos', '=' + leadsUnicos],
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
    ['Duplicado', '=' + duplicados],
    ['', ''],
    ['TAXAS', ''],
    ['Taxa de agendamento', pct(agendou, leadsUnicos)],
    ['Taxa de comparecimento', pct(qtd('Compareceu'), agendou)],
    ['Receita registrada', '=IFERROR(SUM(' + L + 'W2:W),0)'],
    ['Ticket médio dos atendidos', '=IFERROR(SUM(' + L + 'W2:W)/' + qtd('Compareceu') + ',0)'],
    ['', ''],
    ['WHATSAPP x TELEFONE', ''],
    ['Leads por telefone', '=COUNTIF(' + L + 'F2:F,"telefone_*")'],
    ['Leads por WhatsApp', '=' + leadsUnicos + '-COUNTIF(' + L + 'F2:F,"telefone_*")'],
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

  /*
   * Formatacao localizada pelo ROTULO, nao por indice fixo. A primeira versao
   * usava getRange(15, ...) e getRange(17, ...); acrescentar uma linha acima
   * deslocaria os formatos sem nenhum aviso, e o erro so apareceria como um
   * percentual exibido como numero solto.
   */
  var formatos = {
    'Taxa de agendamento': '0.0%',
    'Taxa de comparecimento': '0.0%',
    'Receita registrada': 'R$ #,##0.00',
    'Ticket médio dos atendidos': 'R$ #,##0.00'
  };
  for (var f = 0; f < linhas.length; f++) {
    var formato = formatos[linhas[f][0]];
    if (formato) aba.getRange(f + 1, 2).setNumberFormat(formato);
  }

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

// ===========================================================================
// ATUALIZACAO DE STATUS POR TELEFONE
//
// Quem sabe que o paciente agendou e a conversa do WhatsApp, e ela nao passa
// por lugar nenhum que este codigo alcance: o site abre wa.me e entrega a
// conversa ao aparelho da clinica. Nao ha API de WhatsApp no site, nem tabela
// de mensagens no banco. O que o banco guarda e que alguem CLICOU para
// conversar, nunca o que foi conversado.
//
// Entao o desenho e este: a lista de quem agendou entra por fora (colada da
// conversa, exportada da agenda, ou um dia por integracao), e este motor faz
// o resto — casa telefone com lead, atualiza o status, carimba a data e diz o
// que nao casou.
//
// O QUE NAO CASOU E INFORMACAO, NAO ERRO: e paciente que agendou sem nunca ter
// passado pelo site. Esse numero mede quanto da demanda o site nao explica.
// ===========================================================================

/** Menu proprio na planilha. Gatilho simples: nao precisa reimplantar nada. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Total Quality')
    .addItem('Preparar aba de agendamentos', 'prepararAgendamentos')
    .addItem('Atualizar status pelos telefones', 'atualizarStatusPorTelefone')
    .addSeparator()
    .addItem('Recriar o Resumo', 'criarResumo')
    .addToUi();
}

/**
 * Telefone brasileiro em duas chaves de comparacao.
 *
 * O problema real: o mesmo aparelho aparece como "(12) 99725-7786" na
 * planilha, "+55 12 99725-7786" no WhatsApp e "5512997257786" numa
 * exportacao. Pior, o nono digito entrou em 2012 e cadastro antigo nao tem —
 * o mesmo celular existe com 10 e com 11 digitos.
 *
 *   cheia = DDD + numero como veio (10 ou 11 digitos)
 *   curta = DDD + os 8 ultimos digitos, que sao os que nunca mudam
 *
 * A curta resolve o nono digito, mas pode confundir um fixo 3887-3535 com um
 * celular 93887-3535. Por isso ela so vale quando ha UM candidato: havendo
 * mais de um, o motor reporta ambiguidade em vez de chutar.
 */
function chavesTelefone(bruto) {
  var d = String(bruto == null ? '' : bruto).replace(/\D/g, '');
  if (!d) return null;
  if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);
  if (d.length > 11 && d.charAt(0) === '0') d = d.slice(1);
  if (d.length < 10) return null;
  d = d.slice(-11);
  return { cheia: d, curta: d.slice(0, 2) + d.slice(-8) };
}

/** Cria a aba onde a lista de quem agendou e colada. */
function prepararAgendamentos() {
  var ss = SpreadsheetApp.getActive();
  var aba = ss.getSheetByName(ABA_AGENDAMENTOS) || ss.insertSheet(ABA_AGENDAMENTOS);
  if (aba.getLastRow() > 1) {
    ss.toast('A aba ' + ABA_AGENDAMENTOS + ' ja existe e tem dados. Nada foi apagado.');
    return;
  }
  aba.clear();
  aba.getRange(1, 1, 1, 5).setValues([[
    'Telefone', 'Etapa (vazio = Agendado)', 'Exame', 'Valor (R$)', 'Resultado'
  ]]).setFontWeight('bold').setBackground('#e8eaed');
  aba.getRange(2, 1).setNote(
    'Cole aqui os telefones de quem agendou, um por linha. Qualquer formato ' +
    'serve: (12) 99999-9999, +55 12 99999-9999 ou 5512999999999.'
  );
  aba.setColumnWidth(1, 180);
  aba.setColumnWidth(2, 200);
  aba.setColumnWidth(5, 420);
  aba.setFrozenRows(1);
  ss.toast('Cole os telefones na aba ' + ABA_AGENDAMENTOS + ' e rode "Atualizar status pelos telefones".');
}

/**
 * Casa os telefones da aba Agendamentos com os leads e atualiza o status.
 *
 * Quando o mesmo telefone tem varios leads (a pessoa preencheu o formulario
 * mais de uma vez), atualiza o MAIS RECENTE e marca os anteriores como
 * Duplicado. Contar tres leads da mesma pessoa como tres agendamentos
 * inflaria a taxa exatamente no numero que ela existe para medir.
 *
 * Nunca sobrescreve em silencio um status ja preenchido a mao com algo
 * diferente de Novo nas linhas antigas: quem digitou sabia de algo que este
 * script nao sabe.
 */
function atualizarStatusPorTelefone() {
  var ss = SpreadsheetApp.getActive();
  var leads = ss.getSheetByName(ABA_LEADS);
  var entrada = ss.getSheetByName(ABA_AGENDAMENTOS);
  if (!leads) throw new Error('Aba "' + ABA_LEADS + '" nao encontrada.');
  if (!entrada) throw new Error('Rode "Preparar aba de agendamentos" primeiro.');
  if (leads.getMaxColumns() < COL_VALOR) throw new Error('Rode configurarStatus() primeiro.');

  var ultimaLead = leads.getLastRow();
  if (ultimaLead < 2) { ss.toast('Nao ha leads.'); return; }

  // Indice dos leads por telefone. A ordem das linhas e cronologica (o
  // doPost sempre acrescenta no fim), entao a ultima linha de um telefone e
  // sempre o contato mais recente dele.
  var telefones = leads.getRange(2, 3, ultimaLead - 1, 1).getValues();
  var porCheia = {};
  var porCurta = {};
  for (var i = 0; i < telefones.length; i++) {
    var k = chavesTelefone(telefones[i][0]);
    if (!k) continue;
    var linha = i + 2;
    (porCheia[k.cheia] = porCheia[k.cheia] || []).push(linha);
    (porCurta[k.curta] = porCurta[k.curta] || []).push(linha);
  }

  var ultimaEntrada = entrada.getLastRow();
  if (ultimaEntrada < 2) { ss.toast('Nenhum telefone na aba ' + ABA_AGENDAMENTOS + '.'); return; }
  var pedidos = entrada.getRange(2, 1, ultimaEntrada - 1, 4).getValues();

  var agora = new Date();
  var resultados = [];
  var atualizados = 0, semLead = 0, ambiguos = 0;

  for (var p = 0; p < pedidos.length; p++) {
    var bruto = pedidos[p][0];
    if (!bruto && bruto !== 0) { resultados.push(['']); continue; }

    var chave = chavesTelefone(bruto);
    if (!chave) { resultados.push(['telefone invalido']); semLead++; continue; }

    var candidatos = porCheia[chave.cheia];
    if (!candidatos) {
      var porOito = porCurta[chave.curta];
      if (!porOito) {
        resultados.push(['sem lead correspondente — agendou sem passar pelo site']);
        semLead++;
        continue;
      }
      // A chave curta ignora o nono digito e pode confundir fixo com celular.
      // Com mais de um candidato nao ha como decidir sem chutar.
      var distintas = {};
      for (var c = 0; c < porOito.length; c++) {
        var kk = chavesTelefone(telefones[porOito[c] - 2][0]);
        if (kk) distintas[kk.cheia] = true;
      }
      if (Object.keys(distintas).length > 1) {
        resultados.push(['ambiguo: mais de um numero diferente casa pelos 8 digitos — confira a mao']);
        ambiguos++;
        continue;
      }
      candidatos = porOito;
    }

    var alvo = candidatos[candidatos.length - 1];
    var etapa = String(pedidos[p][1] || '').trim() || 'Agendado';
    if (ETAPAS.indexOf(etapa) === -1) {
      resultados.push(['etapa "' + etapa + '" nao existe na lista']);
      continue;
    }

    leads.getRange(alvo, COL_STATUS).setValue(etapa);
    leads.getRange(alvo, COL_DATA_STATUS).setValue(agora);
    if (pedidos[p][2]) leads.getRange(alvo, COL_EXAME).setValue(pedidos[p][2]);
    if (pedidos[p][3] !== '' && pedidos[p][3] != null) {
      leads.getRange(alvo, COL_VALOR).setValue(pedidos[p][3]);
    }
    atualizados++;

    var anteriores = 0;
    for (var a = 0; a < candidatos.length - 1; a++) {
      var linhaAntiga = candidatos[a];
      if (String(leads.getRange(linhaAntiga, COL_STATUS).getValue() || '').trim() === 'Novo') {
        leads.getRange(linhaAntiga, COL_STATUS).setValue('Duplicado');
        leads.getRange(linhaAntiga, COL_DATA_STATUS).setValue(agora);
        anteriores++;
      }
    }

    resultados.push([
      'linha ' + alvo + ' -> ' + etapa +
      (anteriores ? ' (' + anteriores + ' anterior(es) marcada(s) como Duplicado)' : '')
    ]);
  }

  entrada.getRange(2, 5, resultados.length, 1).setValues(resultados);
  SpreadsheetApp.getUi().alert(
    'Status atualizado\n\n' +
    atualizados + ' lead(s) atualizado(s)\n' +
    semLead + ' telefone(s) sem lead no site\n' +
    ambiguos + ' ambiguo(s), conferir a mao\n\n' +
    'A coluna Resultado da aba ' + ABA_AGENDAMENTOS + ' detalha linha a linha.\n\n' +
    'Telefone sem lead nao e erro: e paciente que agendou sem passar pelo ' +
    'site. Esse numero mede quanto da demanda o site nao explica.'
  );
}
