import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const entityType = formData.get('entityType') as string // 'driver', 'trend', 'signal', 'upload'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload JPG, PNG, or WebP.' 
      }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    // Look up the user's ID from the users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .single()

    if (userError || !user) {
      console.error('User lookup error:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate unique filename
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const baseFileName = `${session.user.id}/${timestamp}`

    // Create optimized display version (max 1200px width, WebP format)
    const displayImage = await sharp(buffer)
      .resize(1200, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 80 })
      .toBuffer()

    // Upload original
    const originalPath = `originals/${baseFileName}.${fileExt}`
    const { error: originalError } = await supabase.storage
      .from('card-images')
      .upload(originalPath, buffer, {
        contentType: file.type,
        cacheControl: '3600'
      })

    if (originalError) {
      console.error('Original upload error:', originalError)
      return NextResponse.json({ error: 'Failed to upload original image' }, { status: 500 })
    }

    // Upload display version
    const displayPath = `display/${baseFileName}.webp`
    const { error: displayError } = await supabase.storage
      .from('card-images')
      .upload(displayPath, displayImage, {
        contentType: 'image/webp',
        cacheControl: '3600'
      })

    if (displayError) {
      console.error('Display upload error:', displayError)
      // Clean up original if display fails
      await supabase.storage.from('card-images').remove([originalPath])
      return NextResponse.json({ error: 'Failed to upload display image' }, { status: 500 })
    }

    // Get public URLs
    const { data: displayUrl } = supabase.storage
      .from('card-images')
      .getPublicUrl(displayPath)

    const { data: originalUrl } = supabase.storage
      .from('card-images')
      .getPublicUrl(originalPath)

    // Create header_images record using the users.id (not auth_user_id)
    const { data: headerImage, error: dbError } = await supabase
      .from('header_images')
      .insert({
        image_url: displayUrl.publicUrl,
        thumbnail_url: displayUrl.publicUrl,
        original_url: originalUrl.publicUrl,
        category: entityType,
        uploaded_by: user.id, // Use users.id, not session.user.id
        approved: true,
        usage_count: 1
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Clean up uploaded files
      await supabase.storage.from('card-images').remove([originalPath, displayPath])
      return NextResponse.json({ error: 'Failed to create database record' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      headerImage 
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}