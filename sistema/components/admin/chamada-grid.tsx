'use client'

import { useState, useTransition } from 'react'
import { ClipboardList } from 'lucide-react'
import {
  togglePresenca,
  toggleExcecaoChamada,
} from '@/app/admin/(dashboard)/retiros/[id]/chamada/actions'
import type { ReuniaoPrevia, Inscricao, Presenca } from '@/types/database'

type Situacao = 'apto' | 'desclassificado' | 'excecao'

function calcSituacao(totalPresente: number, excecao: boolean): Situacao {
  if (excecao) return 'excecao'
  if (totalPresente >= 2) return 'apto'
  return 'desclassificado'
}

const situacaoConfig: Record<Situacao, { label: string; classes: string }> = {
  apto: { label: 'Apto', classes: 'bg-emerald-100 text-emerald-700' },
  desclassificado: {
    label: 'Desclassificado',
    classes: 'bg-red-100 text-red-600',
  },
  excecao: { label: 'Exceção', classes: 'bg-amber-100 text-amber-700' },
}

interface ChamadaGridProps {
  retiroId: string
  reunioes: ReuniaoPrevia[]
  inscritos: Inscricao[]
  presencas: Presenca[]
}

export function ChamadaGrid({
  retiroId,
  reunioes,
  inscritos,
  presencas,
}: ChamadaGridProps) {
  const [, startTransition] = useTransition()

  const [presencaState, setPresencaState] = useState<
    Record<string, Record<string, boolean>>
  >(() => {
    const map: Record<string, Record<string, boolean>> = {}
    for (const p of presencas) {
      if (!map[p.inscricao_id]) map[p.inscricao_id] = {}
      map[p.inscricao_id][p.reuniao_id] = p.presente
    }
    return map
  })

  const [excecaoState, setExcecaoState] = useState<Record<string, boolean>>(
    () => {
      const map: Record<string, boolean> = {}
      for (const i of inscritos) {
        map[i.id] = i.chamada_excecao ?? false
      }
      return map
    }
  )

  function handleTogglePresenca(inscricaoId: string, reuniaoId: string) {
    const atual = presencaState[inscricaoId]?.[reuniaoId] ?? false
    const novo = !atual

    setPresencaState((prev) => ({
      ...prev,
      [inscricaoId]: { ...prev[inscricaoId], [reuniaoId]: novo },
    }))

    startTransition(async () => {
      const result = await togglePresenca(
        inscricaoId,
        reuniaoId,
        novo,
        retiroId
      )
      if (result.error) {
        setPresencaState((prev) => ({
          ...prev,
          [inscricaoId]: { ...prev[inscricaoId], [reuniaoId]: atual },
        }))
      }
    })
  }

  function handleToggleExcecao(inscricaoId: string) {
    const atual = excecaoState[inscricaoId] ?? false
    const novo = !atual

    setExcecaoState((prev) => ({ ...prev, [inscricaoId]: novo }))

    startTransition(async () => {
      const result = await toggleExcecaoChamada(inscricaoId, novo, retiroId)
      if (result.error) {
        setExcecaoState((prev) => ({ ...prev, [inscricaoId]: atual }))
      }
    })
  }

  if (inscritos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-zinc-200 text-center">
        <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
          <ClipboardList className="h-6 w-6 text-teal-400" />
        </div>
        <p className="text-sm font-medium text-zinc-900 mb-1">
          Nenhum inscrito cadastrado
        </p>
        <p className="text-xs text-zinc-400">
          Os inscritos aparecerão aqui quando houver inscrições.
        </p>
      </div>
    )
  }

  if (reunioes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-zinc-200 text-center">
        <p className="text-sm font-medium text-zinc-900 mb-1">
          Cadastre as preparatórias primeiro
        </p>
        <p className="text-xs text-zinc-400">
          Defina as datas das preparatórias acima para habilitar o registro
          de presença.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-auto">
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50">
            <th className="text-left px-6 py-3 font-medium text-zinc-500 min-w-[200px]">
              Nome
            </th>
            {([1, 2, 3, 4] as const).map((n) => {
              const reuniao = reunioes.find((r) => r.numero === n)
              return (
                <th
                  key={n}
                  className="px-4 py-3 font-medium text-center w-14"
                >
                  <span
                    className={
                      reuniao ? 'text-zinc-700' : 'text-zinc-300'
                    }
                  >
                    {n}ª
                  </span>
                </th>
              )
            })}
            <th className="px-4 py-3 font-medium text-zinc-500 text-center w-20">
              Total
            </th>
            <th className="px-4 py-3 font-medium text-zinc-500 text-center w-36">
              Situação
            </th>
            <th className="px-4 py-3 font-medium text-zinc-500 text-center w-28">
              Exceção
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {inscritos.map((inscricao) => {
            const presMap = presencaState[inscricao.id] ?? {}
            const excecao = excecaoState[inscricao.id] ?? false
            const totalPresente = reunioes.filter(
              (r) => presMap[r.id] === true
            ).length
            const situacao = calcSituacao(totalPresente, excecao)
            const config = situacaoConfig[situacao]

            return (
              <tr
                key={inscricao.id}
                className="hover:bg-zinc-50 transition-colors"
              >
                <td className="px-6 py-3 font-medium text-zinc-900">
                  {inscricao.nome_completo}
                </td>

                {([1, 2, 3, 4] as const).map((n) => {
                  const reuniao = reunioes.find((r) => r.numero === n)
                  if (!reuniao) {
                    return (
                      <td key={n} className="px-4 py-3 text-center">
                        <span className="text-zinc-200">—</span>
                      </td>
                    )
                  }
                  const presente = presMap[reuniao.id] ?? false
                  return (
                    <td key={n} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={presente}
                        onChange={() =>
                          handleTogglePresenca(inscricao.id, reuniao.id)
                        }
                        className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600"
                      />
                    </td>
                  )
                })}

                <td className="px-4 py-3 text-center text-sm text-zinc-700">
                  {totalPresente}/{reunioes.length}
                </td>

                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}
                  >
                    {config.label}
                  </span>
                </td>

                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggleExcecao(inscricao.id)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                      excecao
                        ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'
                    }`}
                  >
                    {excecao ? 'Ativa' : 'Dar'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
