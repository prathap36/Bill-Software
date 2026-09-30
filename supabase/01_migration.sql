-- Ledgerly schema. Paste into Supabase > SQL Editor > New query > Run.
create extension if not exists pgcrypto;
create sequence if not exists invoice_seq;

create table settings(
  id int primary key default 1 check(id=1),
  business_name text not null default 'My Business', address text default '', phone text default '',
  logo_url text, invoice_prefix text not null default 'INV', gst_percent numeric(5,2) not null default 0,
  currency text not null default 'INR (₹)', footer_note text default 'Thank you! Visit again.');
insert into settings(id) values(1);

create table products(
  id uuid primary key default gen_random_uuid(), name text not null, sku text not null unique, category text not null,
  purchase_price numeric(12,2) not null check(purchase_price>=0), selling_price numeric(12,2) not null check(selling_price>=0),
  stock int not null default 0 check(stock>=0), unit text not null default 'pc', barcode text,
  low_stock_level int not null default 10, created_at timestamptz not null default now());

create table customers(
  id uuid primary key default gen_random_uuid(), name text not null, phone text unique, created_at timestamptz not null default now());

create table bills(
  id uuid primary key default gen_random_uuid(),
  invoice_no text not null unique,                       -- generated from invoice_seq inside complete_sale()
  customer_id uuid references customers(id) on delete set null,
  customer_name text not null default 'Walk-in', customer_phone text not null default '',
  subtotal numeric(12,2) not null, discount_type text not null default 'percent' check(discount_type in('percent','fixed')),
  discount_value numeric(12,2) not null default 0, discount_amount numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0, total numeric(12,2) not null,
  payment_method text not null check(payment_method in('Cash','Card','UPI / QR')),
  status text not null default 'paid' check(status in('paid','cancelled','part-returned','returned')),
  refunded_amount numeric(12,2) not null default 0, created_by uuid default auth.uid(),
  created_at timestamptz not null default now());          -- date AND time

create table bill_items(
  id uuid primary key default gen_random_uuid(), bill_id uuid not null references bills(id) on delete cascade,
  product_id uuid references products(id) on delete set null, name text not null,
  qty int not null check(qty>0), selling_price numeric(12,2) not null, purchase_price numeric(12,2) not null,
  returned_qty int not null default 0, check(returned_qty<=qty));

create table returns(
  id uuid primary key default gen_random_uuid(), bill_id uuid not null references bills(id),
  refund_amount numeric(12,2) not null, refund_method text not null check(refund_method in('Cash','Card','UPI / QR')),
  created_at timestamptz not null default now());

create table return_items(
  id uuid primary key default gen_random_uuid(), return_id uuid not null references returns(id) on delete cascade,
  bill_item_id uuid not null references bill_items(id), product_id uuid references products(id) on delete set null, qty int not null check(qty>0));

create table expenses(
  id uuid primary key default gen_random_uuid(), name text not null,
  category text not null check(category in('Rent','Salary','Electricity','Transport','Maintenance','Internet','Other')),
  amount numeric(12,2) not null check(amount>0), expense_date date not null default current_date,
  payment_method text not null check(payment_method in('Cash','Card','UPI / QR')), notes text,
  created_at timestamptz not null default now());

create index on bills(created_at); create index on bills(customer_phone); create index on bill_items(bill_id); create index on returns(created_at);

-- Row Level Security: only signed-in users can read or write anything.
do $$ declare t text; begin
  foreach t in array array['settings','products','customers','bills','bill_items','returns','return_items','expenses'] loop
    execute format('alter table %I enable row level security',t);
    execute format('create policy "signed-in users only" on %I for all to authenticated using (true) with check (true)',t);
  end loop; end $$;

