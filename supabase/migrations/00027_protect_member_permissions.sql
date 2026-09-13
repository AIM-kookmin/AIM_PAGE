-- Require an approved profile for every policy that delegates to is_admin().
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.member_profiles
    WHERE user_id = (SELECT auth.uid())
      AND status = 'active'
      AND position IN ('운영진', '관리자', '회장')
  );
$$;

-- RLS controls rows, so also protect the fields that grant privileges. A client
-- cannot become an admin by updating itself or inserting an approved profile.
CREATE OR REPLACE FUNCTION public.protect_member_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- SQL maintenance and trusted service-role operations retain their access.
  IF auth.role() = 'authenticated' AND NOT public.is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.user_id IS DISTINCT FROM auth.uid()
        OR NEW.status IS DISTINCT FROM 'pending'::public.member_status
        OR COALESCE(NEW.position, '') NOT IN ('', '부원') THEN
        RAISE EXCEPTION 'Only administrators can assign member permissions'
          USING ERRCODE = '42501';
      END IF;
    ELSIF NEW.id IS DISTINCT FROM OLD.id
      OR NEW.user_id IS DISTINCT FROM OLD.user_id
      OR NEW.status IS DISTINCT FROM OLD.status
      OR NEW.position IS DISTINCT FROM OLD.position THEN
      RAISE EXCEPTION 'Only administrators can change member permissions'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_member_permissions ON public.member_profiles;
CREATE TRIGGER protect_member_permissions
  BEFORE INSERT OR UPDATE ON public.member_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_member_permissions();
