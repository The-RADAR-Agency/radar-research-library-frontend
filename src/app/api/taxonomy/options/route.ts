import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  
  const [categories, topics, industries, geo] = await Promise.all([
    supabase.from('categories').select('*').order('category_name'),
    supabase.from('topics').select('*').order('topic_name'),
    supabase.from('hubspot_industries').select('id, hubspot_industry_name').order('hubspot_industry_name'),
    supabase.from('geographical_focus').select('id, region_name').order('region_name')
  ])

  return NextResponse.json({
    categories: categories.data || [],
    topics: topics.data || [],
    industries: industries.data || [],
    geographicalFocus: geo.data || []
  })
}
