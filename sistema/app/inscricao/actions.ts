'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function submeterInscricao(
  _prevState: { error?: string; redirectTo?: string } | null,
  formData: FormData
): Promise<{ error?: string; redirectTo?: string }> {
  const supabase = createAdminClient()

  const retiroId = (formData.get('retiro_id') as string)?.trim()
  const nome_completo = (formData.get('nome_completo') as string)?.trim()
  const apelido = (formData.get('apelido') as string)?.trim() || null
  const data_nascimento = (formData.get('data_nascimento') as string) || null
  const cpf = (formData.get('cpf') as string)?.trim() || null
  const telefone = (formData.get('telefone') as string)?.trim()
  const email = (formData.get('email') as string)?.trim() || null
  const endereco = (formData.get('endereco') as string)?.trim() || null
  const instagram = (formData.get('instagram') as string)?.trim() || null
  const modalidade_pagamento = (formData.get('modalidade_pagamento') as string)?.trim()

  const menor_de_idade = formData.get('menor_de_idade') === 'sim'
  const como_conheceu = (formData.get('como_conheceu') as string)?.trim() || null
  const conhece_alguem = (formData.get('conhece_alguem') as string)?.trim() || null
  const sacramentos = formData.getAll('sacramentos') as string[]
  const toca_instrumento = formData.get('toca_instrumento')
  const instrumento_musical =
    toca_instrumento === 'sim'
      ? (formData.get('qual_instrumento') as string)?.trim() || null
      : null

  const condicao_saude = (formData.get('condicao_saude') as string)?.trim() || null
  const outra_condicao_saude = (formData.get('outra_condicao_saude') as string)?.trim() || null
  const medicacao_continua = (formData.get('medicacao_continua') as string)?.trim() || null

  const nome_responsavel = (formData.get('nome_responsavel') as string)?.trim() || null
  const contato_responsavel = (formData.get('contato_responsavel') as string)?.trim() || null
  const email_responsavel = (formData.get('email_responsavel') as string)?.trim() || null

  const observacoes = (formData.get('observacoes') as string)?.trim() || null

  if (!retiroId || !nome_completo || !telefone || !modalidade_pagamento) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }

  const { data: retiro } = await supabase
    .from('retiros')
    .select('id, vagas, status')
    .eq('id', retiroId)
    .single()

  if (!retiro || retiro.status !== 'inscricoes_abertas') {
    return { error: 'As inscrições para este retiro não estão mais abertas.' }
  }

  const { count } = await supabase
    .from('inscricoes')
    .select('*', { count: 'exact', head: true })
    .eq('retiro_id', retiroId)
    .in('status', ['inscrito', 'confirmado'])

  const status = (count ?? 0) >= retiro.vagas ? 'lista_espera' : 'inscrito'

  const { data: inscricao, error } = await supabase
    .from('inscricoes')
    .insert({
      retiro_id: retiroId,
      nome_completo,
      apelido,
      data_nascimento: data_nascimento || null,
      cpf,
      telefone,
      email,
      bairro: endereco,
      endereco,
      instagram,
      modalidade_pagamento,
      menor_de_idade,
      como_conheceu,
      conhece_alguem,
      sacramentos,
      instrumento_musical,
      condicao_saude,
      outra_condicao_saude,
      medicacao_continua,
      nome_responsavel,
      contato_responsavel,
      email_responsavel,
      observacoes,
      status,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[inscricao] Supabase insert error:', JSON.stringify(error))
    return { error: 'Erro ao realizar inscrição. Tente novamente.' }
  }

  const fileUpdates: Record<string, string> = {}

  const comprovanteFile = formData.get('comprovante_pagamento') as File | null
  if (comprovanteFile && comprovanteFile.size > 0) {
    const ext = comprovanteFile.name.split('.').pop() ?? 'bin'
    const path = `inscricoes/${inscricao.id}/pagamento.${ext}`
    const { error: upErr } = await supabase.storage
      .from('comprovantes')
      .upload(path, comprovanteFile, { contentType: comprovanteFile.type })
    if (!upErr) fileUpdates.comprovante_pagamento_url = path
  }

  const documentoFile = formData.get('documento_identificacao') as File | null
  if (documentoFile && documentoFile.size > 0) {
    const ext = documentoFile.name.split('.').pop() ?? 'bin'
    const path = `inscricoes/${inscricao.id}/documento.${ext}`
    const { error: upErr } = await supabase.storage
      .from('comprovantes')
      .upload(path, documentoFile, { contentType: documentoFile.type })
    if (!upErr) fileUpdates.documento_identificacao_url = path
  }

  if (Object.keys(fileUpdates).length > 0) {
    await supabase.from('inscricoes').update(fileUpdates).eq('id', inscricao.id)
  }

  return { redirectTo: `/inscricao/sucesso?s=${status}` }
}
