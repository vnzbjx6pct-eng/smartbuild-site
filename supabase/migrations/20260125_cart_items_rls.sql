-- Enable and enforce RLS for cart_items access
alter table public.cart_items enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'cart_items'
      and policyname = 'cart_items_insert_own'
  ) then
    create policy "cart_items_insert_own"
      on public.cart_items
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'cart_items'
      and policyname = 'cart_items_update_own'
  ) then
    create policy "cart_items_update_own"
      on public.cart_items
      for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'cart_items'
      and policyname = 'cart_items_delete_own'
  ) then
    create policy "cart_items_delete_own"
      on public.cart_items
      for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;
