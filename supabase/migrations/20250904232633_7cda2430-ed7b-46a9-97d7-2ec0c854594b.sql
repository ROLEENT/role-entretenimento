-- Primeiro: Adicionar os valores necessários ao enum
ALTER TYPE highlight_type ADD VALUE IF NOT EXISTS 'editorial';
ALTER TYPE highlight_type ADD VALUE IF NOT EXISTS 'showcase'; 
ALTER TYPE highlight_type ADD VALUE IF NOT EXISTS 'sponsored';
ALTER TYPE highlight_type ADD VALUE IF NOT EXISTS 'none';