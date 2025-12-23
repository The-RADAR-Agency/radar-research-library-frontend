import type { Metadata } from 'next'
import './globals.css'
import './fonts.css'
import Navigation from '@/components/Navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'RADAR Research Library',
  description: 'Strategic foresight research platform',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <body className="font-body antialiased bg-white min-h-screen">
        <Navigation user={session?.user} />
        <main>{children}</main>
      </body>
    </html>
  )
}
