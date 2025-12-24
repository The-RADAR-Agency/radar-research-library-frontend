'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'

interface TaxonomyGridProps {
  categories?: any[]
  topics?: any[]
  industries?: any[]
  geographicalFocus?: any[]
  steep?: any[]
  isEditing?: boolean
  allOptions?: {
    categories: any[]
    topics: any[]
    industries: any[]
    geographicalFocus: any[]
  }
  onUpdate?: (field: string, items: any[]) => void
}

export default function TaxonomyGrid({
  categories = [],
  topics = [],
  industries = [],
  geographicalFocus = [],
  steep = [],
  isEditing = false,
  allOptions,
  onUpdate
}: TaxonomyGridProps) {
  const [showPicker, setShowPicker] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const Section = ({ title, items, field, options }: { 
    title: string
    items: any[]
    field: string
    options?: any[]
  }) => {
    const currentIds = items.map(i => i.id)
    const availableOptions = options?.filter(opt => !currentIds.includes(opt.id)) || []
    const filteredOptions = searchTerm 
      ? availableOptions.filter(opt => 
          (opt.category_name || opt.topic_name || opt.hubspot_industry_name || opt.region_name || opt.name)
            .toLowerCase().includes(searchTerm.toLowerCase())
        )
      : availableOptions

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-muted-foreground">{title}</h4>
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-white border border-border rounded-full text-sm inline-flex items-center gap-2 shadow-sm"
            >
              {item.category_name || item.topic_name || item.hubspot_industry_name || item.region_name || item.name}
              {isEditing && onUpdate && (
                <button
                  onClick={() => {
                    const updated = items.filter((_, i) => i !== idx)
                    onUpdate(field, updated)
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
          
          {isEditing && onUpdate && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowPicker(showPicker === field ? null : field)
                  setSearchTerm('')
                }}
                className="px-3 py-1 border border-dashed border-border rounded-full text-sm inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>

              {showPicker === field && (
                <div className="absolute top-full mt-2 left-0 w-64 bg-white border border-border rounded-lg shadow-lg z-10 max-h-64 overflow-auto">
                  <div className="p-2 border-b border-border sticky top-0 bg-white">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-border rounded outline-none focus:border-radar-primary"
                      autoFocus
                    />
                  </div>
                  <div className="p-2">
                    {filteredOptions.length > 0 ? (
                      filteredOptions.map(option => (
                        <button
                          key={option.id}
                          onClick={() => {
                            onUpdate(field, [...items, option])
                            setShowPicker(null)
                            setSearchTerm('')
                          }}
                          className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded"
                        >
                          {option.category_name || option.topic_name || option.hubspot_industry_name || option.region_name || option.name}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground p-2">No options available</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
      <Section title="Categories" items={categories} field="categories" options={allOptions?.categories} />
      <Section title="Topics" items={topics} field="topics" options={allOptions?.topics} />
      <Section title="Industries" items={industries} field="industries" options={allOptions?.industries} />
      <Section title="Geographical Focus" items={geographicalFocus} field="geographicalFocus" options={allOptions?.geographicalFocus} />
    </div>
  )
}
