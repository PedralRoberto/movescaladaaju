'use client'

import { useActionState, useState, useEffect } from 'react'
import { Pencil, X } from 'lucide-react'
import { editarUsuario } from '@/app/admin/(dashboard)/usuarios/actions'

const IN =
  'w-full text-sm border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 bg-white'

interface Props {
  userId: string
  email: string
  apelido?: string
}

export function EditarUsuarioForm({ userId, email, apelido }: Props) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(editarUsuario, null)

  useEffect(() => {
    if (state && !state.error) setOpen(false)
  }, [state])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
        title="Editar usuário"
      >
        <Pencil className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">Editar usuário</h2>
                <p className="text-xs text-zinc-400 mt-0.5">{email}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={action} className="p-5 space-y-4">
              <input type="hidden" name="userId" value={userId} />

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700">Apelido</label>
                <input
                  name="apelido"
                  type="text"
                  required
                  defaultValue={apelido ?? ''}
                  placeholder="Nome de tratamento no sistema"
                  className={IN}
                  disabled={pending}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700">
                  Nova senha
                  <span className="ml-1 font-normal text-zinc-400">(deixe em branco para manter)</span>
                </label>
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  className={IN}
                  disabled={pending}
                  autoComplete="new-password"
                />
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
                  {pending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
