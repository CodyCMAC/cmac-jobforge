-- Create proposals table
CREATE TABLE public.proposals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'won', 'lost')),
  customer_notes text,
  customer_signature text,
  customer_signed_at timestamp with time zone,
  contractor_signature text NOT NULL DEFAULT 'Jason Gamez',
  contractor_signed_at timestamp with time zone DEFAULT now(),
  subtotal numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create proposal_options table (Option 1, Option 2, etc. within Estimate section)
CREATE TABLE public.proposal_options (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Option 1',
  description text,
  is_selected boolean NOT NULL DEFAULT false,
  subtotal numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create proposal_line_items table (items within each option)
CREATE TABLE public.proposal_line_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  option_id uuid NOT NULL REFERENCES public.proposal_options(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'General',
  name text NOT NULL,
  description text,
  unit_cost numeric NOT NULL DEFAULT 0,
  quantity numeric NOT NULL DEFAULT 1,
  waste_percent numeric NOT NULL DEFAULT 0,
  adjustment numeric NOT NULL DEFAULT 1,
  cogs numeric NOT NULL DEFAULT 0,
  margin_percent numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  sales_tax_percent numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_line_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for proposals
CREATE POLICY "Allow authenticated read access to proposals" ON public.proposals
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert access to proposals" ON public.proposals
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update access to proposals" ON public.proposals
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete access to proposals" ON public.proposals
FOR DELETE TO authenticated USING (true);

-- Create RLS policies for proposal_options
CREATE POLICY "Allow authenticated read access to proposal_options" ON public.proposal_options
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert access to proposal_options" ON public.proposal_options
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update access to proposal_options" ON public.proposal_options
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete access to proposal_options" ON public.proposal_options
FOR DELETE TO authenticated USING (true);

-- Create RLS policies for proposal_line_items
CREATE POLICY "Allow authenticated read access to proposal_line_items" ON public.proposal_line_items
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert access to proposal_line_items" ON public.proposal_line_items
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update access to proposal_line_items" ON public.proposal_line_items
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete access to proposal_line_items" ON public.proposal_line_items
FOR DELETE TO authenticated USING (true);

-- Create trigger for updated_at on proposals
CREATE TRIGGER update_proposals_updated_at
BEFORE UPDATE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.proposals (job_id, title, status, subtotal, total, contractor_signature)
SELECT id, '612 Inglenook Court - Interior Restoration', 'won', 87911.97, 87911.97, 'Jason Gamez'
FROM public.jobs LIMIT 1;

-- Insert sample option
INSERT INTO public.proposal_options (proposal_id, name, description, is_selected, subtotal)
SELECT p.id, 'Option 1', 
'The project includes interior restoration and flooring replacement to return the home to pre-loss condition. Work consists of removing damaged drywall, insulation, trim, and flooring, followed by drywall repairs and insulation replacement. All interior walls, ceilings, doors, and trim will receive heavy prep and painting using contractor-provided paint. New oak baseboards will be installed. HVAC ductwork will be cleaned and sealed, and post-construction housekeeping will be completed.',
true, 87911.97
FROM public.proposals p LIMIT 1;

-- Insert sample line item
INSERT INTO public.proposal_line_items (option_id, category, name, description, unit_cost, quantity, cogs, margin_percent, subtotal)
SELECT o.id, 'Water Damage Repairs', 'interior', NULL, 58021.90, 1, 58021.90, 34, 87911.97
FROM public.proposal_options o LIMIT 1;