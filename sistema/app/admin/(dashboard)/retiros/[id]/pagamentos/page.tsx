import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { nomeRetiro } from '@/lib/retiro-utils'
import { modalidadeLabel, modalidadeColor } from '@/lib/inscricao-utils'
import {
  TOTAL_OWED,
  calcPagamentoSituacao,
  pagamentoSituacaoLabel,
  pagamentoSituacaoColor,
} from '@/lib/pagamento-utils'
import type { Pagamento } from '@/types/database'
import { salvarChavePix } from './actions'

type InscritoComPagamentos = {
  id: string
  nome_completo: string
  modalidade_pagamento: 'padrao' | 'integral' | 'excecao'
  status: string
  pagamentos: Pagamento[]
}

export default async function PagamentosPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const [{ data: retiro, error: retiroError }, { data: inscritos, error: inscritosError }] =
    await Promise.all([
      supabase.from('retiros').select('*').eq('id', id).single(),
      supabase
        .from('inscricoes')
        .select('id, nome_completo, modalidade_pagamento, status, pagamentos(*)')
        .eq('retiro_id', id)
        .neq('status', 'cancelado')
        .order('nome_completo'),
    ])

  if (retiroError || !retiro) {
    notFound()
  }

  if (inscritosError) {
    throw new Error(
      process.env.NODE_ENV === 'development'
        ? `[${inscritosError.code}] ${inscritosError.message}`
        : 'Erro ao carregar pagamentos.'
    )
  }

  const lista = (inscritos ?? []) as InscritoComPagamentos[]
  const nome = nomeRetiro(retiro)

  const totaisPorId = Object.fromEntries(
    lista.map((i) => [
      i.id,
      i.pagamentos.reduce((acc, p) => acc + Number(p.valor), 0),
    ])
  )

  const quitados = lista.filter((i) => totaisPorId[i.id] >= TOTAL_OWED).length
  const parciais = lista.filter(
    (i) => totaisPorId[i.id] > 0 && totaisPorId[i.id] < TOTAL_OWED
  ).length
  const pendentes = lista.filter((i) => totaisPorId[i.id] <= 0).length

  const metricas = [
    { label: 'Total', valor: lista.length },
    { label: 'Quitados', valor: quitados },
    { label: 'Parciais', valor: parciais },
    { label: 'Pendentes', valor: pendentes },
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
        <span className="text-zinc-600 font-medium">Pagamentos</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
          <CreditCard className="h-5 w-5 text-teal-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Pagamentos</h1>
          <p className="text-zinc-500 mt-0.5 text-sm">{nome}</p>
        </div>
      </div>

      {/* Chave Pix */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5 mb-8">
        <p className="text-sm font-semibold text-zinc-900 mb-0.5">Chave Pix</p>
        <p className="text-xs text-zinc-400 mb-3">
          Exibida no formulário público para orientar o pagamento da inscrição.
        </p>
        {retiro.chave_pix && (
          <div className="bg-zinc-50 rounded-lg px-4 py-2.5 mb-3 font-mono text-sm text-zinc-800">
            {retiro.chave_pix}
          </div>
        )}
        <form action={salvarChavePix.bind(null, id)} className="flex gap-2">
          <input
            name="chave_pix"
            type="text"
            placeholder="CPF, e-mail, telefone ou chave aleatória"
            defaultValue={retiro.chave_pix ?? ''}
            className="flex-1 text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium shrink-0"
          >
            Salvar
          </button>
        </form>
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

      {/* Tabela */}
      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-zinc-200 text-center">
          <p className="text-sm font-medium text-zinc-900 mb-1">
            Nenhum inscrito ainda
          </p>
          <p className="text-xs text-zinc-400">
            Os inscritos aparecerão aqui quando houver inscrições.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Nome
                </th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Modalidade
                </th>
                <th className="text-right px-6 py-3 font-medium text-zinc-500">
                  Pago
                </th>
                <th className="text-right px-6 py-3 font-medium text-zinc-500">
                  Total
                </th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Situação
                </th>
                <th className="text-right px-6 py-3 font-medium text-zinc-500">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {lista.map((inscricao) => {
                const totalPago = totaisPorId[inscricao.id]
                const situacao = calcPagamentoSituacao(totalPago)
                return (
                  <tr
                    key={inscricao.id}
                    className="hover:bg-zinc-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">
                      <Link
                        href={`/admin/retiros/${id}/inscritos/${inscricao.id}`}
                        className="text-zinc-900 hover:text-teal-600 transition-colors"
                      >
                        {inscricao.nome_completo}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${modalidadeColor(inscricao.modalidade_pagamento)}`}
                      >
                        {modalidadeLabel(inscricao.modalidade_pagamento)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-900">
                      R$ {totalPago.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-400">
                      R$ {TOTAL_OWED.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pagamentoSituacaoColor(situacao)}`}
                      >
                        {pagamentoSituacaoLabel(situacao)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/retiros/${id}/inscritos/${inscricao.id}`}
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'sm' })
                        )}
                      >
                        Ver ficha
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
