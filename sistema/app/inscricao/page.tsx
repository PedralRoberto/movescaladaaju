import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { nomeRetiro, slugRetiro } from '@/lib/retiro-utils'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Inscrição — Escalada Aju',
  description: 'Formulário de inscrição para o Movimento de Retiros Escalada Aju.',
}

function Fechado() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <img
          src="/escalada-logo.svg"
          alt="Escalada Aju"
          className="h-28 w-auto mx-auto mb-6"
        />
        <div className="bg-white border border-zinc-200 rounded-2xl px-6 py-8 shadow-sm">
          <p className="text-zinc-900 font-semibold text-lg mb-2">
            Inscrições encerradas
          </p>
          <p className="text-zinc-500 text-sm">
            No momento não há retiros com inscrições abertas. Fique de olho nas
            nossas redes sociais para saber quando as próximas inscrições
            forem abertas.
          </p>
        </div>
      </div>
    </div>
  )
}

export default async function InscricaoPage() {
  const supabase = createAdminClient()

  const { data: retiros } = await supabase
    .from('retiros')
    .select('*')
    .eq('status', 'inscricoes_abertas')
    .order('created_at')

  if (!retiros || retiros.length === 0) {
    return <Fechado />
  }

  // Se só há um retiro com inscrições abertas, redireciona direto
  if (retiros.length === 1) {
    redirect(`/inscricao/${slugRetiro(retiros[0])}`)
  }

  const now = new Date()

  // Hub: múltiplos retiros abertos
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src="/escalada-logo.svg"
            alt="Escalada Aju"
            className="h-28 w-auto mx-auto"
          />
        </div>

        <div className="space-y-3">
          {retiros.map((retiro) => {
            const slug = slugRetiro(retiro)
            const nome = nomeRetiro(retiro)
            const aberturaDate = retiro.abertura_inscricoes
              ? new Date(retiro.abertura_inscricoes)
              : null
            const aberto = !aberturaDate || aberturaDate <= now

            return (
              <Link
                key={retiro.id}
                href={`/inscricao/${slug}`}
                className="flex items-center justify-between gap-4 bg-white border border-zinc-200 rounded-2xl px-5 py-4 hover:border-teal-300 hover:shadow-sm transition-all"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{nome}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {aberto ? 'Inscrições abertas' : 'Em breve'}
                  </p>
                </div>
                <span className="text-teal-600 text-sm font-medium shrink-0">
                  Inscrever →
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
