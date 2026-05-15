import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export default function InscricaoDetalheLoading() {
  return (
    <div className="p-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-16" />
        <span className="text-zinc-300">/</span>
        <Skeleton className="h-4 w-44" />
        <span className="text-zinc-300">/</span>
        <Skeleton className="h-4 w-16" />
        <span className="text-zinc-300">/</span>
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Header */}
      <div className="mb-4 space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>

      {/* Status selector */}
      <div className="mb-8">
        <Skeleton className="h-10 w-48 rounded-lg" />
      </div>

      <Separator className="mb-8" />

      {/* Dados pessoais */}
      <Skeleton className="h-5 w-32 mb-4" />
      <div className="grid grid-cols-2 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 p-5">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>

      {/* Observacoes */}
      <Skeleton className="h-5 w-24 mb-3" />
      <div className="rounded-xl border border-zinc-200 p-5 mb-10">
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      {/* Modulos */}
      <Skeleton className="h-5 w-20 mb-3" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 p-5">
            <div className="flex items-start gap-3">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
