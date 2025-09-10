-- Tentar corrigir configuração de read-only
-- Verificar configurações atuais
SELECT name, setting, context, source FROM pg_settings 
WHERE name IN ('transaction_read_only', 'default_transaction_read_only');

-- Tentar desabilitar read-only mode
SET SESSION transaction_read_only = off;
SET default_transaction_read_only = off;

-- Verificar se a alteração foi aplicada
SELECT name, setting FROM pg_settings 
WHERE name IN ('transaction_read_only', 'default_transaction_read_only');