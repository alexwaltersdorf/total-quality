-- Localizacao da empresa pelo CEP: cache, deteccao de centroide e aneis.
-- Aplicado em producao em 22/10/2026. Acompanha automacao/ana-agenda/edge-cep.ts.
--
-- A ancora de distancia e ana_km_da_clinica(lat, lon).
--
-- ATENCAO: a ancora foi corrigida em 22/10/2026. Antes vinha do schema
-- LocalBusiness do site (-23.6225, -45.4132), que esta ~600 m fora do lugar.
-- Passou a usar a coordenada do Google Business Profile, conferida contra o no
-- do OpenStreetMap do mesmo endereco (batem em 15 m). O schema do site
-- continua errado e e uma correcao pendente no repositorio.
--
--   GBP   -23.6213648, -45.4075194  (place_id ChIJl9cmhfhjzZQRANUzZnnRLF8)
--   OSM   -23.6213740, -45.4073685
--   site  -23.6225000, -45.4132000  <- 592 m do ponto real

create or replace function public.ana_km_da_clinica(p_lat double precision, p_lon double precision)
returns double precision language sql immutable parallel safe as $function$
  SELECT CASE WHEN p_lat IS NULL OR p_lon IS NULL THEN NULL ELSE
    6371.0 * 2 * asin(sqrt(
      power(sin(radians(p_lat - (-23.6213648)) / 2), 2)
      + cos(radians(-23.6213648)) * cos(radians(p_lat))
      * power(sin(radians(p_lon - (-45.4075194)) / 2), 2)
    )) END
$function$;

-- Trocar a ancora NAO reescreve o que ja esta gravado numa coluna gerada
-- STORED, e o Postgres so reavalia a expressao quando uma coluna de que ela
-- depende entra no UPDATE: mexer em "tentativas" nao basta, tem de ser
-- latitude/longitude. Rodar isto depois de qualquer troca de ancora.
create or replace function public.geo_recalcula_distancias()
returns integer language plpgsql as $$
declare n integer;
begin
  with r as (
    update public.geo_cep set latitude = latitude, longitude = longitude
    returning cep)
  select count(*)::int into n from r;
  return n;
end $$;

-- ---------------------------------------------------------------------------
-- 1. Cache: um registro por CEP, nunca por empresa
-- ---------------------------------------------------------------------------
create table if not exists public.geo_cep (
  cep             text primary key check (cep ~ '^[0-9]{8}$'),
  logradouro      text,
  bairro          text,
  cidade          text,
  uf              text,
  ibge            text,
  latitude        double precision,
  longitude       double precision,
  -- de onde veio o ponto, e o quanto ele vale:
  --   cep     = coordenada do proprio endereco (o unico que decide anel)
  --   prefixo = media dos CEPs vizinhos (mesmos 5 primeiros digitos)
  --   cidade  = centro do municipio disfarcado de CEP
  --   manual  = alguem corrigiu na mao
  precisao        text check (precisao in ('cep', 'prefixo', 'cidade', 'manual')),
  fonte           text,
  km_da_clinica   double precision
                  generated always as (ana_km_da_clinica(latitude, longitude)) stored,
  anel_10km       integer
                  generated always as (
                    case when latitude is null or longitude is null then null
                         else floor(ana_km_da_clinica(latitude, longitude) / 10)::int + 1
                    end) stored,
  erro            text,
  tentativas      integer not null default 0,
  consultado_em   timestamptz,
  criado_em       timestamptz not null default now()
);

create index if not exists geo_cep_prefixo_idx on public.geo_cep (left(cep, 5));
create index if not exists geo_cep_anel_idx    on public.geo_cep (anel_10km);

alter table public.geo_cep enable row level security;
create policy geo_cep_service on public.geo_cep
  for all to service_role using (true) with check (true);

-- ---------------------------------------------------------------------------
-- 2. Normalizacao: aceita 11660-010, 11660010 ou " 11660 010 "
-- ---------------------------------------------------------------------------
create or replace function public.geo_cep_normaliza(entrada text)
returns text language sql immutable as $$
  select case
           when entrada is null then null
           when regexp_replace(entrada, '[^0-9]', '', 'g') ~ '^[0-9]{8}$'
             then regexp_replace(entrada, '[^0-9]', '', 'g')
           else null
         end
$$;

