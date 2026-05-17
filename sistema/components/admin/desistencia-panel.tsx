'use client'

import { useState, useTransition } from 'react'
import { AlertTriangle, Check } from 'lucide-react'
import {
  registrarDesistencia,
  toggleReembolsado,
} from '@/app/admin/(dashboard)/retiros/[id]/inscritos/actions'

interface DesistenciaPanelProps {
  inscricaoId: string
  retiroId: string
  status: string
  reembolsado: boolean | null
  dataDesistencia: string | null
}

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Maceio',
  })
}

export function DesistenciaPanel({
  inscricaoId,
  retiroId,
  status,
  reembolsado,
  dataDesistencia,
}: DesistenciaPanelProps) {
  const [confirmando, setConfirmando] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [reembolsadoLocal, setReembolsadoLocal] = useState(reembolsado ?? false)

  const desistiu = status === 'cancelado'

  function handleConfirmar() {
    setErro(null)
    startTransition(async () => {
      const result = await registrarDesistencia(inscricaoId, retiroId)
      if (result.error) {
        setErro(result.error)
        setConfirmando(false)
      }
    })
  }

  function handleToggleReembolsado(checked: boolean) {
    setReembolsadoLocal(checked)
    startTransition(async () => {
      const result = await toggleReembolsado(inscricaoId, retiroId, checked)
      if (result.error) {
        setReembolsadoLocal(!checked)
        setErro(result.error)
      }
    })
  }

  if (desistiu) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-semibold text-red-700 mb-1">Desistência registrada</p>
        {dataDesistencia && (
          <p className="text-xs text-red-500 mb-4">
            {formatarDataHora(dataDesistencia)}
          </p>
        )}
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={reembolsadoLocal}
            disabled={isPending}
            onChange={(e) => handleToggleReembolsado(e.target.checked)}
            className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500 accent-red-600 cursor-pointer disabled:opacity-50"
          />
          <span className="text-sm font-medium text-red-700">Reembolsado</span>
          {isPending && (
            <span className="text-xs text-red-400">Salvando...</span>
          )}
          {!isPending && reembolsadoLocal && (
            <Check className="h-3.5 w-3.5 text-red-500" />
          )}
        </label>
        {erro && <p className="text-xs text-red-600 mt-2">{erro}</p>}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
      {!confirmando ? (
        <button
          onClick={() => setConfirmando(true)}
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors"
        >
          <AlertTriangle className="h-4 w-4" />
          Registrar desistência
        </button>
      ) : (
        <div>
          <p className="text-sm font-medium text-zinc-800 mb-1">
            Confirmar desistência?
          </p>
          <p className="text-xs text-zinc-500 mb-4">
            O status será alterado para <strong>Cancelado</strong> e a vaga ficará disponível
            para quem está na lista de espera.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleConfirmar}
              disabled={isPending}
              className="flex items-center gap-1.5 text-xs font-semibold bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Registrando...' : 'Confirmar desistência'}
            </button>
            <button
              onClick={() => { setConfirmando(false); setErro(null) }}
              disabled={isPending}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-700 px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
          {erro && <p className="text-xs text-red-600 mt-2">{erro}</p>}
        </div>
      )}
    </div>
  )
}
