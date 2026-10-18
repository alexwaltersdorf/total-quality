# Incidente: status de lead gravado na coluna errada (21–22/09/2026)

Planilha `1yaOEHb3mwIh7GFP8F0796HyA3CoYtVs1OHs5BUHgNnU`, aba **Leads**.

## O que aconteceu

Entre **21/09 16:31:58 e 21/09 17:53:22** a aba Leads passou de 19 para 20
colunas: **"Observações" ocupou a posição 19** e **"Status do Lead" foi
empurrada para a 20**.

O webhook (`doPost` no Apps Script da planilha) continuou montando uma linha
de **19 posições** e gravando com `appendRow`, que escreve **por posição**.
A última posição da linha — o `Novo` inicial — passou a cair em
**Observações**, e "Status do Lead" ficou vazio.

## O tamanho real do estrago

Menor do que parece. **Nenhum dado de lead se perdeu nem trocou de coluna.**
Nome, telefone, e-mail, canal, origem, UTMs, referrer e session ID continuam
todos no lugar certo, nas seis linhas afetadas. O que desceu uma casa foi só
o status inicial.

Os leads também estão íntegros no banco de dados do site — a planilha é
cópia, não é a fonte.

### Linhas afetadas (6)

| Data/Hora | Nome | Onde foi parar o `Novo` |
| --- | --- | --- |
| 21/09/2026 17:53:22 | Tainara | Observações |
| 21/09/2026 17:54:16 | Aline Novaes | Observações |
| 21/09/2026 17:54:30 | Eliveltton | Observações |
| 21/09/2026 21:11:09 | Ana Clara Gonzales | Observações |
| 21/09/2026 21:23:29 | Ana Clara Gonzales | Observações |
| 22/09/2026 06:02:22 | Aisha Ribeiro Ferraz | Observações |

Último lead correto antes da quebra: **Jeane Hernandez, 21/09 16:31:58**
(`Novo` na coluna 20, Observações vazia).

## Por que ninguém foi avisado

A falha é silenciosa dos dois lados:

- o Apps Script **não reclama** de uma linha mais curta que o cabeçalho —
  `appendRow` simplesmente preenche da esquerda para a direita e para;
- o `syncLeadToSheet` do site **nunca lança erro de propósito**, para que uma
  falha na planilha não derrube o lead no banco.

A própria planilha já avisava, na aba de instruções: *"Se você editar/mover
colunas, ajuste também a ordem correspondente no Code.gs."* Só que isso é uma
instrução que depende de alguém lembrar, num arquivo que quase ninguém abre.

## A correção

`docs/scripts/gravar-lead-por-cabecalho.gs`.

Em vez de montar a linha por posição, o script **lê a linha 1 e monta a linha
na ordem atual dos cabeçalhos**. Isso resolve a classe inteira do problema:
inserir coluna, mover coluna, renomear aba, acrescentar as colunas de
agendamento do `status-de-leads.gs` — nada disso quebra mais. Coluna que o
site não conhece fica em branco; campo que o site manda e a planilha não tem
é ignorado.

### Como aplicar

1. Planilha → **Extensões → Apps Script**.
2. Cole o conteúdo de `gravar-lead-por-cabecalho.gs` num arquivo novo
   (ou no fim do `Code.gs`).
3. No `doPost`, **troque o `appendRow(...)` por**:

   ```js
   gravarLeadPorCabecalho(lead);
   ```

   Nada mais do `doPost` muda.
4. **Implantar → Gerenciar implantações → editar a implantação existente →
   Nova versão.** Sem isso a URL `/exec` continua servindo o código antigo.
5. Rode `conferirCabecalhos()` uma vez. Ele não grava nada: só mostra quais
   colunas o site alimenta, quais ficam em branco e se algum campo do site
   ficou sem coluna.

### Como reparar as 6 linhas

Rode `repararStatusDeslocado()` uma vez. Ele move o valor de Observações para
Status do Lead **apenas** quando as três condições valem juntas:

1. "Status do Lead" está vazio na linha;
2. "Observações" contém um valor que é reconhecidamente um status;
3. as duas colunas existem.

Uma observação escrita à mão pela equipe ("paciente pediu retorno na segunda")
não se parece com status nenhum e por isso não é tocada. Rodar duas vezes não
faz efeito na segunda.

Alternativa manual, já que são só 6 linhas: recortar o `Novo` de Observações e
colar em Status do Lead.

## O que isto não resolve

O webhook continua implantado como **"Qualquer pessoa"**. Quem tiver a URL
`/exec` insere linha na planilha. A correção aqui é de alinhamento de coluna,
não de acesso — o token no webhook continua pendente.