-- ---------------------------------------------------------------------------
-- 3. Aproximacao pelos vizinhos de mesmo prefixo
-- ---------------------------------------------------------------------------
create or replace function public.geo_cep_centroide_prefixo(alvo text)
returns table (latitude double precision, longitude double precision, vizinhos integer)
language sql stable as $$
  select avg(g.latitude), avg(g.longitude), count(*)::int
    from public.geo_cep g
   where left(g.cep, 5) = left(public.geo_cep_normaliza(alvo), 5)
     and g.precisao in ('cep', 'manual')
     and g.latitude is not null
  having count(*) > 0
$$;

-- ---------------------------------------------------------------------------
-- 4. Deteccao de centroide — o coracao da coisa
--
-- Em 22/10/2026, 7 CEPs de bairros diferentes de Caraguatatuba voltaram da
-- BrasilAPI TODOS em -23.62028,-45.41306: a fonte devolve o centro do
-- municipio sem avisar. Massaguacu, a 25,7 km da clinica, era reportado a
-- 0,25 km e caia no anel 1.
--
-- Nao da para detectar isso olhando um CEP de cada vez. Da para detectar
-- comparando CEPs entre si: coordenada identica em CEPs diferentes e
-- centroide, nao endereco.
-- ---------------------------------------------------------------------------
create or replace function public.geo_cep_reclassifica()
returns integer language plpgsql as $$
declare n integer;
begin
  with compartilhado as (
    select latitude, longitude
      from public.geo_cep
     where latitude is not null and precisao = 'cep'
     group by latitude, longitude
    having count(*) > 1
  ), rebaixado as (
    update public.geo_cep g
       set precisao = 'cidade',
           fonte    = coalesce(g.fonte, '') || ' [centroide detectado]'
      from compartilhado c
     where g.latitude = c.latitude
       and g.longitude = c.longitude
       and g.precisao = 'cep'
    returning g.cep)
  select count(*)::int into n from rebaixado;
  return n;
end $$;

-- ---------------------------------------------------------------------------
-- 5. Ligacao com a prospeccao
-- ---------------------------------------------------------------------------
alter table public.prospeccao_empresas
  add column if not exists geo_precisao text,
  add column if not exists geo_fonte text;

create or replace function public.prospeccao_aplica_geo()
returns table (atualizadas integer, sem_cep integer, sem_coordenada integer)
language plpgsql as $$
declare
  n_ok integer, n_scep integer, n_scoord integer;
begin
  -- Carimba na empresa a coordenada que o cache ja resolveu. Roda quantas
  -- vezes quiser: so mexe em quem mudou.
  with feito as (
    update public.prospeccao_empresas e
       set latitude         = g.latitude,
           longitude        = g.longitude,
           geo_precisao     = g.precisao,
           geo_fonte        = g.fonte,
           geocodificado_em = now()
      from public.geo_cep g
     where g.cep = public.geo_cep_normaliza(e.cep)
       and g.latitude is not null
       and (e.latitude is distinct from g.latitude
         or e.longitude is distinct from g.longitude
         or e.geo_precisao is distinct from g.precisao)
    returning e.cnpj)
  select count(*)::int into n_ok from feito;

  select count(*)::int into n_scep
    from public.prospeccao_empresas
   where public.geo_cep_normaliza(cep) is null;

  select count(*)::int into n_scoord
    from public.prospeccao_empresas
   where public.geo_cep_normaliza(cep) is not null and latitude is null;

  return query select n_ok, n_scep, n_scoord;
end $$;

-- Fila de trabalho da edge function.
create or replace view public.geo_cep_pendentes as
  select distinct public.geo_cep_normaliza(e.cep) as cep
    from public.prospeccao_empresas e
   where public.geo_cep_normaliza(e.cep) is not null
     and not exists (
           select 1 from public.geo_cep g
            where g.cep = public.geo_cep_normaliza(e.cep)
              and g.latitude is not null);

-- A visao que a operacao usa. anel_confiavel e o campo que impede disparo
-- errado: ponto de centroide nao decide anel.
create or replace view public.prospeccao_anel as
  select e.cnpj, e.razao_social, e.nome_fantasia, e.telefone,
         e.cnae_principal, e.cnae_descricao, e.porte, e.situacao,
         e.municipio, e.uf, e.cep, e.logradouro, e.bairro,
         g.cidade as cidade_do_cep,
         e.latitude, e.longitude,
         round(e.km_da_clinica::numeric, 2) as km,
         e.anel_10km as anel,
         g.precisao,
         g.fonte,
         (g.precisao in ('cep', 'manual')) as anel_confiavel,
         e.status_prospeccao
    from public.prospeccao_empresas e
    left join public.geo_cep g on g.cep = public.geo_cep_normaliza(e.cep);
