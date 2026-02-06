-- ============================================================================
-- Migration: Improve Study Posts Table
-- Description: Add helpful fields for better post management
-- ============================================================================

-- Add missing columns to study_posts table
ALTER TABLE public.study_posts
  ADD COLUMN IF NOT EXISTS excerpt TEXT,
  ADD COLUMN IF NOT EXISTS read_time INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_study_posts_published_at ON public.study_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_posts_view_count ON public.study_posts(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_study_posts_order ON public.study_posts("order" DESC);

-- Function to auto-generate excerpt from content
CREATE OR REPLACE FUNCTION public.generate_excerpt()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.excerpt IS NULL OR NEW.excerpt = '' THEN
    -- Extract first 200 characters from content, removing markdown syntax
    NEW.excerpt := LEFT(
      REGEXP_REPLACE(
        REGEXP_REPLACE(NEW.content_md, '\n', ' ', 'g'),
        '[#*`\[\]()]', '', 'g'
      ),
      200
    ) || '...';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate excerpt
DROP TRIGGER IF EXISTS generate_study_post_excerpt ON public.study_posts;
CREATE TRIGGER generate_study_post_excerpt
  BEFORE INSERT OR UPDATE ON public.study_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_excerpt();

-- Function to auto-calculate read time
CREATE OR REPLACE FUNCTION public.calculate_read_time()
RETURNS TRIGGER AS $$
BEGIN
  -- Estimate: 200 words per minute
  -- Count words in content_md
  NEW.read_time := GREATEST(
    1,
    ROUND(
      array_length(
        regexp_split_to_array(NEW.content_md, '\s+'),
        1
      ) / 200.0
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate read time
DROP TRIGGER IF EXISTS calculate_study_post_read_time ON public.study_posts;
CREATE TRIGGER calculate_study_post_read_time
  BEFORE INSERT OR UPDATE ON public.study_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_read_time();

-- Function to set published_at when status changes to published
CREATE OR REPLACE FUNCTION public.set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set published_at if status is 'published' AND published_at is NULL
  -- This preserves manually set or existing published_at values
  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set published_at
DROP TRIGGER IF EXISTS set_study_post_published_at ON public.study_posts;
CREATE TRIGGER set_study_post_published_at
  BEFORE INSERT OR UPDATE ON public.study_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_published_at();

-- Add comments
COMMENT ON COLUMN public.study_posts.excerpt IS '요약문 (자동 생성 또는 수동 입력)';
COMMENT ON COLUMN public.study_posts.read_time IS '예상 읽기 시간 (분, 자동 계산)';
COMMENT ON COLUMN public.study_posts.view_count IS '조회수';
COMMENT ON COLUMN public.study_posts.like_count IS '좋아요 수';
COMMENT ON COLUMN public.study_posts.published_at IS '최초 게시 시간';
COMMENT ON COLUMN public.study_posts."order" IS '정렬 순서 (스터디 내 순서)';
