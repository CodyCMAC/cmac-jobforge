-- Add address column to contacts table
ALTER TABLE public.contacts ADD COLUMN address text;

-- Rename job column to notes
ALTER TABLE public.contacts RENAME COLUMN job TO notes;

-- Update existing contacts to have the correct type values
UPDATE public.contacts SET type = 'Customer' WHERE type NOT IN ('Lead', 'Customer', 'Agent');