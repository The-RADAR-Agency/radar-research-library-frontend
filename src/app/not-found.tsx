'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function NotFound() {
  const router = useRouter()
  const [currentGif, setCurrentGif] = useState(0)
  
  const gifs = [
    '/404-gifs/scooby-search.gif',
    '/404-gifs/cat-math.gif'
  ]

  // Rotate gifs every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGif((prev) => (prev + 1) % gifs.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-8">
      <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl">
        {/* Text Content - Left Justified 404, Centered message/link */}
        <div className="text-left order-1 md:order-none">
          {/* 404 Text - Microgramma - Left Justified */}
          <h1 className="text-9xl font-nav font-bold text-gray-900 mb-3 tracking-wider">
            404
          </h1>
          
          {/* Message - Centered under 404, tight spacing */}
          <div className="text-center space-y-3">
            <p className="text-xl text-gray-600 font-light">
              Lost, not yet found.
            </p>

            {/* Subtle Return Link */}
            <button
              onClick={() => router.push('/library')}
              className="text-gray-500 hover:text-radar-primary transition-colors text-sm font-normal underline underline-offset-4"
            >
              ← Return to Library
            </button>
          </div>
        </div>

        {/* Gif */}
        <div className="relative w-80 h-80 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 order-2 md:order-none">
          <Image
            src={gifs[currentGif]}
            alt="404 animation"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </div>
    </div>
  )
}