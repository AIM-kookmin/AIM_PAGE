-- Create FAQs table
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Public read access for active FAQs
CREATE POLICY "FAQs are viewable by everyone"
  ON public.faqs
  FOR SELECT
  USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins can do everything with FAQs"
  ON public.faqs
  FOR ALL
  USING (public.is_admin());

-- Add index for ordering
CREATE INDEX IF NOT EXISTS faqs_order_idx ON public.faqs ("order");

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_faqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_faqs_updated_at();
