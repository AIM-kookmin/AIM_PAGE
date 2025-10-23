'use client'

import PublicNavigation from '@/components/PublicNavigation'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black">
      <PublicNavigation />
      <main>{children}</main>
    </div>
  )
}

