<title>Leads do WhatsApp Total Quality</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* Resumo em tiles, barra de filtro fixa, tabela densa. Verde-petróleo da clínica
   sobre neutros levemente esverdeados; âmbar e ardósia como cores de estado. */
:root{
  --fundo:#f5f7f6; --papel:#ffffff; --tinta:#13201d; --tinta-fraca:#5a6d68;
  --borda:#e0e6e4; --borda-forte:#c8d3d0;
  --acento:#0d5247; --acento-fundo:#e6f1ee;
  --ok:#0a6340; --ok-fundo:#e2f3ea;
  --alerta:#7d5100; --alerta-fundo:#fcefd9;
  --neutro:#4f5a63; --neutro-fundo:#eaedef;
  --ui:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  --dados:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
}
@media (prefers-color-scheme:dark){ :root:not([data-theme="light"]){
  --fundo:#0f1513; --papel:#19211f; --tinta:#e9efed; --tinta-fraca:#9bafaa;
  --borda:#26302d; --borda-forte:#36433f;
  --acento:#73d2bd; --acento-fundo:#15302b;
  --ok:#74d3a4; --ok-fundo:#14301f;
  --alerta:#e4bf79; --alerta-fundo:#2f2715;
  --neutro:#a9b5bd; --neutro-fundo:#222a2e;
  color-scheme:dark;
}}
:root[data-theme="dark"]{
  --fundo:#0f1513; --papel:#19211f; --tinta:#e9efed; --tinta-fraca:#9bafaa;
  --borda:#26302d; --borda-forte:#36433f;
  --acento:#73d2bd; --acento-fundo:#15302b;
  --ok:#74d3a4; --ok-fundo:#14301f;
  --alerta:#e4bf79; --alerta-fundo:#2f2715;
  --neutro:#a9b5bd; --neutro-fundo:#222a2e;
  color-scheme:dark;
}
*{box-sizing:border-box}
body{margin:0;background:var(--fundo);color:var(--tinta);font-family:var(--ui);
     font-size:15px;line-height:1.5;-webkit-text-size-adjust:100%}
.pag{max-width:1200px;margin:0 auto;padding-inline:18px;padding-block:30px 64px}
header h1{font-size:clamp(23px,4vw,30px);font-weight:700;letter-spacing:-.022em;
          margin:0 0 5px;text-wrap:balance}
.linha-sub{color:var(--tinta-fraca);font-size:13.5px;margin:0 0 7px}
.achado{font-size:14.5px;margin:0 0 26px;color:var(--tinta)}
.achado b{color:var(--acento)}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:11px;margin-bottom:24px}
.tile{background:var(--papel);border:1px solid var(--borda);border-radius:11px;padding:13px 15px;min-width:0}
.tile .v{font-family:var(--dados);font-size:25px;font-weight:500;letter-spacing:-.02em;
         font-variant-numeric:tabular-nums;line-height:1.15}
.tile .l{font-size:11px;color:var(--tinta-fraca);text-transform:uppercase;
         letter-spacing:.075em;margin-top:3px;font-weight:600}
.tile.destaque{border-color:var(--borda-forte)}
.rotulo{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--tinta-fraca);
        font-weight:700;margin:4px 0 10px}
.tile.clicavel{cursor:pointer;text-align:left;font-family:inherit;width:100%}
.tile.clicavel[aria-pressed="true"]{border-color:var(--acento);background:var(--acento-fundo)}
.filtros{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;
         background:var(--fundo);padding-block:11px;margin-bottom:4px;
         border-bottom:1px solid var(--borda)}
.campos{display:flex;gap:9px;flex-wrap:wrap;align-items:center}
label.cx{display:flex;flex-direction:column;gap:3px;min-width:0;align-self:flex-end}
label.cx span{font-size:10.5px;text-transform:uppercase;letter-spacing:.07em;
              color:var(--tinta-fraca);font-weight:600}
input[type=search],select{font-family:var(--ui);font-size:14px;padding:8px 11px;
  border:1px solid var(--borda-forte);border-radius:8px;background:var(--papel);
  color:var(--tinta);min-width:0;max-width:100%}
input[type=search]{width:100%}
select{min-width:190px}
:focus-visible{outline:2px solid var(--acento);outline-offset:2px}
.acoes{display:flex;gap:8px;align-items:flex-end;margin-left:auto}
button{font-family:var(--ui);font-size:13.5px;font-weight:600;cursor:pointer;
  border-radius:8px;padding:9px 14px;border:1px solid var(--borda-forte);
  background:var(--papel);color:var(--tinta)}
