import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Background image files from public/brand-assets/
const BACKGROUND_IMAGES = [
  'RTA black texture .png',
  'RTA ORANGE BRUSHED.png',
  'RTA dark blue texture.png',
  // Add more as needed
]

export function getRandomBackgroundImage(id: string): string {
  const index = hashString(id) % BACKGROUND_IMAGES.length
  const fileName = BACKGROUND_IMAGES[index]
  return `/brand-assets/Radar Agency Design Assets/3. Background Images_Textures/${fileName}`
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function getCardImageUrl(entity: { 
  id: string
  card_image_url?: string | null
  file_url?: string | null
  document_type?: string
}): string {
  // For trend reports, try to use the PDF thumbnail
  if (entity.document_type === 'trend_report' && entity.file_url) {
    // TODO: Generate PDF thumbnail - for now use random background
    return getRandomBackgroundImage(entity.id)
  }
  
  // Use card_image_url if available
  if (entity.card_image_url) {
    return entity.card_image_url
  }
  
  // Fall back to random background
  return getRandomBackgroundImage(entity.id)
}

export function formatDocumentType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
