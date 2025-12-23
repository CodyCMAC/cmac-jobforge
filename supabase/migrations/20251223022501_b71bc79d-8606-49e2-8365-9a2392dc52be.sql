-- Add optional customer contact fields to jobs
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT;