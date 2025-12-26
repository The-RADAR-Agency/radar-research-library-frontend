import { createClient } from '@/lib/supabase/client'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function loadLibraryData(userId: string) {
  const supabase = createClient()

  const [reports, drivers, trends, signals, evidence, filterOptions] = await Promise.all([
    loadReports(supabase),
    loadDrivers(supabase),
    loadTrends(supabase),
    loadSignals(supabase),
    loadEvidence(supabase),
    loadFilterOptions(supabase)
  ])

  // Load taxonomy data for each entity
  const driversWithTaxonomy = await enrichWithTaxonomy(supabase, drivers.data || [], 'drivers')
  const trendsWithTaxonomy = await enrichWithTaxonomy(supabase, trends.data || [], 'trends')
  const signalsWithTaxonomy = await enrichWithTaxonomy(supabase, signals.data || [], 'signals')

  return {
    reports: reports.data || [],
    drivers: driversWithTaxonomy,
    trends: trendsWithTaxonomy,
    signals: signalsWithTaxonomy,
    evidence: evidence.data || [],
    filterOptions
  }
}

export async function loadLibraryDataServer(userId: string) {
  const supabase = await createServerSupabaseClient()

  // DEBUG: Check auth status
  const { data: { user } } = await supabase.auth.getUser()
  console.log('Loading library for user:', { userId, authUser: user?.id, email: user?.email })

  try {
    const [reports, drivers, trends, signals, evidence, filterOptions] = await Promise.all([
      loadReports(supabase),
      loadDrivers(supabase),
      loadTrends(supabase),
      loadSignals(supabase),
      loadEvidence(supabase),
      loadFilterOptions(supabase)
    ])

    // Load taxonomy data for each entity
    const driversWithTaxonomy = await enrichWithTaxonomy(supabase, drivers.data || [], 'drivers')
    const trendsWithTaxonomy = await enrichWithTaxonomy(supabase, trends.data || [], 'trends')
    const signalsWithTaxonomy = await enrichWithTaxonomy(supabase, signals.data || [], 'signals')

    console.log('Data loaded:', {
      reportsCount: reports.data?.length || 0,
      driversCount: driversWithTaxonomy.length,
      trendsCount: trendsWithTaxonomy.length,
      signalsCount: signalsWithTaxonomy.length,
      filterOptions
    })

    return {
      reports: reports.data || [],
      drivers: driversWithTaxonomy,
      trends: trendsWithTaxonomy,
      signals: signalsWithTaxonomy,
      evidence: evidence.data || [],
      filterOptions
    }
  } catch (error) {
    console.error('Error loading library data:', error)
    return {
      reports: [],
      drivers: [],
      trends: [],
      signals: [],
      evidence: [],
      filterOptions: {
        topics: [],
        categories: [],
        steep_categories: [],
        geographical_focus: [],
        industries: []
      }
    }
  }
}

