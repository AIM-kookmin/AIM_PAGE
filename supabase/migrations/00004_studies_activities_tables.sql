-- Activities
CREATE TABLE public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  gallery_urls JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_date ON public.activities(date DESC);
CREATE INDEX idx_activities_category ON public.activities(category);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_read" ON public.activities
  FOR SELECT USING (true);

CREATE POLICY "allow_admin_all" ON public.activities
  FOR ALL USING (public.is_admin());

-- Studies
CREATE TABLE public.studies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'public',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_read" ON public.studies
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "allow_admin_all" ON public.studies
  FOR ALL USING (public.is_admin());

-- Study Posts
CREATE TABLE public.study_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  study_id UUID REFERENCES public.studies(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content_md TEXT NOT NULL,
  cover_url TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_study_posts_author ON public.study_posts(author_id);
CREATE INDEX idx_study_posts_study ON public.study_posts(study_id);
CREATE INDEX idx_study_posts_status ON public.study_posts(status);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.study_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.study_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_published_read" ON public.study_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "allow_own_read" ON public.study_posts
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "allow_own_insert" ON public.study_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "allow_own_update" ON public.study_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "allow_own_delete" ON public.study_posts
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "allow_admin_all" ON public.study_posts
  FOR ALL USING (public.is_admin());

-- Tags
CREATE TABLE public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_read" ON public.tags
  FOR SELECT USING (true);

CREATE POLICY "allow_admin_all" ON public.tags
  FOR ALL USING (public.is_admin());

-- Study Post Tags (many-to-many)
CREATE TABLE public.study_post_tags (
  post_id UUID REFERENCES public.study_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE public.study_post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_read" ON public.study_post_tags
  FOR SELECT USING (true);

CREATE POLICY "allow_admin_all" ON public.study_post_tags
  FOR ALL USING (public.is_admin());
