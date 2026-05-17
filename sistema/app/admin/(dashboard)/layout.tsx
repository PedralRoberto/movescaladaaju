import { redirect } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Users, MessageCircle, Eye } from 'lucide-react'
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

  const role = user.app_metadata?.role as string | undefined
  const isAdmin = role === 'admin'
  const isPreparatoria = role === 'coordenador_preparatoria'
  const isVigilia = role === 'secretaria_vigilia'

  return (
    <AdminShell
      sidebarContent={
        <>
          {/* Navegação */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {isPreparatoria ? (
              <NavLink
                href="/admin/preparatoria"
                label="Inscritos"
                icon={<MessageCircle className="h-4 w-4 shrink-0" />}
              />
            ) : isVigilia ? (
              <NavLink
                href="/admin/vigilia"
                label="Vigília"
                icon={<Eye className="h-4 w-4 shrink-0" />}
              />
            ) : (
              <>
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
                {isAdmin && (
                  <NavLink
                    href="/admin/usuarios"
                    label="Usuários"
                    icon={<Users className="h-4 w-4 shrink-0" />}
                  />
                )}
              </>
            )}
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
