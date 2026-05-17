'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, X, PanelLeft, PanelLeftClose } from 'lucide-react'

export function AdminShell({
  sidebarContent,
  children,
}: {
  sidebarContent: React.ReactNode
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem('sidebar-collapsed') === 'true')
    } catch {}
  }, [])

  function toggleCollapse() {
    setCollapsed((prev) => {
      try {
        localStorage.setItem('sidebar-collapsed', String(!prev))
      } catch {}
      return !prev
    })
  }

  return (
    <div className="flex h-screen bg-zinc-100">
      {/* Backdrop mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col p-3 transition-transform duration-200 sm:static sm:shrink-0${
          collapsed ? ' sm:self-start' : ''
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}`}
      >
        <div
          className={`relative flex flex-col w-56 bg-white rounded-2xl shadow-md border border-zinc-200/60 overflow-hidden ${
            collapsed ? '' : 'flex-1'
          }`}
        >
          {/* Cabeçalho — sempre visível */}
          <div className="flex items-center gap-2 px-4 pt-5 pb-4">
            <Link href="/admin" className="flex items-center gap-2 flex-1 min-w-0 group">
              <img
                src="/escalada-icon.svg"
                alt="Ir para o dashboard"
                className="w-8 h-8 shrink-0 group-hover:opacity-80 transition-opacity"
              />
              <span className="text-sm font-bold text-teal-600 group-hover:text-teal-700 transition-colors">
                Escalada Aju
              </span>
            </Link>

            {/* Fechar — mobile */}
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors sm:hidden"
              aria-label="Fechar menu"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Recolher/expandir — desktop */}
            <button
              onClick={toggleCollapse}
              className="hidden sm:flex p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors"
              aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Nav + rodapé — animados com CSS grid trick */}
          <div
            className="flex-1"
            style={{
              display: 'grid',
              gridTemplateRows: collapsed ? '0fr' : '1fr',
              transition: 'grid-template-rows 380ms ease',
            }}
          >
            <div className="overflow-hidden flex flex-col">
              <div
                className="flex flex-col flex-1"
                style={{
                  opacity: collapsed ? 0 : 1,
                  transition: 'opacity 260ms ease',
                }}
              >
                <div className="h-px bg-zinc-200 mx-4" />
                {sidebarContent}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Coluna direita */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar — mobile only */}
        <div
          className="flex items-center gap-3 px-4 bg-white border-b border-zinc-200 sm:hidden shrink-0"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            minHeight: 'calc(3.5rem + env(safe-area-inset-top))',
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
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
