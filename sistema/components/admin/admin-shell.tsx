'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

export function AdminShell({
  sidebarContent,
  children,
}: {
  sidebarContent: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen bg-zinc-100">
      {/* Backdrop mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col p-3 transition-transform duration-200 sm:static sm:shrink-0 ${
          open ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        }`}
      >
        <div className="relative flex flex-col flex-1 w-56 bg-white rounded-2xl shadow-md border border-zinc-200/60 overflow-hidden">
          {/* Botão fechar — mobile only */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3.5 right-3 p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors sm:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>

          {sidebarContent}
        </div>
      </aside>

      {/* Coluna direita: topbar mobile + conteúdo */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar — mobile only */}
        <div
          className="flex items-center gap-3 px-4 bg-white border-b border-zinc-200 sm:hidden shrink-0"
          style={{ paddingTop: 'env(safe-area-inset-top)', minHeight: 'calc(3.5rem + env(safe-area-inset-top))' }}
        >
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <img src="/escalada-icon.svg" alt="" aria-hidden className="h-6 w-auto" />
          <span className="text-sm font-bold text-teal-600">Escalada Aju</span>
        </div>

        <main className="flex-1 overflow-auto bg-zinc-100">{children}</main>
      </div>
    </div>
  )
}
