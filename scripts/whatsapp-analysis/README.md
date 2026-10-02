# Análise de vendas via WhatsApp

Ferramenta para medir o desempenho dos vendedores e gerar a lista de follow-up
de clientes que não finalizaram a compra, a partir de conversas exportadas do
WhatsApp.

## Como exportar as conversas

No WhatsApp do celular, em cada conversa de cliente:

1. Toque em **⋮ (três pontos) → Mais → Exportar conversa**
2. Escolha **Sem mídia**
3. Salve/envie o arquivo `.txt` gerado (o nome fica
   `Conversa do WhatsApp com <Cliente>.txt` — mantenha esse nome, ele é usado
   para identificar o cliente)

Coloque todos os `.txt` em uma pasta.

## Como rodar

```bash
node scripts/whatsapp-analysis/analisar.mjs <pasta-com-txt>

# opções
node scripts/whatsapp-analysis/analisar.mjs exports/ \
  --saida exports/relatorios \
  --dias-followup 2 \
  --empresa "Total Quality"
```

Saídas geradas:

- **`relatorio-vendedores.md`** — conversas atendidas, mensagens enviadas,
  tempo mediano de primeira resposta e de resposta geral, conversões e taxa
  de conversão por vendedor, além de alertas (clientes sem resposta,
  atendimentos sem vendedor identificado).
- **`followups.csv`** — clientes com interesse demonstrado que não fecharam,
  ordenados por prioridade (cliente aguardando resposta primeiro), com o ponto
  onde a conversa parou e uma sugestão de mensagem de retomada. Abre direto no
  Excel/Google Sheets (separador `;`).

## Como o vendedor é identificado

Pela apresentação no início do atendimento, por exemplo:

> "Bom dia! Aqui é o **Carlos** da Total Quality"
> "Olá! Sou a **Maria**, tudo bem?"

Conversas sem apresentação aparecem como "Não identificado" no relatório —
padronize a saudação da equipe para melhorar a atribuição.

## O que conta como conversão

Palavras-chave de fechamento na conversa: agendado/confirmado, pagamento
recebido/confirmado, comprovante, PIX recebido, "paguei", nota fiscal, pedido
confirmado, contrato assinado, etc. Ajuste a expressão `CONVERSION_RE` em
`analisar.mjs` se o seu funil usar outros termos.

## Testes

```bash
pnpm vitest run scripts/whatsapp-analysis
```
