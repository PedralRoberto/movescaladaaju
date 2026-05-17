export type RetiroTipo = 'regular' | 'master'
export type RetiroPolo = 'grageru' | 'atalaia'
export type RetiroStatus =
  | 'preparacao'
  | 'inscricoes_abertas'
  | 'inscricoes_encerradas'
  | 'realizado'
export type InscricaoStatus =
  | 'inscrito'
  | 'lista_espera'
  | 'confirmado'
  | 'desclassificado'
  | 'cancelado'
export type ModalidadePagamento = 'padrao' | 'integral' | 'excecao'
export type PagamentoTipo = 'entrada' | 'final' | 'integral'

export interface Retiro {
  id: string
  tipo: RetiroTipo
  polo: RetiroPolo
  numero: number
  ano: number
  data_inicio: string | null
  data_fim: string | null
  local_nome: string | null
  vagas: number
  status: RetiroStatus
  abertura_inscricoes: string | null
  chave_pix: string | null
  observacoes: string | null
  created_at: string
  updated_at: string
}

export interface ReuniaoPrevia {
  id: string
  retiro_id: string
  numero: number
  data: string
  local_nome: string | null
  observacoes: string | null
  created_at: string
}

export interface Inscricao {
  id: string
  retiro_id: string
  nome_completo: string
  apelido: string | null
  data_nascimento: string | null
  cpf: string | null
  telefone: string
  email: string | null
  bairro: string | null
  endereco: string | null
  instagram: string | null
  modalidade_pagamento: ModalidadePagamento
  status: InscricaoStatus
  chamada_excecao: boolean
  como_conheceu: string | null
  conhece_alguem: string | null
  sacramentos: string[]
  instrumento_musical: string | null
  condicao_saude: string | null
  outra_condicao_saude: string | null
  medicacao_continua: string | null
  menor_de_idade: boolean
  nome_responsavel: string | null
  contato_responsavel: string | null
  email_responsavel: string | null
  comprovante_pagamento_url: string | null
  documento_identificacao_url: string | null
  observacoes: string | null
  reembolsado: boolean | null
  data_desistencia: string | null
  created_at: string
  updated_at: string
}

export interface Presenca {
  id: string
  inscricao_id: string
  reuniao_id: string
  presente: boolean
  observacoes: string | null
  registrado_em: string
}

export interface VigiliaMaterial {
  id: string
  inscricao_id: string
  foto_crianca: boolean
  foto_adolescente: boolean
  foto_atual: boolean
  cartas_recebidas: number
  observacoes: string | null
  updated_at: string
  created_at: string
}

export interface PresencaResponsavel {
  id: string
  inscricao_id: string
  reuniao_id: string
  presente: boolean
  created_at: string
  updated_at: string
}

export interface Pagamento {
  id: string
  inscricao_id: string
  tipo: PagamentoTipo
  valor: number
  data_pagamento: string
  comprovante_url: string | null
  observacoes: string | null
  registrado_por: string | null
  created_at: string
}
