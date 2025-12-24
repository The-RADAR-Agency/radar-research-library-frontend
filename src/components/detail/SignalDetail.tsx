'use client'

import { useState, useEffect } from 'react'
import { X, Edit2, Check, XCircle, Bot } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getCardImageUrl } from '@/lib/utils'
import TaxonomyGrid from './TaxonomyGrid'
import RelatedResearchTabs from './RelatedResearchTabs'
import type { Signal, Driver, Trend } from '@/lib/types'

interface SignalDetailProps {
  signal: Signal
  relatedDrivers: Driver[]
  relatedTrends: Trend[]
  relatedEvidence: any[]
  userId: string
}

export default function SignalDetail({
  signal,
  relatedDrivers,
  relatedTrends,
  relatedEvidence,
  userId
}: SignalDetailProps) {
  // Flatten junction table data
  const flatSignal = {
    ...signal,
    topics: signal.signals_topics?.map((j: any) => j.topics).filter(Boolean) || [],
    categories: signal.signals_categories?.map((j: any) => j.categories).filter(Boolean) || [],
    steep_categories: signal.signals_steep_categories?.map((j: any) => j.steep_categories).filter(Boolean) || [],
    geographical_focus: signal.signals_geographical_focus?.map((j: any) => j.geographical_focus).filter(Boolean) || [],
    industries: signal.signals_hubspot_industries?.map((j: any) => j.hubspot_industries).filter(Boolean) || []
  }

  const router = useRouter()
  const [allOptions, setAllOptions] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedSignal, setEditedSignal] = useState(flatSignal)
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
        id: flatSignal.id,
        signal_name: editedSignal.signal_name,
        description: editedSignal.description,
        strength: editedSignal.strength,
        potential_impact: editedSignal.potential_impact,
        impact_description: editedSignal.impact_description,
        strength_description: editedSignal.strength_description,
        impact_description: editedSignal.impact_description,
        categories: editedSignal.categories?.map(c => c.id) || [],
        topics: editedSignal.topics?.map(t => t.id) || [],
        steep_categories: editedSignal.steep_categories?.map(s => s.id) || [],
        geographical_focus: editedSignal.geographical_focus?.map(g => g.id) || [],
        industries: editedSignal.industries?.map(i => i.id) || []
      }
      
      const response = await fetch('/api/signals/save', {
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
    setEditedSignal(flatSignal)
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
                SIGNAL
              </span>
              {!isEditing && flatSignal.steep_categories && flatSignal.steep_categories.map((steep: any) => (
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
                  {editedSignal.steep_categories?.map((steep: any) => (
                    <span 
                      key={steep.id}
                      className="px-3 py-1 rounded-full text-xs font-nav font-medium inline-flex items-center gap-2"
                      style={{ backgroundColor: steep.color_code + '20', color: steep.color_code }}
                    >
                      {steep.name}
                      <button
                        onClick={() => {
                          const updated = editedSignal.steep_categories?.filter((s: any) => s.id !== steep.id) || [];
                          setEditedSignal({ ...editedSignal, steep_categories: updated });
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
                              .filter((s: any) => !editedSignal.steep_categories?.find((sc: any) => sc.id === s.id))
                              .map((s: any) => (
                                <button
                                  key={s.id}
                                  onClick={() => {
                                    setEditedSignal({ 
                                      ...editedSignal, 
                                      steep_categories: [...(editedSignal.steep_categories || []), s] 
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
              style={{ backgroundImage: `url(${getCardImageUrl(signal)})` }}
            />

            {/* Title */}
            {isEditing ? (
              <input
                type="text"
                value={editedSignal.signal_name}
                onChange={(e) => setEditedSignal({ ...editedSignal, signal_name: e.target.value })}
                className="w-full text-3xl font-headline font-bold border-b-2 border-border focus:border-radar-primary outline-none pb-2"
              />
            ) : (
              <h1 className="text-3xl font-headline font-bold">{signal.signal_name}</h1>
            )}

            {/* Description */}
            {isEditing ? (
              <textarea
                value={editedSignal.description || ''}
                onChange={(e) => setEditedSignal({ ...editedSignal, description: e.target.value })}
                placeholder="Description"
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:border-radar-primary outline-none resize-none"
              />
            ) : (
              signal.description && (
                <p className="text-foreground leading-relaxed">{signal.description}</p>
              )
            )}

            {/* Extracted From */}
            {signal.source_documents && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
                  <Bot className="w-4 h-4" />
                  <span>Extracted from:</span>
                </div>
                <button 
                  onClick={() => router.push(`/library/reports/${signal.extracted_from}`)}
                  className="font-medium text-radar-primary hover:underline text-left"
                >
                  {signal.source_documents.title}
                </button>
              </div>
            )}

            {/* Observation Date */}
            {signal.observation_date && (
              <div className="text-sm text-muted-foreground">
                Observed: {new Date(signal.observation_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            )}

            {/* Signal-Specific Fields */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Signal Characteristics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Signal Strength */}
                <div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className="text-muted-foreground">Signal Strength:</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <select
                          value={editedSignal.strength || ""}
                          onChange={(e) => setEditedSignal({ ...editedSignal, strength: e.target.value })}
                          className="px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm"
                        >
                          <option value="">Select...</option>
                          <option value="weak_signal">Weak Signal</option>
                          <option value="moderate_signal">Moderate Signal</option>
                          <option value="strong_signal">Strong Signal</option>
                          <option value="very_strong_signal">Very Strong Signal</option>
                        </select>
                        <textarea
                          value={editedSignal.strength_description || ""}
                          onChange={(e) => setEditedSignal({ ...editedSignal, strength_description: e.target.value })}
                          placeholder="Describe strength..."
                          rows={2}
                          className="flex-1 px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm resize-none"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {signal.strength?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "—"}
                        </span>
                        {signal.strength_description && (
                          <div className="relative group">
                            <svg className="w-4 h-4 text-muted-foreground cursor-help" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                              {signal.strength_description}
                              <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Impact Potential */}
                <div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className="text-muted-foreground">Impact Potential:</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <select
                          value={editedSignal.potential_impact || ""}
                          onChange={(e) => setEditedSignal({ ...editedSignal, impact_potential: e.target.value })}
                          className="px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm"
                        >
                          <option value="">Select...</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="transformative">Transformative</option>
                        </select>
                        <textarea
                          value={editedSignal.impact_description || ""}
                          onChange={(e) => setEditedSignal({ ...editedSignal, impact_description: e.target.value })}
                          placeholder="Describe impact..."
                          rows={2}
                          className="flex-1 px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm resize-none"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {signal.potential_impact?.replace(/\b\w/g, l => l.toUpperCase()) || "—"}
                        </span>
                        {signal.impact_description && (
                          <div className="relative group">
                            <svg className="w-4 h-4 text-muted-foreground cursor-help" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                              {signal.impact_description}
                              <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
                  setEditedSignal({ ...editedSignal, [mappedField]: items });
                }}
                categories={editedSignal.categories || flatSignal.categories}
                topics={editedSignal.topics || flatSignal.topics}
                industries={editedSignal.industries || flatSignal.industries}
                geographicalFocus={editedSignal.geographical_focus || flatSignal.geographical_focus}
              />
            </div>

            {/* Related Research */}
            <div className="pt-6 border-t border-border">
              <h2 className="text-xl font-semibold mb-4">Related Research</h2>
              <RelatedResearchTabs
                drivers={relatedDrivers}
                trends={relatedTrends}
                evidence={relatedEvidence}
                hideSignals={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
