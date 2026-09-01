-- ============================================================
-- Recarga de créditos por WhatsApp (gestión manual del pago)
-- Ejecutar después de 002_credits.sql
-- ============================================================
--
-- Wompi queda dormido: su webhook y sus funciones siguen ahí, pero la
-- interfaz ya no lo usa. El usuario pide créditos, se le da un código
-- corto, coordina el pago por WhatsApp, y el administrador aprueba la
-- solicitud desde /dashboard/admin/creditos.
--
-- El saldo se sigue moviendo SOLO por grant_purchased_credits, que es
-- idempotente por referencia. Aprobar dos veces la misma solicitud no
-- duplica créditos.

-- Por dónde entró la solicitud. Sirve para no confundir una compra
-- automática con una gestionada a mano.
alter table public.credit_orders
  add column if not exists channel text not null default 'whatsapp';

alter table public.credit_orders
  drop constraint if exists credit_orders_channel_check;

alter table public.credit_orders
  add constraint credit_orders_channel_check
  check (channel in ('whatsapp', 'wompi'));

-- ============================================================
-- generate_order_code: código corto para dictar por chat.
-- Formato PST-XXXXX sin caracteres ambiguos (nada de O/0 ni I/1),
-- porque este código se copia a mano en una conversación.
-- ============================================================
create or replace function public.generate_order_code()
returns text
language plpgsql
set search_path = public
as $$
declare
  v_alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code text;
  v_i int;
begin
  loop
    v_code := 'PST-';
    for v_i in 1..5 loop
      v_code := v_code ||
        substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
    end loop;

    exit when not exists (
      select 1 from public.credit_orders where reference = v_code
    );
  end loop;

  return v_code;
end;
$$;

-- ============================================================
-- create_credit_order: ahora con código corto y canal.
-- Se elimina la versión de un solo argumento para que no quede una
-- sobrecarga ambigua.
-- ============================================================
drop function if exists public.create_credit_order(text);

create or replace function public.create_credit_order(
  p_pack_id text,
  p_channel text default 'whatsapp'
)
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

  -- Si ya hay una solicitud pendiente del mismo paquete, se reutiliza
  -- en vez de generar códigos nuevos cada vez que el usuario da clic.
  select * into v_order from public.credit_orders
   where user_id = v_uid
     and pack_id = p_pack_id
     and status = 'pending'
     and channel = p_channel
   order by created_at desc
   limit 1;

  if v_order.id is not null then
    return v_order;
  end if;

  insert into public.credit_orders
    (user_id, pack_id, credits, amount_cop, reference, channel)
  values
    (v_uid, v_pack.id, v_pack.credits, v_pack.amount_cop,
     public.generate_order_code(), p_channel)
  returning * into v_order;

  return v_order;
end;
$$;

-- ============================================================
-- list_pending_orders: lo que ve el administrador.
-- Incluye el correo para poder cruzarlo con la conversación de
-- WhatsApp. Solo service role.
-- ============================================================
create or replace function public.list_pending_orders()
returns table (
  reference text,
  email text,
  pack_id text,
  credits int,
  amount_cop int,
  channel text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select o.reference,
         u.email::text,
         o.pack_id,
         o.credits,
         o.amount_cop,
         o.channel,
         o.created_at
    from public.credit_orders o
    join auth.users u on u.id = o.user_id
   where o.status = 'pending'
   order by o.created_at desc
   limit 200;
$$;

-- ============================================================
-- approve_manual_order: acredita una solicitud ya pagada.
-- Idempotente por dos vías: el estado de la orden y la referencia
-- única de grant_purchased_credits.
-- ============================================================
create or replace function public.approve_manual_order(p_reference text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.credit_orders;
begin
  select * into v_order from public.credit_orders
   where reference = p_reference
   for update;

  if v_order.id is null then
    raise exception 'No existe la solicitud %', p_reference;
  end if;

  if v_order.status = 'approved' then
    return false; -- ya estaba acreditada
  end if;

  perform public.grant_purchased_credits(
    v_order.user_id, v_order.credits, v_order.reference
  );

  update public.credit_orders
     set status = 'approved', updated_at = now()
   where id = v_order.id;

  return true;
end;
$$;

-- ============================================================
-- reject_manual_order: descarta una solicitud que no se pagó.
-- No toca el saldo.
-- ============================================================
create or replace function public.reject_manual_order(p_reference text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.credit_orders;
begin
  select * into v_order from public.credit_orders
   where reference = p_reference
   for update;

  if v_order.id is null then
    raise exception 'No existe la solicitud %', p_reference;
  end if;

  if v_order.status <> 'pending' then
    return false;
  end if;

  update public.credit_orders
     set status = 'declined', updated_at = now()
   where id = v_order.id;

  return true;
end;
$$;

-- ============================================================
-- Permisos.
-- Aprobar una solicitud es acreditar dinero: nadie autenticado puede
-- llamar estas funciones, solo el service role desde el servidor.
-- ============================================================
revoke all on function public.generate_order_code() from public;
revoke all on function public.list_pending_orders() from public;
revoke all on function public.approve_manual_order(text) from public;
revoke all on function public.reject_manual_order(text) from public;

grant execute on function public.list_pending_orders() to service_role;
grant execute on function public.approve_manual_order(text) to service_role;
grant execute on function public.reject_manual_order(text) to service_role;

grant execute on function public.create_credit_order(text, text) to authenticated;
