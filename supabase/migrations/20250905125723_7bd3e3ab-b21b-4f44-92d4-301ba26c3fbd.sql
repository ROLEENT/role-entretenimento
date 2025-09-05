-- Corrigir a view events_with_relations para usar security_invoker
ALTER VIEW events_with_relations SET (security_invoker = on);

-- Verificar se as políticas RLS estão aplicadas corretamente
-- Como a view usa security_invoker = on, ela herda as políticas da tabela events