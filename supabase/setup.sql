-- HomeHQ schema. Placeholders __PROJECT_REF__ and __CRON_SECRET__ are filled in at setup time.
create table if not exists kv (key text primary key, value jsonb not null, updated_at timestamptz not null default now());
create table if not exists push_subs (endpoint text primary key, person text not null, sub jsonb not null, created_at timestamptz not null default now());
create table if not exists reminders (
  id text primary key, person text not null, task_date text, task_id text,
  fire_at timestamptz not null, title text, body text, sent boolean not null default false);
create index if not exists reminders_due on reminders (fire_at) where not sent;

alter table kv enable row level security;
alter table push_subs enable row level security;
alter table reminders enable row level security;
drop policy if exists family_all on kv;
drop policy if exists family_all on push_subs;
drop policy if exists family_all on reminders;
create policy family_all on kv for all to authenticated using (true) with check (true);
create policy family_all on push_subs for all to authenticated using (true) with check (true);
create policy family_all on reminders for all to authenticated using (true) with check (true);

do $$ begin
  alter publication supabase_realtime add table kv;
exception when duplicate_object then null; end $$;

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
select cron.unschedule(jobid) from cron.job where jobname = 'send-reminders';
select cron.schedule('send-reminders', '* * * * *', $cron$
  select net.http_post(
    url := 'https://__PROJECT_REF__.supabase.co/functions/v1/send-reminders',
    headers := '{"x-cron-secret": "__CRON_SECRET__"}'::jsonb,
    body := '{}'::jsonb);
$cron$);
