'use client'

import { useState, useEffect } from 'react'
import { X, Edit2, Check, XCircle, Bot } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getCardImageUrl } from '@/lib/utils'
import TaxonomyGrid from './TaxonomyGrid'
import RelatedResearchTabs from './RelatedResearchTabs'
import type { Trend, Driver, Signal } from '@/lib/types'

interface TrendDetailProps {
  trend: Trend
  relatedDrivers: Driver[]
  relatedSignals: Signal[]
  relatedEvidence: any[]
  userId: string
}

export default function TrendDetail({
  trend,
  relatedDrivers,
  relatedSignals,
  relatedEvidence,
  userId
}: TrendDetailProps) {
  // Flatten junction table data
  const flatTrend = {
    ...trend,
    topics: trend.trends_topics?.map((j: any) => j.topics).filter(Boolean) || [],
    categories: trend.trends_categories?.map((j: any) => j.categories).filter(Boolean) || [],
    steep_categories: trend.trends_steep_categories?.map((j: any) => j.steep_categories).filter(Boolean) || [],
    geographical_focus: trend.trends_geographical_focus?.map((j: any) => j.geographical_focus).filter(Boolean) || [],
    industries: trend.trends_hubspot_industries?.map((j: any) => j.hubspot_industries).filter(Boolean) || []
  }

  const router = useRouter()
  const [allOptions, setAllOptions] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTrend, setEditedTrend] = useState(flatTrend)
  const [isSaving, setIsSaving] = useState(false)
  const [showSteepDropdown, setShowSteepDropdown] = useState(false)

  // Load taxonomy options
  useEffect(() => {
    async function loadOptions() {
      const response = await fetch('/api/taxonomy/options')
      const data = await response.json()
      setAllOptions(data)
    }
    if (isEditing) loadOptions()
  }, [isEditing])

  const handleClose = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab') || 'uploads';
    router.push(`/library?tab=${tab}`);
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = {
        id: flatTrend.id,
        trend_name: editedTrend.trend_name,
        description: editedTrend.description,
        trend_type: editedTrend.trend_type,
        time_horizon: editedTrend.time_horizon,
        impact_potential: editedTrend.impact_potential,
        impact_description: editedTrend.impact_description,
        likelihood: editedTrend.likelihood,
        trend_type_description: editedTrend.trend_type_description,
        time_horizon_description: editedTrend.time_horizon_description,
        impact_potential_description: editedTrend.impact_potential_description,
        likelihood_description: editedTrend.likelihood_description,
        categories: editedTrend.categories?.map(c => c.id) || [],
        topics: editedTrend.topics?.map(t => t.id) || [],
        steep_categories: editedTrend.steep_categories?.map(s => s.id) || [],
        geographical_focus: editedTrend.geographical_focus?.map(g => g.id) || [],
        industries: editedTrend.industries?.map(i => i.id) || []
      }
      
      const response = await fetch('/api/trends/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        window.location.reload()
      }
    } catch (err) {
      console.error('Save failed:', err)
    }
    setIsSaving(false)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedTrend(flatTrend)
    setIsEditing(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-muted rounded-full text-xs font-nav font-medium">
                TREND
              </span>
              {!isEditing && flatTrend.steep_categories && flatTrend.steep_categories.map((steep: any) => (
                <span 
                  key={steep.id}
                  className="px-3 py-1 rounded-full text-xs font-nav font-medium"
                  style={{ backgroundColor: steep.color_code + '20', color: steep.color_code }}
                >
                  {steep.name}
                </span>
              ))}
              {isEditing && (
                <div className="flex items-center gap-2">
                  {editedTrend.steep_categories?.map((steep: any) => (
                    <span 
                      key={steep.id}
                      className="px-3 py-1 rounded-full text-xs font-nav font-medium inline-flex items-center gap-2"
                      style={{ backgroundColor: steep.color_code + '20', color: steep.color_code }}
                    >
                      {steep.name}
                      <button
                        onClick={() => {
                          const updated = editedTrend.steep_categories?.filter((s: any) => s.id !== steep.id) || [];
                          setEditedTrend({ ...editedTrend, steep_categories: updated });
                        }}
                        className="hover:opacity-70"
                      >
                        <XCircle className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {allOptions?.steep && (
                    <div className="relative">
                      <button
                        onClick={() => setShowSteepDropdown(!showSteepDropdown)}
                        className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors inline-flex items-center gap-2"
                      >
                        + Add STEEP
                      </button>
                      {showSteepDropdown && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowSteepDropdown(false)}
                          />
                          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-border rounded-lg shadow-lg z-20 max-h-60 overflow-auto">
                            {allOptions.steep
                              .filter((s: any) => !editedTrend.steep_categories?.find((sc: any) => sc.id === s.id))
                              .map((s: any) => (
                                <button
                                  key={s.id}
                                  onClick={() => {
                                    setEditedTrend({ 
                                      ...editedTrend, 
                                      steep_categories: [...(editedTrend.steep_categories || []), s] 
                                    });
                                    setShowSteepDropdown(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                                >
                                  {s.name}
                                </button>
                              ))
                            }
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
                    title="Cancel"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="p-2 hover:bg-muted rounded-lg transition-colors text-radar-primary"
                    title="Save"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={handleClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Header Image */}
            <div
              className="w-full h-64 bg-cover bg-center rounded-lg"
              style={{ backgroundImage: `url(${getCardImageUrl(trend)})` }}
            />

            {/* Title */}
            {isEditing ? (
              <input
                type="text"
                value={editedTrend.trend_name}
                onChange={(e) => setEditedTrend({ ...editedTrend, trend_name: e.target.value })}
                className="w-full text-3xl font-headline font-bold border-b-2 border-border focus:border-radar-primary outline-none pb-2"
              />
            ) : (
              <h1 className="text-3xl font-headline font-bold">{trend.trend_name}</h1>
            )}

            {/* Description */}
            {isEditing ? (
              <textarea
                value={editedTrend.description || ''}
                onChange={(e) => setEditedTrend({ ...editedTrend, description: e.target.value })}
                placeholder="Description"
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:border-radar-primary outline-none resize-none"
              />
            ) : (
              trend.description && (
                <p className="text-foreground leading-relaxed">{trend.description}</p>
              )
            )}

            {/* Extracted From */}
            {trend.source_documents && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
                  <Bot className="w-4 h-4" />
                  <span>Extracted from:</span>
                </div>
                <button 
                  onClick={() => router.push(`/library/reports/${trend.extracted_from}`)}
                  className="font-medium text-radar-primary hover:underline text-left"
                >
                  {trend.source_documents.title}
                </button>
              </div>
            )}

            {/* Observation Date */}
            {trend.observation_date && (
              <div className="text-sm text-muted-foreground">
                Observed: {new Date(trend.observation_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            )}

            {/* Trend-Specific Fields */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Trend Characteristics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Trend Strength */}
                <div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className="text-muted-foreground">Trend Strength:</span>
                    {isEditing ? (
                      <select
                        value={editedTrend.trend_type || ''}
                        onChange={(e) => setEditedTrend({ ...editedTrend, trend_type: e.target.value })}
                        className="flex-1 px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm"
                      >
                        <option value="">Select...</option>
                        <option value="emerging_trend">Emerging Trend</option>
                        <option value="strong_trend">Strong Trend</option>
                        <option value="weak_signal">Weak Signal</option>
                      </select>
                    ) : (
                      <span className="font-medium">
                        {trend.trend_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '—'}
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <textarea
                      value={editedTrend.trend_type_description || ''}
                      onChange={(e) => setEditedTrend({ ...editedTrend, trend_type_description: e.target.value })}
                      placeholder="Describe trend strength..."
                      rows={2}
                      className="w-full px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm resize-none"
                    />
                  )}
                  {!isEditing && trend.trend_type_description && (
                    <p className="text-sm text-muted-foreground mt-1">{trend.trend_type_description}</p>
                  )}
                </div>

                {/* Time Horizon */}
                <div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className="text-muted-foreground">Time Horizon:</span>
                    {isEditing ? (
                      <select
                        value={editedTrend.time_horizon || ''}
                        onChange={(e) => setEditedTrend({ ...editedTrend, time_horizon: e.target.value })}
                        className="flex-1 px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm"
                      >
                        <option value="">Select...</option>
                        <option value="short_term">0-2 years</option>
                        <option value="medium_term">2-5 years</option>
                        <option value="long_term">5+ years</option>
                      </select>
                    ) : (
                      <span className="font-medium">
                        {trend.time_horizon === 'short_term' ? '0-2 years' : 
                         trend.time_horizon === 'medium_term' ? '2-5 years' :
                         trend.time_horizon === 'long_term' ? '5+ years' : '—'}
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <textarea
                      value={editedTrend.time_horizon_description || ''}
                      onChange={(e) => setEditedTrend({ ...editedTrend, time_horizon_description: e.target.value })}
                      placeholder="Describe time horizon..."
                      rows={2}
                      className="w-full px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm resize-none"
                    />
                  )}
                  {!isEditing && trend.time_horizon_description && (
                    <p className="text-sm text-muted-foreground mt-1">{trend.time_horizon_description}</p>
                  )}
                </div>

                {/* Impact Potential */}
                <div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className="text-muted-foreground">Impact Potential:</span>
                    {isEditing ? (
                      <select
                        value={editedTrend.impact_potential || ''}
                        onChange={(e) => setEditedTrend({ ...editedTrend, impact_potential: e.target.value })}
                        className="flex-1 px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm"
                      >
                        <option value="">Select...</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="transformative">Transformative</option>
                      </select>
                    ) : (
                      <span className="font-medium">
                        {trend.impact_potential?.replace(/\b\w/g, l => l.toUpperCase()) || '—'}
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <textarea
                      value={editedTrend.impact_potential_description || ''}
                      onChange={(e) => setEditedTrend({ ...editedTrend, impact_potential_description: e.target.value })}
                      placeholder="Describe impact potential..."
                      rows={2}
                      className="w-full px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm resize-none"
                    />
                  )}
                  {!isEditing && trend.impact_potential_description && (
                    <p className="text-sm text-muted-foreground mt-1">{trend.impact_potential_description}</p>
                  )}
                </div>

                {/* Likelihood */}
                <div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className="text-muted-foreground">Likelihood:</span>
                    {isEditing ? (
                      <select
                        value={editedTrend.likelihood || ''}
                        onChange={(e) => setEditedTrend({ ...editedTrend, likelihood: e.target.value })}
                        className="flex-1 px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm"
                      >
                        <option value="">Select...</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="very_high">Very High</option>
                      </select>
                    ) : (
                      <span className="font-medium">
                        {trend.likelihood?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '—'}
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <textarea
                      value={editedTrend.likelihood_description || ''}
                      onChange={(e) => setEditedTrend({ ...editedTrend, likelihood_description: e.target.value })}
                      placeholder="Describe likelihood..."
                      rows={2}
                      className="w-full px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm resize-none"
                    />
                  )}
                  {!isEditing && trend.likelihood_description && (
                    <p className="text-sm text-muted-foreground mt-1">{trend.likelihood_description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Taxonomy Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Taxonomy</h3>
              <TaxonomyGrid
                isEditing={isEditing}
                allOptions={allOptions}
                onUpdate={(field, items) => {
                  const mappedField = field === 'geographicalFocus' ? 'geographical_focus' : field;
                  setEditedTrend({ ...editedTrend, [mappedField]: items });
                }}
                categories={editedTrend.categories || flatTrend.categories}
                topics={editedTrend.topics || flatTrend.topics}
                industries={editedTrend.industries || flatTrend.industries}
                geographicalFocus={editedTrend.geographical_focus || flatTrend.geographical_focus}
              />
            </div>

            {/* Related Research */}
            <div className="pt-6 border-t border-border">
              <h2 className="text-xl font-semibold mb-4">Related Research</h2>
              <RelatedResearchTabs
                drivers={relatedDrivers}
                signals={relatedSignals}
                evidence={relatedEvidence}
                hideTrends={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
