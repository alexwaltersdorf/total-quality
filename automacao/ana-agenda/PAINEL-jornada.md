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

O painel e um artefato **privado** da conta do Alex. Ninguem mais abre, nem com o link.
Para a equipe ver, compartilhar pelo menu Share do artefato.

O token da API esta embutido no fonte do artefato. Como o artefato e privado, o token
nao vaza — mas **se o artefato for compartilhado, o token vai junto**. Ele so da acesso
a estes numeros agregados, nunca a dado de paciente.

### Trocar o token

```sql
UPDATE ana_config SET valor = '<novo token>' WHERE chave = 'jornada_token';
```

Depois e preciso republicar o artefato com o token novo, porque ele esta no fonte.

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
