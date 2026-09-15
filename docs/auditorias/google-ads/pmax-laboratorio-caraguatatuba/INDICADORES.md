# Indicadores para futuras otimizações

## Dicionário

| Indicador | Fórmula / fonte | Interpretação |
|---|---|---|
| Investimento | Custo do Google Ads, BRL | Usar a campanha e período corretos |
| CTR | Cliques / impressões × 100 | Atratividade, não qualidade comercial |
| CPC | Custo / cliques | Preço do tráfego |
| Taxa de conversão Google | Conversões / interações elegíveis × 100 | Na PMAX pode diferir de conversões / cliques |
| CPA de ações Google | Custo / conversões atribuídas | Linha de base R$ 15,71; não é CAC de paciente |
| Custo por contato qualificado | Custo / contatos únicos qualificados atribuídos | Indicador principal proposto |
| Taxa de qualificação | Qualificados / contatos únicos × 100 | Deduplicar WhatsApp e ligação da mesma oportunidade no CRM privado |
| Taxa de realização | Pacientes com exame realizado / qualificados × 100 | Usar a mesma coorte de aquisição |
| CAC de paciente | Custo / novos pacientes atribuídos com exame realizado | Separar novos e recorrentes |
| ROAS de receita | Receita efetivamente conciliada / custo | Não usar valor fictício ou ticket de clique como receita |
| Retorno de contribuição | (Receita − custos variáveis − mídia) / mídia | Depende dos custos e margem informados pelo negócio |
| Conclusão do modal | Fluxos com saída solicitada / fluxos com modal aberto × 100 | Mesma coorte por flow_id; não comprova mensagem |
| Abandono do modal | 1 − conclusão do modal | Fechar janela de observação antes de concluir |
| Tempo de primeira resposta | Mediana e p90 no atendimento | Medir em horário útil e separar fora do expediente |
| Ligações atendidas | Atendidas / tentativas mensuráveis × 100 | Validar relatório de chamadas e limiar da conversão |
| Custo sem resultado qualificado | Custo por termo/canal/área sem qualificação | Só com atribuição e cobertura suficientes |

**Denominador zero:** escrever N/D, nunca infinito ou zero inventado. **Dado indisponível:** célula vazia. Zero deve significar medição válida sem ocorrências. Receita e pacientes ainda não foram disponibilizados; não preencher estimativas como realizados.

## Metas econômicas

Não há meta de CPL/CAC validada na auditoria. Definir:
- CAC máximo = margem de contribuição disponível por novo paciente × parcela aprovada para aquisição.
- CPL qualificado máximo = CAC máximo × taxa de realização dos qualificados.
- ROAS de equilíbrio = 1 / margem de contribuição percentual, quando receita e custos forem comparáveis.

Manter a origem, data e aprovação dos valores. A tabela de tickets do site foi informada pelo negócio; preço do serviço por clique continua sendo um indicador aproximado, não receita.

## Cadência

- **Antes de reativar:** cobrança regularizada, chave de acesso disponível, alterações salvas, conversões testadas, política de saúde revisada e capacidade de atendimento confirmada.
- **Primeiros 7 dias ativos:** verificar diariamente entrega, orçamento, destinos, termos inadequados, integridade dos eventos e resposta do atendimento. Corrigir falhas técnicas imediatamente.
- **Semanal:** preencher a planilha, reconciliar CRM, revisar termos e ações de conversão. Comparar 7 dias equivalentes com indicação de dados preliminares.
- **A cada 14 dias ativos:** revisar CPL qualificado, realização, canais e horários; evitar reagir ao CPA de um único dia.
- **Mensal:** fechar receita/custos por coorte e atualizar CAC/ROAS real. Reexportar períodos passados para identificar conversões tardias, preservando a extração original.

Mudanças de lance/orçamento precisam de volume e atraso de conversão conhecidos. Como regra operacional inicial, só interpretar variação de CPL quando houver pelo menos 20 qualificados na janela ou acumular mais tempo; isso é um limite de revisão, não uma garantia de significância. Não aumentar verba enquanto a medição estiver quebrada.

## Gatilhos de investigação

- Gasto com destino errado ou serviço não prestado: corrigir assim que confirmado.
- Conversões zeradas com cliques após uma publicação: validar tags e atendimento antes de culpar mídia.
- CPL qualificado > meta acordada por duas janelas comparáveis já maturadas: investigar termos, atendimento e oferta antes de mexer no lance.
- Crescimento de cliques sem aumento de qualificados: revisar intenção e critérios de conversão.
- Alteração automática de estratégia/orçamento: conferir histórico e restaurar apenas após comparar o estado anterior registrado.
- Queda de `whatsapp_click` após este deploy: descontar a retirada do evento indevido `fab_open` antes de interpretar como queda comercial.

## Coleta

Google Ads: custo, impressões, cliques, interações, conversões por ação, termos, canais, dispositivos e geografia, sempre filtrados na campanha 23871640458.
GA4/GTM: eventos de jornada após validação da tag e do consentimento; medir campanhas com identificação consistente.
Atendimento/CRM: contatos únicos, qualificação, novo/recorrente, exame realizado, receita e resposta. Relatórios publicados devem ser agregados.

O novo `flow_id` serve somente à tentativa do modal. Não é identificador de paciente, não persiste e não deve ser cruzado com nome, telefone ou informação de saúde. Não registrar como dimensão personalizada de alta cardinalidade no GA4.
