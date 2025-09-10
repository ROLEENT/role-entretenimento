-- Remove os 3 venues problemáticos que não podem ser excluídos via interface admin
-- devido a problemas com políticas RLS e autenticação

-- Comentário: Remoção manual dos venues que estavam impedindo o funcionamento do sistema admin
-- IDs: 74eed352-b3e5-4a6c-8a90-f9b662fad758 (Janaíno Vegan Bar)
--      d8844dec-cdaf-48b0-911b-ec4b88956139 (Uptown Club POA)
--      7db02f23-f188-4b49-8486-29269b5fbc4f (Workroom Bar)

-- Primeiro, verificar se há dependências em outras tabelas que referenciem esses venues
-- e remover se necessário (atualmente não há entity_profiles relacionados)

-- Deletar os 3 venues problemáticos
DELETE FROM public.venues 
WHERE id IN (
    '74eed352-b3e5-4a6c-8a90-f9b662fad758', -- Janaíno Vegan Bar
    'd8844dec-cdaf-48b0-911b-ec4b88956139', -- Uptown Club POA
    '7db02f23-f188-4b49-8486-29269b5fbc4f'  -- Workroom Bar
);

-- Verificar se a exclusão foi bem-sucedida
-- (Esta query não retornará nenhum resultado se a exclusão foi bem-sucedida)
DO $$
DECLARE
    remaining_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_count 
    FROM public.venues 
    WHERE id IN (
        '74eed352-b3e5-4a6c-8a90-f9b662fad758',
        'd8844dec-cdaf-48b0-911b-ec4b88956139', 
        '7db02f23-f148-4b49-8486-29269b5fbc4f'
    );
    
    IF remaining_count > 0 THEN
        RAISE NOTICE 'ATENÇÃO: % venues ainda permanecem na tabela após tentativa de exclusão', remaining_count;
    ELSE
        RAISE NOTICE 'Sucesso: Todos os 3 venues problemáticos foram removidos com sucesso';
    END IF;
END $$;