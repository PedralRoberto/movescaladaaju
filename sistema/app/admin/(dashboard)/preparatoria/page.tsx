import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { nomeRetiro } from '@/lib/retiro-utils'
import { MessageCircle } from 'lucide-react'

function formatarWhatsApp(tel: string): string {
  const digits = tel.replace(/\D/g, '')
  return digits.startsWith('55') ? digits : `55${digits}`
}

export default async function PreparatoriaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const role = user?.app_metadata?.role
  if (!user || (role !== 'coordenador_preparatoria' && role !== 'admin')) {
    redirect('/admin')
  }

  const admin = createAdminClient()

  // Busca retiros com inscrições abertas ou em preparação
  const { data: retiros } = await admin
    .from('retiros')
    .select('id, tipo, polo, numero, ano, status')
    .in('status', ['inscricoes_abertas', 'inscricoes_encerradas'])
    .order('created_at', { ascending: false })

  const retiroIds = (retiros ?? []).map((r) => r.id)

  const inscritosQuery = retiroIds.length > 0
    ? await admin
        .from('inscricoes')
        .select('id, retiro_id, nome_completo, apelido, telefone, status')
        .in('retiro_id', retiroIds)
        .in('status', ['inscrito', 'confirmado'])
        .order('nome_completo')
    : null

  const inscritos = inscritosQuery?.data ?? []

  // Agrupa por retiro
  const retiroMap = Object.fromEntries((retiros ?? []).map((r) => [r.id, r]))
  const porRetiro: Record<string, typeof inscritos> = {}
  for (const ins of inscritos) {
    if (!porRetiro[ins.retiro_id]) porRetiro[ins.retiro_id] = []
    porRetiro[ins.retiro_id]!.push(ins)
  }

  const retiroComInscritos = Object.entries(porRetiro)

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Inscritos</h1>
        <p className="text-zinc-500 mt-1">
          Toque no botão para abrir a conversa no WhatsApp
        </p>
      </div>

      {retiroComInscritos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
            <MessageCircle className="h-8 w-8 text-teal-400" />
          </div>
          <p className="text-zinc-500 text-sm">Nenhum inscrito no momento.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {retiroComInscritos.map(([retiroId, lista]) => {
            const retiro = retiroMap[retiroId]
            const nome = retiro ? nomeRetiro(retiro) : retiroId
            return (
              <div key={retiroId}>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                  {nome}
                  <span className="ml-2 text-zinc-300 normal-case tracking-normal">
                    — {lista?.length ?? 0} {(lista?.length ?? 0) === 1 ? 'inscrito' : 'inscritos'}
                  </span>
                </h2>

                <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-100">
                  {lista?.map((ins) => {
                    const numero = formatarWhatsApp(ins.telefone)
                    const waUrl = `https://wa.me/${numero}`
                    const nomeExibido = ins.apelido
                      ? `${ins.nome_completo} (${ins.apelido})`
                      : ins.nome_completo

                    return (
                      <div
                        key={ins.id}
                        className="flex items-center justify-between gap-4 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-900 truncate">
                            {nomeExibido}
                          </p>
                          <p className="text-xs text-zinc-400 mt-0.5">{ins.telefone}</p>
                        </div>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-xs font-semibold"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </a>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
