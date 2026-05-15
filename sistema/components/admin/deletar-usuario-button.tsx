'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deletarUsuario } from '@/app/admin/(dashboard)/usuarios/actions'

export function DeletarUsuarioButton({ userId, email }: { userId: string; email: string }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Remover a conta de ${email}?\n\nEsta ação não pode ser desfeita.`)) return
    startTransition(async () => {
      const result = await deletarUsuario(userId)
      if (result?.error) alert(result.error)
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
      aria-label={`Remover ${email}`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
