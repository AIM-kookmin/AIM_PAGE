'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface MemberPreview {
  id: string
  display_name: string
  position: string | null
  department: string | null
  generation: number | null
  one_liner: string | null
  avatar_url: string | null
}

interface MembersSectionProps {
  members: MemberPreview[]
}

export default function MembersSection({ members }: MembersSectionProps) {
  // Show max 8 members on main page
  const displayMembers = members.slice(0, 8)

  return (
    <section className="relative z-10 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="text-violet-400 text-sm font-medium tracking-widest uppercase mb-3 block">
              Our Team
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Monsters
            </h2>
          </div>
          <Link
            href="/members"
            className="text-white/60 hover:text-violet-400 transition-colors flex items-center gap-2 group self-start md:self-auto"
          >
            <span>모든 부원 보기</span>
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Compact Member Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-white/[0.04] transition-all duration-300">
                {/* Avatar - Left */}
                <div className="shrink-0">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.display_name}
                      className="w-16 h-16 rounded-full object-cover border border-violet-500/20"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center">
                      <span className="text-violet-300 text-xl font-bold">
                        {member.display_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info - Right */}
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="text-white font-bold text-lg group-hover:text-violet-300 transition-colors">
                      {member.display_name}
                    </h3>
                    {member.generation && (
                      <span className="text-violet-400/60 text-xs font-mono">
                        {member.generation}기
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm text-white/50">
                    {member.position && (
                      <span>{member.position}</span>
                    )}
                    {member.position && member.department && (
                      <span className="text-white/30">•</span>
                    )}
                    {member.department && (
                      <span>{member.department}</span>
                    )}
                  </div>

                  {member.one_liner && (
                    <p className="text-white/40 text-sm mt-1 line-clamp-1">
                      {member.one_liner}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
