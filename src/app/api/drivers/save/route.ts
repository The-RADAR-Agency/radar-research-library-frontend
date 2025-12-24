import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, driver_name, description, categories, topics, steep_categories, geographical_focus, industries } = body

  // Update basic fields
  const { error } = await supabase
    .from('drivers')
    .update({ driver_name, description, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update taxonomy junction tables
  if (categories) {
    await supabase.from('drivers_categories').delete().eq('driver_id', id)
    if (categories.length > 0) {
      await supabase.from('drivers_categories').insert(
        categories.map((cat_id: string) => ({ driver_id: id, category_id: cat_id }))
      )
    }
  }

  if (topics) {
    await supabase.from('drivers_topics').delete().eq('driver_id', id)
    if (topics.length > 0) {
      await supabase.from('drivers_topics').insert(
        topics.map((topic_id: string) => ({ driver_id: id, topic_id }))
      )
    }
  }

  if (steep_categories) {
    await supabase.from('drivers_steep_categories').delete().eq('driver_id', id)
    if (steep_categories.length > 0) {
      await supabase.from('drivers_steep_categories').insert(
        steep_categories.map((steep_id: string) => ({ driver_id: id, steep_category_id: steep_id }))
      )
    }
  }

  if (geographical_focus) {
    await supabase.from('drivers_geographical_focus').delete().eq('driver_id', id)
    if (geographical_focus.length > 0) {
      await supabase.from('drivers_geographical_focus').insert(
        geographical_focus.map((geo_id: string) => ({ driver_id: id, geographical_focus_id: geo_id }))
      )
    }
  }

  if (industries) {
    await supabase.from('drivers_hubspot_industries').delete().eq('driver_id', id)
    if (industries.length > 0) {
      await supabase.from('drivers_hubspot_industries').insert(
        industries.map((industry_id: string) => ({ driver_id: id, hubspot_industry_id: industry_id }))
      )
    }
  }

  return NextResponse.json({ success: true })
}
