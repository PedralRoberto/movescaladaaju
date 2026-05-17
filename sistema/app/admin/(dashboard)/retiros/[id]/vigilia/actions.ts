'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { assertNaoEncontro } from '@/lib/auth-guard'

type FotoTipo = 'foto_crianca' | 'foto_adolescente' | 'foto_atual'

export async function toggleFotoVigilia(
  inscricaoId: string,
  retiroId: string,
  campo: FotoTipo,
  valor: boolean
): Promise<{ error?: string }> {
  const guard = await assertNaoEncontro()
  if (guard.error) return guard
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

export async function togglePresencaResponsavel(
  inscricaoId: string,
  reuniaoId: string,
  retiroId: string,
  presente: boolean
): Promise<{ error?: string }> {
  const guard = await assertNaoEncontro()
  if (guard.error) return guard
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('presencas_responsavel')
    .upsert(
      { inscricao_id: inscricaoId, reuniao_id: reuniaoId, presente, updated_at: new Date().toISOString() },
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

  revalidatePath(`/admin/retiros/${retiroId}/vigilia`)
  return {}
}

export async function atualizarCartasVigilia(
  inscricaoId: string,
  retiroId: string,
  quantidade: number
): Promise<{ error?: string }> {
  const guard = await assertNaoEncontro()
  if (guard.error) return guard
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
