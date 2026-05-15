'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopiarLink({ path }: { path: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    const url = `${window.location.origin}${path}`
    await navigator.clipboard.writeText(url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-zinc-700 font-mono truncate">
        {path}
      </code>
      <button
        onClick={copiar}
        className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-teal-600 border border-zinc-200 hover:border-teal-300 bg-white px-3 py-2.5 rounded-lg transition-colors"
      >
        {copiado
          ? <Check className="h-3.5 w-3.5 text-teal-600" />
          : <Copy className="h-3.5 w-3.5" />}
        {copiado ? 'Copiado!' : 'Copiar link'}
      </button>
    </div>
  )
}
