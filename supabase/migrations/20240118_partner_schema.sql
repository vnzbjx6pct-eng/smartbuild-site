-- Partner Dashboard Schema Migration
-- Created: 2026-01-18

-- 1. STORES
create table if not exists stores (
  id uuid default gen_random_uuid() primary key,
  name text not null, -- "Espak Pärnu"
  brand_name text not null, -- "Espak"
  city text not null,
  address text,
  contact_email text,
  phone text,
  status text check (status in ('active', 'pending', 'disabled')) default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. STORE USERS (RBAC)
create table if not exists store_users (
  user_id uuid references auth.users(id) on delete cascade not null,
  store_id uuid references stores(id) on delete cascade not null,
  role text check (role in ('partner_admin', 'partner_manager', 'platform_admin')) default 'partner_manager',
  created_at timestamp with time zone default now(),
  primary key (user_id, store_id)
);

-- 3. CATEGORIES (Global)
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name_et text not null,
  name_ru text,
  created_at timestamp with time zone default now()
);

-- 4. PRODUCTS MASTER (Global Catalog - optional usage)
create table if not exists products_master (
  id uuid default gen_random_uuid() primary key,
  name_et text not null,
  name_ru text,
  brand text,
  unit text,
  category_id uuid references categories(id),
  image_url_default text,
  created_at timestamp with time zone default now()
);

-- 5. STORE PRODUCTS (The main inventory table)
create table if not exists store_products (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  product_master_id uuid references products_master(id), -- Nullable if local only
  
  -- Localization & Overrides
  name_override_et text,
  name_override_ru text,
  
  brand text,
  sku text,
  ean text,
  
  -- Price & Stock
  price numeric(10, 2) not null,
  currency text default 'EUR',
  stock_status text check (stock_status in ('in_stock', 'out_of_stock', 'limited', 'preorder')) default 'in_stock',
  stock_qty numeric default 0, -- Exact stock if available
  
  -- Logistics (Wolt / Courier)
  weight_kg numeric(10, 3),
  length_cm numeric(10, 1),
  width_cm numeric(10, 1),
  height_cm numeric(10, 1),
  
  hazmat boolean default false,
  fragile boolean default false,
  
  -- Delivery Toggles per Product
  delivery_allowed_wolt boolean default true,
  pickup_allowed boolean default true,
  store_delivery_allowed boolean default true,
  
  -- Computed/Maintained
  missing_dimensions boolean default false, -- managed via trigger or app logic
  
  -- Media
  image_url text,
  image_source text, -- 'upload', 'master', 'url'
  
  updated_at timestamp with time zone default now()
);

-- Indexes for performance
create index if not exists idx_store_products_store_id on store_products(store_id);
create index if not exists idx_store_products_sku on store_products(store_id, sku);
create index if not exists idx_store_products_ean on store_products(store_id, ean);

-- 6. IMPORTS (Job History)
create table if not exists imports (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  status text check (status in ('uploaded', 'previewed', 'applied', 'failed')) default 'uploaded',
  file_name text not null,
  file_path text, -- Storage path
  file_content text, -- MVP: Store raw CSV directly here
  mapping_json jsonb default '{}'::jsonb,
  summary_json jsonb default '{}'::jsonb,
  errors_json jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

-- 7. DELIVERY SETTINGS (Per Store)
create table if not exists store_delivery_settings (
  store_id uuid references stores(id) on delete cascade primary key,
  
  pickup_enabled boolean default true,
  wolt_enabled boolean default false,
  store_delivery_enabled boolean default false,
  
  cities text[] default '{}',
  prep_time_min int default 30,
  partial_delivery_enabled boolean default true,
  
  -- Simple constraints for v1
  store_delivery_rules_json jsonb default '{}'::jsonb, -- { min_order_eur: 50, fee_eur: 20, max_dist_km: 20 }
  
  updated_at timestamp with time zone default now()
);

-- RLS POLICIES --

alter table stores enable row level security;
alter table store_users enable row level security;
alter table categories enable row level security;
alter table products_master enable row level security;
alter table store_products enable row level security;
alter table imports enable row level security;
alter table store_delivery_settings enable row level security;

-- Helper function to check if user has access to store
create or replace function public.is_store_member(store_id_in uuid)
returns boolean as $$
begin
  return exists (
    select 1 from store_users
    where user_id = auth.uid()
    and store_id = store_id_in
  );
end;
$$ language plpgsql security definer;

-- 1. STORES
-- Platform admin: All
-- Partner: Read Own (via store_users)
-- (Simplified: Public read might be needed for catalog, but for partner dashboard we restrict)
create policy "Stores: Members can view own"
  on stores for select
  using (
    exists (select 1 from store_users where store_users.store_id = stores.id and store_users.user_id = auth.uid())
  );

-- 2. STORE USERS
create policy "StoreUsers: View own memberships"
  on store_users for select
  using (user_id = auth.uid());

-- 3. STORE PRODUCTS
create policy "Products: Members select/insert/update/delete own"
  on store_products for all
  using (public.is_store_member(store_id))
  with check (public.is_store_member(store_id));

-- 4. IMPORTS
create policy "Imports: Members full access own"
  on imports for all
  using (public.is_store_member(store_id))
  with check (public.is_store_member(store_id));

-- 5. DELIVERY SETTINGS
create policy "Settings: Members full access own"
  on store_delivery_settings for all
  using (public.is_store_member(store_id))
  with check (public.is_store_member(store_id));

-- 6. PUBLIC READS (Catalog side - Authenticated or Anon)
create policy "Public: Categories read" on categories for select using (true);
create policy "Public: Master Products read" on products_master for select using (true);

-- SEED DATA (For Demo) --
-- Note: User ID needs to be linked manually if using Supabase Auth.
-- Creating a test store 'Espak Pärnu'

do $$
declare
  espak_id uuid;
  settings_exists boolean;
begin
  -- Insert Store if not exists
  if not exists (select 1 from stores where name = 'Espak Pärnu') then
     insert into stores (name, brand_name, city, address, contact_email, phone, status)
     values ('Espak Pärnu', 'Espak', 'Pärnu', 'Papiniidu 4', 'parnu@espak.ee', '+37255555555', 'active')
     returning id into espak_id;
     
     -- Insert Settings
     insert into store_delivery_settings (store_id, wolt_enabled, cities)
     values (espak_id, true, ARRAY['Pärnu']);
  else
     select id into espak_id from stores where name = 'Espak Pärnu' limit 1;
  end if;
  
  -- NOTE: You must manually assign your user_id to this store in `store_users` table to see it.
  -- insert into store_users (user_id, store_id, role) values ('YOUR_USER_ID', espak_id, 'partner_admin');
end $$;
