'use client'

import { useState, useEffect } from 'react'
import { X, Download, Edit2, Check, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getCardImageUrl, formatDate } from '@/lib/utils'
import VerificationBadge from '@/components/VerificationBadge'
import TaxonomyGrid from './TaxonomyGrid'
import KeyThemes from './KeyThemes'
import RelatedResearchTabs from './RelatedResearchTabs'
import type { SourceDocument, Driver, Trend, Signal } from '@/lib/types'

interface UploadDetailProps {
  report: SourceDocument
  relatedDrivers: Driver[]
  relatedTrends: Trend[]
  relatedSignals: Signal[]
  userId: string
}

export default function UploadDetail({
  report,
  relatedDrivers,
  relatedTrends,
  relatedSignals,
  userId
}: UploadDetailProps) {
  // Extract industries from junction table structure
  const initialIndustries = report.source_documents_hubspot_industries?.map((j: any) => j.hubspot_industries) || []
  console.log('Initial report data:', report)
  console.log('Extracted industries:', initialIndustries)
  console.log('report.hubspot_industries:', report.hubspot_industries)

  const router = useRouter()
  const [allOptions, setAllOptions] = useState<any>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editedReport, setEditedReport] = useState(report)
  const [isSaving, setIsSaving] = useState(false)

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
    router.back()
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = {
        id: report.id,
        title: editedReport.title,
        summary: editedReport.summary,
        key_themes: editedReport.key_themes,
        publication_date: editedReport.publication_date,
        categories: editedReport.categories?.map(c => c.id) || [],
        topics: editedReport.topics?.map(t => t.id) || [],
        geographical_focus: (editedReport.geographicalFocus || editedReport.geographical_focus)?.map(g => g.id) || [],
        industries: editedReport.industries?.map(i => i.id) || []
      }
      console.log('Saving payload:', payload)
      console.log('INDUSTRIES ONLY:', payload.industries)
      console.log('editedReport.industries:', editedReport.industries)
      
      const response = await fetch('/api/reports/save', {
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
    setEditedReport(report)
    setIsEditing(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              {report.document_type && (
                <span className="px-3 py-1 bg-muted rounded-full text-xs font-nav font-medium">
                  {report.document_type.replace('_', ' ').toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {report.file_url && (
                <button
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
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
              style={{ backgroundImage: `url(${getCardImageUrl(report)})` }}
            />

            {/* Title */}
            {isEditing ? (
              <input
                type="text"
                value={editedReport.title}
                onChange={(e) => setEditedReport({ ...editedReport, title: e.target.value })}
                className="w-full text-3xl font-headline font-bold border-b-2 border-border focus:border-radar-primary outline-none pb-2"
              />
            ) : (
              <h1 className="text-3xl font-headline font-bold">{report.title}</h1>
            )}

            {/* Source and Date */}
            <div className="text-muted-foreground">
              {isEditing ? (
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={editedReport.publisher || ''}
                    onChange={(e) => setEditedReport({ ...editedReport, publisher: e.target.value })}
                    placeholder="Source"
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:border-radar-primary outline-none"
                  />
                  <input
                    type="date"
                    value={editedReport.publication_date || ''}
                    onChange={(e) => setEditedReport({ ...editedReport, publication_date: e.target.value })}
                    className="px-3 py-2 border border-border rounded-lg focus:border-radar-primary outline-none"
                  />
                </div>
              ) : (
                <p>
                  {report.source?.organization_name && <span className="font-medium">{report.source.organization_name}</span>}
                  {report.source?.organization_name && report.publication_date && <span> · </span>}
                  {report.publication_date && formatDate(report.publication_date)}
                </p>
              )}
            </div>

            {/* Summary */}
            {isEditing ? (
              <textarea
                value={editedReport.summary || ''}
                onChange={(e) => setEditedReport({ ...editedReport, summary: e.target.value })}
                placeholder="Summary"
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:border-radar-primary outline-none resize-none"
              />
            ) : (
              report.summary && (
                <p className="text-foreground leading-relaxed">{report.summary}</p>
              )
            )}

            {/* Key Themes */}
            {report.key_themes && report.key_themes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Themes</h3>
                <KeyThemes
                  themes={report.key_themes}
                  isEditing={isEditing}
                  onUpdate={(themes) => setEditedReport({ ...editedReport, key_themes: themes })}
                />
              </div>
            )}

            {/* Taxonomy Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Taxonomy</h3>
              <TaxonomyGrid
                isEditing={isEditing}
                allOptions={allOptions}
                onUpdate={(field, items) => setEditedReport({ ...editedReport, [field]: items })}
                categories={editedReport.categories || report.categories}
                topics={editedReport.topics || report.topics}
                industries={editedReport.industries || initialIndustries}
                geographicalFocus={editedReport.geographicalFocus || editedReport.geographical_focus || report.geographical_focus}
                steep={[]} // Reports don't have STEEP
              />
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-4">
              <div className="flex items-center gap-2">
                <span>Uploaded by {report.uploaded_by_user?.full_name || 'Unknown'}</span>
                {/* No verification badge for reports */}
              </div>
            </div>

            {/* Related Research */}
            <div className="pt-6 border-t border-border">
              <h2 className="text-xl font-semibold mb-4">Related Research</h2>
              <RelatedResearchTabs
                drivers={relatedDrivers}
                trends={relatedTrends}
                signals={relatedSignals}
                hideEvidence={true}
              />
            </div>

            {/* PDF Preview */}
            {report.file_url && (
              <div className="pt-6 border-t border-border">
                <h2 className="text-xl font-semibold mb-4">PDF Preview</h2>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-muted-foreground mb-4">PDF preview coming soon</p>
                  <button className="px-4 py-2 bg-radar-primary text-white rounded-lg hover:bg-radar-primary/90 transition-colors">
                    Download Full PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
