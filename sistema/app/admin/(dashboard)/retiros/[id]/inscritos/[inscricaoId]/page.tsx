import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink, Trash2, Check, X } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { BackButton } from '@/components/admin/back-button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { nomeRetiro } from '@/lib/retiro-utils'
import {
  inscricaoStatusLabel,
  inscricaoStatusColor,
  modalidadeLabel,
  modalidadeColor,
} from '@/lib/inscricao-utils'
import {
  TOTAL_OWED,
  calcPagamentoSituacao,
  pagamentoSituacaoLabel,
  pagamentoSituacaoColor,
  pagamentoTipoLabel,
} from '@/lib/pagamento-utils'
import { StatusSelector } from '@/components/admin/status-selector'
import { PagamentoForm } from '@/components/admin/pagamento-form'
import { DesistenciaPanel } from '@/components/admin/desistencia-panel'
import { deletarPagamento } from '@/app/admin/(dashboard)/retiros/[id]/pagamentos/actions'
import type { ReuniaoPrevia, Pagamento, VigiliaMaterial } from '@/types/database'

function formatarData(data: string | null): string {
  if (!data) return '—'
  return new Date(data).toLocaleDateString('pt-BR')
}

export default async function InscricaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string; inscricaoId: string }>
}) {
  const { id, inscricaoId } = await params
  const supabase = createAdminClient()

  const authClient = await createClient()
  const { data: { user: currentUser } } = await authClient.auth.getUser()
  const currentRole = currentUser?.app_metadata?.role as string | undefined

  const [
    { data: retiro, error: retiroError },
    { data: inscricao, error: inscricaoError },
    { data: reunioes },
    { data: presencas },
    { data: pagamentos },
    { data: vigiliaMat },
  ] = await Promise.all([
    supabase.from('retiros').select('*').eq('id', id).single(),
    supabase.from('inscricoes').select('*').eq('id', inscricaoId).single(),
    supabase
      .from('reunioes_previas')
      .select('*')
      .eq('retiro_id', id)
      .order('numero'),
    supabase
      .from('presencas')
      .select('*')
      .eq('inscricao_id', inscricaoId),
    supabase
      .from('pagamentos')
      .select('*')
      .eq('inscricao_id', inscricaoId)
      .order('created_at', { ascending: false }),
    supabase
      .from('vigilia_materiais')
      .select('*')
      .eq('inscricao_id', inscricaoId)
      .maybeSingle(),
  ])

  if (retiroError || !retiro || inscricaoError || !inscricao) {
    notFound()
  }

  const nome = nomeRetiro(retiro)
  const reunioesList: ReuniaoPrevia[] = reunioes ?? []
  const presencaMap: Record<string, boolean> = {}
  for (const p of presencas ?? []) {
    presencaMap[p.reuniao_id] = p.presente
  }
  const totalPresente = reunioesList.filter((r) => presencaMap[r.id]).length
  const excecao = inscricao.chamada_excecao ?? false
  const situacaoChamada =
    excecao ? 'excecao' : totalPresente >= 2 ? 'apto' : 'desclassificado'
  const situacaoLabel = { apto: 'Apto', desclassificado: 'Desclassificado', excecao: 'Exceção' }[situacaoChamada]
  const situacaoClasses = {
    apto: 'bg-emerald-100 text-emerald-700',
    desclassificado: 'bg-red-100 text-red-600',
    excecao: 'bg-amber-100 text-amber-700',
  }[situacaoChamada]

  const pagamentosList: Pagamento[] = pagamentos ?? []
  const totalPago = pagamentosList.reduce((acc, p) => acc + Number(p.valor), 0)
  const situacaoPagamento = calcPagamentoSituacao(totalPago)

  // Gerar signed URLs para comprovantes
  const signedUrls: Record<string, string> = {}
  await Promise.all(
    pagamentosList
      .filter((p) => p.comprovante_url)
      .map(async (p) => {
        const { data } = await supabase.storage
          .from('comprovantes')
          .createSignedUrl(p.comprovante_url!, 3600)
        if (data?.signedUrl) signedUrls[p.id] = data.signedUrl
      })
  )

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6 flex-wrap">
        <BackButton />
        <Link href="/admin/retiros" className="hover:text-zinc-600">
          Retiros
        </Link>
        <span>/</span>
        <Link
          href={`/admin/retiros/${id}`}
          className="hover:text-zinc-600 truncate max-w-[10rem]"
        >
          {nome}
        </Link>
        <span>/</span>
        <Link
          href={`/admin/retiros/${id}/inscritos`}
          className="hover:text-zinc-600"
        >
          Inscritos
        </Link>
        <span>/</span>
        <span className="text-zinc-600 font-medium truncate max-w-[12rem]">
          {inscricao.nome_completo}
        </span>
      </div>

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-900">
          {inscricao.nome_completo}
        </h1>
        <div className="mt-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${inscricaoStatusColor(inscricao.status)}`}
          >
            {inscricaoStatusLabel(inscricao.status)}
          </span>
        </div>
      </div>

      {/* Selector de status + Desistência */}
      <div className="flex flex-col gap-4 mb-8">
        {inscricao.status !== 'cancelado' && (
          <StatusSelector
            inscricaoId={inscricao.id}
            retiroId={id}
            statusAtual={inscricao.status}
          />
        )}
        <DesistenciaPanel
          inscricaoId={inscricao.id}
          retiroId={id}
          status={inscricao.status}
          reembolsado={inscricao.reembolsado}
          dataDesistencia={inscricao.data_desistencia}
        />
      </div>

      <Separator className="mb-8" />

      {/* Dados pessoais */}
      <h2 className="text-base font-semibold text-zinc-900 mb-4">
        Dados pessoais
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Telefone
            </p>
            <p className="text-sm text-zinc-900">{inscricao.telefone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              E-mail
            </p>
            <p className="text-sm text-zinc-900">{inscricao.email ?? '—'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Bairro
            </p>
            <p className="text-sm text-zinc-900">{inscricao.bairro ?? '—'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Data de nascimento
            </p>
            <p className="text-sm text-zinc-900">
              {formatarData(inscricao.data_nascimento)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Data de inscricao
            </p>
            <p className="text-sm text-zinc-900">
              {formatarData(inscricao.created_at)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Modalidade de pagamento
            </p>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${modalidadeColor(inscricao.modalidade_pagamento)}`}
            >
              {modalidadeLabel(inscricao.modalidade_pagamento)}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Observacoes */}
      <h2 className="text-base font-semibold text-zinc-900 mb-3">
        Observacoes
      </h2>
      <Card className="mb-10">
        <CardContent className="pt-5 pb-5">
          <p className="text-sm text-zinc-700 whitespace-pre-wrap">
            {inscricao.observacoes ?? '—'}
          </p>
        </CardContent>
      </Card>

      {/* Preparatórias */}
      <h2 className="text-base font-semibold text-zinc-900 mb-3">Preparatórias</h2>
      <Card className="mb-10">
        <CardContent className="pt-5 pb-5">
          {reunioesList.length === 0 ? (
            <p className="text-sm text-zinc-400 italic">
              Nenhuma preparatória agendada para este retiro.
            </p>
          ) : (
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                {reunioesList.map((r) => (
                  <div key={r.id} className="flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-zinc-400">
                      {r.numero}ª
                    </span>
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        presencaMap[r.id]
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-zinc-100 text-zinc-400'
                      }`}
                    >
                      {presencaMap[r.id] ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
                {Array.from({ length: 4 - reunioesList.length }).map((_, i) => (
                  <div key={`vazio-${i}`} className="flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-zinc-300">
                      {reunioesList.length + i + 1}ª
                    </span>
                    <span className="h-6 w-6 rounded-full bg-zinc-50 flex items-center justify-center text-xs text-zinc-300">
                      —
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">
                  {totalPresente}/{reunioesList.length} preparatória(s)
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${situacaoClasses}`}
                >
                  {situacaoLabel}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fotos + Cartas */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-zinc-900">Fotos + Cartas</h2>
        <Link
          href={`/admin/retiros/${id}/vigilia`}
          className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
        >
          Ver tabela completa →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-10">
        {/* Card Fotos */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">Fotos</p>
            <div className="space-y-2">
              {[
                { label: 'Criança', ok: vigiliaMat?.foto_crianca ?? false },
                { label: 'Adolescente', ok: vigiliaMat?.foto_adolescente ?? false },
                { label: 'Atual', ok: vigiliaMat?.foto_atual ?? false },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{label}</span>
                  {ok
                    ? <Check className="h-3.5 w-3.5 text-emerald-500" />
                    : <X className="h-3.5 w-3.5 text-zinc-300" />}
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100">
              {(() => {
                const total = [vigiliaMat?.foto_crianca, vigiliaMat?.foto_adolescente, vigiliaMat?.foto_atual].filter(Boolean).length
                return total === 3
                  ? <span className="text-xs font-medium text-emerald-600">Completo</span>
                  : <span className="text-xs font-medium text-amber-600">{total}/3 fotos</span>
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Card Cartas */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">Cartas</p>
            <p className="text-3xl font-bold text-zinc-900 tabular-nums">
              {vigiliaMat?.cartas_recebidas ?? 0}
              <span className="text-base font-normal text-zinc-400"> / 5</span>
            </p>
            <div className="mt-3 pt-3 border-t border-zinc-100">
              {(vigiliaMat?.cartas_recebidas ?? 0) >= 5
                ? <span className="text-xs font-medium text-emerald-600">Completo</span>
                : <span className="text-xs font-medium text-amber-600">
                    {5 - (vigiliaMat?.cartas_recebidas ?? 0)} carta(s) pendente(s)
                  </span>
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pagamentos */}
      <h2 className="text-base font-semibold text-zinc-900 mb-3">Pagamentos</h2>

      {inscricao.status === 'lista_espera' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-8">
          <p className="text-sm font-medium text-amber-800 mb-0.5">
            Cursista na lista de espera
          </p>
          <p className="text-xs text-amber-700">
            Pagamento não exigido até ser chamado(a). Quando confirmada a participação,
            o pagamento de R&nbsp;50,00 é feito na 1ª preparatória.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pagamentoSituacaoColor(situacaoPagamento)}`}
            >
              {pagamentoSituacaoLabel(situacaoPagamento)} · R${' '}
              {totalPago.toFixed(2)} / R$ {TOTAL_OWED.toFixed(2)}
            </span>
          </div>

          {pagamentosList.length > 0 && (
            <div className="bg-white rounded-xl border border-zinc-200 overflow-x-auto mb-4">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50">
                    <th className="text-left px-5 py-2.5 font-medium text-zinc-500">
                      Tipo
                    </th>
                    <th className="text-right px-5 py-2.5 font-medium text-zinc-500">
                      Valor
                    </th>
                    <th className="text-left px-5 py-2.5 font-medium text-zinc-500">
                      Data
                    </th>
                    <th className="text-left px-5 py-2.5 font-medium text-zinc-500">
                      Comprovante
                    </th>
                    <th className="px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {pagamentosList.map((pagamento) => {
                    const deleteAction = deletarPagamento.bind(
                      null,
                      pagamento.id,
                      inscricaoId,
                      id,
                      pagamento.comprovante_url
                    )
                    return (
                      <tr key={pagamento.id} className="hover:bg-zinc-50">
                        <td className="px-5 py-3 font-medium text-zinc-900">
                          {pagamentoTipoLabel(pagamento.tipo)}
                        </td>
                        <td className="px-5 py-3 text-right text-zinc-900">
                          R$ {Number(pagamento.valor).toFixed(2)}
                        </td>
                        <td className="px-5 py-3 text-zinc-600">
                          {formatarData(pagamento.data_pagamento)}
                        </td>
                        <td className="px-5 py-3">
                          {signedUrls[pagamento.id] ? (
                            <a
                              href={signedUrls[pagamento.id]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-teal-600 hover:text-teal-700 text-xs"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Ver
                            </a>
                          ) : (
                            <span className="text-xs text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <form action={deleteAction}>
                            <button
                              type="submit"
                              className="text-zinc-400 hover:text-red-600 transition-colors"
                              title="Remover pagamento"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </form>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <PagamentoForm
            inscricaoId={inscricaoId}
            retiroId={id}
            modalidade={inscricao.modalidade_pagamento}
          />
        </>
      )}
    </div>
  )
}
