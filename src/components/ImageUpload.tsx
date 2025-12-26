'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X, Loader2, Trash2, Move, ZoomIn, ZoomOut } from 'lucide-react'

interface ImageUploadProps {
  currentImageUrl: string
  entityType: 'driver' | 'trend' | 'signal' | 'upload'
  entityId: string
  onImageUploaded?: (headerImageId: string) => void
  onImageDeleted?: () => void
  isEditing: boolean
}

export default function ImageUpload({
  currentImageUrl,
  entityType,
  entityId,
  onImageUploaded,
  onImageDeleted,
  isEditing
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSavingPosition, setIsSavingPosition] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showCropDialog, setShowCropDialog] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cropPosition, setCropPosition] = useState({ x: 50, y: 50 })
  const [zoom, setZoom] = useState(100) // 100 = cover, 150 = 1.5x zoomed in
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setError(null)
    setSelectedFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('entityType', entityType)

      const uploadResponse = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const { headerImage } = await uploadResponse.json()

      const linkResponse = await fetch('/api/images/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          headerImageId: headerImage.id
        })
      })

      if (!linkResponse.ok) {
        throw new Error('Failed to link image to entity')
      }

      setShowUploadDialog(false)
      setPreview(null)
      setSelectedFile(null)
      
      if (onImageUploaded) {
        onImageUploaded(headerImage.id)
      } else {
        window.location.reload()
      }

    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Remove this header image? The entity will use the default background.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch('/api/images/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete image')
      }

      if (onImageDeleted) {
        onImageDeleted()
      } else {
        window.location.reload()
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveCropPosition = async () => {
    setIsSavingPosition(true)
    setError(null)

    try {
      const response = await fetch('/api/images/update-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          cropPosition: { x: cropPosition.x, y: cropPosition.y, zoom }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save position')
      }

      // Close dialog and reload to show new position
      setShowCropDialog(false)
      window.location.reload()

    } catch (err) {
      console.error('Save position error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save position')
    } finally {
      setIsSavingPosition(false)
    }
  }

  const handleCancel = () => {
    setShowUploadDialog(false)
    setShowCropDialog(false)
    setPreview(null)
    setSelectedFile(null)
    setError(null)
    setCropPosition({ x: 50, y: 50 })
    setZoom(100)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50))
  }

  if (!isEditing) return null

  const hasCustomImage = currentImageUrl && !currentImageUrl.includes('/brand-assets/backgrounds/')

  return (
    <>
      {/* Action Buttons Overlay */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        {hasCustomImage && (
          <button
            onClick={() => setShowCropDialog(true)}
            className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all hover:scale-105"
            title="Adjust image position & zoom"
          >
            <Move className="w-5 h-5 text-gray-700" />
          </button>
        )}
        
        <button
          onClick={() => setShowUploadDialog(true)}
          className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all hover:scale-105"
          title={hasCustomImage ? "Change header image" : "Upload header image"}
        >
          <Camera className="w-5 h-5 text-gray-700" />
        </button>

        {hasCustomImage && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all hover:scale-105 disabled:opacity-50"
            title="Remove header image"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        )}
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Upload Header Image</h3>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-100 rounded"
                disabled={isUploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />

              {!preview ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Click to upload image</span>
                  <span className="text-xs text-gray-400">JPG, PNG, or WebP (max 10MB)</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => {
                      setPreview(null)
                      setSelectedFile(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    disabled={isUploading}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Choose different image
                  </button>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCancel}
                disabled={isUploading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="flex-1 px-4 py-2 bg-radar-primary text-white rounded-lg hover:bg-radar-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Position & Zoom Dialog */}
      {showCropDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Adjust Image Position & Zoom</h3>
              <button onClick={handleCancel} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Preview - matches detail page exactly */}
              <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                <div
                  className="absolute inset-0 bg-cover transition-all duration-200"
                  style={{
                    backgroundImage: `url(${currentImageUrl})`,
                    backgroundPosition: `${cropPosition.x}% ${cropPosition.y}%`,
                    backgroundSize: `${zoom}%`
                  }}
                />
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-4 pb-2 border-b">
                <span className="text-sm font-medium text-gray-700 w-20">Zoom</span>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="5"
                  value={zoom}
                  onChange={(e) => setZoom(parseInt(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 w-12 text-right">{zoom}%</span>
              </div>

              {/* Position Controls */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Horizontal Position
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cropPosition.x}
                    onChange={(e) => setCropPosition({ ...cropPosition, x: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Vertical Position
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cropPosition.y}
                    onChange={(e) => setCropPosition({ ...cropPosition, y: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Note: Position and zoom are display-only. Saving will be available in a future update. Use this preview to decide if you need to re-upload with different framing.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCropPosition}
                disabled={isSavingPosition}
                className="flex-1 px-4 py-2 bg-radar-primary text-white rounded-lg hover:bg-radar-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSavingPosition ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Position'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}