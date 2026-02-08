DO $$ BEGIN
  CREATE TYPE member_status AS ENUM ('pending', 'active', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.member_profiles 
ADD COLUMN IF NOT EXISTS status member_status DEFAULT 'pending';

UPDATE public.member_profiles 
SET status = 'active' 
WHERE status IS NULL;

CREATE INDEX IF NOT EXISTS idx_member_profiles_status ON public.member_profiles(status);

DROP POLICY IF EXISTS "allow_public_read" ON public.member_profiles;
CREATE POLICY "allow_public_read" ON public.member_profiles
  FOR SELECT USING (is_public = true AND status = 'active');

DROP POLICY IF EXISTS "allow_own_read" ON public.member_profiles;
CREATE POLICY "allow_own_read" ON public.member_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "allow_admin_read_pending" ON public.member_profiles;
CREATE POLICY "allow_admin_read_pending" ON public.member_profiles
  FOR SELECT USING (public.is_admin());
