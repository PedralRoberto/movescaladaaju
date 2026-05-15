# Fase 3 — Módulo de Retiros — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o módulo completo de Retiros: listagem, formulário de criação e página de detalhe com transições de status via Server Actions.

**Architecture:** Server Components para listagem e detalhe (busca no Supabase em tempo de request); Client Component isolado apenas para o formulário de criação (requer interatividade no campo polo/tipo); Server Actions em arquivos separados por escopo (`retiros/actions.ts` para criação, `retiros/[id]/actions.ts` para status). Loading e error boundaries por rota.

**Tech Stack:** Next.js 16 App Router, Supabase (server client via `lib/supabase/server.ts`), shadcn/ui (Button, Card, CardContent, Badge, Input, Label, Separator, Skeleton), Tailwind v4 com paleta teal/terracota definida em `globals.css`.

---

## Mapa de Arquivos

| Arquivo | Responsabilidade | Criar/Modificar |
|---|---|---|
| `app/admin/(dashboard)/retiros/page.tsx` | Listagem de retiros (Server Component) | Criar |
| `app/admin/(dashboard)/retiros/loading.tsx` | Skeleton da listagem | Criar |
| `app/admin/(dashboard)/retiros/error.tsx` | Boundary de erro da listagem | Criar |
| `app/admin/(dashboard)/retiros/actions.ts` | Server Action: createRetiro | Criar |
| `app/admin/(dashboard)/retiros/novo/page.tsx` | Formulário de criação (Client Component) | Criar |
| `app/admin/(dashboard)/retiros/[id]/page.tsx` | Detalhe do retiro (Server Component) | Criar |
| `app/admin/(dashboard)/retiros/[id]/loading.tsx` | Skeleton do detalhe | Criar |
| `app/admin/(dashboard)/retiros/[id]/error.tsx` | Boundary de erro do detalhe | Criar |
| `app/admin/(dashboard)/retiros/[id]/actions.ts` | Server Action: updateRetiroStatus | Criar |

**Nada mais deve ser criado.** O NavLink de Retiros já existe no layout. Os tipos já existem. As utils já existem.

---

### Task 1: Server Actions — createRetiro

**Files:**
- Create: `app/admin/(dashboard)/retiros/actions.ts`

**Conhecimento necessário:**
- `redirect` lançado FORA de try/catch (lança exceção internamente — Next.js captura)
- `unique_violation` no Postgres tem code `'23505'`
- O cliente Supabase server é async: `await createClient()`

- [ ] **Step 1: Criar o arquivo de actions da listagem**

```typescript
// app/admin/(dashboard)/retiros/actions.ts
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { RetiroTipo, RetiroPolo, RetiroStatus } from '@/types/database'

export async function createRetiro(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const tipo = formData.get('tipo') as RetiroTipo
  const polo = formData.get('polo') as RetiroPolo
  const numero = Number(formData.get('numero'))
  const ano = Number(formData.get('ano'))
  const data_inicio = (formData.get('data_inicio') as string) || null
  const data_fim = (formData.get('data_fim') as string) || null
  const local_nome = (formData.get('local_nome') as string) || null
  const vagas = Number(formData.get('vagas'))
  const observacoes = (formData.get('observacoes') as string) || null

  // Validação server-side
  if (!tipo || !polo || !numero || !ano || !vagas) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }
  if (tipo === 'master' && polo !== 'grageru') {
    return { error: 'Escalada Master só ocorre no polo Grageru.' }
  }

  const { data, error } = await supabase
    .from('retiros')
    .insert({
      tipo,
      polo,
      numero,
      ano,
      data_inicio: data_inicio || null,
      data_fim: data_fim || null,
      local_nome: local_nome || null,
      vagas,
      observacoes: observacoes || null,
      status: 'preparacao' as RetiroStatus,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return {
        error:
          'Já existe um retiro deste tipo neste polo para o ano informado.',
      }
    }
    return { error: 'Erro ao criar retiro. Tente novamente.' }
  }

  redirect(`/admin/retiros/${data.id}`)
}
```

- [ ] **Step 2: Verificar que o arquivo foi criado corretamente**

```bash
npx tsc --noEmit 2>&1 | head -30
```

---

### Task 2: Server Action — updateRetiroStatus

**Files:**
- Create: `app/admin/(dashboard)/retiros/[id]/actions.ts`

- [ ] **Step 1: Criar o arquivo de actions do detalhe**

