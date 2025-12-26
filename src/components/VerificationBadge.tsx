import { Bot, Edit2 } from 'lucide-react'

interface VerificationBadgeProps {
  entity?: any
  status?: string
  className?: string
}

export default function VerificationBadge({ entity, status, className = '' }: VerificationBadgeProps) {
  console.log('VerificationBadge received:', { 
    entity_id: entity?.id, 
    last_edited_by: entity?.last_edited_by,
    last_edited_by_user: entity?.last_edited_by_user,
    verified_by: entity?.verified_by,
    verified_by_user: entity?.verified_by_user 
  });
  
  // New logic: Check verified_by, then last_edited_by, then default to robot
  if (entity) {
    // Priority: Verified > Edited > AI
    if (entity.verified_by || entity.verified_by_user) {
      return (
        <div className={`inline-flex items-center text-muted-foreground ${className}`}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </div>
      )
    }
    
    if (entity.last_edited_by || entity.last_edited_by_user) {
      return (
        <div className={`inline-flex items-center text-muted-foreground ${className}`}>
          <Edit2 className="w-4 h-4" />
        </div>
      )
    }
    
    // Default: AI extracted
    return (
      <div className={`inline-flex items-center text-muted-foreground ${className}`}>
        <Bot className="w-4 h-4" />
      </div>
    )
  }
  
  // Fallback to old status-based logic for backwards compatibility
  if (status === 'verified' || status === 'Verified') {
    return (
      <div className={`inline-flex items-center text-muted-foreground ${className}`}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center text-muted-foreground ${className}`}>
      <Bot className="w-4 h-4" />
    </div>
  )
}