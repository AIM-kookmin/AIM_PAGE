import {
  normalizeGitHub,
  normalizeLinkedIn,
  normalizeInstagram,
  normalizeBlog,
  validateGitHub,
  validateLinkedIn,
  validateInstagram,
  validateBlog,
  buildGitHubUrl,
  buildLinkedInUrl,
  buildInstagramUrl,
  buildBlogUrl,
} from '../socialLinks'

describe('normalizeGitHub', () => {
  it('should pass through username-only input unchanged', () => {
    expect(normalizeGitHub('octocat')).toBe('octocat')
  })

  it('should strip https:// URL to username', () => {
    expect(normalizeGitHub('https://github.com/octocat')).toBe('octocat')
  })

  it('should strip http:// URL to username', () => {
    expect(normalizeGitHub('http://github.com/octocat')).toBe('octocat')
  })

  it('should strip URL with www prefix', () => {
    expect(normalizeGitHub('https://www.github.com/octocat')).toBe('octocat')
  })

  it('should trim whitespace', () => {
    expect(normalizeGitHub('  octocat  ')).toBe('octocat')
  })

  it('should remove trailing slashes', () => {
    expect(normalizeGitHub('https://github.com/octocat/')).toBe('octocat')
    expect(normalizeGitHub('https://github.com/octocat///')).toBe('octocat')
  })

  it('should return empty string for empty input', () => {
    expect(normalizeGitHub('')).toBe('')
  })

  it('should return empty string for null', () => {
    expect(normalizeGitHub(null)).toBe('')
  })

  it('should return empty string for undefined', () => {
    expect(normalizeGitHub(undefined)).toBe('')
  })
})

describe('normalizeLinkedIn', () => {
  it('should pass through username-only input unchanged', () => {
    expect(normalizeLinkedIn('john-doe')).toBe('john-doe')
  })

  it('should strip https:// URL to username', () => {
    expect(normalizeLinkedIn('https://linkedin.com/in/john-doe')).toBe('john-doe')
  })

  it('should strip http:// URL to username', () => {
    expect(normalizeLinkedIn('http://linkedin.com/in/john-doe')).toBe('john-doe')
  })

  it('should strip URL with www prefix', () => {
    expect(normalizeLinkedIn('https://www.linkedin.com/in/john-doe')).toBe('john-doe')
  })

  it('should trim whitespace', () => {
    expect(normalizeLinkedIn('  john-doe  ')).toBe('john-doe')
  })

  it('should remove trailing slashes', () => {
    expect(normalizeLinkedIn('https://linkedin.com/in/john-doe/')).toBe('john-doe')
    expect(normalizeLinkedIn('https://linkedin.com/in/john-doe///')).toBe('john-doe')
  })

  it('should return empty string for empty input', () => {
    expect(normalizeLinkedIn('')).toBe('')
  })

  it('should return empty string for null', () => {
    expect(normalizeLinkedIn(null)).toBe('')
  })

  it('should return empty string for undefined', () => {
    expect(normalizeLinkedIn(undefined)).toBe('')
  })
})

describe('normalizeInstagram', () => {
  it('should pass through username-only input unchanged', () => {
    expect(normalizeInstagram('username')).toBe('username')
  })

  it('should strip https:// URL to username', () => {
    expect(normalizeInstagram('https://instagram.com/username')).toBe('username')
  })

  it('should strip http:// URL to username', () => {
    expect(normalizeInstagram('http://instagram.com/username')).toBe('username')
  })

  it('should strip URL with www prefix', () => {
    expect(normalizeInstagram('https://www.instagram.com/username')).toBe('username')
  })

  it('should strip leading @ symbol', () => {
    expect(normalizeInstagram('@username')).toBe('username')
  })

  it('should strip @ after URL strip', () => {
    expect(normalizeInstagram('https://instagram.com/@username')).toBe('username')
  })

  it('should trim whitespace', () => {
    expect(normalizeInstagram('  username  ')).toBe('username')
  })

  it('should remove trailing slashes', () => {
    expect(normalizeInstagram('https://instagram.com/username/')).toBe('username')
    expect(normalizeInstagram('https://instagram.com/username///')).toBe('username')
  })

  it('should return empty string for empty input', () => {
    expect(normalizeInstagram('')).toBe('')
  })

  it('should return empty string for null', () => {
    expect(normalizeInstagram(null)).toBe('')
  })

  it('should return empty string for undefined', () => {
    expect(normalizeInstagram(undefined)).toBe('')
  })
})

describe('validateGitHub', () => {
  it('should return true for valid usernames', () => {
    expect(validateGitHub('octocat')).toBe(true)
    expect(validateGitHub('john-doe')).toBe(true)
    expect(validateGitHub('user123')).toBe(true)
  })

  it('should return false for empty string', () => {
    expect(validateGitHub('')).toBe(false)
  })

  it('should return false for usernames exceeding max length', () => {
    expect(validateGitHub('a'.repeat(40))).toBe(false)
  })

  it('should return false for invalid characters', () => {
    expect(validateGitHub('user.name')).toBe(false)
    expect(validateGitHub('user_name')).toBe(false)
    expect(validateGitHub('user name')).toBe(false)
  })

  it('should return true for 1 character username', () => {
    expect(validateGitHub('a')).toBe(true)
  })

  it('should return true for 39 character username', () => {
    expect(validateGitHub('a'.repeat(39))).toBe(true)
  })
})

