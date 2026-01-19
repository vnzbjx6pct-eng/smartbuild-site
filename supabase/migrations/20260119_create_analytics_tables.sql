-- Create analytics_events table
create table if not exists public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  event_name text not null,
  category text, -- e.g. 'ecommerce', 'errors', 'system'
  properties jsonb default '{}'::jsonb, -- Flexible event data
  user_id uuid references auth.users(id),
  session_id text, -- For anonymous tracking
  url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Service role primarily, but maybe allow anon insert for tracking?)
alter table public.analytics_events enable row level security;

-- Allow anon to insert events (for public site tracking)
create policy "Anyone can insert analytics events"
  on public.analytics_events for insert
  with check (true);

-- Only Admin can view analytics
create policy "Admins can view analytics events"
  on public.analytics_events for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Create analytics_daily_metrics table (Aggegations)
create table if not exists public.analytics_daily_metrics (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  metric_name text not null, -- 'visitors', 'orders', 'conversion_rate'
  value decimal(10,2) not null,
  dimensions jsonb default '{}'::jsonb, -- breakdown by city, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(date, metric_name, dimensions)
);

alter table public.analytics_daily_metrics enable row level security;

-- Only Admin can view/insert metrics (usually bg job)
create policy "Admins can view daily metrics"
  on public.analytics_daily_metrics for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
