import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

  const role = user.app_metadata?.role as string | undefined
  if (!['admin', 'secretaria_movimento'].includes(role ?? '')) {
    return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })
  }

  const admin = createAdminClient()

  const [
    { data: retiro },
    { data: reunioes },
    { data: inscricoes },
  ] = await Promise.all([
    admin.from('retiros').select('*').eq('id', id).single(),
    admin.from('reunioes_previas').select('*').eq('retiro_id', id),
    admin.from('inscricoes').select('*').eq('retiro_id', id),
  ])

  if (!retiro) return NextResponse.json({ error: 'Retiro não encontrado.' }, { status: 404 })

  const inscritoIds = (inscricoes ?? []).map((i) => i.id)
  const reuniaoIds = (reunioes ?? []).map((r) => r.id)

  const [
    { data: presencas },
    { data: pagamentos },
    { data: vigiliaMateriais },
    { data: presencasResp },
  ] = await Promise.all([
    inscritoIds.length && reuniaoIds.length
      ? admin.from('presencas').select('*').in('inscricao_id', inscritoIds)
      : { data: [] },
    inscritoIds.length
      ? admin.from('pagamentos').select('*').in('inscricao_id', inscritoIds)
      : { data: [] },
    inscritoIds.length
      ? admin.from('vigilia_materiais').select('*').in('inscricao_id', inscritoIds)
      : { data: [] },
    inscritoIds.length
      ? admin.from('presencas_responsavel').select('*').in('inscricao_id', inscritoIds)
      : { data: [] },
  ])

  const backup = {
    version: 1,
    exported_at: new Date().toISOString(),
    retiro_id: id,
    retiro,
    reunioes_previas: reunioes ?? [],
    inscricoes: inscricoes ?? [],
    presencas: presencas ?? [],
    pagamentos: pagamentos ?? [],
    vigilia_materiais: vigiliaMateriais ?? [],
    presencas_responsavel: presencasResp ?? [],
  }

  const slug = `${retiro.tipo}-${retiro.numero}-${retiro.ano}`
  const filename = `backup-${slug}-${new Date().toISOString().slice(0, 10)}.json`

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