```typescript
// app/admin/(dashboard)/retiros/[id]/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { RetiroStatus } from '@/types/database'

export async function updateRetiroStatus(
  id: string,
  status: RetiroStatus
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('retiros')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    throw new Error('Erro ao atualizar status do retiro.')
  }

  revalidatePath('/admin/retiros')
  revalidatePath(`/admin/retiros/${id}`)
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

---

### Task 3: Listagem de Retiros — page.tsx

**Files:**
- Create: `app/admin/(dashboard)/retiros/page.tsx`

**Conhecimento necessário:**
- Server Component async — pode `await` diretamente
- `nomeRetiro`, `statusLabel`, `statusColor` importados de `lib/retiro-utils.ts`
- Badge sem componente shadcn dedicado — usar `<span>` com classes do `statusColor()`
- Botão "Novo retiro" usa `<Button asChild>` + `<Link>`

- [ ] **Step 1: Criar a página de listagem**

```typescript
// app/admin/(dashboard)/retiros/page.tsx
import Link from 'next/link'
import { Plus, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { nomeRetiro, statusLabel, statusColor } from '@/lib/retiro-utils'

export default async function RetirosPage() {
  const supabase = await createClient()

  const { data: retiros, error } = await supabase
    .from('retiros')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Erro ao carregar retiros.')
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Retiros</h1>
          <p className="text-zinc-500 mt-1">
            Gerencie os retiros do Movimento Escalada Aju
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/retiros/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo retiro
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      {retiros.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
            <CalendarDays className="h-8 w-8 text-teal-400" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-1">
            Nenhum retiro cadastrado ainda
          </h2>
          <p className="text-zinc-500 text-sm mb-6">
            Crie o primeiro retiro para começar a gestão.
          </p>
          <Button asChild>
            <Link href="/admin/retiros/novo">
              <Plus className="h-4 w-4 mr-2" />
              Criar primeiro retiro
            </Link>
          </Button>
        </div>
      ) : (
        /* Tabela */
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Nome
                </th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Ano
                </th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Vagas
                </th>
                <th className="text-left px-6 py-3 font-medium text-zinc-500">
                  Status
                </th>
                <th className="text-right px-6 py-3 font-medium text-zinc-500">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {retiros.map((retiro) => (
                <tr key={retiro.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {nomeRetiro(retiro)}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{retiro.ano}</td>
                  <td className="px-6 py-4 text-zinc-600">{retiro.vagas}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(retiro.status)}`}
                    >
                      {statusLabel(retiro.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/retiros/${retiro.id}`}>Ver</Link>
                    </Button>
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

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

---

### Task 4: Loading e Error da Listagem

**Files:**
- Create: `app/admin/(dashboard)/retiros/loading.tsx`
- Create: `app/admin/(dashboard)/retiros/error.tsx`

- [ ] **Step 1: Criar loading.tsx da listagem**

```typescript
// app/admin/(dashboard)/retiros/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function RetirosLoading() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-3">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="divide-y divide-zinc-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-6 py-4">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-8 w-12 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Criar error.tsx da listagem**

```typescript
// app/admin/(dashboard)/retiros/error.tsx
'use client'

export default function RetirosError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div className="p-8 flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-lg font-semibold text-zinc-900 mb-2">
        Erro ao carregar retiros
      </h2>
      <p className="text-zinc-500 text-sm mb-6">
        Ocorreu um problema ao buscar os dados. Tente novamente.
      </p>
      <button
        onClick={() => unstable_retry()}
        className="text-sm text-teal-600 hover:underline font-medium"
      >
        Tentar novamente
      </button>
    </div>
  )
}
```

---

### Task 5: Formulário de Criação — novo/page.tsx

**Files:**
- Create: `app/admin/(dashboard)/retiros/novo/page.tsx`

**Conhecimento necessário:**
- Client Component porque precisa de `useState` para reagir quando tipo muda
- `useActionState` do React para lidar com retorno da Server Action (`{ error?: string }`)
- Quando tipo = 'master', polo fica fixo em 'grageru' e disabled
- Pré-preenchimento: numero = 21 para regular, 10 para master; ano = ano atual

- [ ] **Step 1: Criar o formulário de criação**

```typescript
// app/admin/(dashboard)/retiros/novo/page.tsx
'use client'

import { useState, useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { createRetiro } from '../actions'

const ANO_ATUAL = new Date().getFullYear()

export default function NovoRetiroPage() {
  const [tipo, setTipo] = useState<'regular' | 'master'>('regular')
  const [state, formAction, isPending] = useActionState(createRetiro, null)

  const isMaster = tipo === 'master'
  const numeroDefault = isMaster ? 10 : 21

  return (
    <div className="p-8 max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/retiros"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para retiros
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">Novo retiro</h1>
        <p className="text-zinc-500 mt-1">
          Preencha os dados para cadastrar um novo retiro.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={formAction} className="space-y-5">
            {/* Erro global */}
            {state?.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

            {/* Tipo */}
            <div className="space-y-1.5">
              <Label htmlFor="tipo">Tipo *</Label>
              <select
                id="tipo"
                name="tipo"
                required
                value={tipo}
                onChange={(e) => setTipo(e.target.value as 'regular' | 'master')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="regular">Regular</option>
                <option value="master">Master</option>
              </select>
            </div>

            {/* Polo */}
            <div className="space-y-1.5">
              <Label htmlFor="polo">
                Polo *
                {isMaster && (
                  <span className="ml-2 text-xs text-zinc-400 font-normal">
                    (Master sempre no Grageru)
                  </span>
                )}
              </Label>
              <select
                id="polo"
                name="polo"
                required
                disabled={isMaster}
                value={isMaster ? 'grageru' : undefined}
                defaultValue="grageru"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="grageru">Grageru</option>
                <option value="atalaia">Atalaia</option>
              </select>
            </div>

            {/* Grid: Número + Ano */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="numero">Número do encontro *</Label>
                <Input
                  id="numero"
                  name="numero"
                  type="number"
                  min={1}
                  required
                  key={tipo} // força re-render quando tipo muda
                  defaultValue={numeroDefault}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ano">Ano *</Label>
                <Input
                  id="ano"
                  name="ano"
                  type="number"
                  min={2000}
                  max={2100}
                  required
                  defaultValue={ANO_ATUAL}
                />
              </div>
            </div>

            {/* Grid: Data início + Data fim */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="data_inicio">Data de início</Label>
                <Input id="data_inicio" name="data_inicio" type="date" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="data_fim">Data de fim</Label>
                <Input id="data_fim" name="data_fim" type="date" />
              </div>
            </div>

            {/* Local */}
            <div className="space-y-1.5">
              <Label htmlFor="local_nome">Local</Label>
              <Input
                id="local_nome"
                name="local_nome"
                type="text"
                placeholder="Ex: Convento São Francisco"
              />
            </div>

            {/* Vagas */}
            <div className="space-y-1.5">
              <Label htmlFor="vagas">Vagas *</Label>
              <Input
                id="vagas"
                name="vagas"
                type="number"
                min={1}
                required
                defaultValue={40}
              />
            </div>

            {/* Observações */}
            <div className="space-y-1.5">
              <Label htmlFor="observacoes">Observações</Label>
              <textarea
                id="observacoes"
                name="observacoes"
                rows={3}
                placeholder="Informações adicionais sobre o retiro..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? 'Salvando...' : 'Criar retiro'}
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/retiros">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

---

### Task 6: Detalhe do Retiro — [id]/page.tsx

**Files:**
- Create: `app/admin/(dashboard)/retiros/[id]/page.tsx`

**Conhecimento necessário:**
- `params` é uma Promise em Next.js 16 — usar `await params`
- `notFound()` chamado ANTES de qualquer await que possa suspender
- `updateRetiroStatus` precisa de `bind` para passar `id` e `status` ao Server Action via form
- Ícones para cards de módulos futuros: `Users`, `ClipboardList`, `CreditCard`

- [ ] **Step 1: Criar a página de detalhe**

```typescript
// app/admin/(dashboard)/retiros/[id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Users, ClipboardList, CreditCard, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { nomeRetiro, statusLabel, statusColor } from '@/lib/retiro-utils'
import { updateRetiroStatus } from './actions'
import type { RetiroStatus } from '@/types/database'

function formatarData(data: string | null): string {
  if (!data) return '—'
  return new Date(data).toLocaleDateString('pt-BR')
}

interface BotaoStatusProps {
  id: string
  status: RetiroStatus
}

function BotaoStatus({ id, status }: BotaoStatusProps) {
  if (status === 'realizado') return null

  const config: Record<
    Exclude<RetiroStatus, 'realizado'>,
    { label: string; proximo: RetiroStatus; variant: 'default' | 'outline' | 'secondary' }
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

  const { label, proximo, variant } = config[status as Exclude<RetiroStatus, 'realizado'>]
  const action = updateRetiroStatus.bind(null, id, proximo)

  return (
    <form action={action}>
      <Button type="submit" variant={variant}>
        {label}
      </Button>
    </form>
  )
}

const modulosFuturos = [
  {
    icon: <Users className="h-5 w-5 text-zinc-300" />,
    titulo: 'Inscritos',
    descricao: 'Disponível na Fase 4',
  },
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

export default async function RetiroDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: retiro, error } = await supabase
    .from('retiros')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !retiro) {
    notFound()
  }

  const nome = nomeRetiro(retiro)

  return (
    <div className="p-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
        <Link href="/admin/retiros" className="hover:text-zinc-600 flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Retiros
        </Link>
        <span>/</span>
        <span className="text-zinc-600 font-medium truncate max-w-xs">{nome}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{nome}</h1>
          <div className="mt-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(retiro.status)}`}
            >
              {statusLabel(retiro.status)}
            </span>
          </div>
        </div>
        <BotaoStatus id={retiro.id} status={retiro.status} />
      </div>

      <Separator className="mb-8" />

      {/* Grid de informações */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <Card>
          <CardContent className="pt-5 pb-5">
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
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Local
            </p>
            <p className="text-sm text-zinc-900">{retiro.local_nome ?? '—'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Vagas
            </p>
            <p className="text-sm text-zinc-900">{retiro.vagas}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
              Ano
            </p>
            <p className="text-sm text-zinc-900">{retiro.ano}</p>
          </CardContent>
        </Card>
      </div>

      {/* Módulos futuros */}
      <div>
        <h2 className="text-base font-semibold text-zinc-900 mb-3">
          Módulos
        </h2>
        <div className="grid grid-cols-3 gap-4">
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
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

---

### Task 7: Loading e Error do Detalhe

**Files:**
- Create: `app/admin/(dashboard)/retiros/[id]/loading.tsx`
- Create: `app/admin/(dashboard)/retiros/[id]/error.tsx`

- [ ] **Step 1: Criar loading.tsx do detalhe**

```typescript
// app/admin/(dashboard)/retiros/[id]/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export default function RetiroDetalheLoading() {
  return (
    <div className="p-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-20" />
        <span className="text-zinc-300">/</span>
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <Separator className="mb-8" />

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 p-5">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>

      {/* Módulos */}
      <Skeleton className="h-5 w-20 mb-3" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
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

- [ ] **Step 2: Criar error.tsx do detalhe**

```typescript
// app/admin/(dashboard)/retiros/[id]/error.tsx
'use client'

import Link from 'next/link'

export default function RetiroDetalheError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div className="p-8 flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-lg font-semibold text-zinc-900 mb-2">
        Erro ao carregar retiro
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
          href="/admin/retiros"
          className="text-sm text-zinc-500 hover:underline"
        >
          Voltar para retiros
        </Link>
      </div>
    </div>
  )
}
```

---

### Task 8: Verificação Final

**Files:** Todos os arquivos criados acima

- [ ] **Step 1: Rodar TypeScript**

```bash
cd /Users/rpdesign/Documents/projetos/escalada/sistema && npx tsc --noEmit 2>&1
```

Expected: sem erros. Se houver erros, corrigir antes de concluir.

- [ ] **Step 2: Verificar estrutura de arquivos criados**

```bash
find /Users/rpdesign/Documents/projetos/escalada/sistema/app/admin/\(dashboard\)/retiros -type f | sort
```

Expected:
```
.../retiros/actions.ts
.../retiros/error.tsx
.../retiros/loading.tsx
.../retiros/page.tsx
.../retiros/novo/page.tsx
.../retiros/[id]/actions.ts
.../retiros/[id]/error.tsx
.../retiros/[id]/loading.tsx
.../retiros/[id]/page.tsx
```

- [ ] **Step 3: Confirmar que nenhum arquivo proibido foi criado**

Não devem existir:
- `middleware.ts` (o projeto usa `proxy.ts`)
- `tailwind.config.ts` (cores via `globals.css`)
- Qualquer página de inscritos, chamada ou pagamentos

---

## Decisões de Design Registradas

1. **`useActionState` no formulário**: O hook `useActionState` do React 19 é usado para lidar com o estado de retorno da Server Action (erro ou pendente) de forma idiomática, sem estado separado para erro.

2. **`key={tipo}` no campo Número**: Forçar re-render do `<Input>` com `key` quando o tipo muda garante que o `defaultValue` seja aplicado novamente sem precisar de estado controlado.

3. **`BotaoStatus` como componente interno**: A lógica de `bind` + `<form action={action}>` para o botão de status fica encapsulada em um componente local da página de detalhe, evitando um arquivo Client Component separado apenas para isso.

4. **`revalidatePath` com literal vs. pattern**: Para `retiros`, usa-se literal `/admin/retiros` (sem segmento dinâmico) e literal `/admin/retiros/${id}` (path concreto), conforme a documentação — o pattern com `[id]` + `'page'` só seria necessário para invalidar todas as páginas de detalhe de uma vez.

5. **`select` nativo no formulário**: shadcn/ui não tem componente `Select` instalado neste projeto (não listado em `components/ui/`). Usa-se `<select>` nativo com classes que imitam o estilo do `<Input>` shadcn.
