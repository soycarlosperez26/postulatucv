-- ============================================================
-- Sistema de créditos de Postula
-- Ejecutar en el SQL Editor de Supabase después de schema.sql
-- ============================================================
--
-- Regla de oro: el saldo es dinero. Las server actions de la app usan
-- la anon key con la sesión del usuario (ver src/lib/supabase/server.ts),
-- así que los usuarios NO tienen permiso de escritura sobre ninguna de
-- estas tablas. Todo movimiento pasa por funciones SECURITY DEFINER que
-- bloquean la fila con FOR UPDATE, o por el service role en el webhook.

-- ============================================================
-- credit_packs: los paquetes a la venta.
-- Vive en la base para que el precio nunca venga del cliente y para
-- poder cambiarlo sin desplegar.
-- ============================================================
create table if not exists public.credit_packs (
  id text primary key,
  credits int not null check (credits > 0),
  amount_cop int not null check (amount_cop > 0),
  label text not null,
  sort_order int not null default 0,
  active boolean not null default true
);

insert into public.credit_packs (id, credits, amount_cop, label, sort_order) values
  ('p5',   5, 10000, '5 créditos',  1),
  ('p15', 15, 20000, '15 créditos', 2),
  ('p50', 50, 50000, '50 créditos', 3)
on conflict (id) do update
  set credits = excluded.credits,
      amount_cop = excluded.amount_cop,
      label = excluded.label,
      sort_order = excluded.sort_order;

-- ============================================================
-- user_credits: el saldo, en dos cubos.
--   free_credits      -> 1 al mes, se reinicia, NO se acumula
--   purchased_credits -> se acumula y no vence
-- ============================================================
create table if not exists public.user_credits (
  user_id uuid primary key references auth.users (id) on delete cascade,
  free_credits int not null default 1 check (free_credits >= 0),
  free_period date not null default date_trunc('month', now())::date,
  purchased_credits int not null default 0 check (purchased_credits >= 0),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- credit_transactions: libro mayor. Cada movimiento deja asiento.
-- ============================================================
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('free_grant', 'purchase', 'consume', 'refund')),
  amount int not null,
  balance_after int not null,
  reference text,
  created_at timestamptz not null default now()
);

create index if not exists credit_transactions_user_idx
  on public.credit_transactions (user_id, created_at desc);

-- Idempotencia del webhook: Wompi reintenta los eventos, y un segundo
-- intento con la misma referencia choca aquí en vez de duplicar créditos.
create unique index if not exists credit_transactions_purchase_ref_idx
  on public.credit_transactions (reference) where kind = 'purchase';

-- Un solo otorgamiento gratuito por usuario y mes.
create unique index if not exists credit_transactions_free_grant_idx
  on public.credit_transactions (user_id, reference) where kind = 'free_grant';

-- ============================================================
-- credit_orders: intención de compra. La crea la app, la cierra el webhook.
-- ============================================================
create table if not exists public.credit_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pack_id text not null references public.credit_packs (id),
  credits int not null,
  amount_cop int not null,
  reference text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'declined', 'voided', 'error')),
  wompi_transaction_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists credit_orders_user_idx
  on public.credit_orders (user_id, created_at desc);

-- ============================================================
-- RLS: los usuarios solo LEEN lo suyo. Ninguna política de escritura.
-- ============================================================
alter table public.credit_packs enable row level security;
alter table public.user_credits enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.credit_orders enable row level security;

drop policy if exists "credit_packs: lectura pública" on public.credit_packs;
create policy "credit_packs: lectura pública" on public.credit_packs
  for select using (active);

drop policy if exists "user_credits: owner select" on public.user_credits;
create policy "user_credits: owner select" on public.user_credits
  for select using (auth.uid() = user_id);

drop policy if exists "credit_transactions: owner select" on public.credit_transactions;
create policy "credit_transactions: owner select" on public.credit_transactions
  for select using (auth.uid() = user_id);

