export default function Loading() {
  return (
    <div className="p-8 max-w-5xl">
      <div className="h-4 w-48 bg-zinc-100 rounded animate-pulse mb-6" />
      <div className="h-8 w-56 bg-zinc-100 rounded animate-pulse mb-8" />
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-20 bg-zinc-100 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-64 bg-zinc-100 rounded-xl animate-pulse" />
    </div>
  )
}
