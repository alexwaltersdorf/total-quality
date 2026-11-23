# Auditoria SEO e migração do blog — 23/11/2026

Base: main bfbc522, PRs abertos consultados. CLAUDE.md, SEO_STANDARDS.md, docs/seo-laboratorio-operacao.md, docs/seo-relatorio.md e docs/seo-plano.md lidos. PRs #94 e #101 foram integrados em 18/11; #107 em 20/11. Nenhum PR aberto consultado cobre o novo diagnóstico de migração. Documentos antigos são histórico, não evidência de estado atual.

## Produção e migração: comportamento observado

- Principal: **49 URLs do sitemap consultadas via HTTP**, metadados/JSON-LD/HTML inicial/imagens inventariados. A exceção já conhecida é `/cartao`: sem H1 e conteúdo inicial suficiente; preservada a decisão do Alex de 14/11 de não alterar essa página. Auditoria das 10 páginas prioritárias e 38 destinos internos: zero achados nos limites do script.
- Workflow `SEO laboratory health`: quatro execuções agendadas entre 19 e 22/11, todas aprovadas. Logs do job de 22/11 confirmam 10 páginas, 38 destinos e `issues: []`: https://github.com/alexwaltersdorf/total-quality/actions/runs/45055962532 . O agendamento nominal é 08:23 de São Paulo; houve atraso do GitHub. Ainda não há execução de 23/11 no momento consultado.
- Antigo blog: `robots.txt`, `sitemap.xml` e os três sitemaps filhos retornaram **200 por requisição direta**. Cinco URLs HTML no sitemap; três caminhos históricos da tabela de migração também foram consultados. Total conhecido: **oito páginas**, sem imagens contadas como páginas. Os dois `image:loc` são ativos externos, não páginas do inventário.
- Ferramenta de pesquisa falhou inicialmente em sitemap/robots. A requisição direta funcionou: isso não era prova de indisponibilidade do site. Resolução DNS local falhou neste ambiente; **não foi possível confirmar o CNAME/IP vigente**. Os cabeçalhos públicos `x-vercel-id`, `x-matched-path` e Next.js demonstram atendimento pela infraestrutura Vercel nesta amostra; o principal responde com `platform: hostinger`.
- **Migração inativa no acesso público observado**: nenhuma das oito URLs respondeu conforme o contrato preparado em `blog-subdominio.ts`. Código na main não equivale a apontamento/ativação do host. Não confundir essa pendência externa com defeito do resolver.
- Rascunhos novos `/blog/ultrassom-de-tireoide` e `/blog/tirzepatida-exames-e-falsificacao`: 200 com `noindex` e canonical próprio, fora do sitemap. Não são substitutos indexáveis publicados nem prova de duplicidade indexável entre os dois blogs.

| URL antiga (caminho) | HTTP público / destino observado | Contrato preparado após ativação |
|---|---|---|
| / | 200 (sem redirect) | 301 /blog |
| /category/dicas-de-saude | 200 (sem redirect) | 301 /blog |
| /category/exames-de-imagem | 200 (sem redirect) | 301 /blog |
| /posts/ultrassom-de-tireoide-para-que-serve-e-como-e-feito | 200 (sem redirect) | 301 /exames/ultrassonografia |
| /posts/tirzepatida-exames-de-acompanhamento-e-alerta-da-anvisa-sobre-falsificacao | 200 (sem redirect) | 301 /exames/exames-de-sangue |
| /posts/hipoglicemia-o-que-voce-precisa-saber-para-manter-sua-saude-em-dia | 404 (sem redirect) | 301 /blog/hipoglicemia-sintomas-e-exames |
| /posts/hormonios-do-amor-o-que-sao-e-como-agem | 404 (sem redirect) | 410 |
| /posts/hemograma-completo-o-que-ele-pode-revelar | 404 (sem redirect) | 301 /blog/hemograma-completo-o-que-avalia |

Os artigos históricos de hemograma e hipoglicemia retornam **404**, e precisam de redirecionamento para os equivalentes já publicados. Recuperar esses caminhos para os artigos equivalentes é prioridade da ativação externa. “Hormônios do amor” tem 410 previsto; o público ainda responde 404. Não foi criada URL hipotética.