describe('validateLinkedIn', () => {
  it('should return true for valid usernames', () => {
    expect(validateLinkedIn('john-doe')).toBe(true)
    expect(validateLinkedIn('user.name')).toBe(true)
    expect(validateLinkedIn('john.doe-123')).toBe(true)
  })

  it('should return false for empty string', () => {
    expect(validateLinkedIn('')).toBe(false)
  })

  it('should return false for usernames below min length', () => {
    expect(validateLinkedIn('ab')).toBe(false)
  })

  it('should return false for usernames exceeding max length', () => {
    expect(validateLinkedIn('a'.repeat(101))).toBe(false)
  })

  it('should return false for invalid characters', () => {
    expect(validateLinkedIn('user_name')).toBe(false)
    expect(validateLinkedIn('user name')).toBe(false)
    expect(validateLinkedIn('user@name')).toBe(false)
  })

  it('should return true for 3 character username', () => {
    expect(validateLinkedIn('abc')).toBe(true)
  })

  it('should return true for 100 character username', () => {
    expect(validateLinkedIn('a'.repeat(100))).toBe(true)
  })
})

describe('validateInstagram', () => {
  it('should return true for valid usernames', () => {
    expect(validateInstagram('username')).toBe(true)
    expect(validateInstagram('user.name')).toBe(true)
    expect(validateInstagram('user_name')).toBe(true)
    expect(validateInstagram('user123')).toBe(true)
  })

  it('should return false for empty string', () => {
    expect(validateInstagram('')).toBe(false)
  })

  it('should return false for usernames exceeding max length', () => {
    expect(validateInstagram('a'.repeat(31))).toBe(false)
  })

  it('should return false for invalid characters', () => {
    expect(validateInstagram('user-name')).toBe(false)
    expect(validateInstagram('user name')).toBe(false)
    expect(validateInstagram('user@name')).toBe(false)
  })

  it('should return true for 1 character username', () => {
    expect(validateInstagram('a')).toBe(true)
  })

  it('should return true for 30 character username', () => {
    expect(validateInstagram('a'.repeat(30))).toBe(true)
  })
})

describe('buildGitHubUrl', () => {
  it('should return correct full URL', () => {
    expect(buildGitHubUrl('octocat')).toBe('https://github.com/octocat')
  })

  it('should return empty string for empty username', () => {
    expect(buildGitHubUrl('')).toBe('')
  })
})

describe('buildLinkedInUrl', () => {
  it('should return correct full URL', () => {
    expect(buildLinkedInUrl('john-doe')).toBe('https://linkedin.com/in/john-doe')
  })

  it('should return empty string for empty username', () => {
    expect(buildLinkedInUrl('')).toBe('')
  })
})

describe('buildInstagramUrl', () => {
  it('should return correct full URL', () => {
    expect(buildInstagramUrl('username')).toBe('https://instagram.com/username')
  })

  it('should return empty string for empty username', () => {
    expect(buildInstagramUrl('')).toBe('')
  })
})

describe('normalizeBlog', () => {
  it('should pass through full URL unchanged', () => {
    expect(normalizeBlog('https://example.com')).toBe('https://example.com')
  })

  it('should preserve http:// protocol', () => {
    expect(normalizeBlog('http://example.com')).toBe('http://example.com')
  })

  it('should add https:// if missing', () => {
    expect(normalizeBlog('example.com')).toBe('https://example.com')
    expect(normalizeBlog('blog.example.com')).toBe('https://blog.example.com')
  })

  it('should trim whitespace', () => {
    expect(normalizeBlog('  https://example.com  ')).toBe('https://example.com')
    expect(normalizeBlog('  example.com  ')).toBe('https://example.com')
  })

  it('should remove trailing slashes', () => {
    expect(normalizeBlog('https://example.com/')).toBe('https://example.com')
    expect(normalizeBlog('https://example.com///')).toBe('https://example.com')
  })

  it('should return empty string for empty input', () => {
    expect(normalizeBlog('')).toBe('')
  })

  it('should return empty string for null', () => {
    expect(normalizeBlog(null)).toBe('')
  })

  it('should return empty string for undefined', () => {
    expect(normalizeBlog(undefined)).toBe('')
  })
})

describe('validateBlog', () => {
  it('should return true for valid URLs', () => {
    expect(validateBlog('https://example.com')).toBe(true)
    expect(validateBlog('http://example.com')).toBe(true)
    expect(validateBlog('https://blog.example.com')).toBe(true)
    expect(validateBlog('https://example.com/blog')).toBe(true)
    expect(validateBlog('https://example.com/path/to/page')).toBe(true)
  })

  it('should return false for empty string', () => {
    expect(validateBlog('')).toBe(false)
  })

  it('should return false for invalid URLs', () => {
    expect(validateBlog('not-a-url')).toBe(false)
    expect(validateBlog('example')).toBe(false)
    expect(validateBlog('http://')).toBe(false)
    expect(validateBlog('https://')).toBe(false)
  })

  it('should return false for URLs without TLD', () => {
    expect(validateBlog('https://localhost')).toBe(false)
    expect(validateBlog('https://example')).toBe(false)
  })
})

describe('buildBlogUrl', () => {
  it('should return URL as-is', () => {
    expect(buildBlogUrl('https://example.com')).toBe('https://example.com')
    expect(buildBlogUrl('http://blog.example.com')).toBe('http://blog.example.com')
  })

  it('should return empty string for empty URL', () => {
    expect(buildBlogUrl('')).toBe('')
  })
})
