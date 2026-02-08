'use client'

import { useState } from 'react'
import { Upload, X, Image as ImageIcon, Edit2 } from 'lucide-react'
import ImageCropModal from '../../activities-management/components/ImageCropModal'

interface ImageData {
  id: string
  file: File | null
  preview: string
  url?: string
}

interface MultiImageUploadProps {
  images: ImageData[]
  onChange: (images: ImageData[]) => void
  onError: (message: string) => void
  maxImages?: number
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export default function MultiImageUpload({
  images,
  onChange,
  onError,
  maxImages = 10
}: MultiImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [cropImageId, setCropImageId] = useState<string | null>(null)
  const [isEditingExisting, setIsEditingExisting] = useState(false)

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      onError(`허용되지 않는 파일 형식입니다: ${file.name}`)
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      onError(`파일 크기가 5MB를 초과합니다: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      return false
    }
    return true
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      onError(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다`)
      return
    }

    const fileArray = Array.from(files).slice(0, remainingSlots)
    const validFiles = fileArray.filter(validateFile)

    if (validFiles.length === 0) return

    // Open crop modal for first image
    if (validFiles.length > 0) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCropImageSrc(reader.result as string)
        setCropImageId(crypto.randomUUID())
      }
      reader.readAsDataURL(validFiles[0])

      // Store remaining files for later
      if (validFiles.length > 1) {
        // Add remaining files without cropping
        const newImages: ImageData[] = validFiles.slice(1).map(file => {
          const preview = URL.createObjectURL(file)
          return {
            id: crypto.randomUUID(),
            file,
            preview
          }
        })
        onChange([...images, ...newImages])
      }
    }
  }

  const handleCropComplete = (croppedFile: File) => {
    const preview = URL.createObjectURL(croppedFile)

    // Clean up temporary blob URL if it was created for editing
    if (cropImageSrc && cropImageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(cropImageSrc)
    }

    if (isEditingExisting && cropImageId) {
      // Replace existing image - clear url to ensure new file is uploaded
      const updatedImages = images.map(img => {
        if (img.id === cropImageId) {
          // Revoke old blob URL if it exists
          if (img.preview.startsWith('blob:')) {
            URL.revokeObjectURL(img.preview)
          }
          return { id: img.id, file: croppedFile, preview, url: undefined }
        }
        return img
      })
      onChange(updatedImages)
    } else {
      // Add new image
      const newImage: ImageData = {
        id: cropImageId || crypto.randomUUID(),
        file: croppedFile,
        preview
      }
      onChange([...images, newImage])
    }

    setCropImageSrc(null)
    setCropImageId(null)
    setIsEditingExisting(false)
  }

  const handleCropCancel = () => {
    // Clean up temporary blob URL if it was created for editing
    if (cropImageSrc && cropImageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(cropImageSrc)
    }
    setCropImageSrc(null)
    setCropImageId(null)
    setIsEditingExisting(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeImage = (id: string) => {
    const imageToRemove = images.find(img => img.id === id)
    if (imageToRemove && imageToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.preview)
    }
    onChange(images.filter(img => img.id !== id))
  }

  const editImage = async (id: string) => {
    const image = images.find(img => img.id === id)
    if (!image) return

    try {
      // If the image has a URL (existing uploaded image), fetch it and convert to blob
      // This avoids CORS issues when loading from Supabase storage
      if (image.url && !image.preview.startsWith('blob:')) {
        const response = await fetch(image.preview)
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        setCropImageSrc(blobUrl)
      } else {
        setCropImageSrc(image.preview)
      }

      setCropImageId(id)
      setIsEditingExisting(true)
      // Don't remove the image - keep it until crop is completed
    } catch (error) {
      console.error('Failed to load image for editing:', error)
      onError('이미지를 불러오는데 실패했습니다. 다시 시도해주세요.')
    }
  }

  // Future feature: drag-to-reorder images
  // const reorderImages = (fromIndex: number, toIndex: number) => {
  //   const newImages = [...images]
  //   const [movedImage] = newImages.splice(fromIndex, 1)
  //   newImages.splice(toIndex, 0, movedImage)
  //   onChange(newImages)
  // }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
          isDragging
            ? 'border-violet-500 bg-violet-500/10'
            : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10'
        }`}
      >
        <input
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={images.length >= maxImages}
        />
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/10 flex items-center justify-center">
            <Upload className="w-8 h-8 text-violet-400" />
          </div>
          <p className="text-white font-medium mb-1">
            클릭하거나 드래그하여 이미지 업로드
          </p>
          <p className="text-gray-400 text-sm">
            {images.length}/{maxImages}개 이미지 · 최대 5MB · JPG, PNG, WebP, GIF
          </p>
        </div>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative group rounded-xl overflow-hidden bg-white/5 border border-white/10 aspect-square"
            >
              <img
                src={image.preview}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => editImage(image.id)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                  title="편집"
                >
                  <Edit2 className="w-5 h-5 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm transition-all duration-200"
                  title="삭제"
                >
                  <X className="w-5 h-5 text-red-400" />
                </button>
              </div>

              {/* Image Number Badge */}
              <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                <span className="text-xs font-medium text-white">{index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-8 px-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400 text-sm">
            아직 업로드된 이미지가 없습니다
          </p>
        </div>
      )}

      {/* Crop Modal */}
      {cropImageSrc && (
        <ImageCropModal
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
}
