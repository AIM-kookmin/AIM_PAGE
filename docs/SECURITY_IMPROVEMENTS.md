# Security & UX Improvements - 2025-02-06

## Overview
This document summarizes the security enhancements and UX fixes implemented for the AIM website admin panel.

## 1. Modal Scroll Fix

### Issue
- Modal content was not scrollable when form content exceeded viewport height
- Modal top was being cut off when centered with `items-center`

### Solution
**File:** `frontend/src/shared/ui/Modal.tsx`

- Changed background wrapper from `items-center` to `items-start` with `pt-8`
- Added `overflow-y-auto` to background wrapper to enable scrolling
- Changed modal max-height from `max-h-[90vh]` to `max-h-[calc(100vh-4rem)]`
- Added `my-auto` to modal container for proper vertical spacing
- Maintained 3-section layout: fixed header, scrollable content, fixed footer

```tsx
// Before
<div className="fixed inset-0 ... flex items-center justify-center p-4">
  <div className="... max-h-[90vh] flex flex-col">

// After
<div className="fixed inset-0 ... flex items-start justify-center p-4 pt-8 overflow-y-auto">
  <div className="... my-auto max-h-[calc(100vh-4rem)] flex flex-col">
```

## 2. Remove Direct URL Input

### Issue
- Admin could input arbitrary image URLs directly
- Exposed external URLs in the database
- Security risk: no validation of external image sources

### Solution
**File:** `frontend/src/app/admin/activities-management\page.tsx`

- Removed the "Image URL input" field (lines 488-497)
- Now only file upload is allowed
- All images must go through validated upload process

## 3. Supabase Storage Security

### Issue
- Storage bucket was public
- Direct Supabase URLs were exposed to users
- No authentication required to access images
- URLs revealed infrastructure details

### Solution

#### 3.1 Storage RLS Policies
**File:** `supabase/migrations/00013_secure_storage_policies.sql`

- Set activities bucket to private (`public = false`)
- Implemented Row-Level Security (RLS) policies:
  - INSERT: Only authenticated users can upload
  - SELECT: Only authenticated users can view
  - DELETE: Only authenticated users can delete
- Prevents anonymous access to storage files

#### 3.2 Secure Image API Route
**File:** `frontend/src/app/api/images/[...path]/route.ts`

- Created authenticated API endpoint: `/api/images/{bucket}/{path}`
- Validates user authentication via Supabase Auth
- Generates time-limited signed URLs (1 hour expiry)
- Redirects to signed URL for image access
- Returns 401 Unauthorized for unauthenticated requests

#### 3.3 Secure URL Generation
**File:** `frontend/src/shared/api/supabase/storage.ts`

- Added `getSecureUrl()` function to generate proxy URLs
- Deprecated `getPublicUrl()` with warning
- Updated all upload functions:
  - `uploadMemberAvatar()` → returns `/api/images/members/avatars/...`
  - `uploadActivityCover()` → returns `/api/images/activities/covers/...`
  - `uploadActivityImages()` → returns `/api/images/activities/...`
  - `uploadStudyCover()` → returns `/api/images/studies/covers/...`

## Security Benefits

### Before
```
https://[PROJECT].supabase.co/storage/v1/object/public/activities/covers/image.jpg
```
- Reveals Supabase project ID
- Publicly accessible
- Direct storage access
- No authentication required

### After
```
/api/images/activities/covers/image.jpg
```
- Hides infrastructure details
- Requires authentication
- Proxied through API route
- Time-limited signed URLs
- No direct storage access

## Implementation Details

### URL Format
- **Old:** `https://[project].supabase.co/storage/v1/object/public/{bucket}/{path}`
- **New:** `/api/images/{bucket}/{path}`

### Authentication Flow
1. User requests image: `GET /api/images/activities/covers/123.jpg`
2. API route verifies user authentication
3. If authenticated: generates signed URL from Supabase Storage
4. Redirects to signed URL (valid for 1 hour)
5. If not authenticated: returns 401 Unauthorized

### Storage Policy Flow
1. User uploads image via admin panel
2. File stored in Supabase Storage with private access
3. Proxy URL saved to database
4. Frontend displays image via API route
5. API route authenticates and generates temporary signed URL

## Migration Steps

### For Database
```bash
# Apply the storage security migration
supabase db push
```

This will:
- Enable RLS on storage.objects table
- Create authentication policies
- Set activities bucket to private

### For Existing Data
Existing image URLs in the database will need to be updated from public Supabase URLs to proxy URLs. This can be done via a data migration script if needed.

## Testing Checklist

- [x] Modal scrolls properly with long content
- [x] Modal top is not cut off
- [x] URL input field removed from admin
- [x] File upload still works
- [ ] Image upload saves proxy URL to database
- [ ] Images display correctly via API route
- [ ] Unauthenticated users cannot access images
- [ ] Authenticated users can view images
- [ ] Signed URLs expire after 1 hour
- [ ] TypeScript compilation passes

## Future Enhancements

1. **CDN Integration**: Add CloudFront or similar CDN in front of API route
2. **Image Optimization**: Add image resizing/optimization at API layer
3. **Rate Limiting**: Implement rate limits on image API route
4. **Audit Logging**: Log image access for security monitoring
5. **Batch URL Migration**: Script to update existing image URLs in database

## Related Files

### Modified
- `frontend/src/shared/ui/Modal.tsx`
- `frontend/src/app/admin/activities-management/page.tsx`
- `frontend/src/shared/api/supabase/storage.ts`

### Created
- `supabase/migrations/00013_secure_storage_policies.sql`
- `frontend/src/app/api/images/[...path]/route.ts`
- `docs/SECURITY_IMPROVEMENTS.md` (this file)

## Breaking Changes

⚠️ **Important**: After applying the storage migration, all existing public Supabase URLs in the database will stop working. Images will need to be re-uploaded or URLs updated to use the proxy format.

## Rollback Plan

If issues occur:

1. Revert storage bucket to public:
   ```sql
   UPDATE storage.buckets SET public = true WHERE id = 'activities';
   ```

2. Drop RLS policies:
   ```sql
   DROP POLICY "Authenticated users can upload activity images" ON storage.objects;
   DROP POLICY "Authenticated users can view activity images" ON storage.objects;
   DROP POLICY "Authenticated users can delete activity images" ON storage.objects;
   ```

3. Update storage.ts to use `getPublicUrl()` again

---

**Author:** Claude Code
**Date:** 2025-02-06
**Status:** Implemented, Pending Testing
