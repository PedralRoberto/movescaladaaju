'use client'

import { useState, useTransition } from 'react'
import { Calendar, MapPin, Pencil, Plus, X, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { salvarReuniao } from '@/app/admin/(dashboard)/retiros/[id]/chamada/actions'
import type { ReuniaoPrevia } from '@/types/database'

interface SlotProps {
  retiroId: string
  numero: number
  reuniao: ReuniaoPrevia | null
}

function ReuniaoSlot({ retiroId, numero, reuniao }: SlotProps) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await salvarReuniao(retiroId, numero, formData)
      if (result.error) {
        setError(result.error)
      } else {
        setEditing(false)
      }
    })
  }

  const dataFormatada = reuniao
    ? new Date(reuniao.data + 'T00:00:00').toLocaleDateString('pt-BR')
    : null

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold text-teal-600">{numero}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-0.5">
                Reunião {numero}
              </p>
              {dataFormatada ? (
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-zinc-900 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    {dataFormatada}
                  </p>
                  {reuniao?.local_nome && (
                    <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
                      {reuniao.local_nome}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-400 italic">Não agendada</p>
              )}
            </div>
          </div>

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="shrink-0 text-xs text-zinc-400 hover:text-teal-600 flex items-center gap-1 transition-colors"
            >
              {reuniao ? (
                <>
                  <Pencil className="h-3 w-3" />
                  Editar
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  Definir
                </>
              )}
            </button>
          )}
        </div>

        {editing && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-zinc-500 block mb-1">
                Data *
              </label>
              <input
                name="data"
                type="date"
                required
                defaultValue={reuniao?.data ?? ''}
                disabled={isPending}
                className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 block mb-1">
                Local (opcional)
              </label>
              <input
                name="local_nome"
                type="text"
                placeholder="Ex: Paróquia São José"
                defaultValue={reuniao?.local_nome ?? ''}
                disabled={isPending}
                className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-1.5 text-xs font-medium bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                {isPending ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setError(null)
                }}
                disabled={isPending}
                className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 disabled:opacity-50 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

interface ReuniaoSlotsProps {
  retiroId: string
  reunioes: ReuniaoPrevia[]
}

export function ReuniaoSlots({ retiroId, reunioes }: ReuniaoSlotsProps) {
  const reuniaoMap = Object.fromEntries(reunioes.map((r) => [r.numero, r]))

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {([1, 2, 3, 4] as const).map((numero) => (
        <ReuniaoSlot
          key={numero}
          retiroId={retiroId}
          numero={numero}
          reuniao={reuniaoMap[numero] ?? null}
        />
      ))}
    </div>
  )
}
