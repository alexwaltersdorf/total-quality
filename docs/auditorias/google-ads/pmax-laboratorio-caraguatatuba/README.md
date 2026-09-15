# Auditoria e otimização — PMAX Laboratório Caraguatatuba

Campanha: **[PMAX] [LABORATÓRIO] Caraguatatuba** (23871640458).
Grupo: **Laboratório Caraguatatuba** (6715813765).
Auditoria: 14/09/2026, fuso America/Sao_Paulo.
Base histórica: **14/03/2026 a 13/09/2026**.

## Situação da execução

- **Site:** correções de jornada e medição implementadas; ver [registro de execução](2026-09-14/execucao.md) para testes e publicação.
- **Google Ads:** 15 substituições de texto preenchidas no editor. **Salvamento bloqueado pela exigência de chave de acesso do Google. Nenhuma alteração de campanha foi confirmada como salva.**
- **Campanha:** permanece pausada, com orçamento de R$ 39/dia. Não houve reativação nem aumento de verba.
- **Coleta dos novos eventos no GA4:** depende de configurar/conferir o GTM e validar Preview/GA4; não confundir código instrumentado com coleta comprovada.
- **Resultados após as mudanças:** ainda não existem. Os números abaixo são a linha de base.

A janela solicitada cobre seis meses, mas a campanha foi criada em 24/05 e pausada em 17/07. Março/abril e agosto/setembro não representam operação ativa. Não dividir o total por seis para definir orçamento ou potencial mensal.

## Arquivos

| Arquivo | Uso |
|---|---|
| [Linha de base mensal](2026-09-14/baseline-mensal.csv) | Exportação transcrita dos relatórios do Google Ads, congelada para comparação |
| [Antes/depois dos anúncios](2026-09-14/anuncios-antes-depois.csv) | Texto original, substituição preparada e status de salvamento |
| [Registro de execução](2026-09-14/execucao.md) | Mudanças, evidências, escopo e dependências reais |
| [Plano no Google Ads](2026-09-14/plano-google-ads.md) | Ajustes ainda pendentes e critérios para aplicá-los |
| [Indicadores e decisões](INDICADORES.md) | Definições, fórmulas, cadência e limites de interpretação |
| [Modelo semanal](monitoramento-semanal.csv) | Uma linha por semana/coorte; células vazias significam dado ausente |
| [Reversão](2026-09-14/reversao.md) | Como desfazer cada mudança sem apagar o histórico |

## Resumo da linha de base

| Indicador | Resultado |
|---|---:|
| Investimento | R$ 1.686,74 |
| Impressões | 18.481 |
| Cliques | 1.242 |
| CTR | 6,72% |
| CPC médio | R$ 1,36 |
| Conversões atribuídas pelo Google | 107,34 |
| CPA dessas ações | R$ 15,71 |
| Valor de conversão registrado | R$ 232,50 |
| Receita conciliada / pacientes conquistados | Não disponíveis |

105,34 conversões vêm de `Calls from Smart Campaign Ads` e 2,00 de `Contato via WhatsApp`. Essa composição mede ações da plataforma; não comprova 107 pacientes, contatos qualificados ou vendas. A ação WhatsApp foi criada em 02/08, depois da pausa: considerar atribuição retroativa antes de comparar períodos.

Em junho: CPA R$ 10,52, 71,67 conversões e R$ 753,62 de custo. Em julho: CPA R$ 33,61, 16,17 conversões e R$ 543,29. A alta de cerca de 219,5% merece investigação, mas os períodos têm durações/misturas diferentes e não provam a causa da piora.

## Rotina permanente

1. Criar uma pasta `AAAA-MM-DD` para cada rodada de otimização.
2. Congelar exportações por campanha e registrar fuso, intervalo, data de extração, filtros e definição das conversões.
3. Registrar antes, depois, motivo, responsável, horário, escopo, evidência de salvamento e reversão.
4. Separar mudanças de medição de mudanças de mídia. Comparações após correção de contagem exigem anotação.
5. Atualizar o modelo semanal com dados agregados. Não publicar nomes, telefones, pedidos médicos, mensagens, identificadores de pacientes ou credenciais neste repositório público.
6. Decidir a próxima mudança a partir de contato qualificado/exame realizado e margem; não da nota “Excelente” do anúncio.

Fonte primária da linha de base: relatórios da conta no Google Ads, observados em 14/09/2026. A transcrição não substitui uma exportação completa de todos os termos de pesquisa. Apenas os termos visíveis mais caros foram examinados.
