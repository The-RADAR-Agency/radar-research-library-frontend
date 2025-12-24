'use client'

import { useState, useEffect } from 'react'
import { X, Edit2, Check, XCircle, Bot } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getCardImageUrl, formatDate } from '@/lib/utils'
import VerificationBadge from '@/components/VerificationBadge'
import TaxonomyGrid from './TaxonomyGrid'
import RelatedResearchTabs from './RelatedResearchTabs'
import type { Driver, Trend, Signal } from '@/lib/types'

interface DriverDetailProps {
  driver: Driver
  relatedTrends: Trend[]
  relatedSignals: Signal[]
  relatedEvidence: any[]
  userId: string
}

export default function DriverDetail({
  driver,
  relatedTrends,
  relatedSignals,
  relatedEvidence,
  userId
}: DriverDetailProps) {
  // Flatten junction table data
  const flatDriver = {
    ...driver,
    topics: driver.drivers_topics?.map((j: any) => j.topics).filter(Boolean) || [],
    categories: driver.drivers_categories?.map((j: any) => j.categories).filter(Boolean) || [],
    steep_categories: driver.drivers_steep_categories?.map((j: any) => j.steep_categories).filter(Boolean) || [],
    geographical_focus: driver.drivers_geographical_focus?.map((j: any) => j.geographical_focus).filter(Boolean) || []
  }
  console.log('Original driver:', driver)
  console.log('Flattened driver:', flatDriver)

  const router = useRouter()
  const [allOptions, setAllOptions] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedDriver, setEditedDriver] = useState(flatDriver)
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
        id: flatDriver.id,
        driver_name: editedDriver.driver_name,
        description: editedDriver.description,
        categories: editedDriver.categories?.map(c => c.id) || [],
        topics: editedDriver.topics?.map(t => t.id) || [],
        steep_categories: editedDriver.steep_categories?.map(s => s.id) || [],
        geographical_focus: editedDriver.geographical_focus?.map(g => g.id) || [],
        industries: editedDriver.industries?.map(i => i.id) || []
      }
      
      const response = await fetch('/api/drivers/save', {
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
    setEditedDriver(driver)
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
                DRIVER
              </span>
              {!isEditing && flatDriver.steep_categories && flatDriver.steep_categories.map((steep: any) => (
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
                  {editedDriver.steep_categories?.map((steep: any) => (
                    <span 
                      key={steep.id}
                      className="px-3 py-1 rounded-full text-xs font-nav font-medium inline-flex items-center gap-2"
                      style={{ backgroundColor: steep.color_code + '20', color: steep.color_code }}
                    >
                      {steep.name}
                      <button
                        onClick={() => {
                          const updated = editedDriver.steep_categories?.filter((s: any) => s.id !== steep.id) || [];
                          setEditedDriver({ ...editedDriver, steep_categories: updated });
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
                              .filter((s: any) => !editedDriver.steep_categories?.find((sc: any) => sc.id === s.id))
                              .map((s: any) => (
                                <button
                                  key={s.id}
                                  onClick={() => {
                                    setEditedDriver({ 
                                      ...editedDriver, 
                                      steep_categories: [...(editedDriver.steep_categories || []), s] 
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
              style={{ backgroundImage: `url(${getCardImageUrl(driver)})` }}
            />

            {/* Title */}
            {isEditing ? (
              <input
                type="text"
                value={editedDriver.driver_name}
                onChange={(e) => setEditedDriver({ ...editedDriver, driver_name: e.target.value })}
                className="w-full text-3xl font-headline font-bold border-b-2 border-border focus:border-radar-primary outline-none pb-2"
              />
            ) : (
              <h1 className="text-3xl font-headline font-bold">{driver.driver_name}</h1>
            )}

            {/* Description */}
            {isEditing ? (
              <textarea
                value={editedDriver.description || ''}
                onChange={(e) => setEditedDriver({ ...editedDriver, description: e.target.value })}
                placeholder="Description"
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:border-radar-primary outline-none resize-none"
              />
            ) : (
              driver.description && (
                <p className="text-foreground leading-relaxed">{driver.description}</p>
              )
            )}

            {/* Extracted From */}
            {driver.source_documents && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bot className="w-4 h-4" />
                <span>Extracted from: </span>
                <button 
                  onClick={() => router.push(`/library/reports/${driver.extracted_from}`)}
                  className="font-medium text-radar-primary hover:underline"
                >
                  {driver.source_documents.title}
                </button>
              </div>
            )}

            {/* Observation Date */}
            {driver.observation_date && (
              <div className="text-sm text-muted-foreground">
                Observed: {new Date(driver.observation_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            )}

            {/* Taxonomy Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Taxonomy</h3>
              <TaxonomyGrid
                isEditing={isEditing}
                allOptions={allOptions}
                onUpdate={(field, items) => {
                  // Map geographicalFocus to geographical_focus for consistency
                  const mappedField = field === 'geographicalFocus' ? 'geographical_focus' : field;
                  setEditedDriver({ ...editedDriver, [mappedField]: items });
                }}
                categories={editedDriver.categories || flatDriver.categories}
                topics={editedDriver.topics || flatDriver.topics}
                industries={editedDriver.industries || []}
                geographicalFocus={editedDriver.geographical_focus || flatDriver.geographical_focus}
              />
            </div>

            

            {/* Related Research */}
            <div className="pt-6 border-t border-border">
              <h2 className="text-xl font-semibold mb-4">Related Research</h2>
              <RelatedResearchTabs
                trends={relatedTrends}
                signals={relatedSignals}
                evidence={relatedEvidence}
                hideDrivers={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
