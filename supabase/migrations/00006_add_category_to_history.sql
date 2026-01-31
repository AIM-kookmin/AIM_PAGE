-- Add category field to about_history table
ALTER TABLE public.about_history
ADD COLUMN category TEXT DEFAULT 'milestone' CHECK (category IN ('award', 'event', 'milestone'));

-- Create index for category filtering
CREATE INDEX idx_about_history_category ON public.about_history(category);

-- Update existing records to have default category
UPDATE public.about_history SET category = 'milestone' WHERE category IS NULL;
