-- Adicionar colunas para promoção, gêneros e tags na agenda_itens
ALTER TABLE public.agenda_itens
  ADD COLUMN IF NOT EXISTS promo_type text 
    CHECK (promo_type IN ('none','vitrine','destaque','vitrine_destaque')) 
    DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS vitrine_package text,
  ADD COLUMN IF NOT EXISTS vitrine_order_id text,
  ADD COLUMN IF NOT EXISTS vitrine_notes text,
  ADD COLUMN IF NOT EXISTS featured_reasons text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS featured_note text,
  ADD COLUMN IF NOT EXISTS featured_until timestamptz,
  ADD COLUMN IF NOT EXISTS featured_weight int DEFAULT 50
    CHECK (featured_weight >= 0 AND featured_weight <= 100),
  ADD COLUMN IF NOT EXISTS event_genres text[] DEFAULT '{}';

-- Comentário: event_genres e tags já existem como 'genres' e 'tags', mas vamos manter compatibilidade