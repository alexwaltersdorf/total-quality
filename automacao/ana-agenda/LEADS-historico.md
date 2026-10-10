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
| `edge-historico.ts` | Edge Function `historico`: lê o banco com a service role e devolve um JSON com leads, situação e mensagens |
| `leads-historico.py` | Gerador: pega o JSON e escreve o HTML |
| `leads-historico.tpl` | O documento em si — CSS, marcação e JavaScript |

## Como gerar de novo

A função só responde enquanto existir um token em `ana_config`. Fora da geração
ela fica desligada, devolvendo 404 — é um endereço público que lê conversa de
paciente, então não fica de pé à toa.

1. Ligar, com um segredo novo a cada vez:

   ```sql
   update ana_config set valor = '<token aleatorio>', updated_at = now()
    where chave = 'historico_token';
   ```

2. Baixar e montar:

   ```sh
   curl -s "https://ajwhrmjzvfdjwsqynbzt.supabase.co/functions/v1/historico?k=<token>" -o dados.json
   python3 leads-historico.py dados.json
   ```

3. Desligar:

   ```sql
   update ana_config set valor = '' where chave = 'historico_token';
   ```

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
