export default function Home() {
  return (
    <main className="min-h-screen px-8 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight">
          RADAR Research Library
        </h1>
        <p className="mt-3 text-base text-neutral-600">
          Frontend scaffold is live. Next: design tokens + Supabase read-only
          adapter layer.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-5">
            <div className="text-sm font-medium">Step 4</div>
            <div className="mt-1 text-neutral-600">Connect to Vercel</div>
          </div>
          <div className="rounded-xl border p-5">
            <div className="text-sm font-medium">Step 5</div>
            <div className="mt-1 text-neutral-600">Supabase data adapter layer</div>
          </div>
        </div>
      </div>
    </main>
  );
}
