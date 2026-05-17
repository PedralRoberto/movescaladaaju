'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function useLogout() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function confirm() {
    setPending(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return { open, setOpen, pending, confirm }
}

export function LogoutConfirmModal({
  open,
  pending,
  onConfirm,
  onCancel,
}: {
  open: boolean
  pending: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-xs bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
        <div className="p-6">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-4">
            <LogOut className="h-5 w-5 text-zinc-500" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-900 mb-1">Sair da conta?</h2>
          <p className="text-sm text-zinc-500">Você precisará fazer login novamente para acessar o sistema.</p>
        </div>
        <div className="flex gap-2 px-6 pb-6">
          <button
            onClick={onCancel}
            disabled={pending}
            className="flex-1 px-3 py-2.5 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className="flex-1 px-3 py-2.5 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-50"
          >
            {pending ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      </div>
    </div>
  )
}
