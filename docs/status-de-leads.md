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

## Por que a lista entra por fora

Porque a conversa do WhatsApp não passa por lugar nenhum que este código
alcance. O site abre `wa.me` e entrega a conversa ao aparelho da clínica:

- **não há API de WhatsApp** no site — nenhuma Cloud API, Evolution, Z-API,
  Twilio, Baileys ou equivalente;
- **não há tabela de mensagens** no banco. As 15 tabelas são users, contacts,
  leads, sessions, pageViews, videoViews, analyticsEvents, blogViews,
  conversions, tags, leadTags, adAccountCredentials, campaignMetrics e
  autoSeoArticles;
- a tabela `conversions` registra que alguém **clicou** para conversar
  (`whatsapp_click`, `form_submit`, `phone_call`), nunca o que foi conversado.

Quem sabe que o paciente agendou é a pessoa que atendeu. Para o sistema saber,
alguém precisa contar a ele — hoje colando a lista, amanhã por integração. O
motor de comparação é o mesmo nos dois casos.

## O que este status ainda NÃO faz

Ele mede, mas não **ensina** as plataformas de anúncio. Para o Google Ads
otimizar por paciente atendido em vez de por lead, ele precisa receber de volta
a conversão offline amarrada ao clique que a originou — e isso exige o
**`gclid`**, que o site **não captura hoje**.

Hoje guardamos o `_fbc` (clique do Meta, gravado pelo próprio pixel) e nenhum
identificador de clique do Google. Enquanto for assim, a coluna de status é um
relatório para a gestão, não um sinal para o leilão. Capturar o `gclid` é uma
mudança pequena no site e uma coluna a mais aqui; é o passo que transforma este
preenchimento em otimização de campanha.
