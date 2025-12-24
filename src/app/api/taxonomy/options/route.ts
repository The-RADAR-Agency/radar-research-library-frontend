import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  
  const [categories, topics, industries, geo, steep] = await Promise.all([
    supabase.from('categories').select('*').order('category_name'),
    supabase.from('topics').select('*').order('topic_name'),
    supabase.from('hubspot_industries').select('id, hubspot_industry_name').order('hubspot_industry_name'),
    supabase.from('geographical_focus').select('id, region_name').order('region_name'),
    supabase.from('steep_categories').select('*').order('sort_order')
  ])

  return NextResponse.json({
    categories: categories.data || [],
    topics: topics.data || [],
    industries: industries.data || [],
    geographicalFocus: geo.data || [],
    steep: steep.data || []
  })
}
