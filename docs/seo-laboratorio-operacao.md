# Operação de SEO e conteúdo laboratorial

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
