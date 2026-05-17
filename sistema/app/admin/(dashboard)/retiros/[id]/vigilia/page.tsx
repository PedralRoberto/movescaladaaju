import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Eye } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionRole } from '@/lib/auth-guard'
import { nomeRetiro } from '@/lib/retiro-utils'
import { VigíliaGrid } from '@/components/admin/vigilia-grid'
import { BackButton } from '@/components/admin/back-button'
import type { VigiliaMaterial, PresencaResponsavel } from '@/types/database'

export default async function VigíliaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if ((await getSessionRole()) === 'secretaria_encontro') redirect(`/admin/retiros/${id}`)
  const supabase = createAdminClient()

  const [
    { data: retiro, error: retiroError },
    { data: inscritos, error: inscritosError },
    { data: reunioes },
  ] = await Promise.all([
    supabase.from('retiros').select('*').eq('id', id).single(),
    supabase
      .from('inscricoes')
      .select('id, nome_completo, nome_responsavel')
      .eq('retiro_id', id)
      .neq('status', 'cancelado')
      .order('nome_completo'),
    supabase
      .from('reunioes_previas')
      .select('id, numero, data')
      .eq('retiro_id', id)
      .order('numero'),
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
  const reunioesList = reunioes ?? []
  const inscritoIds = inscritosList.map((i) => i.id)
  const reuniaoIds = reunioesList.map((r) => r.id)

  const [{ data: materiais }, { data: presencasResp }] = await Promise.all([
    inscritoIds.length > 0
      ? supabase.from('vigilia_materiais').select('*').in('inscricao_id', inscritoIds)
      : { data: [] as VigiliaMaterial[] },
    inscritoIds.length > 0 && reuniaoIds.length > 0
      ? supabase
          .from('presencas_responsavel')
          .select('inscricao_id, reuniao_id, presente')
          .in('inscricao_id', inscritoIds)
      : { data: [] as PresencaResponsavel[] },
  ])

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
        <BackButton />
        <Link href="/admin/retiros" className="hover:text-zinc-600">Retiros</Link>
        <span>/</span>
        <Link href={`/admin/retiros/${id}`} className="hover:text-zinc-600 truncate max-w-xs">
          {nome}
        </Link>
        <span>/</span>
        <span className="text-zinc-600 font-medium">Fotos + Cartas</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
          <Eye className="h-5 w-5 text-teal-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Fotos + Cartas</h1>
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
        Marque fotos e cartas conforme os materiais forem entregues. As colunas
        <span className="font-medium text-zinc-500"> Resp. Nª</span> registram se o responsável compareceu
        à preparatória — útil para identificar quem precisa de acompanhamento extra.
        Mínimo: 3 fotos e 5 cartas.
      </p>

      {/* Grid unificado */}
      <VigíliaGrid
        retiroId={id}
        inscritos={inscritosList}
        materiais={materiais ?? []}
        reunioes={reunioesList}
        presencasResp={presencasResp ?? []}
      />
    </div>
  )
}
