'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function VigíliaShell({
  email,
  children,
}: {
  email: string
  children: React.ReactNode
}) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-100">
      {/* Topbar */}
      <header
        className="shrink-0 bg-white border-b border-zinc-200 flex items-center justify-between px-6"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          minHeight: 'calc(3.5rem + env(safe-area-inset-top))',
        }}
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

        {/* Logout */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 hidden sm:block">{email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
            title="Sair da conta"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
