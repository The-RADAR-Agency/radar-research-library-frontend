import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DriverDetail from '@/components/detail/DriverDetail'

export default async function DriverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return null
  }

  // Load the driver with basic data first
  const { data: driver, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !driver) {
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
    driverTrends,
    driverSignals
  ] = await Promise.all([
    supabase.from('drivers_topics').select('topics(*)').eq('driver_id', id),
    supabase.from('drivers_categories').select('categories(*)').eq('driver_id', id),
    supabase.from('drivers_steep_categories').select('steep_categories(*)').eq('driver_id', id),
    supabase.from('drivers_geographical_focus').select('geographical_focus(*)').eq('driver_id', id),
    supabase.from('drivers_hubspot_industries').select('hubspot_industries(*)').eq('driver_id', id),
    supabase.from('source_documents').select('*').eq('id', driver.extracted_from).single(),
    supabase.from('drivers_trends').select('trends(*, steep_categories(*))').eq('driver_id', id),
    supabase.from('drivers_signals').select('signals(*, steep_categories(*))').eq('driver_id', id)
  ])

  // Extract trends and signals from junction results
  const trends = driverTrends.data?.map(dt => dt.trends).filter(Boolean) || []
  const signals = driverSignals.data?.map(ds => ds.signals).filter(Boolean) || []

  // Extract taxonomy from junction results
  const extractedTopics = topics.data?.map(t => t.topics).filter(Boolean) || []
  const extractedCategories = categories.data?.map(c => c.categories).filter(Boolean) || []
  const extractedSteep = steep.data?.map(s => s.steep_categories).filter(Boolean) || []
  const extractedGeo = geo.data?.map(g => g.geographical_focus).filter(Boolean) || []
  const extractedIndustries = industries.data?.map(i => i.hubspot_industries).filter(Boolean) || []

  // Attach relationships to driver
  const fullDriver = {
    ...driver,
    drivers_topics: topics.data || [],
    drivers_categories: categories.data || [],
    drivers_steep_categories: steep.data || [],
    drivers_geographical_focus: geo.data || [],
    source_documents: sourceDoc.data,
    // Add flattened versions for easy access
    topics: extractedTopics,
    categories: extractedCategories,
    steep_categories: extractedSteep,
    geographical_focus: extractedGeo,
    industries: extractedIndustries
  }

  return (
    <DriverDetail
      driver={fullDriver}
      relatedTrends={trends}
      relatedSignals={signals}
      relatedEvidence={[]}
      userId={session.user.id}
    />
  )
}
