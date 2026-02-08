-- ============================================================================
-- Migration: Remove category column from studies table
-- Description: Remove category field as it's no longer needed
-- ============================================================================

-- Remove category column from studies table
ALTER TABLE public.studies DROP COLUMN IF EXISTS category;

-- Remove category index if it exists
DROP INDEX IF EXISTS idx_studies_category;

-- Update comments
COMMENT ON TABLE public.studies IS 'Study group management (no longer categorized)';
