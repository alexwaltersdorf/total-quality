# A Ana travava em toda conversa sobre preço

**Data:** 10/09/2026 · **Fluxo:** ANA-01 · **Nó:** `Chamar Ana (2ª rodada)`

## O sintoma

A Ana respondia *"Só um instante, vou confirmar uma informação com a equipe e
já te retorno 😊"* e não voltava mais. Às vezes repetia a mesma frase quatro,
cinco vezes seguidas na mesma conversa.

## A causa

Essa frase é um **fallback**: o nó `Extrair Resposta` a usa quando o modelo
devolve texto vazio.

```js
if (!msg) {
  msg = 'Só um instante, vou confirmar uma informação com a equipe e já te retorno 😊';
  dados.escalar = true;
  dados.motivo_escalada = 'Falha na geração de resposta da IA — verificar execução no N8N';
}
```

O texto vinha vazio porque a **segunda rodada da Ana nunca era enviada**. O
header de autorização do nó estava assim:

```
={{ $env.ANTHROPIC_API_KEYBearer {{ $env.OPENAI_API_KEY }} }}
```

`{{ }}` aninhado dentro de `{{ }}` — o n8n resolve isso como `invalid syntax`,
o nó devolve `{"error":"invalid syntax"}` e a requisição jamais sai. É sobra da
migração Anthropic → OpenAI, o mesmo defeito que quebrou a ANA-04 em 27/08 e
que não foi verificado aqui na época.

A segunda rodada só acontece quando a Ana **consulta a tabela de preços**.
Ou seja: toda conversa que chegava em preço morria nesse fallback.

## O tamanho

Desde 26/08, quando a migração entrou:

| | |
|---|---|
| Vezes que o fallback saiu | **291** |
| Pacientes atingidos | **195** |
| Viraram agendamento | 17 |
| Terminaram sem nada | **172** |

Entre 16 e 22 pacientes por dia — justamente os que perguntavam preço, os mais
próximos de fechar.

## A correção

Dois ajustes no fluxo, ambos alinhando a segunda rodada com a primeira, que
sempre funcionou:

1. **`Chamar Ana (2ª rodada)`**
   - header: `=Bearer {{ $env.OPENAI_API_KEY }}`
   - corpo: `={{ JSON.stringify($json.openai_body) }}` — `openai_body` é objeto,
     e a primeira rodada já usava `JSON.stringify`

2. **`Enviar Preços à Ana`** — o modelo é de raciocínio e a chamada roda com
   `store: false`. Ao continuar depois de uma `function_call`, os itens de
   `reasoning` que a precedem precisam voltar no input:

```js
const priorOutput = (first.output || [])
  .filter(i => i.type === 'function_call' || i.type === 'reasoning');
```

## O que conferir

A correção só se prova numa conversa real que chegue em preço. Para checar:

```sql
SELECT (created_at AT TIME ZONE 'America/Sao_Paulo')::date AS dia, count(*)
FROM ana_mensagens
WHERE role='assistant' AND conteudo ILIKE '%vou confirmar uma informa%'
  AND created_at >= '2026-09-10'
GROUP BY 1 ORDER BY 1;
```

Se continuar saindo depois de 11/09, a causa é outra.
