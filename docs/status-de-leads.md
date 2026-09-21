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
