'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="hover:text-zinc-600 flex items-center transition-colors"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
    </button>
  )
}
