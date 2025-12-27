'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { Filter, Search, Info } from 'lucide-react'
import type { SourceDocument, Driver, Trend, Signal, Evidence, LibraryFilters } from '@/lib/types'
import { filterByVisibility, filterReportsByVisibility } from '@/lib/data/visibility'
import VerificationBadge from '@/components/VerificationBadge'
import { getCardImageUrl, getImageStyle, truncateText, formatDate, formatDocumentType } from '@/lib/utils'
import MultiSelectFilter from './MultiSelectFilter'

interface LibraryPageProps {
  initialData: {
    reports: SourceDocument[]
    drivers: Driver[]
    trends: Trend[]
    signals: Signal[]
    evidence: Evidence[]
    filterOptions: any
  }
  userId: string
}

export default function LibraryPage({ initialData, userId }: LibraryPageProps) {
    const router = useRouter()
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'uploads' | 'drivers' | 'trends' | 'signals' | 'evidence'>((searchParams.get('tab') as any) || 'uploads')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<LibraryFilters>({
    topics: [],
    categories: [],
    steep: [],
    geographies: [],
    industries: [],
    visibility: 'All'
  })
  const [filterLogic, setFilterLogic] = useState<'OR' | 'AND'>('OR')
  
  // Pagination state - items to show per tab
  const [itemsToShow, setItemsToShow] = useState({
    uploads: 20,
    drivers: 20,
    trends: 20,
    signals: 20,
    evidence: 20
  })
  
  const ITEMS_PER_PAGE = 20
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const tabs = [
    { id: 'uploads' as const, label: 'UPLOADS' },
    { id: 'drivers' as const, label: 'DRIVERS' },
    { id: 'trends' as const, label: 'TRENDS' },
    { id: 'signals' as const, label: 'SIGNALS' },
    { id: 'evidence' as const, label: 'EVIDENCE' },
  ]

  const filteredData = useMemo(() => {
    console.log('=== FILTER DEBUG ===')
    console.log('Filter options steep_categories:', initialData.filterOptions.steep_categories)
    
    let reports = filterReportsByVisibility(initialData.reports, userId, filters.visibility as any)

    // Apply taxonomy filters to reports
    if (filters.topics.length > 0) {
      if (filterLogic === 'OR') {
        reports = reports.filter(r => r.topics?.some((t: any) => filters.topics.includes(t.id)))
      } else {
        reports = reports.filter(r => filters.topics.every(topicId => r.topics?.some((t: any) => t.id === topicId)))
      }
    }

    if (filters.categories.length > 0) {
      if (filterLogic === 'OR') {
        reports = reports.filter(r => r.categories?.some((c: any) => filters.categories.includes(c.id)))
      } else {
        reports = reports.filter(r => filters.categories.every(catId => r.categories?.some((c: any) => c.id === catId)))
      }
    }

    if (filters.geographies.length > 0) {
      if (filterLogic === 'OR') {
        reports = reports.filter(r => r.geographical_focus?.some((g: any) => filters.geographies.includes(g.id)))
      } else {
        reports = reports.filter(r => filters.geographies.every(geoId => r.geographical_focus?.some((g: any) => g.id === geoId)))
      }
    }
    let drivers = filterByVisibility(initialData.drivers, userId, initialData.reports, filters.visibility as any)
    let trends = filterByVisibility(initialData.trends, userId, initialData.reports, filters.visibility as any)
    let signals = filterByVisibility(initialData.signals, userId, initialData.reports, filters.visibility as any)
    let evidence = filterByVisibility(initialData.evidence, userId, initialData.reports, filters.visibility as any)

    if (filters.topics.length > 0) {
      if (filterLogic === 'OR') {
        drivers = drivers.filter(d => d.topics?.some((t: any) => filters.topics.includes(t.id)))
        trends = trends.filter(t => t.topics?.some((topic: any) => filters.topics.includes(topic.id)))
        signals = signals.filter(s => s.topics?.some((t: any) => filters.topics.includes(t.id)))
        evidence = evidence.filter(e => e.topics?.some((t: any) => filters.topics.includes(t.id)))
      } else {
        drivers = drivers.filter(d => filters.topics.every(topicId => d.topics?.some((t: any) => t.id === topicId)))
        trends = trends.filter(t => filters.topics.every(topicId => t.topics?.some((topic: any) => topic.id === topicId)))
        signals = signals.filter(s => filters.topics.every(topicId => s.topics?.some((t: any) => t.id === topicId)))
        evidence = evidence.filter(e => filters.topics.every(topicId => e.topics?.some((t: any) => t.id === topicId)))
      }
    }

    if (filters.categories.length > 0) {
      if (filterLogic === 'OR') {
        drivers = drivers.filter(d => d.categories?.some((c: any) => filters.categories.includes(c.id)))
        trends = trends.filter(t => t.categories?.some((c: any) => filters.categories.includes(c.id)))
        evidence = evidence.filter(e => e.categories?.some((c: any) => filters.categories.includes(c.id)))
      } else {
        drivers = drivers.filter(d => filters.categories.every(catId => d.categories?.some((c: any) => c.id === catId)))
        trends = trends.filter(t => filters.categories.every(catId => t.categories?.some((c: any) => c.id === catId)))
        evidence = evidence.filter(e => filters.categories.every(catId => e.categories?.some((c: any) => c.id === catId)))
      }
      signals = signals.filter(s => s.categories?.some((c: any) => filters.categories.includes(c.id)))
    }

    if (filters.steep.length > 0) {
      if (filterLogic === 'OR') {
        drivers = drivers.filter(d => d.steep_categories?.some((s: any) => filters.steep.includes(s.id)))
        trends = trends.filter(t => t.steep_categories?.some((s: any) => filters.steep.includes(s.id)))
        signals = signals.filter(s => s.steep_categories?.some((steep: any) => filters.steep.includes(steep.id)))
        evidence = evidence.filter(e => e.steep_categories?.some((s: any) => filters.steep.includes(s.id)))
      } else {
        drivers = drivers.filter(d => filters.steep.every(steepId => d.steep_categories?.some((s: any) => s.id === steepId)))
        trends = trends.filter(t => filters.steep.every(steepId => t.steep_categories?.some((s: any) => s.id === steepId)))
        signals = signals.filter(s => filters.steep.every(steepId => s.steep_categories?.some((steep: any) => steep.id === steepId)))
        evidence = evidence.filter(e => filters.steep.every(steepId => e.steep_categories?.some((s: any) => s.id === steepId)))
      }
    }

    if (filters.geographies.length > 0) {
      if (filterLogic === 'OR') {
        drivers = drivers.filter(d => d.geographical_focus?.some((g: any) => filters.geographies.includes(g.id)))
        trends = trends.filter(t => t.geographical_focus?.some((g: any) => filters.geographies.includes(g.id)))
        evidence = evidence.filter(e => e.geographical_focus?.some((g: any) => filters.geographies.includes(g.id)))
      } else {
        drivers = drivers.filter(d => filters.geographies.every(geoId => d.geographical_focus?.some((g: any) => g.id === geoId)))
        trends = trends.filter(t => filters.geographies.every(geoId => t.geographical_focus?.some((g: any) => g.id === geoId)))
        evidence = evidence.filter(e => filters.geographies.every(geoId => e.geographical_focus?.some((g: any) => g.id === geoId)))
      }
      signals = signals.filter(s => s.geographical_focus?.some((g: any) => filters.geographies.includes(g.id)))
    }

    if (filters.industries.length > 0) {
      drivers = drivers.filter(d => d.industries?.some((i: any) => filters.industries.includes(i.id)))
      trends = trends.filter(t => t.industries?.some((i: any) => filters.industries.includes(i.id)))
      signals = signals.filter(s => s.industries?.some((i: any) => filters.industries.includes(i.id)))
      evidence = evidence.filter(e => e.industries?.some((i: any) => filters.industries.includes(i.id)))
    }

    return { reports, drivers, trends, signals, evidence }
  }, [initialData, userId, filters, filterLogic])

  // Paginated data - only show items up to current limit
  const paginatedData = useMemo(() => ({
    reports: filteredData.reports.slice(0, itemsToShow.uploads),
    drivers: filteredData.drivers.slice(0, itemsToShow.drivers),
    trends: filteredData.trends.slice(0, itemsToShow.trends),
    signals: filteredData.signals.slice(0, itemsToShow.signals),
    evidence: filteredData.evidence.slice(0, itemsToShow.evidence)
  }), [filteredData, itemsToShow])

  const activeCount = useMemo(() => {
    switch (activeTab) {
      case 'uploads': return filteredData.reports.length
      case 'drivers': return filteredData.drivers.length
      case 'trends': return filteredData.trends.length
      case 'signals': return filteredData.signals.length
      case 'evidence': return filteredData.evidence.length
      default: return 0
    }
  }, [activeTab, filteredData])
  
  // Check if there are more items to load
  const hasMore = useMemo(() => {
    switch (activeTab) {
      case 'uploads': return itemsToShow.uploads < filteredData.reports.length
      case 'drivers': return itemsToShow.drivers < filteredData.drivers.length
      case 'trends': return itemsToShow.trends < filteredData.trends.length
      case 'signals': return itemsToShow.signals < filteredData.signals.length
      case 'evidence': return itemsToShow.evidence < filteredData.evidence.length
      default: return false
    }
  }, [activeTab, itemsToShow, filteredData])

  // Load more items for active tab
  const loadMore = useCallback(() => {
    if (!hasMore) return
    
    setItemsToShow(prev => ({
      ...prev,
      [activeTab]: prev[activeTab] + ITEMS_PER_PAGE
    }))
  }, [activeTab, hasMore])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [loadMore, hasMore])

  // Reset pagination when tab changes
  useEffect(() => {
    setItemsToShow(prev => ({
      ...prev,
      [activeTab]: ITEMS_PER_PAGE
    }))
  }, [activeTab])

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: "'PP Mondwest', serif" }}>Research Library</h1>
        
        <div className="flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-0.5 md:gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  router.push(`/library?tab=${tab.id}`, { scroll: false });
                }}
                className={`px-2 md:px-4 py-3 text-xs font-nav font-bold tracking-wide transition-all relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35]" />
                )}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Search icon - placeholder for future functionality */}
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {/* Filter with count */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span className="text-sm font-medium">({activeCount})</span>
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mb-8 p-6 bg-white rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            <div className="flex items-center gap-3">
              {/* Visibility dropdown */}
              <div className="relative group">
                <button className="p-1.5 hover:bg-muted rounded-lg transition-colors" title="Visibility">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-1 w-40 bg-white border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {(['All', 'My Content', 'Shared with Me'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setFilters({ ...filters, visibility: option })}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        filters.visibility === option ? 'bg-radar-primary/10 font-medium' : ''
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* AND/OR toggle */}
              <div className="flex items-center gap-0.5 bg-muted rounded-full p-0.5">
                <button
                  onClick={() => setFilterLogic('OR')}
                  className={`px-2 py-0.5 text-xs font-medium rounded-full transition-all ${
                    filterLogic === 'OR' ? 'bg-white shadow-sm' : 'text-muted-foreground'
                  }`}
                  title="Show items matching ANY selected filter"
                >
                  OR
                </button>
                <button
                  onClick={() => setFilterLogic('AND')}
                  className={`px-2 py-0.5 text-xs font-medium rounded-full transition-all ${
                    filterLogic === 'AND' ? 'bg-white shadow-sm' : 'text-muted-foreground'
                  }`}
                  title="Show items matching ALL selected filters"
                >
                  AND
                </button>
              </div>

              {/* Clear all button */}
              <button
                onClick={() => setFilters({
                  topics: [],
                  categories: [],
                  steep: [],
                  geographies: [],
                  industries: [],
                  visibility: 'All'
                })}
                className="text-sm text-muted-foreground hover:text-foreground font-medium"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
                            
            </div>

            {initialData.filterOptions.topics.length > 0 && (
              <MultiSelectFilter
                label="Topics"
                options={initialData.filterOptions.topics.map((t: any) => ({ id: t.id, name: t.topic_name }))}
                selectedIds={filters.topics}
                onChange={(ids) => setFilters({ ...filters, topics: ids })}
              />
            )}

            {initialData.filterOptions.categories.length > 0 && (
              <MultiSelectFilter
                label="Categories"
                options={initialData.filterOptions.categories.map((c: any) => ({ id: c.id, name: c.category_name }))}
                selectedIds={filters.categories}
                onChange={(ids) => setFilters({ ...filters, categories: ids })}
              />
            )}

            {initialData.filterOptions.steep_categories && initialData.filterOptions.steep_categories.length > 0 && (
              <MultiSelectFilter
                label="STEEP"
                options={initialData.filterOptions.steep_categories.map((s: any) => ({ id: s.id, name: s.name }))}
                selectedIds={filters.steep}
                onChange={(ids) => setFilters({ ...filters, steep: ids })}
              />
            )}

            {initialData.filterOptions.geographical_focus.length > 0 && (
              <MultiSelectFilter
                label="Geography"
                options={initialData.filterOptions.geographical_focus.map((g: any) => ({ id: g.id, name: g.region_name }))}
                selectedIds={filters.geographies}
                onChange={(ids) => setFilters({ ...filters, geographies: ids })}
              />
            )}

            {initialData.filterOptions.industries.length > 0 && (
              <MultiSelectFilter
                label="Industries"
                options={initialData.filterOptions.industries.map((i: any) => ({ id: i.id, name: i.industry_name }))}
                selectedIds={filters.industries}
                onChange={(ids) => setFilters({ ...filters, industries: ids })}
              />
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'uploads' && paginatedData.reports.map((report) => (
          <ReportCard key={report.id} report={report} router={router} />
        ))}
        {activeTab === 'drivers' && paginatedData.drivers.map((driver) => (
          <EntityCard key={driver.id} entity={driver} type="driver" router={router} />
        ))}
        {activeTab === 'trends' && paginatedData.trends.map((trend) => (
          <EntityCard key={trend.id} entity={trend} type="trend" router={router} />
        ))}
        {activeTab === 'signals' && paginatedData.signals.map((signal) => (
          <EntityCard key={signal.id} entity={signal} type="signal" router={router} />
        ))}
        {activeTab === 'evidence' && paginatedData.evidence.map((evidence) => (
          <EntityCard key={evidence.id} entity={evidence} type="evidence" router={router} />
        ))}
      </div>

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-8 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            <span>Loading more...</span>
          </div>
        </div>
      )}

      {activeTab === 'uploads' && paginatedData.reports.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No reports found</p>
        </div>
      )}
      {activeTab === 'drivers' && paginatedData.drivers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No drivers found</p>
        </div>
      )}
      {activeTab === 'trends' && paginatedData.trends.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No trends found</p>
        </div>
      )}
      {activeTab === 'signals' && paginatedData.signals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No signals found</p>
        </div>
      )}
      {activeTab === 'evidence' && paginatedData.evidence.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No evidence found</p>
        </div>
      )}
    </div>
  )
}

function ReportCard({ report, router }: { report: SourceDocument, router: any }) {
  const showProcessing = report.processing_status === 'processing'

  return (
    <div onClick={() => router.push(`/library/reports/${report.id}`)} className="bg-white rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-card-hover cursor-pointer flex flex-col h-full">
      <div 
        className="h-[119px] bg-cover bg-center relative flex-shrink-0"
        style={getImageStyle(report)}
      >
        {showProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="px-3 py-1 bg-white rounded-full text-sm font-medium">
              Processing
            </span>
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-headline font-bold text-lg mb-2 leading-tight">{report.title}</h3>
        
        {report.publisher && (
          <div className="text-sm font-medium text-foreground mb-2">
            {report.publisher}
          </div>
        )}

        {report.summary && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed flex-1">
            {report.summary}
          </p>
        )}

        <div className="flex items-center justify-between text-xs mt-auto">
          {report.publication_date && (
            <span className="text-muted-foreground">
              {formatDate(report.publication_date)}
            </span>
          )}
          <span className="px-2.5 py-1 bg-muted text-foreground rounded-full font-medium">
            {formatDocumentType(report.document_type)}
          </span>
        </div>
      </div>
    </div>
  )
}

function EntityCard({ entity, type, router }: { entity: Driver | Trend | Signal | any, type: 'driver' | 'trend' | 'signal' | 'evidence', router: any }) {
  const name = type === 'evidence' 
    ? entity.evidence_text 
    : 'driver_name' in entity 
      ? entity.driver_name 
      : 'trend_name' in entity 
        ? entity.trend_name 
        : entity.signal_name
  const observationDate = 'observation_date' in entity ? entity.observation_date : null
  const isEvidence = type === 'evidence'

  return (
    <div onClick={() => router.push(`/library/${type === 'evidence' ? 'evidence' : type + 's'}/${entity.id}`)} className="bg-white rounded-xl border border-border transition-shadow hover:shadow-card-hover cursor-pointer flex flex-col h-full relative">
      <div 
        className="h-[119px] bg-cover bg-center flex-shrink-0 rounded-t-xl overflow-hidden"
        style={getImageStyle(entity)}
      />
      
      <div className="p-5 flex flex-col flex-1 overflow-visible relative">
        {isEvidence ? (
          // Evidence: Evidence type pill with methodology info icon
          <>
            <div className="mb-3 flex items-center gap-2">
              {entity.evidence_type && (
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  {entity.evidence_type}
                </span>
              )}
              {entity.methodology && (
                <div className="relative group">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  <div className="absolute left-0 top-full mt-1 w-64 p-3 bg-white border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none">
                    <p className="text-xs text-gray-600 leading-relaxed">{entity.methodology}</p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-base text-foreground mb-4 line-clamp-5 leading-relaxed flex-1">
              {name}
            </p>
          </>
        ) : (
          // Other entities: Headline + description
          <>
            <h3 className="font-headline font-bold text-lg mb-2 leading-tight">{name}</h3>
            
            <p className="text-sm text-muted-foreground mb-4 line-clamp-4 leading-relaxed flex-1">
              {entity.description}
            </p>
          </>
        )}

        <div className="mt-auto flex items-end justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {observationDate && <span>{formatDate(observationDate)}</span>}
            <VerificationBadge entity={entity} />
          </div>
          
          {entity.steep_categories && entity.steep_categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-end">
              {entity.steep_categories.map((steep: any) => (
                <span 
                  key={steep.id} 
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {steep.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}