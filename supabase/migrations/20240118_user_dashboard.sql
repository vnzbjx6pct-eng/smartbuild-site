-- User Dashboard Schema Migration
-- Created: 2026-01-18

-- 1. USER PROFILES
create table if not exists user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  phone text,
  default_city text, -- Tallinn/Pärnu/Tartu/Narva
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. ORDERS
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  status text check (status in ('draft', 'submitted', 'confirmed', 'cancelled', 'completed')) default 'draft',
  payment_status text check (payment_status in ('unpaid', 'paid', 'refunded')) default 'unpaid',
  currency text default 'EUR',
  
  subtotal numeric(10, 2) default 0,
  delivery_fee numeric(10, 2) default 0,
  total numeric(10, 2) default 0,
  
  city text,
  address_line text,
  phone text,
  notes text,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_orders_user_created on orders(user_id, created_at desc);

-- 3. ORDER ITEMS
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  store_id uuid references stores(id), -- Nullable if generic or multiple stores logic changes
  
  product_id text not null, -- Can be UUID or string ID from catalog
  name text not null,
  brand text,
  qty numeric(10, 3) not null,
  unit text,
  
  price numeric(10, 2) not null,
  line_total numeric(10, 2) not null,
  image_url text,
  
  -- Link to specific shipment if split
  shipment_id uuid -- Will execute alter table after shipments table created
);

-- 4. SHIPMENTS
create table if not exists shipments (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  
  type text check (type in ('wolt', 'store_delivery', 'pickup')) not null,
  status text check (status in ('pending', 'quoted', 'accepted', 'preparing', 'dispatched', 'delivered', 'failed', 'cancelled')) default 'pending',
  
  store_id uuid references stores(id),
  city text,
  address_line text,
  
  eta_minutes int,
  fee numeric(10, 2) default 0,
  
  provider text, -- 'wolt'
  provider_reference text,
  status_reason_code text,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_shipments_order on shipments(order_id);

-- Add fk now
alter table order_items add constraint fk_order_items_shipment foreign key (shipment_id) references shipments(id) on delete set null;

-- 5. SHIPMENT EVENTS (Timeline)
create table if not exists shipment_events (
  id uuid default gen_random_uuid() primary key,
  shipment_id uuid references shipments(id) on delete cascade not null,
  event_status text not null,
  message text,
  created_at timestamp with time zone default now()
);

create index if not exists idx_shipment_events_shipment on shipment_events(shipment_id asc);

-- RLS POLICIES --

alter table user_profiles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table shipments enable row level security;
alter table shipment_events enable row level security;

-- PROFILES
create policy "Profiles: Users manage own"
  on user_profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- ORDERS
create policy "Orders: Users view own"
  on orders for select
  using (user_id = auth.uid());

create policy "Orders: Users insert own (via server mostly, but allow client draft)"
  on orders for insert
  with check (user_id = auth.uid());

-- ORDER ITEMS
create policy "OrderItems: Users view own via order"
  on order_items for select
  using (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

-- SHIPMENTS
create policy "Shipments: Users view own via order"
  on shipments for select
  using (exists (select 1 from orders where orders.id = shipments.order_id and orders.user_id = auth.uid()));

-- SHIPMENT EVENTS
create policy "Events: Users view own via shipment"
  on shipment_events for select
  using (exists (
    select 1 from shipments 
    join orders on orders.id = shipments.order_id
    where shipments.id = shipment_events.shipment_id 
    and orders.user_id = auth.uid()
  ));

-- Service Role (implicit full access, but good to keep in mind)
