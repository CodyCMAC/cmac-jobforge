-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'scheduled', 'sent', 'signed', 'production', 'complete')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assignee_initials TEXT NOT NULL,
  assignee_name TEXT NOT NULL,
  proposal_status TEXT CHECK (proposal_status IN ('won', 'draft', 'sent', 'viewed'))
);

-- Create contacts table
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Customer' CHECK (type IN ('Customer', 'Crew')),
  label TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  job TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create public read policies (for now, since no auth required yet)
CREATE POLICY "Allow public read access to jobs" 
ON public.jobs 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read access to contacts" 
ON public.contacts 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample job
INSERT INTO public.jobs (address, customer_name, value, status, assignee_initials, assignee_name, proposal_status)
VALUES ('1847 Meadow Creek Drive, Fort Worth, TX 76108', 'Marcus Thompson', 45750.00, 'new', 'CV', 'Cody Viveiros', NULL);

-- Insert sample contact
INSERT INTO public.contacts (name, type, email, phone, job)
VALUES ('Marcus Thompson', 'Customer', 'marcus.thompson@email.com', '(817) 555-9234', '1847 Meadow Creek...');