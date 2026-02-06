-- Set all existing members as '운영진' (admin)
UPDATE member_profiles
SET position = '운영진'
WHERE position IS NULL OR position = '';

-- Update is_admin function to check position field
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT position = '운영진'
    FROM public.member_profiles
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
