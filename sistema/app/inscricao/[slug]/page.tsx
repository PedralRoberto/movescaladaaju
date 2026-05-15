export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { nomeRetiro, parseSlugRetiro } from '@/lib/retiro-utils'
import { InscricaoForm } from '../inscricao-form'

function formatarDataHora(data: string): string {
  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Maceio',
  })
}

function EmBreve({ nome, abertura }: { nome: string; abertura: string | null }) {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm w-full">
        <img
          src="/escalada-logo.svg"
          alt="Escalada Aju"
          className="h-28 w-auto mx-auto mb-6"
        />
        <div className="bg-white border border-zinc-200 rounded-2xl px-6 py-8 shadow-sm">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700 mb-4">
            Em breve
          </span>
          <p className="text-zinc-900 font-semibold text-lg mb-4">{nome}</p>
          {abertura ? (
            <>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
                Inscrições abrem em
              </p>
              <p className="text-teal-700 font-bold text-2xl mb-5">
                {formatarDataHora(abertura)}
              </p>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Deixe esta página aberta e atualize quando chegar a hora.
              </p>
            </>
          ) : (
            <p className="text-zinc-500 text-sm">
              As inscrições estarão abertas em breve.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function Encerrado({ nome }: { nome: string }) {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm w-full">
        <img
          src="/escalada-logo.svg"
          alt="Escalada Aju"
          className="h-28 w-auto mx-auto mb-6"
        />
        <div className="bg-white border border-zinc-200 rounded-2xl px-6 py-8 shadow-sm">
          <p className="text-zinc-900 font-semibold text-lg mb-2">{nome}</p>
          <p className="text-zinc-500 text-sm">
            As inscrições para este retiro estão encerradas. Fique de olho nas
            nossas redes sociais para as próximas datas.
          </p>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const parsed = parseSlugRetiro(slug)
  if (!parsed) return { title: 'Inscrição — Escalada Aju' }

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('retiros')
    .select('tipo, polo, numero, ano')
    .eq('tipo', parsed.tipo)
    .eq('polo', parsed.polo)
    .eq('numero', parsed.numero)
    .eq('ano', parsed.ano)
    .single()

  const nome = data ? nomeRetiro(data) : 'Escalada Aju'
  return {
    title: `Inscrição — ${nome}`,
    description: `Formulário de inscrição para ${nome}.`,
  }
}

export default async function InscricaoSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const parsed = parseSlugRetiro(slug)
  if (!parsed) notFound()

  const supabase = createAdminClient()

  const { data: retiro } = await supabase
    .from('retiros')
    .select('*')
    .eq('tipo', parsed.tipo)
    .eq('polo', parsed.polo)
    .eq('numero', parsed.numero)
    .eq('ano', parsed.ano)
    .single()

  if (!retiro) notFound()

  const nome = nomeRetiro(retiro)

  // Retiro encerrado ou realizado
  if (retiro.status === 'inscricoes_encerradas' || retiro.status === 'realizado') {
    return <Encerrado nome={nome} />
  }

  // Ainda em preparação
  if (retiro.status === 'preparacao') {
    return <EmBreve nome={nome} abertura={retiro.abertura_inscricoes} />
  }

  // inscricoes_abertas: deixa o banco decidir se o horário já chegou
  // Usa a mesma lógica da página hub — comparação feita em UTC no banco
  const now = new Date().toISOString()
  const { data: retiroAberto } = await supabase
    .from('retiros')
    .select('id')
    .eq('id', retiro.id)
    .eq('status', 'inscricoes_abertas')
    .or(`abertura_inscricoes.is.null,abertura_inscricoes.lte.${now}`)
    .maybeSingle()

  if (!retiroAberto) {
    // Status aberto mas horário ainda não chegou
    return <EmBreve nome={nome} abertura={retiro.abertura_inscricoes} />
  }

  // Formulário aberto — busca contagem de inscritos
  const { count } = await supabase
    .from('inscricoes')
    .select('*', { count: 'exact', head: true })
    .eq('retiro_id', retiro.id)
    .in('status', ['inscrito', 'confirmado'])

  const retiroInfo = {
    id: retiro.id,
    nome,
    vagas: retiro.vagas,
    inscritos: count ?? 0,
    chave_pix: retiro.chave_pix ?? null,
    tipo: retiro.tipo as 'regular' | 'master',
  }

  return <InscricaoForm retiros={[retiroInfo]} />
}
