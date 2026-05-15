import type { Retiro } from '@/types/database'

export function slugRetiro(
  retiro: Pick<Retiro, 'tipo' | 'polo' | 'numero' | 'ano'>
): string {
  return `${retiro.tipo}-${retiro.polo}-${retiro.numero}-${retiro.ano}`
}

export function parseSlugRetiro(
  slug: string
): { tipo: string; polo: string; numero: number; ano: number } | null {
  const parts = slug.split('-')
  if (parts.length !== 4) return null
  const [tipo, polo, numeroStr, anoStr] = parts
  const numero = Number(numeroStr)
  const ano = Number(anoStr)
  if (!tipo || !polo || !numero || !ano) return null
  return { tipo, polo, numero, ano }
}

export function nomeRetiro(
  retiro: Pick<Retiro, 'tipo' | 'polo' | 'numero'>
): string {
  const polo = retiro.polo === 'grageru' ? 'Grageru' : 'Atalaia'
  if (retiro.tipo === 'master') {
    return `${retiro.numero}ª Escalada Master — Grageru`
  }
  return `${retiro.numero}ª Escalada Regular — ${polo}`
}

export function statusLabel(status: Retiro['status']): string {
  const map: Record<Retiro['status'], string> = {
    preparacao: 'Em preparação',
    inscricoes_abertas: 'Inscrições abertas',
    inscricoes_encerradas: 'Inscrições encerradas',
    realizado: 'Realizado',
  }
  return map[status]
}

export function statusColor(status: Retiro['status']): string {
  const map: Record<Retiro['status'], string> = {
    preparacao: 'bg-zinc-100 text-zinc-600',
    inscricoes_abertas: 'bg-teal-100 text-teal-700',
    inscricoes_encerradas: 'bg-terracota-100 text-terracota-700',
    realizado: 'bg-zinc-100 text-zinc-500',
  }
  return map[status]
}
