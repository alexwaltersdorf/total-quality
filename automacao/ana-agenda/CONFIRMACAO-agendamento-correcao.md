# Confirmação de véspera — o que estava errado e o que mudou

**Data da correção:** 10/09/2026 · **Fluxo:** ANA-06 · **Banco:** `ana_leads`

## O que o paciente viu

| Caso | O que a Ana mandou | O que estava errado |
|---|---|---|
| **Davi da Silva Borba** (07/09, 09h12) | *"O exame de amanhã está marcado: **RX panoramica de coluna total cancelou agendou na cidade dele**"* | O exame **estava cancelado**. A recepção escreveu a anotação dentro do título do evento em vez de apagar o evento. A ANA-05 leu como confirmado e a anotação interna foi para o paciente. |
| **Michele** (07/09, 09h09) | *"Passando pra confirmar o exame de amanhã…"* → *"Eu não confirmei"* | A mensagem **afirmava** uma confirmação que a paciente nunca deu. |

## A causa real

Das **10 confirmações enviadas em 07/09, só 2** vinham de um agendamento de
verdade. As outras 8 saíram de `agendamento` escrito pela **própria Ana
(ANA-01) durante a conversa** — quem só perguntou sobre um exame ficava com
`status = 'confirmado'` no banco. Carla estava assim (hoje `status = 'nenhum'`,
sem exame nenhum), BISPA DAMARES com `data = "quarta-feira"`, SILVANA com data
de ontem.

A trava de repetição também não funcionava: a ANA-06 gravava
`confirmacao_enviada_em` dentro de `agendamento`, mas a ANA-01 **reescreve o
`agendamento` inteiro** a cada resposta do paciente e apagava o carimbo.

E havia um terceiro defeito, achado no mesmo levantamento:
**a ANA-06 está parada desde 08/09**. O nó `Registrar envio` mandava dois
parâmetros separados por vírgula em `queryReplacement`, e o n8n divide esse
campo por vírgula — qualquer exame com vírgula no nome (*"TC tórax, TC de
abdômen total"*) quebrava a query e derrubava o fluxo. Nenhum paciente com
exame em 09, 10 ou 11/09 recebeu confirmação.

## A regra nova

Tudo em `confirmacao-vespera-guarda.sql`, dentro do banco, para que nenhuma
edição de fluxo consiga contornar:

1. **Só a Agenda do Google confirma.** O que a Ana deduziu de conversa nunca
   gera confirmação.
2. **Título com palavra de cancelamento** (`cancelou`, `desmarcou`, `remarcar`,
   `conferir`, `pendente`…) nunca confirma.
3. **Título sem nome de exame reconhecível** nunca confirma — melhor não
   confirmar do que mandar anotação interna da recepção.
4. **Telefone precisa ser celular brasileiro válido** (barrou 10 números).
5. **Anti-duplicidade em `ana_envios_log`**, que a ANA-01 não sobrescreve.

Três camadas garantem a regra:

- `ana_confirmacoes_vespera()` — a consulta que a ANA-06 passa a usar;
- `trg_ana_marcar_confirmavel` — trigger que carimba cada linha na escrita, de
  modo que a consulta antiga do fluxo também respeita a regra;
- guarda no nó `Montar mensagem`, que recusa montar texto de título sujo.

## Texto da mensagem

A Ana não afirma mais que o paciente confirmou. Antes:

> Passando pra confirmar o exame de amanhã… **Posso confirmar sua presença?**

Agora:

> Na nossa agenda consta um exame de amanhã… **Você consegue vir?**
> […] Se esse agendamento não for seu, me avisa que eu corrijo aqui, tá?

## Efeito medido

Aplicada a regra sobre as 725 linhas do banco:

| Situação | Linhas |
|---|---|
| Confirmável | 63 |
| Bloqueado — só da conversa, sem agenda | 19 |
| Bloqueado — telefone suspeito | 10 |
| Bloqueado — título com cancelamento | 1 |
| Bloqueado — exame ilegível | 1 |

Os 24 títulos reais que hoje estão na agenda foram testados um a um: todos
produzem nome de exame limpo. Os três títulos sujos são recusados.

## O que a recepção precisa ver

```sql
SELECT * FROM ana_confirmacoes_bloqueadas;
```

Traz paciente, data, título e **o que fazer** em cada caso. O que a Ana recusa
não some — vira fila de tratamento humano.

## Aplicado no n8n

As três mudanças estão salvas **e publicadas** no ANA-06 (versão ativa
`dd3daee5`), fluxo ativo, cron `0 9 * * 1-5` em America/Sao_Paulo:

1. `Buscar exames do proximo dia util` → `SELECT * FROM ana_confirmacoes_vespera();`
2. `Registrar envio` → um único parâmetro JSONB, e o nó passou a continuar em
   caso de erro para que uma linha ruim não derrube o lote
3. `Montar mensagem` → texto novo, recusa de título sujo, lista de exames
   alinhada com o banco

## Pendência operacional: 20 pacientes sem confirmação

Enquanto o fluxo esteve quebrado (09 a 11/09) ninguém recebeu véspera.
Seis deles têm exame **amanhã, sexta 11/09**, e precisam de ligação da
recepção — a janela da véspera já passou e a Ana não vai mais alcançá-los:

| Hora | Contato | Paciente |
|---|---|---|
| 08:00 | Janaina Belmiro Lins | Janaina Belmiro Lins |
| 09:00 | BISPA DAMARES | Damares de Oliveira Pinto |
| 10:00 | May Costa | Mateus Mathias Barreto dos Santos |
| 10:30 | Walace Veloso de Oliveira | Walace Veloso de Oliveira |
| 11:00 | Nilton dos Santos Ferreira | Nilton dos Santos Ferreira |
| 11:00 | Isabel | Maria Antônia Ramos |

A lista completa sai com:

```sql
SELECT * FROM ana_leads
WHERE agendamento->>'confirmavel' = 'true'
  AND (agendamento->>'data')::date >= CURRENT_DATE;
```
