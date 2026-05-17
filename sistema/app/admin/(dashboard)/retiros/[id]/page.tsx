import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Users, ClipboardList, CreditCard, Download, Eye } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { nomeRetiro, statusLabel, statusColor, slugRetiro } from '@/lib/retiro-utils'
import { updateRetiroStatus } from './actions'
import { ArquivarInscritos } from '@/components/admin/arquivar-inscritos'
import { CopiarLink } from '@/components/admin/copiar-link'
import type { RetiroStatus } from '@/types/database'


function formatarData(data: string | null): string {
  if (!data) return '—'
  return new Date(data).toLocaleDateString('pt-BR')
}

function formatarDataHora(data: string | null): string {
  if (!data) return '—'
  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Maceio',
  })
}

interface BotaoStatusProps {
  id: string
  status: RetiroStatus
}

function BotaoStatus({ id, status }: BotaoStatusProps) {
  if (status === 'realizado') return null

  const config: Record<
    Exclude<RetiroStatus, 'realizado'>,
    {
      label: string
      proximo: RetiroStatus
      variant: 'default' | 'outline' | 'secondary'
    }
  > = {
    preparacao: {
      label: 'Abrir inscrições',
      proximo: 'inscricoes_abertas',
      variant: 'default',
    },
    inscricoes_abertas: {
      label: 'Encerrar inscrições',
      proximo: 'inscricoes_encerradas',
      variant: 'outline',
    },
    inscricoes_encerradas: {
      label: 'Marcar como realizado',
      proximo: 'realizado',
      variant: 'secondary',
    },
  }

  const { label, proximo, variant } =
    config[status as Exclude<RetiroStatus, 'realizado'>]
  const action = updateRetiroStatus.bind(null, id, proximo)

  return (
    <form action={action}>
      <Button type="submit" variant={variant} className="whitespace-nowrap">
        {label}
      </Button>
    </form>
  )
}

export default async function RetiroDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const [
    { data: retiro, error: retiroError },
    { count: totalInscritos },
    { count: listaEspera },
    { count: totalReunioes },
  ] = await Promise.all([
    supabase.from('retiros').select('*').eq('id', id).single(),
    supabase
      .from('inscricoes')
      .select('*', { count: 'exact', head: true })
      .eq('retiro_id', id)
      .in('status', ['inscrito', 'confirmado']),
    supabase
      .from('inscricoes')
      .select('*', { count: 'exact', head: true })
      .eq('retiro_id', id)
      .eq('status', 'lista_espera'),
    supabase
      .from('reunioes_previas')
      .select('*', { count: 'exact', head: true })
      .eq('retiro_id', id),
  ])

  if (retiroError || !retiro) {
    notFound()
  }

  const nome = nomeRetiro(retiro)

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
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
        <span className="text-zinc-600 font-medium truncate max-w-xs">
          {nome}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{nome}</h1>
          <div className="mt-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusColor(retiro.status)}`}
            >
              {statusLabel(retiro.status)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          <a
            href={`/api/retiros/${retiro.id}/export`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 border border-zinc-200 hover:border-zinc-300 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar Excel
          </a>
          <BotaoStatus id={retiro.id} status={retiro.status} />
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Link de inscrição */}
      <div className="mb-8">
        <p className="text-xs font-medium text-zinc-500 mb-2">
          Link de inscrição
        </p>
        <CopiarLink path={`/inscricao/${slugRetiro(retiro)}`} />
      </div>

      {/* Grid de informações */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Datas
            </p>
            <p className="text-sm text-zinc-900">
              {formatarData(retiro.data_inicio)}
              {' → '}
              {formatarData(retiro.data_fim)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Local
            </p>
            <p className="text-sm text-zinc-900">{retiro.local_nome ?? '—'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Vagas
            </p>
            <p className="text-sm text-zinc-900">{retiro.vagas}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Ano
            </p>
            <p className="text-sm text-zinc-900">{retiro.ano}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Inscritos
            </p>
            <p className="text-sm text-zinc-900">{totalInscritos ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Lista de espera
            </p>
            <p className="text-sm text-zinc-900">{listaEspera ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Vagas disponíveis
            </p>
            <p className="text-sm text-zinc-900">
              {Math.max(0, retiro.vagas - (totalInscritos ?? 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Abertura das inscrições
            </p>
            <p className="text-sm text-zinc-900">
              {formatarDataHora(retiro.abertura_inscricoes)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Módulos */}
      <div>
        <h2 className="text-base font-semibold text-zinc-900 mb-3">
          Módulos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Card de Inscritos — ativo */}
          <Link href={`/admin/retiros/${id}/inscritos`} className="block">
            <Card className="hover:border-teal-300 hover:shadow-sm transition-all cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      Inscritos
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {totalInscritos ?? 0} inscrito(s)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card de Preparatórias — ativo */}
          <Link href={`/admin/retiros/${id}/chamada`} className="block">
            <Card className="hover:border-teal-300 hover:shadow-sm transition-all cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <ClipboardList className="h-5 w-5 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      Preparatórias
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {totalReunioes ?? 0}/4 preparatória(s)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card de Pagamentos — ativo */}
          <Link href={`/admin/retiros/${id}/pagamentos`} className="block">
            <Card className="hover:border-teal-300 hover:shadow-sm transition-all cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <CreditCard className="h-5 w-5 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      Pagamentos
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Controle financeiro
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card de Vigília */}
          <Link href={`/admin/retiros/${id}/vigilia`} className="block">
            <Card className="hover:border-teal-300 hover:shadow-sm transition-all cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <Eye className="h-5 w-5 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      Vigília
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Fotos e cartas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Pós-retiro — só visível quando realizado */}
      {retiro.status === 'realizado' && (
        <div className="mt-10">
          <Separator className="mb-8" />
          <h2 className="text-base font-semibold text-zinc-900 mb-1">
            Pós-retiro
          </h2>
          <p className="text-sm text-zinc-400 mb-6">
            Exporte os dados antes de apagar. O Excel é o registro permanente do retiro.
          </p>
          <div className="flex flex-col gap-4">
            <a
              href={`/api/retiros/${retiro.id}/export`}
              className="inline-flex items-center gap-2 self-start text-sm font-medium text-zinc-700 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300 bg-white px-4 py-2.5 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              Exportar lista em Excel
            </a>
            <ArquivarInscritos
              retiroId={retiro.id}
              totalInscritos={totalInscritos ?? 0}
            />
          </div>
        </div>
      )}
    </div>
  )
}
