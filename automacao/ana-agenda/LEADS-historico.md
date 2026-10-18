# Leads do WhatsApp com histórico das conversas

Documento HTML de uma página só, com os leads do WhatsApp, a **situação de cada
conversa** e o **histórico completo de mensagens** — clicar numa linha abre o
diálogo inteiro, com horário e quem falou.

O arquivo gerado **não entra no repositório**: ele traz nome, telefone, exame e o
teor das conversas de pacientes identificáveis. O `.gitignore` já cobre
`leads-whatsapp-*.html` e `.csv`.

## Peças

| Arquivo | Papel |
|---|---|
| `edge-historico.ts` | Edge Function `historico`: lê o banco com a service role e devolve JSON com leads, situação e mensagens, atrás de senha |
| `leads-historico.py` | Gerador: pega o JSON e escreve o HTML |
| `leads-historico.tpl` | O documento em si — CSS, marcação e JavaScript |

## A mesma função serve o painel

A seção **Pacientes e conversas** do painel da jornada
(`https://totalquality.med.br/painel/<token>.html`) consome esta mesma função.
Lá ela entrega a lista sem as mensagens, e o histórico de um paciente de cada
vez, conforme as linhas são abertas. A senha e o PBKDF2 estão descritos em
`PAINEL-jornada.md`.

| Modo | O que devolve |
|---|---|
| `?modo=lista` | os leads, sem as mensagens (~650 kB) |
| `?modo=conversa&fone=55...` | o histórico de um contato só |
| `?modo=tudo` | leads + todas as mensagens (~5,4 MB), para gerar o HTML |
| `POST ?modo=status` | grava `status_manual` de um contato. Corpo `{fone, status}`, status vazio volta ao automático |

A senha vai sempre no cabeçalho `x-senha`, nunca na URL: query string entra em
log de servidor, histórico de navegador e cabeçalho `Referer`.

## Como gerar o documento offline

```sh
curl -s -H "x-senha: <a senha>" \
     "https://ajwhrmjzvfdjwsqynbzt.supabase.co/functions/v1/historico?modo=tudo" \
     -o dados.json
python3 leads-historico.py dados.json
```

O HTML sai em `leads-whatsapp-total-quality.html`, na pasta de onde o comando
rodou. Ele é autossuficiente — abre sem rede — e por isso traz as conversas
todas embutidas. Guarde-o como guardaria um prontuário, e não o coloque no
repositório: o `.gitignore` já barra.

## Situação da conversa

Estado de hoje, diferente do *Status*, que é o desfecho comercial. A ordem de
precedência está em `edge-historico.ts` e é esta:

| Situação | Quando |
|---|---|
| **Agendada** | `agendamento.status = 'confirmado'` |
| **Opt-out** | pediu para não receber mais mensagens |
| **Escalada** | passou para a equipe e segue aberta |
| **Bot pausado** | a recepção assumiu e não devolveu — a rotina `ana_retomar_pos_humano` devolve em 24h (48h nas escaladas) |
| **Parada** | nenhuma mensagem há mais de 7 dias (o detalhe diz quem falou por último) |
| **Aguardando a clínica** | o paciente falou por último, há menos de 7 dias |
| **Aguardando o paciente** | a clínica falou por último, há menos de 7 dias |

O corte de 7 dias importa: sem ele, qualquer conversa em que o paciente deu a
última palavra — inclusive um "obrigada" de um mês atrás — entrava em
*Aguardando a clínica* e inflava a fila de trabalho de 138 para 774.

## Armadilhas já pagas

- **O PostgREST corta em 1.000 linhas**, por mais que o `limit` peça mais. Paginar
  avançando pelo tamanho do lote que voltou, nunca pelo que foi pedido — senão a
  extração pula metade das mensagens em silêncio.
- **O Supabase não serve HTML**: o gateway reescreve `text/html` como
  `text/plain` e injeta `sandbox`. Vale para Edge Function e para o Storage. Por
  isso a função devolve JSON e o HTML é montado aqui.
- **O cliente SQL do MCP quebra o comando no `;`**, mesmo dentro de string. Por
  isso a Edge Function escreve os detalhes sem acento e o gerador os reacentua.
- **A contagem de mensagens por telefone vem da view `ana_msgs_contagem`**, não
  de somar as 38 mil linhas no cliente: o PostgREST não faz `group by`, e sem a
  view o modo `lista` teria de baixar o histórico inteiro só para contar.
