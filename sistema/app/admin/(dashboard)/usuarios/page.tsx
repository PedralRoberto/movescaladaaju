import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CriarUsuarioForm } from '@/components/admin/criar-usuario-form'
import { DeletarUsuarioButton } from '@/components/admin/deletar-usuario-button'
import { Users } from 'lucide-react'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/admin')
  }

  const admin = createAdminClient()
  const { data } = await admin.auth.admin.listUsers()
  const users = data?.users ?? []

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Usuários</h1>
          <p className="text-zinc-500 mt-1">
            Gerencie quem tem acesso ao painel
          </p>
        </div>
        <CriarUsuarioForm />
      </div>

      {/* Empty state */}
      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-teal-400" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-1">
            Nenhum usuário cadastrado
          </h2>
          <p className="text-zinc-500 text-sm">
            Crie contas para as secretárias do movimento.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  E-mail
                </th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Cargo
                </th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Criado em
                </th>
                <th className="text-right px-6 py-3 font-medium text-zinc-500">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {u.email ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={u.app_metadata?.role} />
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    {new Date(u.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.id !== user.id ? (
                      <DeletarUsuarioButton userId={u.id} email={u.email ?? ''} />
                    ) : (
                      <span className="text-xs text-zinc-400">Você</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'bg-teal-100 text-teal-700' },
  secretaria_movimento: { label: 'Secretaria do Movimento', color: 'bg-zinc-100 text-zinc-700' },
  secretaria_encontro: { label: 'Secretaria do Encontro', color: 'bg-blue-100 text-blue-700' },
  secretaria_vigilia: { label: 'Secretaria da Vigília', color: 'bg-indigo-100 text-indigo-700' },
  coordenador_preparatoria: { label: 'Coord. Preparatória', color: 'bg-amber-100 text-amber-700' },
}

function RoleBadge({ role }: { role?: string }) {
  const config = role ? ROLE_LABELS[role] : null
  if (!config) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-400">
        —
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}
