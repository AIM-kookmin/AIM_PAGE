'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { X, Crop } from 'lucide-react'
import { Area, Point } from 'react-easy-crop'
import { useLenisControl } from '@/shared/hooks'

interface ImageCropModalProps {
  imageSrc: string
  onCropComplete: (croppedImage: File) => void
  onCancel: () => void
}

const ASPECT_RATIOS = [
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '1:1', value: 1 },
  { label: '자유', value: undefined }
]

export default function ImageCropModal({
  imageSrc,
  onCropComplete,
  onCancel
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(16 / 9)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  useLenisControl(true)

  const onCropChange = useCallback((location: Point) => {
    setCrop(location)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onCropAreaComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => {
        console.log('Image loaded successfully:', url, `${image.width}x${image.height}`)
        resolve(image)
      })
      image.addEventListener('error', (error) => {
        console.error('Image load error:', url, error)
        reject(new Error(`Failed to load image: ${url}`))
      })

      // Only set crossOrigin for external URLs, not for blob URLs
      if (!url.startsWith('blob:')) {
        image.setAttribute('crossOrigin', 'anonymous')
      }

      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<Blob> => {
    console.log('getCroppedImg called:', { imageSrc: imageSrc.substring(0, 50), pixelCrop, rotation })

    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    // Set canvas to final crop size
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    console.log('Canvas size:', canvas.width, 'x', canvas.height)
    console.log('Image size:', image.width, 'x', image.height)

    // Fill entire canvas with white background first
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (rotation === 0) {
      // Simple case: no rotation
      // Calculate the overlap between crop area and image
      const cropStartX = pixelCrop.x
      const cropStartY = pixelCrop.y
      const cropEndX = cropStartX + pixelCrop.width
      const cropEndY = cropStartY + pixelCrop.height

      // Calculate where to draw on the canvas
      const drawStartX = Math.max(0, -cropStartX)
      const drawStartY = Math.max(0, -cropStartY)

      // Calculate source coordinates on the original image
      const sourceStartX = Math.max(0, cropStartX)
      const sourceStartY = Math.max(0, cropStartY)

      // Calculate dimensions to draw
      const sourceWidth = Math.min(image.width - sourceStartX, pixelCrop.width - drawStartX)
      const sourceHeight = Math.min(image.height - sourceStartY, pixelCrop.height - drawStartY)

      console.log('Draw calculations (no rotation):', {
        drawStart: { x: drawStartX, y: drawStartY },
        sourceStart: { x: sourceStartX, y: sourceStartY },
        dimensions: { width: sourceWidth, height: sourceHeight }
      })

      // Only draw if there's something to draw
      if (sourceWidth > 0 && sourceHeight > 0) {
        ctx.drawImage(
          image,
          sourceStartX,
          sourceStartY,
          sourceWidth,
          sourceHeight,
          drawStartX,
          drawStartY,
          sourceWidth,
          sourceHeight
        )
        console.log('Image drawn successfully')
      } else {
        console.warn('Nothing to draw - sourceWidth or sourceHeight <= 0')
      }
    } else {
      // Complex case: with rotation
      const maxSize = Math.max(image.width, image.height)
      const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

      const rotationCanvas = document.createElement('canvas')
      const rotationCtx = rotationCanvas.getContext('2d')

      if (!rotationCtx) {
        throw new Error('No 2d context for rotation')
      }

      rotationCanvas.width = safeArea
      rotationCanvas.height = safeArea

      // Rotate image
      rotationCtx.translate(safeArea / 2, safeArea / 2)
      rotationCtx.rotate((rotation * Math.PI) / 180)
      rotationCtx.translate(-safeArea / 2, -safeArea / 2)

      rotationCtx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5
      )

      // Calculate source position in rotated image
      const sourceX = pixelCrop.x - (safeArea / 2 - image.width * 0.5)
      const sourceY = pixelCrop.y - (safeArea / 2 - image.height * 0.5)

      const drawX = Math.max(0, -sourceX)
      const drawY = Math.max(0, -sourceY)
      const sourceDrawX = Math.max(0, sourceX)
      const sourceDrawY = Math.max(0, sourceY)

      const drawWidth = Math.min(
        pixelCrop.width - drawX,
        safeArea - sourceDrawX
      )
      const drawHeight = Math.min(
        pixelCrop.height - drawY,
        safeArea - sourceDrawY
      )

      if (drawWidth > 0 && drawHeight > 0) {
        ctx.drawImage(
          rotationCanvas,
          sourceDrawX,
          sourceDrawY,
          drawWidth,
          drawHeight,
          drawX,
          drawY,
          drawWidth,
          drawHeight
        )
      }
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas is empty'))
        }
      }, 'image/jpeg', 0.95)
    })
  }

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels) return

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
      const croppedFile = new File([croppedBlob], 'cropped-image.jpg', {
        type: 'image/jpeg'
      })
      onCropComplete(croppedFile)
    } catch (error) {
      console.error('Error cropping image:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-full sm:max-w-4xl bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-violet-500/10">
              <Crop className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">이미지 자르기</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-3 rounded-lg hover:bg-white/5 transition-colors duration-200"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-white/60 hover:text-white" />
          </button>
        </div>

        {/* Crop Area */}
        <div data-lenis-prevent className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            restrictPosition={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaComplete}
            style={{
              containerStyle: {
                backgroundColor: '#000'
              },
              mediaStyle: {
                backgroundColor: '#000'
              },
              cropAreaStyle: {
                border: '2px solid rgb(139, 92, 246)',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
              }
            }}
          />
        </div>

        {/* Controls */}
        <div className="px-4 py-4 sm:px-6 sm:py-5 space-y-4 sm:space-y-5 border-t border-white/10">
          {/* Aspect Ratio */}
          <div className="space-y-2 sm:space-y-3">
            <label className="text-sm font-medium text-white/80">비율</label>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.label}
                  type="button"
                  onClick={() => setAspectRatio(ratio.value)}
                  className={`px-3 py-2 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                    aspectRatio === ratio.value
                      ? 'bg-violet-500 text-white shadow-glow-primary'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Slider */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/80">
              확대/축소: {zoom.toFixed(1)}x
            </label>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${
                  ((zoom - 0.1) / 2.9) * 100
                }%, rgba(255,255,255,0.1) ${((zoom - 0.1) / 2.9) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>

          {/* Rotation Slider */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/80">
              회전: {rotation}°
            </label>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${
                  (rotation / 360) * 100
                }%, rgba(255,255,255,0.1) ${(rotation / 360) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-4 border-t border-white/10 bg-white/[0.02]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 sm:px-6 rounded-xl text-sm sm:text-base font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 transition-all duration-200"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="px-4 py-2.5 sm:px-6 rounded-xl text-sm sm:text-base font-medium text-white bg-violet-500 hover:bg-violet-600 shadow-lg hover:shadow-glow-primary transition-all duration-200"
          >
            적용
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgb(139, 92, 246);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
          transition: all 0.2s;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.8);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgb(139, 92, 246);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
          transition: all 0.2s;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.8);
        }
      `}</style>
    </div>
  )
}
