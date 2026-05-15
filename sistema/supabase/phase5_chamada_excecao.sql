-- Fase 5: coluna de excecao de chamada
-- Rodar no Supabase SQL Editor antes de usar o modulo Chamada
alter table public.inscricoes
  add column if not exists chamada_excecao boolean not null default false;
