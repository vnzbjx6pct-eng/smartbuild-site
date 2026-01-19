-- Create support_requests table
create table if not exists public.support_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null,
  topic text not null,
  message text not null,
  status text default 'new' check (status in ('new', 'in_progress', 'resolved', 'spam')),
  user_id uuid references auth.users(id)
);

-- Create partner_requests table
create table if not exists public.partner_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  partner_type text not null,
  integration_type text,
  message text,
  status text default 'new' check (status in ('new', 'contacted', 'approved', 'rejected')),
  user_id uuid references auth.users(id)
);

-- Enable RLS
alter table public.support_requests enable row level security;
alter table public.partner_requests enable row level security;

-- Policies for public insertion (anyone can submit)
create policy "Anyone can insert support requests"
  on public.support_requests for insert
  with check (true);

create policy "Anyone can insert partner requests"
  on public.partner_requests for insert
  with check (true);

-- Policies for viewing (only admins/service role, but for now authenticated users can see their own if we linked them)
create policy "Users can view their own support requests"
  on public.support_requests for select
  using (auth.uid() = user_id);

create policy "Users can view their own partner requests"
  on public.partner_requests for select
  using (auth.uid() = user_id);
