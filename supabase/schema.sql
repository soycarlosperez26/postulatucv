-- Esquema inicial de micurriculum
-- Ejecutar en el SQL editor de Supabase (o vía supabase db push)

create extension if not exists "pgcrypto";

-- ============================================================
-- base_profiles: el CV base del usuario, subido en el onboarding
-- ============================================================
create table if not exists public.base_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text,
  original_file_path text not null,       -- ruta dentro del bucket de storage
  original_file_name text not null,
  raw_text text not null,                 -- texto plano extraído del PDF
  parsed jsonb not null default '{}'::jsonb, -- perfil estructurado (ver src/types/domain.ts -> CvProfile)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id) -- un perfil base por usuario en esta versión
);

-- ============================================================
-- job_offers: ofertas de empleo guardadas por el usuario
-- ============================================================
create table if not exists public.job_offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company text not null,
  title text not null,
  source_url text,                        -- opcional, si el usuario pegó un link
  raw_description text not null,          -- descripción pegada por el usuario
  parsed jsonb not null default '{}'::jsonb, -- requisitos estructurados (ver JobRequirements)
  created_at timestamptz not null default now()
);

-- ============================================================
-- tailored_cvs: CV generado para una oferta específica + score ATS
-- ============================================================
create table if not exists public.tailored_cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  base_profile_id uuid not null references public.base_profiles (id) on delete cascade,
  job_offer_id uuid not null references public.job_offers (id) on delete cascade,
  content jsonb not null,                 -- CV adaptado estructurado (ver TailoredCv)
  match_score numeric not null,           -- 0-100
  matched_keywords text[] not null default '{}',
  missing_keywords text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists tailored_cvs_job_offer_id_idx on public.tailored_cvs (job_offer_id);
create index if not exists job_offers_user_id_idx on public.job_offers (user_id);

-- ============================================================
-- RLS: cada usuario solo puede ver/editar sus propias filas
-- ============================================================
alter table public.base_profiles enable row level security;
alter table public.job_offers enable row level security;
alter table public.tailored_cvs enable row level security;

create policy "base_profiles: owner select" on public.base_profiles
  for select using (auth.uid() = user_id);
create policy "base_profiles: owner insert" on public.base_profiles
  for insert with check (auth.uid() = user_id);
create policy "base_profiles: owner update" on public.base_profiles
  for update using (auth.uid() = user_id);
create policy "base_profiles: owner delete" on public.base_profiles
  for delete using (auth.uid() = user_id);

create policy "job_offers: owner select" on public.job_offers
  for select using (auth.uid() = user_id);
create policy "job_offers: owner insert" on public.job_offers
  for insert with check (auth.uid() = user_id);
create policy "job_offers: owner update" on public.job_offers
  for update using (auth.uid() = user_id);
create policy "job_offers: owner delete" on public.job_offers
  for delete using (auth.uid() = user_id);

create policy "tailored_cvs: owner select" on public.tailored_cvs
  for select using (auth.uid() = user_id);
create policy "tailored_cvs: owner insert" on public.tailored_cvs
  for insert with check (auth.uid() = user_id);
create policy "tailored_cvs: owner delete" on public.tailored_cvs
  for delete using (auth.uid() = user_id);

-- ============================================================
-- Storage: bucket privado para los PDFs/DOCX originales
-- ============================================================
insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', false)
on conflict (id) do nothing;

create policy "cvs: owner read"
  on storage.objects for select
  using (bucket_id = 'cvs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "cvs: owner write"
  on storage.objects for insert
  with check (bucket_id = 'cvs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "cvs: owner update"
  on storage.objects for update
  using (bucket_id = 'cvs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "cvs: owner delete"
  on storage.objects for delete
  using (bucket_id = 'cvs' and auth.uid()::text = (storage.foldername(name))[1]);
