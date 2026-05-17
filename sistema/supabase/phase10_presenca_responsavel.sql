-- Phase 10: Presença dos Responsáveis nas Preparatórias
-- Execute cada bloco separadamente no SQL Editor do Supabase

-- Bloco 1: Criar tabela
CREATE TABLE IF NOT EXISTS public.presencas_responsavel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inscricao_id uuid NOT NULL REFERENCES public.inscricoes(id) ON DELETE CASCADE,
  reuniao_id uuid NOT NULL REFERENCES public.reunioes_previas(id) ON DELETE CASCADE,
  presente boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (inscricao_id, reuniao_id)
);

ALTER TABLE public.presencas_responsavel ENABLE ROW LEVEL SECURITY;

-- Bloco 2: Grant (execute separado)
-- GRANT ALL ON public.presencas_responsavel TO anon, authenticated, service_role;

-- Bloco 3: Policy (execute separado)
-- CREATE POLICY "authenticated_all_presencas_responsavel"
--   ON public.presencas_responsavel
--   FOR ALL TO authenticated
--   USING (true) WITH CHECK (true);
