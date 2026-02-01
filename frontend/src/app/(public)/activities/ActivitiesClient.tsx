import { Card, Text } from '@/shared/ui'
import type { Activity } from '@/types/supabase'

interface ActivitiesClientProps {
  activities: Activity[]
}

export default function ActivitiesClient({ activities }: ActivitiesClientProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-black selection:bg-violet-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[20px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[20px] mix-blend-screen" />
      </div>

      <div className="relative pt-32 pb-16 md:pt-48 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              동아리 활동
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            AIM의 다양한 활동과 이벤트를 확인해보세요.
            <br className="hidden md:block" />
            함께 성장하며 만들어가는 우리의 이야기입니다.
          </p>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {activities.length === 0 ? (
          <Card variant="glass" className="p-12 text-center max-w-2xl mx-auto">
            <Text className="text-gray-400 text-lg">등록된 활동이 없습니다.</Text>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((activity) => (
              <Card
                key={activity.id}
                variant="glass"
                className="group p-0 overflow-hidden hover:-translate-y-2 hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)] hover:border-violet-500/50 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400 ring-1 ring-inset ring-violet-500/20">
                      {activity.category}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {formatDate(activity.date)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-400 transition-colors">
                    {activity.title}
                  </h3>

                  {activity.description && (
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4">
                      {activity.description}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <footer className="relative border-t border-white/10 bg-black/50 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} AIM (AI Monsters). All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
