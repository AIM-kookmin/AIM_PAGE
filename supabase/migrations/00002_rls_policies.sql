ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruit_notices ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "allow_public_read" ON public.about_sections
  FOR SELECT USING (is_active = true);
CREATE POLICY "allow_admin_all" ON public.about_sections
  FOR ALL USING (public.is_admin());

CREATE POLICY "allow_public_read" ON public.about_activities
  FOR SELECT USING (is_active = true);
CREATE POLICY "allow_admin_all" ON public.about_activities
  FOR ALL USING (public.is_admin());

CREATE POLICY "allow_public_read" ON public.about_history
  FOR SELECT USING (is_active = true);
CREATE POLICY "allow_admin_all" ON public.about_history
  FOR ALL USING (public.is_admin());

CREATE POLICY "allow_public_read" ON public.about_contacts
  FOR SELECT USING (is_active = true);
CREATE POLICY "allow_admin_all" ON public.about_contacts
  FOR ALL USING (public.is_admin());

CREATE POLICY "allow_public_read" ON public.recruit_notices
  FOR SELECT USING (true);
CREATE POLICY "allow_admin_all" ON public.recruit_notices
  FOR ALL USING (public.is_admin());
