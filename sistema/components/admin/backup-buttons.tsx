'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Download, Upload, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  retiroId: string
  isAdmin: boolean
}

export function BackupButtons({ retiroId, isAdmin }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [modal, setModal] = useState<{ file: File; json: unknown } | null>(null)
  const [pending, setPending] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const router = useRouter()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string)
        setErro(null)
        setModal({ file, json })
      } catch {
        setErro('Arquivo inválido. Selecione um backup gerado por este sistema.')
      }
      // limpa o input para permitir re-seleção do mesmo arquivo
      if (fileRef.current) fileRef.current.value = ''
    }
    reader.readAsText(file)
  }

  async function confirmarRestore() {
    if (!modal) return
    setPending(true)
    setErro(null)
    try {
      const res = await fetch(`/api/retiros/${retiroId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modal.json),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.error ?? 'Erro ao restaurar backup.')
        setPending(false)
        return
      }
      setModal(null)
      router.refresh()
    } catch {
      setErro('Erro de conexão. Tente novamente.')
      setPending(false)
    }
  }

  return (
    <>
      {/* Botão backup */}
      <a
        href={`/api/retiros/${retiroId}/backup`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 border border-zinc-200 hover:border-zinc-300 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
        title="Baixar backup completo deste retiro (JSON)"
      >
        <Download className="h-3.5 w-3.5" />
        Backup
      </a>

      {/* Botão restaurar — admin only */}
      {isAdmin && (
        <>
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 border border-zinc-200 hover:border-zinc-300 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            title="Restaurar dados a partir de um backup JSON"
          >
            <Upload className="h-3.5 w-3.5" />
            Restaurar
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}

      {/* Erro fora do modal */}
      {erro && !modal && (
        <span className="text-xs text-red-600">{erro}</span>
      )}

      {/* Modal de confirmação */}
      {modal && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40"
          onClick={(e) => e.target === e.currentTarget && !pending && setModal(null)}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
            <div className="p-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-sm font-semibold text-zinc-900 mb-1">Restaurar backup?</h2>
              <p className="text-sm text-zinc-500 mb-3">
                Todos os dados atuais deste retiro serão <strong className="text-zinc-800">substituídos</strong> pelo
                conteúdo do arquivo:
              </p>
              <p className="text-xs font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 break-all">
                {modal.file.name}
              </p>
              {erro && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {erro}
                </p>
              )}
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button
                onClick={() => { setModal(null); setErro(null) }}
                disabled={pending}
                className="flex-1 px-3 py-2.5 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarRestore}
                disabled={pending}
                className="flex-1 px-3 py-2.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {pending ? 'Restaurando...' : 'Sim, restaurar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
