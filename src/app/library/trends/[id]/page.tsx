import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TrendDetail from '@/components/detail/TrendDetail'

export default async function TrendDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return null
  }

  // Load the trend
  const { data: trend, error } = await supabase
    .from('trends')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !trend) {
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
    trendDrivers,
    trendSignals,
    trendEvidence
  ] = await Promise.all([
    supabase.from('trends_topics').select('topics(*)').eq('trend_id', id),
    supabase.from('trends_categories').select('categories(*)').eq('trend_id', id),
    supabase.from('trends_steep_categories').select('steep_categories(*)').eq('trend_id', id),
    supabase.from('trends_geographical_focus').select('geographical_focus(*)').eq('trend_id', id),
    supabase.from('trends_hubspot_industries').select('hubspot_industries(*)').eq('trend_id', id),
    supabase.from('source_documents').select('*').eq('id', trend.extracted_from).single(),
    supabase.from('drivers_trends').select('drivers(*, steep_categories(*))').eq('trend_id', id),
    supabase.from('signals_trends').select('signals(*, steep_categories(*))').eq('trend_id', id),
    supabase.from('trends_evidence').select('evidence(*, steep_categories(*))').eq('trend_id', id)
  ])

  // Extract from junction results
  const extractedTopics = topics.data?.map(t => t.topics).filter(Boolean) || []
  const extractedCategories = categories.data?.map(c => c.categories).filter(Boolean) || []
  const extractedSteep = steep.data?.map(s => s.steep_categories).filter(Boolean) || []
  const extractedGeo = geo.data?.map(g => g.geographical_focus).filter(Boolean) || []
  const extractedIndustries = industries.data?.map(i => i.hubspot_industries).filter(Boolean) || []
  const drivers = trendDrivers.data?.map(td => td.drivers).filter(Boolean) || []
  const signals = trendSignals.data?.map(ts => ts.signals).filter(Boolean) || []

  // Attach relationships to trend
  const fullTrend = {
    ...trend,
    trends_topics: topics.data || [],
    trends_categories: categories.data || [],
    trends_steep_categories: steep.data || [],
    trends_geographical_focus: geo.data || [],
    trends_hubspot_industries: industries.data || [],
    source_documents: sourceDoc.data,
    topics: extractedTopics,
    categories: extractedCategories,
    steep_categories: extractedSteep,
    geographical_focus: extractedGeo,
    industries: extractedIndustries
  }

  return (
    <TrendDetail
      trend={fullTrend}
      relatedDrivers={drivers}
      relatedSignals={signals}
      relatedEvidence={trendEvidence.data?.map(te => te.evidence).filter(Boolean) || []}
      userId={session.user.id}
    />
  )
}
