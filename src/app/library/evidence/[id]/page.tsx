import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EvidenceDetail from '@/components/detail/EvidenceDetail'

export default async function EvidenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return null
  }

  const { data: evidence, error } = await supabase
    .from('evidence')
    .select(`
      *,
      verified_by_user:users!verified_by(id, full_name),
      last_edited_by_user:users!last_edited_by(id, full_name)
    `)
    .eq('id', id)
    .single()

  if (error || !evidence) {
    console.error('Evidence query error:', error)
    notFound()
  }

  const [topics, categories, steep, geo, industries, sourceDoc, relatedTrends, relatedSignals] = await Promise.all([
    supabase.from('evidence_topics').select('topics(*)').eq('evidence_id', id),
    supabase.from('evidence_categories').select('categories(*)').eq('evidence_id', id),
    supabase.from('evidence_steep_categories').select('steep_categories(*)').eq('evidence_id', id),
    supabase.from('evidence_geographical_focus').select('geographical_focus(*)').eq('evidence_id', id),
    supabase.from('evidence_hubspot_industries').select('hubspot_industries(*)').eq('evidence_id', id),
    supabase.from('source_documents').select('*').eq('id', evidence.extracted_from).single(),
    supabase.from('trends_evidence').select('trends(*)').eq('evidence_id', id),
    supabase.from('signals_evidence').select('signals(*)').eq('evidence_id', id)
  ])
  
  const extractedTopics = topics.data?.map(t => t.topics).filter(Boolean) || []
  const extractedCategories = categories.data?.map(c => c.categories).filter(Boolean) || []
  const extractedSteep = steep.data?.map(s => s.steep_categories).filter(Boolean) || []
  const extractedGeo = geo.data?.map(g => g.geographical_focus).filter(Boolean) || []
  const extractedIndustries = industries.data?.map(i => i.hubspot_industries).filter(Boolean) || []

  const fullEvidence = {
    ...evidence,
    evidence_topics: topics.data || [],
    evidence_categories: categories.data || [],
    evidence_steep_categories: steep.data || [],
    evidence_geographical_focus: geo.data || [],
    evidence_hubspot_industries: industries.data || [],
    source_documents: sourceDoc.data,
    topics: extractedTopics,
    categories: extractedCategories,
    steep_categories: extractedSteep,
    geographical_focus: extractedGeo,
    industries: extractedIndustries
  }

  return (
    <EvidenceDetail
      evidence={fullEvidence}
      relatedDrivers={[]}
      relatedTrends={relatedTrends.data?.map((row: any) => row.trends).filter(Boolean) || []}
      relatedSignals={relatedSignals.data?.map((row: any) => row.signals).filter(Boolean) || []}
      userId={session.user.id}
    />
  )
}