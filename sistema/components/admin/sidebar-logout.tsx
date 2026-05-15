'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SidebarLogoutProps {
  email: string
}

export function SidebarLogout({ email }: SidebarLogoutProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="border-t border-zinc-200 pt-3 mt-3">
      <p className="text-xs text-zinc-400 truncate px-3 mb-2">{email}</p>
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
      >
        <LogOut className="h-4 w-4 shrink-0 text-zinc-400" />
        Sair
      </button>
    </div>
  )
}
