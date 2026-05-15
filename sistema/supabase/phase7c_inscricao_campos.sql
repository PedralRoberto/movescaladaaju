-- Campos extras da ficha de inscrição (fase 7c)
-- Rodar no Supabase SQL Editor
alter table public.inscricoes
  add column if not exists apelido text,
  add column if not exists endereco text,
  add column if not exists instagram text,
  add column if not exists cpf text,
  add column if not exists como_conheceu text,
  add column if not exists conhece_alguem text,
  add column if not exists sacramentos text[] not null default '{}',
  add column if not exists instrumento_musical text,
  add column if not exists condicao_saude text,
  add column if not exists outra_condicao_saude text,
  add column if not exists medicacao_continua text,
  add column if not exists menor_de_idade boolean not null default false,
  add column if not exists nome_responsavel text,
  add column if not exists contato_responsavel text,
  add column if not exists email_responsavel text,
  add column if not exists comprovante_pagamento_url text,
  add column if not exists documento_identificacao_url text;
