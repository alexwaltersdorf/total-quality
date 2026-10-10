# Painel "Jornada do paciente no WhatsApp"

Painel com filtro de data, atualizado sozinho todo dia as **00:03 de Brasilia**.

- **Painel (site da clinica):** https://totalquality.med.br/painel/<token>.html
  — sem login, abre em qualquer lugar.
- **Painel (artefato, so para o Alex logado):** https://claude.ai/artifact/MXxhL1qsnesv8AQzK7GRo5
  — **nao funciona**: o artefato bloqueia `fetch` para fora da lista de CDNs
  permitidos, entao ele nao consegue ler o Supabase. Mantido so como historico.
- **Dados:** Edge Function `jornada` do Supabase da clinica, em JSON
- **Fonte da pagina:** `client/public/painel/<token>.html`

## Por que o painel nao mora no Supabase, nem num artefato

### Supabase

A primeira tentativa foi servir o HTML pelo Supabase. **Nao funciona, e nao e bug de
codigo.** O gateway reescreve qualquer resposta `text/html` para `text/plain` e injeta
`content-security-policy: default-src 'none'; sandbox`, que bloquearia o script mesmo
se o content-type passasse. Vale para **Edge Functions e para o Storage** — testei os
dois, os dois devolvem texto cru. Esta na documentacao oficial:

> HTML content is not supported. GET requests that return `text/html` will be
> rewritten to `text/plain`.
> — https://supabase.com/docs/guides/functions/http-methods

E uma protecao do dominio compartilhado `supabase.co` contra phishing.

### Artefato do Claude

Segunda tentativa, tambem furada. A pagina ate renderiza, mas o artefato roda sob uma
CSP que so libera script de uma lista curta de CDNs e **bloqueia `fetch` para qualquer
outro host** — inclusive o Supabase. O painel abria com "Failed to fetch".

Existe a capacidade `mcp`, que deixaria a pagina ler o Supabase pelos conectores do
visitante. Mas ela **proibe compartilhamento publico** e so funciona para quem esta
logado com o conector ligado. Ou seja: artefato da dado ao vivo OU acesso externo,
nunca os dois.

### Site da clinica

Resolve os dois. `client/public/` e servido na raiz pelo Express, entao o arquivo vira
`https://totalquality.med.br/painel/<token>.html`. Pagina comum, sem CSP restritiva,
`fetch` ao Supabase funciona. Vai ao ar uma vez e nunca mais precisa de deploy: os
dados continuam vindo da Edge Function, atualizados as 00:03.

O arquivo esta em `robots.txt` sob `Disallow: /painel/` e a pagina leva
`noindex, nofollow, noarchive`.

## Como esta montado

```
pg_cron 'ana-jornada-diaria'  03:03 UTC = 00:03 BRT
        |
        v
ana_jornada_atualizar()  ->  ana_jornada_cache (1 linha, ~52 kB de JSON)
        ^                              |
        |                              v
   botao "Atualizar agora"      Edge Function 'jornada'  --(JSON + CORS)-->  artefato
   (&refresh=1)
```

- **`ana_jornada_payload()`** monta o JSON: funil por dia, segundos de cada resposta da
  Ana por dia, demanda por exame indisponivel por dia, follow-up por dia e um bloco
  `hoje` com o estado atual. Leva cerca de 7s.
- **`ana_jornada_cache`** guarda o ultimo resultado, uma linha so.
- **`ana_jornada_atualizar()`** roda o payload e grava no cache.
- **Edge Function `jornada`** devolve o cache em JSON, com CORS liberado porque o
  artefato roda em outra origem. `verify_jwt` desligado: a funcao checa o proprio token.

```
GET /functions/v1/jornada?k=<token>             cache (rapido)
GET /functions/v1/jornada?k=<token>&refresh=1   recalcula antes (~7s)
```

Sem token valido devolve **404**, nao 401: nao confirma que existe algo ali. A
comparacao e de tempo constante.

## Acesso

O painel mora no site da clinica, num caminho com token no nome, sem login. Quem tem o
link abre. Vale para os **numeros agregados** — nenhuma secao dessas identifica paciente.

O token da API esta embutido no fonte da pagina, entao quem tem o link tem o token.
Ele so da acesso aos numeros agregados.

### Trocar o token

```sql
UPDATE ana_config SET valor = '<novo token>' WHERE chave = 'jornada_token';
```

Depois trocar o token no fonte da pagina e renomear o arquivo, porque o nome do
arquivo e o mesmo token.

## Pacientes e conversas: a secao com senha

A secao **Pacientes e conversas**, logo abaixo do funil, e a unica que mostra nome,
telefone, exame procurado e o teor das conversas. Isso e dado sensivel de saude pelo
art. 11 da LGPD, e por isso ela **nao** anda junto com o link da pagina:

- a senha vai no cabecalho `x-senha`, nunca na query string (que entra em log de
  servidor, historico de navegador e cabecalho `Referer`)
- quem confere e a Edge Function `historico`, contra um hash **PBKDF2-SHA256 de
  200.000 iteracoes** guardado em `ana_config.historico_senha`. Sem senha certa o
  servidor devolve 401 e nenhum dado sai
