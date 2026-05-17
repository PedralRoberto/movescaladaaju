import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Users } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { nomeRetiro, slugRetiro } from '@/lib/retiro-utils'
import { CopiarLinkInscricao } from '@/components/admin/copiar-link-inscricao'
import { BackButton } from '@/components/admin/back-button'
import { puxarParaInscritos } from './actions'
import {
  inscricaoStatusLabel,
  inscricaoStatusColor,
  modalidadeLabel,
  modalidadeColor,
} from '@/lib/inscricao-utils'

export default async function InscritosPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  const isEncontro = user?.app_metadata?.role === 'secretaria_encontro'

  const [
    { data: retiro, error: retiroError },
    { data: inscritos, error: inscritosError },
  ] = await Promise.all([
    supabase.from('retiros').select('*').eq('id', id).single(),
    supabase
      .from('inscricoes')
      .select('id, retiro_id, nome_completo, telefone, nome_responsavel, modalidade_pagamento, status, created_at')
      .eq('retiro_id', id)
      .order('nome_completo', { ascending: true }),
  ])

  if (retiroError || !retiro) notFound()

  if (inscritosError) {
    throw new Error(
      process.env.NODE_ENV === 'development'
        ? `[${inscritosError.code}] ${inscritosError.message}`
        : 'Erro ao carregar inscritos. Tente novamente.'
    )
  }

  const lista = inscritos ?? []
  const nome = nomeRetiro(retiro)

  const ativos = lista.filter((i) => i.status !== 'lista_espera')
  const espera = lista.filter((i) => i.status === 'lista_espera')

  const totalInscritos = lista.filter(
    (i) => i.status === 'inscrito' || i.status === 'confirmado'
  ).length
  const confirmados = lista.filter((i) => i.status === 'confirmado').length
  const vagasDisponiveis = Math.max(0, retiro.vagas - totalInscritos)

  const metricas = [
    { label: 'Total inscritos', valor: totalInscritos },
    { label: 'Confirmados', valor: confirmados },
    { label: 'Lista de espera', valor: espera.length },
    { label: 'Vagas disponíveis', valor: vagasDisponiveis },
  ]

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
        <BackButton />
        <Link href="/admin/retiros" className="hover:text-zinc-600">Retiros</Link>
        <span>/</span>
        <Link href={`/admin/retiros/${id}`} className="hover:text-zinc-600 truncate max-w-xs">
          {nome}
        </Link>
        <span>/</span>
        <span className="text-zinc-600 font-medium">Inscritos</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Inscritos</h1>
          <p className="text-zinc-500 mt-1 text-sm">{nome}</p>
        </div>
        <a
          href="/inscricao"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <Users className="h-4 w-4 mr-2" />
          Formulário público
        </a>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {metricas.map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
                {m.label}
              </p>
              <p className="text-2xl font-bold text-zinc-900">{m.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela principal */}
      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-zinc-200">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-teal-400" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-1">Nenhum inscrito ainda</h2>
          <p className="text-zinc-500 text-sm mb-4">Nenhuma inscrição recebida ainda.</p>
          <CopiarLinkInscricao path={`/inscricao/${slugRetiro(retiro)}`} />
        </div>
      ) : (
        <>
          <TabelaInscritos inscritos={ativos} retiroId={id} />

          {/* Lista de espera */}
          {espera.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-base font-semibold text-zinc-900">Lista de espera</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  {espera.length} cursista{espera.length > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Ao confirmar uma desistência, puxe o próximo da fila para a lista de inscritos.
              </p>
              <div className="bg-white rounded-xl border border-zinc-200 overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50">
                      <th className="text-left px-6 py-3 font-medium text-zinc-500">Nome</th>
                      <th className="text-left px-6 py-3 font-medium text-zinc-500">Telefone</th>
                      <th className="text-left px-6 py-3 font-medium text-zinc-500">Responsável</th>
                      <th className="text-left px-6 py-3 font-medium text-zinc-500">Data</th>
                      <th className="text-right px-6 py-3 font-medium text-zinc-500">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {espera.map((inscricao) => {
                      const puxarAction = puxarParaInscritos.bind(
                        null,
                        inscricao.id,
                        id
                      )
                      return (
                        <tr key={inscricao.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-6 py-4 font-medium">
                            <Link
                              href={`/admin/retiros/${id}/inscritos/${inscricao.id}`}
                              className="text-zinc-900 hover:text-teal-600 transition-colors"
                            >
                              {inscricao.nome_completo}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-zinc-600">{inscricao.telefone}</td>
                          <td className="px-6 py-4 text-zinc-600">
                            {inscricao.nome_responsavel ?? '—'}
                          </td>
                          <td className="px-6 py-4 text-zinc-600">
                            {new Date(inscricao.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {!isEncontro && (
                                <form action={puxarAction}>
                                  <button
                                    type="submit"
                                    className="text-xs font-medium text-teal-600 hover:text-teal-700 border border-teal-200 hover:border-teal-300 hover:bg-teal-50 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
                                  >
                                    Puxar para inscritos
                                  </button>
                                </form>
                              )}
                              <Link
                                href={`/admin/retiros/${id}/inscritos/${inscricao.id}`}
                                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
                              >
                                Ver
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TabelaInscritos({
  inscritos,
  retiroId,
}: {
  inscritos: Array<{
    id: string
    nome_completo: string
    telefone: string
    nome_responsavel: string | null
    modalidade_pagamento: string
    status: string
    created_at: string
  }>
  retiroId: string
}) {
  if (inscritos.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50">
            <th className="text-left px-6 py-3 font-medium text-zinc-500">Nome</th>
            <th className="text-left px-6 py-3 font-medium text-zinc-500">Telefone</th>
            <th className="text-left px-6 py-3 font-medium text-zinc-500">Responsável</th>
            <th className="text-left px-6 py-3 font-medium text-zinc-500">Modalidade</th>
            <th className="text-left px-6 py-3 font-medium text-zinc-500">Status</th>
            <th className="text-left px-6 py-3 font-medium text-zinc-500">Data</th>
            <th className="text-right px-6 py-3 font-medium text-zinc-500">Ação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {inscritos.map((inscricao) => (
            <tr key={inscricao.id} className="hover:bg-zinc-50 transition-colors">
              <td className="px-6 py-4 font-medium">
                <Link
                  href={`/admin/retiros/${retiroId}/inscritos/${inscricao.id}`}
                  className="text-zinc-900 hover:text-teal-600 transition-colors"
                >
                  {inscricao.nome_completo}
                </Link>
              </td>
              <td className="px-6 py-4 text-zinc-600">{inscricao.telefone}</td>
              <td className="px-6 py-4 text-zinc-600">{inscricao.nome_responsavel ?? '—'}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${modalidadeColor(inscricao.modalidade_pagamento as never)}`}>
                  {modalidadeLabel(inscricao.modalidade_pagamento as never)}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${inscricaoStatusColor(inscricao.status as never)}`}>
                  {inscricaoStatusLabel(inscricao.status as never)}
                </span>
              </td>
              <td className="px-6 py-4 text-zinc-600">
                {new Date(inscricao.created_at).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  href={`/admin/retiros/${retiroId}/inscritos/${inscricao.id}`}
                  className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
