import type { ModalidadePagamento, PagamentoTipo } from '@/types/database'

export const TOTAL_OWED = 250

export type PagamentoSituacao = 'pendente' | 'parcial' | 'quitado'

export function calcPagamentoSituacao(totalPago: number): PagamentoSituacao {
  if (totalPago <= 0) return 'pendente'
  if (totalPago < TOTAL_OWED) return 'parcial'
  return 'quitado'
}

export function pagamentoSituacaoLabel(situacao: PagamentoSituacao): string {
  const map: Record<PagamentoSituacao, string> = {
    pendente: 'Pendente',
    parcial: 'Parcial',
    quitado: 'Quitado',
  }
  return map[situacao]
}

export function pagamentoSituacaoColor(situacao: PagamentoSituacao): string {
  const map: Record<PagamentoSituacao, string> = {
    pendente: 'bg-red-100 text-red-600',
    parcial: 'bg-amber-100 text-amber-700',
    quitado: 'bg-emerald-100 text-emerald-700',
  }
  return map[situacao]
}

export function pagamentoTipoLabel(tipo: PagamentoTipo): string {
  const map: Record<PagamentoTipo, string> = {
    entrada: 'Entrada',
    final: 'Final',
    integral: 'Integral',
  }
  return map[tipo]
}

export function tiposDisponiveis(modalidade: ModalidadePagamento): PagamentoTipo[] {
  if (modalidade === 'padrao') return ['entrada', 'final']
  if (modalidade === 'integral') return ['integral']
  return ['final'] // excecao
}

export function valorSugerido(
  tipo: PagamentoTipo,
  modalidade: ModalidadePagamento
): number {
  if (tipo === 'entrada') return 50
  if (tipo === 'integral') return 250
  return modalidade === 'padrao' ? 200 : 250
}
