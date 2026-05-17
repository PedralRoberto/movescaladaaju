import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { nomeRetiro } from '@/lib/retiro-utils'
import { Eye } from 'lucide-react'

export default async function VigíliaLandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const role = user?.app_metadata?.role
  if (!user || (role !== 'secretaria_vigilia' && role !== 'admin' && role !== 'secretaria_movimento')) {
    redirect('/admin')
  }

  const admin = createAdminClient()

  const { data: retiros } = await admin
    .from('retiros')
    .select('id, tipo, polo, numero, ano, status')
    .in('status', ['inscricoes_abertas', 'inscricoes_encerradas'])
    .order('created_at', { ascending: false })

  const lista = retiros ?? []

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
          <Eye className="h-5 w-5 text-teal-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Fotos + Cartas</h1>
          <p className="text-zinc-500 mt-0.5 text-sm">
            Controle de fotos e cartas por retiro
          </p>
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-zinc-200">
          <Eye className="h-8 w-8 text-zinc-300 mb-3" />
          <p className="text-sm text-zinc-500">Nenhum retiro com inscrições abertas ou encerradas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lista.map((retiro) => (
            <Link
              key={retiro.id}
              href={`/admin/retiros/${retiro.id}/vigilia`}
              className="flex items-center justify-between gap-4 bg-white rounded-xl border border-zinc-200 px-5 py-4 hover:border-teal-300 hover:shadow-sm transition-all"
            >
              <div>
                <p className="text-sm font-semibold text-zinc-900">{nomeRetiro(retiro)}</p>
                <p className="text-xs text-zinc-400 mt-0.5 capitalize">{retiro.status.replace(/_/g, ' ')}</p>
              </div>
              <Eye className="h-4 w-4 text-zinc-300 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
