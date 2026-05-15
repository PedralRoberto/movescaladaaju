'use client'

import { useState, useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { createRetiro } from '../actions'

const ANO_ATUAL = new Date().getFullYear()

const SELECT_CLASS =
  'flex h-11 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-9 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
    </div>
  )
}

export default function NovoRetiroPage() {
  const [tipo, setTipo] = useState<'regular' | 'master'>('regular')
  const [state, formAction, isPending] = useActionState(createRetiro, null)

  const isMaster = tipo === 'master'
  const numeroDefault = isMaster ? 10 : 21

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
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
              <SelectWrapper>
                <select
                  id="tipo"
                  name="tipo"
                  required
                  value={tipo}
                  onChange={(e) =>
                    setTipo(e.target.value as 'regular' | 'master')
                  }
                  className={SELECT_CLASS}
                >
                  <option value="regular">Regular</option>
                  <option value="master">Master</option>
                </select>
              </SelectWrapper>
            </div>

            {/* Bairro (campo polo no DB) */}
            <div className="space-y-1.5">
              <Label htmlFor="polo">
                Bairro *
                {isMaster && (
                  <span className="ml-2 text-xs text-zinc-400 font-normal">
                    (Master sempre no Grageru)
                  </span>
                )}
              </Label>
              <SelectWrapper>
                <select
                  id="polo"
                  name="polo"
                  required
                  disabled={isMaster}
                  value={isMaster ? 'grageru' : undefined}
                  defaultValue="grageru"
                  className={SELECT_CLASS}
                >
                  <option value="grageru">Grageru</option>
                  <option value="atalaia">Atalaia</option>
                </select>
              </SelectWrapper>
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
                  key={tipo}
                  defaultValue={numeroDefault}
                  className="h-11"
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
                  className="h-11"
                />
              </div>
            </div>

            {/* Grid: Data início + Data fim */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="data_inicio">Data de início</Label>
                <Input
                  id="data_inicio"
                  name="data_inicio"
                  type="date"
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="data_fim">Data de fim</Label>
                <Input
                  id="data_fim"
                  name="data_fim"
                  type="date"
                  className="h-11"
                />
              </div>
            </div>

            {/* Abertura das inscrições */}
            <div className="space-y-1.5">
              <Label htmlFor="abertura_inscricoes">
                Abertura das inscrições
              </Label>
              <Input
                id="abertura_inscricoes"
                name="abertura_inscricoes"
                type="datetime-local"
                className="h-11"
              />
              <p className="text-xs text-zinc-400">
                O formulário público só ficará visível a partir desta data e
                hora (horário de Brasília).
              </p>
            </div>

            {/* Local */}
            <div className="space-y-1.5">
              <Label htmlFor="local_nome">Local</Label>
              <Input
                id="local_nome"
                name="local_nome"
                type="text"
                placeholder="Ex: Convento São Francisco"
                className="h-11"
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
                className="h-11"
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
                className="flex w-full rounded-md border border-input bg-background px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="flex-1"
              >
                {isPending ? 'Salvando...' : 'Criar retiro'}
              </Button>
              <Link
                href="/admin/retiros"
                className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
              >
                Cancelar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