drop policy if exists "credit_orders: owner select" on public.credit_orders;
create policy "credit_orders: owner select" on public.credit_orders
  for select using (auth.uid() = user_id);

-- ============================================================
-- ensure_credit_row: crea la fila si falta y aplica la recarga mensual.
-- Deja la fila bloqueada con FOR UPDATE para el resto de la transacción,
-- que es lo que hace atómicos a consume/refund/grant.
-- Interna: se revoca al final.
-- ============================================================
create or replace function public.ensure_credit_row(p_user_id uuid)
returns public.user_credits
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.user_credits;
  v_month date := date_trunc('month', now())::date;
  v_granted boolean := false;
begin
  insert into public.user_credits (user_id, free_credits, free_period)
  values (p_user_id, 1, v_month)
  on conflict (user_id) do nothing;

  v_granted := found;

  select * into v_row from public.user_credits
   where user_id = p_user_id
   for update;

  if v_row.free_period < v_month then
    update public.user_credits
       set free_credits = 1,
           free_period = v_month,
           updated_at = now()
     where user_id = p_user_id
    returning * into v_row;

    v_granted := true;
  end if;

  if v_granted then
    insert into public.credit_transactions
      (user_id, kind, amount, balance_after, reference)
    values
      (p_user_id, 'free_grant', 1,
       v_row.free_credits + v_row.purchased_credits,
       'free:' || to_char(v_month, 'YYYY-MM'))
    on conflict (user_id, reference) where kind = 'free_grant' do nothing;
  end if;

  return v_row;
end;
$$;

