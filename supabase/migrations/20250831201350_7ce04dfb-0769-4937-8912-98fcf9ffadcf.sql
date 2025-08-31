-- Adicionar novos campos detalhados de características para venues
-- Substituindo o campo simples amenities por uma estrutura mais rica

-- Adicionar novos campos JSONB para cada categoria de características
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS caracteristicas_estabelecimento JSONB DEFAULT '{"descricao": null}'::jsonb,
ADD COLUMN IF NOT EXISTS estruturas JSONB DEFAULT '{
  "descricao": null,
  "ar_condicionado": false,
  "wifi": false,
  "aquecimento": false,
  "estacionamento": false,
  "aceita_pets": false,
  "area_fumantes": false,
  "pista_danca": false,
  "area_vip": false,
  "rooftop": false,
  "estacoes_carregamento": false,
  "lugares_sentados": false
}'::jsonb,
ADD COLUMN IF NOT EXISTS diferenciais JSONB DEFAULT '{
  "descricao": null,
  "dj": false,
  "happy_hour": false,
  "mesa_bilhar": false,
  "jogos_arcade": false,
  "karaoke": false,
  "narguile": false,
  "transmissao_eventos_esportivos": false,
  "shows_ao_vivo": false,
  "stand_up": false,
  "musica_ao_vivo": false,
  "amigavel_lgbtqia": false
}'::jsonb,
ADD COLUMN IF NOT EXISTS bebidas JSONB DEFAULT '{
  "descricao": null,
  "menu_cervejas": false,
  "cervejas_artesanais": false,
  "coqueteis_classicos": false,
  "coqueteis_autorais": false,
  "menu_vinhos": false
}'::jsonb,
ADD COLUMN IF NOT EXISTS cozinha JSONB DEFAULT '{
  "descricao": null,
  "serve_comida": false,
  "opcoes_veganas": false,
  "opcoes_vegetarianas": false,
  "opcoes_sem_gluten": false,
  "opcoes_sem_lactose": false,
  "menu_kids": false
}'::jsonb,
ADD COLUMN IF NOT EXISTS seguranca JSONB DEFAULT '{
  "descricao": null,
  "equipe_seguranca": false,
  "bombeiros_local": false,
  "saidas_emergencia_sinalizadas": false
}'::jsonb,
ADD COLUMN IF NOT EXISTS acessibilidade JSONB DEFAULT '{
  "descricao": null,
  "elevador_acesso": false,
  "rampa_cadeirantes": false,
  "banheiro_acessivel": false,
  "cardapio_braille": false,
  "audio_acessivel": false,
  "area_caes_guia": false
}'::jsonb,
ADD COLUMN IF NOT EXISTS banheiros JSONB DEFAULT '{
  "descricao": null,
  "masculinos": 0,
  "femininos": 0,
  "genero_neutro": 0
}'::jsonb;