button.principal{background:var(--acento);border-color:var(--acento);color:var(--papel)}
:root[data-theme="dark"] button.principal,
:root:not([data-theme="light"]) button.principal{color:#0f1513}
@media (prefers-color-scheme:light){:root:not([data-theme="dark"]) button.principal{color:#fff}}
.marcar{display:flex;align-items:center;gap:7px;align-self:flex-end;font-size:13.5px;color:var(--tinta);
        border:1px solid var(--borda-forte);border-radius:8px;padding:8px 11px;
        background:var(--papel);cursor:pointer;white-space:nowrap}
.marcar input{accent-color:var(--acento);margin:0}
.conta{font-size:13px;color:var(--tinta-fraca);margin:13px 0 11px;
       font-variant-numeric:tabular-nums}
.quadro{background:var(--papel);border:1px solid var(--borda);border-radius:11px;overflow-x:auto}
table{border-collapse:collapse;width:100%;min-width:800px}
th,td{text-align:left;padding:11px 15px;border-bottom:1px solid var(--borda);vertical-align:top}
th{font-size:10.5px;text-transform:uppercase;letter-spacing:.07em;color:var(--tinta-fraca);
   font-weight:700;cursor:pointer;white-space:nowrap;background:var(--papel);user-select:none}
th i{font-style:normal;opacity:.4;font-size:9px;margin-left:3px}
th[aria-sort] i{opacity:1;color:var(--acento)}
tbody tr:last-child td{border-bottom:none}
tbody tr:hover{background:var(--acento-fundo)}
td.nome{font-weight:600;min-width:150px}
td.fone,td.data{font-family:var(--dados);font-size:13px;white-space:nowrap;
                font-variant-numeric:tabular-nums}
td.fone{color:var(--tinta-fraca)}
td.exame{max-width:330px}
td.etapa{white-space:nowrap;font-weight:600;font-size:13px}
.vazia{color:var(--tinta-fraca);font-weight:400}
.fam{display:block;font-size:11px;color:var(--tinta-fraca);margin-top:2px;
     text-transform:uppercase;letter-spacing:.05em;font-weight:600}
.tag{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;
     font-weight:600;white-space:nowrap}
.t-ok{background:var(--ok-fundo);color:var(--ok)}
.t-nao{background:var(--alerta-fundo);color:var(--alerta)}
.t-nap{background:var(--neutro-fundo);color:var(--neutro)}
.re{display:inline-block;margin-left:6px;font-size:9.5px;padding:2px 6px;border-radius:4px;
    background:var(--acento-fundo);color:var(--acento);font-weight:700;vertical-align:1.5px;
    letter-spacing:.04em}
.nada{padding:46px 20px;text-align:center;color:var(--tinta-fraca)}
.notas{margin-top:30px;font-size:13.5px;color:var(--tinta-fraca);line-height:1.68}
.notas h2{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--tinta);
          margin:0 0 9px;font-weight:700}
.notas ul{margin:0;padding-left:18px}
.notas li{margin-bottom:7px}
.notas b{color:var(--tinta)}
.aviso{margin-top:22px;border:1px solid var(--borda-forte);border-left:3px solid var(--alerta);
       border-radius:9px;padding:13px 16px;background:var(--papel)}
/* abas */
.abas{display:flex;gap:5px;margin:18px 0 22px;border-bottom:1px solid var(--borda)}
.aba{background:none;border:none;border-bottom:2px solid transparent;border-radius:0;
     padding:9px 14px;font-size:14px;font-weight:600;color:var(--tinta-fraca);cursor:pointer}
.aba[aria-selected="true"]{color:var(--acento);border-bottom-color:var(--acento)}
.aba .n{font-size:11px;color:var(--tinta-fraca);font-weight:500;margin-left:5px;
        font-variant-numeric:tabular-nums}
/* funil da cadencia */
.funil{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:11px;margin-bottom:8px}
.etapa-card{background:var(--papel);border:1px solid var(--borda);border-radius:11px;padding:13px 15px;
            cursor:pointer;text-align:left;font-family:inherit}
.etapa-card[aria-pressed="true"]{border-color:var(--acento);background:var(--acento-fundo)}
.etapa-card .v{font-family:var(--dados);font-size:23px;font-weight:500;
               font-variant-numeric:tabular-nums;line-height:1.15}
.etapa-card .l{font-size:11px;color:var(--tinta-fraca);text-transform:uppercase;
               letter-spacing:.07em;margin-top:3px;font-weight:600}
.ritmo{font-size:13.5px;color:var(--tinta-fraca);margin:14px 0 20px;line-height:1.6}
.ritmo b{color:var(--tinta)}
.pino{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;
      background:var(--acento-fundo);color:var(--acento);white-space:nowrap}
.pino.fora{background:var(--neutro-fundo);color:var(--neutro)}
/* situacao da conversa */
.c-ag{background:var(--ok-fundo);color:var(--ok)}
.c-esc{background:var(--alerta-fundo);color:var(--alerta)}
.c-bot{background:var(--alerta-fundo);color:var(--alerta)}
.c-cli{background:var(--acento-fundo);color:var(--acento)}
.c-pac{background:var(--neutro-fundo);color:var(--neutro)}
.c-par{background:var(--neutro-fundo);color:var(--neutro)}
.c-opt{background:var(--neutro-fundo);color:var(--neutro)}
td.conversa{white-space:nowrap}
td.conversa .det{display:block;font-size:11px;color:var(--tinta-fraca);margin-top:3px;
                 white-space:normal;max-width:190px}
/* gaveta com o historico */
tr.linha{cursor:pointer}
tr.linha[aria-expanded="true"]{background:var(--acento-fundo)}
td.abrir{width:30px;padding-right:0}
.caret{background:none;border:none;padding:2px 4px;color:var(--tinta-fraca);
       font-size:12px;line-height:1;cursor:pointer;border-radius:5px}
tr.linha[aria-expanded="true"] .caret{color:var(--acento);transform:rotate(90deg)}
.caret{display:inline-block;transition:transform .12s ease}
tr.gaveta>td{background:var(--fundo);padding:0}
.gav{position:sticky;left:0;width:min(1136px,calc(100vw - 38px));
     padding:0 15px 18px 44px}
.conversa-topo{display:flex;flex-wrap:wrap;gap:8px;align-items:center;
               padding:13px 0 11px;font-size:12.5px;color:var(--tinta-fraca)}
.conversa-topo .marca{padding:2px 9px;border-radius:999px;background:var(--neutro-fundo);
                      color:var(--neutro);font-weight:600;font-size:11.5px}
.conversa-topo .espaco{margin-left:auto}
.resumo{font-size:13px;color:var(--tinta-fraca);border-left:2px solid var(--borda-forte);
        padding:2px 0 2px 11px;margin:0 0 13px;max-width:70ch}
.fio{display:flex;flex-direction:column;gap:7px;max-width:760px}
.dia{align-self:center;font-size:10.5px;text-transform:uppercase;letter-spacing:.07em;
     color:var(--tinta-fraca);font-weight:700;margin:9px 0 3px;font-family:var(--dados)}
.bolha{max-width:78%;padding:8px 12px;border-radius:13px;font-size:13.5px;line-height:1.52;
       border:1px solid var(--borda);white-space:pre-wrap;overflow-wrap:anywhere}
.bolha .cab{display:flex;gap:14px;align-items:baseline;margin-bottom:3px}
.bolha .q{font-size:10px;text-transform:uppercase;letter-spacing:.07em;
          font-weight:700;opacity:.75;white-space:nowrap}
.bolha .h{font-family:var(--dados);font-size:10.5px;color:var(--tinta-fraca);
          margin-left:auto;white-space:nowrap}
.b-p{align-self:flex-start;background:var(--papel);border-bottom-left-radius:4px}
.b-a{align-self:flex-end;background:var(--acento-fundo);border-color:transparent;
     border-bottom-right-radius:4px}
.b-a .q{color:var(--acento)}
.b-h{align-self:flex-end;background:var(--alerta-fundo);border-color:transparent;
     border-bottom-right-radius:4px}
.b-h .q{color:var(--alerta)}
.anexo{display:inline-block;margin-right:6px;font-size:10px;font-weight:700;
       letter-spacing:.05em;text-transform:uppercase;color:var(--tinta-fraca)}
.sem-fio{font-size:13.5px;color:var(--tinta-fraca);padding:13px 0}
@media (max-width:560px){
  .acoes{margin-left:0;width:100%} .acoes button{flex:1}
  .gav{padding-left:15px;width:calc(100vw - 38px)} .bolha{max-width:92%}
}
@media (prefers-reduced-motion:reduce){ *{transition:none!important;animation:none!important} }
</style>

<div class="pag">
<header>
  <h1>Leads do WhatsApp</h1>
  <p class="linha-sub">Total Quality Medicina Diagnóstica · conversas de __PERIODO__ · gerado em __HOJE__</p>
  <p class="achado">De quem disse qual exame queria e não agendou, o maior grupo é
     <b>__DESTAQUE_NOME__</b>, com <b>__DESTAQUE_N__ pacientes</b>.</p>
</header>

<div class="abas" role="tablist">
  <button class="aba" role="tab" id="t-leads" aria-selected="true" aria-controls="aba-leads">Leads<span class="n">__TOT__</span></button>
  <button class="aba" role="tab" id="t-fu" aria-selected="false" aria-controls="aba-fu">Follow-up<span class="n">__FU_TOT__</span></button>
</div>

<section id="aba-leads" role="tabpanel" aria-labelledby="t-leads">
<div class="tiles">
  <div class="tile"><div class="v">__TOT__</div><div class="l">Leads</div></div>
  <div class="tile"><div class="v" style="color:var(--ok)">__AG__</div><div class="l">Agendou</div></div>
  <div class="tile destaque"><div class="v" style="color:var(--alerta)">__NA__</div><div class="l">Não agendou</div></div>
  <div class="tile"><div class="v" style="color:var(--neutro)">__NAP__</div><div class="l">Não aplica</div></div>
  <div class="tile"><div class="v">__CONV__%</div><div class="l">Conversão</div></div>
</div>

<h2 class="rotulo">Situação da conversa agora</h2>
<div class="tiles" id="tiles-conversa">__TILES_CONVERSA__</div>

<div class="filtros">
  <div class="campos">
    <label class="cx" style="flex:1 1 230px">
      <span>Buscar</span>
      <input type="search" id="busca" placeholder="Nome, telefone ou exame…" autocomplete="off">
    </label>
    <label class="cx">
      <span>Status</span>
      <select id="fstatus">
        <option value="">Todos os status</option>
        <option value="Agendou">Agendou</option>
        <option value="Não Agendou">Não agendou</option>
        <option value="Não Aplica">Não aplica</option>
        <option value="Encerrado">Encerrado</option>
      </select>
    </label>
    <label class="cx">
      <span>Situação da conversa</span>
      <select id="fconversa">
        <option value="">Todas as situações</option>
__CONVERSAS__
      </select>
    </label>
    <label class="cx">
      <span>Exame procurado</span>
      <select id="fexame">
        <option value="">Todos os exames</option>
__OPCOES__
      </select>
    </label>
    <label class="cx">
      <span>Etapa do follow-up</span>
      <select id="fetapa">
        <option value="">Todas as etapas</option>
__ETAPAS__
      </select>
    </label>
    <label class="marcar" title="Procura também no texto das mensagens, não só no cadastro">
      <input type="checkbox" id="dentro"> buscar dentro das conversas</label>
    <div class="acoes">
      <button type="button" id="limpar">Limpar</button>
      __BOTAO__
    </div>
  </div>
</div>

<p class="conta" id="conta"></p>

<div class="quadro">
  <table>
    <thead><tr>
      <th aria-label="Abrir conversa"></th>
      <th data-s="n" tabindex="0">Nome do lead<i>↕</i></th>
      <th data-s="t" tabindex="0">WhatsApp<i>↕</i></th>
      <th data-s="e" tabindex="0">Exame procurado<i>↕</i></th>
      <th data-s="s" tabindex="0">Status<i>↕</i></th>
      <th data-s="c" tabindex="0">Conversa<i>↕</i></th>
      <th data-s="et" tabindex="0">Etapa<i>↕</i></th>
      <th data-s="d" tabindex="0" aria-sort="descending">Data do contato<i>↓</i></th>
      <th data-s="u" tabindex="0">Última mensagem<i>↕</i></th>
    </tr></thead>
    <tbody id="corpo"></tbody>
  </table>
  <div class="nada" id="nada" hidden>Nenhum lead com esses filtros.</div>
</div>

</section>

<section id="aba-fu" role="tabpanel" aria-labelledby="t-fu" hidden>
  <div class="funil">
    <button class="etapa-card" data-et="" aria-pressed="true"><div class="v">__FU_TOT__</div><div class="l">Na régua</div></button>
    <button class="etapa-card" data-et="Dia 1"><div class="v">__FU_D1__</div><div class="l">Dia 1</div></button>
    <button class="etapa-card" data-et="Dia 3"><div class="v">__FU_D3__</div><div class="l">Dia 3</div></button>
    <button class="etapa-card" data-et="Dia 7"><div class="v">__FU_D7__</div><div class="l">Dia 7</div></button>
    <button class="etapa-card" data-et="Dia 14"><div class="v">__FU_D14__</div><div class="l">Dia 14</div></button>
    <button class="etapa-card" data-et="Dia 30"><div class="v">__FU_D30__</div><div class="l">Dia 30</div></button>
  </div>
  <p class="ritmo">
    <b>__FU_FILA__</b> aguardam o próximo toque. No teto de <b>20 mensagens por dia útil</b>,
    a fila leva cerca de <b>__FU_DIAS__ dias úteis</b> para ser percorrida.
    A régua manda sozinha, de segunda a sexta, das 8h às 17h30, com intervalo sorteado entre as mensagens
    e no máximo uma por paciente por dia.
  </p>
  <div class="barra" style="margin-bottom:14px">
    <input type="search" id="busca-fu" placeholder="Buscar por nome, telefone ou exame…" autocomplete="off"
           style="flex:1 1 260px;padding:8px 11px;border:1px solid var(--borda-forte);border-radius:8px;background:var(--papel);color:var(--tinta);font-size:14px">
  </div>
  <p class="conta" id="conta-fu"></p>
  <div class="quadro">
    <table>
      <thead><tr>
        <th>Nome do lead</th><th>WhatsApp</th><th>Exame procurado</th>
        <th>Etapa</th><th>Na fila</th><th>Última mensagem</th>
      </tr></thead>
      <tbody id="corpo-fu"></tbody>
    </table>
    <div class="nada" id="nada-fu" hidden>Nenhum lead nessa etapa.</div>
  </div>
</section>

<div class="notas">
  <h2>Como ler</h2>
  <ul>
    <li><b>Data do contato</b> é o dia em que começou a última rodada de conversa, não o primeiro contato histórico. Quem falou com a clínica em janeiro e voltou em setembro aparece com a data de setembro. Rodadas separadas por mais de 30 dias contam como contatos diferentes; a marca <span class="re">REC</span> indica quem já havia conversado antes — são __REC__ no total.</li>
    <li>A aba <b>Follow-up</b> mostra só quem está na régua: os cards são as etapas, e clicar num deles filtra a lista. <i>Na fila</i> quer dizer que o lead aguarda o próximo toque; quem está fora da fila já encerrou a régua ou foi retirado dela (agendou, pediu para parar, ou passou para a equipe).</li>
    <li><b>Etapa do follow-up</b> é o último toque da cadência que a Ana já enviou: <i>Dia 1</i>, <i>Dia 3</i>, <i>Dia 7</i>, <i>Dia 14</i> e <i>Dia 30</i>, nessa ordem. Quem aparece como <i>Sem follow-up</i> ainda não entrou na régua — ou porque agendou, ou porque a conversa não parou num orçamento em aberto. Depois do Dia 30 a cadência encerra sozinha.</li>
    <li>Clicar numa linha abre o <b>histórico da conversa</b>: todas as mensagens trocadas, na ordem, com o horário e quem falou — <i>Paciente</i>, <i>Ana</i> (o atendimento automático) e <i>Recepção</i> (alguém da equipe respondendo pelo mesmo WhatsApp). O botão <i>Copiar conversa</i> leva o diálogo inteiro para a área de transferência. A caixa <i>dentro das conversas</i> faz a busca procurar também no texto das mensagens, não só no cadastro.</li>
    <li><b>Situação da conversa</b> é o estado de hoje, diferente do <i>Status</i>, que é o desfecho comercial.
      <i>Agendada</i>: agendamento confirmado.
      <i>Escalada</i>: passou para a equipe e segue aberta.
      <i>Bot pausado</i>: alguém da recepção assumiu e não devolveu a conversa para a Ana — a rotina automática devolve sozinha em 24h (48h nas escaladas).
      <i>Aguardando a clínica</i>: o paciente falou por último e ninguém respondeu.
      <i>Aguardando o paciente</i>: a clínica falou por último, há menos de 7 dias.
      <i>Parada</i>: sem nenhuma mensagem há mais de 7 dias.
      <i>Opt-out</i>: pediu para não receber mais mensagens — não entra em disparo nenhum.</li>
    <li><b>Agendou</b> significa agendamento confirmado na Agenda do Google. Exame marcado e cancelado depois aparece como <i>Não agendou</i>.</li>
    <li><b>Não aplica</b> é o paciente que procurou exame que a clínica não realiza: ressonância, densitometria, mamografia (suspensa durante a troca do aparelho), colonoscopia, endoscopia, eletroneuromiografia, teste ergométrico, cintilografia e PET, cateterismo, ecocardiograma, vacinas, testes neonatais e consulta com especialista.</li>
    <li>O <b>exame procurado</b> vem do que a Ana registrou na conversa; a linha menor abaixo dele é a família usada no filtro. Em <i>(não informado)</i> o paciente não chegou a dizer o que queria — são 643 dos __TOT__, metade da base.</li>
    <li>Estão aqui os <b>__TOT__ leads que conversaram pelo WhatsApp</b>. Agendamentos lançados direto na Agenda do Google pela recepção, sem conversa, ficam de fora.</li>
  </ul>
  <div class="aviso">
    <h2>Dado de paciente</h2>
    <p style="margin:0">Esta página traz nome, telefone, exame e <b>o teor das conversas</b> de pacientes identificáveis — é dado pessoal sensível pela LGPD. Compartilhe o link apenas com quem precisa trabalhar a lista, e trate-o como se fosse o próprio prontuário.</p>
  </div>
</div>
</div>

<script>
const DADOS = __DADOS__;
const HIST = __HIST__;
const PODE_BAIXAR = __BAIXAR__;
const corpo = document.getElementById('corpo'), nada = document.getElementById('nada'),
      conta = document.getElementById('conta');
let termo = '', fStatus = '', fExame = '', fEtapa = '', fConversa = '',
    ordem = {c:'d', asc:false};
const CLS = {'Agendou':'t-ok','Não Agendou':'t-nao','Não Aplica':'t-nap',
             'Encerrado':'t-nap'};
// situacao da conversa -> classe da etiqueta
const CLSC = {'Agendada':'c-ag','Escalada':'c-esc','Bot pausado':'c-bot',
  'Aguardando a clínica':'c-cli','Aguardando o paciente':'c-pac',
  'Parada':'c-par','Opt-out':'c-opt'};
// quem falou -> rotulo e classe da bolha
const QUEM = {p:['Paciente','b-p'], a:['Ana','b-a'], h:['Recepção','b-h']};
const abertas = new Set();
let buscaFundo = false;
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dnum = s => { const p = s.split('/'); return p[2]+p[1]+p[0]; };

function resumeExame(txt){
  const ps = String(txt).split('; ');
  if (ps.length <= 3) return esc(txt);
  return esc(ps.slice(0,3).join('; ')) +
    ` <span style="color:var(--tinta-fraca)">+${ps.length-3} exame${ps.length-3>1?'s':''}</span>`;
}
function visiveis(){
  return DADOS.filter(r =>
      (!fStatus || r.s === fStatus) &&
      (!fExame  || r.f === fExame)  &&
      (!fEtapa  || r.et === fEtapa) &&
      (!fConversa || r.c === fConversa) &&
      (!termo   || (r.n+' '+r.t+' '+r.tr+' '+r.e+' '+r.f+' '+r.et+' '+r.c).toLowerCase().includes(termo)
                || (buscaFundo && (HIST[r.tr] || []).some(m => m[3].toLowerCase().includes(termo))))
    ).sort((a,b) => {
      const c = ordem.c;
      let x = a[c], y = b[c];
      if (c === 'd' || c === 'u'){ x = dnum(x); y = dnum(y); }
      else { x = String(x).toLowerCase(); y = String(y).toLowerCase(); }
      return (x < y ? -1 : x > y ? 1 : 0) * (ordem.asc ? 1 : -1);
    });
}
// uma bolha por mensagem, com separador quando vira o dia
function fio(fone){
  const ms = HIST[fone] || [];
  if (!ms.length) return '<p class="sem-fio">Sem mensagens guardadas para este contato.</p>';
  let dia = '', html = '<div class="fio">';
  for (const [ts, quem, tipo, txt] of ms){
    const d = ts.slice(0, 10);
    if (d !== dia){ dia = d; html += `<div class="dia">${esc(d)}</div>`; }
    const [rotulo, cls] = QUEM[quem] || QUEM.a;
    html += `<div class="bolha ${cls}"><div class="cab">` +
            `<span class="q">${rotulo}</span><span class="h">${esc(ts.slice(11))}</span></div>` +
            (tipo ? `<span class="anexo">[${esc(tipo)}]</span>` : '') +
            esc(txt) + '</div>';
  }
  return html + '</div>';
}
function gaveta(r){
  const marcas = [
    r.nm ? `${r.nm} ${r.nm > 1 ? 'mensagens' : 'mensagem'}` : '',
    r.dias === null ? '' : (r.dias === 0 ? 'hoje' : `${r.dias} dia${r.dias > 1 ? 's' : ''} sem falar`),
    r.tmp ? `temperatura ${r.tmp}` : '',
    r.fun ? `funil ${r.fun}` : '',
    r.conv && r.conv !== 'particular' ? `convênio ${r.conv}` : '',
  ].filter(Boolean);
  return `<tr class="gaveta"><td colspan="9"><div class="gav">
    <div class="conversa-topo">
      ${marcas.map(m => `<span class="marca">${esc(m)}</span>`).join('')}
      <button type="button" class="copiar espaco" data-f="${esc(r.tr)}">Copiar conversa</button>
    </div>
    ${r.res ? `<p class="resumo">${esc(r.res)}</p>` : ''}
    ${fio(r.tr)}</div></td></tr>`;
}
function pinta(){
  const rs = visiveis();
  corpo.innerHTML = rs.map(r => {
    const ab = abertas.has(r.tr);
    return `<tr class="linha" data-f="${esc(r.tr)}" aria-expanded="${ab}">
    <td class="abrir"><button type="button" class="caret" tabindex="-1" aria-hidden="true">▶</button></td>
    <td class="nome">${esc(r.n)}${r.r ? '<span class="re">REC</span>' : ''}</td>
    <td class="fone">${esc(r.t)}</td>
    <td class="exame">${resumeExame(r.e)}<span class="fam">${esc(r.f)}</span></td>
    <td><span class="tag ${CLS[r.s]}">${esc(r.s)}</span></td>
    <td class="conversa"><span class="tag ${CLSC[r.c] || 'c-par'}">${esc(r.c)}</span>${
      r.det ? `<span class="det">${esc(r.det)}</span>` : ''}</td>
    <td class="etapa">${r.et === 'Sem follow-up' ? '<span class="vazia">—</span>' : esc(r.et)}</td>
    <td class="data">${esc(r.d)}</td>
    <td class="data">${esc(r.u)}</td></tr>` + (ab ? gaveta(r) : '');
  }).join('');
  nada.hidden = rs.length > 0;
  conta.textContent = rs.length === DADOS.length
    ? `${rs.length} leads` : `${rs.length} de ${DADOS.length} leads`;
  document.querySelectorAll('th[data-s]').forEach(th => {
    const atual = th.dataset.s === ordem.c;
    th.querySelector('i').textContent = atual ? (ordem.asc ? '↑' : '↓') : '↕';
    if (atual) th.setAttribute('aria-sort', ordem.asc ? 'ascending' : 'descending');
    else th.removeAttribute('aria-sort');
  });
}
corpo.addEventListener('click', e => {
  const copiar = e.target.closest('.copiar');
  if (copiar){
    const ms = HIST[copiar.dataset.f] || [];
    const txt = ms.map(([ts, quem, tipo, t]) =>
      `[${ts}] ${(QUEM[quem] || QUEM.a)[0]}: ${tipo ? '(' + tipo + ') ' : ''}${t}`).join('\n');
    const antes = copiar.textContent;
    navigator.clipboard.writeText(txt)
      .then(() => copiar.textContent = `${ms.length} mensagens copiadas`)
      .catch(() => copiar.textContent = 'Não consegui copiar');
    setTimeout(() => copiar.textContent = antes, 1800);
    return;
  }
  const tr = e.target.closest('tr.linha');
  if (!tr) return;
  const f = tr.dataset.f;
  abertas.has(f) ? abertas.delete(f) : abertas.add(f);
  pinta();
});
corpo.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const tr = e.target.closest('tr.linha');
  if (!tr || e.target.closest('.copiar')) return;
  e.preventDefault();
  const f = tr.dataset.f;
  abertas.has(f) ? abertas.delete(f) : abertas.add(f);
  pinta();
});
document.getElementById('fconversa').addEventListener('change', e => {
  fConversa = e.target.value; sincronizaTiles(); pinta();
});
function sincronizaTiles(){
  document.querySelectorAll('#tiles-conversa .tile.clicavel').forEach(b =>
    b.setAttribute('aria-pressed', b.dataset.c === fConversa));
}
document.querySelectorAll('#tiles-conversa .tile.clicavel').forEach(b =>
  b.addEventListener('click', () => {
    fConversa = b.dataset.c === fConversa ? '' : b.dataset.c;
    document.getElementById('fconversa').value = fConversa;
    sincronizaTiles(); pinta();
  }));
