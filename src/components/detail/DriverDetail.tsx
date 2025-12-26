'use client'

import { useState, useEffect } from 'react'
import { X, Edit2, Check, XCircle, Bot } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getCardImageUrl, getImageStyle, truncateText } from '@/lib/utils'
import TaxonomyGrid from './TaxonomyGrid'
import RelatedResearchTabs from './RelatedResearchTabs'
import ImageUpload from '../ImageUpload'
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

  const router = useRouter()
  const [allOptions, setAllOptions] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedDriver, setEditedDriver] = useState(flatDriver)
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

  const handleVerify = async () => {
    setIsVerifying(true)
    try {
      const response = await fetch('/api/drivers/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: flatDriver.id,
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
    const searchParams = new URLSearchParams(window.location.search)
    const tab = searchParams.get('tab') || 'uploads'
    router.push(`/library?tab=${tab}`)
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
    setEditedDriver(flatDriver)
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
                          const updated = editedDriver.steep_categories?.filter((s: any) => s.id !== steep.id) || []
                          setEditedDriver({ ...editedDriver, steep_categories: updated })
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
                                    })
                                    setShowSteepDropdown(false)
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
                  {!driver.verified_by && (
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
                style={{ backgroundImage: `url(${getCardImageUrl(driver)})` }}
              />
              <ImageUpload
                currentImageUrl={getCardImageUrl(driver)}
                entityType="driver"
                entityId={driver.id}
                isEditing={isEditing}
              />
            </div>
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

            {/* Attribution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {/* Extracted From */}
              {driver.source_documents && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span>Extracted from </span>
                    <button 
                      onClick={() => router.push(`/library/reports/${driver.extracted_from}`)}
                      className="font-medium text-radar-primary hover:underline"
                      title={driver.source_documents.title}
                    >
                      {truncateText(driver.source_documents.title, 60)}
                    </button>
                    {driver.source_documents.upload_date && (
                      <span> on {new Date(driver.source_documents.upload_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Observed */}
              {driver.observation_date && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <div className="flex-1">
                    <span>Observed {new Date(driver.observation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Taxonomy Grid */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold mb-3">Taxonomy</h3>
              <TaxonomyGrid
                isEditing={isEditing}
                allOptions={allOptions}
                onUpdate={(field, items) => {
                  const mappedField = field === 'geographicalFocus' ? 'geographical_focus' : field
                  setEditedDriver({ ...editedDriver, [mappedField]: items })
                }}
                categories={editedDriver.categories || flatDriver.categories}
                topics={editedDriver.topics || flatDriver.topics}
                industries={editedDriver.industries || flatDriver.industries}
                geographicalFocus={editedDriver.geographical_focus || flatDriver.geographical_focus}
              />
            </div>

            {/* Edit and Verification Status */}
            {(driver.last_edited_by_user || driver.verified_by_user) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {/* Last Edited By */}
                {driver.last_edited_by_user && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <Edit2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span>Edited by </span>
                      <span className="font-medium">{driver.last_edited_by_user.full_name}</span>
                      {driver.last_edited_at && (
                        <span> on {new Date(driver.last_edited_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Verified By */}
                {driver.verified_by_user && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                    <div className="flex-1">
                      <span>Verified by </span>
                      <span className="font-medium">{driver.verified_by_user.full_name}</span>
                      {driver.verification_date && (
                        <span> on {new Date(driver.verification_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      )}
                      {driver.verification_notes && (
                        <div className="relative group inline-block ml-1">
                          <svg className="w-4 h-4 text-muted-foreground cursor-help inline" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                          </svg>
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                            {driver.verification_notes}
                            <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
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
                trends={relatedTrends}
                signals={relatedSignals}
                evidence={relatedEvidence}
                drivers={[]}
              />
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
                    setShowVerifyModal(false)
                    setVerificationNotes('')
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
    </div>
  )
}