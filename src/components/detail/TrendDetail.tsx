'use client'

import { useState, useEffect } from 'react'
import { X, Edit2, Check, XCircle, Bot } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCardImageUrl, getImageStyle, truncateText } from '@/lib/utils'
import TaxonomyGrid from './TaxonomyGrid'
import RelatedResearchTabs from './RelatedResearchTabs'
import ImageUpload from '../ImageUpload'
import type { Trend, Driver, Signal } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { filterByVisibility } from '@/lib/data/visibility'

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
  const searchParams = useSearchParams()
  const [prevTrendId, setPrevTrendId] = useState<string | null>(null)
  const [nextTrendId, setNextTrendId] = useState<string | null>(null)
  
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
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  // Load taxonomy options
  useEffect(() => {
    async function loadOptions() {
      const response = await fetch('/api/taxonomy/options')
      const data = await response.json()
      setAllOptions(data)
    }
    if (isEditing) loadOptions()
  }, [isEditing])

  // Load prev/next trend IDs
  useEffect(() => {
    async function loadNavigation() {
      try {
        const supabase = createClient()
        
        const { data: reports } = await supabase.from('source_documents').select('*')
        const { data: allTrends } = await supabase
          .from('trends')
          .select('id, created_at, trends_topics(topics(id)), trends_categories(categories(id)), trends_steep_categories(steep_categories(id)), trends_geographical_focus(geographical_focus(id)), trends_hubspot_industries(hubspot_industries(id))')
          .order('created_at', { ascending: true })
        
        if (!allTrends || !reports) return
        
        const filters = {
          topics: searchParams.get('topics')?.split(',').filter(Boolean) || [],
          categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
          steep: searchParams.get('steep')?.split(',').filter(Boolean) || [],
          geographies: searchParams.get('geographies')?.split(',').filter(Boolean) || [],
          industries: searchParams.get('industries')?.split(',').filter(Boolean) || [],
          visibility: searchParams.get('visibility') || 'All'
        }
        
        const filterLogic = searchParams.get('filterLogic') === 'AND' ? 'AND' : 'OR'
        let filtered = filterByVisibility(allTrends, userId, reports, filters.visibility as any)
        
        // Apply filters (abbreviated for now)
        if (filters.topics.length > 0) {
          filtered = filtered.filter((t: any) => t.trends_topics?.some((j: any) => filters.topics.includes(j.topics?.id)))
        }
        
        const currentIndex = filtered.findIndex((t: any) => t.id === trend.id)
        
        if (currentIndex !== -1) {
          setPrevTrendId(currentIndex > 0 ? filtered[currentIndex - 1].id : null)
          setNextTrendId(currentIndex < filtered.length - 1 ? filtered[currentIndex + 1].id : null)
        }
      } catch (error) {
        console.error('Navigation loading error:', error)
      }
    }
    
    loadNavigation()
  }, [trend.id, userId, searchParams.toString()])

  const handleVerify = async () => {
    setIsVerifying(true)
    try {
      const response = await fetch('/api/trends/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: flatTrend.id,
          verification_notes: verificationNotes,
          verified_by: userId
        })
      })
      
      if (response.ok) {
        window.location.reload()
      }
    } catch (err) {
      console.error('Verification failed:', err)
    }
    setIsVerifying(false)
  }

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
        impact_description: editedTrend.impact_description,
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
                <>
                  {!trend.verified_by && (
                    <button
                      onClick={() => setShowVerifyModal(true)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Verify"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9 12l2 2 4-4"/>
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </>
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
            <div className="relative">
              <div
                className="w-full h-64 bg-cover bg-center rounded-lg"
                style={{ backgroundImage: `url(${getCardImageUrl(trend)})` }}
              />
              <ImageUpload
                currentImageUrl={getCardImageUrl(trend)}
                entityType="trend"
                entityId={trend.id}
                isEditing={isEditing}
              />
            </div>
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

            {/* Attribution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {/* Extracted From */}
              {trend.source_documents && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span>Extracted from </span>
                    <button 
                      onClick={() => router.push(`/library/reports/${trend.extracted_from}`)}
                      className="font-medium text-radar-primary hover:underline"
                      title={trend.source_documents.title}
                    >
                      {truncateText(trend.source_documents.title, 60)}
                    </button>
                    {trend.source_documents.upload_date && (
                      <span> on {new Date(trend.source_documents.upload_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Observed */}
              {trend.observation_date && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <div className="flex-1">
                    <span>Observed {new Date(trend.observation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Trend-Specific Fields */}
            <div className="border-t border-border pt-6 space-y-3">
              <h3 className="text-lg font-semibold">Trend Characteristics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Trend Strength */}
                <div>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <span className="text-muted-foreground">Trend Strength:</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <select
                          value={editedTrend.trend_type || ''}
                          onChange={(e) => setEditedTrend({ ...editedTrend, trend_type: e.target.value })}
                          className="px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm"
                        >
                          <option value="">Select...</option>
                          <option value="emerging_trend">Emerging Trend</option>
                          <option value="strong_trend">Strong Trend</option>
                          <option value="weak_signal">Weak Signal</option>
                        </select>
                        <textarea
                          value={editedTrend.trend_type_description || ''}
                          onChange={(e) => setEditedTrend({ ...editedTrend, trend_type_description: e.target.value })}
                          placeholder="Describe trend strength..."
                          rows={2}
                          className="flex-1 px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm resize-none"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {trend.trend_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '—'}
                        </span>
                        {trend.trend_type_description && (
                          <div className="relative group">
                            <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            <div className="absolute left-0 top-full mt-1 w-64 p-3 bg-white border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none">
                              <p className="text-xs text-gray-600 leading-relaxed">{trend.trend_type_description}</p>
                              
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Horizon */}
                <div>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <span className="text-muted-foreground">Time Horizon:</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <select
                          value={editedTrend.time_horizon || ''}
                          onChange={(e) => setEditedTrend({ ...editedTrend, time_horizon: e.target.value })}
                          className="px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm"
                        >
                          <option value="">Select...</option>
                          <option value="short_term">0-2 years</option>
                          <option value="medium_term">2-5 years</option>
                          <option value="long_term">5+ years</option>
                        </select>
                        <textarea
                          value={editedTrend.time_horizon_description || ''}
                          onChange={(e) => setEditedTrend({ ...editedTrend, time_horizon_description: e.target.value })}
                          placeholder="Describe time horizon..."
                          rows={2}
                          className="flex-1 px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm resize-none"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {trend.time_horizon === 'short_term' ? '0-2 years' : 
                           trend.time_horizon === 'medium_term' ? '2-5 years' :
                           trend.time_horizon === 'long_term' ? '5+ years' : '—'}
                        </span>
                        {trend.time_horizon_description && (
                          <div className="relative group">
                            <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            <div className="absolute left-0 top-full mt-1 w-64 p-3 bg-white border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none">
                              {trend.time_horizon_description}
                              
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Impact Potential */}
                <div>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <span className="text-muted-foreground">Impact Potential:</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <select
                          value={editedTrend.impact_potential || ''}
                          onChange={(e) => setEditedTrend({ ...editedTrend, impact_potential: e.target.value })}
                          className="px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm"
                        >
                          <option value="">Select...</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="transformative">Transformative</option>
                        </select>
                        <textarea
                          value={editedTrend.impact_description || ''}
                          onChange={(e) => setEditedTrend({ ...editedTrend, impact_description: e.target.value })}
                          placeholder="Describe impact potential..."
                          rows={2}
                          className="flex-1 px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm resize-none"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {trend.impact_potential?.replace(/\b\w/g, l => l.toUpperCase()) || '—'}
                        </span>
                        {trend.impact_description && (
                          <div className="relative group">
                            <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            <div className="absolute left-0 top-full mt-1 w-64 p-3 bg-white border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none">
                              {trend.impact_description}
                              
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Likelihood */}
                <div>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <span className="text-muted-foreground">Likelihood:</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <select
                          value={editedTrend.likelihood || ''}
                          onChange={(e) => setEditedTrend({ ...editedTrend, likelihood: e.target.value })}
                          className="px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm"
                        >
                          <option value="">Select...</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="very_high">Very High</option>
                        </select>
                        <textarea
                          value={editedTrend.likelihood_description || ''}
                          onChange={(e) => setEditedTrend({ ...editedTrend, likelihood_description: e.target.value })}
                          placeholder="Describe likelihood..."
                          rows={2}
                          className="flex-1 px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm resize-none"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {trend.likelihood?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '—'}
                        </span>
                        {trend.likelihood_description && (
                          <div className="relative group">
                            <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            <div className="absolute left-0 top-full mt-1 w-64 p-3 bg-white border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none">
                              {trend.likelihood_description}
                              
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
                  setEditedTrend({ ...editedTrend, [mappedField]: items });
                }}
                categories={editedTrend.categories || flatTrend.categories}
                topics={editedTrend.topics || flatTrend.topics}
                industries={editedTrend.industries || flatTrend.industries}
                geographicalFocus={editedTrend.geographical_focus || flatTrend.geographical_focus}
              />
            </div>

            {/* Edit and Verification Status */}
            {(trend.last_edited_by_user || trend.verified_by_user) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {/* Last Edited By */}
                {trend.last_edited_by_user && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <Edit2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span>Edited by </span>
                      <span className="font-medium">{trend.last_edited_by_user.full_name}</span>
                      {trend.last_edited_at && (
                        <span> on {new Date(trend.last_edited_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Verified By */}
                {trend.verified_by_user && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                    <div className="flex-1">
                      <span>Verified by </span>
                      <span className="font-medium">{trend.verified_by_user.full_name}</span>
                      {trend.verification_date && (
                        <span> on {new Date(trend.verification_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      )}
                      {trend.verification_notes && (
                        <div className="relative group inline-block ml-1">
                          <svg className="w-3.5 h-3.5 text-gray-400 cursor-help inline" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                          </svg>
                          <div className="absolute left-0 top-full mt-1 w-64 p-3 bg-white border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none">
                            {trend.verification_notes}
                            
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

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

        {/* Verification Modal */}
        {showVerifyModal && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Verify Content</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This content was originally extracted by AI. Do you verify that it is accurate?
              </p>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Add verification notes (optional)..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:border-radar-primary outline-none resize-none text-sm mb-4"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setVerificationNotes('');
                  }}
                  className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="px-4 py-2 text-sm bg-radar-primary text-white rounded-lg hover:bg-radar-primary/90 transition-colors disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }