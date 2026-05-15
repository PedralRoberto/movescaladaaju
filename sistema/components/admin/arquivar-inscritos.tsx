'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { arquivarInscritos } from '@/app/admin/(dashboard)/retiros/[id]/actions'

interface ArquivarInscritosProps {
  retiroId: string
  totalInscritos: number
}

export function ArquivarInscritos({
  retiroId,
  totalInscritos,
}: ArquivarInscritosProps) {
  const router = useRouter()
  const [confirmado, setConfirmado] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [feito, setFeito] = useState(false)

  function handleArquivar() {
    setError(null)
    startTransition(async () => {
      const result = await arquivarInscritos(retiroId)
      if (result.error) {
        setError(result.error)
      } else {
        setFeito(true)
        router.refresh()
      }
    })
  }

  if (feito) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-4">
        <p className="text-sm text-zinc-600">
          Participantes removidos com sucesso. O registro do retiro foi mantido.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-5 space-y-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div>
              <p className="text-sm font-semibold text-red-800 mb-1">
            Apagar participantes
          </p>
          <p className="text-sm text-red-700">
            Esta ação apaga permanentemente{' '}
            <strong>{totalInscritos} inscrito(s)</strong> e todos os dados
            associados (presenças, pagamentos e comprovantes). O registro do
            retiro em si é mantido. Esta operação não pode ser desfeita.
          </p>
          <p className="text-sm text-red-700 mt-2 font-medium">
            Exporte os dados em Excel antes de continuar — o arquivo será seu
            registro permanente.
          </p>
        </div>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={confirmado}
          onChange={(e) => setConfirmado(e.target.checked)}
          disabled={isPending}
          className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500 accent-red-600 disabled:opacity-50 cursor-pointer"
        />
        <span className="text-sm text-red-800">
          Já exportei o Excel e confirmo que desejo apagar todos os participantes
          deste retiro
        </span>
      </label>

      {error && (
        <p className="text-xs text-red-700 bg-red-100 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handleArquivar}
        disabled={!confirmado || isPending}
        className="text-sm font-medium bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Apagando...' : 'Apagar participantes'}
      </button>
    </div>
  )
}
