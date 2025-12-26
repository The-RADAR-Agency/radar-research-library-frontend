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

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

// All 20 background texture images
const ALL_BACKGROUNDS = Array.from({ length: 20 }, (_, i) => {
  const num = i + 1
  const ext = num === 19 || num === 20 ? 'jpg' : 'png'
  return `/brand-assets/backgrounds/${num}.${ext}`
})

export function getCardImageUrl(entity: { 
  id: string
  card_image_url?: string | null
  file_url?: string | null
  document_type?: string
  header_image_id?: string | null
  header_images?: {
    image_url: string
    thumbnail_url?: string | null
    crop_position?: { x: number; y: number; zoom: number } | null
  } | null
}): string {
  // Priority 1: Check for header_images (joined data from header_image_id)
  if (entity.header_images?.image_url) {
    return entity.header_images.image_url
  }

  // Priority 2: For trend reports, try to use the PDF thumbnail
  if (entity.document_type === 'trend_report' && entity.file_url) {
    // TODO: Generate PDF thumbnail - for now use random background
    const index = hashString(entity.id) % ALL_BACKGROUNDS.length
    return ALL_BACKGROUNDS[index]
  }
  
  // Priority 3: Use card_image_url if available
  if (entity.card_image_url) {
    return entity.card_image_url
  }
  
  // Priority 4: Fall back to random background based on entity ID
  const index = hashString(entity.id) % ALL_BACKGROUNDS.length
  return ALL_BACKGROUNDS[index]
}

export function getImageStyle(entity: { 
  header_images?: {
    image_url: string
    crop_position?: { x: number; y: number; zoom: number } | null
  } | null
}): React.CSSProperties {
  const cropPosition = entity.header_images?.crop_position || { x: 50, y: 50, zoom: 100 }
  
  return {
    backgroundImage: `url(${getCardImageUrl(entity)})`,
    backgroundPosition: `${cropPosition.x}% ${cropPosition.y}%`,
    backgroundSize: cropPosition.zoom === 100 ? 'cover' : `${cropPosition.zoom}%`,
    backgroundRepeat: 'no-repeat'
  }
}

export function formatDocumentType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}