async function enrichWithTaxonomy(supabase: any, entities: any[], entityType: string) {
  if (!entities.length) return []

  const entityIds = entities.map(e => e.id)

  // Load all junction table data in parallel
  const [topics, categories, steep, geo, industries] = await Promise.all([
    supabase.from(`${entityType}_topics`).select('*, topics(*)').in(`${entityType.slice(0, -1)}_id`, entityIds),
    supabase.from(`${entityType}_categories`).select('*, categories(*)').in(`${entityType.slice(0, -1)}_id`, entityIds),
    supabase.from(`${entityType}_steep_categories`).select('*, steep_categories(*)').in(`${entityType.slice(0, -1)}_id`, entityIds),
    supabase.from(`${entityType}_geographical_focus`).select('*, geographical_focus(*)').in(`${entityType.slice(0, -1)}_id`, entityIds),
    supabase.from(`${entityType}_hubspot_industries`).select('*, hubspot_industries(*)').in(`${entityType.slice(0, -1)}_id`, entityIds)
  ])

  // Group by entity ID
  const topicsByEntity = groupBy(topics.data || [], `${entityType.slice(0, -1)}_id`)
  const categoriesByEntity = groupBy(categories.data || [], `${entityType.slice(0, -1)}_id`)
  const steepByEntity = groupBy(steep.data || [], `${entityType.slice(0, -1)}_id`)
  const geoByEntity = groupBy(geo.data || [], `${entityType.slice(0, -1)}_id`)
  const industriesByEntity = groupBy(industries.data || [], `${entityType.slice(0, -1)}_id`)

  // Attach to entities
  return entities.map(entity => ({
    ...entity,
    topics: (topicsByEntity[entity.id] || []).map((jt: any) => jt.topics).filter(Boolean),
    categories: (categoriesByEntity[entity.id] || []).map((jt: any) => jt.categories).filter(Boolean),
    steep_categories: (steepByEntity[entity.id] || []).map((jt: any) => jt.steep_categories).filter(Boolean),
    geographical_focus: (geoByEntity[entity.id] || []).map((jt: any) => jt.geographical_focus).filter(Boolean),
    industries: (industriesByEntity[entity.id] || []).map((jt: any) => jt.hubspot_industries).filter(Boolean)
  }))
}

function groupBy(array: any[], key: string) {
  return array.reduce((result, item) => {
    const groupKey = item[key]
    if (!result[groupKey]) result[groupKey] = []
    result[groupKey].push(item)
    return result
  }, {})
}

async function loadReports(supabase: any) {
  const { data, error } = await supabase
    .from('source_documents')
    .select('*, header_images(*)')
    .order('created_at', { ascending: false })
  
  if (error) console.error('Error loading reports:', error)
  return { data, error }
}

async function loadDrivers(supabase: any) {
  const { data, error } = await supabase
    .from('drivers')
    .select(`
      *,
      header_images(*),
      last_edited_by_user:users!last_edited_by(id, full_name),
      verified_by_user:users!verified_by(id, full_name)
    `)
    .order('created_at', { ascending: false })
  
  if (error) console.error('Error loading drivers:', error)
  return { data, error }
}

async function loadTrends(supabase: any) {
  const { data, error } = await supabase
    .from('trends')
    .select(`
      *,
      header_images(*),
      last_edited_by_user:users!last_edited_by(id, full_name),
      verified_by_user:users!verified_by(id, full_name)
    `)
    .order('created_at', { ascending: false })
  
  if (error) console.error('Error loading trends:', error)
  return { data, error }
}

async function loadSignals(supabase: any) {
  const { data, error } = await supabase
    .from('signals')
    .select(`
      *,
      header_images(*),
      last_edited_by_user:users!last_edited_by(id, full_name),
      verified_by_user:users!verified_by(id, full_name)
    `)
    .order('created_at', { ascending: false })
  
  if (error) console.error('Error loading signals:', error)
  return { data, error }
}

async function loadEvidence(supabase: any) {
  const { data, error } = await supabase
    .from('evidence')
    .select(`
      *,
      header_images(*),
      last_edited_by_user:users!last_edited_by(id, full_name),
      verified_by_user:users!verified_by(id, full_name)
    `)
    .order('created_at', { ascending: false })
  
  if (error) console.error('Error loading evidence:', error)
  return { data, error }
}

async function loadFilterOptions(supabase: any) {
  const [topics, categories, steep, geo, industries] = await Promise.all([
    supabase.from('topics').select('*').order('topic_name'),
    supabase.from('categories').select('*').order('category_name'),
    supabase.from('steep_categories').select('*').order('sort_order'),
    supabase.from('geographical_focus').select('*').order('sort_order'),
    supabase.from('hubspot_industries').select('*').order('industry_name')
  ])

  return {
    topics: topics.data || [],
    categories: categories.data || [],
    steep_categories: steep.data || [],
    geographical_focus: geo.data || [],
    industries: industries.data || []
  }
}