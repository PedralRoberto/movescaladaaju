import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Apenas admins podem restaurar backups.' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Arquivo inválido.' }, { status: 400 })
  }

  if (body.version !== 1 || body.retiro_id !== id) {
    return NextResponse.json(
      { error: 'Este backup não pertence a este retiro.' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  // Deleta dados existentes (CASCADE cuida das tabelas filhas)
  await admin.from('reunioes_previas').delete().eq('retiro_id', id)
  await admin.from('inscricoes').delete().eq('retiro_id', id)

  // Restaura retiro
  const { error: retiroErr } = await admin
    .from('retiros')
    .update(body.retiro as object)
    .eq('id', id)
  if (retiroErr) return NextResponse.json({ error: 'Erro ao restaurar retiro.' }, { status: 500 })

  // Restaura tabelas na ordem correta de FK
  const steps: Array<{ table: string; rows: unknown[] }> = [
    { table: 'reunioes_previas', rows: (body.reunioes_previas as unknown[]) ?? [] },
    { table: 'inscricoes', rows: (body.inscricoes as unknown[]) ?? [] },
    { table: 'presencas', rows: (body.presencas as unknown[]) ?? [] },
    {
      table: 'pagamentos',
      // registrado_por referencia auth.users — nulificado para evitar FK quebrada
      rows: ((body.pagamentos as Record<string, unknown>[]) ?? []).map((p) => ({
        ...p,
        registrado_por: null,
      })),
    },
    { table: 'vigilia_materiais', rows: (body.vigilia_materiais as unknown[]) ?? [] },
    { table: 'presencas_responsavel', rows: (body.presencas_responsavel as unknown[]) ?? [] },
  ]

  for (const { table, rows } of steps) {
    if (rows.length === 0) continue
    const { error } = await admin.from(table).insert(rows)
    if (error) {
      return NextResponse.json(
        { error: `Erro ao restaurar ${table}: ${error.message}` },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ ok: true })
}
