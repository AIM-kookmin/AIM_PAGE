-- Member Profiles (auth.users 확장)
CREATE TABLE public.member_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  student_id TEXT,
  position TEXT,
  department TEXT,
  year TEXT,
  generation INT,
  bio TEXT,
  one_liner TEXT,
  avatar_url TEXT,
  links JSONB,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_member_profiles_user ON public.member_profiles(user_id);
CREATE INDEX idx_member_profiles_is_public ON public.member_profiles(is_public);
CREATE INDEX idx_member_profiles_generation ON public.member_profiles(generation);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.member_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_read" ON public.member_profiles
  FOR SELECT USING (is_public = true);

CREATE POLICY "allow_own_read" ON public.member_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "allow_own_update" ON public.member_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "allow_own_insert" ON public.member_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_admin_all" ON public.member_profiles
  FOR ALL USING (public.is_admin());
