/** Accept only paths within this app when returning from authentication. */
export function getSafeRedirectPath(value: string | null | undefined): string {
  if (!value?.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) {
    return '/'
  }

  const base = 'https://aim.invalid'
  const url = new URL(value, base)
  if (url.origin !== base || /^\/(?:auth|api|login|register|pending)(?:\/|$)/.test(url.pathname)) {
    return '/'
  }

  return `${url.pathname}${url.search}${url.hash}`
}
