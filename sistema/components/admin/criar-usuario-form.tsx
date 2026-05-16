'use client'

import { useActionState, useState, useEffect } from 'react'
import { UserPlus, X } from 'lucide-react'
import { criarUsuario } from '@/app/admin/(dashboard)/usuarios/actions'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const IN =
  'w-full text-sm border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 bg-white'

export function CriarUsuarioForm() {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(criarUsuario, null)

  useEffect(() => {
    if (state && !state.error) {
      setOpen(false)
    }
  }, [state])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(buttonVariants({ size: 'lg' }), 'shrink-0')}
      >
        <UserPlus className="h-4 w-4" />
        Criar usuário
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">Criar usuário</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={action} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700">E-mail</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="email@exemplo.com"
                  className={IN}
                  disabled={pending}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700">Senha inicial</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  className={IN}
                  disabled={pending}
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700">Cargo</label>
                <select name="role" required className={IN} disabled={pending}>
                  <option value="secretaria_movimento">Secretaria do Movimento</option>
                  <option value="secretaria_encontro">Secretaria do Encontro</option>
                  <option value="secretaria_vigilia">Secretaria da Vigília</option>
                  <option value="coordenador_preparatoria">Coordenador de Preparatória</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {state?.error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {state.error}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-3 py-2.5 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
                  disabled={pending}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 px-3 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  {pending ? 'Criando...' : 'Criar conta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
