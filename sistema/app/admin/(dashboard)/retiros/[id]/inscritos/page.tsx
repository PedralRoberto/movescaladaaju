import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Users } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { nomeRetiro, slugRetiro } from '@/lib/retiro-utils'
import { CopiarLinkInscricao } from '@/components/admin/copiar-link-inscricao'
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

  const [
    { data: retiro, error: retiroError },
    { data: inscritos, error: inscritosError },
  ] = await Promise.all([
    supabase.from('retiros').select('*').eq('id', id).single(),
    supabase
      .from('inscricoes')
      .select('*')
      .eq('retiro_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (retiroError || !retiro) {
    notFound()
  }

  if (inscritosError) {
    throw new Error(
      process.env.NODE_ENV === 'development'
        ? `[${inscritosError.code}] ${inscritosError.message}`
        : 'Erro ao carregar inscritos. Tente novamente.'
    )
  }

  const lista = inscritos ?? []
  const nome = nomeRetiro(retiro)

  const totalInscritos = lista.filter(
    (i) => i.status === 'inscrito' || i.status === 'confirmado'
  ).length
  const confirmados = lista.filter((i) => i.status === 'confirmado').length
  const listaEspera = lista.filter((i) => i.status === 'lista_espera').length
  const vagasDisponiveis = Math.max(0, retiro.vagas - totalInscritos)

  const metricas = [
    { label: 'Total inscritos', valor: totalInscritos },
    { label: 'Confirmados', valor: confirmados },
    { label: 'Lista de espera', valor: listaEspera },
    { label: 'Vagas disponiveis', valor: vagasDisponiveis },
  ]

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
        <Link
          href="/admin/retiros"
          className="hover:text-zinc-600 flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retiros
        </Link>
        <span>/</span>
        <Link
          href={`/admin/retiros/${id}`}
          className="hover:text-zinc-600 truncate max-w-xs"
        >
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

      {/* Metricas */}
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

      {/* Tabela ou empty state */}
      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-zinc-200">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-teal-400" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-1">
            Nenhum inscrito ainda
          </h2>
          <p className="text-zinc-500 text-sm mb-4">
            Nenhuma inscrição recebida ainda.
          </p>
          <CopiarLinkInscricao path={`/inscricao/${slugRetiro(retiro)}`} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Nome
                </th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Telefone
                </th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Bairro
                </th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Modalidade
                </th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Status
                </th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Data
                </th>
                <th className="text-right px-6 py-3 font-medium text-zinc-500">
                  Acao
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {lista.map((inscricao) => (
                <tr
                  key={inscricao.id}
                  className="hover:bg-zinc-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {inscricao.nome_completo}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    {inscricao.telefone}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    {inscricao.bairro ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${modalidadeColor(inscricao.modalidade_pagamento)}`}
                    >
                      {modalidadeLabel(inscricao.modalidade_pagamento)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${inscricaoStatusColor(inscricao.status)}`}
                    >
                      {inscricaoStatusLabel(inscricao.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    {new Date(inscricao.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/retiros/${id}/inscritos/${inscricao.id}`}
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'sm' })
                      )}
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
