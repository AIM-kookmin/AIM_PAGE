'use client'

import { useCallback, useState } from 'react'
import { Upload, X, Edit2 } from 'lucide-react'
import ImageCropModal from './ImageCropModal'

interface ImageUploadZoneProps {
  imagePreview: string | null
  onImageChange: (file: File | null) => void
  onRemoveImage: () => void
  onError: (message: string) => void
}

export default function ImageUploadZone({
  imagePreview,
  onImageChange,
  onRemoveImage,
  onError
}: ImageUploadZoneProps) {
  const [showCropModal, setShowCropModal] = useState(false)
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null)

  const validateAndSetImage = useCallback((file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      onError('이미지 파일만 업로드 가능합니다 (JPG, PNG, WEBP, GIF)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      onError('파일 크기는 5MB 이하여야 합니다')
      return
    }

    // Open crop modal instead of directly setting image
    const reader = new FileReader()
    reader.onload = () => {
      setTempImageSrc(reader.result as string)
      setShowCropModal(true)
    }
    reader.readAsDataURL(file)
  }, [onError])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files[0]
    if (!file) return

    validateAndSetImage(file)
  }, [validateAndSetImage])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    validateAndSetImage(file)
  }, [validateAndSetImage])

  const handleCropComplete = useCallback((croppedFile: File) => {
    onImageChange(croppedFile)
    setShowCropModal(false)
    setTempImageSrc(null)
  }, [onImageChange])

  const handleCropCancel = useCallback(() => {
    setShowCropModal(false)
    setTempImageSrc(null)
  }, [])

  const handleEditImage = useCallback(() => {
    if (imagePreview) {
      setTempImageSrc(imagePreview)
      setShowCropModal(true)
    }
  }, [imagePreview])

  if (imagePreview) {
    return (
      <>
        <div className="relative group">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-xl border border-white/10"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              type="button"
              onClick={handleEditImage}
              className="p-2.5 bg-violet-500 hover:bg-violet-600 rounded-full transition-all duration-200 shadow-lg hover:shadow-glow-primary hover:scale-110"
            >
              <Edit2 className="w-5 h-5 text-white" />
            </button>
            <button
              type="button"
              onClick={onRemoveImage}
              className="p-2.5 bg-red-500 hover:bg-red-600 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center pointer-events-none">
            <div className="text-white text-sm font-medium">편집 버튼을 클릭하여 이미지를 자르거나 회전할 수 있습니다</div>
          </div>
        </div>

        {showCropModal && tempImageSrc && (
          <ImageCropModal
            imageSrc={tempImageSrc}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}
      </>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="relative flex items-center justify-center w-full h-64 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-xl hover:border-violet-500/50 hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer"
    >
      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 rounded-full bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors duration-200">
            <Upload className="w-8 h-8 text-violet-400 group-hover:text-violet-300 transition-colors duration-200" />
          </div>
          <div className="text-center">
            <p className="text-white font-medium mb-1">
              클릭하거나 파일을 드래그하여 업로드
            </p>
            <p className="text-sm text-gray-500">
              JPG, PNG, WEBP, GIF (최대 5MB)
            </p>
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </label>

      {/* Decorative corner elements */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-violet-500/30 rounded-tl-lg group-hover:border-violet-500/60 transition-colors duration-200" />
      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-violet-500/30 rounded-tr-lg group-hover:border-violet-500/60 transition-colors duration-200" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-violet-500/30 rounded-bl-lg group-hover:border-violet-500/60 transition-colors duration-200" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-violet-500/30 rounded-br-lg group-hover:border-violet-500/60 transition-colors duration-200" />

      {showCropModal && tempImageSrc && (
        <ImageCropModal
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
}
