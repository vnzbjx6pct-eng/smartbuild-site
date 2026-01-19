-- Create partners_contacts table
create table if not exists public.partners_contacts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text not null,
  city text not null,
  partner_type text not null check (partner_type in ('store', 'wholesaler', 'manufacturer', 'logistics', 'other')),
  api_readiness text not null,
  status text default 'new' check (status in ('new', 'contacted', 'approved', 'rejected')),
  user_id uuid references auth.users(id)
);

-- Enable RLS
alter table public.partners_contacts enable row level security;

-- Policies
create policy "Anyone can insert partners contacts"
  on public.partners_contacts for insert
  with check (true);

create policy "Users can view their own partner contacts"
  on public.partners_contacts for select
  using (auth.uid() = user_id);
