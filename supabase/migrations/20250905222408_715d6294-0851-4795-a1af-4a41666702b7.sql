-- 1. Drop existing views to avoid conflicts
drop view if exists public.events_active;
drop view if exists public.agenda_active;

-- 2. Recreate events_active view (somente eventos não deletados)
create view public.events_active as
select * from public.events where deleted_at is null;

-- 3. Create agenda_active view (somente publicados e ativos)
create view public.agenda_active as
select * from public.events
where deleted_at is null and status = 'published';

-- 4. RPC simples para soft delete
create or replace function public.soft_delete_event(p_event_id uuid)
returns void
language sql
security definer
as $$
  update public.events
     set deleted_at = now(),
         status = 'draft'      -- despublica para não indexar
   where id = p_event_id;
$$;

-- 5. RPC para restaurar evento da lixeira
create or replace function public.restore_event(p_event_id uuid)
returns void
language sql
security definer
as $$
  update public.events
     set deleted_at = null
   where id = p_event_id;
$$;

-- 6. Garantir policy para soft delete (admins podem atualizar)
drop policy if exists "soft_delete_events_admin" on public.events;
create policy "soft_delete_events_admin" on public.events
for update using (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
) with check (true);

-- 7. Índice para performance nas queries com deleted_at
create index if not exists events_deleted_at_idx on public.events(deleted_at) where deleted_at is not null;