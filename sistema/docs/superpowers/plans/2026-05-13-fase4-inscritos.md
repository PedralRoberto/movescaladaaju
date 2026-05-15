# Fase 4 — Módulo de Inscritos: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o módulo completo de Inscritos — listagem, ficha individual, troca de status e atualização da página de detalhe do retiro com contagens reais e card de Inscritos desbloqueado.

**Architecture:** Server Components para listagem e ficha, com um Client Component isolado (`StatusSelector`) para interatividade de troca de status via Server Action. Queries de dados exclusivamente via `createAdminClient()` (síncrono). Loading e error boundaries para cada rota nova.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase (service role via `createAdminClient`)

---

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `lib/inscricao-utils.ts` | Criar | Labels e cores de status/modalidade |
| `app/admin/(dashboard)/retiros/[id]/inscritos/page.tsx` | Criar | Listagem de inscritos do retiro |
| `app/admin/(dashboard)/retiros/[id]/inscritos/actions.ts` | Criar | Server Action updateInscricaoStatus |
| `app/admin/(dashboard)/retiros/[id]/inscritos/loading.tsx` | Criar | Skeleton da listagem |
| `app/admin/(dashboard)/retiros/[id]/inscritos/error.tsx` | Criar | Error boundary da listagem |
| `app/admin/(dashboard)/retiros/[id]/inscritos/[inscricaoId]/page.tsx` | Criar | Ficha individual do inscrito |
| `app/admin/(dashboard)/retiros/[id]/inscritos/[inscricaoId]/loading.tsx` | Criar | Skeleton da ficha |
| `app/admin/(dashboard)/retiros/[id]/inscritos/[inscricaoId]/error.tsx` | Criar | Error boundary da ficha |
| `components/admin/status-selector.tsx` | Criar | Client Component select de status com feedback |
| `app/admin/(dashboard)/retiros/[id]/page.tsx` | Modificar | Contagens reais + card Inscritos desbloqueado |

---

## Task 1: Utilitários de inscrição

**Files:**
- Create: `lib/inscricao-utils.ts`

- [ ] **Criar o arquivo de utilitários**

```ts
// lib/inscricao-utils.ts
import type { InscricaoStatus, ModalidadePagamento } from '@/types/database'

export function inscricaoStatusLabel(status: InscricaoStatus): string {
  const map: Record<InscricaoStatus, string> = {
    inscrito: 'Inscrito',
    lista_espera: 'Lista de espera',
    confirmado: 'Confirmado',
    desclassificado: 'Desclassificado',
    cancelado: 'Cancelado',
  }
  return map[status]
}

export function inscricaoStatusColor(status: InscricaoStatus): string {
  const map: Record<InscricaoStatus, string> = {
    inscrito: 'bg-teal-100 text-teal-700',
    lista_espera: 'bg-amber-100 text-amber-700',
    confirmado: 'bg-emerald-100 text-emerald-700',
    desclassificado: 'bg-zinc-100 text-zinc-500',
    cancelado: 'bg-red-100 text-red-600',
  }
  return map[status]
}

export function modalidadeLabel(modalidade: ModalidadePagamento): string {
  const map: Record<ModalidadePagamento, string> = {
    padrao: 'Padrão (R$50 + R$200)',
    integral: 'Integral (R$250)',
    excecao: 'Exceção (R$250 no final)',
  }
  return map[modalidade]
}

export function modalidadeColor(modalidade: ModalidadePagamento): string {
  const map: Record<ModalidadePagamento, string> = {
    padrao: 'bg-zinc-100 text-zinc-600',
    integral: 'bg-teal-100 text-teal-700',
    excecao: 'bg-orange-100 text-orange-700',
  }
  return map[modalidade]
}
```

**Nota:** `terracota` não é uma cor padrão Tailwind v4, portanto usa-se `orange` como substituto seguro. Se o projeto tiver terracota configurado como cor customizada no CSS global, ajustar para `bg-terracota-100 text-terracota-700`.

- [ ] **Verificar tipos com tsc**

```bash
cd /Users/rpdesign/Documents/projetos/escalada/sistema && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros no novo arquivo.

---

## Task 2: Server Action — updateInscricaoStatus

**Files:**
- Create: `app/admin/(dashboard)/retiros/[id]/inscritos/actions.ts`

- [ ] **Criar a Server Action**

```ts
// app/admin/(dashboard)/retiros/[id]/inscritos/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { InscricaoStatus } from '@/types/database'

