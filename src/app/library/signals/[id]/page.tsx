import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SignalDetail from '@/components/detail/SignalDetail'

export default async function SignalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return null
  }

  // Load the signal
  const { data: signal, error } = await supabase
    .from('signals')
    .select(`
      *,
      last_edited_by_user:users!last_edited_by(id, full_name),
      verified_by_user:users!verified_by(id, full_name)
    `)
    .eq('id', id)
    .single()

  if (error || !signal) {
    notFound()
  }

  // Load all relationships separately
  const [
    topics,
    categories,
    steep,
    geo,
    industries,
    sourceDoc,
    signalDrivers,
    signalTrends,
    signalEvidence
  ] = await Promise.all([
    supabase.from('signals_topics').select('topics(*)').eq('signal_id', id),
    supabase.from('signals_categories').select('categories(*)').eq('signal_id', id),
    supabase.from('signals_steep_categories').select('steep_categories(*)').eq('signal_id', id),
    supabase.from('signals_geographical_focus').select('geographical_focus(*)').eq('signal_id', id),
    supabase.from('signals_hubspot_industries').select('hubspot_industries(*)').eq('signal_id', id),
    supabase.from('source_documents').select(`
      *,
      uploaded_by_user:users!uploaded_by(id, full_name)
    `).eq('id', signal.extracted_from).single(),
    supabase.from('drivers_signals').select('drivers(*, steep_categories(*))').eq('signal_id', id),
    supabase.from('signals_trends').select('trends(*, steep_categories(*))').eq('signal_id', id),
    supabase.from('signals_evidence').select('evidence(*, steep_categories(*))').eq('signal_id', id)
  ])

  // Extract from junction results
  const extractedTopics = topics.data?.map(t => t.topics).filter(Boolean) || []
  const extractedCategories = categories.data?.map(c => c.categories).filter(Boolean) || []
  const extractedSteep = steep.data?.map(s => s.steep_categories).filter(Boolean) || []
  const extractedGeo = geo.data?.map(g => g.geographical_focus).filter(Boolean) || []
  const extractedIndustries = industries.data?.map(i => i.hubspot_industries).filter(Boolean) || []
  const drivers = signalDrivers.data?.map(sd => sd.drivers).filter(Boolean) || []
  const trends = signalTrends.data?.map(st => st.trends).filter(Boolean) || []

  // Attach relationships to signal
  const fullSignal = {
    ...signal,
    signals_topics: topics.data || [],
    signals_categories: categories.data || [],
    signals_steep_categories: steep.data || [],
    signals_geographical_focus: geo.data || [],
    signals_hubspot_industries: industries.data || [],
    source_documents: sourceDoc.data,
    topics: extractedTopics,
    categories: extractedCategories,
    steep_categories: extractedSteep,
    geographical_focus: extractedGeo,
    industries: extractedIndustries
  }

  return (
    <SignalDetail
      signal={fullSignal}
      relatedDrivers={drivers}
      relatedTrends={trends}
      relatedEvidence={signalEvidence.data?.map(se => se.evidence).filter(Boolean) || []}
      userId={session.user.id}
    />
  )
}
