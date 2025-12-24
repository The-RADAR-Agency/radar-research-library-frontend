'use client'

interface KeyThemesProps {
  themes: string[]
  isEditing: boolean
  onUpdate: (themes: string[]) => void
}

export default function KeyThemes({ themes, isEditing, onUpdate }: KeyThemesProps) {
  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Key Themes (one per line)
        </label>
        <textarea
          value={themes.join('\n')}
          onChange={(e) => onUpdate(e.target.value.split('\n').filter(Boolean))}
          rows={Math.max(4, themes.length)}
          className="w-full px-3 py-2 border border-border rounded-lg focus:border-radar-primary outline-none resize-none font-body"
          placeholder="Enter key themes, one per line"
        />
      </div>
    )
  }

  if (!themes || themes.length === 0) return null

  // Split into two columns
  const midpoint = Math.ceil(themes.length / 2)
  const leftColumn = themes.slice(0, midpoint)
  const rightColumn = themes.slice(midpoint)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
      <ul className="space-y-1">
        {leftColumn.map((theme, idx) => (
          <li key={idx} className="text-sm flex items-start">
            <span className="text-muted-foreground mr-2">•</span>
            <span>{theme}</span>
          </li>
        ))}
      </ul>
      {rightColumn.length > 0 && (
        <ul className="space-y-1">
          {rightColumn.map((theme, idx) => (
            <li key={idx} className="text-sm flex items-start">
              <span className="text-muted-foreground mr-2">•</span>
              <span>{theme}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
