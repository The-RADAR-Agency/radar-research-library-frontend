'use client'

import { useState, useEffect } from 'react'
import { X, Edit2, Check, XCircle, Bot } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getCardImageUrl } from '@/lib/utils'
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
        id: flatEvidence.id,
        evidence_text: editedEvidence.evidence_text,
        evidence_type: editedEvidence.evidence_type,
        credibility_rating: editedEvidence.credibility_rating,
        credibility_description: editedEvidence.credibility_description,
        methodology: editedEvidence.methodology,
        quantitative_value: editedEvidence.quantitative_value,
        source_link: editedEvidence.source_link,
        categories: editedEvidence.categories?.map(c => c.id) || [],
        topics: editedEvidence.topics?.map(t => t.id) || [],
        steep_categories: editedEvidence.steep_categories?.map(s => s.id) || [],
        geographical_focus: editedEvidence.geographical_focus?.map(g => g.id) || [],
        industries: editedEvidence.industries?.map(i => i.id) || []
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
                      <button onClick={() => setShowSteepDropdown(!showSteepDropdown)} className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors">+ Add STEEP</button>
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
                <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Edit"><Edit2 className="w-5 h-5" /></button>
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
            {evidence.source_documents && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 whitespace-nowrap flex-shrink-0"><Bot className="w-4 h-4" /><span>Extracted from:</span></div>
                <button onClick={() => router.push(`/library/reports/${evidence.extracted_from}`)} className="font-medium text-radar-primary hover:underline text-left break-words max-w-3xl">{evidence.source_documents.title}</button>
              </div>
            )}
            {evidence.observation_date && (
              <div className="text-sm text-muted-foreground">Observed: {new Date(evidence.observation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                {isEditing ? (
                  <textarea value={editedEvidence.evidence_text || ''} onChange={(e) => setEditedEvidence({ ...editedEvidence, evidence_text: e.target.value })} placeholder="Evidence text..." rows={6} className="w-full px-4 py-3 border border-border rounded-lg focus:border-radar-primary outline-none resize-none text-lg" />
                ) : (
                  <div className="p-4 border-l-4 border-radar-primary bg-muted/30 rounded-lg"><p className="text-lg italic leading-relaxed">"{evidence.evidence_text}"</p></div>
                )}
              </div>
              <div className="col-span-1">
                {isEditing ? (
                  <input type="text" value={editedEvidence.quantitative_value || ''} onChange={(e) => setEditedEvidence({ ...editedEvidence, quantitative_value: e.target.value })} placeholder="e.g. 70%" className="w-full h-full px-3 py-2 border border-border rounded-lg focus:border-radar-primary outline-none" />
                ) : (
                  <div className="h-full rounded-lg flex items-center justify-center bg-cover bg-center relative" style={{ backgroundImage: `url(${getCardImageUrl(evidence, true)})` }}>
                    {evidence.quantitative_value && (
                      <div className="px-6 py-4 font-headline font-bold text-foreground relative z-10 text-center break-words max-w-full" style={{ fontSize: evidence.quantitative_value?.length > 30 ? '1.5rem' : evidence.quantitative_value?.length > 20 ? '2rem' : evidence.quantitative_value?.length > 10 ? '2.5rem' : '3rem' }}>{evidence.quantitative_value}</div>
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
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className="text-muted-foreground">Evidence Type:</span>
                    {isEditing ? (
                      <select value={editedEvidence.evidence_type || ''} onChange={(e) => setEditedEvidence({ ...editedEvidence, evidence_type: e.target.value })} className="flex-1 px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm">
                        <option value="">Select...</option>
                        <option value="Statistic">Statistic</option>
                        <option value="Quote">Quote</option>
                        <option value="Case Study">Case Study</option>
                        <option value="Research Finding">Research Finding</option>
                        <option value="Market Data">Market Data</option>
                        <option value="Survey Result">Survey Result</option>
                        <option value="Expert Opinion">Expert Opinion</option>
                        <option value="Historical Precedent">Historical Precedent</option>
                        <option value="Social Media">Social Media</option>
                      </select>
                    ) : (
                      <span className="font-medium">{evidence.evidence_type || '—'}</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className="text-muted-foreground">Credibility Rating:</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <select value={editedEvidence.credibility_rating || ''} onChange={(e) => setEditedEvidence({ ...editedEvidence, credibility_rating: e.target.value })} className="px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm">
                          <option value="">Select...</option>
                          <option value="1">★</option>
                          <option value="2">★★</option>
                          <option value="3">★★★</option>
                          <option value="4">★★★★</option>
                          <option value="5">★★★★★</option>
                        </select>
                        <textarea value={editedEvidence.credibility_description || ''} onChange={(e) => setEditedEvidence({ ...editedEvidence, credibility_description: e.target.value })} placeholder="Describe credibility..." rows={2} className="flex-1 px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm resize-none" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium" style={{ color: '#FF6B35' }}>{'★'.repeat(parseInt(evidence.credibility_rating || '0'))}</span>
                        {evidence.credibility_description && (
                          <div className="relative group">
                            <svg className="w-4 h-4 text-muted-foreground cursor-help" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                              {evidence.credibility_description}
                              <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Methodology:</span>
                  {isEditing ? (
                    <textarea value={editedEvidence.methodology || ''} onChange={(e) => setEditedEvidence({ ...editedEvidence, methodology: e.target.value })} placeholder="Describe the methodology..." rows={3} className="w-full mt-2 px-3 py-1.5 border border-border rounded-lg focus:border-radar-primary outline-none text-sm resize-none" />
                  ) : (
                    evidence.methodology && <span className="text-foreground ml-2">{evidence.methodology}</span>
                  )}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Taxonomy</h3>
              <TaxonomyGrid isEditing={isEditing} allOptions={allOptions} onUpdate={(field, items) => { const mappedField = field === 'geographicalFocus' ? 'geographical_focus' : field; setEditedEvidence({ ...editedEvidence, [mappedField]: items }); }} categories={editedEvidence.categories || flatEvidence.categories} topics={editedEvidence.topics || flatEvidence.topics} industries={editedEvidence.industries || flatEvidence.industries} geographicalFocus={editedEvidence.geographical_focus || flatEvidence.geographical_focus} />
            </div>
            <div className="pt-6 border-t border-border">
              <h2 className="text-xl font-semibold mb-4">Related Research</h2>
              <RelatedResearchTabs drivers={relatedDrivers} trends={relatedTrends} signals={relatedSignals} hideEvidence={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}