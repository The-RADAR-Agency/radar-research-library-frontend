import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, verification_notes, verified_by } = await request.json()

    const { error } = await supabase
      .from('signals')
      .update({ 
        verified_by,
        verification_date: new Date().toISOString(),
        verification_notes
      })
      .eq('id', id)

    if (error) {
      console.error('Signal verification error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Signal verify API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
