# Guia de Admin — Total Quality Medicina Diagnóstica

Este documento descreve como usar os painéis de admin e dashboard da aplicação Total Quality para gerenciar conteúdo, usuários e agendamentos.

## Acesso aos Painéis

### Admin Panel

**URL:** `https://www.totalquality.med.br/admin`

O painel de admin é a interface de gerenciamento completa da aplicação. Acesso restrito a usuários com permissão de administrador.

### Dashboard

**URL:** `https://www.totalquality.med.br/dashboard`

O dashboard exibe métricas, relatórios e visualizações de dados em tempo real. Acesso restrito a usuários autenticados.

## Autenticação

### Login

1. Navegue até `https://www.totalquality.med.br/admin` ou `/dashboard`
2. Você será redirecionado para o portal de login Manus
3. Insira suas credenciais (email e senha)
4. Após autenticação bem-sucedida, você será redirecionado de volta ao painel

### Logout

Clique no botão "Sair" ou "Logout" no canto superior direito da página.

## Painel de Admin

### Seções Principais

O painel de admin é organizado em várias seções para gerenciar diferentes aspectos da aplicação:

#### 1. Gerenciamento de Exames

A seção de exames permite adicionar, editar e remover exames do catálogo.

**Funcionalidades:**
- Listar todos os exames disponíveis
- Adicionar novo exame com nome, descrição, categoria e preço
- Editar informações de exame existente
- Remover exame do catálogo
- Visualizar detalhes do exame (slug, URL, data de criação)

**Campos de Exame:**
- Nome do exame
- Slug (URL amigável)
- Descrição (texto longo)
- Categoria (Laboratório, Imagem, Cardiologia, Neurologia)
- Preço (opcional)
- Imagem de destaque
- Imagem de fundo (para páginas de exame)

#### 2. Gerenciamento de Blog

A seção de blog permite gerenciar artigos educativos sobre saúde e bem-estar.

**Funcionalidades:**
- Listar todos os artigos publicados
- Criar novo artigo com título, conteúdo e meta tags
- Editar artigo existente
- Publicar/despublicar artigos
- Remover artigos

**Campos de Artigo:**
- Título
- Slug (URL amigável)
- Conteúdo (Markdown)
- Resumo (para preview)
- Categoria (Medicina Preventiva, Exames Laboratoriais, Saúde do Coração, Nutrição, Bem-Estar)
- Imagem de destaque
- Meta description (para SEO)
- Data de publicação

#### 3. Gerenciamento de Usuários

A seção de usuários permite gerenciar contas de usuários e permissões.

**Funcionalidades:**
- Listar todos os usuários
- Criar novo usuário com email e permissões
- Editar permissões de usuário (admin, user)
- Remover usuário
- Resetar senha de usuário

**Campos de Usuário:**
- Email
- Nome completo
- Permissão (admin, user)
- Data de criação
- Último acesso

#### 4. Gerenciamento de Agendamentos

A seção de agendamentos permite visualizar e gerenciar agendamentos de pacientes.

**Funcionalidades:**
- Listar agendamentos por data ou status
- Visualizar detalhes do agendamento (paciente, exame, data/hora)
- Confirmar agendamento
- Cancelar agendamento
- Enviar lembretes por WhatsApp

**Campos de Agendamento:**
- Nome do paciente
- Email
- Telefone
- Exame solicitado
- Data e hora do agendamento
- Status (pendente, confirmado, cancelado)
- Notas

#### 5. Gerenciamento de Conteúdo

A seção de conteúdo permite editar seções estáticas do site.

**Funcionalidades:**
- Editar texto da home page
- Atualizar informações de contato
- Modificar descrições de seções
- Gerenciar links e CTAs

### Fluxo de Trabalho Típico

**Adicionar um novo exame:**

1. Acesse Admin → Exames
2. Clique em "Novo Exame"
3. Preencha os campos obrigatórios (nome, descrição, categoria)
4. Faça upload da imagem de destaque
5. Clique em "Salvar"
6. O exame aparecerá no catálogo do site

