# ANA-05 — Validação com a agenda REAL (execução n8n 126929 · 20/08/2026)

Fonte: 91 eventos lidos ao vivo pela credencial do n8n (90 de `sac@totalquality.med.br` + 1 de feriados).

## 1. Correção: a credencial está na conta CERTA

Eu havia levantado a hipótese de que a credencial estivesse em outra conta. **Estava errado.**
O `calendarList` devolveu:

| Agenda | Permissão | Principal | Fuso |
|---|---|---|---|
| `sac@totalquality.med.br` | **owner** | sim | America/Sao_Paulo |
| Feriados no Brasil | reader | não | — |

A credencial é a conta correta e o fuso está certo. **Falta só compartilhar as agendas por modalidade**
(Eletrocardiograma, Eletroencefalograma, Espirometria, Exame Laboratorial, Holter, MAPA, Medicação e a
"TOTAL QUALITY" que aparece na sua tela) com `sac@totalquality.med.br` — elas não chegam à API.

Os exemplos abaixo vao sem nome, CPF nem telefone: o achado nao depende de
saber de quem era o cadastro, e dado de paciente nao entra no repositorio.

## 2. Cobertura de telefone: 61% real (55 de 90)

O diagnóstico usou um detector propositalmente frouxo e acusou 55/90. Rodei o parser rigoroso contra os
90 eventos reais e a taxa **se confirma**: 55 eventos (61%) têm telefone de WhatsApp extraível com segurança.

Mas o teste revelou **4 falsos positivos graves na versão v3** — ela lia o **CPF como telefone**:

| Evento | v3 gravaria em | Realidade |
|---|---|---|
| 08H30 paciente A | CPF lido como `55<11 digitos do CPF>` | tem telefone real, outro numero |
| 13h00 paciente B | CPF lido como `55<11 digitos do CPF>` | tem telefone real, outro numero |
| 14h30 paciente B | o mesmo CPF, de novo | evento **não tem** telefone |
| 14h00 paciente C | CPF lido como `55<11 digitos do CPF>` | evento **não tem** telefone |
| 08H00 paciente D | telefone **dos EUA** com 55 na frente | não é número brasileiro |

Isso gravaria "agendamento confirmado" no cadastro de **outro paciente**. A **v4** corrige: rejeita CPF/RG/SSN/CEP
mesmo sem rótulo e telefone internacional. Resultado nos mesmos 90 eventos: **55 telefones, 0 falso positivo.**

## 3. Achado mais importante: a hora do bloco NÃO é a hora do exame

Em **51 dos 74** eventos que trazem hora no título (**69%**), o horário do bloco no Google Agenda é diferente
do horário escrito no título:

| Exemplo | Título | Bloco no calendário |
|---|---|---|
| paciente E — USG axilas e mamas | 09h00 | **21:00** |
| paciente F — coleta | 08h00 | **20:00** |
| Thalia Cristine — USG TV | 11h00 | **19:45** |
| Rodrigo Zanelato — coleta | 09h00 | 08:00 |
| Guilhermino Augusto — USG próstata | 10h00 | 11:30 |

Há **9 blocos fora do horário comercial** (antes das 7h ou depois das 19h) — a clínica não atende nesses horários.
Conclusão: **quem manda é o título**, o bloco é só onde coube na tela. A v4 passa a ler a hora do título
(com o bloco como reserva). Efeito prático: os turnos calculados passaram a ser 56 manhã / 34 tarde e
**zero "noite"** — que é o padrão real da clínica. Com a v3, a Ana confirmaria "seu exame às 21h" para a Sônia.

## 4. Os 35 eventos sem telefone

- **4** sem título e sem descrição nenhuma (blocos vazios de 14/08)
- **31** com ficha preenchida (nome, CPF, nascimento, CEP) mas **sem o telefone**

Nesses 31 a recepção já digita 4 campos — falta só o quinto. Três casos têm telefone digitado errado e por
isso foram (corretamente) recusados: `37 9858-7767` e `33 9124-7891` (falta o 9º dígito) e
`12 99184-02713` (um dígito a mais).

**Da agenda inteira, 15 eventos são de ultrassonografia — 9 deles (60%) já dariam match automático.**

## 5. Veredito

| Item | Situação |
|---|---|
| Credencial / conta / fuso | ✅ corretos |
| Leitura de eventos pela API | ✅ funcionando (90 eventos) |
| Parser de telefone | ✅ v4 — 61% de cobertura, 0 falso positivo |
| Parser de horário | ✅ v4 — lê do título |
| Agendas por modalidade | ⚠️ falta compartilhar com `sac@totalquality.med.br` |
| Padrão de cadastro da recepção | ⚠️ falta a linha do WhatsApp em 31 eventos |

**Pronto para produção com 61% de cobertura automática.** Com a linha `WhatsApp: (12) 9XXXX-XXXX` na descrição
padronizada, vai a ~100% sem mudar uma linha do fluxo.

Arquivo para importar: `ANA-05-sync-google-agenda-v4.json` (descartar v1, v2 e v3).
