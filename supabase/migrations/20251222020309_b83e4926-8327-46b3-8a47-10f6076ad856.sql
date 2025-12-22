-- Create instant_estimators table
CREATE TABLE public.instant_estimators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  estimate_type TEXT NOT NULL DEFAULT 'roofing', -- roofing, gutter, framing, garage_door
  slug TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Pricing settings
  pricing_unit TEXT NOT NULL DEFAULT 'per_sqft', -- per_sqft, per_square, flat_rate
  show_price_range BOOLEAN NOT NULL DEFAULT false,
  show_financing BOOLEAN NOT NULL DEFAULT false,
  financing_link TEXT,
  
  -- Contact & scheduling
  default_assignee TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  scheduling_link TEXT,
  
  -- Additional options
  show_social_links BOOLEAN NOT NULL DEFAULT false,
  show_project_showcase BOOLEAN NOT NULL DEFAULT false,
  
  -- Lead capture settings
  require_phone BOOLEAN NOT NULL DEFAULT true,
  require_email BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create estimator questions table
CREATE TABLE public.estimator_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estimator_id UUID NOT NULL REFERENCES public.instant_estimators(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'text', -- text, select, multiselect, boolean
  options JSONB, -- for select/multiselect types
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create estimator materials table
CREATE TABLE public.estimator_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estimator_id UUID NOT NULL REFERENCES public.instant_estimators(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_per_unit NUMERIC NOT NULL DEFAULT 0,
  unit_type TEXT NOT NULL DEFAULT 'sqft',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create estimator leads table (submitted estimates)
CREATE TABLE public.estimator_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estimator_id UUID NOT NULL REFERENCES public.instant_estimators(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  address TEXT NOT NULL,
  estimate_type TEXT NOT NULL,
  selected_material_id UUID REFERENCES public.estimator_materials(id),
  estimated_sqft NUMERIC,
  estimated_price NUMERIC,
  questionnaire_responses JSONB,
  status TEXT NOT NULL DEFAULT 'new', -- new, contacted, converted, lost
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.instant_estimators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimator_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimator_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimator_leads ENABLE ROW LEVEL SECURITY;

-- RLS policies for instant_estimators
CREATE POLICY "Allow public read access to instant_estimators" 
ON public.instant_estimators FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to instant_estimators" 
ON public.instant_estimators FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to instant_estimators" 
ON public.instant_estimators FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to instant_estimators" 
ON public.instant_estimators FOR DELETE USING (true);

-- RLS policies for estimator_questions
CREATE POLICY "Allow public read access to estimator_questions" 
ON public.estimator_questions FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to estimator_questions" 
ON public.estimator_questions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to estimator_questions" 
ON public.estimator_questions FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to estimator_questions" 
ON public.estimator_questions FOR DELETE USING (true);

-- RLS policies for estimator_materials
CREATE POLICY "Allow public read access to estimator_materials" 
ON public.estimator_materials FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to estimator_materials" 
ON public.estimator_materials FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to estimator_materials" 
ON public.estimator_materials FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to estimator_materials" 
ON public.estimator_materials FOR DELETE USING (true);

-- RLS policies for estimator_leads
CREATE POLICY "Allow public read access to estimator_leads" 
ON public.estimator_leads FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to estimator_leads" 
ON public.estimator_leads FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to estimator_leads" 
ON public.estimator_leads FOR UPDATE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_instant_estimators_updated_at
BEFORE UPDATE ON public.instant_estimators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();