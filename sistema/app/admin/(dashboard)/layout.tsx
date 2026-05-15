import { redirect } from 'next/navigation'
import { LayoutDashboard, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { NavLink } from '@/components/admin/nav-link'
import { SidebarLogout } from '@/components/admin/sidebar-logout'
import { AdminShell } from '@/components/admin/admin-shell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <AdminShell
      sidebarContent={
        <>
          {/* Topo da sidebar */}
          <div className="px-4 pt-5 pb-4 pr-10">
            <div className="flex items-center gap-2.5 mb-1">
              <img
                src="/escalada-icon.svg"
                alt=""
                aria-hidden="true"
                className="w-8 h-8 shrink-0"
              />
              <span className="text-sm font-bold text-teal-600">Escalada Aju</span>
            </div>
            <p className="text-xs text-zinc-400 pl-10">Painel Admin</p>
          </div>

          <div className="h-px bg-zinc-200 mx-4" />

          {/* Navegação */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            <NavLink
              href="/admin"
              label="Dashboard"
              icon={<LayoutDashboard className="h-4 w-4 shrink-0" />}
              exact
            />
            <NavLink
              href="/admin/retiros"
              label="Retiros"
              icon={<CalendarDays className="h-4 w-4 shrink-0" />}
            />
          </nav>

          {/* Rodapé com logout */}
          <div className="px-3 pb-4">
            <SidebarLogout email={user.email ?? ''} />
          </div>
        </>
      }
    >
      {children}
    </AdminShell>
  )
}
