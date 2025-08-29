-- Corrigir função de validação com search_path seguro
create or replace function validate_highlight_dates()
returns trigger as $$
begin
  if new.end_at is not null and new.start_at is not null then
    if new.end_at <= new.start_at + interval '15 minutes' then
      raise exception 'A data de fim deve ser pelo menos 15 minutos após o início';
    end if;
  end if;
  return new;
end;
$$ language plpgsql
security definer
set search_path = public;

-- Políticas RLS para o bucket admin-uploads
create policy if not exists "Admin can upload files"
on storage.objects for insert
with check (
  bucket_id = 'admin-uploads' and
  exists (
    select 1 from public.admin_users 
    where email = current_setting('request.headers', true)::json->>'x-admin-email'
    and is_active = true
  )
);

create policy if not exists "Admin can view files"
on storage.objects for select
using (
  bucket_id = 'admin-uploads' and
  exists (
    select 1 from public.admin_users 
    where email = current_setting('request.headers', true)::json->>'x-admin-email'
    and is_active = true
  )
);

create policy if not exists "Admin can update files"
on storage.objects for update
using (
  bucket_id = 'admin-uploads' and
  exists (
    select 1 from public.admin_users 
    where email = current_setting('request.headers', true)::json->>'x-admin-email'
    and is_active = true
  )
);

create policy if not exists "Admin can delete files"
on storage.objects for delete
using (
  bucket_id = 'admin-uploads' and
  exists (
    select 1 from public.admin_users 
    where email = current_setting('request.headers', true)::json->>'x-admin-email'
    and is_active = true
  )
);