import Link from 'next/link'
import { Plus, CalendarDays } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { buttonVariants } from '@/components/ui/button'
import { nomeRetiro, statusLabel, statusColor } from '@/lib/retiro-utils'
import { cn } from '@/lib/utils'

export default async function RetirosPage() {
  const supabase = createAdminClient()

  const { data: retiros, error } = await supabase
    .from('retiros')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    // Em dev, expõe o erro real para diagnóstico
    throw new Error(
      process.env.NODE_ENV === 'development'
        ? `[${error.code}] ${error.message}`
        : 'Erro ao carregar retiros. Tente novamente.'
    )
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Retiros</h1>
          <p className="text-zinc-500 mt-1">
            Gerencie os retiros do Movimento Escalada Aju
          </p>
        </div>
        <Link
          href="/admin/retiros/novo"
          className={cn(buttonVariants({ size: 'lg' }))}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Novo retiro
        </Link>
      </div>

      {/* Empty state */}
      {retiros.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
            <CalendarDays className="h-8 w-8 text-teal-400" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-1">
            Nenhum retiro cadastrado ainda
          </h2>
          <p className="text-zinc-500 text-sm mb-6">
            Crie o primeiro retiro para começar a gestão.
          </p>
          <Link
            href="/admin/retiros/novo"
            className={cn(buttonVariants({ size: 'lg' }))}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Criar primeiro retiro
          </Link>
        </div>
      ) : (
        /* Tabela */
        <div className="bg-white rounded-xl border border-zinc-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Nome
                </th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Ano
                </th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Vagas
                </th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Status
                </th>
                <th className="text-right px-6 py-3 font-medium text-zinc-500">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {retiros.map((retiro) => (
                <tr
                  key={retiro.id}
                  className="hover:bg-zinc-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {nomeRetiro(retiro)}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{retiro.ano}</td>
                  <td className="px-6 py-4 text-zinc-600">{retiro.vagas}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(retiro.status)}`}
                    >
                      {statusLabel(retiro.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/retiros/${retiro.id}`}
                      className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
                    >
                      Ver
                    </Link>
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
