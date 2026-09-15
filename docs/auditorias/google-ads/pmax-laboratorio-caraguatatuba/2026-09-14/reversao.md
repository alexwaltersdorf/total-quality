# Reversão

## Site

Usar um commit de reversão dos arquivos desta intervenção, com PR e CI. Não usar reset/force-push nem apagar esta pasta. O commit anterior é ac0a2f7e6cf812d409eec5c8bc8fef07ff3f04fb; revisar mudanças posteriores antes de reverter.

- Copy: reverter somente WEB-01/02/03 se necessário, preservando outras alterações.
- Medição: não voltar a contar abertura do FAB como contato por causa de uma queda aparente de conversões. Primeiro conferir as duas etapas reais.
- Se os eventos novos causarem problema, retirar seus gatilhos da tag GA4 e/ou suas chamadas no provider; manter whatsapp_click original. Registrar janela sem coleta.
- Se houver erro de navegação, verificar o modal, trava de envio e popup antes de reverter todo o site.
- Reversão de frontend não desfaz configurações no GTM ou no Ads; cada sistema exige registro próprio.

## Google Ads

Como o salvamento foi bloqueado, **não há mudança salva de anúncio a reverter nesta rodada**. O CSV preserva os textos originais para referência futura. Se os textos preparados forem salvos após a chave de acesso, registrar data, responsável e confirmação no grupo.

Não restaurar uma promessa não comprovada de prazo para melhorar a nota do anúncio. A coluna “antes” é evidência histórica, não recomendação editorial.

Quando as configurações pendentes forem aplicadas, registrar também o estado anterior:
- Estratégia: Maximizar valor da conversão, sem ROAS-alvo.
- Expansão de URL e personalização de texto: ativadas.
- Orçamento: R$39/dia; campanha pausada.
- Programação geral: 24h; recurso de chamada requer leitura do seu próprio agendamento antes da edição.

Reativação da campanha nunca deve fazer parte de uma reversão automática.
