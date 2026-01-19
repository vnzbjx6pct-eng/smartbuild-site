# Supabase Keep-Alive Configuration

This project includes a Vercel Cron Job to prevent your Supabase project from pausing due to inactivity (every 2 days).

## 1. Environment Variables
Ensure these are set in Vercel Project Settings:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (NOT Anon Key).
- `CRON_SECRET`: Optional, arbitrary string for manual invocation protection.

## 2. Supabase Setup
Run this SQL in your Supabase SQL Editor to create the ping function:

```sql
create or replace function public.keepalive_ping()
returns boolean
language sql
as $$
select true;
$$;
```

## 3. Testing
**Manual (via Browser/cURL):**
`GET https://your-domain.com/api/cron/keepalive?secret=YOUR_CRON_SECRET`

**Vercel Cron:**
Vercel will automatically call this endpoint every 2 days at 10:00 UTC. It injects the `x-vercel-cron: 1` header, bypassing the secret check.
