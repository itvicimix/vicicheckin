export default function Loading() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-1/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Skeleton */}
      <header className="relative z-10 py-6 px-4 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="w-48 h-3 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Booking Wizard Skeleton */}
      <div className="flex-1 relative z-10 py-4 md:py-8 px-4 w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 overflow-hidden h-[calc(100vh-120px)] max-h-[800px] flex flex-col">
          {/* Wizard Header Skeleton */}
          <div className="px-6 py-4 border-b flex items-center gap-4 bg-gray-50/50">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
              <div className="w-40 h-6 bg-gray-300 rounded animate-pulse" />
            </div>
          </div>
          {/* Wizard Content Skeleton */}
          <div className="flex-1 p-6 space-y-6">
            <div className="w-full h-12 bg-gray-100 rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse border border-gray-100" />
              ))}
            </div>
            <div className="w-full h-32 bg-gray-50 rounded-xl animate-pulse mt-auto" />
          </div>
        </div>
      </div>
    </main>
  );
}
