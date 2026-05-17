'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Minus, Plus, Eye } from 'lucide-react'
import {
  toggleFotoVigilia,
  atualizarCartasVigilia,
} from '@/app/admin/(dashboard)/retiros/[id]/vigilia/actions'
import type { VigiliaMaterial } from '@/types/database'

const CARTAS_MIN = 5

type FotoTipo = 'foto_crianca' | 'foto_adolescente' | 'foto_atual'

interface InscritoRow {
  id: string
  nome_completo: string
  nome_responsavel: string | null
}

interface VigiliaMaterialState {
  foto_crianca: boolean
  foto_adolescente: boolean
  foto_atual: boolean
  cartas_recebidas: number
}

interface VigíliaGridProps {
  retiroId: string
  inscritos: InscritoRow[]
  materiais: VigiliaMaterial[]
}

function StatusBadge({ mat }: { mat: VigiliaMaterialState }) {
  const fotosFaltando = [
    !mat.foto_crianca && 'criança',
    !mat.foto_adolescente && 'adolescente',
    !mat.foto_atual && 'atual',
  ].filter(Boolean)

  const cartasFaltando = Math.max(0, CARTAS_MIN - mat.cartas_recebidas)
  const completo = fotosFaltando.length === 0 && cartasFaltando === 0

  if (completo) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        Completo
      </span>
    )
  }

  const pendencias: string[] = []
  if (fotosFaltando.length > 0) pendencias.push(`foto ${fotosFaltando.join(', ')}`)
  if (cartasFaltando > 0) pendencias.push(`${cartasFaltando} carta${cartasFaltando > 1 ? 's' : ''}`)

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700"
      title={`Pendente: ${pendencias.join(' · ')}`}
    >
      Pendente
    </span>
  )
}

function CartasControl({
  inscricaoId,
  retiroId,
  inicial,
}: {
  inscricaoId: string
  retiroId: string
  inicial: number
}) {
  const [count, setCount] = useState(inicial)
  const [, startTransition] = useTransition()

  function ajustar(delta: number) {
    const novo = Math.max(0, count + delta)
    setCount(novo)
    startTransition(async () => {
      const result = await atualizarCartasVigilia(inscricaoId, retiroId, novo)
      if (result.error) setCount(count)
    })
  }

  return (
    <div className="flex items-center gap-1.5 justify-center">
      <button
        onClick={() => ajustar(-1)}
        disabled={count === 0}
        className="w-6 h-6 rounded-md border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span
        className={`w-7 text-center text-sm font-semibold tabular-nums ${
          count === 0
            ? 'text-zinc-300'
            : count < CARTAS_MIN
              ? 'text-amber-600'
              : 'text-emerald-600'
        }`}
      >
        {count}
      </span>
      <button
        onClick={() => ajustar(1)}
        className="w-6 h-6 rounded-md border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 transition-colors"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}

function FotoCheck({
  inscricaoId,
  retiroId,
  campo,
  checked,
}: {
  inscricaoId: string
  retiroId: string
  campo: FotoTipo
  checked: boolean
}) {
  const [valor, setValor] = useState(checked)
  const [, startTransition] = useTransition()

  function toggle() {
    const novo = !valor
    setValor(novo)
    startTransition(async () => {
      const result = await toggleFotoVigilia(inscricaoId, retiroId, campo, novo)
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

export function VigíliaGrid({ retiroId, inscritos, materiais }: VigíliaGridProps) {
  const matMap: Record<string, VigiliaMaterialState> = {}
  for (const m of materiais) {
    matMap[m.inscricao_id] = {
      foto_crianca: m.foto_crianca,
      foto_adolescente: m.foto_adolescente,
      foto_atual: m.foto_atual,
      cartas_recebidas: m.cartas_recebidas,
    }
  }

  const vazio: VigiliaMaterialState = {
    foto_crianca: false,
    foto_adolescente: false,
    foto_atual: false,
    cartas_recebidas: 0,
  }

  if (inscritos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-zinc-200 text-center">
        <p className="text-sm font-medium text-zinc-900 mb-1">Nenhum inscrito</p>
        <p className="text-xs text-zinc-400">Os inscritos aparecerão aqui quando houver inscrições.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-auto">
      <table className="w-full text-sm min-w-[680px]">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50">
            <th className="text-left px-6 py-3 font-medium text-zinc-500 min-w-[180px]">Nome</th>
            <th className="text-left px-4 py-3 font-medium text-zinc-500 min-w-[140px]">Responsável</th>
            <th className="px-4 py-3 font-medium text-zinc-500 text-center w-24">
              <span className="block text-xs">Foto</span>
              <span className="block text-xs text-zinc-400 font-normal">Criança</span>
            </th>
            <th className="px-4 py-3 font-medium text-zinc-500 text-center w-24">
              <span className="block text-xs">Foto</span>
              <span className="block text-xs text-zinc-400 font-normal">Adolescente</span>
            </th>
            <th className="px-4 py-3 font-medium text-zinc-500 text-center w-24">
              <span className="block text-xs">Foto</span>
              <span className="block text-xs text-zinc-400 font-normal">Atual</span>
            </th>
            <th className="px-4 py-3 font-medium text-zinc-500 text-center w-32">
              <span className="block text-xs">Cartas</span>
              <span className="block text-xs text-zinc-400 font-normal">mín. {CARTAS_MIN}</span>
            </th>
            <th className="px-4 py-3 font-medium text-zinc-500 text-center w-28">Situação</th>
            <th className="px-4 py-3 w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {inscritos.map((inscricao) => {
            const mat = matMap[inscricao.id] ?? vazio
            return (
              <tr key={inscricao.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-3 font-medium text-zinc-900">
                  {inscricao.nome_completo}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-500">
                  {inscricao.nome_responsavel ?? '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <FotoCheck
                    inscricaoId={inscricao.id}
                    retiroId={retiroId}
                    campo="foto_crianca"
                    checked={mat.foto_crianca}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <FotoCheck
                    inscricaoId={inscricao.id}
                    retiroId={retiroId}
                    campo="foto_adolescente"
                    checked={mat.foto_adolescente}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <FotoCheck
                    inscricaoId={inscricao.id}
                    retiroId={retiroId}
                    campo="foto_atual"
                    checked={mat.foto_atual}
                  />
                </td>
                <td className="px-4 py-3">
                  <CartasControl
                    inscricaoId={inscricao.id}
                    retiroId={retiroId}
                    inicial={mat.cartas_recebidas}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge mat={mat} />
                </td>
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/admin/retiros/${retiroId}/inscritos/${inscricao.id}`}
                    className="text-zinc-300 hover:text-teal-500 transition-colors"
                    title="Ver ficha"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
