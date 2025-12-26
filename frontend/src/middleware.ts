import { type NextRequest } from 'next/server'
import { updateSession } from '@/shared/api/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image
     * - favicon.ico
     * - public files (images, svg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
