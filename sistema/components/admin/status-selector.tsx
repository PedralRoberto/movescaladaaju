'use client'

import { useTransition, useState } from 'react'
import { updateInscricaoStatus } from '@/app/admin/(dashboard)/retiros/[id]/inscritos/actions'
import type { InscricaoStatus } from '@/types/database'
import { inscricaoStatusLabel } from '@/lib/inscricao-utils'

const STATUS_OPTIONS: InscricaoStatus[] = [
  'inscrito',
  'lista_espera',
  'confirmado',
  'desclassificado',
  'cancelado',
]

interface StatusSelectorProps {
  inscricaoId: string
  retiroId: string
  statusAtual: InscricaoStatus
}

export function StatusSelector({
  inscricaoId,
  retiroId,
  statusAtual,
}: StatusSelectorProps) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{
    tipo: 'sucesso' | 'erro'
    mensagem: string
  } | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const novoStatus = e.target.value as InscricaoStatus
    setFeedback(null)

    startTransition(async () => {
      const result = await updateInscricaoStatus(
        inscricaoId,
        retiroId,
        novoStatus
      )
      if (result.error) {
        setFeedback({ tipo: 'erro', mensagem: result.error })
      } else {
        setFeedback({ tipo: 'sucesso', mensagem: 'Status atualizado.' })
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <select
        defaultValue={statusAtual}
        onChange={handleChange}
        disabled={isPending}
        className="text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {inscricaoStatusLabel(s)}
          </option>
        ))}
      </select>

      {isPending && (
        <span className="text-xs text-zinc-400">Salvando...</span>
      )}

      {!isPending && feedback && (
        <span
          className={`text-xs font-medium ${
            feedback.tipo === 'sucesso'
              ? 'text-emerald-600'
              : 'text-red-600'
          }`}
        >
          {feedback.mensagem}
        </span>
      )}
    </div>
  )
}
