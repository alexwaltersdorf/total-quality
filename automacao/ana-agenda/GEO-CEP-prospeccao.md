# Localização da empresa pelo CEP

Sistema que pega o CEP de uma empresa e devolve onde ela está, a que distância
da clínica, e em qual anel de 10 km ela cai. Construído em 22/10/2026 para a
prospecção B2B de medicina do trabalho.

| peça | onde |
|---|---|
| código da função | `automacao/ana-agenda/edge-cep.ts` |
| esquema e funções SQL | `automacao/ana-agenda/geo-cep.sql` |
| em produção | edge function `cep`, projeto `ajwhrmjzvfdjwsqynbzt` |

## Como chamar

```bash
curl -X POST "https://<projeto>.supabase.co/functions/v1/cep" \
  -H "Authorization: Bearer <chave>" -H 'content-type: application/json' \
  -d '{"ceps":["11660-010","11677000"]}'
```

| corpo | o que faz |
|---|---|
| `{"ceps":[...]}` | resolve a lista (até 200 por chamada) |
| `{"pendentes":100}` | puxa da fila `geo_cep_pendentes` — CEPs de empresas sem ponto |
| `{"refinar":30}` | troca ponto aproximado por endereço geocodificado |
| `{"revalidar":true}` | ignora o cache e consulta de novo |

Toda chamada roda também `geo_cep_reclassifica()` e `prospeccao_aplica_geo()`,
então a empresa já sai com `latitude`, `longitude`, `km_da_clinica` e
`anel_10km` carimbados. O resultado da operação se lê em `prospeccao_anel`.

## A armadilha que define o desenho

As fontes gratuitas de CEP devolvem, em boa parte do interior, **o centro do
município no lugar do ponto da rua — sem sinalizar**. Em Caraguatatuba isso é a
regra, não a exceção: 7 CEPs testados, de bairros diferentes, voltaram todos na
mesma coordenada.

O efeito num anel de 10 km:

| CEP | bairro | antes | depois do refino |
|---|---|---|---|
| 11677000 | Massaguaçu | 0,25 km — anel 1 | **25,73 km — anel 3** |
| 11670000 | Barranco Alto | 0,25 km — anel 1 | 8,18 km — anel 1 |
| 11676000 | Balneário Califórnia | 0,25 km — anel 1 | 6,48 km — anel 1 |
| 11660010 | Centro | 0,25 km — anel 1 | 0,26 km — anel 1 |

Sem a correção, uma empresa de Massaguaçu entraria na primeira leva como se
fosse vizinha da clínica.

**Nunca tratar a presença de uma coordenada como prova de precisão.** A
detecção é comparar CEPs entre si: coordenada idêntica em CEPs diferentes é
centroide, não endereço. É o que `geo_cep_reclassifica()` faz, rebaixando esses
registros para `precisao = 'cidade'`.

Só `precisao in ('cep', 'manual')` decide anel. A coluna `anel_confiavel` da
view `prospeccao_anel` carrega essa decisão.

**Limite conhecido:** a detecção precisa de pelo menos 2 CEPs da mesma cidade
para enxergar o centroide. Cidade com um CEP só passa sem ser notada.

## Ordem das fontes

1. **BrasilAPI v2** (`/api/cep/v2/{cep}`) — endereço e ponto na mesma resposta,
   grátis, sem chave. O ponto costuma ser centroide no litoral norte.
2. **ViaCEP** — só endereço. Confirma que o CEP existe, e é o endereço que o
   refino usa depois.
3. **Centroide do prefixo** — média dos CEPs vizinhos de mesmos 5 dígitos já
   resolvidos. Sai marcado como `prefixo`.
4. **Refino por endereço no OpenStreetMap** — é o que dá rua de verdade.

### Pegadinhas dos geocodificadores

- **Photon** (`photon.komoot.io`) é o primário. Só aceita `lang` de/en/fr/it:
  com `lang=pt` devolve **400**.
- **Nominatim** devolve **403 para IP de nuvem**, e o Supabase é um. Funciona de
  máquina comum, não de dentro da edge function. Fica só como reserva.
- Respeitar ~1 requisição por segundo. `PAUSA_GEO = 1100`.
- CEP genérico terminado em `-000` cobre um bairro inteiro: o ponto sai em cima
  da via, não do endereço. Massaguaçu (`Rodovia Caraguá-Ubatuba`) é assim — os
  25,7 km são o ponto que o OSM dá para a rodovia, melhor que o centroide mas
  ainda grosso. CEP de rua específica geocodifica bem.

## O que ainda falta para prospectar

Este sistema resolve **onde** a empresa está. Não resolve:

- **Quais empresas.** `prospeccao_empresas` está vazia. A API pública do
  CNPJ.ws consulta um CNPJ por vez — não lista empresas por CNAE e cidade.
  Precisa de uma origem de lista (API Comercial do CNPJ.ws, dados abertos da
  Receita, ou uma lista da clínica).
- **De qual número sai a prospecção.** Enquanto for o (12) 3887-3535, cada
  mensagem fria arrisca o canal que atende paciente e roda a régua.
