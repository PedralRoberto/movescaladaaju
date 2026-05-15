'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { RetiroStatus } from '@/types/database'

export async function updateRetiroStatus(
  id: string,
  status: RetiroStatus
): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('retiros')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    throw new Error('Erro ao atualizar status do retiro.')
  }

  revalidatePath('/admin/retiros')
  revalidatePath(`/admin/retiros/${id}`)
}

export async function arquivarInscritos(
  retiroId: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient()

  const { data: retiro } = await supabase
    .from('retiros')
    .select('status')
    .eq('id', retiroId)
    .single()

  if (!retiro || retiro.status !== 'realizado') {
    return { error: 'O retiro precisa estar marcado como realizado.' }
  }

  // Buscar inscricoes para limpar comprovantes do storage
  const { data: inscricoes } = await supabase
    .from('inscricoes')
    .select('id')
    .eq('retiro_id', retiroId)

  if (inscricoes && inscricoes.length > 0) {
    const inscricaoIds = inscricoes.map((i) => i.id)

    const { data: pagamentos } = await supabase
      .from('pagamentos')
      .select('comprovante_url')
      .in('inscricao_id', inscricaoIds)
      .not('comprovante_url', 'is', null)

    if (pagamentos && pagamentos.length > 0) {
      const paths = pagamentos
        .map((p) => p.comprovante_url)
        .filter(Boolean) as string[]
      if (paths.length > 0) {
        await supabase.storage.from('comprovantes').remove(paths)
      }
    }

    // Deletar inscricoes — cascade remove presencas e pagamentos
    const { error } = await supabase
      .from('inscricoes')
      .delete()
      .eq('retiro_id', retiroId)

    if (error) {
      return {
        error:
          process.env.NODE_ENV === 'development'
            ? `[${error.code}] ${error.message}`
            : 'Erro ao arquivar participantes.',
      }
    }
  }

  revalidatePath('/admin/retiros')
  revalidatePath(`/admin/retiros/${retiroId}`)
  return {}
}
