import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { entityType, entityId } = body

    // Validate inputs
    if (!entityType || !entityId) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Map entity type to table name
    const tableMap: Record<string, string> = {
      driver: 'drivers',
      trend: 'trends',
      signal: 'signals',
      upload: 'source_documents'
    }

    const tableName = tableMap[entityType]
    if (!tableName) {
      return NextResponse.json({ 
        error: 'Invalid entity type' 
      }, { status: 400 })
    }

    // Remove header_image_id from entity (set to null)
    const { error } = await supabase
      .from(tableName)
      .update({ 
        header_image_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', entityId)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ 
        error: 'Failed to remove image' 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
