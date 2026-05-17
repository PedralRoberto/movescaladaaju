-- Fase 9: Controle de materiais da Vigília
create table if not exists public.vigilia_materiais (
  id             uuid        primary key default gen_random_uuid(),
  inscricao_id   uuid        not null unique references public.inscricoes(id) on delete cascade,
  foto_crianca   boolean     not null default false,
  foto_adolescente boolean   not null default false,
  foto_atual     boolean     not null default false,
  cartas_recebidas integer   not null default 0 check (cartas_recebidas >= 0),
  observacoes    text,
  updated_at     timestamptz default now(),
  created_at     timestamptz default now()
);

alter table public.vigilia_materiais enable row level security;

create policy "admins_all_vigilia_materiais"
  on public.vigilia_materiais for all to authenticated
  using (true) with check (true);
