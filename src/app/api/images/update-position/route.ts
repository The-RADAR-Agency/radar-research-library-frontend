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
    const { entityType, entityId, cropPosition } = body

    // Validate inputs
    if (!entityType || !entityId || !cropPosition) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Validate crop position structure
    if (typeof cropPosition.x !== 'number' || 
        typeof cropPosition.y !== 'number' || 
        typeof cropPosition.zoom !== 'number') {
      return NextResponse.json({ 
        error: 'Invalid crop position format' 
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

    // Get the entity to find its header_image_id
    const { data: entity, error: fetchError } = await supabase
      .from(tableName)
      .select('header_image_id')
      .eq('id', entityId)
      .single()

    if (fetchError || !entity || !entity.header_image_id) {
      console.error('Entity fetch error:', fetchError)
      return NextResponse.json({ 
        error: 'Entity or header image not found' 
      }, { status: 404 })
    }

    // Update the crop_position in header_images table
    const { error: updateError } = await supabase
      .from('header_images')
      .update({ 
        crop_position: cropPosition,
        updated_at: new Date().toISOString()
      })
      .eq('id', entity.header_image_id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update crop position' 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Update position error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
