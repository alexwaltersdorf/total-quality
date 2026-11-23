# Operação de SEO e conteúdo laboratorial

## Estado verificado em 23/11/2026

PRs #94 e #101 integrados em 18/11. O workflow diário já está na main e suas
quatro execuções de 19 a 22/11 passaram. O blog antigo continua atendido pela
Vercel na amostra pública: merge do código não ativou a migração do host.
Search Console agora está acessível pela conexão Google existente.
Relatório público atual, inventário e plano de reversão:
[`seo-auditoria-2026-11-23.md`](seo-auditoria-2026-11-23.md).
As seções datadas abaixo preservam os resultados históricos das rodadas anteriores.

## Decisões desta revisão (03/11/2026)

- Preservar a intenção da home para laboratório em Caraguatatuba. A decisão já
  documentada no projeto é baseada no Search Console; não transferir esse alvo
  para `/laboratorio-caraguatatuba` sem dados novos por consulta e página.
- Landing de análises clínicas, serviço de exames de sangue, serviço de hemograma
  e artigos educativos têm papéis diferentes. Não aplicar canonical ou 301 entre
  eles por compartilharem palavras.
- As 54 consultas fornecidas pelo Alex somam 11.846 impressões e 134 cliques
  (CTR 1,13%). O período e filtros não foram fornecidos: estes números não são uma
  série histórica comparável aos 28 dias consultados anteriormente.
- Não inventar certificações, formação profissional, prazo, preço, horário de
  coleta ou processamento próprio de todos os exames. Confirmar esses dados com
  a operação antes de publicar alterações.
- `dateModified` registra esta edição. `lastReviewed` dos artigos alterados foi
  preservado em 22/10/2026: esta edição automatizada não é nova revisão médica.
  Validar os trechos clínicos e normativos do PR antes de publicar. Não alterar o
  status de revisão para simular aprovação.

## Fontes para as correções

- Jejum: https://www.endocrino.org.br/2016/12/15/consenso-sobre-recomendacao-do-perfil-lipidico/
- Hemograma: https://medlineplus.gov/lab-tests/complete-blood-count-cbc/
- Hipoglicemia: https://academic.oup.com/jcem/article/94/3/709/2596247
- Anvisa: https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2025/anvisa-esclarece-duvidas-sobre-servicos-que-realizam-exames-de-analises-clinicas-eac

## Diagnóstico diário de produção

O workflow `SEO laboratory health` executa `scripts/audit-seo.mjs` diariamente às
11:23 UTC (08:23 em São Paulo) e pode ser disparado manualmente no GitHub Actions.
Só passa a executar quando estiver na branch padrão. Atrasos do GitHub são possíveis.
Permissão somente de leitura; não depende de credenciais clínicas ou de IA paga.

Verifica home, landing, dois serviços e os seis artigos desta revisão:

- HTTP, Content-Type, noindex em meta e cabeçalho;
- title, description, H1 e canonical;
- presença e sintaxe de JSON-LD (não valida vocabulário Schema.org);
- presença de conteúdo pré-renderizado;
- destinos internos, sitemap e 404 real de rota inexistente.

Falhas ficam no resultado do job e no artefato JSON, retido por 30 dias. Bloqueio
anti-bot é relatado como impedimento de observação, nunca como queda de posição.
O script não mede rankings, Core Web Vitals, qualidade clínica ou presença nas IAs.
Não faz mudanças automáticas no site.

A extensão preparada em 23/11 acrescenta o job independente `blog-migration`,
executando `node scripts/audit-blog-migration.mjs --output /tmp/blog-migration.json`.
Usa o mesmo agendamento, sem credenciais adicionais. Inventaria sitemaps/links e
URLs históricas conhecidas; compara com a tabela compartilhada pelo resolver.
Artefato `seo-blog-migration`, retido por 30 dias. Estado `inactive`/`partial`
aparece como aviso, sem autorizar qualquer mudança externa. Exit 0 indica coleta
concluída sem erro técnico detectado, **não** migração ativa. Erro de redirect ou
destino noindex retorna 1; limitação de observação retorna 2, sem status inventado.
Esta extensão só executará no workflow após integração autorizada do novo PR.

```sh
node scripts/audit-seo.mjs
# Conferir o servidor local, mantendo o canonical de produção esperado:
node scripts/audit-seo.mjs --origin http://localhost:3000 --output /tmp/seo-audit.json
```

## Ciclo semanal de análise e correção

1. Atualizar checkout e ler CLAUDE.md, SEO_STANDARDS.md e PRs abertos.
2. Ler o diagnóstico e reproduzir falhas; distinguir rede/CDN de defeito no código.
3. Com acesso disponível, comparar Search Console por consulta, URL, dispositivo
   e país em períodos equivalentes de 28 dias. Nunca converter médias em posição
   fixa no Maps. Sem acesso, registrar a lacuna; não inventar métricas.
4. Priorizar consultas locais, depois dúvidas de hemograma e tipos de exames.
   Não alterar titles com base em um clique ou poucos dias de oscilação.
5. Corrigir defeitos reproduzíveis em branch isolada. Conteúdo clínico exige fontes
   primárias e revisão competente; não modificar preparação, oferta ou preços por
   inferência. Nenhum novo artigo clínico nasce publicado.
