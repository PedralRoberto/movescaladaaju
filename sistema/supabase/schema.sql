-- ============================================
-- ESCALADA AJU — Schema completo
-- Rodar no Supabase SQL Editor
-- ============================================

create table if not exists public.retiros (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('regular', 'master')),
  polo text not null check (polo in ('grageru', 'atalaia')),
  numero integer not null,
  ano integer not null,
  data_inicio date,
  data_fim date,
  local_nome text,
  vagas integer not null default 40,
  status text not null default 'preparacao'
    check (status in ('preparacao', 'inscricoes_abertas', 'inscricoes_encerradas', 'realizado')),
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint master_sempre_grageru check (tipo != 'master' or polo = 'grageru'),
  unique(tipo, polo, ano)
);

create table if not exists public.reunioes_previas (
  id uuid primary key default gen_random_uuid(),
  retiro_id uuid not null references public.retiros(id) on delete cascade,
  numero integer not null check (numero between 1 and 4),
  data date not null,
  local_nome text,
  observacoes text,
  created_at timestamptz default now(),
  unique(retiro_id, numero)
);

create table if not exists public.inscricoes (
  id uuid primary key default gen_random_uuid(),
  retiro_id uuid not null references public.retiros(id) on delete cascade,
  nome_completo text not null,
  data_nascimento date,
  telefone text not null,
  email text,
  bairro text,
  modalidade_pagamento text not null default 'padrao'
    check (modalidade_pagamento in ('padrao', 'integral', 'excecao')),
  -- padrao: R$50 entrada + R$200 final + recebe rifa
  -- integral: R$250 entrada, sem rifa
  -- excecao: paga R$250 tudo no final
  status text not null default 'inscrito'
    check (status in ('inscrito', 'lista_espera', 'confirmado', 'desclassificado', 'cancelado')),
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.presencas (
  id uuid primary key default gen_random_uuid(),
  inscricao_id uuid not null references public.inscricoes(id) on delete cascade,
  reuniao_id uuid not null references public.reunioes_previas(id) on delete cascade,
  presente boolean not null default false,
  observacoes text,
  registrado_em timestamptz default now(),
  unique(inscricao_id, reuniao_id)
);

create table if not exists public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  inscricao_id uuid not null references public.inscricoes(id) on delete cascade,
  tipo text not null check (tipo in ('entrada', 'final', 'integral')),
  valor decimal(10,2) not null check (valor > 0),
  data_pagamento date not null,
  comprovante_url text,
  observacoes text,
  registrado_por uuid references auth.users(id),
  created_at timestamptz default now()
);

-- ============================================
-- RLS — Row Level Security
-- ============================================

alter table public.retiros enable row level security;
alter table public.reunioes_previas enable row level security;
alter table public.inscricoes enable row level security;
alter table public.presencas enable row level security;
alter table public.pagamentos enable row level security;

-- Admins (usuários autenticados) têm acesso total
create policy "admins_all_retiros"
  on public.retiros for all to authenticated
  using (true) with check (true);

create policy "admins_all_reunioes"
  on public.reunioes_previas for all to authenticated
  using (true) with check (true);

create policy "admins_all_inscricoes"
  on public.inscricoes for all to authenticated
  using (true) with check (true);

create policy "admins_all_presencas"
  on public.presencas for all to authenticated
  using (true) with check (true);

create policy "admins_all_pagamentos"
  on public.pagamentos for all to authenticated
  using (true) with check (true);

-- Público pode inserir inscrição apenas quando retiro está com inscrições abertas
create policy "public_insert_inscricao"
  on public.inscricoes for insert to anon
  with check (
    exists (
      select 1 from public.retiros
      where id = retiro_id and status = 'inscricoes_abertas'
    )
  );

-- ============================================
-- Storage bucket para comprovantes
-- Descomente e rode separado se necessário
-- ============================================
-- insert into storage.buckets (id, name, public)
-- values ('comprovantes', 'comprovantes', false)
-- on conflict do nothing;