**Publicar um artigo de blog:**

1. Acesse Admin → Blog
2. Clique em "Novo Artigo"
3. Preencha título, conteúdo e categoria
4. Adicione meta description para SEO
5. Faça upload da imagem de destaque
6. Clique em "Publicar"
7. O artigo aparecerá na página de blog

**Gerenciar agendamento:**

1. Acesse Admin → Agendamentos
2. Visualize a lista de agendamentos pendentes
3. Clique em um agendamento para ver detalhes
4. Confirme ou cancele conforme necessário
5. Envie lembretes por WhatsApp se necessário

## Dashboard

O dashboard fornece uma visão geral do desempenho e atividade do site.

### Widgets Principais

#### 1. Estatísticas Gerais

Exibe métricas de alto nível:
- Total de agendamentos (este mês)
- Total de usuários
- Total de exames no catálogo
- Total de artigos publicados

#### 2. Gráfico de Agendamentos

Visualiza a tendência de agendamentos ao longo do tempo (últimos 30 dias).

#### 3. Exames Mais Solicitados

Lista os 5 exames mais agendados no período.

#### 4. Tráfego do Site

Exibe estatísticas de tráfego (visitantes únicos, visualizações de página, taxa de rejeição).

#### 5. Atividade Recente

Mostra ações recentes (novo artigo, novo agendamento, novo usuário).

### Filtros e Períodos

Use os filtros disponíveis para personalizar a visualização:
- **Período:** Últimos 7 dias, 30 dias, 90 dias, 1 ano
- **Categoria:** Filtrar por tipo de exame
- **Status:** Filtrar agendamentos por status

## Boas Práticas

### Segurança

- **Nunca compartilhe** suas credenciais de admin
- **Use senhas fortes** (mínimo 12 caracteres com números e símbolos)
- **Faça logout** ao terminar de usar o painel
- **Revise regularmente** as permissões de usuários

### Conteúdo

- **Mantenha descrições atualizadas** com informações precisas
- **Use slugs descritivos** para URLs amigáveis (ex: `hemograma-em-caraguatatuba`)
- **Adicione meta descriptions** para melhorar SEO
- **Revise ortografia** antes de publicar

### Agendamentos

- **Confirme agendamentos** assim que possível
- **Envie lembretes** 24 horas antes do agendamento
- **Mantenha informações de contato** atualizadas
- **Responda consultas** prontamente

## Troubleshooting

### Problema: Não consigo fazer login

**Solução:**
1. Verifique se está usando o email correto
2. Resete sua senha clicando em "Esqueci minha senha"
3. Verifique se sua conta tem permissão de admin
4. Limpe cookies do navegador e tente novamente

### Problema: Mudanças não aparecem no site

**Solução:**
1. Aguarde alguns segundos e recarregue a página (F5)
2. Limpe o cache do navegador (Ctrl+Shift+Delete)
3. Verifique se você clicou em "Salvar" ou "Publicar"
4. Verifique se há erros de validação no formulário

### Problema: Não consigo remover um exame

**Solução:**
1. Verifique se há agendamentos associados ao exame
2. Cancele ou remova os agendamentos primeiro
3. Tente remover o exame novamente
4. Se o problema persistir, entre em contato com o suporte

### Problema: Dashboard não carrega

**Solução:**
1. Verifique sua conexão com a internet
2. Recarregue a página (F5)
3. Tente em outro navegador
4. Limpe cookies e cache do navegador

## Contato e Suporte

Para dúvidas ou problemas com os painéis de admin:

- Consulte a documentação no GitHub: [README.md](./README.md)
- Verifique o guia de deployment: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Entre em contato com o time de desenvolvimento

## Recursos Adicionais

- **Documentação do Manus:** https://docs.manus.im
- **Guia de SEO:** Consulte as meta tags e schema markup no código
- **Backup de dados:** Veja instruções em [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Última atualização:** Abril de 2026  
**Versão:** 1.0
