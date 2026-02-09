-- Add level column to studies table
ALTER TABLE public.studies
  ADD COLUMN IF NOT EXISTS level TEXT DEFAULT '입문';

-- Add check constraint for valid levels
ALTER TABLE public.studies
  ADD CONSTRAINT studies_level_check
  CHECK (level IN ('입문', '중급', '심화', '응용'));

-- Add comment
COMMENT ON COLUMN public.studies.level IS '스터디 난이도 (입문, 중급, 심화, 응용)';
