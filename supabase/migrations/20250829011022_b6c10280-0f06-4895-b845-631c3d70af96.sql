-- 3) Slug único e case-insensitive
create unique index if not exists highlights_slug_unique_idx
  on public.highlights (lower(slug));

-- 4) Regras de datas (usando triggers por ser mais flexível)
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
$$ language plpgsql;

drop trigger if exists highlights_date_validation_trigger on public.highlights;
create trigger highlights_date_validation_trigger
  before insert or update on public.highlights
  for each row execute function validate_highlight_dates();

-- 5) Backfill e harmonização de campos legados
update public.highlights
set title = coalesce(title, event_title)
where title is null or title = '';

update public.highlights
set cover_url = coalesce(cover_url, image_url)
where cover_url is null and image_url is not null;

update public.highlights
set priority = coalesce(priority, sort_order)
where (priority is null or priority = 0) and sort_order is not null;

-- 6) Índices úteis
create index if not exists highlights_updated_at_idx on public.highlights(updated_at desc);
create index if not exists highlights_period_idx on public.highlights(start_at, end_at);
create index if not exists highlights_city_idx on public.highlights(city);
create index if not exists highlights_status_idx on public.highlights(status);