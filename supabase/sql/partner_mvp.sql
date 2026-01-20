-- Create products table
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  partner_id uuid references auth.users(id) not null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  category text,
  stock integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create orders table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  partner_id uuid references auth.users(id) not null,
  customer_id uuid references auth.users(id), -- Optional, if linked to registered user
  customer_email text, -- For guest checkout or quick ref
  status text default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount numeric(10,2) default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create order items table
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id),
  quantity integer not null check (quantity > 0),
  price_at_time numeric(10,2) not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Policies for Products
create policy "Partners can manage their own products"
  on products
  for all
  using ( auth.uid() = partner_id )
  with check ( auth.uid() = partner_id );

create policy "Public can view active products"
  on products
  for select
  using ( is_active = true );

-- Policies for Orders
create policy "Partners can view their own orders"
  on orders
  for select
  using ( auth.uid() = partner_id );

create policy "Partners can update their own orders"
  on orders
  for update
  using ( auth.uid() = partner_id );

create policy "Customers can view their own orders"
  on orders
  for select
  using ( auth.uid() = customer_id );

-- Policies for Order Items
create policy "Partners can view items of their orders"
  on order_items
  for select
  using ( exists (select 1 from orders where orders.id = order_items.order_id and orders.partner_id = auth.uid()) );

create policy "Customers can view items of their orders"
  on order_items
  for select
  using ( exists (select 1 from orders where orders.id = order_items.order_id and orders.customer_id = auth.uid()) );

-- Indexes for performance
create index if not exists idx_products_partner_id on products(partner_id);
create index if not exists idx_orders_partner_id on orders(partner_id);
create index if not exists idx_order_items_order_id on order_items(order_id);
