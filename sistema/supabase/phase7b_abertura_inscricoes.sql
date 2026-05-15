-- Abertura programada de inscrições
-- Rodar no Supabase SQL Editor
alter table public.retiros
  add column if not exists abertura_inscricoes timestamptz;
