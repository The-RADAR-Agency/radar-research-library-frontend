'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Upload, BarChart3, Library, Menu, X, Search, Filter, MessageSquare } from 'lucide-react'
import ChatDrawer from '@/components/chat/ChatDrawer'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <nav className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              {!imageError ? (
                <Image
                  src="/brand-assets/logos/radar-logo.png"
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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/library"
                className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                  pathname?.startsWith('/library') 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Library className="w-4 h-4" />
                <span>Library</span>
              </Link>

              <Link
                href="/upload"
                className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                  pathname?.startsWith('/upload') 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </Link>

              <Link
                href="/visualizations"
                className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                  pathname?.startsWith('/visualizations') 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
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

            {/* Mobile Navigation - Search, Filter, Chat, Menu */}
            <div className="flex md:hidden items-center gap-4">
              {/* Search icon - placeholder */}
              <button className="p-2 text-muted-foreground hover:text-foreground">
                <Search className="w-5 h-5" />
              </button>

              {/* Filter icon - placeholder */}
              <button className="p-2 text-muted-foreground hover:text-foreground">
                <Filter className="w-5 h-5" />
              </button>

              {/* Chat icon - opens drawer */}
              {user && (
                <button
                  onClick={() => setChatOpen(true)}
                  className="p-2 text-muted-foreground hover:text-foreground"
                  title="Research Assistant"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              )}

              {/* Hamburger menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4 space-y-4">
              <Link
                href="/library"
                className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                  pathname?.startsWith('/library') ? 'text-foreground' : 'text-muted-foreground'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Library className="w-4 h-4" />
                <span>Library</span>
              </Link>

              <Link
                href="/upload"
                className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                  pathname?.startsWith('/upload') ? 'text-foreground' : 'text-muted-foreground'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </Link>

              <Link
                href="/visualizations"
                className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                  pathname?.startsWith('/visualizations') ? 'text-foreground' : 'text-muted-foreground'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Visualizations</span>
              </Link>

              {user && (
                <>
                  <div className="border-t border-border pt-4">
                    <span className="text-sm text-muted-foreground block mb-2">
                      {user.full_name || user.email}
                    </span>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Chat Drawer */}
      {user && (
        <ChatDrawer 
          isOpen={chatOpen} 
          onClose={() => setChatOpen(false)} 
          userId={user.id}
        />
      )}
    </>
  )
}
