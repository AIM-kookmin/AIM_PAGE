-- News table
CREATE TABLE IF NOT EXISTS public.news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL DEFAULT '소식',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  thumbnail_url TEXT,
  card_images JSONB DEFAULT '[]'::jsonb,
  link TEXT,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_date ON public.news(date DESC);
CREATE INDEX IF NOT EXISTS idx_news_is_active ON public.news(is_active);
CREATE INDEX IF NOT EXISTS idx_news_order ON public.news("order" DESC);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news_public_read" ON public.news
  FOR SELECT USING (is_active = true);

CREATE POLICY "news_admin_all" ON public.news
  FOR ALL USING (public.is_admin());

-- Storage bucket for news images
INSERT INTO storage.buckets (id, name, public)
VALUES ('news', 'news', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "news_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'news');

CREATE POLICY "news_images_admin_write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'news' AND public.is_admin());

CREATE POLICY "news_images_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'news' AND public.is_admin());
