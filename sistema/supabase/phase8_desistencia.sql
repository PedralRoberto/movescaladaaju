-- Fase 8: Campos de desistência
ALTER TABLE inscricoes
  ADD COLUMN IF NOT EXISTS reembolsado     boolean      NULL,
  ADD COLUMN IF NOT EXISTS data_desistencia timestamptz NULL;
