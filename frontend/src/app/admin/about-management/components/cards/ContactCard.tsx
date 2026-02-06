'use client'

import { Edit2, Trash2, Eye, EyeOff, Mail, Github, Instagram, Phone } from 'lucide-react'
import type { AboutContact } from '@/types/supabase'

interface ContactCardProps {
  contact: AboutContact
  onEdit: () => void
  onDelete: () => void
}

const typeIcons = {
  email: Mail,
  github: Github,
  instagram: Instagram,
  phone: Phone,
}

const getContactLink = (type: string, value: string): string | null => {
  switch (type) {
    case 'email':
      return `mailto:${value}`
    case 'github':
      return value // Assume full URL
    case 'instagram':
      return value // Assume full URL
    case 'phone':
      return `tel:${value}`
    default:
      return null
  }
}

export default function ContactCard({
  contact,
  onEdit,
  onDelete
}: ContactCardProps) {
  const IconComponent = typeIcons[contact.type as keyof typeof typeIcons] || Mail
  const link = getContactLink(contact.type, contact.value)

  return (
    <div className="group relative rounded-2xl bg-white/[0.02] border border-white/5 p-6 transition-all duration-300 overflow-hidden hover:border-violet-500/30 hover:bg-white/[0.04] hover:shadow-glow-sm hover:-translate-y-1">
      {/* Order Badge - Top Right */}
      <div className="absolute top-4 right-4 px-2 py-1 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-medium">
        #{contact.order}
      </div>

      {/* Icon & Label */}
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1 pt-1 pr-12">
          <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
            {contact.label}
          </h3>
        </div>
      </div>

      {/* Value (Clickable Link) */}
      <div className="mb-4 min-h-[1.5rem]">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 underline text-sm break-all transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {contact.value}
          </a>
        ) : (
          <span className="text-gray-400 text-sm break-all">
            {contact.value}
          </span>
        )}
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 mb-4 pt-3 border-t border-white/5">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
          contact.is_active
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-gray-500/10 border border-gray-500/20 text-gray-400'
        }`}>
          {contact.is_active ? (
            <>
              <Eye className="w-3 h-3" />
              활성
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3" />
              비활성
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/30 text-violet-400 hover:text-violet-300 transition-all duration-200 text-sm font-medium"
        >
          <Edit2 className="w-4 h-4" />
          수정
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 transition-all duration-200 text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          삭제
        </button>
      </div>
    </div>
  )
}
