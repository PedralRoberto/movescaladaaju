import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { nomeRetiro } from '@/lib/retiro-utils'
import { ReuniaoSlots } from '@/components/admin/reuniao-slots'
import { ChamadaGrid } from '@/components/admin/chamada-grid'
import type { Presenca } from '@/types/database'

export default async function ChamadaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const [
    { data: retiro, error: retiroError },
    { data: reunioes },
    { data: inscritos, error: inscritosError },
  ] = await Promise.all([
    supabase.from('retiros').select('*').eq('id', id).single(),
    supabase
      .from('reunioes_previas')
      .select('*')
      .eq('retiro_id', id)
      .order('numero'),
    supabase
      .from('inscricoes')
      .select('*')
      .eq('retiro_id', id)
      .neq('status', 'cancelado')
      .order('nome_completo'),
  ])

  if (retiroError || !retiro) {
    notFound()
  }

  if (inscritosError) {
    throw new Error(
      process.env.NODE_ENV === 'development'
        ? `[${inscritosError.code}] ${inscritosError.message}`
        : 'Erro ao carregar inscritos.'
    )
  }

  const reunioesList = reunioes ?? []
  const inscritosList = inscritos ?? []

  const reuniaoIds = reunioesList.map((r) => r.id)
  const { data: presencasData } =
    reuniaoIds.length > 0
      ? await supabase
          .from('presencas')
          .select('*')
          .in('reuniao_id', reuniaoIds)
      : { data: [] as Presenca[] }

  const nome = nomeRetiro(retiro)

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
        <Link
          href="/admin/retiros"
          className="hover:text-zinc-600 flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retiros
        </Link>
        <span>/</span>
        <Link
          href={`/admin/retiros/${id}`}
          className="hover:text-zinc-600 truncate max-w-xs"
        >
          {nome}
        </Link>
        <span>/</span>
        <span className="text-zinc-600 font-medium">Chamada</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
          <ClipboardList className="h-5 w-5 text-teal-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Chamada</h1>
          <p className="text-zinc-500 mt-0.5 text-sm">{nome}</p>
        </div>
      </div>

      {/* Reuniões */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-zinc-900 mb-4">
          Reuniões prévias
        </h2>
        <ReuniaoSlots retiroId={id} reunioes={reunioesList} />
      </section>

      {/* Grid de chamada */}
      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-4">
          Registro de presença
        </h2>
        <ChamadaGrid
          retiroId={id}
          reunioes={reunioesList}
          inscritos={inscritosList}
          presencas={presencasData ?? []}
        />
      </section>
    </div>
  )
}
