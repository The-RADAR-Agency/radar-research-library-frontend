import { Bot, CheckCircle } from 'lucide-react'

interface VerificationBadgeProps {
  status: string
  className?: string
}

export default function VerificationBadge({ status, className = '' }: VerificationBadgeProps) {
  if (status === 'verified' || status === 'Verified') {
    return (
      <div className={`inline-flex items-center text-green-600 ${className}`}>
        <CheckCircle className="w-4 h-4" />
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center text-muted-foreground ${className}`}>
      <Bot className="w-4 h-4" />
    </div>
  )
}
