/**
 * Social Links Utility
 *
 * Utilities for normalizing, validating, and building URLs for social media links.
 */

export interface MemberLinks {
  github?: string
  linkedin?: string
  instagram?: string
  blog?: string
}

// ============================================================================
// Normalize Functions - Convert various input formats to username-only
// ============================================================================

export function normalizeGitHub(input: string | null | undefined): string {
  if (!input) return ''

  let normalized = input.trim()

  // Remove https://github.com/ or http://github.com/
  normalized = normalized.replace(/^https?:\/\/(www\.)?github\.com\//i, '')

  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, '')

  return normalized.trim()
}

export function normalizeLinkedIn(input: string | null | undefined): string {
  if (!input) return ''

  let normalized = input.trim()

  // Remove https://linkedin.com/in/ or http://linkedin.com/in/
  // Handle both with and without www
  normalized = normalized.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '')

  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, '')

  return normalized.trim()
}

export function normalizeInstagram(input: string | null | undefined): string {
  if (!input) return ''

  let normalized = input.trim()

  // Remove https://instagram.com/ or http://instagram.com/
  // Handle both with and without www
  normalized = normalized.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')

  // Remove leading @ (common Instagram format)
  normalized = normalized.replace(/^@+/, '')

  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, '')

  return normalized.trim()
}

export function normalizeBlog(input: string | null | undefined): string {
  if (!input) return ''

  let normalized = input.trim()

  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, '')

  // Ensure URL starts with http:// or https://
  if (normalized && !normalized.match(/^https?:\/\//i)) {
    normalized = 'https://' + normalized
  }

  return normalized.trim()
}

// ============================================================================
// Validate Functions - Check if username matches platform patterns
// ============================================================================

export function validateGitHub(username: string): boolean {
  if (!username) return false
  // GitHub: alphanumeric + hyphens, 1-39 characters
  const pattern = /^[a-zA-Z0-9-]{1,39}$/
  return pattern.test(username)
}

export function validateLinkedIn(username: string): boolean {
  if (!username) return false
  // LinkedIn: alphanumeric + dots + hyphens, 3-100 characters
  const pattern = /^[a-zA-Z0-9.-]{3,100}$/
  return pattern.test(username)
}

export function validateInstagram(username: string): boolean {
  if (!username) return false
  // Instagram: alphanumeric + dots + underscores, 1-30 characters
  const pattern = /^[a-zA-Z0-9._]{1,30}$/
  return pattern.test(username)
}

export function validateBlog(url: string): boolean {
  if (!url) return false
  // URL must contain at least a domain with TLD (e.g., .com, .net, .org, etc.)
  const pattern = /^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(\/.*)?$/
  return pattern.test(url)
}

// ============================================================================
// Build URL Functions - Convert username to full URL
// ============================================================================

export function buildGitHubUrl(username: string): string {
  if (!username) return ''
  return `https://github.com/${username}`
}

export function buildLinkedInUrl(username: string): string {
  if (!username) return ''
  return `https://linkedin.com/in/${username}`
}

export function buildInstagramUrl(username: string): string {
  if (!username) return ''
  return `https://instagram.com/${username}`
}

export function buildBlogUrl(url: string): string {
  if (!url) return ''
  return url
}
