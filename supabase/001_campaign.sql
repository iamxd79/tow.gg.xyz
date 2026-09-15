-- Apply once in the selected Supabase project. Anonymous clients can only read approved entries.
create table public.thesis_entries(
 id uuid primary key default gen_random_uuid(),
 gg_thesis_url text not null unique,
 telegram_username text not null check(telegram_username ~ '^[a-z][a-z0-9_]{4,31}$'),
 x_username text not null check(x_username ~ '^[a-z0-9_]{1,15}$'),
 submitted_at timestamptz not null default now(),
 status text not null default 'approved' check(status in ('approved','pending','rejected')),
 check(gg_thesis_url ~ '^https://gg\.xyz/[^?#%\\[:space:]]+[^/?#%\\[:space:]]$')
);
create index thesis_entries_newest on public.thesis_entries(submitted_at desc) where status='approved';
alter table public.thesis_entries enable row level security;
revoke all on public.thesis_entries from anon,authenticated;
grant select on public.thesis_entries to anon,authenticated;
grant all on public.thesis_entries to service_role;
create policy approved_entries on public.thesis_entries for select to anon,authenticated using(status='approved');
alter publication supabase_realtime add table public.thesis_entries;
create table public.thesis_rate_limits(key text primary key,window_start timestamptz not null,attempts integer not null);
create table public.thesis_notifications(entry_id uuid primary key references public.thesis_entries(id),payload jsonb not null,created_at timestamptz not null default now(),sent_at timestamptz,claimed_at timestamptz);
alter table public.thesis_rate_limits enable row level security;
alter table public.thesis_notifications enable row level security;
revoke all on public.thesis_rate_limits,public.thesis_notifications from anon,authenticated;
grant all on public.thesis_rate_limits,public.thesis_notifications to service_role;
create function public.check_thesis_rate(p_key text) returns boolean language plpgsql security definer set search_path=public as $$
declare n integer;
begin
 insert into thesis_rate_limits values(p_key,now(),1)
 on conflict(key) do update set
 attempts=case when thesis_rate_limits.window_start<now()-interval '10 minutes' then 1 else thesis_rate_limits.attempts+1 end,
 window_start=case when thesis_rate_limits.window_start<now()-interval '10 minutes' then now() else thesis_rate_limits.window_start end
 returning attempts into n;
 delete from thesis_rate_limits where window_start<now()-interval '1 day';
 return n<=5;
end $$;
create function public.submit_thesis(p_url text,p_telegram text,p_x text) returns public.thesis_entries language plpgsql security definer set search_path=public as $$
declare entry thesis_entries;
begin
 -- Normalize all accepted URL variants before the unique constraint is evaluated.
 p_url:=regexp_replace(trim(p_url),'[?#].*$','');
 p_url:=regexp_replace(p_url,'^https?://(www\.)?gg\.xyz/','https://gg.xyz/','i');
 p_url:=regexp_replace(p_url,'/+$','');
 insert into thesis_entries(gg_thesis_url,telegram_username,x_username) values(p_url,lower(p_telegram),lower(p_x)) returning * into entry;
 insert into thesis_notifications(entry_id,payload) values(entry.id,to_jsonb(entry));
 return entry;
end $$;
create function public.claim_thesis_notifications() returns setof public.thesis_notifications language sql security definer set search_path=public as $$
 update thesis_notifications set claimed_at=now()
 where entry_id in(select entry_id from thesis_notifications where sent_at is null and created_at>now()-interval '23 hours' and (claimed_at is null or claimed_at<now()-interval '2 minutes') order by created_at limit 20 for update skip locked) returning *;
$$;
revoke all on function public.check_thesis_rate(text),public.submit_thesis(text,text,text),public.claim_thesis_notifications() from public,anon,authenticated;
grant execute on function public.check_thesis_rate(text),public.submit_thesis(text,text,text),public.claim_thesis_notifications() to service_role;
