export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="h-14 w-14 bg-zinc-200 rounded-2xl mx-auto mb-8 animate-pulse" />
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="h-28 bg-zinc-200 animate-pulse" />
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-12 bg-zinc-100 rounded-xl animate-pulse" />
            ))}
            <div className="h-12 bg-zinc-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
