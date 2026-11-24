'use client'

import Link from 'next/link'

interface RouteErrorProps {
  reset: () => void
}

/** Recovery actions shared by public and admin route error boundaries. */
export default function RouteError({ reset }: RouteErrorProps) {
  return (
    <section className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 py-24 text-center" role="alert">
      <h1 className="text-2xl font-bold text-white">페이지를 불러오지 못했습니다</h1>
      <p className="text-gray-400">잠시 후 다시 시도해주세요.</p>
      <div className="flex gap-4">
        <button onClick={reset} className="rounded-xl bg-violet-600 px-5 py-3 text-white hover:bg-violet-500">
          다시 시도
        </button>
        <Link href="/" className="rounded-xl border border-white/20 px-5 py-3 text-white">홈으로</Link>
      </div>
    </section>
  )
}
