'use client'

import { LogOut } from 'lucide-react'
import { useLogout, LogoutConfirmModal } from './logout-confirm'

export function VigíliaShell({
  email,
  apelido,
  children,
}: {
  email: string
  apelido?: string
  children: React.ReactNode
}) {
  const { open, setOpen, pending, confirm } = useLogout()

  const inicial = (apelido ?? email).charAt(0).toUpperCase()
  const nome = apelido ?? email

  return (
    <div className="flex flex-col h-screen bg-zinc-100">
      {/* Topbar */}
      <header
        className="shrink-0 bg-white border-b border-zinc-200"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div
          className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-between"
          style={{ height: 'calc(3.5rem + env(safe-area-inset-top))' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img
              src="/escalada-icon.svg"
              alt=""
              aria-hidden="true"
              className="w-7 h-7 shrink-0"
            />
            <span className="text-sm font-bold text-teal-600">Escalada Aju</span>
          </div>

          {/* Usuário + sair */}
          <div className="flex items-center gap-3">
            {/* Avatar + nome */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">{inicial}</span>
              </div>
              <span className="text-sm font-medium text-zinc-700 hidden sm:block">
                {nome}
              </span>
            </div>

            {/* Divider */}
            <div className="h-4 w-px bg-zinc-200" />

            {/* Sair */}
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
              title="Sair da conta"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto">{children}</main>

      <LogoutConfirmModal
        open={open}
        pending={pending}
        onConfirm={confirm}
        onCancel={() => setOpen(false)}
      />
    </div>
  )
}