-- COMPLETE SALE: prices come from the database, stock is locked and checked, all in one transaction.
create or replace function complete_sale(p_name text,p_phone text,p_discount_type text,p_discount_value numeric,p_payment text,p_items jsonb)
returns bills
language plpgsql
security definer
set search_path = public
as $$
declare s settings; b bills; it jsonb; p products; sub numeric:=0; disc numeric; tx numeric; cid uuid; q int; nm text:=coalesce(nullif(trim(p_name),''),'Walk-in');
begin
  if jsonb_array_length(coalesce(p_items,'[]'::jsonb))=0 then raise exception 'Add at least one product'; end if;
  select * into s from settings where id=1;
  for it in select value from jsonb_array_elements(p_items) loop
    q:=(it->>'qty')::int;
    select * into p from products where id=(it->>'product_id')::uuid for update;
    if not found then raise exception 'Product not found'; end if;
    if q<1 or p.stock<q then raise exception 'Only % % of % in stock',p.stock,p.unit,p.name; end if;
    sub:=sub+p.selling_price*q;
  end loop;
  disc:=least(sub,case when p_discount_type='percent' then sub*coalesce(p_discount_value,0)/100 else coalesce(p_discount_value,0) end);
  tx:=round((sub-disc)*s.gst_percent/100,2);
  if coalesce(trim(p_phone),'')<>'' then
    insert into customers(name,phone) values(nm,trim(p_phone)) on conflict(phone) do update set name=customers.name returning id into cid;
  end if;
  insert into bills(invoice_no,customer_id,customer_name,customer_phone,subtotal,discount_type,discount_value,discount_amount,tax,total,payment_method)
  values(s.invoice_prefix||'-'||lpad(nextval('invoice_seq')::text,5,'0'),cid,nm,coalesce(trim(p_phone),''),sub,coalesce(p_discount_type,'percent'),coalesce(p_discount_value,0),disc,tx,sub-disc+tx,p_payment)
  returning * into b;
  for it in select value from jsonb_array_elements(p_items) loop
    q:=(it->>'qty')::int; select * into p from products where id=(it->>'product_id')::uuid;
    insert into bill_items(bill_id,product_id,name,qty,selling_price,purchase_price) values(b.id,p.id,p.name,q,p.selling_price,p.purchase_price);
    update products set stock=stock-q where id=p.id;
  end loop;
  return b;
end $$;

-- CANCEL BILL: bill stays (status = 'cancelled'), unreturned stock goes back, reports ignore it.
create or replace function cancel_bill(p_bill_id uuid)
returns bills
language plpgsql
security definer
set search_path = public
as $$
declare b bills;
begin
  select * into b from bills where id=p_bill_id for update;
  if not found then raise exception 'Bill not found'; end if;
  if b.status='cancelled' then raise exception 'Bill is already cancelled'; end if;
  update products p set stock=p.stock+(i.qty-i.returned_qty) from bill_items i where i.bill_id=b.id and p.id=i.product_id;
  update bills set status='cancelled' where id=b.id returning * into b;
  return b;
end $$;

-- PROCESS RETURN: p_items = [{"bill_item_id":"…","qty":1}]. Restores stock, records refund, updates bill status.
create or replace function process_return(p_bill_id uuid,p_items jsonb,p_method text)
returns public.returns
language plpgsql
security definer
set search_path = public
as $$
declare b bills; r public.returns; it jsonb; bi bill_items; q int; amt numeric:=0; f numeric;
begin
  select * into b from bills where id=p_bill_id for update;
  if not found then raise exception 'Bill not found'; end if;
  if b.status='cancelled' then raise exception 'Cancelled bills cannot be returned'; end if;
  f:=case when b.subtotal>0 then b.total/b.subtotal else 1 end;   -- refund keeps the bill's discount and tax share
  insert into public.returns(bill_id,refund_amount,refund_method) values(b.id,0,p_method) returning * into r;
  for it in select value from jsonb_array_elements(p_items) loop
    q:=(it->>'qty')::int; continue when q<=0;
    select * into bi from bill_items where id=(it->>'bill_item_id')::uuid and bill_id=b.id for update;
    if not found or q>bi.qty-bi.returned_qty then raise exception 'Invalid return quantity'; end if;
    update bill_items set returned_qty=returned_qty+q where id=bi.id;
    update products set stock=stock+q where id=bi.product_id;
    insert into return_items(return_id,bill_item_id,product_id,qty) values(r.id,bi.id,bi.product_id,q);
    amt:=amt+round(q*bi.selling_price*f,2);
  end loop;
  if amt=0 then raise exception 'Enter a quantity to return'; end if;
  update public.returns set refund_amount=amt where id=r.id returning * into r;
  update bills set refunded_amount=refunded_amount+amt,
    status=case when exists(select 1 from bill_items where bill_id=b.id and returned_qty<qty) then 'part-returned' else 'returned' end where id=b.id;
  return r;
end $$;

revoke execute on function complete_sale,cancel_bill,process_return from public,anon;
grant execute on function complete_sale,cancel_bill,process_return to authenticated;

-- Bill data is committed only by the completion/cancel/return RPCs.
drop policy if exists "signed-in users only" on bills;
drop policy if exists "signed-in users only" on bill_items;
drop policy if exists "signed-in users only" on returns;
drop policy if exists "signed-in users only" on return_items;
create policy "signed-in users can view bills" on bills for select to authenticated using (true);
create policy "signed-in users can view bill items" on bill_items for select to authenticated using (true);
create policy "signed-in users can view returns" on returns for select to authenticated using (true);
create policy "signed-in users can view return items" on return_items for select to authenticated using (true);
revoke insert, update, delete on public.bills from authenticated;
revoke insert, update, delete on public.bill_items from authenticated;
revoke insert, update, delete on public.returns from authenticated;
revoke insert, update, delete on public.return_items from authenticated;
