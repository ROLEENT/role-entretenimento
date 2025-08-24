-- Create partners table
create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_email text,
  instagram text,
  phone text,
  website text,
  city text,
  logo_url text,
  notes text,
  is_active boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create function for updating timestamps
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for partners table
drop trigger if exists trg_partners_updated_at on partners;
create trigger trg_partners_updated_at
before update on partners
for each row execute function set_updated_at();

-- Create advertisements table
create table if not exists advertisements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  partner_id uuid references partners(id) on delete set null,
  placement text check (placement in ('feed','stories','editorial','highlight')) default 'feed',
  status text check (status in ('draft','scheduled','running','paused','completed')) default 'draft',
  start_date date,
  end_date date,
  budget numeric,
  asset_url text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create trigger for advertisements table
drop trigger if exists trg_ads_updated_at on advertisements;
create trigger trg_ads_updated_at
before update on advertisements
for each row execute function set_updated_at();

-- Create storage bucket for partner logos
insert into storage.buckets (id, name, public) 
values ('partners-logos', 'partners-logos', true)
on conflict (id) do nothing;