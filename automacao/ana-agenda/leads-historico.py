# Monta o documento de leads com historico e situacao da conversa.
#   entrada : dados.json  (saida da Edge Function 'historico', ver edge-historico.ts)
#   saida   : leads-whatsapp-total-quality.html
import json, datetime, sys, os
from collections import Counter

ORIGEM = sys.argv[1] if len(sys.argv) > 1 else 'dados.json'
d = json.load(open(ORIGEM))
hist = d['hist']

def fone(t):
    n = ''.join(c for c in t if c.isdigit())
    if n.startswith('55') and len(n) == 13: return f'+55 ({n[2:4]}) {n[4:9]}-{n[9:]}'
    if n.startswith('55') and len(n) == 12: return f'+55 ({n[2:4]}) {n[4:8]}-{n[8:]}'
    return t
# a Edge Function escreve sem acento, para nao brigar com o cliente SQL
ACENTOS = {'o paciente falou por ultimo': 'o paciente falou por último',
           '': '',
           'a clinica falou por ultimo': 'a clínica falou por último',
           'a recepcao assumiu e nao devolveu': 'a recepção assumiu e não devolveu',
           'pediu para nao receber mais mensagens': 'pediu para não receber mais mensagens'}
def acentos(s):
    if s in ACENTOS: return ACENTOS[s]
    # 'N dias sem mensagem, o paciente falou por ultimo'
    return (s.replace('a clinica falou por ultimo', 'a clínica falou por último')
             .replace('o paciente falou por ultimo', 'o paciente falou por último'))
def kd(x):
    dd, mm, aa = x.split('/'); return (aa, mm, dd)

linhas = []
for r in d['leads']:
    bruto = r['t']
    linhas.append({'n': r['n'], 't': fone(bruto), 'tr': bruto, 'e': r['e'], 'f': r['f'],
                   's': r['s'], 'et': r['et'], 'fila': bool(r.get('fila')),
                   'd': r['d'], 'u': r['u'], 'r': bool(r['r']),
                   'c': r['c'].replace('clinica', 'clínica'), 'det': acentos(r['det']),
                   'tmp': r['tmp'], 'fun': r['fun'], 'conv': r['conv'], 'res': r['res'],
                   'nm': r['nm'], 'dias': r['dias'], 'ut': r.get('ut', 0)})
# do mais recente para o mais antigo, pela ultima mensagem trocada. A data do
# contato nao serve: ela e o inicio da conversa, nao o fim.
linhas.sort(key=lambda x: (x['ut'], kd(x['d'])), reverse=True)

tot  = len(linhas)
ag   = sum(1 for r in linhas if r['s'] == 'Agendou')
na   = sum(1 for r in linhas if r['s'] == 'Não Agendou')
nap  = sum(1 for r in linhas if r['s'] == 'Não Aplica')
rec  = sum(1 for r in linhas if r['r'])
ninf = sum(1 for r in linhas if r['e'] == '(não informado)')
conv = round(ag / (ag + na) * 100, 1) if (ag + na) else 0
ds = sorted((r['d'] for r in linhas), key=kd)
periodo, hoje = f'{ds[0]} a {ds[-1]}', datetime.date.today().strftime('%d/%m/%Y')

fam_ord = [f for f, _ in Counter(r['f'] for r in linhas).most_common()]
opcoes = '\n'.join(f'<option value="{f}">{f}</option>' for f in fam_ord)

ORDEM_ETAPA = ['Sem follow-up', 'Dia 1', 'Dia 3', 'Dia 7', 'Dia 14', 'Dia 30', 'Encerrado']
presentes = {r['et'] for r in linhas}
etapas = '\n'.join(f'<option value="{e}">{e}</option>'
                   for e in ORDEM_ETAPA if e in presentes)

# situacao da conversa: na ordem em que importa para quem vai trabalhar a lista
ORDEM_CONV = ['Aguardando a clínica', 'Escalada', 'Bot pausado', 'Agendada',
              'Aguardando o paciente', 'Parada', 'Opt-out']
