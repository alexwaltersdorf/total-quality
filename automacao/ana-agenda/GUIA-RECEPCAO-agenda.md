# Como preencher a agenda do Google — Recepção Total Quality

A Ana lê esta agenda a cada 15 minutos e, **às 09:00 do dia útil anterior**, confirma o exame
com o paciente pelo WhatsApp. Ela só consegue fazer isso quando o evento estiver preenchido
no padrão abaixo.

## O padrão

**Título:** `HH:MM - NOME COMPLETO - EXAME`

```
09:00 - Maria Aparecida da Silva - USG ABDÔMEN TOTAL
```

**Descrição — um dado por linha, sempre com o nome do campo na frente:**

```
Paciente: Maria Aparecida da Silva
WhatsApp: (12) 99123-4567
CPF: 123.456.789-00
Nascimento: 15/03/1985
CEP: 11660-000
Exame: Ultrassonografia de abdômen total
Pagamento: PIX à vista — R$ 135,00 (10% desc.)
Obs: trouxe pedido médico
```

## As 5 regras

| # | Regra | Por quê |
|---|---|---|
| 1 | **O bloco tem que estar na hora real do exame.** A hora do título e a hora do bloco precisam ser a mesma. | Hoje 69% dos eventos estão diferentes. Já teve `09h00` no título com o bloco marcado às **21:00** — a Ana confirmaria "seu exame às 21h". |
| 2 | **Título no padrão** `HH:MM - NOME COMPLETO - EXAME`. | É assim que a Ana descobre o nome do exame para escrever ao paciente. |
| 3 | **A linha `WhatsApp:` é obrigatória**, com DDD: `(12) 99123-4567`. | Sem ela a Ana não sabe para quem escrever. Hoje faltam em **35 dos 90** eventos. |
| 4 | **Um dado por linha, com o rótulo na frente** (Paciente, WhatsApp, CPF, Nascimento, CEP…). | Sem rótulo o sistema já leu **CPF como telefone** — a confirmação iria para o paciente errado. |
| 5 | **Telefone completo:** celular tem 11 dígitos com o DDD. | `37 9858-7767` e `12 99184-02713` foram recusados por falta/sobra de dígito. Na dúvida, a Ana descarta — é mais seguro que errar de pessoa. |

## O que NÃO fazer

```
❌  9h maria usg
    maria
    987654321
```

- Bloco às 10:30 com "9h" escrito no título.
- Sem a linha `WhatsApp:`.
- Número sem DDD e sem rótulo — pode ser CPF, pode ser telefone. O sistema descarta.
- "maria" não identifica a paciente.

**Resultado:** este exame fica de fora da confirmação automática. Alguém vai ter que ligar.

## Perguntas rápidas

**E se o paciente não tiver WhatsApp?** Escreva `WhatsApp: não tem` na descrição. A Ana pula
o evento e a recepção confirma por telefone.

**E se dois pacientes usarem o mesmo número (mãe e filho)?** Pode. A Ana manda uma mensagem
para cada exame, citando o exame — quem recebe entende.

**Mudou o horário do exame?** Arraste o bloco para a hora nova **e corrija a hora no título.**
As duas coisas.

**Cancelou?** Apague o evento. A Ana detecta o cancelamento e retoma o contato para reagendar.
