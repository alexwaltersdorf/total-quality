# 💰 Controle Financeiro Pessoal

Sistema de controle de gastos pessoais integrado ao painel, com **lançamento de despesas por foto** (a IA lê o comprovante e extrai os dados automaticamente), **dashboard analítico** e **fechamento mensal**.

## Acesso

- URL: **`/financas`**
- Login: as **mesmas credenciais do painel administrativo** (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
  As finanças são pessoais, por isso ficam atrás do login de administrador.

## Funcionalidades

### 📸 Lançar por Foto
1. Tire uma foto (ou selecione a imagem) do comprovante / cupom / nota fiscal.
2. A IA (visão computacional) lê a imagem e preenche automaticamente:
   - Estabelecimento, valor total, categoria, forma de pagamento, data e itens da nota.
3. Revise os dados sugeridos e clique em **Salvar gasto**.
4. Também é possível lançar manualmente, sem foto.

A imagem do comprovante é guardada e pode ser reaberta depois na lista de gastos.

### 📊 Dashboard
KPIs (total gasto, nº de lançamentos, ticket médio, média diária) e gráficos:
- Gastos por dia (área)
- Distribuição por categoria (pizza)
- Evolução mensal dos últimos 12 meses (linha)
- Gastos por forma de pagamento (barras)
- Onde você mais gastou (ranking de estabelecimentos)
- Acompanhamento de orçamentos do mês

Filtro de período no topo (este mês, 30/90/180 dias, último ano).

### 🧾 Gastos
Lista completa com busca, filtro por categoria, edição, exclusão e visualização do comprovante.

### 📅 Fechamento Mensal
Resumo fechado do mês com comparação percentual em relação ao mês anterior, quebra por
categoria (com orçamento), distribuição e ranking de estabelecimentos.
Botão **Exportar PDF** gera um relatório do mês.

### 🎯 Orçamentos
Defina um limite de gasto mensal por categoria. O acompanhamento (gasto x limite)
aparece no Dashboard e no Fechamento.

## Banco de dados

Duas tabelas novas: `expenses` (gastos) e `budgets` (orçamentos por categoria).

A migração fica em `drizzle/0006_sharp_thunderbolts.sql`. Para aplicá-la:

```bash
pnpm db:push
```

> Requer `DATABASE_URL` configurada. O deploy que já roda migrações Drizzle aplica
> essas tabelas automaticamente.

## Variáveis de ambiente utilizadas

Nenhuma variável nova é necessária — o módulo reaproveita as já existentes:

- `DATABASE_URL` — banco MySQL.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — login de acesso.
- `BUILT_IN_FORGE_API_URL` / `BUILT_IN_FORGE_API_KEY` — usadas pela IA de leitura de
  comprovantes (visão) e pelo storage que guarda as fotos.

## Arquitetura (para desenvolvedores)

| Camada | Arquivo |
| --- | --- |
| Schema (tabelas) | `drizzle/schema.ts` (`expenses`, `budgets`) |
| Migração SQL | `drizzle/0006_sharp_thunderbolts.sql` |
| Helpers de banco / agregações | `server/db.ts` (seção *EXPENSES* / *BUDGETS*) |
| Leitura de comprovante (IA + storage) | `server/_core/receiptAnalysis.ts` |
| API tRPC | `server/routers.ts` (router `finance`) |
| Constantes compartilhadas | `shared/finance.ts` (categorias, formas de pagamento, cores) |
| Interface | `client/src/pages/Financas.tsx` |
| Rota | `client/src/App.tsx` (`/financas`, `/financas/:tab`) |
