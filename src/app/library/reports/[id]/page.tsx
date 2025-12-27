import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import UploadDetail from '@/components/detail/UploadDetail'

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return null
  }

  // Load the report with all related data
  const { data: report, error } = await supabase
    .from('source_documents')
    .select(`
      *,
      header_images(*),
      topics(*),
      categories(*),
      geographical_focus(*),
      source:sources!source_id(*),
      source_documents_hubspot_industries(hubspot_industries(*)),
      uploaded_by_user:users!uploaded_by(id, full_name)
    `)
    .eq('id', id)
    .single()

  if (error || !report) {
    console.error('Report query error:', error)
    notFound()
  }

  // Load related research extracted from this report
  const [drivers, trends, signals, evidence] = await Promise.all([
    supabase
      .from('drivers')
      .select('*, steep_categories(*)')
      .eq('extracted_from', id),
    supabase
      .from('trends')
      .select('*, steep_categories(*)')
      .eq('extracted_from', id),
    supabase
      .from('signals')
      .select('*, steep_categories(*)')
      .eq('extracted_from', id),
    supabase
      .from('evidence')
      .select('*, steep_categories(*)')
      .eq('extracted_from', id)
  ])

  return (
    <UploadDetail
      report={report}
      relatedDrivers={drivers.data || []}
      relatedTrends={trends.data || []}
      relatedSignals={signals.data || []}
      relatedEvidence={evidence.data || []}
      userId={session.user.id}
    />
  )
}