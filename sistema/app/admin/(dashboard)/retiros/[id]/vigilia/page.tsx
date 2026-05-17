import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Eye } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { nomeRetiro } from '@/lib/retiro-utils'
import { VigíliaGrid } from '@/components/admin/vigilia-grid'
import type { VigiliaMaterial } from '@/types/database'

export default async function VigíliaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const [
    { data: retiro, error: retiroError },
    { data: inscritos, error: inscritosError },
  ] = await Promise.all([
    supabase.from('retiros').select('*').eq('id', id).single(),
    supabase
      .from('inscricoes')
      .select('id, nome_completo')
      .eq('retiro_id', id)
      .neq('status', 'cancelado')
      .order('nome_completo'),
  ])

  if (retiroError || !retiro) notFound()

  if (inscritosError) {
    throw new Error(
      process.env.NODE_ENV === 'development'
        ? `[${inscritosError.code}] ${inscritosError.message}`
        : 'Erro ao carregar inscritos.'
    )
  }

  const inscritosList = inscritos ?? []
  const inscritoIds = inscritosList.map((i) => i.id)

  const { data: materiais } =
    inscritoIds.length > 0
      ? await supabase
          .from('vigilia_materiais')
          .select('*')
          .in('inscricao_id', inscritoIds)
      : { data: [] as VigiliaMaterial[] }

  const nome = nomeRetiro(retiro)

  // Métricas
  const matMap = Object.fromEntries(
    (materiais ?? []).map((m) => [m.inscricao_id, m])
  )
  const completos = inscritosList.filter((i) => {
    const m = matMap[i.id]
    return (
      m?.foto_crianca && m?.foto_adolescente && m?.foto_atual && (m?.cartas_recebidas ?? 0) >= 5
    )
  }).length
  const pendentes = inscritosList.length - completos

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
        <Link href="/admin/retiros" className="hover:text-zinc-600 flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Retiros
        </Link>
        <span>/</span>
        <Link href={`/admin/retiros/${id}`} className="hover:text-zinc-600 truncate max-w-xs">
          {nome}
        </Link>
        <span>/</span>
        <span className="text-zinc-600 font-medium">Vigília</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
          <Eye className="h-5 w-5 text-teal-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Vigília</h1>
          <p className="text-zinc-500 mt-0.5 text-sm">{nome}</p>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total inscritos', valor: inscritosList.length },
          { label: 'Completos', valor: completos },
          { label: 'Pendentes', valor: pendentes },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-zinc-200 p-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              {m.label}
            </p>
            <p className="text-2xl font-bold text-zinc-900">{m.valor}</p>
          </div>
        ))}
      </div>

      {/* Legenda */}
      <p className="text-xs text-zinc-400 mb-4">
        Marque os itens conforme os materiais forem entregues pelos responsáveis.
        Mínimo: 3 fotos (criança, adolescente, atual) e 5 cartas.
      </p>

      {/* Grid */}
      <VigíliaGrid
        retiroId={id}
        inscritos={inscritosList}
        materiais={materiais ?? []}
      />
    </div>
  )
}
