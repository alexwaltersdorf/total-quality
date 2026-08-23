# Sincronização Google Agenda ↔ Ana (ANA-05 / ANA-06)

Automação de agendamento da **Total Quality Medicina Diagnóstica**: a agenda oficial
`sac@totalquality.med.br` passa a ser a fonte de verdade dos agendamentos, e a Ana
confirma o exame com o paciente na véspera.

| Arquivo | O que é |
|---|---|
| `ANA-05-sync-google-agenda-v4.json` | v4.1 — lê a agenda a cada 15 min e grava o agendamento em `ana_leads`. |
| `ANA-06-confirmacao-vespera.json` | Às 09:00 do dia útil anterior, confirma o exame no WhatsApp. |
| `modelo-agenda-total-quality.ics` | 3 eventos-modelo para importar na agenda e treinar a recepção. |
| `GUIA-RECEPCAO-agenda.md` | O padrão de preenchimento, em uma página. |
| `ANA-05-validacao-agenda-real.md` | Validação contra os 90 eventos reais da agenda. |

## ANA-05 — sincronização (a cada 15 minutos)

Trigger 15 min → Google Calendar (`getAll`, `singleEvents`, `showDeleted`, janela de 60 dias,
`updatedMin` de 30 min) → parser → `UPDATE ana_leads`.

O parser v4 foi **calibrado contra os 90 eventos reais** da agenda (execução n8n `126929`):

- **55 de 90 (61%)** rendem um telefone confiável; **0 falso positivo**.
- Rejeita CPF, RG, SSN, CEP e data de nascimento — com ou sem rótulo. A v3 lia CPF como
  telefone em 4 eventos e gravaria o agendamento no cadastro de **outro paciente**.
- Rejeita telefone internacional (`+1 …`).
- **A hora vem do título**, não do bloco: em 51 dos 74 eventos com hora no título (69%) o
  bloco está em outro horário. Com o bloco, 3 exames da manhã viravam "noite".
- Extrai também o **nome do paciente** (83 de 90 eventos), para quem agendou no balcão.
- Sem telefone confiável o evento é **ignorado** — silêncio é mais seguro que escrever errado.

**v4.1 — UPSERT em vez de UPDATE.** Medido no banco: **22 dos 54 telefones da agenda não existem
em `ana_leads`** — são pacientes que marcaram no balcão ou por telefone, sem passar pelo WhatsApp.
Com `UPDATE` puro esses 22 eram um no-op silencioso: o agendamento nunca era gravado e a
confirmação da véspera nunca sairia. O `INSERT … ON CONFLICT (phone) DO UPDATE` cria o lead
nesses casos e **nunca sobrescreve um nome já cadastrado**.

## ANA-06 — confirmação da véspera (09:00)

Cron `0 9 * * 1-5` (fuso `America/Sao_Paulo`) → busca no Postgres → 1 paciente por vez →
monta a mensagem → Evolution API → registra o envio → espera 20s → próximo.

- Pega os exames do **próximo dia útil**. Sexta-feira às 09:00 cobre segunda (a clínica não
  abre sábado e domingo).
- Não repete: grava `agendamento.confirmacao_enviada_em`.
- Respeita `opt_out` (LGPD).
- Grava a mensagem em `ana_mensagens` para a Ana ter contexto quando o paciente responder.
- Texto **determinístico** (3 variações estáveis por paciente) — auditável para fins de
  CFM 2.336/2023. A **resposta** do paciente volta para a Ana do ANA-01, que conduz
  confirmação, remarcação ou cancelamento conforme o bloco `6.1` do system prompt.

### Antes de ativar

1. No nó **Enviar pelo WhatsApp (Evolution)**: preencher a URL base, o nome da instância e a
   `apikey` — os mesmos usados no ANA-02.
2. Selecionar a credencial Postgres (Supabase) nos dois nós de banco.
3. Conferir o fuso do workflow: **Settings → Timezone → America/Sao_Paulo**.
4. O workflow importa **desativado**. Ativar só quando o envio de mensagens for liberado.

## Pendências fora do código

- Compartilhar com `sac@totalquality.med.br` as agendas por modalidade (Eletrocardiograma,
  Eletroencefalograma, Espirometria, Exame Laboratorial, Holter, MAPA, Medicação e a que
  aparece como "TOTAL QUALITY") — hoje a API enxerga só 2 agendas.
- Padronizar o preenchimento na recepção (`GUIA-RECEPCAO-agenda.md`) — leva a cobertura
  de 61% para perto de 100% sem mexer no fluxo.
