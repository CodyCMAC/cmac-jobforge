-- Create work_orders table for tracking production crew assignments
CREATE TABLE public.work_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_crew TEXT,
  scheduled_date DATE,
  completed_date DATE,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT work_orders_status_check CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled'))
);

-- Create invoices table for tracking payment status
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  amount BIGINT NOT NULL DEFAULT 0,
  tax_amount BIGINT NOT NULL DEFAULT 0,
  total BIGINT NOT NULL DEFAULT 0,
  due_date DATE,
  paid_date DATE,
  customer_name TEXT,
  customer_email TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT invoices_status_check CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'))
);

-- Create invoice_number sequence
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START WITH 1001;

-- Enable RLS on work_orders
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

-- Work orders: authenticated users can CRUD (single-org CRM)
CREATE POLICY "Work orders: readable by authenticated"
  ON public.work_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Work orders: insertable by authenticated"
  ON public.work_orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Work orders: updatable by authenticated"
  ON public.work_orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Work orders: deletable by authenticated"
  ON public.work_orders FOR DELETE
  TO authenticated
  USING (true);

-- Enable RLS on invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Invoices: authenticated users can CRUD (single-org CRM)
CREATE POLICY "Invoices: readable by authenticated"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Invoices: insertable by authenticated"
  ON public.invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Invoices: updatable by authenticated"
  ON public.invoices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Invoices: deletable by authenticated"
  ON public.invoices FOR DELETE
  TO authenticated
  USING (true);

-- Add indexes for common queries
CREATE INDEX idx_work_orders_job_id ON public.work_orders(job_id);
CREATE INDEX idx_work_orders_status ON public.work_orders(status);
CREATE INDEX idx_work_orders_scheduled_date ON public.work_orders(scheduled_date);
CREATE INDEX idx_invoices_job_id ON public.invoices(job_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);