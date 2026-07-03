export default function ContestsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 h-8 w-56 animate-pulse rounded-lg bg-surface-container" />
          <div className="h-10 w-72 animate-pulse rounded-lg bg-surface-container-highest" />
          <div className="mt-3 h-5 w-full max-w-xl animate-pulse rounded bg-surface-container" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {["total", "month", "upcoming"].map((item) => (
            <div
              key={item}
              className="h-[4.5rem] w-24 animate-pulse rounded-xl border border-outline-variant bg-surface-container"
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]">
        <section className="overflow-hidden rounded-2xl border border-outline-variant bg-[#141414]">
          <div className="flex items-center justify-between border-b border-outline-variant/70 bg-[#0a0a0a] px-5 py-3">
            <div className="h-7 w-44 animate-pulse rounded bg-surface-container" />
            <div className="flex gap-2">
              <div className="h-9 w-9 animate-pulse rounded-lg bg-surface-container" />
              <div className="h-9 w-9 animate-pulse rounded-lg bg-surface-container" />
            </div>
          </div>
          <div className="grid grid-cols-7 border-b border-outline-variant/70 bg-[#0a0a0a]">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="px-2 py-2">
                <div className="mx-auto h-4 w-10 animate-pulse rounded bg-surface-container" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }).map((_, index) => (
              <div
                key={index}
                className="min-h-[8.5rem] border-b border-r border-outline-variant/70 bg-[#141414] p-2 md:min-h-[9.25rem]"
              >
                <div className="mx-auto mb-3 h-4 w-5 animate-pulse rounded bg-surface-container" />
                <div className="space-y-2">
                  <div className="h-7 animate-pulse rounded-full bg-surface-container" />
                  {index % 4 === 0 ? (
                    <div className="h-7 animate-pulse rounded-full bg-surface-container" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-2xl border border-outline-variant bg-[#141414] p-4">
          <div className="mb-4 h-7 w-56 animate-pulse rounded bg-surface-container" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex gap-3 border-b border-outline-variant/70 pb-3 last:border-b-0"
              >
                <div className="h-12 w-12 animate-pulse rounded-lg bg-[#0a0a0a]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 animate-pulse rounded bg-surface-container" />
                  <div className="h-3 w-32 animate-pulse rounded bg-surface-container" />
                  <div className="h-3 w-24 animate-pulse rounded bg-surface-container" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
