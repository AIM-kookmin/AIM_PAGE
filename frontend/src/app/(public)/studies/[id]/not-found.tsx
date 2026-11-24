import Link from 'next/link'

export default function StudyPostNotFound() {
  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-white">포스트를 찾을 수 없습니다</h1>
      <p className="text-gray-400">공개된 포스트가 없거나 주소가 올바르지 않습니다.</p>
      <Link href="/studies" className="rounded-xl bg-violet-600 px-5 py-3 text-white">스터디 목록으로 돌아가기</Link>
    </section>
  )
}