Nos cinco HTML 200 do antigo blog: conteúdo já presente sem executar JS; canonical próprio e `index, follow`. Home e duas categorias têm dois H1. Os dois artigos têm JSON-LD Article sintaticamente válido, sem autor/revisor no objeto observado; quatro imagens internas não informam dimensões. Essas alterações pertencem à plataforma externa; não foram simuladas no repositório como se tivessem corrigido o site antigo.

## Correções preparadas e limites

- Novo inventário/auditor somente leitura no workflow existente, sem novo cron, sem IA paga, credenciais Google ou alteração do deploy. Lê sitemaps, links e inventário conhecido do repositório; registra HTTP, cadeia real, destino final, canonical, robots, HTML inicial, title, description, H1, sintaxe JSON-LD e atributos de imagens.
- Compara o público com a tabela usada pelo resolver do servidor. Extração da mesma tabela para JSON, sem mudança de status/destinos; testa também publicação futura dos rascunhos. Assim auditor e servidor não mantêm mapas manuais divergentes.
- Estado `inactive`/`partial` gera aviso explícito; **exit 0 não significa migração ativa**. Não falha o workflow apenas por uma ativação externa ainda pendente. Redirect errado/302/cadeia extra/noindex no destino gera erro; bloqueio/rede/sitemap ilegível torna o inventário parcial e retorna código 2, sem inventar status/conteúdo.
- Limites: 30 sitemaps, 200 páginas, oito saltos e timeout de 20 s por requisição. Inventário não garante todas as URLs históricas; exportações futuras de Indexação/Páginas e outros períodos do GSC podem acrescentar caminhos. Não busca credenciais nem presume acesso ao painel de DNS.
- Testes: **1.713 aprovados, 34 ignorados**, incluindo 11 casos do novo auditor; build Vite/esbuild concluído. `tsc --noEmit`: **13 erros herdados**, saída idêntica à main atual em worktree separado, sem erros novos. `git diff --check` sem falhas.
- Build local servido por HTTP: 10 páginas e 38 destinos internos sem achados. Testes com cabeçalho Host real para o blog antigo confirmam 301 absoluto para cada equivalente, fallback de rascunho para serviço e 410 do tema removido. Não foi usado fetch para falsificar Host: conferido com `http.get` nativo.
- Sem teste de navegador, Tag Assistant, Core Web Vitals ou Rich Results Test nesta rodada. Sem alterações clínicas, normativas, serviços, preços, horários, convênios, credenciais ou rastreamento. Não foi feita nova revisão médica.

## Plano de ativação e reversão — depende de autorização específica do Alex

1. Antes de qualquer mudança externa: exportar e guardar a zona DNS atual, o registro completo do subdomínio (tipo/alvo/TTL), vínculos de domínio/hosting e cópias dos artigos/ativos. A configuração exata não foi acessada nesta rodada; não preencher valores presumidos.
2. Confirmar responsável e janela de mudança. Validar domínio adicional e certificado TLS para o subdomínio no provedor de destino, sem mexer nos demais registros. Revisão competente dos rascunhos é uma decisão separada: enquanto pendentes, os destinos preparados são os serviços já publicados.
3. Somente com confirmação explícita do Alex, aplicar o apontamento específico documentado. Não alterar nameservers. Manter a plataforma anterior e seus conteúdos disponíveis durante validação e janela de reversão.
4. Conferir publicamente as oito URLs, robots/sitemaps, HTTPS e cadeia em uma etapa; destinos 200, indexáveis e com canonical próprio; artigos publicados realmente equivalentes. Monitorar erros 4xx/5xx, certificado e Search Console após propagação. O fallback dos rascunhos para serviço é decisão existente, não equivale a aprovação dos artigos.
5. Se houver certificado inválido, indisponibilidade ou destino incorreto, restaurar exatamente os registros/vínculos capturados no passo 1. Confirmar o retorno público ao comportamento anterior após propagação/cache. Não apagar cópias antigas nem desvincular provedor antes de encerrar essa janela com aprovação.
6. Remover/despublicar conteúdo externo é outra ação que requer confirmação explícita. Após estabilização autorizada, conferir sitemap/inspeção no GSC e manter acompanhamento por períodos completos de 28 dias. Nenhuma solicitação de indexação foi enviada nesta rodada.
