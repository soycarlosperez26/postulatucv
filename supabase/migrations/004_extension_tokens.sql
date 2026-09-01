-- ============================================================
-- Tokens para la extensión de Chrome
-- Ejecutar después de 003_creditos_whatsapp.sql
-- ============================================================
--
-- La extensión no puede autenticarse con la cookie de sesión: Supabase
-- la emite con SameSite=Lax y una petición desde chrome-extension://
-- hacia nuestro dominio es cross-site, así que Chrome no la adjunta.
-- Forzarlo además abriría un endpoint autenticado por cookie a
-- cualquier origen, que es un agujero de CSRF.
--
-- En su lugar: un token personal por usuario. Se guarda SOLO el hash;
-- el token en claro se muestra una vez y vive en chrome.storage.local.

create table if not exists public.extension_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  token_hash text not null unique,
  label text not null default 'Extensión de Chrome',
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create index if not exists extension_tokens_user_idx
  on public.extension_tokens (user_id, created_at desc);

-- ============================================================
-- RLS: el usuario solo ve sus propios tokens. Ninguna escritura
-- directa: se pasa por las funciones de abajo.
-- ============================================================
alter table public.extension_tokens enable row level security;

drop policy if exists "extension_tokens: owner select" on public.extension_tokens;
create policy "extension_tokens: owner select" on public.extension_tokens
  for select using (auth.uid() = user_id);

-- ============================================================
-- register_extension_token: conecta la extensión.
-- Revoca los tokens anteriores del usuario: uno activo a la vez, para
-- que "Conectar" en un equipo nuevo desconecte el anterior.
-- Recibe el hash ya calculado; el token en claro nunca llega a la base.
-- ============================================================
create or replace function public.register_extension_token(
  p_hash text,
  p_label text default 'Extensión de Chrome'
)
returns public.extension_tokens
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.extension_tokens;
begin
  if v_uid is null then
    raise exception 'No autenticado';
  end if;

  if p_hash is null or length(p_hash) <> 64 then
    raise exception 'Hash de token inválido';
  end if;

  update public.extension_tokens
     set revoked_at = now()
   where user_id = v_uid and revoked_at is null;

  insert into public.extension_tokens (user_id, token_hash, label)
  values (v_uid, p_hash, coalesce(nullif(trim(p_label), ''), 'Extensión de Chrome'))
  returning * into v_row;

  return v_row;
end;
$$;

-- ============================================================
-- revoke_extension_tokens: desconectar la extensión.
-- ============================================================
create or replace function public.revoke_extension_tokens()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_count int;
begin
  if v_uid is null then
    raise exception 'No autenticado';
  end if;

  update public.extension_tokens
     set revoked_at = now()
   where user_id = v_uid and revoked_at is null;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ============================================================
-- resolve_extension_token: traduce un hash al usuario dueño.
-- Solo service role: es la función que autentica las peticiones de la
-- extensión, y si un usuario pudiera llamarla podría sondear hashes.
-- Registra el último uso para que la página muestre actividad.
-- ============================================================
create or replace function public.resolve_extension_token(p_hash text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.extension_tokens;
begin
  select * into v_row from public.extension_tokens
   where token_hash = p_hash and revoked_at is null;

  if v_row.id is null then
    return null;
  end if;

  update public.extension_tokens
     set last_used_at = now()
   where id = v_row.id;

  return v_row.user_id;
end;
$$;

-- ============================================================
-- Permisos
-- ============================================================
revoke all on function public.resolve_extension_token(text) from public;
grant execute on function public.resolve_extension_token(text) to service_role;

grant execute on function public.register_extension_token(text, text) to authenticated;
grant execute on function public.revoke_extension_tokens() to authenticated;