export async function updateInscricaoStatus(
  inscricaoId: string,
  retiroId: string,
  status: InscricaoStatus
): Promise<{ error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('inscricoes')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', inscricaoId)

  if (error) {
    return {
      error:
        process.env.NODE_ENV === 'development'
          ? `[${error.code}] ${error.message}`
          : 'Erro ao atualizar status. Tente novamente.',
    }
  }

  revalidatePath(`/admin/retiros/${retiroId}/inscritos`)
  revalidatePath(`/admin/retiros/${retiroId}/inscritos/${inscricaoId}`)

  return {}
}
```

- [ ] **Verificar tipos**

```bash
cd /Users/rpdesign/Documents/projetos/escalada/sistema && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros.

---

## Task 3: Client Component StatusSelector

**Files:**
- Create: `components/admin/status-selector.tsx`

Este componente é um `<select>` com todos os status possíveis. Ao mudar, submete um form que chama a Server Action. Exibe feedback inline de sucesso ou erro.

- [ ] **Criar o componente**

```tsx
// components/admin/status-selector.tsx
'use client'

import { useTransition, useState } from 'react'
import { updateInscricaoStatus } from '@/app/admin/(dashboard)/retiros/[id]/inscritos/actions'
import type { InscricaoStatus } from '@/types/database'
import { inscricaoStatusLabel } from '@/lib/inscricao-utils'

const STATUS_OPTIONS: InscricaoStatus[] = [
  'inscrito',
  'lista_espera',
  'confirmado',
  'desclassificado',
  'cancelado',
]

interface StatusSelectorProps {
  inscricaoId: string
  retiroId: string
  statusAtual: InscricaoStatus
}

export function StatusSelector({
  inscricaoId,
  retiroId,
  statusAtual,
}: StatusSelectorProps) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{
    tipo: 'sucesso' | 'erro'
    mensagem: string
  } | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const novoStatus = e.target.value as InscricaoStatus
    setFeedback(null)

    startTransition(async () => {
      const result = await updateInscricaoStatus(
        inscricaoId,
        retiroId,
        novoStatus
      )
      if (result.error) {
        setFeedback({ tipo: 'erro', mensagem: result.error })
      } else {
        setFeedback({ tipo: 'sucesso', mensagem: 'Status atualizado.' })
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <select
        defaultValue={statusAtual}
        onChange={handleChange}
        disabled={isPending}
        className="text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {inscricaoStatusLabel(s)}
          </option>
        ))}
      </select>

      {isPending && (
        <span className="text-xs text-zinc-400">Salvando…</span>
      )}

      {!isPending && feedback && (
        <span
          className={`text-xs font-medium ${
            feedback.tipo === 'sucesso'
              ? 'text-emerald-600'
              : 'text-red-600'
          }`}
        >
          {feedback.mensagem}
        </span>
      )}
    </div>
  )
}
```

- [ ] **Verificar tipos**

```bash
cd /Users/rpdesign/Documents/projetos/escalada/sistema && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros.

---

## Task 4: Página de listagem de inscritos

**Files:**
- Create: `app/admin/(dashboard)/retiros/[id]/inscritos/page.tsx`

- [ ] **Criar o Server Component de listagem**

```tsx
// app/admin/(dashboard)/retiros/[id]/inscritos/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Users } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { nomeRetiro } from '@/lib/retiro-utils'
import {
  inscricaoStatusLabel,
  inscricaoStatusColor,
  modalidadeLabel,
  modalidadeColor,
} from '@/lib/inscricao-utils'