document.getElementById('busca').addEventListener('input', e => {
  termo = e.target.value.trim().toLowerCase(); pinta();
});
document.getElementById('dentro').addEventListener('change', e => {
  buscaFundo = e.target.checked; pinta();
});
document.getElementById('fstatus').addEventListener('change', e => { fStatus = e.target.value; pinta(); });
document.getElementById('fexame').addEventListener('change',  e => { fExame  = e.target.value; pinta(); });
document.getElementById('fetapa').addEventListener('change',  e => { fEtapa  = e.target.value; pinta(); });
document.getElementById('limpar').addEventListener('click', () => {
  termo = fStatus = fExame = fEtapa = fConversa = '';
  document.getElementById('busca').value = '';
  document.getElementById('fstatus').value = '';
  document.getElementById('fexame').value = '';
  document.getElementById('fetapa').value = '';
  document.getElementById('fconversa').value = '';
  buscaFundo = false;
  document.getElementById('dentro').checked = false;
  sincronizaTiles();
  pinta();
});
function ordenarPor(c){ ordem = {c, asc: ordem.c === c ? !ordem.asc : true}; pinta(); }
document.querySelectorAll('th[data-s]').forEach(th => {
  th.addEventListener('click', () => ordenarPor(th.dataset.s));
  th.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); ordenarPor(th.dataset.s); }
  });
});
const linhasTexto = () => {
  const L = [['Nome','WhatsApp','Exame','Familia','Status','Situacao da conversa',
              'Detalhe da situacao','Mensagens','Dias sem falar','Etapa do follow-up',
              'Data do contato','Ultima mensagem','Recontato']];
  visiveis().forEach(r => L.push([r.n, r.tr, r.e, r.f, r.s, r.c, r.det, r.nm,
                                  r.dias === null ? '' : r.dias,
                                  r.et, r.d, r.u, r.r ? 'sim' : 'nao']));
  return L;
};
const btn = document.getElementById('exportar');
if (btn){
  btn.addEventListener('click', async () => {
    const L = linhasTexto();
    if (PODE_BAIXAR){
      const asp = s => '"' + String(s).replace(/"/g,'""') + '"';
      const blob = new Blob(['﻿' + L.map(l => l.map(asp).join(';')).join('\r\n')],
                            {type:'text/csv;charset=utf-8'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'leads-whatsapp-total-quality.csv';
      a.click(); URL.revokeObjectURL(a.href);
      return;
    }
    const txt = L.map(l => l.join('\t')).join('\n');
    const avisa = m => { const o = btn.textContent; btn.textContent = m;
                         setTimeout(() => btn.textContent = o, 1800); };
    try { await navigator.clipboard.writeText(txt); avisa(`${L.length-1} linhas copiadas`); }
    catch { avisa('Não consegui copiar'); }
  });
}

// ───────────── aba Follow-up ─────────────
const NA_REGUA = DADOS.filter(r => r.fila || r.et !== 'Sem follow-up');
const corpoFu = document.getElementById('corpo-fu');
const nadaFu  = document.getElementById('nada-fu');
const contaFu = document.getElementById('conta-fu');
let fuEtapa = '', fuTermo = '';

function visiveisFu(){
  return NA_REGUA.filter(r =>
    (!fuEtapa || r.et === fuEtapa) &&
    (!fuTermo || (r.n+' '+r.t+' '+r.tr+' '+r.e).toLowerCase().includes(fuTermo))
  );
}
function pintaFu(){
  const rs = visiveisFu();
  corpoFu.innerHTML = rs.map(r => `<tr>
    <td class="nome">${esc(r.n)}</td>
    <td class="fone">${esc(r.t)}</td>
    <td class="exame">${resumeExame(r.e)}</td>
    <td class="etapa">${r.et === 'Sem follow-up' ? '<span class="vazia">ainda não</span>' : esc(r.et)}</td>
    <td><span class="pino ${r.fila ? '' : 'fora'}">${r.fila ? 'na fila' : 'fora'}</span></td>
    <td class="data">${esc(r.u)}</td></tr>`).join('');
  nadaFu.hidden = rs.length > 0;
  contaFu.textContent = rs.length === NA_REGUA.length
    ? `${rs.length} leads na régua` : `${rs.length} de ${NA_REGUA.length} leads na régua`;
}
document.getElementById('busca-fu').addEventListener('input', e => {
  fuTermo = e.target.value.trim().toLowerCase(); pintaFu();
});
document.querySelectorAll('.etapa-card').forEach(b => b.addEventListener('click', () => {
  fuEtapa = b.dataset.et;
  document.querySelectorAll('.etapa-card').forEach(o => o.setAttribute('aria-pressed', o === b));
  pintaFu();
}));

// troca de abas
const abas = { 't-leads': 'aba-leads', 't-fu': 'aba-fu' };
Object.keys(abas).forEach(id => {
  document.getElementById(id).addEventListener('click', () => {
    Object.entries(abas).forEach(([t, painel]) => {
      const ativa = t === id;
      document.getElementById(t).setAttribute('aria-selected', ativa);
      document.getElementById(painel).hidden = !ativa;
    });
  });
});

sincronizaTiles();
pinta();
pintaFu();
</script>
