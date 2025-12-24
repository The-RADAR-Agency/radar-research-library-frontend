'use client'

import { useState } from 'react'
import { getCardImageUrl, formatDate } from '@/lib/utils'
import VerificationBadge from '@/components/VerificationBadge'
import type { Driver, Trend, Signal } from '@/lib/types'

interface RelatedResearchTabsProps {
  drivers?: Driver[]
  trends?: Trend[]
  signals?: Signal[]
  evidence?: any[]
  hideDrivers?: boolean
  hideEvidence?: boolean
}

export default function RelatedResearchTabs({
  drivers = [],
  trends = [],
  signals = [],
  evidence = [],
  hideDrivers = false,
  hideEvidence = false
}: RelatedResearchTabsProps) {
  
  // Build tabs array
  const allTabs = [
    !hideDrivers && drivers.length > 0 && { id: 'drivers' as const, label: `Drivers (${drivers.length})`, count: drivers.length, data: drivers },
    trends.length > 0 && { id: 'trends' as const, label: `Trends (${trends.length})`, count: trends.length, data: trends },
    signals.length > 0 && { id: 'signals' as const, label: `Signals (${signals.length})`, count: signals.length, data: signals },
    !hideEvidence && evidence.length > 0 && { id: 'evidence' as const, label: `Evidence (${evidence.length})`, count: evidence.length, data: evidence }
  ].filter(Boolean) as { id: string, label: string, count: number, data: any[] }[]

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
              <div key={item.id} className="w-48 flex-shrink-0">
                <div className="bg-white rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-card-hover h-56 flex flex-col">
                  <div 
                    className="h-24 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${getCardImageUrl(item)})` }}
                  />
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-headline font-semibold text-sm line-clamp-3 mb-auto">
                      {item.driver_name || item.trend_name || item.signal_name || item.title}
                    </h3>
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                      {item.steep_categories && item.steep_categories.length > 0 && (
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                          {item.steep_categories[0].name}
                        </span>
                      )}
                      <VerificationBadge status={item.verification_status} size="sm" />
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
