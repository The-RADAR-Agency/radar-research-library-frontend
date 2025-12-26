// SAVE AS: src/app/api/images/link/route.ts

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
    const { entityType, entityId, headerImageId } = body

    // Validate inputs
    if (!entityType || !entityId || !headerImageId) {
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

    // Update entity with new header_image_id
    const { error } = await supabase
      .from(tableName)
      .update({ 
        header_image_id: headerImageId,
        updated_at: new Date().toISOString()
      })
      .eq('id', entityId)

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ 
        error: 'Failed to update entity' 
      }, { status: 500 })
    }

    // Increment usage count on header_images
    await supabase.rpc('increment_usage_count', { 
      image_id: headerImageId 
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Link image error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
