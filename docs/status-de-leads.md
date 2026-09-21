# Status do lead: medir quem agendou o exame

**21/09/2026.** Até aqui a medição parava no lead. Sabíamos quantas pessoas
pediram contato, de onde vieram e por qual canal — e **nada** sobre quantas
viraram exame. O Google Ads otimizava por volume de lead, não por paciente
atendido, porque era só isso que a gente sabia dizer a ele.

Este documento descreve o preenchimento de status na planilha
`Total_Quality_Leads` e o painel que ele alimenta.

## As etapas

Sete, e a ordem é a do funil real de uma clínica de diagnóstico:

| Etapa | Quando usar |
|---|---|
| **Novo** | chegou, ninguém falou com a pessoa ainda (é o padrão que o site grava) |
| **Em contato** | conversa iniciada, sem data marcada |
| **Agendado** | **marcou o exame** — a métrica principal |
| **Compareceu** | fez o exame. É a única etapa que vira dinheiro |
| **Não compareceu** | marcou e faltou |
| **Sem retorno** | não respondeu às tentativas |
| **Perdido** | desistiu, foi para outro lugar, ou não era paciente |

**Agendado e Compareceu são separados de propósito.** Numa clínica de
diagnóstico o não comparecimento é alto, e juntar os dois esconde exatamente o
problema que custa horário de equipamento parado. A taxa de comparecimento é o
número que diz se o gargalo está em atrair ou em confirmar.

## As três colunas novas

Entram **no fim** da planilha (U, V e W), nunca no meio: o webhook do site
escreve as colunas A a T em ordem fixa, e inserir coluna no meio quebra a
gravação em silêncio.

| Coluna | O que é |
|---|---|
| **U — Data do Status** | carimbada sozinha quando alguém muda a etapa |
| **V — Exame agendado** | qual exame foi marcado (texto livre) |
| **W — Valor (R$)** | quanto o exame custou, para fechar a conta de retorno |

A data automática existe porque preenchimento manual de data não acontece: a
pessoa que atende está com o paciente na linha, não anotando carimbo. Sem ela,
não há como medir **quanto tempo** o lead levou do contato ao agendamento — e
esse tempo é o que diz se a equipe está respondendo rápido o bastante.

## O painel

A aba **Resumo** é montada com fórmulas que leem a aba `Leads` ao vivo. Nada
para atualizar à mão. Ela responde:

- quantos leads entraram e em que etapa estão;
- **taxa de agendamento** (agendou ÷ total de leads);
- **taxa de comparecimento** (compareceu ÷ quem agendou);
- receita registrada;
- a mesma quebra separando **WhatsApp** de **telefone** — dá para ver se o
  formulário antes da ligação vale o atrito que cobra;
- leads por canal de aquisição (Google Ads, Orgânico, Bing, Direto).

## Instalação

O código está em `docs/scripts/status-de-leads.gs`. Na planilha:

1. **Extensões › Apps Script**;
2. cole o conteúdo do arquivo **no fim** do `Code.gs` existente, sem apagar o
   `doPost` (é ele que recebe os leads do site);
3. salve;
4. no seletor de função, escolha **`configurarStatus`** e execute (autorize
   quando pedir);
5. escolha **`criarResumo`** e execute.

Não é preciso reimplantar o app da web: `doPost` continua na versão já
publicada, e `onEdit` é um gatilho simples que roda direto do script.

> **Se o `Code.gs` já tiver uma função `onEdit`**, não cole a segunda: junte o
> corpo das duas numa só. Duas funções com o mesmo nome no mesmo arquivo fazem
> a última sobrescrever a primeira, e a que você perder falha em silêncio.

## Atualização automática pelos telefones

O menu **Total Quality** na planilha traz duas funções novas:

- **Preparar aba de agendamentos** — cria a aba `Agendamentos`;
- **Atualizar status pelos telefones** — casa e atualiza.

Na aba `Agendamentos` você cola os telefones de quem agendou, um por linha,
**em qualquer formato**: `(12) 99999-9999`, `+55 12 99999-9999` ou
`5512999999999`. Opcionalmente a etapa (vazio = `Agendado`), o exame e o valor.

### O que o motor faz

1. **Normaliza** o telefone dos dois lados. O mesmo aparelho aparece como
   `(12) 99725-7786` aqui, `+55 12 99725-7786` no WhatsApp e `5512997257786`
   numa exportação. Pior: o nono dígito entrou em 2012, e cadastro antigo não
   tem — o mesmo celular existe com 10 e com 11 dígitos.
2. **Atualiza o lead mais recente** daquele telefone e carimba a data.
3. **Marca os anteriores como `Duplicado`**, se ainda estiverem em `Novo`.
   Contar três leads da mesma pessoa como três agendamentos inflaria a taxa
   exatamente no número que ela existe para medir. O Resumo usa **leads
   únicos** como denominador.
