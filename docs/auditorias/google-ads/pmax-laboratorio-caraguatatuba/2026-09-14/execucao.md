# Registro de execução — 14/09/2026

Base de código antes da intervenção: `ac0a2f7e6cf812d409eec5c8bc8fef07ff3f04fb`.
Autorização: pedido do usuário para aplicar os ajustes da auditoria e documentá-los no repositório total-quality.
Fuso: America/Sao_Paulo.

## Mudanças implementadas no código

| ID | Antes | Depois | Escopo / motivo |
|---|---|---|---|
| WEB-01 | Hero, rodapé e botão flutuante sugeriam agendamento na página que informa coleta sem agendamento | CTAs de preparo/orçamento/dúvidas; mensagem coerente | Páginas de exames da categoria laboratório; demais páginas mantêm fluxo padrão |
| WEB-02 | “O QUE É O EXAMES DE SANGUE”, “FAÇA SEU EXAMES...” e texto pré-renderizado redundante | Concordância plural correta no React e pré-renderização | Página de exames de sangue |
| WEB-03 | Meta description no cliente/servidor sugeria agendamento | Descrição alinhada à coleta por ordem de chegada | Rota/canonical preservados |
| MED-01 | Abrir menu FAB emitia whatsapp_click; Iniciar Conversa emitia outro | Abertura emite select_content; início conserva um whatsapp_click | Botão flutuante em todo o site; remove sinal de conversão indevido |
| MED-02 | Sem etapa observável entre modal de nome e pedido de saída | whatsapp_modal_open + whatsapp_redirect_requested, ligados por flow_id efêmero | Provider global; observação de jornada, sem novos valores de venda |
| MED-03 | Validação do handler aceitava um caractere e não tinha trava síncrona | Mínimo de dois caracteres e trava contra envio repetido na tentativa | Provider global; não adiciona dados do formulário aos novos eventos |
| DOC-01 | Analytics descrevia ticket uniforme de R$249,60 e ROAS por clique como receita | Documentação aponta valores atuais por serviço e limita interpretação econômica | Nenhum ticket fornecido pelo negócio foi alterado |

## Google Ads — bloqueio real

Às aproximadamente 22h45–22h46, o editor recebeu 15 substituições de texto. Uma primeira tentativa retornou erro genérico; a tentativa seguinte mostrou:

> Você precisa criar uma chave de acesso para realizar esta ação

O Google informa que novas chaves podem levar de 1 a 2 dias para se conectar ao Ads. Criar/autenticar a chave exige ação do titular. O editor ficou aberto para continuidade. **Os anúncios não foram confirmados como salvos.**

Estado conhecido preservado: campanha pausada, orçamento R$39/dia, estratégia Maximizar valor da conversão. Demais alterações de mídia estão no plano pendente, não no histórico de aplicadas.

## Validação local

- Testes: **340 passaram, 34 ignorados**, 16 arquivos (12 passaram, 4 ignorados). Executados com `vitest run --configLoader runner` em 14/09/2026 às 22h49.
- Três testes novos cobrem sequência do FAB, associação das etapas, ausência de valor/dados do formulário e nova tentativa.
- TypeScript: **13 erros existentes**, em arquivos fora do diff; coincide com o limite documentado no CI. Nenhum erro nos arquivos alterados.
- Build do frontend: **concluído**, Vite com `--configLoader runner`.
- Build completo padrão será verificado pelo CI Linux. O esbuild local encontrou restrição de leitura de diretório ancestral no sandbox Windows; não se ampliaram permissões do sistema para contornar isso.
- Verificação de publicação e links de PR/commit: registrar ao final da execução.
- Navegador local: CTA, títulos plurais e rodapé conferidos; abrir e fechar o modal funcionou, com botão Continuar desabilitado para nome vazio. Nenhum contato de teste foi enviado.
- Nova tentativa de salvar no Ads, após o pedido “continue”, retornou erro genérico no editor. Sem confirmação de gravação; status pendente preservado.

## Limites

Os testes de código não comprovam recebimento no GA4, atribuição no Ads, ligação atendida ou venda. Nenhuma mensagem de teste foi enviada ao atendimento. A captura dos eventos novos depende do GTM; as pendências antigas de docs/analytics.md precisam ser revalidadas na versão publicada, não assumidas como atuais.

A alteração de contagem no FAB afeta todo o site e deve ser anotada nas demais campanhas. Não atribuir uma queda de conversões de clique automaticamente à perda de demanda.

A conta também exibe cobrança indisponível. Pagamento e identidade são ações do titular. Nenhuma reativação de mídia foi feita.
