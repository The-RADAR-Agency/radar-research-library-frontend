import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, title, summary, key_themes, publication_date, categories, topics, geographical_focus, industries } = body
  console.log('API received - industries:', industries)
  console.log('API received - full body:', body)

  // Update basic fields
  const { error } = await supabase
    .from('source_documents')
    .update({ title, summary, key_themes, publication_date, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update taxonomy junction tables
  if (categories) {
    await supabase.from('source_documents_categories').delete().eq('source_document_id', id)
    if (categories.length > 0) {
      await supabase.from('source_documents_categories').insert(
        categories.map((cat_id: string) => ({ source_document_id: id, category_id: cat_id }))
      )
    }
  }

  if (topics) {
    await supabase.from('source_documents_topics').delete().eq('source_document_id', id)
    if (topics.length > 0) {
      await supabase.from('source_documents_topics').insert(
        topics.map((topic_id: string) => ({ source_document_id: id, topic_id }))
      )
    }
  }

  if (geographical_focus) {
    await supabase.from('source_documents_geographical_focus').delete().eq('source_document_id', id)
    if (geographical_focus.length > 0) {
      await supabase.from('source_documents_geographical_focus').insert(
        geographical_focus.map((geo_id: string) => ({ source_document_id: id, geographical_focus_id: geo_id }))
      )
    }
  }

  if (industries) {
    const deleteResult = await supabase.from('source_documents_hubspot_industries').delete().eq('source_document_id', id)
    console.log('Industries delete result:', deleteResult)
    if (industries.length > 0) {
      const insertResult = await supabase.from('source_documents_hubspot_industries').insert(
        industries.map((industry_id: string) => ({ source_document_id: id, hubspot_industry_id: industry_id }))
      )
      console.log('Industries insert result:', insertResult)
      if (insertResult.error) {
        console.error('Industries insert ERROR:', insertResult.error)
      }
    }
  }

  return NextResponse.json({ success: true })
}
