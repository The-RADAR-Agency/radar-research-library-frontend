'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { X, Search } from 'lucide-react'

interface Option {
  id: string
  name: string
}

interface MultiSelectFilterProps {
  label: string
  options: Option[]
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
}

export default function MultiSelectFilter({ label, options, selectedIds, onChange }: MultiSelectFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOptions = useMemo(() => {
    return options.filter(opt => selectedIds.includes(opt.id))
  }, [options, selectedIds])

  const filteredOptions = useMemo(() => {
    return options.filter(opt => 
      opt.name && opt.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [options, searchQuery])

  const toggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(selectedId => selectedId !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  const removeOption = (id: string) => {
    onChange(selectedIds.filter(selectedId => selectedId !== id))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium mb-2">{label}</label>
      
      {/* Selected Pills */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedOptions.map(option => (
            <button
              key={option.id}
              onClick={() => removeOption(option.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-radar-primary text-white rounded-full text-sm hover:bg-radar-primary/90 transition-colors"
            >
              {option.name}
              <X className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-input rounded-lg text-left flex items-center justify-between hover:bg-muted transition-colors"
      >
        <span className="text-sm text-muted-foreground">
          {selectedOptions.length > 0 ? `${selectedOptions.length} selected` : 'Select...'}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Box */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-64">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                    selectedIds.includes(option.id)
                      ? 'bg-radar-primary/10 text-foreground font-medium'
                      : 'hover:bg-muted'
                  }`}
                >
                  {option.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
