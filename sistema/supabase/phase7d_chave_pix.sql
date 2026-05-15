-- Chave Pix por retiro — exibida no formulário público de inscrição
-- Rodar no Supabase SQL Editor
alter table public.retiros
  add column if not exists chave_pix text;