-- ============================================================
-- get_credit_balance: saldo del usuario de la sesión.
-- ============================================================
create or replace function public.get_credit_balance()
returns table (free int, purchased int, total int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.user_credits;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  v_row := public.ensure_credit_row(auth.uid());

  return query
    select v_row.free_credits,
           v_row.purchased_credits,
           v_row.free_credits + v_row.purchased_credits;
end;
$$;

-- ============================================================
-- consume_credit: cobra 1 crédito al usuario de la sesión.
-- Gasta primero el gratuito, que es el que vence.
-- Devuelve false si no había saldo (no lanza excepción: es un caso
-- normal del producto, no un error).
-- La referencia guarda de qué cubo salió, para poder devolverlo bien.
-- ============================================================
create or replace function public.consume_credit(p_reference text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.user_credits;
  v_source text;
begin
  if v_uid is null then
    raise exception 'No autenticado';
  end if;

  v_row := public.ensure_credit_row(v_uid);

  if v_row.free_credits > 0 then
    update public.user_credits
       set free_credits = free_credits - 1, updated_at = now()
     where user_id = v_uid
    returning * into v_row;
    v_source := 'free';

  elsif v_row.purchased_credits > 0 then
    update public.user_credits
       set purchased_credits = purchased_credits - 1, updated_at = now()
     where user_id = v_uid
    returning * into v_row;
    v_source := 'purchased';

  else
    return false;
  end if;

  insert into public.credit_transactions
    (user_id, kind, amount, balance_after, reference)
  values
    (v_uid, 'consume', -1,
     v_row.free_credits + v_row.purchased_credits,
     v_source || ':' || p_reference);

  return true;
end;
$$;

-- ============================================================
-- refund_credit: devuelve el crédito al cubo del que salió cuando la
-- generación falló. Idempotente: un segundo intento no devuelve nada.
-- ============================================================
create or replace function public.refund_credit(p_reference text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_consume public.credit_transactions;
  v_row public.user_credits;
  v_source text;
begin
  if v_uid is null then
    raise exception 'No autenticado';
  end if;

  perform public.ensure_credit_row(v_uid);

  select * into v_consume
    from public.credit_transactions
   where user_id = v_uid
     and kind = 'consume'
     and reference in ('free:' || p_reference, 'purchased:' || p_reference)
   order by created_at desc
   limit 1;

  if v_consume.id is null then
    return false;
  end if;

  perform 1 from public.credit_transactions
   where user_id = v_uid
     and kind = 'refund'
     and reference = v_consume.reference;

  if found then
    return false;
  end if;

  v_source := split_part(v_consume.reference, ':', 1);

  if v_source = 'free' then
    update public.user_credits
       set free_credits = free_credits + 1, updated_at = now()
     where user_id = v_uid
    returning * into v_row;
  else
    update public.user_credits
       set purchased_credits = purchased_credits + 1, updated_at = now()
     where user_id = v_uid
    returning * into v_row;
  end if;

  insert into public.credit_transactions
    (user_id, kind, amount, balance_after, reference)
  values
    (v_uid, 'refund', 1,
     v_row.free_credits + v_row.purchased_credits,
     v_consume.reference);

  return true;
end;
$$;

-- ============================================================
-- create_credit_order: abre una orden de compra.
-- Recibe SOLO el id del paquete; los créditos y el monto salen de
-- credit_packs, nunca del cliente.
-- ============================================================
create or replace function public.create_credit_order(p_pack_id text)
returns public.credit_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_pack public.credit_packs;
  v_order public.credit_orders;
begin
  if v_uid is null then
    raise exception 'No autenticado';
  end if;

  select * into v_pack from public.credit_packs
   where id = p_pack_id and active;

  if v_pack.id is null then
    raise exception 'Paquete no disponible: %', p_pack_id;
  end if;

  insert into public.credit_orders
    (user_id, pack_id, credits, amount_cop, reference)
  values
    (v_uid, v_pack.id, v_pack.credits, v_pack.amount_cop,
     replace(gen_random_uuid()::text, '-', ''))
  returning * into v_order;

  return v_order;
end;
$$;

-- ============================================================
-- grant_purchased_credits: acredita una compra confirmada.
-- SOLO la llama el webhook con service role. Si un usuario pudiera
-- ejecutarla se regalaría saldo, por eso se revoca más abajo.
-- ============================================================
create or replace function public.grant_purchased_credits(
  p_user_id uuid,
  p_amount int,
  p_reference text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.user_credits;
begin
  if p_amount <= 0 then
    raise exception 'Monto de créditos inválido: %', p_amount;
  end if;

  -- Bloquea la fila del usuario: dos entregas simultáneas del mismo
  -- evento se serializan aquí.
  perform public.ensure_credit_row(p_user_id);

  perform 1 from public.credit_transactions
   where kind = 'purchase' and reference = p_reference;

  if found then
    return false; -- este pago ya se acreditó
  end if;

  update public.user_credits
     set purchased_credits = purchased_credits + p_amount,
         updated_at = now()
   where user_id = p_user_id
  returning * into v_row;

  insert into public.credit_transactions
    (user_id, kind, amount, balance_after, reference)
  values
    (p_user_id, 'purchase', p_amount,
     v_row.free_credits + v_row.purchased_credits,
     p_reference);

  return true;
end;
$$;

-- ============================================================
-- Al registrarse, el usuario estrena su crédito gratis.
-- ensure_credit_row cubre a los que ya existían antes de esta migración.
-- ============================================================
create or replace function public.handle_new_user_credits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_credits (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_credits on auth.users;
create trigger on_auth_user_created_credits
  after insert on auth.users
  for each row execute function public.handle_new_user_credits();

-- ============================================================
-- Permisos de ejecución.
-- En Postgres las funciones son ejecutables por PUBLIC por defecto, así
-- que revocar aquí no es opcional: sin esto, cualquier usuario podría
-- llamar grant_purchased_credits por PostgREST y regalarse créditos.
-- ============================================================
revoke all on function public.ensure_credit_row(uuid) from public;
revoke all on function public.grant_purchased_credits(uuid, int, text) from public;
revoke all on function public.handle_new_user_credits() from public;

grant execute on function public.grant_purchased_credits(uuid, int, text) to service_role;

grant execute on function public.get_credit_balance() to authenticated;
grant execute on function public.consume_credit(text) to authenticated;
grant execute on function public.refund_credit(text) to authenticated;
grant execute on function public.create_credit_order(text) to authenticated;
