'use client'

import { useState, useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { submeterInscricao } from './actions'

interface RetiroInfo {
  id: string
  nome: string
  vagas: number
  inscritos: number
  chave_pix: string | null
  tipo: 'regular' | 'master'
}

interface InscricaoFormProps {
  retiros: RetiroInfo[]
}

const MODALIDADES = [
  {
    value: 'padrao',
    label: 'Padrão',
    descricao: 'R$ 50 na inscrição + R$ 200 no retiro. Recebe RIFA.',
  },
  {
    value: 'integral',
    label: 'Integral',
    descricao: 'R$ 250 pagos na inscrição. Não recebe RIFA.',
  },
]

const SACRAMENTOS_OPTIONS = [
  { value: 'batismo', label: 'Batismo' },
  { value: 'eucaristia', label: 'Eucaristia' },
  { value: 'crisma', label: 'Crisma' },
  { value: 'matrimonio', label: 'Matrimônio' },
  { value: 'nenhum', label: 'Nenhum' },
]

const COMO_CONHECEU_OPTIONS = [
  'Amigos ou familiares',
  'Redes sociais',
  'Paróquia / Igreja',
  'Convidado por alguém do Movimento',
  'Outro',
]

const IN =
  'w-full text-base border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50'

function Rotulo({
  children,
  required,
}: {
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

function Secao({ titulo }: { titulo: string }) {
  return (
    <div className="border-t border-zinc-100 pt-5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-4">
        {titulo}
      </p>
    </div>
  )
}

export function InscricaoForm({ retiros }: InscricaoFormProps) {
  const [state, formAction, isPending] = useActionState(submeterInscricao, null)
  const [modalidade, setModalidade] = useState('padrao')
  const [retiroId, setRetiroId] = useState(retiros[0]?.id ?? '')
  const [tocaInstrumento, setTocaInstrumento] = useState<string | null>(null)
  const [pagamentoPresencial, setPagamentoPresencial] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (state?.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state, router])

  const retiroAtual = retiros.find((r) => r.id === retiroId) ?? retiros[0]
  const vagasDisponiveis = retiroAtual
    ? Math.max(0, retiroAtual.vagas - retiroAtual.inscritos)
    : 0
  const listaEspera = retiroAtual ? retiroAtual.inscritos >= retiroAtual.vagas : false

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center pt-0 sm:pt-8 sm:pb-8 px-0 sm:px-4">
      <div className="w-full max-w-xl">
        <div className="bg-white sm:rounded-2xl sm:border border-zinc-200 sm:shadow-sm overflow-hidden">
          {/* Header */}
          <div
            className="bg-teal-600 px-6 pb-5 text-white"
            style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top))' }}
          >
            {/* Logo no header */}
            <div className="flex items-center gap-2.5 mb-5">
              <img
                src="/escalada-icon.svg"
                alt=""
                aria-hidden="true"
                className="h-9 w-auto brightness-0 invert"
              />
              <div>
                <p className="text-sm font-bold leading-tight">Escalada Aju</p>
                <p className="text-xs text-teal-200 leading-tight">Movimento de Retiros Jovens</p>
              </div>
            </div>

            <div className="border-t border-white/20 pt-4">
              {retiros.length > 1 ? (
                <div>
                  <p className="text-teal-100 text-xs font-medium uppercase tracking-wide mb-2">
                    Selecione o retiro
                  </p>
                  <select
                    value={retiroId}
                    onChange={(e) => setRetiroId(e.target.value)}
                    className="w-full text-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                  >
                    {retiros.map((r) => (
                      <option key={r.id} value={r.id} className="text-zinc-900">
                        {r.nome}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <p className="text-teal-100 text-xs font-medium uppercase tracking-wide mb-1">
                    Inscrição para
                  </p>
                  <p className="text-lg font-bold">{retiroAtual?.nome}</p>
                </div>
              )}
            </div>
            <div className="mt-3">
              {listaEspera ? (
                <span className="text-xs bg-amber-400/20 text-amber-100 border border-amber-300/30 px-2.5 py-1 rounded-full font-medium">
                  Vagas esgotadas — lista de espera
                </span>
              ) : (
                <span className="text-xs bg-white/15 text-teal-50 border border-white/20 px-2.5 py-1 rounded-full font-medium">
                  {vagasDisponiveis} vaga{vagasDisponiveis !== 1 ? 's' : ''}{' '}
                  disponível{vagasDisponiveis !== 1 ? 'ais' : ''}
                </span>
              )}
            </div>
          </div>

          <form action={formAction} className="p-5 sm:p-6 space-y-5">
            <input type="hidden" name="retiro_id" value={retiroId} />

            {/* ── DADOS PESSOAIS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Rotulo required>Nome completo</Rotulo>
                <input
                  name="nome_completo"
                  type="text"
                  required
                  placeholder="Seu nome completo"
                  disabled={isPending}
                  className={IN}
                />
              </div>

              <div>
                <Rotulo required>Apelido</Rotulo>
                <input
                  name="apelido"
                  type="text"
                  required
                  placeholder="Como te chamam"
                  disabled={isPending}
                  className={IN}
                />
              </div>

              <div>
                <Rotulo required>Data de nascimento</Rotulo>
                <input
                  name="data_nascimento"
                  type="date"
                  required
                  disabled={isPending}
                  className={IN}
                />
              </div>

              <div>
                <Rotulo required>CPF</Rotulo>
                <input
                  name="cpf"
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  disabled={isPending}
                  className={IN}
                />
              </div>

              <div>
                <Rotulo required>Telefone</Rotulo>
                <input
                  name="telefone"
                  type="tel"
                  required
                  placeholder="(79) 99999-9999"
                  disabled={isPending}
                  className={IN}
                />
              </div>

              <div className="col-span-2">
                <Rotulo required>E-mail</Rotulo>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  disabled={isPending}
                  className={IN}
                />
              </div>

              <div className="col-span-2">
                <Rotulo required>Endereço completo</Rotulo>
                <input
                  name="endereco"
                  type="text"
                  required
                  placeholder="Rua, número, bairro, cidade"
                  disabled={isPending}
                  className={IN}
                />
              </div>

              <div className="col-span-2">
                <Rotulo>Instagram</Rotulo>
                <input
                  name="instagram"
                  type="text"
                  placeholder="@seuperfil"
                  disabled={isPending}
                  className={IN}
                />
              </div>
            </div>

            {/* ── SOBRE VOCÊ ── */}
            <Secao titulo="Sobre você" />
            <div className="space-y-5">
              <div>
                <Rotulo required>
                  {retiroAtual?.tipo === 'master'
                    ? 'Você possui entre 19 e 30 anos?'
                    : 'Você possui entre 14 e 18 anos?'}
                </Rotulo>
                <div className="flex gap-6 mt-1">
                  {[
                    { value: 'sim', label: 'Sim' },
                    { value: 'nao', label: 'Não' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        type="radio"
                        name="menor_de_idade"
                        value={opt.value}
                        required
                        className="h-4 w-4 accent-teal-600"
                      />
                      <span className="text-sm text-zinc-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Rotulo>Como conheceu o Movimento?</Rotulo>
                <select
                  name="como_conheceu"
                  disabled={isPending}
                  className={`${IN} bg-white`}
                >
                  <option value="">Selecione...</option>
                  {COMO_CONHECEU_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Rotulo>Conhece alguém do Movimento?</Rotulo>
                <input
                  name="conhece_alguem"
                  type="text"
                  placeholder="Nome de quem você conhece"
                  disabled={isPending}
                  className={IN}
                />
              </div>

              <div>
                <Rotulo>Quais sacramentos você possui?</Rotulo>
                <p className="text-xs text-zinc-400 mb-2.5">
                  Pode marcar mais de um.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {SACRAMENTOS_OPTIONS.map((s) => (
                    <label
                      key={s.value}
                      className="flex items-center gap-2.5 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        name="sacramentos"
                        value={s.value}
                        className="h-4 w-4 rounded border-zinc-300 accent-teal-600"
                      />
                      <span className="text-sm text-zinc-700">{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Rotulo>Toca algum instrumento musical?</Rotulo>
                <div className="flex gap-6 mt-1 mb-3">
                  {[
                    { value: 'sim', label: 'Sim' },
                    { value: 'nao', label: 'Não' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        type="radio"
                        name="toca_instrumento"
                        value={opt.value}
                        onChange={() => setTocaInstrumento(opt.value)}
                        className="h-4 w-4 accent-teal-600"
                      />
                      <span className="text-sm text-zinc-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {tocaInstrumento === 'sim' && (
                  <input
                    name="qual_instrumento"
                    type="text"
                    placeholder="Qual instrumento?"
                    disabled={isPending}
                    className={IN}
                  />
                )}
              </div>
            </div>

            {/* ── SAÚDE E BEM-ESTAR ── */}
            <Secao titulo="Saúde e bem-estar" />
            <div className="space-y-5">
              <div>
                <Rotulo>Possui alguma condição especial de saúde?</Rotulo>
                <p className="text-xs text-zinc-400 mb-1.5">
                  Restrição alimentar, alergias medicamentosas, respiratórias,
                  alimentares ou de contato. Descreva todas as suas restrições —
                  só assim conseguiremos oferecer opções seguras para você.
                </p>
                <textarea
                  name="condicao_saude"
                  rows={3}
                  placeholder="Descreva aqui..."
                  disabled={isPending}
                  className={`${IN} resize-none`}
                />
              </div>

              <div>
                <Rotulo>Alguma outra condição de saúde ou restrição?</Rotulo>
                <textarea
                  name="outra_condicao_saude"
                  rows={2}
                  placeholder="Descreva aqui..."
                  disabled={isPending}
                  className={`${IN} resize-none`}
                />
              </div>

              <div>
                <Rotulo>Toma alguma medicação de uso contínuo?</Rotulo>
                <p className="text-xs text-zinc-400 mb-1.5">
                  Se sim, informe qual e em que horário.
                </p>
                <textarea
                  name="medicacao_continua"
                  rows={2}
                  placeholder="Ex: Ritalina 10mg, 8h e 13h"
                  disabled={isPending}
                  className={`${IN} resize-none`}
                />
              </div>
            </div>

            {/* ── RESPONSÁVEL ── */}
            <Secao titulo="Responsável" />
            <p className="text-xs text-zinc-400 -mt-2">
              Mesmo que você tenha 18 anos, precisamos de um representante maior
              de idade.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Rotulo required>Nome do responsável</Rotulo>
                <input
                  name="nome_responsavel"
                  type="text"
                  required
                  placeholder="Nome completo do responsável"
                  disabled={isPending}
                  className={IN}
                />
              </div>

              <div>
                <Rotulo required>Contato do responsável</Rotulo>
                <input
                  name="contato_responsavel"
                  type="tel"
                  required
                  placeholder="(79) 99999-9999"
                  disabled={isPending}
                  className={IN}
                />
              </div>

              <div>
                <Rotulo>E-mail do responsável</Rotulo>
                <input
                  name="email_responsavel"
                  type="email"
                  placeholder="email@exemplo.com"
                  disabled={isPending}
                  className={IN}
                />
              </div>
            </div>

            {/* ── DOCUMENTOS E PAGAMENTO ── */}
            <Secao titulo="Documentos e pagamento" />

            <div>
              <Rotulo required>Modalidade de pagamento</Rotulo>
              <input type="hidden" name="modalidade_pagamento" value={modalidade} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MODALIDADES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setModalidade(m.value)}
                    disabled={isPending}
                    className={`text-left p-4 rounded-xl border-2 transition-all disabled:opacity-50 ${
                      modalidade === m.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          modalidade === m.value
                            ? 'border-teal-500'
                            : 'border-zinc-300'
                        }`}
                      >
                        {modalidade === m.value && (
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          modalidade === m.value ? 'text-teal-700' : 'text-zinc-700'
                        }`}
                      >
                        {m.label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 ml-5.5">{m.descricao}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Forma de pagamento */}
            <div>
              <Rotulo>Forma de pagamento da entrada</Rotulo>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    value: false,
                    label: 'Pix (remoto)',
                    descricao: 'Realizo o Pix e envio o comprovante.',
                  },
                  {
                    value: true,
                    label: 'Presencial',
                    descricao: 'Pago em dinheiro ou Pix na hora, sem comprovante.',
                  },
                ].map((op) => (
                  <button
                    key={String(op.value)}
                    type="button"
                    onClick={() => setPagamentoPresencial(op.value)}
                    disabled={isPending}
                    className={`text-left p-4 rounded-xl border-2 transition-all disabled:opacity-50 ${
                      pagamentoPresencial === op.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          pagamentoPresencial === op.value
                            ? 'border-teal-500'
                            : 'border-zinc-300'
                        }`}
                      >
                        {pagamentoPresencial === op.value && (
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          pagamentoPresencial === op.value ? 'text-teal-700' : 'text-zinc-700'
                        }`}
                      >
                        {op.label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 ml-5.5">{op.descricao}</p>
                  </button>
                ))}
              </div>
            </div>

            {pagamentoPresencial ? (
              <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-4">
                <p className="text-sm font-medium text-zinc-700">
                  Pagamento presencial registrado
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  O comprovante não é necessário. A secretaria confirmará o
                  pagamento internamente.
                </p>
              </div>
            ) : (
              <>
                {retiroAtual?.chave_pix && (
                  <div className="rounded-xl bg-teal-50 border border-teal-200 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 mb-1.5">
                      Chave Pix para pagamento
                    </p>
                    <p className="font-mono text-sm text-teal-900 font-medium break-all">
                      {retiroAtual.chave_pix}
                    </p>
                    <p className="text-xs text-teal-600 mt-2">
                      Realize o Pix e anexe o comprovante abaixo.
                    </p>
                  </div>
                )}

                <div>
                  <Rotulo>Comprovante de pagamento</Rotulo>
                  <p className="text-xs text-zinc-400 mb-1.5">
                    Imagem ou PDF do comprovante da entrada paga.
                  </p>
                  <input
                    name="comprovante_pagamento"
                    type="file"
                    accept="image/*,.pdf"
                    disabled={isPending}
                    className="w-full text-sm text-zinc-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer disabled:opacity-50"
                  />
                </div>
              </>
            )}

            <div>
              <Rotulo>Documento de identificação</Rotulo>
              <p className="text-xs text-zinc-400 mb-1.5">
                RG, CNH ou outro documento com foto (imagem ou PDF).
              </p>
              <input
                name="documento_identificacao"
                type="file"
                accept="image/*,.pdf"
                disabled={isPending}
                className="w-full text-sm text-zinc-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer disabled:opacity-50"
              />
            </div>

            {/* ── OBSERVAÇÕES ── */}
            <Secao titulo="Observações" />
            <textarea
              name="observacoes"
              rows={3}
              placeholder="Alguma informação adicional que queira nos comunicar..."
              disabled={isPending}
              className={`${IN} resize-none`}
            />

            {/* ── CONFIRMAÇÃO ── */}
            <Secao titulo="Confirmação" />
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="ciencia_reunioes"
                  required
                  className="h-4 w-4 mt-0.5 rounded border-zinc-300 accent-teal-600 shrink-0"
                />
                <span className="text-sm text-zinc-700">
                  Estou ciente de que preciso comparecer às reuniões prévias e
                  que a falta em mais de uma reunião pode resultar em
                  desclassificação.{' '}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="autorizacao_imagem"
                  className="h-4 w-4 mt-0.5 rounded border-zinc-300 accent-teal-600 shrink-0"
                />
                <span className="text-sm text-zinc-700">
                  Autorizo o Escalada Aju a utilizar minha imagem em publicações
                  do Movimento.
                </span>
              </label>
            </div>

            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending || !!state?.redirectTo}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending || state?.redirectTo
                ? 'Enviando...'
                : listaEspera
                  ? 'Entrar na lista de espera'
                  : 'Confirmar inscrição'}
            </button>

            <p className="text-center text-xs text-zinc-400">
              Em breve nossa equipe entrará em contato via WhatsApp.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
