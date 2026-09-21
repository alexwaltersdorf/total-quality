# Notificação de leads — diagnóstico e conserto

**21/09/2026.** O Alex preencheu um lead de teste às 21:43 (BRT), conferiu
`alex@totalquality.med.br` e não recebeu nada. Não era falha de entrega: **o
site nunca enviou e-mail nenhum.**

## O que o código realmente faz

`server/routers.ts` chama `notifyOwner()` depois de gravar um lead ou um
contato. O comentário acima da chamada dizia, até hoje:

```
// Notificação automática para sac@totalquality.med.br
```

Três coisas erradas nessa linha:

1. **`notifyOwner()` não envia e-mail.** Ela faz um POST para
   `webdevtoken.v1.WebDevService/SendNotification` — o serviço de notificação
   do **Manus**, a plataforma onde o site foi originalmente construído.
2. **O payload não tem destinatário.** É `{ title, content }` e nada mais
   (`server/_core/notification.ts`). Não existe campo `to` em lugar nenhum;
   `sac@totalquality.med.br` não aparece no código fora desse comentário.
3. **O endereço do serviço vem de `BUILT_IN_FORGE_API_URL`**, uma variável
   injetada pelo ambiente do Manus. O site roda na Hostinger desde então. Sem
   essa variável, `notifyOwner()` lança logo na primeira linha, o `try/catch`
   de `routers.ts` engole a exceção e registra um aviso no log. Na prática, a
   chamada não avisa ninguém.

Confirmação independente: não há `nodemailer`, `resend`, `sendgrid`,
`mailgun`, `postmark` nem qualquer cliente SMTP em `package.json`, e nenhum
`import` de biblioteca de e-mail no código.

**Quem avisa a clínica hoje é só a planilha** (`Total_Quality_Leads`, via
`server/_core/googleSheetsSync.ts`). Essa parte funciona — o lead de teste
chegou lá no mesmo minuto.

## Conserto A — e-mail pela própria planilha (recomendado, sem credencial nova)

A planilha já recebe todo lead por webhook. O Apps Script que grava a linha
pode mandar o e-mail no mesmo passo, usando a conta Google da clínica. Não
precisa de provedor, de credencial no servidor nem de deploy.

Em **Extensões › Apps Script**, acrescente esta função ao arquivo existente:

```js
/**
 * Avisa a equipe por e-mail a cada lead novo.
 * Chamar no fim do doPost, depois do appendRow.
 */
function avisarPorEmail(lead) {
  // Separe por vírgula para mais de um destinatário.
  var DESTINATARIOS = 'alex@totalquality.med.br';

  var campos = [
    ['Nome', lead.name],
    ['Telefone', lead.phone],
    ['E-mail', lead.email],
    ['Origem', lead.source],
    ['Página', lead.page],
    ['Canal', lead.channel],
    ['Campanha', lead.utmCampaign],
    ['Termo', lead.utmTerm]
  ];

  var corpo = campos
    .filter(function (c) { return c[1]; })
    .map(function (c) { return c[0] + ': ' + c[1]; })
    .join('\n');

  var canal = lead.channel || lead.utmSource || lead.source || 'Direto';

  MailApp.sendEmail({
    to: DESTINATARIOS,
    subject: 'Novo lead: ' + (lead.name || 'Anônimo') + ' (' + canal + ')',
    body: corpo + '\n\nPlanilha: ' +
          SpreadsheetApp.getActiveSpreadsheet().getUrl()
  });
}
```

E, no `doPost`, logo depois do `appendRow`:

```js
// O e-mail nunca pode derrubar a gravação: a linha na planilha vale mais.
try { avisarPorEmail(lead); } catch (e) { console.warn(e); }
```

> A variável com o lead pode ter outro nome no seu `doPost` (`dados`, `body`,
> `payload`). Use o mesmo nome que já alimenta o `appendRow`.

Depois de salvar, **Implantar › Gerenciar implantações › editar › Nova versão**
— o Apps Script só passa a usar o código novo na versão implantada.

**Cota.** `MailApp` permite 100 destinatários/dia numa conta Gmail comum e
1.500 numa conta Workspace. O site recebe ~15 leads/dia, então sobra folga.

## Conserto B — envio pelo servidor

Mais robusto (não depende da planilha) e mais trabalhoso: exige um provedor e
uma credencial nova em `server/_core/env.ts`. A Hostinger já oferece SMTP nas
contas de e-mail do domínio, então dá para fazer sem contratar nada.

Faz sentido se, mais para frente, o aviso precisar sair mesmo quando o webhook
da planilha estiver fora do ar. Hoje os dois falham juntos por motivos
diferentes, e o A resolve em minutos.

## LGPD

O e-mail leva contato (nome, telefone, e-mail) e a página de origem — e a
página revela o exame procurado, que é dado de saúde. Isso é uso operacional
da própria clínica, o mesmo da planilha, e é legítimo. Duas regras práticas:

- mandar **só para endereços da clínica**, nunca para conta pessoal de
  terceiro ou para agência;
- não encaminhar esses e-mails para fora da equipe que atende o paciente.

## O que ficou travado

`server/notificacao-guardrails.test.ts` quebra o build se o comentário
"Notificação automática para <e-mail>" voltar, e se `notifyOwner()` passar a
ter destinatário sem que esta documentação seja revista. O erro custou um
teste e uma expectativa frustrada: comentário que promete o que o código não
faz é pior que comentário nenhum.
