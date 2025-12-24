'use client'

import { useState } from 'react'
import { getCardImageUrl } from '@/lib/utils'
import VerificationBadge from '@/components/VerificationBadge'
import type { Driver, Trend, Signal } from '@/lib/types'

interface RelatedResearchTabsProps {
  drivers: Driver[]
  trends: Trend[]
  signals: Signal[]
  hideEvidence?: boolean
}

export default function RelatedResearchTabs({
  drivers,
  trends,
  signals,
  hideEvidence = false
}: RelatedResearchTabsProps) {
  const [activeTab, setActiveTab] = useState<'drivers' | 'trends' | 'signals'>('drivers')

  const tabs = [
    { id: 'drivers' as const, label: `Drivers (${drivers.length})`, count: drivers.length },
    { id: 'trends' as const, label: `Trends (${trends.length})`, count: trends.length },
    { id: 'signals' as const, label: `Signals (${signals.length})`, count: signals.length }
  ]

  const activeContent = activeTab === 'drivers' ? drivers : activeTab === 'trends' ? trends : signals

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-radar-primary text-radar-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {activeContent.map((item: any) => {
            const name = item.driver_name || item.trend_name || item.signal_name
            const steepCategory = item.steep_categories?.[0]
            
            return (
              <div
                key={item.id}
                className="flex-none w-48 bg-white border border-border rounded-lg overflow-hidden hover:shadow-card-hover transition-shadow cursor-pointer flex flex-col h-56"
              >
                <div
                  className="h-24 bg-cover bg-center flex-shrink-0"
                  style={{ backgroundImage: `url(${getCardImageUrl(item)})` }}
                />
                <div className="p-3 flex flex-col flex-1">
                  <h4 className="font-medium text-sm line-clamp-3 leading-tight mb-auto">
                    {name}
                  </h4>
                  
                  {/* Footer anchored to bottom */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    {steepCategory ? (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {steepCategory.name}
                      </span>
                    ) : (
                      <div />
                    )}
                    <VerificationBadge status={item.verification_status} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {activeContent.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No {activeTab} found
          </div>
        )}
      </div>
    </div>
  )
}
