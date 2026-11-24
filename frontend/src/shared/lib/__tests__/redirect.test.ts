import { getSafeRedirectPath } from '../redirect'

describe('authentication return paths', () => {
  it.each(['/profile', '/admin/news-management?view=edit', '/studies/example#content'])(
    'preserves an internal destination: %s', path => {
      expect(getSafeRedirectPath(path)).toBe(path)
    }
  )

  it.each([null, undefined, '', 'https://example.com', '//example.com', '/\\example.com',
    '/\n/example.com', '/auth/callback?code=old', '/api/admin/members', '/login', '/register',
    '/pending', '/about/../auth/callback'])(
    'rejects external, malformed, or auth-loop destinations: %s', path => {
      expect(getSafeRedirectPath(path)).toBe('/')
    }
  )
})
