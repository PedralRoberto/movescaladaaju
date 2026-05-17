'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

type FotoTipo = 'foto_crianca' | 'foto_adolescente' | 'foto_atual'

export async function toggleFotoVigilia(
  inscricaoId: string,
  retiroId: string,
  campo: FotoTipo,
  valor: boolean
): Promise<{ error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('vigilia_materiais')
    .upsert(
      { inscricao_id: inscricaoId, [campo]: valor, updated_at: new Date().toISOString() },
      { onConflict: 'inscricao_id' }
    )

  if (error) {
    return {
      error:
        process.env.NODE_ENV === 'development'
          ? `[${error.code}] ${error.message}`
          : 'Erro ao salvar foto.',
    }
  }

  revalidatePath(`/admin/retiros/${retiroId}/vigilia`)
  return {}
}

export async function atualizarCartasVigilia(
  inscricaoId: string,
  retiroId: string,
  quantidade: number
): Promise<{ error?: string }> {
  const supabase = createAdminClient()

  const qtd = Math.max(0, Math.round(quantidade))

  const { error } = await supabase
    .from('vigilia_materiais')
    .upsert(
      { inscricao_id: inscricaoId, cartas_recebidas: qtd, updated_at: new Date().toISOString() },
      { onConflict: 'inscricao_id' }
    )

  if (error) {
    return { error: 'Erro ao salvar cartas.' }
  }

  revalidatePath(`/admin/retiros/${retiroId}/vigilia`)
  return {}
}
