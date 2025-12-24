'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Upload, BarChart3 } from 'lucide-react'

interface NavigationProps {
  user?: {
    id: string
    email?: string
    full_name?: string | null
  }
}

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [imageError, setImageError] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            {!imageError ? (
              <Image
                src="/brand-assets/Radar Agency Design Assets/1.Logos/Radar Logo-01.png"
                alt="RADAR"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="font-nav font-bold text-2xl tracking-wide">RADAR</span>
            )}
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              href="/upload"
              className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </Link>

            <Link
              href="/visualizations"
              className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Visualizations</span>
            </Link>

            {user && (
              <>
                <span className="text-sm text-muted-foreground border-l border-border pl-6">
                  {user.full_name || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
