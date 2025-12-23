import { createServerSupabaseClient } from '@/lib/supabase/server'
import { loadLibraryDataServer } from '@/lib/data/library'
import LibraryPage from '@/components/library/LibraryPage'

export default async function Library() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return null
  }

  const data = await loadLibraryDataServer(session.user.id)

  return <LibraryPage initialData={data} userId={session.user.id} />
}
