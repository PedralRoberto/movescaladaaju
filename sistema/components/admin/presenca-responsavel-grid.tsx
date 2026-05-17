'use client'

import { useState, useTransition } from 'react'
import { togglePresencaResponsavel } from '@/app/admin/(dashboard)/retiros/[id]/vigilia/actions'

interface ReuniaoRow {
  id: string
  numero: number
  data: string
}

interface InscritoRow {
  id: string
  nome_completo: string
  nome_responsavel: string | null
}

interface PresencaRow {
  inscricao_id: string
  reuniao_id: string
  presente: boolean
}

interface PresencaResponsavelGridProps {
  retiroId: string
  inscritos: InscritoRow[]
  reunioes: ReuniaoRow[]
  presencas: PresencaRow[]
}

function RespCheck({
  inscricaoId,
  reuniaoId,
  retiroId,
  checked,
}: {
  inscricaoId: string
  reuniaoId: string
  retiroId: string
  checked: boolean
}) {
  const [valor, setValor] = useState(checked)
  const [, startTransition] = useTransition()

  function toggle() {
    const novo = !valor
    setValor(novo)
    startTransition(async () => {
      const result = await togglePresencaResponsavel(inscricaoId, reuniaoId, retiroId, novo)
      if (result.error) setValor(valor)
    })
  }

  return (
    <input
      type="checkbox"
      checked={valor}
      onChange={toggle}
      className="h-4 w-4 rounded border-zinc-300 accent-teal-600 cursor-pointer"
    />
  )
}

export function PresencaResponsavelGrid({
  retiroId,
  inscritos,
  reunioes,
  presencas,
}: PresencaResponsavelGridProps) {
  if (reunioes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-zinc-200 text-center">
        <p className="text-sm text-zinc-400">
          Nenhuma preparatória cadastrada para este retiro ainda.
        </p>
      </div>
    )
  }

  const presencaIdx: Record<string, Record<string, boolean>> = {}
  for (const p of presencas) {
    if (!presencaIdx[p.inscricao_id]) presencaIdx[p.inscricao_id] = {}
    presencaIdx[p.inscricao_id][p.reuniao_id] = p.presente
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-auto">
      <table className="w-full text-sm" style={{ minWidth: `${420 + reunioes.length * 90}px` }}>
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50">
            <th className="text-left px-6 py-3 font-medium text-zinc-500 min-w-[160px]">Cursista</th>
            <th className="text-left px-4 py-3 font-medium text-zinc-500 min-w-[140px]">Responsável</th>
            {reunioes.map((r) => (
              <th key={r.id} className="px-4 py-3 font-medium text-zinc-500 text-center w-24">
                <span className="block text-xs">{r.numero}ª Prep</span>
                <span className="block text-xs text-zinc-400 font-normal">
                  {new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </span>
              </th>
            ))}
            <th className="px-4 py-3 font-medium text-zinc-500 text-center w-20">
              <span className="block text-xs">Total</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {inscritos.map((inscricao) => {
            const presMap = presencaIdx[inscricao.id] ?? {}
            const totalPresente = reunioes.filter((r) => presMap[r.id] === true).length
            const totalFalta = reunioes.filter((r) => presMap[r.id] === false).length
            const algumaMarcada = totalPresente + totalFalta > 0

            return (
              <tr key={inscricao.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-3 font-medium text-zinc-900 text-sm">
                  {inscricao.nome_completo}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-500">
                  {inscricao.nome_responsavel ?? '—'}
                </td>
                {reunioes.map((r) => (
                  <td key={r.id} className="px-4 py-3 text-center">
                    <RespCheck
                      inscricaoId={inscricao.id}
                      reuniaoId={r.id}
                      retiroId={retiroId}
                      checked={presMap[r.id] ?? false}
                    />
                  </td>
                ))}
                <td className="px-4 py-3 text-center">
                  {algumaMarcada ? (
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        totalFalta > 0 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {totalPresente}/{reunioes.length}
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-300">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
