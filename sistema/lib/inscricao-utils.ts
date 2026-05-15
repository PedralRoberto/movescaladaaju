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
    padrao: 'Padrao (R$50 + R$200)',
    integral: 'Integral (R$250)',
    excecao: 'Excecao (R$250 no final)',
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
