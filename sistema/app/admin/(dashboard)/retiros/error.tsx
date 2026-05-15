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
