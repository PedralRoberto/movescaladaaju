'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { InscricaoStatus } from '@/types/database'

export async function updateInscricaoStatus(
  inscricaoId: string,
  retiroId: string,
  status: InscricaoStatus
): Promise<{ error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('inscricoes')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', inscricaoId)

  if (error) {
    return {
      error:
        process.env.NODE_ENV === 'development'
          ? `[${error.code}] ${error.message}`
          : 'Erro ao atualizar status. Tente novamente.',
    }
  }

  revalidatePath(`/admin/retiros/${retiroId}/inscritos`)
  revalidatePath(`/admin/retiros/${retiroId}/inscritos/${inscricaoId}`)

  return {}
}

export async function registrarDesistencia(
  inscricaoId: string,
  retiroId: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('inscricoes')
    .update({
      status: 'cancelado',
      data_desistencia: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', inscricaoId)

  if (error) {
    return {
      error:
        process.env.NODE_ENV === 'development'
          ? `[${error.code}] ${error.message}`
          : 'Erro ao registrar desistência.',
    }
  }

  revalidatePath(`/admin/retiros/${retiroId}/inscritos`)
  revalidatePath(`/admin/retiros/${retiroId}/inscritos/${inscricaoId}`)

  return {}
}

export async function toggleReembolsado(
  inscricaoId: string,
  retiroId: string,
  reembolsado: boolean
): Promise<{ error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('inscricoes')
    .update({ reembolsado, updated_at: new Date().toISOString() })
    .eq('id', inscricaoId)

  if (error) {
    return { error: 'Erro ao atualizar reembolso.' }
  }

  revalidatePath(`/admin/retiros/${retiroId}/inscritos/${inscricaoId}`)

  return {}
}
