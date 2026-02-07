import { GripVertical } from 'lucide-react'
import { forwardRef } from 'react'

interface DragHandleProps {
  className?: string
  isDragging?: boolean
}

const DragHandle = forwardRef<HTMLDivElement, DragHandleProps>(
  ({ className = '', isDragging = false }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center justify-center transition-colors ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } ${className}`}
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5 text-white/40 group-hover:text-violet-400 transition-colors" />
      </div>
    )
  }
)

DragHandle.displayName = 'DragHandle'

export default DragHandle
