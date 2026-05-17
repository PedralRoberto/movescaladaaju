'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { assertNaoEncontro } from '@/lib/auth-guard'

export async function registrarPagamento(
  inscricaoId: string,
  retiroId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const guard = await assertNaoEncontro()
  if (guard.error) return guard
  const supabase = createAdminClient()

  const tipo = (formData.get('tipo') as string)?.trim()
  const valorStr = (formData.get('valor') as string)?.trim()
  const data_pagamento = (formData.get('data_pagamento') as string)?.trim()
  const observacoes = (formData.get('observacoes') as string)?.trim() || null
  const comprovante = formData.get('comprovante') as File | null

  if (!tipo || !valorStr || !data_pagamento) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }

  const valor = parseFloat(valorStr)
  if (isNaN(valor) || valor <= 0) {
    return { error: 'Valor inválido.' }
  }

  let comprovante_url: string | null = null

  if (comprovante && comprovante.size > 0) {
    const ext = comprovante.name.split('.').pop() ?? 'bin'
    const path = `${inscricaoId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('comprovantes')
      .upload(path, comprovante, { contentType: comprovante.type })

    if (uploadError) {
      return {
        error:
          process.env.NODE_ENV === 'development'
            ? `Upload: ${uploadError.message}`
            : 'Erro ao enviar comprovante. Tente novamente.',
      }
    }

    comprovante_url = path
  }

  const { error } = await supabase.from('pagamentos').insert({
    inscricao_id: inscricaoId,
    tipo,
    valor,
    data_pagamento,
    comprovante_url,
    observacoes,
  })

  if (error) {
    // Remover arquivo se o insert falhou
    if (comprovante_url) {
      await supabase.storage.from('comprovantes').remove([comprovante_url])
    }
    return {
      error:
        process.env.NODE_ENV === 'development'
          ? `[${error.code}] ${error.message}`
          : 'Erro ao registrar pagamento. Tente novamente.',
    }
  }

  revalidatePath(`/admin/retiros/${retiroId}/inscritos/${inscricaoId}`)
  revalidatePath(`/admin/retiros/${retiroId}/pagamentos`)
  return {}
}

export async function salvarChavePix(
  retiroId: string,
  formData: FormData
): Promise<void> {
  if ((await assertNaoEncontro()).error) return
  const supabase = createAdminClient()
  const chave_pix = (formData.get('chave_pix') as string)?.trim() || null
  await supabase.from('retiros').update({ chave_pix }).eq('id', retiroId)
  revalidatePath(`/admin/retiros/${retiroId}/pagamentos`)
}

export async function deletarPagamento(
  pagamentoId: string,
  inscricaoId: string,
  retiroId: string,
  comprovanteUrl: string | null
): Promise<void> {
  if ((await assertNaoEncontro()).error) return
  const supabase = createAdminClient()

  if (comprovanteUrl) {
    await supabase.storage.from('comprovantes').remove([comprovanteUrl])
  }

  await supabase.from('pagamentos').delete().eq('id', pagamentoId)

  revalidatePath(`/admin/retiros/${retiroId}/inscritos/${inscricaoId}`)
  revalidatePath(`/admin/retiros/${retiroId}/pagamentos`)
}
