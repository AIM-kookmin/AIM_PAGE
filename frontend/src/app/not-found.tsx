import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-black px-4 text-center">
      <p className="text-violet-400">404</p>
      <h1 className="text-2xl font-bold text-white">페이지를 찾을 수 없습니다</h1>
      <p className="text-gray-400">주소가 올바른지 확인해주세요.</p>
      <Link href="/" className="rounded-xl bg-violet-600 px-5 py-3 text-white hover:bg-violet-500">홈으로 돌아가기</Link>
    </main>
  )
}
