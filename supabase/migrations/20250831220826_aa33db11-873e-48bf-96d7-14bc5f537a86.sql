-- Replace simple amenities with comprehensive venue characteristics
DROP TYPE IF EXISTS venue_amenities CASCADE;

-- Create comprehensive venue characteristics as JSONB fields
ALTER TABLE public.venues 
DROP COLUMN IF EXISTS amenities CASCADE;

-- Add new comprehensive characteristics columns
ALTER TABLE public.venues 
ADD COLUMN caracteristicas_estabelecimento JSONB DEFAULT '{"descricao": ""}'::jsonb,
ADD COLUMN estruturas JSONB DEFAULT '{
  "descricao": "",
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
ADD COLUMN diferenciais JSONB DEFAULT '{
  "descricao": "",
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
ADD COLUMN bebidas JSONB DEFAULT '{
  "descricao": "",
  "menu_cervejas": false,
  "cervejas_artesanais": false,
  "coqueteis_classicos": false,
  "coqueteis_autorais": false,
  "menu_vinhos": false
}'::jsonb,
ADD COLUMN cozinha JSONB DEFAULT '{
  "descricao": "",
  "serve_comida": false,
  "opcoes_veganas": false,
  "opcoes_vegetarianas": false,
  "opcoes_sem_gluten": false,
  "opcoes_sem_lactose": false,
  "menu_kids": false
}'::jsonb,
ADD COLUMN seguranca JSONB DEFAULT '{
  "descricao": "",
  "equipe_seguranca": false,
  "bombeiros_local": false,
  "saidas_emergencia_sinalizadas": false
}'::jsonb,
ADD COLUMN acessibilidade JSONB DEFAULT '{
  "descricao": "",
  "elevador_acesso": false,
  "rampa_cadeirantes": false,
  "banheiro_acessivel": false,
  "cardapio_braille": false,
  "audio_acessivel": false,
  "area_caes_guia": false
}'::jsonb,
ADD COLUMN banheiros JSONB DEFAULT '{
  "descricao": "",
  "masculinos": 0,
  "femininos": 0,
  "genero_neutro": 0
}'::jsonb;