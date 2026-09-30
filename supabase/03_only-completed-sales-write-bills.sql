-- Prevent the browser client from creating or editing incomplete bills.
-- Bills and bill_items are written only by the transactional RPCs.
drop policy if exists "signed-in users only" on bills;
drop policy if exists "signed-in users only" on bill_items;
drop policy if exists "signed-in users only" on returns;
drop policy if exists "signed-in users only" on return_items;
drop policy if exists "signed-in users can view bills" on bills;
drop policy if exists "signed-in users can view bill items" on bill_items;
drop policy if exists "signed-in users can view returns" on returns;
drop policy if exists "signed-in users can view return items" on return_items;

create policy "signed-in users can view bills" on bills
  for select to authenticated using (true);
create policy "signed-in users can view bill items" on bill_items
  for select to authenticated using (true);
create policy "signed-in users can view returns" on returns
  for select to authenticated using (true);
create policy "signed-in users can view return items" on return_items
  for select to authenticated using (true);

revoke insert, update, delete on public.bills from authenticated;
revoke insert, update, delete on public.bill_items from authenticated;
revoke insert, update, delete on public.returns from authenticated;
revoke insert, update, delete on public.return_items from authenticated;

-- The RPCs run as the database owner and remain the only write path.
grant execute on function public.complete_sale(text,text,text,numeric,text,jsonb) to authenticated;
grant execute on function public.cancel_bill(uuid) to authenticated;
grant execute on function public.process_return(uuid,jsonb,text) to authenticated;
