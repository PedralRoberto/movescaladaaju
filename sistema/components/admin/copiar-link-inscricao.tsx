'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopiarLinkInscricao({ path }: { path: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    await navigator.clipboard.writeText(`${window.location.origin}${path}`)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  return (
    <button
      onClick={copiar}
      className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
    >
      {copiado
        ? <Check className="h-4 w-4 shrink-0" />
        : <Copy className="h-4 w-4 shrink-0" />}
      {copiado ? 'Link copiado!' : 'Copiar link de inscrição'}
    </button>
  )
}
