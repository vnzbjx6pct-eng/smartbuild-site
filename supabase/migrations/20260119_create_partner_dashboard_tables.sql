-- Create or update profiles table to include role
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  phone text,
  default_city text,
  company_name text,
  contact_email text,
  role text default 'customer' check (role in ('customer', 'partner', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Create partner_products table for CSV imports
create table if not exists public.partner_products (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references auth.users(id), -- Assuming store is a user for now, or link to separate store table if exists
  product_name text not null,
  category text,
  subcategory text,
  material_type text,
  price decimal(10,2),
  unit text,
  availability text,
  delivery_options text,
  source_csv_row jsonb, -- Store original row for debugging
  status text default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on partner_products
alter table public.partner_products enable row level security;

-- Partner Products Policies
create policy "Partners can view their own products"
  on public.partner_products for select
  using (auth.uid() = store_id);

create policy "Partners can insert their own products"
  on public.partner_products for insert
  with check (auth.uid() = store_id);

create policy "Partners can update their own products"
  on public.partner_products for update
  using (auth.uid() = store_id);

create policy "Partners can delete their own products"
  on public.partner_products for delete
  using (auth.uid() = store_id);

-- Function to handle user creation trigger (optional, good for ensuring profile exists)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
