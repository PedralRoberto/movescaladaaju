import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Inscrição realizada — Escalada Aju',
}

export default async function SucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>
}) {
  const { s } = await searchParams
  const listaEspera = s === 'lista_espera'

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm w-full">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500 mb-6">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M14 4L24 20H4L14 4Z" fill="white" fillOpacity="0.9" />
            <path d="M14 10L20 20H8L14 10Z" fill="white" fillOpacity="0.4" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-teal-600 mb-2">Escalada Aju</h1>
        <p className="text-zinc-500 text-sm mb-8">Movimento de Retiros Jovens</p>

        <div className="bg-white border border-zinc-200 rounded-2xl px-6 py-8 shadow-sm">
          {listaEspera ? (
            <>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-zinc-900 font-bold text-xl mb-3">
                Você está na lista de espera!
              </p>
              <p className="text-zinc-500 text-sm leading-relaxed">
                As vagas estão esgotadas no momento, mas você foi adicionado à
                lista de espera. Caso surja uma vaga, nossa equipe entrará em
                contato via <strong className="text-zinc-700">WhatsApp</strong>.
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-zinc-900 font-bold text-xl mb-3">
                Inscrição realizada!
              </p>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Sua inscrição foi recebida com sucesso. Em breve nossa equipe
                entrará em contato via{' '}
                <strong className="text-zinc-700">WhatsApp</strong> com as
                informações sobre o retiro.
              </p>
            </>
          )}
        </div>

        <Link
          href="/inscricao"
          className="mt-6 inline-block text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