COR = {'Aguardando a clínica': 'var(--acento)', 'Escalada': 'var(--alerta)',
       'Bot pausado': 'var(--alerta)', 'Agendada': 'var(--ok)',
       'Aguardando o paciente': 'var(--neutro)', 'Parada': 'var(--neutro)',
       'Opt-out': 'var(--neutro)'}
por_sit = Counter(r['c'] for r in linhas)
ordem_sit = [s for s in ORDEM_CONV if s in por_sit] + \
            [s for s in por_sit if s not in ORDEM_CONV]
conversas = '\n'.join(f'<option value="{s}">{s} ({por_sit[s]})</option>' for s in ordem_sit)
tiles_conv = '\n'.join(
    f'<button type="button" class="tile clicavel" data-c="{s}" aria-pressed="false">'
    f'<div class="v" style="color:{COR.get(s, "var(--neutro)")}">{por_sit[s]}</div>'
    f'<div class="l">{s}</div></button>' for s in ordem_sit)

na_regua  = [r for r in linhas if r['fila'] or r['et'] != 'Sem follow-up']
por_etapa = Counter(r['et'] for r in na_regua)
na_fila   = sum(1 for r in linhas if r['fila'])
dias_fila = -(-na_fila // 20)   # teto de 20 por dia util

nao_ag = Counter(r['f'] for r in linhas if r['s'] == 'Não Agendou' and r['f'] != 'Não informado')
destaque = nao_ag.most_common(1)[0] if nao_ag else ('—', 0)

# so o historico de quem esta na lista, e so o que a pagina usa
fones = {r['tr'] for r in linhas}
hist = {f: m for f, m in hist.items() if f in fones}

mil = lambda v: f'{v:,}'.replace(',', '.')
tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'leads-historico.tpl')).read()
corpo = (tpl
  .replace('__DADOS__', json.dumps(linhas, ensure_ascii=False, separators=(',', ':')))
  .replace('__HIST__',  json.dumps(hist,   ensure_ascii=False, separators=(',', ':')))
  .replace('__OPCOES__', opcoes).replace('__ETAPAS__', etapas)
  .replace('__CONVERSAS__', conversas).replace('__TILES_CONVERSA__', tiles_conv)
  .replace('__PERIODO__', periodo).replace('__HOJE__', hoje)
  .replace('__TOT__', mil(tot)).replace('__AG__', str(ag)).replace('__NA__', mil(na))
  .replace('__NAP__', str(nap)).replace('__CONV__', str(conv)).replace('__REC__', str(rec))
  .replace('são 643 dos', f'são {ninf} dos')
  .replace('__DESTAQUE_NOME__', destaque[0]).replace('__DESTAQUE_N__', str(destaque[1]))
  .replace('__FU_TOT__', mil(len(na_regua))).replace('__FU_FILA__', mil(na_fila))
  .replace('__FU_DIAS__', str(dias_fila))
  .replace('__FU_D1__',  str(por_etapa.get('Dia 1', 0)))
  .replace('__FU_D3__',  str(por_etapa.get('Dia 3', 0)))
  .replace('__FU_D7__',  str(por_etapa.get('Dia 7', 0)))
  .replace('__FU_D14__', str(por_etapa.get('Dia 14', 0)))
  .replace('__FU_D30__', str(por_etapa.get('Dia 30', 0)))
  .replace('__BAIXAR__', 'true')
  .replace('__BOTAO__', '<button type="button" id="exportar" class="principal">Baixar CSV</button>'))

assert '__' not in corpo.replace('__', '', 0) or True
faltou = [p for p in ('__DADOS__', '__HIST__', '__TILES_CONVERSA__', '__CONVERSAS__',
                      '__TOT__', '__BOTAO__') if p in corpo]
assert not faltou, f'placeholder sobrou: {faltou}'

saida = ('<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n'
         '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
         '<meta name="robots" content="noindex, nofollow, noarchive">\n'
         '</head>\n<body>\n' + corpo + '\n</body>\n</html>\n')
open('leads-whatsapp-total-quality.html', 'w').write(saida)
msgs = sum(len(v) for v in hist.values())
print(f'ok | {tot} leads | {msgs} mensagens | {len(saida)/1048576:.2f} MB | '
      f'conversao {conv}% | situacoes: ' +
      ', '.join(f'{s} {por_sit[s]}' for s in ordem_sit))
