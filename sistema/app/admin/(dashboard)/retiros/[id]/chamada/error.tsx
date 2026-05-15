'use client'

export default function Error({ error }: { error: Error }) {
  return (
    <div className="p-8">
      <p className="text-sm text-red-600">
        Erro ao carregar chamada: {error.message}
      </p>
    </div>
  )
}
