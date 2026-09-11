# Implantação de 01/09/2026 — o que foi ao ar no n8n

Feito pela API pública do n8n (o conector MCP estava instável). Backups das versões
anteriores neste mesmo diretório antes de qualquer alteração.

## A descoberta: o disparador dos check-ups não era da Ana

**`Followup - SDR`** (id `fQmbc2WOhnKo2uf2`) era o responsável pelas mensagens de check-up.
Ele nunca apareceu nas análises anteriores porque vive **fora** de todo o resto:

- lê as tabelas `conversations`, `messages`, `followups` — não `ana_leads`/`ana_mensagens`
- envia por **outra instância da Evolution**: `http://187.127.13.63:48240/.../totalquality`,
  em HTTP puro, por IP
- cadência própria de 6 mensagens em 30 dias sobre "saúde preventiva"
  (FU-1 dia 1 → FU-6 dia 30), citando hemograma, glicemia, colesterol, hormônios, ultrassom
- **`LIMIT 50` por rodada**, todo dia às 09:00, sem intervalo entre as mensagens

Nenhuma trava construída até aqui alcançava esse fluxo. **Desativado.**

## Alterações aplicadas

| Fluxo | O que mudou | Estado |
|---|---|---|
| `Followup - SDR` | desativado — era a origem dos check-ups | **parado** |
| ANA-02 | substituído pela v2 (4 correções + cache + prompt reduzido) | **parado** |
| ANA-04 | nó `Chamar Claude` corrigido | ativo |
| ANA-01 | agrupamento 8s → 15s; histórico 24 → 12 mensagens | ativo |
| ANA-05 v4.1 | publicado (`TKYoyHYWEefcCB9I`) | **ativo** |
| ANA-06 | publicado (`UEbCnaDY9c5GbLeR`) | parado (envia mensagem) |

### ANA-04 estava quebrado desde 27/08

Erro `invalid syntax` em toda execução. A migração Anthropic → OpenAI ficou pela metade
no nó `Chamar Claude`:

```
header:  ={{ $env.ANTHROPIC_API_KEYBearer {{ $env.OPENAI_API_KEY }} }}
body:    ={{ JSON.stringify($json.payload){{ JSON.stringify($json.openai_body) }} }}
```

Corrigido para `=Bearer {{ $env.OPENAI_API_KEY }}` e `={{ JSON.stringify($json.openai_body) }}`
(o nó anterior devolve `openai_body`).

## Correção da auditoria anterior

ANA-01 e ANA-04 rodam em **OpenAI** (`/v1/responses`), não em Anthropic — só o ANA-02 usa a
API da Anthropic. Logo:

- o `cache_control` só se aplica ao ANA-02, e foi lá que entrou
- ANA-01 **já tinha agrupamento de rajada** (8s), que subiu para 15s
- a estimativa de ~20 milhões de tokens repetidos valia para o desenho de uma API só;
  no OpenAI o cache de prefixo é automático para prompts longos

## Ainda em aberto

- **`Relatório Diario - 07:00`** também usa a instância legada `187.127.13.63` e as tabelas
  `conversations`/`messages`. É relatório interno para supervisor, não fala com paciente —
  mas mostra que existe uma segunda pilha inteira rodando em paralelo.
- **15 escaladas abertas**, a mais antiga há 16 dias. Nenhum ajuste técnico resolve.
- ANA-06 e ANA-02 só devem ser ativados quando os envios forem liberados.