4. **Nunca chuta.** Quando só a comparação de 8 dígitos casa e há mais de um
   candidato — um fixo `3887-3535` e um celular `93887-3535` colidem nela —
   o motor reporta ambiguidade em vez de escolher.
5. **Escreve o resultado linha a linha** na coluna Resultado.

`chavesTelefone()` é testada em `server/telefone-matching.test.ts`, inclusive a
colisão do item 4, que está lá registrada de propósito. Errar a comparação de
telefone corrompe em silêncio o número que a coluna existe para medir: casar o
lead errado marca como agendado quem não agendou.

### Telefone sem lead não é erro

É paciente que **agendou sem passar pelo site** — veio de indicação, passou na
porta, ligou de um número que não é o do formulário. Esse número mede quanto da
demanda o site não explica, e é uma das informações mais úteis que a planilha
produz.

## Por que a lista entra por fora — e por quanto tempo ainda

> **Correção de 21/09/2026.** A versão anterior deste documento afirmava que
> "a conversa do WhatsApp não passa por lugar nenhum" e que o `gclid` não era
> capturado. **As duas afirmações estavam erradas**, e o erro foi meu: verifiquei
> o repositório do site e o MySQL dele, não encontrei nada, e concluí que não
> existia — quando o que eu podia afirmar era apenas que *não existia no site*.
> O conector do N8N estava desconectado e eu não disse que estava olhando com
> meio sistema fora do alcance.

**Existe uma stack de WhatsApp completa no N8N**, e ela está viva:

| Workflow | Estado | Execuções |
|---|---|---|
| ANA-01 — Atendimento WhatsApp (Evolution API) | ativo | **6.421** |
| ANA-02 — Follow-up Carinhoso | ativo | — |
| ANA-03 — Resumo Diário | ativo | — |
| ANA-04 — Auditoria de Atendimento (IA) | ativo | — |
| ANA-05 — Sincronizar Agendamentos do Google Agenda | ativo | — |
| ANA-06 — Confirmação de exame na véspera | ativo | — |
| **ADS-01** — Captura de clique WhatsApp com `gclid` | ativo | **1** |
| **ADS-02** — Conversões offline → Google Ads | **desligado** | 0 |

As conversas ficam num **Postgres** próprio, em `ana_leads`, e quem agendou está
em `ana_leads.agendamento->>'status' = 'confirmado'`, com `agendado_em` e
`exames`. O `gclid` está em `ana_ads_clicks`, alimentado pelo ADS-01 a partir
do GTM — não do código do site, que por isso não mostrava nada.

### O elo quebrado

**O ADS-01 rodou uma única vez, em 14/09 às 12:44**, o dia em que foi criado.
Nunca mais recebeu nada. Ele espera do GTM o código `TQ-XXXXX` de cada clique
de WhatsApp com `gclid` e UTMs; **essa tag nunca passou a enviar**.

A consequência é em cadeia: sem cliques em `ana_ads_clicks`, o ADS-02 não tem
o que mandar — por isso está desligado — e o Google Ads nunca recebe "exame
agendado", continuando a otimizar por volume de lead.

O ADS-02, aliás, está bem construído: deduplica por `transactionId`, tenta de
novo até 5 vezes, respeita janela de 90 dias, calcula o valor somando os exames
e classifica o que não envia (`sem_gclid`, `expirada`, `substituida`,
`agendou_antes`). Não falta código. Falta ligar a ponta de cima.

### Então por quanto tempo a colagem manual faz sentido

Até o ADS-01 voltar a receber e a planilha passar a ser espelhada de
`ana_leads`. A colagem é uma ponte enquanto a fonte de verdade existe mas não
chega aqui — não é o desenho final. O motor de comparação de telefone continua
valendo nos dois casos: é ele que liga um lead do site a um telefone do
WhatsApp, venha a lista de onde vier.

## O que este status ainda NÃO faz

Ele mede, mas não **ensina** as plataformas de anúncio. Para o Google Ads
otimizar por paciente atendido em vez de por lead, ele precisa receber de volta
a conversão offline amarrada ao clique que a originou.

O caminho para isso **já está construído** (ADS-01 → `ana_ads_clicks` → ADS-02
→ Data Manager API). O que falta não é código:

1. **A tag do GTM que alimenta o ADS-01.** Sem ela não há `gclid` novo, e todo
   o resto fica sem matéria-prima.
2. **A ação de conversão no Google Ads** — "Exame agendado (WhatsApp)", do tipo
   Importar › Cliques — e o `ads_conversion_action_id` correspondente em
   `ana_config`, junto de `ads_customer_id` (9207153288).
3. **Uma credencial Google OAuth2** com escopo
   `https://www.googleapis.com/auth/datamanager`, num projeto com a Data Manager
   API ativada, autorizada por quem tem acesso à conta 920-715-3288.
4. **Ligar o ADS-02**, que hoje está desativado.

Enquanto os quatro não estiverem de pé, a coluna de status é relatório para a
gestão, não sinal para o leilão.
