'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCardImageUrl, getImageStyle } from '@/lib/utils'
import VerificationBadge from '@/components/VerificationBadge'

interface RelatedResearchTabsProps {
  drivers: any[]
  trends: any[]
  signals: any[]
  evidence: any[]
  hideDrivers?: boolean
  hideTrends?: boolean
  hideSignals?: boolean
  hideEvidence?: boolean
}

export default function RelatedResearchTabs({
  drivers = [],
  trends = [],
  signals = [],
  evidence = [],
  hideDrivers = false,
  hideTrends = false,
  hideSignals = false,
  hideEvidence = false
}: RelatedResearchTabsProps) {
  
  // Build tabs array - only include non-hidden tabs with data
  const allTabs = [
    !hideDrivers && drivers.length > 0 && { id: 'drivers' as const, label: `Drivers (${drivers.length})`, count: drivers.length, data: drivers },
    !hideTrends && trends.length > 0 && { id: 'trends' as const, label: `Trends (${trends.length})`, count: trends.length, data: trends },
    !hideSignals && signals.length > 0 && { id: 'signals' as const, label: `Signals (${signals.length})`, count: signals.length, data: signals },
    !hideEvidence && evidence.length > 0 && { id: 'evidence' as const, label: `Evidence (${evidence.length})`, count: evidence.length, data: evidence }
  ].filter(Boolean) as { id: string, label: string, count: number, data: any[] }[]

  const router = useRouter()
  const [activeTab, setActiveTab] = useState(allTabs[0]?.id || 'trends')

  const activeTabData = allTabs.find(tab => tab.id === activeTab)
  const activeContent = activeTabData?.data || []

  if (allTabs.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No related research found</p>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {allTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-2 font-nav text-sm transition-colors relative ${
              activeTab === tab.id
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-radar-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Carousel */}
      <div className="relative">
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-4 pb-2">
            {activeContent.map((item: any) => (
              <div 
                key={item.id} 
                onClick={() => {
                  const type = activeTab === 'drivers' ? 'drivers' : activeTab === 'trends' ? 'trends' : activeTab === 'signals' ? 'signals' : 'evidence';
                  router.push(`/library/${type}/${item.id}`);
                }}
                className="w-48 flex-shrink-0 cursor-pointer"
              >
                <div className="bg-white rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-card-hover h-56 flex flex-col">
                  <div 
                    className="h-[58px] bg-cover bg-center" 
                    style={getImageStyle(item)}
                  />
                  <div className="p-3 flex-1 flex flex-col">
                    {activeTab === 'evidence' ? (
                      // Evidence: Non-italic body text
                      <p className="text-sm text-foreground line-clamp-4 leading-relaxed mb-auto">
                        {item.evidence_text}
                      </p>
                    ) : (
                      // Other entities: Headline + description
                      <>
                        <h3 className="font-headline font-semibold text-sm line-clamp-2 mb-1">
                          {item.driver_name || item.trend_name || item.signal_name || item.title}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-auto">
                            {item.description}
                          </p>
                        )}
                      </>
                    )}
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                      {item.steep_categories && item.steep_categories.length > 0 && (
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                          {item.steep_categories[0].name}
                        </span>
                      )}
                      <VerificationBadge entity={item} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {activeContent.length === 0 && (
              <p className="text-muted-foreground text-sm py-8">No {activeTab} found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}