import PublicNavigation from '@/widgets/PublicNavigation'
import SmoothScroll from '@/shared/ui/SmoothScroll'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black">
      <PublicNavigation />
      <SmoothScroll>
        <main>{children}</main>
      </SmoothScroll>
    </div>
  )
}