6. Executar testes, tipos e build. Não afrouxar guard-rails. Registrar falhas herdadas.
7. Abrir ou atualizar um PR com evidência, validação e riscos. Não criar PR duplicado.
   Não mergear automaticamente: neste projeto merge na main publica em produção.
8. Após publicação autorizada, repetir a auditoria e observar resultados por 28 dias.

## Pendências que exigem evidência externa

- Horário efetivo de coleta versus horário de atendimento e prazo por exame.
- Biografia, habilitação e escopo real de revisão de cada profissional.
- Documentos de qualidade e escopo de acreditação, se houver.
- Grade geográfica de Maps; ranking local depende do ponto de busca.
- Conciliação de contatos e agendamentos com origem orgânica usando a medição
  existente, sem criar eventos com dados pessoais ou dados clínicos sensíveis.
- Conferir o conteúdo ao vivo após deploy: o repositório já restringe convênios e
  superlativos, mas algumas versões recuperadas da web ainda exibiam texto antigo.

SEO/GEO: conteúdo rastreável, respostas claras, fontes e entidade consistente.
Não prometer ranking, citação em IA, rich result ou indexação garantidos.

## Verificação de 09/11/2026

- PR #101 continua aberto em rascunho; main ainda é 72bb06f. Não abrir PR duplicado.
- Auditoria HTTP de produção: 10 páginas e 33 destinos internos; nenhuma falha
  técnica detectada pelo script. As páginas responderam 200, e a rota inexistente
  respondeu 404. Canonical, H1, title, description, indexabilidade pública,
  sintaxe JSON-LD e presença no sitemap passaram nas verificações implementadas.
- O conteúdo de produção ainda contém as regras universais de jejum nas páginas
  de sangue/hemograma, a indicação de curva glicêmica pós-prandial no artigo de
  hipoglicemia e a RDC 302/2005 no artigo de escolha de laboratório. As correções
  desses achados já estão neste PR, aguardando revisão competente; não são
  novos problemas nem prova de falha do deploy, pois o PR não foi mergeado.
- O workflow SEO laboratory health ainda não existe na main; não há resultado
  diário desse workflow a interpretar como saúde ou falha de produção.
- Search Console sem acesso utilizável nesta execução. Não foi possível comparar
  dois períodos completos de 28 dias por consulta, URL, país e dispositivo.
  Nenhuma posição de Maps ou métrica de desempenho foi inferida.
- PRs #93 (padrão editorial), #94 (unificação do blog) e #99 (oferta de mamografia)
  seguem abertos. Esta verificação não replica esses escopos nem altera oferta.

- Revalidação do branch em 09/11: 1.045 testes aprovados, 34 ignorados nas
  condições previstas da suíte, e build Vite/esbuild concluído. O CI do commit
  anterior do PR também foi conferido e estava aprovado. Sem novo defeito
  técnico reproduzível, esta rodada apenas acrescenta evidências ao mesmo PR.

## Verificação e compatibilização de 16/11/2026

- Main atual: e9c8a0a (PR #105, SEO nov/2026, fases 0–7). PR #101 permanece
  em rascunho. Compatibilizado com a main atual, sem merge/publicação na main.
- Preservados SSR, novos metadados, referências, FAQs locais, restrições de
  serviços e rastreamento do #105. Descartada a constante de description de
  hemograma deste PR, pois a main já usa examesData como fonte única.
- A main já corrigiu RDC 978/2025 e controle externo no artigo de escolha de
  laboratório. Essas alterações foram preservadas, sem repetir correções antigas.
- A consulta direta de produção ainda encontrou jejum de 8 a 12 horas nas FAQs
  de sangue/hemograma e indicação de curva glicêmica pós-prandial no artigo de
  hipoglicemia. As correções seguem neste PR para revisão competente.
- Produção: 10 páginas e 38 destinos internos passaram no audit-seo.mjs. HTTP,
  canonical, H1, title, description, indexabilidade, JSON-LD sintaticamente válido,
  sitemap e 404 passaram nos limites do script. Isso não é medição de ranking.
- Build atualizado servido localmente: 10 páginas e 38 destinos internos, zero
  achados no mesmo script. 1.679 testes aprovados; 34 ignorados conforme a suíte.
- Build Vite/esbuild concluído. TypeScript ainda apresenta 13 erros em arquivos
  alheios ao diff (baseline conferida separadamente). Nenhum guard-rail afrouxado.
- Datas de modificação registram a edição; lastReviewed anterior foi preservado.
  Não ocorreu nova aprovação médica. Referências primárias de jejum e
  hipoglicemia foram reconferidas; não há ampliação de serviços ou protocolos.
- Workflow diário ainda ausente da main: só estará ativo após integração deste PR.
- Search Console sem acesso utilizável: não comparados períodos de 28 dias por
  consulta, página, país e dispositivo. Sem métricas ou posições de Maps inferidas.
- Auditoria completa com navegador, paridade de DOM, Core Web Vitals e validade
  semântica de Schema.org não foram medidos nesta execução. O PR #94 de
  unificação do blog segue aberto; seu escopo não foi duplicado.
