
- [x] Criar tabelas no banco de dados (contatos, leads WhatsApp, analytics events, blog views)
- [x] Implementar APIs tRPC para persistir dados de contato do formulário
- [x] Implementar API para registrar cliques no WhatsApp (leads)
- [x] Implementar API para registrar eventos de analytics
- [x] Implementar API para contagem de visualizações do blog
- [x] Integrar formulário de contato com API backend
- [x] Integrar cliques de WhatsApp com API de leads
- [x] Integrar analytics com API de eventos
- [x] Integrar blog com contagem de visualizações
- [x] Atualizar dashboard para usar dados reais do banco
- [x] Escrever testes vitest para as APIs (19 testes passando)

## Painel Administrativo
- [x] Expandir schema: leads com telefone, endereço, cidade, estado, CEP
- [x] Expandir schema: rastreamento UTM (source, medium, campaign, term, content)
- [x] Expandir schema: tabela de sessões com tempo de visualização (25/50/75/100%)
- [x] Expandir schema: tabela de page_views com duração e scroll depth
- [x] Expandir schema: tabela de video_views com quartis de visualização
- [x] Expandir schema: tabela de conversões e funil
- [x] Implementar captura automática de UTM params no frontend
- [x] Implementar tracking de tempo de página e scroll depth
- [x] Implementar tracking de vídeo com quartis (25/50/75/100%)
- [x] Criar APIs tRPC para dashboard KPIs
- [x] Criar APIs tRPC para listagem e filtro de leads
- [x] Criar APIs tRPC para atribuição de canais/campanhas
- [x] Criar APIs tRPC para métricas de engajamento
- [x] Construir rota /admin protegida com autenticação
- [x] Dashboard principal com KPIs: total leads, taxa conversão, leads por canal, custo por lead
- [x] Gráficos: leads por dia/semana/mês, leads por fonte, funil de conversão
- [x] Tabela de leads com telefone, endereço, fonte, data
- [x] Página de campanhas: performance por canal e campanha
- [x] Página de engajamento: tempo de visualização, scroll, vídeo quartis
- [x] Página de remarketing: audiências baseadas em engajamento
- [x] Testes vitest para novas APIs (39 testes passando)

## Filtro por Intervalo de Datas
- [x] Substituir seletor de "últimos X dias" por date range picker com datas de início e fim
- [x] Adicionar presets rápidos (Hoje, Últimos 7 dias, Últimos 30 dias, Este mês, Mês passado, Personalizado)
- [x] Atualizar APIs para aceitar dateFrom/dateTo em vez de apenas "days"
- [x] Testar filtro de datas no painel (47 testes passando)
