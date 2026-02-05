-- Drop the old restrictive constraint
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_type_check;

-- Add new constraint with all valid types
ALTER TABLE public.contacts ADD CONSTRAINT contacts_type_check 
CHECK (type = ANY (ARRAY['Lead'::text, 'Customer'::text, 'Agent'::text, 'Crew'::text]));