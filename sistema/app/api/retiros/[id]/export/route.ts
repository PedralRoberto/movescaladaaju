import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionRole } from '@/lib/auth-guard'
import { nomeRetiro } from '@/lib/retiro-utils'
import {
  inscricaoStatusLabel,
  modalidadeLabel,
} from '@/lib/inscricao-utils'
import {
  TOTAL_OWED,
  calcPagamentoSituacao,
  pagamentoSituacaoLabel,
} from '@/lib/pagamento-utils'

function formatarData(data: string | null): string {
  if (!data) return ''
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
}

function sim(v: boolean): string {
  return v ? 'Sim' : 'Não'
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Auth check
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) {
    return new NextResponse('Não autorizado', { status: 401 })
  }

  if ((await getSessionRole()) === 'secretaria_encontro') {
    return new NextResponse('Sem permissão.', { status: 403 })
  }

  const supabase = createAdminClient()

  const [
    { data: retiro },
    { data: reunioes },
    { data: inscricoes, error: inscritosError },
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

  if (!retiro || inscritosError) {
    return new NextResponse('Erro ao buscar dados', { status: 500 })
  }

  const inscricoesList = inscricoes ?? []
  const reunioesList = reunioes ?? []
  const reuniaoIds = reunioesList.map((r) => r.id)
  const inscricaoIds = inscricoesList.map((i) => i.id)

  const [{ data: presencas }, { data: pagamentos }] = await Promise.all([
    reuniaoIds.length > 0
      ? supabase.from('presencas').select('*').in('reuniao_id', reuniaoIds)
      : { data: [] },
    inscricaoIds.length > 0
      ? supabase.from('pagamentos').select('*').in('inscricao_id', inscricaoIds)
      : { data: [] },
  ])

  // Indexar por inscricao_id
  const presencaIdx: Record<string, Record<string, boolean>> = {}
  for (const p of presencas ?? []) {
    if (!presencaIdx[p.inscricao_id]) presencaIdx[p.inscricao_id] = {}
    presencaIdx[p.inscricao_id][p.reuniao_id] = p.presente
  }

  const pagamentoIdx: Record<string, number> = {}
  for (const p of pagamentos ?? []) {
    pagamentoIdx[p.inscricao_id] =
      (pagamentoIdx[p.inscricao_id] ?? 0) + Number(p.valor)
  }

  // Cabeçalhos
  const headers = [
    'Nº',
    'Nome',
    'Telefone',
    'E-mail',
    'Bairro',
    'Data de Nascimento',
    'Modalidade',
    'Status',
    'Prep1',
    'Prep2',
    'Prep3',
    'Prep4',
    'Preparatórias',
    'Situação Chamada',
    'Exceção Chamada',
    'Pago (R$)',
    'Total (R$)',
    'Situação Pagamento',
  ]

  const rows = inscricoesList.map((ins, idx) => {
    const presMap = presencaIdx[ins.id] ?? {}
    const excecao = ins.chamada_excecao ?? false

    const presencasPorNumero = [1, 2, 3, 4].map((n) => {
      const reuniao = reunioesList.find((r) => r.numero === n)
      if (!reuniao) return '—'
      return sim(presMap[reuniao.id] ?? false)
    })

    const totalPresente = reunioesList.filter(
      (r) => presMap[r.id] === true
    ).length

    const situacaoChamada = excecao
      ? 'Exceção'
      : totalPresente >= 2
        ? 'Apto'
        : 'Desclassificado'

    const totalPago = pagamentoIdx[ins.id] ?? 0
    const sitPagamento = pagamentoSituacaoLabel(calcPagamentoSituacao(totalPago))

    return [
      idx + 1,
      ins.nome_completo,
      ins.telefone,
      ins.email ?? '',
      ins.bairro ?? '',
      formatarData(ins.data_nascimento),
      modalidadeLabel(ins.modalidade_pagamento),
      inscricaoStatusLabel(ins.status),
      ...presencasPorNumero,
      `${totalPresente}/${reunioesList.length}`,
      situacaoChamada,
      sim(excecao),
      totalPago.toFixed(2),
      TOTAL_OWED.toFixed(2),
      sitPagamento,
    ]
  })

  // Montar workbook
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

  // Larguras aproximadas das colunas
  ws['!cols'] = [
    { wch: 4 },   // Nº
    { wch: 30 },  // Nome
    { wch: 16 },  // Telefone
    { wch: 24 },  // E-mail
    { wch: 18 },  // Bairro
    { wch: 18 },  // Data nasc
    { wch: 14 },  // Modalidade
    { wch: 16 },  // Status
    { wch: 5 },   // R1-R4
    { wch: 5 },
    { wch: 5 },
    { wch: 5 },
    { wch: 10 },  // Reuniões
    { wch: 16 },  // Situação chamada
    { wch: 14 },  // Exceção
    { wch: 10 },  // Pago
    { wch: 10 },  // Total
    { wch: 18 },  // Situação pag
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Inscritos')

  const nomeArquivo = nomeRetiro(retiro)
    .replace(/[^a-zA-Z0-9À-ÿ\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${nomeArquivo}.xlsx"`,
    },
  })
}
