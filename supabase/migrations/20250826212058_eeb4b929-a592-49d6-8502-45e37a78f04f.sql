-- Adicionar políticas RLS para as novas tabelas

-- Políticas para notification_campaigns
CREATE POLICY "Admins can manage notification campaigns"
ON public.notification_campaigns
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Políticas para performance_metrics
CREATE POLICY "Admins can view performance metrics"
ON public.performance_metrics
FOR SELECT
USING (is_admin());

CREATE POLICY "System can insert performance metrics"
ON public.performance_metrics
FOR INSERT
WITH CHECK (true);