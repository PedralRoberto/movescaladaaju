'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { assertNaoEncontro } from '@/lib/auth-guard'
import type { RetiroTipo, RetiroPolo, RetiroStatus } from '@/types/database'

export async function createRetiro(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const guard = await assertNaoEncontro()
  if (guard.error) return guard
  const supabase = createAdminClient()

  const tipo = formData.get('tipo') as RetiroTipo
  // disabled selects don't submit — master is always grageru
  const polo = (tipo === 'master' ? 'grageru' : formData.get('polo')) as RetiroPolo
  const numero = Number(formData.get('numero'))
  const ano = Number(formData.get('ano'))
  const data_inicio = (formData.get('data_inicio') as string) || null
  const data_fim = (formData.get('data_fim') as string) || null
  const local_nome = (formData.get('local_nome') as string) || null
  const vagas = Number(formData.get('vagas'))
  const observacoes = (formData.get('observacoes') as string) || null
  const abertura_raw = (formData.get('abertura_inscricoes') as string) || null
  const abertura_inscricoes = abertura_raw ? `${abertura_raw}:00-03:00` : null

  // Validação server-side
  if (!tipo || !polo || !numero || !ano || !vagas) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }
  if (tipo === 'master' && polo !== 'grageru') {
    return { error: 'Escalada Master só ocorre no polo Grageru.' }
  }

  const { data, error } = await supabase
    .from('retiros')
    .insert({
      tipo,
      polo,
      numero,
      ano,
      data_inicio: data_inicio || null,
      data_fim: data_fim || null,
      local_nome: local_nome || null,
      vagas,
      observacoes: observacoes || null,
      abertura_inscricoes,
      status: 'preparacao' as RetiroStatus,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return {
        error:
          'Já existe um retiro deste tipo neste polo para o ano informado.',
      }
    }
    return { error: 'Erro ao criar retiro. Tente novamente.' }
  }

  redirect(`/admin/retiros/${data.id}`)
}
