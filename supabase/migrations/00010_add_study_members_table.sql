-- ============================================================================
-- Migration: Add Study Members Table
-- Description: Track study group membership
-- ============================================================================

-- Create study_members table
CREATE TABLE IF NOT EXISTS public.study_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  study_id UUID REFERENCES public.studies(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(study_id, member_id)
);

-- Add indexes
CREATE INDEX idx_study_members_study ON public.study_members(study_id);
CREATE INDEX idx_study_members_member ON public.study_members(member_id);
CREATE INDEX idx_study_members_status ON public.study_members(status);

-- Enable RLS
ALTER TABLE public.study_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "allow_public_read_active" ON public.study_members
  FOR SELECT USING (status = 'active');

CREATE POLICY "allow_own_read" ON public.study_members
  FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "allow_member_insert" ON public.study_members
  FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "allow_own_update" ON public.study_members
  FOR UPDATE USING (auth.uid() = member_id);

CREATE POLICY "allow_admin_all" ON public.study_members
  FOR ALL USING (public.is_admin());

-- Function to update current_members count
CREATE OR REPLACE FUNCTION public.update_study_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.studies
    SET current_members = current_members + 1
    WHERE id = NEW.study_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.studies
    SET current_members = GREATEST(0, current_members - 1)
    WHERE id = OLD.study_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'active' AND OLD.status != 'active' THEN
      UPDATE public.studies
      SET current_members = current_members + 1
      WHERE id = NEW.study_id;
    ELSIF NEW.status != 'active' AND OLD.status = 'active' THEN
      UPDATE public.studies
      SET current_members = GREATEST(0, current_members - 1)
      WHERE id = NEW.study_id;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update member count
DROP TRIGGER IF EXISTS update_study_member_count_trigger ON public.study_members;
CREATE TRIGGER update_study_member_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.study_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_study_member_count();

-- Add comments
COMMENT ON TABLE public.study_members IS '스터디 그룹 멤버십 관리';
COMMENT ON COLUMN public.study_members.role IS '역할 (leader, member)';
COMMENT ON COLUMN public.study_members.status IS '상태 (active, inactive, completed)';
COMMENT ON COLUMN public.study_members.notes IS '메모 (출석, 평가 등)';
