-- Create partner_stores table
create table if not exists public.partner_stores (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users(id) not null,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(owner_id) -- One store per user for now
);

-- Enable RLS
alter table public.partner_stores enable row level security;

-- Policies for partner_stores
create policy "Users can view their own store"
  on public.partner_stores for select
  using (auth.uid() = owner_id);

create policy "Users can update their own store"
  on public.partner_stores for update
  using (auth.uid() = owner_id);

create policy "Users can insert their own store"
  on public.partner_stores for insert
  with check (auth.uid() = owner_id);

-- Update partner_products to reference partner_stores instead of users
-- First, drop the existing constraint if possible, or we can just alter the column if it was consistent.
-- Since we are transitioning, let's assume we can drop the old FK and add a new one.
-- However, store_id currently holds user_ids. We need to map them if we want to keep data, 
-- but given this is a fresh feature, we can probably clear/ignore old data or assume empty.

-- Let's try to be safe: 
-- 1. Create stores for existing users who have products (backfill).
insert into public.partner_stores (owner_id, name)
select distinct store_id, 'My Store' 
from public.partner_products 
where store_id not in (select owner_id from public.partner_stores);

-- 2. Update partner_products.store_id to point to partner_stores.id (which is new UUID)
-- Wait, partner_products.store_id currently holds auth.uid(). 
-- We want it to hold partner_stores.id.
-- We need to map it.

-- Add a temporary column
alter table public.partner_products add column new_store_id uuid references public.partner_stores(id);

-- Update new column based on owner_id mapping
update public.partner_products pp
set new_store_id = ps.id
from public.partner_stores ps
where pp.store_id = ps.owner_id;

-- Now drop old column and rename new one? Or just switch usage?
-- Dropping might be destructive if I mess up. 
-- Let's rename store_id to owner_user_id (legacy) and rename new_store_id to store_id.

alter table public.partner_products rename column store_id to owner_user_id_legacy;
alter table public.partner_products rename column new_store_id to store_id;

-- Make store_id not null if appropriate
-- alter table public.partner_products alter column store_id set not null; -- Might fail if some rows didn't match

-- Update RLS for partner_products to use the new relationship
drop policy if exists "Partners can view their own products" on public.partner_products;
drop policy if exists "Partners can insert their own products" on public.partner_products;
drop policy if exists "Partners can update their own products" on public.partner_products;
drop policy if exists "Partners can delete their own products" on public.partner_products;

create policy "Partners can view their own products"
  on public.partner_products for select
  using (
    exists (
      select 1 from public.partner_stores ps 
      where ps.id = partner_products.store_id 
      and ps.owner_id = auth.uid()
    )
  );

create policy "Partners can insert their own products"
  on public.partner_products for insert
  with check (
    exists (
      select 1 from public.partner_stores ps 
      where ps.id = partner_products.store_id 
      and ps.owner_id = auth.uid()
    )
  );

create policy "Partners can update their own products"
  on public.partner_products for update
  using (
    exists (
      select 1 from public.partner_stores ps 
      where ps.id = partner_products.store_id 
      and ps.owner_id = auth.uid()
    )
  );

create policy "Partners can delete their own products"
  on public.partner_products for delete
  using (
    exists (
      select 1 from public.partner_stores ps 
      where ps.id = partner_products.store_id 
      and ps.owner_id = auth.uid()
    )
  );
