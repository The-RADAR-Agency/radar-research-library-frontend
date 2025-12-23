export default function UploadPage() {
  const tiles = [
    { id: 'trend-report', title: 'Trend Report', active: true },
    { id: 'earnings', title: 'Earnings Report', active: false },
    { id: 'survey', title: 'Survey Data', active: false },
    { id: 'blog', title: 'Blog/Article', active: false },
    { id: 'social', title: 'Social Media Post', active: false },
    { id: 'academic', title: 'Academic Journal', active: false },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-headline font-bold mb-2">Upload Hub</h1>
        <p className="text-muted-foreground">Choose a content type to upload</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiles.map((tile) => (
          <div
            key={tile.id}
            className={`relative p-8 rounded-2xl border-2 transition-all ${
              tile.active
                ? 'border-radar-primary bg-white hover:shadow-card-hover cursor-pointer'
                : 'border-border bg-muted/30 cursor-not-allowed'
            }`}
          >
            <h3 className="text-xl font-headline font-bold mb-2">{tile.title}</h3>
            
            {!tile.active && (
              <div className="mt-4">
                <span className="inline-block px-3 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                  Coming soon
                </span>
              </div>
            )}

            {tile.active && (
              <p className="text-sm text-muted-foreground mt-2">
                Click to upload a trend report for processing
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