- as 200.000 iteracoes custam ~100ms por tentativa, o que inviabiliza forca bruta
  contra uma senha aleatoria de 20 caracteres mesmo sem contador de tentativas
- o CORS so aceita `https://totalquality.med.br`: outra origem recebe
  `access-control-allow-origin: null` e o navegador barra a leitura
- a senha fica em `sessionStorage`, entao sobrevive a um filtro mas nao a fechar o
  navegador. O botao **Fechar** apaga na hora

A lista chega sem as mensagens (~650 kB para 1.517 pacientes). O historico de cada um
e buscado quando a linha e aberta, e so fica na memoria daquela aba.

### Status: automatico com a palavra final de quem atende

A coluna **Status** sai da analise da conversa, como sempre saiu:

| Valor | Quando o sistema o escolhe |
|---|---|
| `Agendou` | `agendamento.status = 'confirmado'` |
| `Não Aplica` | o exame procurado esta na lista do que a clinica nao faz |
| `Não Agendou` | o resto |
| `Encerrado` | **nunca** — so existe como escolha manual |

Quem atende pode sobrepor pelo seletor da propria linha, ou pelo mesmo seletor
dentro da gaveta da conversa (no celular a tabela rola de lado, a gaveta nao).
A escolha vai para `ana_leads.status_manual`, com `status_manual_em`, e passa a
ganhar do calculado. A primeira opcao do seletor e sempre
**Automatico · \<o que a conversa diz\>**: escolher ela limpa a sobreposicao e
devolve o controle ao sistema. Linha com escolha manual mostra *definido a mao*.

O calculo nunca para: `sa` (automatico) continua vindo em toda resposta, lado a
lado com `sm` (manual) e com `s`, que e `sm ?? sa`. Assim da para comparar os
dois a qualquer momento, e o CSV traz as tres colunas.

`Encerrado` ficou de fora do automatico de proposito: quem fecha o assunto e a
pessoa que atende, nao a conversa. Se depois aparecer uma regra clara — por
exemplo, opt-out vira encerrado —, ela entra em `edge-historico.ts`, no mesmo
bloco que decide os outros tres.

A gravacao passa pela mesma senha e pelo mesmo CORS da leitura, aceita so os
quatro valores da lista e so telefone que ja existe em `ana_leads` (404 caso
contrario). Falha de rede nao altera a tela: o seletor volta ao valor anterior
e a pagina avisa que nada foi gravado.

### Trocar a senha

Gerar o hash e gravar:

```python
import secrets, hashlib, base64
senha = '-'.join(''.join(secrets.choice('abcdefghijkmnopqrstuvwxyz23456789')
                         for _ in range(5)) for _ in range(4))
sal, it = secrets.token_bytes(16), 200_000
h = hashlib.pbkdf2_hmac('sha256', senha.encode(), sal, it, dklen=32)
b64 = lambda b: base64.b64encode(b).decode()
print(senha, f'pbkdf2${it}${b64(sal)}${b64(h)}', sep='\n')
```

```sql
UPDATE ana_config SET valor = '<o hash>' WHERE chave = 'historico_senha';
```

Apagar a linha, ou deixa-la vazia, desliga a secao: a funcao passa a devolver 401
para qualquer senha.

## Por que cache e nao consulta ao vivo

O painel guarda os **segundos crus** de cada resposta da Ana (11,5 mil numeros) para que
mediana e percentil 90 sejam exatos em qualquer intervalo escolhido — media de medianas
diarias nao serve. Montar isso a cada visita custaria ~7s de espera e carga a toa.

## O que o filtro NAO muda

A secao "O que esta travado" e o bloco "Na fila agora" sao **estado de hoje**, nao do
periodo. Estao marcados na pagina com um selo dizendo isso.

## O que este PR coloca no ar

Tres arquivos, nenhum deles toca o site existente:

- `client/public/painel/<token>.html` — a pagina, servida estatica pelo Express
- `client/public/robots.txt` — uma linha, `Disallow: /painel/`
- `automacao/ana-agenda/PAINEL-jornada.md` — esta documentacao

A pagina nao importa nada do app React nem roda no build do Vite: e um arquivo
estatico em `client/public/`, copiado para `dist/public` e servido na raiz. Se for
removida, nada mais quebra.

## Pendencias de limpeza

Sobraram duas coisas da tentativa pelo Storage, as duas inofensivas. O `DELETE` em
`storage.buckets` e `storage.objects` via SQL trava num gatilho, entao precisam ser
apagadas pelo painel do Supabase:

- bucket **`painel`** — vazio e privado
- Edge Function **`limpar-painel`** — desativada, devolve 410. Foi usada uma vez para
  apagar o arquivo que ficou no bucket, e o corpo destrutivo foi removido depois.

## Manutencao

Mexer no visual ou no calculo da pagina: editar `painel-jornada-artefato.html` e
republicar o artefato pelo mesmo endereco. As consultas que alimentam o payload estao
comentadas uma a uma em `jornada-paciente-consultas.sql`.

Conferir se o cron rodou:

```sql
SELECT gerado_em FROM ana_jornada_cache;
SELECT status, start_time FROM cron.job_run_details WHERE jobid = (
  SELECT jobid FROM cron.job WHERE jobname = 'ana-jornada-diaria')
ORDER BY start_time DESC LIMIT 5;
```
