import { createClient } from './client'

export type StorageBucket = 'members' | 'activities' | 'studies'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024

function validateImageFile(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`허용되지 않는 파일 형식입니다. 허용: ${ALLOWED_IMAGE_TYPES.join(', ')}`)
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`파일 크기가 5MB를 초과합니다. 현재: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
  }
}

export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File
): Promise<string> {
  validateImageFile(file)
  
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) throw error
  return path
}

/**
 * Generate a secure proxy URL that routes through the API
 * This prevents exposing Supabase Storage URLs directly
 * @param bucket - Storage bucket name
 * @param path - File path within the bucket
 * @returns Proxy URL in format: /api/images/{bucket}/{path}
 */
export function getSecureUrl(bucket: StorageBucket, path: string): string {
  return `/api/images/${bucket}/${path}`
}

/**
 * @deprecated Use getSecureUrl instead for better security
 * This exposes the Supabase Storage URL directly
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

export async function uploadMemberAvatar(
  userId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `avatars/${userId}.${ext}`
  await uploadFile('members', path, file)
  return getSecureUrl('members', path)
}

export async function uploadActivityCover(
  activityId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `covers/${activityId}_${Date.now()}.${ext}`
  await uploadFile('activities', path, file)
  return getSecureUrl('activities', path)
}

export async function uploadActivityImages(
  activityId: string,
  files: File[]
): Promise<string[]> {
  const urls: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const ext = file.name.split('.').pop()
    const path = `${activityId}/${Date.now()}_${i}.${ext}`
    await uploadFile('activities', path, file)
    urls.push(getSecureUrl('activities', path))
  }

  return urls
}

export async function uploadStudyCover(
  studyId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `covers/${studyId}.${ext}`
  await uploadFile('studies', path, file)
  return getSecureUrl('studies', path)
}

export async function uploadStudyImages(
  studyId: string,
  files: File[]
): Promise<string[]> {
  const urls: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const ext = file.name.split('.').pop()
    const path = `${studyId}/${Date.now()}_${i}.${ext}`
    await uploadFile('studies', path, file)
    urls.push(getSecureUrl('studies', path))
  }

  return urls
}
