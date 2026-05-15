import Link from 'next/link'
import { CalendarDays, Users, Clock, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { createAdminClient } from '@/lib/supabase/admin'
import { nomeRetiro, statusLabel, statusColor } from '@/lib/retiro-utils'

function getSaudacao(): string {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default async function AdminDashboard() {
  const supabase = createAdminClient()
  const saudacao = getSaudacao()

  const [
    { count: totalRetiros },
    { count: retirosAbertos },
    { count: totalInscritos },
    { count: listaEspera },
    { data: retiros },
  ] = await Promise.all([
    supabase.from('retiros').select('*', { count: 'exact', head: true }),
    supabase
      .from('retiros')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'inscricoes_abertas'),
    supabase
      .from('inscricoes')
      .select('*', { count: 'exact', head: true })
      .in('status', ['inscrito', 'confirmado']),
    supabase
      .from('inscricoes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'lista_espera'),
    supabase
      .from('retiros')
      .select('*')
      .not('status', 'eq', 'realizado')
      .order('created_at', { ascending: false })
      .limit(4),
  ])

  const stats = [
    {
      titulo: 'Retiros',
      valor: totalRetiros ?? 0,
      sub: `${retirosAbertos ?? 0} com inscrições abertas`,
      icon: CalendarDays,
    },
    {
      titulo: 'Inscritos',
      valor: totalInscritos ?? 0,
      sub: 'confirmados e inscritos',
      icon: Users,
    },
    {
      titulo: 'Espera',
      valor: listaEspera ?? 0,
      sub: 'aguardando vaga',
      icon: Clock,
    },
  ]

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
          {saudacao}, Admin
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Bem-vindo ao painel do Movimento Escalada Aju
        </p>
      </div>

      {/* Stats — 3 cols sempre */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.titulo}>
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wide">
                    {s.titulo}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-zinc-900">
                    {s.valor}
                  </p>
                  <p className="text-[10px] sm:text-xs text-zinc-400 hidden sm:block">
                    {s.sub}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Retiros ativos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-zinc-900">
            Retiros ativos
          </h2>
          <Link
            href="/admin/retiros"
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            Ver todos
          </Link>
        </div>

        {!retiros || retiros.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 bg-white rounded-xl border border-zinc-200 text-center">
            <CheckCircle className="h-8 w-8 text-zinc-300 mb-3" strokeWidth={1.5} />
            <p className="text-sm font-medium text-zinc-500">
              Nenhum retiro ativo no momento
            </p>
            <Link
              href="/admin/retiros/novo"
              className="mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Criar novo retiro
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="text-left px-4 sm:px-6 py-3 font-medium text-zinc-500">
                    Retiro
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 font-medium text-zinc-500">
                    Status
                  </th>
                  <th className="text-right px-4 sm:px-6 py-3 font-medium text-zinc-500 hidden sm:table-cell">
                    Ano
                  </th>
                  <th className="text-right px-4 sm:px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {retiros.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 font-medium text-zinc-900">
                      {nomeRetiro(r)}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(r.status)}`}
                      >
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right text-zinc-500 hidden sm:table-cell">
                      {r.ano}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <Link
                        href={`/admin/retiros/${r.id}`}
                        className="text-teal-600 hover:text-teal-700 font-medium text-xs"
                      >
                        Abrir →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
