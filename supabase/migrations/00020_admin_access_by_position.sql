-- Update is_admin() to check position field
-- Only users with position '운영진', '관리자', or '회장' can access admin pages
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT position IN ('운영진', '관리자', '회장')
    FROM public.member_profiles
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.is_admin() IS 'Returns true if the authenticated user has position 운영진, 관리자, or 회장';
