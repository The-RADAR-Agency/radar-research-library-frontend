import { supabase } from "../lib/supabase/client";

export const dynamic = "force-dynamic";

export default async function TestSupabasePage() {
  const { data, error } = await supabase
    .from("trends")
    .select("id, trend_name, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const isEmpty = !error && Array.isArray(data) && data.length === 0;

  return (
    <main className="min-h-screen px-8 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold">Supabase test</h1>

        {isEmpty && (
          <div className="mt-4 rounded-lg border p-4 text-sm">
            <div className="font-medium">No rows returned (expected)</div>
            <div className="mt-1 text-neutral-600">
              Row Level Security is enabled on <code>trends</code> and the current
              client is unauthenticated (anon). Once Supabase Auth is added and a
              user is signed in, this endpoint should return rows permitted by
              policy.
            </div>
          </div>
        )}

        {error ? (
          <pre className="mt-6 rounded-lg border p-4 text-sm">
            {JSON.stringify(error, null, 2)}
          </pre>
        ) : (
          <pre className="mt-6 rounded-lg border p-4 text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}
