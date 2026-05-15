'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Check } from 'lucide-react'
import { registrarPagamento } from '@/app/admin/(dashboard)/retiros/[id]/pagamentos/actions'
import {
  tiposDisponiveis,
  valorSugerido,
  pagamentoTipoLabel,
} from '@/lib/pagamento-utils'
import type { ModalidadePagamento, PagamentoTipo } from '@/types/database'

interface PagamentoFormProps {
  inscricaoId: string
  retiroId: string
  modalidade: ModalidadePagamento
}

export function PagamentoForm({
  inscricaoId,
  retiroId,
  modalidade,
}: PagamentoFormProps) {
  const tipos = tiposDisponiveis(modalidade)
  const [aberto, setAberto] = useState(false)
  const [tipoSelecionado, setTipoSelecionado] = useState<PagamentoTipo>(tipos[0])
  const [valor, setValor] = useState(
    String(valorSugerido(tipos[0], modalidade))
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleTipoChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const tipo = e.target.value as PagamentoTipo
    setTipoSelecionado(tipo)
    setValor(String(valorSugerido(tipo, modalidade)))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await registrarPagamento(inscricaoId, retiroId, formData)
      if (result.error) {
        setError(result.error)
      } else {
        setAberto(false)
        setTipoSelecionado(tipos[0])
        setValor(String(valorSugerido(tipos[0], modalidade)))
      }
    })
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Registrar pagamento
      </button>
    )
  }

  return (
    <div className="border border-zinc-200 rounded-xl p-5 bg-zinc-50">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-zinc-900">
          Novo pagamento
        </p>
        <button
          onClick={() => {
            setAberto(false)
            setError(null)
          }}
          className="text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-500 block mb-1">
              Tipo *
            </label>
            <select
              name="tipo"
              value={tipoSelecionado}
              onChange={handleTipoChange}
              disabled={isPending}
              className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            >
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {pagamentoTipoLabel(t)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500 block mb-1">
              Valor (R$) *
            </label>
            <input
              name="valor"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              disabled={isPending}
              className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-500 block mb-1">
            Data do pagamento *
          </label>
          <input
            name="data_pagamento"
            type="date"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            disabled={isPending}
            className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-500 block mb-1">
            Comprovante (opcional)
          </label>
          <input
            name="comprovante"
            type="file"
            accept="image/*,.pdf"
            disabled={isPending}
            className="w-full text-sm text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-500 block mb-1">
            Observações (opcional)
          </label>
          <textarea
            name="observacoes"
            rows={2}
            disabled={isPending}
            placeholder="Ex: Pago via Pix"
            className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1.5 text-sm font-medium bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            <Check className="h-4 w-4" />
            {isPending ? 'Salvando...' : 'Salvar pagamento'}
          </button>
          <button
            type="button"
            onClick={() => {
              setAberto(false)
              setError(null)
            }}
            disabled={isPending}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-700 px-4 py-2 rounded-lg border border-zinc-200 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
