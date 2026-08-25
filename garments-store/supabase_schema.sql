-- Production database for the garments store.
-- Run this entire file in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(12,2) not null check (price > 0),
  section text not null default 'Boys' check (section in ('Boys','Girls','Uniforms')),
  sub_category text not null default '',
  image text not null default '',
  variants jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Safe to re-run: adds the new columns if you already created this table before.
alter table public.products add column if not exists section text not null default 'Boys';
alter table public.products add column if not exists sub_category text not null default '';

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  items jsonb not null,
  customer jsonb not null,
  total numeric(12,2) not null check (total >= 0),
  payment_method text not null check (payment_method in ('cod','payfast')),
  payment_status text not null check (payment_status in ('pending','paid','failed','cod')),
  order_status text not null check (order_status in ('pending','processing','shipped','delivered','cancelled')),
  courier_tracking_id text,
  courier_provider text,
  created_at timestamptz not null default now()
);

create index if not exists products_created_at_idx on public.products(created_at desc);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

alter table public.products enable row level security;
alter table public.orders enable row level security;
revoke all on table public.products from anon, authenticated;
revoke all on table public.orders from anon, authenticated;

create or replace function public.create_order_secure(
  p_items jsonb,
  p_customer jsonb,
  p_payment_method text default 'cod'
)
returns setof public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  product_row public.products%rowtype;
  variant_index integer;
  available_stock integer;
  qty integer;
  item_total numeric := 0;
  server_items jsonb := '[]'::jsonb;
  new_order public.orders%rowtype;
  product_id uuid;
  selected_size text;
begin
  if p_payment_method <> 'cod' then
    raise exception 'Only Cash on Delivery is enabled';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  for item in select * from jsonb_array_elements(p_items)
  loop
    begin
      product_id := (item->>'productId')::uuid;
    exception when invalid_text_representation then
      raise exception 'Invalid product ID';
    end;
    selected_size := trim(item->>'size');
    qty := (item->>'qty')::integer;

    if qty is null or qty < 1 or qty > 50 then raise exception 'Invalid quantity'; end if;

    select * into product_row from public.products where id = product_id for update;
    if not found then raise exception 'Product not found'; end if;

    variant_index := null;
    available_stock := null;
    select ordinality - 1, (v->>'stock')::integer into variant_index, available_stock
    from jsonb_array_elements(product_row.variants) with ordinality as x(v, ordinality)
    where v->>'size' = selected_size limit 1;

    if variant_index is null then raise exception 'Selected size is not available for %', product_row.name; end if;
    if available_stock < qty then raise exception 'Not enough stock for %', product_row.name; end if;

    product_row.variants := jsonb_set(product_row.variants, array[variant_index::text, 'stock'], to_jsonb(available_stock - qty));
    update public.products set variants = product_row.variants where id = product_row.id;

    server_items := server_items || jsonb_build_array(jsonb_build_object(
      'productId', product_row.id,
      'name', product_row.name,
      'size', selected_size,
      'price', product_row.price,
      'qty', qty,
      'image', product_row.image
    ));
    item_total := item_total + (product_row.price * qty);
  end loop;

  insert into public.orders (items, customer, total, payment_method, payment_status, order_status)
  values (server_items, p_customer, item_total, 'cod', 'cod', 'pending')
  returning * into new_order;

  return next new_order;
end;
$$;

revoke all on function public.create_order_secure(jsonb, jsonb, text) from public, anon, authenticated;
grant execute on function public.create_order_secure(jsonb, jsonb, text) to service_role;
