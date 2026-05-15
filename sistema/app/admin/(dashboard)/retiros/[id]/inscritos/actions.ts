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
