# Configuração do Webhook do AutoSEO

## O que é o Webhook?

O webhook permite que o AutoSEO envie novos artigos **em tempo real** para seu site, sem depender de sincronização agendada. Quando um novo artigo é publicado no AutoSEO, ele é automaticamente criado no seu blog.

## Endpoint do Webhook

```
POST https://totalquality.med.br/api/webhooks/autoseo
```

## Autenticação

O webhook usa **Bearer Token** para validação segura:

```
Authorization: Bearer aseo_wh_3e45279ebbff6bc29474d6aefd9e2c78
```

## Formato do Payload

O AutoSEO envia um JSON com a seguinte estrutura:

```json
{
  "articles": [
    {
      "id": "artigo-id-unico",
      "title": "Título do Artigo",
      "slug": "titulo-do-artigo",
      "content": "<p>Conteúdo HTML do artigo</p>",
      "excerpt": "Resumo do artigo",
      "heroImage": "https://exemplo.com/imagem.jpg",
      "category": "Saúde",
      "publishedAt": "2026-05-25T10:00:00Z",
      "status": "published"
    }
  ]
}
```

## Campos Obrigatórios

- `id` - ID único do artigo no AutoSEO
- `title` - Título do artigo
- `slug` - URL slug (ex: "titulo-do-artigo")
- `content` - Conteúdo HTML completo do artigo
- `status` - Status de publicação ("published" ou "draft")

## Campos Opcionais

- `excerpt` - Resumo/descrição curta
- `heroImage` - URL da imagem de capa
- `category` - Categoria do artigo (padrão: "Saúde")
- `publishedAt` - Data de publicação (ISO 8601)

## Respostas

### Sucesso (200)
```json
{
  "success": true,
  "processed": 1,
  "failed": 0,
  "message": "1 artigo(s) sincronizado(s) com sucesso"
}
```

### Erro de Autenticação (401)
```json
{
  "success": false,
  "message": "Token de autorização inválido ou ausente"
}
```

### Erro de Validação (400)
```json
{
  "success": false,
  "message": "Campo 'articles' é obrigatório e deve ser um array"
}
```

### Sucesso Parcial (207)
```json
{
  "success": false,
  "processed": 1,
  "failed": 1,
  "errors": [
    "artigo-2: Erro ao processar artigo"
  ],
  "message": "1 artigo(s) sincronizado(s), 1 falharam"
}
```

## Como Configurar no AutoSEO

1. Acesse sua conta AutoSEO
2. Vá para **Configurações** → **Webhooks**
3. Clique em **Adicionar Webhook**
4. Preencha os campos:
   - **URL**: `https://totalquality.med.br/api/webhooks/autoseo`
   - **Token**: `aseo_wh_3e45279ebbff6bc29474d6aefd9e2c78`
   - **Eventos**: Selecione "Artigo Publicado"
5. Clique em **Salvar**

## Teste do Webhook

Para testar o webhook, você pode usar `curl`:

```bash
curl -X POST https://totalquality.med.br/api/webhooks/autoseo \
  -H "Authorization: Bearer aseo_wh_3e45279ebbff6bc29474d6aefd9e2c78" \
  -H "Content-Type: application/json" \
  -d '{
    "articles": [
      {
        "id": "test-123",
        "title": "Artigo de Teste",
        "slug": "artigo-de-teste",
        "content": "<p>Conteúdo do artigo</p>",
        "status": "published"
      }
    ]
  }'
```

## Sincronização Automática vs Webhook

| Recurso | Sincronização Automática | Webhook |
|---------|--------------------------|---------|
| **Frequência** | 1x ao dia (2:00 AM) | Em tempo real |
| **Latência** | Até 24 horas | Segundos |
| **Uso** | Backup/sincronização | Publicação rápida |
| **Ativo** | ✅ Sempre ativo | ✅ Sempre ativo |

Ambos funcionam simultaneamente, garantindo que seus artigos estejam sempre sincronizados.

## Monitoramento

Os logs do webhook aparecem no servidor:

```
[AutoSEO Webhook] Processados 1 artigos, 0 falharam
```

Para ver os logs em tempo real:

```bash
# No servidor
tail -f /home/ubuntu/total-quality/.manus-logs/devserver.log | grep "AutoSEO Webhook"
```

## Suporte

Se o webhook não funcionar:

1. Verifique se o Bearer Token está correto
2. Verifique se a URL é acessível (teste com curl)
3. Verifique os logs do servidor
4. Confirme que o payload está no formato correto

## Segurança

- ✅ Bearer Token obrigatório
- ✅ Validação de formato
- ✅ Validação de campos obrigatórios
- ✅ Logs de todas as requisições
- ✅ Tratamento de erros seguro
