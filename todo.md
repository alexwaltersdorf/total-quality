
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

## Sistema de Tags para Leads
- [x] Criar tabela de tags (id, nome, cor, categoria, descrição)
- [x] Criar tabela de relação lead_tags (lead_id, tag_id)
- [x] Implementar APIs CRUD para tags (criar, listar, editar, excluir)
- [x] Implementar APIs para associar/desassociar tags de leads
- [x] Implementar filtro de leads por tags no painel
- [x] Criar UI de gestão de tags (criar, editar cores, excluir)
- [x] Adicionar seletor de tags na tabela de leads
- [x] Adicionar filtro por tags na aba de Leads
- [x] Exibir tags nos KPIs do dashboard (leads por tag)
- [x] Testes vitest para APIs de tags (61 testes passando)

## Gerador de UTM no Painel
- [x] Criar aba "UTM Builder" no painel administrativo
- [x] Formulário para gerar links UTM com source, medium, campaign, term, content
- [x] Presets por plataforma (Facebook, Instagram, Google Ads, TikTok, YouTube)
- [x] Botão de copiar link gerado para clipboard
- [x] Guia passo a passo para configurar UTM em cada plataforma
- [x] Histórico de links UTM gerados (integrado ao painel)

## Login Admin com Email/Senha
- [x] Criar API de login com email/senha no backend
- [x] Hash de senha com bcrypt para segurança
- [x] Gerar JWT token para sessão autenticada
- [x] Criar tela de login personalizada no /admin
- [x] Configurar credenciais como secrets do ambiente
- [x] Testes vitest para API de login (66 testes passando)

## Sitelinks de Exames
- [x] Criar página individual: Exames de Sangue
- [x] Criar página individual: Tomografia Computadorizada
- [x] Criar página individual: Raio-x
- [x] Criar página individual: Ultrassonografia
- [x] Criar página individual: MAPA
- [x] Criar página individual: Holter
- [x] Criar página individual: Espirometria
- [x] Criar página individual: Eletrocardiograma
- [x] Criar página individual: Eletroencefalograma
- [x] Criar página individual: Exame Toxicológico
- [x] Adicionar sitelinks na navegação do site (dropdown "Nossos Exames")
- [x] Adicionar sitelinks no footer (coluna dedicada)
- [x] Configurar rotas no App.tsx (/exames/:slug)
- [x] SEO: meta tags, title e description para cada página de exame

## Bug Fix - Login Admin
- [x] Corrigir login admin que retorna "Email ou senha incorretos" (email era .me.br, corrigido para .med.br)

## Correção Contatos + Filtro + Exportação
- [x] Corrigir formulário de contato para salvar dados reais (limpar dados de teste do banco)
- [x] Limpar dados de teste do banco de dados
- [x] Adicionar filtro de datas na aba Contatos + filtro por status
- [x] Implementar exportação de contatos para CSV
- [x] Implementar exportação de contatos para Excel (.xls)
- [x] Implementar exportação de contatos para PDF (via impressão)

## Exportação de Leads + Notificações Email
- [x] Adicionar botões de exportação Excel/CSV/PDF na aba Leads
- [x] Exportação inclui: nome, email, telefone, endereço, canal, campanha, tags, data
- [x] Configurar notificação automática ao receber novo contato (via notifyOwner)
- [x] Configurar notificação automática ao receber novo lead (via notifyOwner)
- [x] Testes vitest passando (66 testes)
- [x] Imagem de tomografia computadorizada adicionada à página do exame

## Vídeo Scroll-Driven na Tomografia
- [x] Converter TOMOGRAFIA.avi para MP4 (H.264, keyframe a cada frame)
- [x] Upload do vídeo para CDN (CloudFront)
- [x] Adicionar campo videoUrl à interface ExamData
- [x] Criar componente ScrollVideo com scroll-driven video scrubbing
- [x] Integrar ScrollVideo na ExamePage entre "O que é" e "Quando Realizar"
- [x] Barra de progresso visual durante o scroll
- [x] Indicador "Role para explorar" no início
- [x] Testes vitest passando (66 testes)
- [x] Transição suave na barra de progresso (gradient glow, lerp animation, fade-in do percentual)
- [x] Correção do loading overlay (verificação de readyState no mount)
