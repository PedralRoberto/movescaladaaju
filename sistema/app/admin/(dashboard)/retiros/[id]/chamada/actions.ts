'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export async function salvarReuniao(
  retiroId: string,
  numero: number,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createAdminClient()

  const data = (formData.get('data') as string)?.trim()
  const local_nome = (formData.get('local_nome') as string)?.trim() || null

  if (!data) return { error: 'Data é obrigatória.' }

  const { error } = await supabase
    .from('reunioes_previas')
    .upsert(
      { retiro_id: retiroId, numero, data, local_nome },
      { onConflict: 'retiro_id,numero' }
    )

  if (error) {
    return {
      error:
        process.env.NODE_ENV === 'development'
          ? `[${error.code}] ${error.message}`
          : 'Erro ao salvar reunião. Tente novamente.',
    }
  }

  revalidatePath(`/admin/retiros/${retiroId}/chamada`)
  revalidatePath(`/admin/retiros/${retiroId}`)
  return {}
}

export async function togglePresenca(
  inscricaoId: string,
  reuniaoId: string,
  presente: boolean,
  retiroId: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('presencas')
    .upsert(
      { inscricao_id: inscricaoId, reuniao_id: reuniaoId, presente },
      { onConflict: 'inscricao_id,reuniao_id' }
    )

  if (error) {
    return {
      error:
        process.env.NODE_ENV === 'development'
          ? `[${error.code}] ${error.message}`
          : 'Erro ao registrar presença.',
    }
  }

  revalidatePath(`/admin/retiros/${retiroId}/chamada`)
  return {}
}

export async function toggleExcecaoChamada(
  inscricaoId: string,
  excecao: boolean,
  retiroId: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('inscricoes')
    .update({ chamada_excecao: excecao, updated_at: new Date().toISOString() })
    .eq('id', inscricaoId)

  if (error) {
    return {
      error:
        process.env.NODE_ENV === 'development'
          ? `[${error.code}] ${error.message}`
          : 'Erro ao atualizar exceção.',
    }
  }

  revalidatePath(`/admin/retiros/${retiroId}/chamada`)
  return {}
}