export default async function InscritosPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const [{ data: retiro, error: retiroError }, { data: inscritos, error: inscritosError }] =
    await Promise.all([
      supabase.from('retiros').select('*').eq('id', id).single(),
      supabase
        .from('inscricoes')
        .select('*')
        .eq('retiro_id', id)
        .order('created_at', { ascending: false }),
    ])

  if (retiroError || !retiro) {
    notFound()
  }

  if (inscritosError) {
    throw new Error(
      process.env.NODE_ENV === 'development'
        ? `[${inscritosError.code}] ${inscritosError.message}`
        : 'Erro ao carregar inscritos. Tente novamente.'
    )
  }

  const lista = inscritos ?? []
  const nome = nomeRetiro(retiro)

  const totalInscritos = lista.filter(
    (i) => i.status === 'inscrito' || i.status === 'confirmado'
  ).length
  const confirmados = lista.filter((i) => i.status === 'confirmado').length
  const listaEspera = lista.filter((i) => i.status === 'lista_espera').length
  const vagasDisponiveis = retiro.vagas - totalInscritos

  const metricas = [
    { label: 'Total inscritos', valor: totalInscritos },
    { label: 'Confirmados', valor: confirmados },
    { label: 'Lista de espera', valor: listaEspera },
    { label: 'Vagas disponíveis', valor: vagasDisponiveis < 0 ? 0 : vagasDisponiveis },
  ]

  return (
    <div className="p-8 max-w-5xl">
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
        <span className="text-zinc-600 font-medium">Inscritos</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Inscritos</h1>
          <p className="text-zinc-500 mt-1 text-sm">{nome}</p>
        </div>
        <div
          title="Formulário público — Fase 7"
          className="cursor-not-allowed"
        >
          <span
            className={cn(
              buttonVariants(),
              'pointer-events-none opacity-40 select-none'
            )}
          >
            <Users className="h-4 w-4 mr-2" />
            Adicionar inscrito
          </span>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {metricas.map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
                {m.label}
              </p>
              <p className="text-2xl font-bold text-zinc-900">{m.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela ou empty state */}
      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-zinc-200">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-teal-400" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-1">
            Nenhum inscrito ainda
          </h2>
          <p className="text-zinc-500 text-sm">
            O formulário público será ativado na Fase 7.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="text-left px-6 py-3 font-medium text-zinc-500">Nome</th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">Telefone</th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">Bairro</th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">Modalidade</th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">Status</th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">Data</th>
                <th className="text-right px-6 py-3 font-medium text-zinc-500">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {lista.map((inscricao) => (
                <tr key={inscricao.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {inscricao.nome_completo}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{inscricao.telefone}</td>
                  <td className="px-6 py-4 text-zinc-600">{inscricao.bairro ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${modalidadeColor(inscricao.modalidade_pagamento)}`}
                    >
                      {modalidadeLabel(inscricao.modalidade_pagamento)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${inscricaoStatusColor(inscricao.status)}`}
                    >
                      {inscricaoStatusLabel(inscricao.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    {new Date(inscricao.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/retiros/${id}/inscritos/${inscricao.id}`}
                      className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Verificar tipos**

```bash
cd /Users/rpdesign/Documents/projetos/escalada/sistema && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros.

---

## Task 5: Loading e error da listagem

**Files:**
- Create: `app/admin/(dashboard)/retiros/[id]/inscritos/loading.tsx`
- Create: `app/admin/(dashboard)/retiros/[id]/inscritos/error.tsx`

- [ ] **Criar loading.tsx**

```tsx
// app/admin/(dashboard)/retiros/[id]/inscritos/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function InscritosLoading() {
  return (
    <div className="p-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-20" />
        <span className="text-zinc-300">/</span>
        <Skeleton className="h-4 w-48" />
        <span className="text-zinc-300">/</span>
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 p-4">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-3">
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-zinc-100 flex gap-8">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Criar error.tsx**

```tsx
// app/admin/(dashboard)/retiros/[id]/inscritos/error.tsx
'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function InscritosError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  const params = useParams()
  const retiroId = params.id as string

  return (
    <div className="p-8 flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-lg font-semibold text-zinc-900 mb-2">
        Erro ao carregar inscritos
      </h2>
      <p className="text-zinc-500 text-sm mb-6">
        Ocorreu um problema ao buscar os dados. Tente novamente.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => unstable_retry()}
          className="text-sm text-teal-600 hover:underline font-medium"
        >
          Tentar novamente
        </button>
        <span className="text-zinc-300">·</span>
        <Link
          href={`/admin/retiros/${retiroId}`}
          className="text-sm text-zinc-500 hover:underline"
        >
          Voltar para o retiro
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Verificar tipos**

```bash
cd /Users/rpdesign/Documents/projetos/escalada/sistema && npx tsc --noEmit 2>&1 | head -30
```

---

## Task 6: Ficha individual do inscrito

**Files:**
- Create: `app/admin/(dashboard)/retiros/[id]/inscritos/[inscricaoId]/page.tsx`

- [ ] **Criar o Server Component de ficha**

```tsx
// app/admin/(dashboard)/retiros/[id]/inscritos/[inscricaoId]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ClipboardList, CreditCard, Lock } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { nomeRetiro } from '@/lib/retiro-utils'
import {
  inscricaoStatusLabel,
  inscricaoStatusColor,
  modalidadeLabel,
  modalidadeColor,
} from '@/lib/inscricao-utils'
import { StatusSelector } from '@/components/admin/status-selector'

function formatarData(data: string | null): string {
  if (!data) return '—'
  return new Date(data).toLocaleDateString('pt-BR')
}

export default async function InscricaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string; inscricaoId: string }>
}) {
  const { id, inscricaoId } = await params
  const supabase = createAdminClient()

  const [{ data: retiro, error: retiroError }, { data: inscricao, error: inscricaoError }] =
    await Promise.all([
      supabase.from('retiros').select('*').eq('id', id).single(),
      supabase.from('inscricoes').select('*').eq('id', inscricaoId).single(),
    ])

  if (retiroError || !retiro || inscricaoError || !inscricao) {
    notFound()
  }

  const nome = nomeRetiro(retiro)

  const modulosFuturos = [
    {
      icon: <ClipboardList className="h-5 w-5 text-zinc-300" />,
      titulo: 'Chamada',
      descricao: 'Disponível na Fase 5',
    },
    {
      icon: <CreditCard className="h-5 w-5 text-zinc-300" />,
      titulo: 'Pagamentos',
      descricao: 'Disponível na Fase 6',
    },
  ]

  return (
    <div className="p-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6 flex-wrap">
        <Link
          href="/admin/retiros"
          className="hover:text-zinc-600 flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retiros
        </Link>
        <span>/</span>
        <Link href={`/admin/retiros/${id}`} className="hover:text-zinc-600 truncate max-w-[10rem]">
          {nome}
        </Link>
        <span>/</span>
        <Link href={`/admin/retiros/${id}/inscritos`} className="hover:text-zinc-600">
          Inscritos
        </Link>
        <span>/</span>
        <span className="text-zinc-600 font-medium truncate max-w-[12rem]">
          {inscricao.nome_completo}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            {inscricao.nome_completo}
          </h1>
          <div className="mt-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${inscricaoStatusColor(inscricao.status)}`}
            >
              {inscricaoStatusLabel(inscricao.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Selector de status */}
      <div className="mb-8">
        <StatusSelector
          inscricaoId={inscricao.id}
          retiroId={id}
          statusAtual={inscricao.status}
        />
      </div>

      <Separator className="mb-8" />

      {/* Dados pessoais */}
      <h2 className="text-base font-semibold text-zinc-900 mb-4">
        Dados pessoais
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Telefone
            </p>
            <p className="text-sm text-zinc-900">{inscricao.telefone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              E-mail
            </p>
            <p className="text-sm text-zinc-900">{inscricao.email ?? '—'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Bairro
            </p>
            <p className="text-sm text-zinc-900">{inscricao.bairro ?? '—'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Data de nascimento
            </p>
            <p className="text-sm text-zinc-900">
              {formatarData(inscricao.data_nascimento)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Data de inscrição
            </p>
            <p className="text-sm text-zinc-900">
              {formatarData(inscricao.created_at)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Modalidade de pagamento
            </p>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${modalidadeColor(inscricao.modalidade_pagamento)}`}
            >
              {modalidadeLabel(inscricao.modalidade_pagamento)}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Observações */}
      <h2 className="text-base font-semibold text-zinc-900 mb-3">
        Observações
      </h2>
      <Card className="mb-10">
        <CardContent className="pt-5 pb-5">
          <p className="text-sm text-zinc-700 whitespace-pre-wrap">
            {inscricao.observacoes ?? '—'}
          </p>
        </CardContent>
      </Card>

      {/* Módulos futuros */}
      <h2 className="text-base font-semibold text-zinc-900 mb-3">
        Módulos
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {modulosFuturos.map((modulo) => (
          <Card key={modulo.titulo} className="opacity-50">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                  {modulo.icon}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-zinc-500">
                      {modulo.titulo}
                    </p>
                    <Lock className="h-3 w-3 text-zinc-300" />
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {modulo.descricao}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Verificar tipos**

```bash
cd /Users/rpdesign/Documents/projetos/escalada/sistema && npx tsc --noEmit 2>&1 | head -30
```

---

## Task 7: Loading e error da ficha individual

**Files:**
- Create: `app/admin/(dashboard)/retiros/[id]/inscritos/[inscricaoId]/loading.tsx`
- Create: `app/admin/(dashboard)/retiros/[id]/inscritos/[inscricaoId]/error.tsx`

- [ ] **Criar loading.tsx**

```tsx
// app/admin/(dashboard)/retiros/[id]/inscritos/[inscricaoId]/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export default function InscricaoDetalheLoading() {
  return (
    <div className="p-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-16" />
        <span className="text-zinc-300">/</span>
        <Skeleton className="h-4 w-44" />
        <span className="text-zinc-300">/</span>
        <Skeleton className="h-4 w-16" />
        <span className="text-zinc-300">/</span>
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Header */}
      <div className="mb-4 space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>

      {/* Status selector */}
      <div className="mb-8">
        <Skeleton className="h-10 w-48 rounded-lg" />
      </div>

      <Separator className="mb-8" />

      {/* Dados pessoais */}
      <Skeleton className="h-5 w-32 mb-4" />
      <div className="grid grid-cols-2 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 p-5">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>

      {/* Observações */}
      <Skeleton className="h-5 w-24 mb-3" />
      <div className="rounded-xl border border-zinc-200 p-5 mb-10">
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      {/* Módulos */}
      <Skeleton className="h-5 w-20 mb-3" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 p-5">
            <div className="flex items-start gap-3">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Criar error.tsx**

```tsx
// app/admin/(dashboard)/retiros/[id]/inscritos/[inscricaoId]/error.tsx
'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function InscricaoDetalheError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  const params = useParams()
  const retiroId = params.id as string

  return (
    <div className="p-8 flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-lg font-semibold text-zinc-900 mb-2">
        Erro ao carregar inscrito
      </h2>
      <p className="text-zinc-500 text-sm mb-6">
        Ocorreu um problema ao buscar os dados. Tente novamente.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => unstable_retry()}
          className="text-sm text-teal-600 hover:underline font-medium"
        >
          Tentar novamente
        </button>
        <span className="text-zinc-300">·</span>
        <Link
          href={`/admin/retiros/${retiroId}/inscritos`}
          className="text-sm text-zinc-500 hover:underline"
        >
          Voltar para inscritos
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Verificar tipos**

```bash
cd /Users/rpdesign/Documents/projetos/escalada/sistema && npx tsc --noEmit 2>&1 | head -30
```

---

## Task 8: Atualizar página de detalhe do retiro

**Files:**
- Modify: `app/admin/(dashboard)/retiros/[id]/page.tsx`

Esta é a tarefa mais cirúrgica: três mudanças isoladas no arquivo existente.

**Mudança A — adicionar contagens ao Promise.all:**

Substituir:
```ts
const { data: retiro, error } = await supabase
  .from('retiros')
  .select('*')
  .eq('id', id)
  .single()

if (error || !retiro) {
  notFound()
}
```

Por:
```ts
const [
  { data: retiro, error: retiroError },
  { count: totalInscritos },
  { count: listaEspera },
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
])

if (retiroError || !retiro) {
  notFound()
}
```

**Mudança B — adicionar cards de métricas de inscritos no grid:**

Após o card de "Ano", adicionar mais três cards:
```tsx
<Card>
  <CardContent className="pt-5 pb-5">
    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
      Inscritos
    </p>
    <p className="text-sm text-zinc-900">{totalInscritos ?? 0}</p>
  </CardContent>
</Card>

<Card>
  <CardContent className="pt-5 pb-5">
    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
      Lista de espera
    </p>
    <p className="text-sm text-zinc-900">{listaEspera ?? 0}</p>
  </CardContent>
</Card>

<Card>
  <CardContent className="pt-5 pb-5">
    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
      Vagas disponíveis
    </p>
    <p className="text-sm text-zinc-900">
      {Math.max(0, retiro.vagas - (totalInscritos ?? 0))}
    </p>
  </CardContent>
</Card>
```

**Mudança C — substituir o item Inscritos em `modulosFuturos` por card clicável:**

Remover "Inscritos" do array `modulosFuturos`. Antes da renderização de `modulosFuturos`, adicionar o card clicável separadamente. O resultado final da seção "Módulos" deve ficar assim:

```tsx
{/* Módulos */}
<div>
  <h2 className="text-base font-semibold text-zinc-900 mb-3">
    Módulos
  </h2>
  <div className="grid grid-cols-3 gap-4">
    {/* Card de Inscritos — ativo */}
    <Link href={`/admin/retiros/${id}/inscritos`} className="block">
      <Card className="hover:border-teal-300 hover:shadow-sm transition-all cursor-pointer">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-teal-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">Inscritos</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {totalInscritos ?? 0} inscrito(s)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>

    {/* Cards travados */}
    {modulosFuturos.map((modulo) => (
      <Card key={modulo.titulo} className="opacity-50">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
              {modulo.icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-zinc-500">
                  {modulo.titulo}
                </p>
                <Lock className="h-3 w-3 text-zinc-300" />
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {modulo.descricao}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
</div>
```

Após esta mudança, o array `modulosFuturos` deve conter apenas "Chamada" e "Pagamentos". Remover "Inscritos" dele.

O import de `Link` já existe no arquivo. Não duplicar.

- [ ] **Aplicar as três mudanças no arquivo**

Editar `/Users/rpdesign/Documents/projetos/escalada/sistema/app/admin/(dashboard)/retiros/[id]/page.tsx` com as mudanças A, B e C descritas acima.

- [ ] **Verificar tipos**

```bash
cd /Users/rpdesign/Documents/projetos/escalada/sistema && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros.

---

## Task 9: Verificação final

- [ ] **Rodar tsc completo**

```bash
cd /Users/rpdesign/Documents/projetos/escalada/sistema && npx tsc --noEmit 2>&1
```

Esperado: saída vazia (zero erros).

- [ ] **Confirmar arquivos criados**

```bash
find "/Users/rpdesign/Documents/projetos/escalada/sistema/app/admin/(dashboard)/retiros/[id]/inscritos" -type f | sort
find "/Users/rpdesign/Documents/projetos/escalada/sistema/lib" -name "inscricao-utils.ts"
find "/Users/rpdesign/Documents/projetos/escalada/sistema/components/admin" -type f | sort
```

Esperado:
```
.../inscritos/[inscricaoId]/error.tsx
.../inscritos/[inscricaoId]/loading.tsx
.../inscritos/[inscricaoId]/page.tsx
.../inscritos/actions.ts
.../inscritos/error.tsx
.../inscritos/loading.tsx
.../inscritos/page.tsx
.../lib/inscricao-utils.ts
.../components/admin/nav-link.tsx
.../components/admin/sidebar-logout.tsx
.../components/admin/status-selector.tsx
```

- [ ] **Reportar ao usuário os arquivos criados/modificados e decisões não-óbvias tomadas**

---

## Decisões não-óbvias registradas

1. **`terracota` → `orange`:** Tailwind v4 não tem `terracota` por padrão. Usado `orange` para `excecao`. Se o projeto definir a cor custom no CSS global, basta trocar.

2. **`unstable_retry` no error boundary:** O projeto existente usa este nome (confirmado em `error.tsx` do `[id]`). Mantido por consistência mesmo sendo API instável.

3. **`useParams` no error boundary:** Como `error.tsx` não recebe `params` via props, usa `useParams()` do Next.js para extrair `retiroId` e montar o link de volta.

4. **`defaultValue` no select do `StatusSelector`:** Usado `defaultValue` (não `value`) para que o select seja uncontrolled — o revalidatePath vai atualizar a página inteira no próximo acesso, sem precisar gerenciar estado controlado do select.

5. **Grid do retiro passa de 2 colunas para 2 colunas com mais cards:** Os 3 novos cards de métricas (inscritos, espera, vagas) são adicionados ao mesmo grid `grid-cols-2`, mantendo consistência visual com os cards existentes.

6. **`head: true` nas queries de contagem:** Evita trazer dados desnecessários — retorna apenas o `count` sem payload.
