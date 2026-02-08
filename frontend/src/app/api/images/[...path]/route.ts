import { createClient } from '@/shared/api/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Secure image serving API route
 * Generates signed URLs for private Supabase Storage files
 *
 * Usage: /api/images/activities/covers/filename.jpg
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Construct the file path
    const bucket = params.path[0] // e.g., 'activities'
    const filePath = params.path.slice(1).join('/') // e.g., 'covers/filename.jpg'

    if (!bucket || !filePath) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 400 }
      )
    }

    // Generate a signed URL (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600) // 3600 seconds = 1 hour

    if (error) {
      console.error('Error generating signed URL:', error)
      return NextResponse.json(
        { error: 'Failed to generate signed URL' },
        { status: 500 }
      )
    }

    if (!data?.signedUrl) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Redirect to the signed URL
    return NextResponse.redirect(data.signedUrl)
  } catch (error) {
    console.error('Error in image API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
