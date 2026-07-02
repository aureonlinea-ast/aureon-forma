create table if not exists public.perf_metrics (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  route text not null,
  metric text not null,
  value double precision not null,
  rating text,
  device text,
  connection text,
  viewport_w integer,
  viewport_h integer,
  user_agent text
);

grant insert on public.perf_metrics to anon, authenticated;
grant all on public.perf_metrics to service_role;

alter table public.perf_metrics enable row level security;

create policy "perf_metrics insert open"
  on public.perf_metrics
  for insert
  to anon, authenticated
  with check (true);

create index if not exists perf_metrics_route_metric_created_idx
  on public.perf_metrics (route, metric, created_at desc);