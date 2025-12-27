'use client'

import { useState, useEffect } from 'react'
import { X, Edit2, Check, XCircle, Bot } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getCardImageUrl, truncateText } from '@/lib/utils'
import TaxonomyGrid from './TaxonomyGrid'
import RelatedResearchTabs from './RelatedResearchTabs'

interface EvidenceDetailProps {
  evidence: any
  relatedDrivers: any[]
  relatedTrends: any[]
  relatedSignals: any[]
  userId: string
}

export default function EvidenceDetail({
  evidence,
  relatedDrivers,
  relatedTrends,
  relatedSignals,
  userId
}: EvidenceDetailProps) {
  const flatEvidence = {
    ...evidence,
    topics: evidence.evidence_topics?.map((j: any) => j.topics).filter(Boolean) || [],
    categories: evidence.evidence_categories?.map((j: any) => j.categories).filter(Boolean) || [],
    steep_categories: evidence.evidence_steep_categories?.map((j: any) => j.steep_categories).filter(Boolean) || [],
    geographical_focus: evidence.evidence_geographical_focus?.map((j: any) => j.geographical_focus).filter(Boolean) || [],
    industries: evidence.evidence_hubspot_industries?.map((j: any) => j.hubspot_industries).filter(Boolean) || []
  }

  const router = useRouter()
  const [allOptions, setAllOptions] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedEvidence, setEditedEvidence] = useState(flatEvidence)
  const [isSaving, setIsSaving] = useState(false)
  const [showSteepDropdown, setShowSteepDropdown] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

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

  const handleVerify = async () => {
    setIsVerifying(true)
    try {
      const response = await fetch('/api/evidence/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: flatEvidence.id,
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

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = {
        id: flatEvidence.id,
        evidence_text: editedEvidence.evidence_text,
        evidence_type: editedEvidence.evidence_type,
        credibility_rating: editedEvidence.credibility_rating,
        methodology: editedEvidence.methodology,
        quantitative_value: editedEvidence.quantitative_value,
        source_link: editedEvidence.source_link,
        categories: editedEvidence.categories?.map((c: any) => c.id) || [],
        topics: editedEvidence.topics?.map((t: any) => t.id) || [],
        steep_categories: editedEvidence.steep_categories?.map((s: any) => s.id) || [],
        geographical_focus: editedEvidence.geographical_focus?.map((g: any) => g.id) || [],
        industries: editedEvidence.industries?.map((i: any) => i.id) || []
      }
      
      const response = await fetch('/api/evidence/save', {
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
    setEditedEvidence(flatEvidence)
    setIsEditing(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-muted rounded-full text-xs font-nav font-medium">EVIDENCE</span>
              {!isEditing && flatEvidence.steep_categories && flatEvidence.steep_categories.map((steep: any) => (
                <span key={steep.id} className="px-3 py-1 rounded-full text-xs font-nav font-medium" style={{ backgroundColor: steep.color_code + '20', color: steep.color_code }}>{steep.name}</span>
              ))}
              {isEditing && (
                <div className="flex items-center gap-2">
                  {editedEvidence.steep_categories?.map((steep: any) => (
                    <span key={steep.id} className="px-3 py-1 rounded-full text-xs font-nav font-medium inline-flex items-center gap-2" style={{ backgroundColor: steep.color_code + '20', color: steep.color_code }}>
                      {steep.name}
                      <button onClick={() => { const updated = editedEvidence.steep_categories?.filter((s: any) => s.id !== steep.id) || []; setEditedEvidence({ ...editedEvidence, steep_categories: updated }); }} className="hover:opacity-70"><XCircle className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {allOptions?.steep && (
                    <div className="relative">
                      <button onClick={() => setShowSteepDropdown(!showSteepDropdown)} className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors inline-flex items-center gap-2">+ Add STEEP</button>
                      {showSteepDropdown && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowSteepDropdown(false)} />
                          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-border rounded-lg shadow-lg z-20 max-h-60 overflow-auto">
                            {allOptions.steep.filter((s: any) => !editedEvidence.steep_categories?.find((sc: any) => sc.id === s.id)).map((s: any) => (
                              <button key={s.id} onClick={() => { setEditedEvidence({ ...editedEvidence, steep_categories: [...(editedEvidence.steep_categories || []), s] }); setShowSteepDropdown(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors">{s.name}</button>
                            ))}
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
                  {!evidence.verified_by && (
                    <button onClick={() => setShowVerifyModal(true)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Verify">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9 12l2 2 4-4"/>
                      </svg>
                    </button>
                  )}
                  <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Edit"><Edit2 className="w-5 h-5" /></button>
                </>
              ) : (
                <>
                  <button onClick={handleCancel} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground" title="Cancel"><XCircle className="w-5 h-5" /></button>
                  <button onClick={handleSave} disabled={isSaving} className="p-2 hover:bg-muted rounded-lg transition-colors text-radar-primary" title="Save"><Check className="w-5 h-5" /></button>
                </>
              )}
              <button onClick={handleClose} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Close"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Extracted From & Observed Date - Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {evidence.source_documents && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span>Extracted from </span>
                    <button 
                      onClick={() => router.push(`/library/reports/${evidence.extracted_from}`)} 
                      className="font-medium text-radar-primary hover:underline"
                      title={evidence.source_documents.title}
                    >
                      {truncateText(evidence.source_documents.title, 60)}
                    </button>
                  </div>
                </div>
              )}
              {evidence.observation_date && (
                <div className="text-sm text-muted-foreground md:text-right">
                  Observed: {new Date(evidence.observation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              )}
            </div>
            {/* Evidence Text & Quantitative Value - Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                {isEditing ? (
                  <textarea value={editedEvidence.evidence_text || ''} onChange={(e) => setEditedEvidence({ ...editedEvidence, evidence_text: e.target.value })} placeholder="Evidence text..." rows={6} className="w-full px-4 py-3 border border-border rounded-lg focus:border-radar-primary outline-none resize-none text-lg" />
                ) : (
                  <div className="p-4 border-l-4 border-radar-primary bg-muted/30 rounded-lg"><p className="text-lg italic leading-relaxed">"{evidence.evidence_text}"</p></div>
                )}
              </div>
              <div className="lg:col-span-1">
                {isEditing ? (
                  <input type="text" value={editedEvidence.quantitative_value || ''} onChange={(e) => setEditedEvidence({ ...editedEvidence, quantitative_value: e.target.value })} placeholder="e.g. 70%" className="w-full h-full px-3 py-2 border border-border rounded-lg focus:border-radar-primary outline-none" />
                ) : (
                  <div className="h-full min-h-[150px] rounded-lg flex items-center justify-center bg-cover bg-center relative" style={{ backgroundImage: `url(${getCardImageUrl(evidence)})` }}>
                    {evidence.quantitative_value && (
                      <div 
                        className="px-4 py-4 font-bold text-foreground relative z-10 text-center break-words w-full" 
                        style={{ 
                          fontFamily: "'PP Mondwest', serif",
                          fontSize: (() => {
                            const length = evidence.quantitative_value.length;
                            if (length <= 5) return 'clamp(3rem, 12vw, 5rem)';  // Big for short values like "70%"
                            if (length <= 10) return 'clamp(2.5rem, 10vw, 4rem)';
                            if (length <= 20) return 'clamp(2rem, 8vw, 3rem)';
                            return 'clamp(1.5rem, 6vw, 2.5rem)'; // Smaller for long values
                          })()
                        }}
                      >
                        {evidence.quantitative_value}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {(evidence.source_link || isEditing) && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Source Link:</span>
                {isEditing ? (
                  <input type="url" value={editedEvidence.source_link || ''} onChange={(e) => setEditedEvidence({ ...editedEvidence, source_link: e.target.value })} placeholder="https://..." className="flex-1 px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm" />
                ) : (
                  evidence.source_link && <a href={evidence.source_link} target="_blank" rel="noopener noreferrer" className="font-medium text-radar-primary hover:underline">{evidence.source_link}</a>
                )}
              </div>
            )}
            {/* Evidence Type & Credibility Rating - Inline Layout */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Evidence Type:</span>
                {isEditing ? (
                  <input type="text" value={editedEvidence.evidence_type || ''} onChange={(e) => setEditedEvidence({ ...editedEvidence, evidence_type: e.target.value })} placeholder="e.g., Survey Result, Case Study..." className="flex-1 px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm" />
                ) : (
                  <span className="px-3 py-1 bg-white border border-border rounded-full text-sm font-medium">{evidence.evidence_type}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Credibility Rating:</span>
                {isEditing ? (
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(rating => (
                      <button key={rating} onClick={() => setEditedEvidence({ ...editedEvidence, credibility_rating: rating.toString() })} className={`px-3 py-1.5 border rounded-lg text-sm transition-colors ${editedEvidence.credibility_rating === rating.toString() ? 'bg-radar-primary text-white border-radar-primary' : 'border-border hover:bg-muted'}`}>{rating}</button>
                    ))}
                  </div>
                ) : (
                  evidence.credibility_rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(parseInt(evidence.credibility_rating || '0'))].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-[#FF6B35]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      {evidence.credibility_description && (
                        <div className="relative group">
                          <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                          </svg>
                          <div className="absolute left-0 top-full mt-1 w-64 p-3 bg-white border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none">
                            {evidence.credibility_description}
                            
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
            {/* Methodology - Full Width */}
            <div>
              <div className="flex items-baseline gap-2 text-sm">
                <span className="text-muted-foreground">Methodology:</span>
                {isEditing ? (
                  <textarea value={editedEvidence.methodology || ''} onChange={(e) => setEditedEvidence({ ...editedEvidence, methodology: e.target.value })} placeholder="Describe the methodology..." rows={3} className="flex-1 px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm resize-none" />
                ) : (
                  evidence.methodology && <span className="text-foreground flex-1"><p className="text-xs text-gray-600 leading-relaxed">{evidence.methodology}</p></span>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Taxonomy</h3>
              <TaxonomyGrid isEditing={isEditing} allOptions={allOptions} onUpdate={(field, items) => { const mappedField = field === 'geographicalFocus' ? 'geographical_focus' : field; setEditedEvidence({ ...editedEvidence, [mappedField]: items }); }} categories={editedEvidence.categories || flatEvidence.categories} topics={editedEvidence.topics || flatEvidence.topics} industries={editedEvidence.industries || flatEvidence.industries} geographicalFocus={editedEvidence.geographical_focus || flatEvidence.geographical_focus} />
            </div>

            {(evidence.last_edited_by_user || evidence.verified_by_user) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {evidence.last_edited_by_user && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <Edit2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span>Edited by </span>
                      <span className="font-medium">{evidence.last_edited_by_user.full_name}</span>
                      {evidence.last_edited_at && (
                        <span> on {new Date(evidence.last_edited_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                )}
                {evidence.verified_by_user && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                    <div className="flex-1">
                      <span>Verified by </span>
                      <span className="font-medium">{evidence.verified_by_user.full_name}</span>
                      {evidence.verification_date && (
                        <span> on {new Date(evidence.verification_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      )}
                      {evidence.verification_notes && (
                        <div className="relative group inline-block ml-1">
                          <svg className="w-3.5 h-3.5 text-gray-400 cursor-help inline" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                          </svg>
                          <div className="absolute left-0 top-full mt-1 w-64 p-3 bg-white border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none">
                            {evidence.verification_notes}
                            
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-6 border-t border-border">
              <h2 className="text-xl font-semibold mb-4">Related Research</h2>
              <RelatedResearchTabs drivers={relatedDrivers} trends={relatedTrends} signals={relatedSignals} evidence={[]} />
            </div>
          </div>
        </div>

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