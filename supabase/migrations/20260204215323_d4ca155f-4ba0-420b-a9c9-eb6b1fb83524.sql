-- =====================================================
-- CMAC JobForge: Job Financials & Commission Engine
-- Phase 1 Database Schema
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

-- Revenue item categories
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'revenue_category') THEN
    CREATE TYPE public.revenue_category AS ENUM (
      'contract',
      'change_order',
      'supplement',
      'upgrade',
      'discount',
      'refund',
      'sales_tax',
      'other_revenue'
    );
  END IF;
END$$;

-- Cost item categories
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cost_category') THEN
    CREATE TYPE public.cost_category AS ENUM (
      'materials_shingles',
      'materials_underlayment',
      'materials_flashing',
      'materials_other',
      'labor_crew',
      'labor_repair',
      'subcontractor',
      'dump_haul',
      'permits',
      'equipment_rental',
      'commission',
      'warranty_reserve',
      'overhead_allocation',
      'other_expense'
    );
  END IF;
END$$;

-- Commission calculation types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commission_calc_type') THEN
    CREATE TYPE public.commission_calc_type AS ENUM (
      'percentage_of_revenue',
      'percentage_of_collected',
      'percentage_of_profit',
      'flat_amount',
      'tiered_percentage'
    );
  END IF;
END$$;

-- Commission entry status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commission_status') THEN
    CREATE TYPE public.commission_status AS ENUM (
      'draft',
      'pending_approval',
      'approved',
      'payable',
      'paid',
      'voided'
    );
  END IF;
END$$;

-- Commission event types (for audit log)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commission_event_type') THEN
    CREATE TYPE public.commission_event_type AS ENUM (
      'created',
      'recalculated',
      'status_changed',
      'amount_overridden',
      'voided',
      'paid',
      'clawback_created'
    );
  END IF;
END$$;

-- =====================================================
-- JOB REVENUE ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.job_revenue_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  category public.revenue_category NOT NULL DEFAULT 'contract',
  description text,
  estimated_amount bigint DEFAULT 0,  -- Stored in cents
  actual_amount bigint,               -- Stored in cents, NULL = not yet entered
  item_date date,
  attachment_url text,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_revenue_items_job_id ON public.job_revenue_items(job_id);
CREATE INDEX IF NOT EXISTS idx_job_revenue_items_category ON public.job_revenue_items(category);

-- RLS
ALTER TABLE public.job_revenue_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Revenue items: access by job access" ON public.job_revenue_items
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_revenue_items.job_id)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_revenue_items.job_id)
);

-- =====================================================
-- JOB COST ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.job_cost_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  category public.cost_category NOT NULL DEFAULT 'other_expense',
  description text,
  vendor text,
  estimated_amount bigint DEFAULT 0,  -- Stored in cents
  actual_amount bigint,               -- Stored in cents, NULL = not yet entered
  item_date date,
  receipt_url text,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_cost_items_job_id ON public.job_cost_items(job_id);
CREATE INDEX IF NOT EXISTS idx_job_cost_items_category ON public.job_cost_items(category);
CREATE INDEX IF NOT EXISTS idx_job_cost_items_vendor ON public.job_cost_items(vendor);

-- RLS
ALTER TABLE public.job_cost_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cost items: access by job access" ON public.job_cost_items
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_cost_items.job_id)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_cost_items.job_id)
);

-- =====================================================
-- COMMISSION PLANS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.commission_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Only one default plan
CREATE UNIQUE INDEX IF NOT EXISTS idx_commission_plans_single_default 
ON public.commission_plans(is_default) WHERE is_default = true;

-- RLS
ALTER TABLE public.commission_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Commission plans: read by authenticated" ON public.commission_plans
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Commission plans: write by admin" ON public.commission_plans
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- COMMISSION RULES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.commission_plans(id) ON DELETE CASCADE,
  role text NOT NULL,  -- e.g., 'sales_rep', 'project_manager', 'installer_lead'
  calculation_type public.commission_calc_type NOT NULL DEFAULT 'percentage_of_revenue',
  rate numeric(8,4),   -- For percentage types, e.g., 3.0000 = 3%
  flat_amount bigint,  -- For flat_amount type, in cents
  tiers jsonb,         -- For tiered: [{"min_margin": 0, "max_margin": 30, "rate": 2.5}, ...]
  split_percentage numeric(5,2) DEFAULT 100.00,  -- For role splits, e.g., 60.00 = 60%
  priority int NOT NULL DEFAULT 0,  -- Order of evaluation
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_commission_rules_plan_id ON public.commission_rules(plan_id);
CREATE INDEX IF NOT EXISTS idx_commission_rules_role ON public.commission_rules(role);

-- RLS
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Commission rules: read by authenticated" ON public.commission_rules
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Commission rules: write by admin" ON public.commission_rules
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- COMMISSION ENTRIES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.commission_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  rule_id uuid REFERENCES public.commission_rules(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  role text NOT NULL,
  status public.commission_status NOT NULL DEFAULT 'draft',
  
  -- Calculation inputs (snapshot at time of calculation)
  base_amount bigint NOT NULL,       -- The amount used as calculation base (cents)
  base_type text NOT NULL,           -- What base_amount represents: 'revenue', 'collected', 'profit'
  rate_applied numeric(8,4),         -- The rate that was applied
  margin_at_calc numeric(6,2),       -- Job margin at time of calculation
  
  -- Amounts
  calculated_amount bigint NOT NULL, -- System-calculated amount (cents)
  override_amount bigint,            -- Manual override if any (cents)
  final_amount bigint NOT NULL,      -- What will be paid: override ?? calculated (cents)
  
  -- Lifecycle
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  paid_at timestamptz,
  payment_reference text,            -- e.g., payroll batch ID
  
  -- Clawback
  clawback_of uuid REFERENCES public.commission_entries(id),
  clawback_reason text,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_commission_entries_job_id ON public.commission_entries(job_id);
CREATE INDEX IF NOT EXISTS idx_commission_entries_user_id ON public.commission_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_commission_entries_status ON public.commission_entries(status);
CREATE INDEX IF NOT EXISTS idx_commission_entries_approved_at ON public.commission_entries(approved_at);

-- RLS
ALTER TABLE public.commission_entries ENABLE ROW LEVEL SECURITY;

-- Users can see their own commissions
CREATE POLICY "Commission entries: read own" ON public.commission_entries
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Managers/admins can see all commissions
CREATE POLICY "Commission entries: read all for privileged" ON public.commission_entries
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

-- Only admins can modify commissions
CREATE POLICY "Commission entries: write for admin" ON public.commission_entries
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Managers can update status (for approval workflow)
CREATE POLICY "Commission entries: approve for manager" ON public.commission_entries
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'manager') AND
  status IN ('pending_approval', 'approved')
)
WITH CHECK (
  public.has_role(auth.uid(), 'manager') AND
  status IN ('pending_approval', 'approved', 'payable')
);

-- =====================================================
-- COMMISSION EVENTS (Audit Log)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.commission_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.commission_entries(id) ON DELETE CASCADE,
  event_type public.commission_event_type NOT NULL,
  actor_user_id uuid REFERENCES auth.users(id),
  actor_name text,
  old_value jsonb,
  new_value jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_commission_events_entry_id ON public.commission_events(entry_id);
CREATE INDEX IF NOT EXISTS idx_commission_events_created_at ON public.commission_events(created_at);

-- RLS
ALTER TABLE public.commission_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Commission events: read by entry access" ON public.commission_events
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.commission_entries e 
    WHERE e.id = commission_events.entry_id
  )
);

CREATE POLICY "Commission events: insert by authenticated" ON public.commission_events
FOR INSERT TO authenticated
WITH CHECK (true);

-- =====================================================
-- PAYOUT BATCHES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.payout_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number serial,
  description text,
  entry_ids uuid[] NOT NULL,
  total_amount bigint NOT NULL,  -- Sum of final_amounts, in cents
  exported_format text,          -- 'csv', 'pdf', etc.
  exported_at timestamptz,
  exported_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.payout_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payout batches: admin only" ON public.payout_batches
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- JOB FINANCIAL CACHE (Denormalized for performance)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.job_financial_summary (
  job_id uuid PRIMARY KEY REFERENCES public.jobs(id) ON DELETE CASCADE,
  
  -- Revenue totals (cents)
  estimated_revenue bigint DEFAULT 0,
  actual_revenue bigint DEFAULT 0,
  collected_amount bigint DEFAULT 0,
  revenue_items_count int DEFAULT 0,
  revenue_items_with_actuals int DEFAULT 0,
  
  -- Cost totals (cents)
  estimated_costs bigint DEFAULT 0,
  actual_costs bigint DEFAULT 0,
  cost_items_count int DEFAULT 0,
  cost_items_with_actuals int DEFAULT 0,
  
  -- Profit (cents) and margin (percentage)
  estimated_profit bigint DEFAULT 0,
  actual_profit bigint DEFAULT 0,
  estimated_margin numeric(6,2) DEFAULT 0,
  actual_margin numeric(6,2) DEFAULT 0,
  
  -- Variance
  cost_variance bigint DEFAULT 0,
  cost_variance_pct numeric(6,2) DEFAULT 0,
  
  -- Commissions (cents)
  total_commissions bigint DEFAULT 0,
  draft_commissions bigint DEFAULT 0,
  approved_commissions bigint DEFAULT 0,
  paid_commissions bigint DEFAULT 0,
  
  -- Metadata
  last_calculated_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS (inherits from jobs)
ALTER TABLE public.job_financial_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Financial summary: access by job access" ON public.job_financial_summary
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_financial_summary.job_id)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_financial_summary.job_id)
);

-- =====================================================
-- FUNCTIONS: Calculate Job Financials
-- =====================================================

CREATE OR REPLACE FUNCTION public.calculate_job_financials(p_job_id uuid)
RETURNS public.job_financial_summary
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result public.job_financial_summary;
  v_revenue RECORD;
  v_costs RECORD;
  v_commissions RECORD;
BEGIN
  -- Calculate revenue totals
  SELECT 
    COALESCE(SUM(estimated_amount), 0) as est_total,
    COALESCE(SUM(COALESCE(actual_amount, estimated_amount)), 0) as act_total,
    COUNT(*) as item_count,
    COUNT(actual_amount) as with_actuals
  INTO v_revenue
  FROM public.job_revenue_items
  WHERE job_id = p_job_id;
  
  -- Calculate cost totals
  SELECT 
    COALESCE(SUM(estimated_amount), 0) as est_total,
    COALESCE(SUM(COALESCE(actual_amount, estimated_amount)), 0) as act_total,
    COUNT(*) as item_count,
    COUNT(actual_amount) as with_actuals
  INTO v_costs
  FROM public.job_cost_items
  WHERE job_id = p_job_id;
  
  -- Calculate commission totals by status
  SELECT 
    COALESCE(SUM(final_amount), 0) as total,
    COALESCE(SUM(CASE WHEN status = 'draft' THEN final_amount ELSE 0 END), 0) as draft,
    COALESCE(SUM(CASE WHEN status IN ('approved', 'payable') THEN final_amount ELSE 0 END), 0) as approved,
    COALESCE(SUM(CASE WHEN status = 'paid' THEN final_amount ELSE 0 END), 0) as paid
  INTO v_commissions
  FROM public.commission_entries
  WHERE job_id = p_job_id AND status != 'voided';
  
  -- Build result
  v_result.job_id := p_job_id;
  v_result.estimated_revenue := v_revenue.est_total;
  v_result.actual_revenue := v_revenue.act_total;
  v_result.collected_amount := 0; -- Would come from payment tracking
  v_result.revenue_items_count := v_revenue.item_count;
  v_result.revenue_items_with_actuals := v_revenue.with_actuals;
  
  v_result.estimated_costs := v_costs.est_total;
  v_result.actual_costs := v_costs.act_total;
  v_result.cost_items_count := v_costs.item_count;
  v_result.cost_items_with_actuals := v_costs.with_actuals;
  
  v_result.estimated_profit := v_revenue.est_total - v_costs.est_total;
  v_result.actual_profit := v_revenue.act_total - v_costs.act_total;
  
  -- Calculate margins (avoid division by zero)
  IF v_revenue.est_total > 0 THEN
    v_result.estimated_margin := ROUND((v_result.estimated_profit::numeric / v_revenue.est_total * 100), 2);
  ELSE
    v_result.estimated_margin := 0;
  END IF;
  
  IF v_revenue.act_total > 0 THEN
    v_result.actual_margin := ROUND((v_result.actual_profit::numeric / v_revenue.act_total * 100), 2);
  ELSE
    v_result.actual_margin := 0;
  END IF;
  
  -- Calculate variance
  v_result.cost_variance := v_costs.act_total - v_costs.est_total;
  IF v_costs.est_total > 0 THEN
    v_result.cost_variance_pct := ROUND((v_result.cost_variance::numeric / v_costs.est_total * 100), 2);
  ELSE
    v_result.cost_variance_pct := 0;
  END IF;
  
  -- Commission totals
  v_result.total_commissions := v_commissions.total;
  v_result.draft_commissions := v_commissions.draft;
  v_result.approved_commissions := v_commissions.approved;
  v_result.paid_commissions := v_commissions.paid;
  
  v_result.last_calculated_at := now();
  v_result.updated_at := now();
  
  -- Upsert into cache table
  INSERT INTO public.job_financial_summary
  SELECT v_result.*
  ON CONFLICT (job_id) DO UPDATE SET
    estimated_revenue = EXCLUDED.estimated_revenue,
    actual_revenue = EXCLUDED.actual_revenue,
    collected_amount = EXCLUDED.collected_amount,
    revenue_items_count = EXCLUDED.revenue_items_count,
    revenue_items_with_actuals = EXCLUDED.revenue_items_with_actuals,
    estimated_costs = EXCLUDED.estimated_costs,
    actual_costs = EXCLUDED.actual_costs,
    cost_items_count = EXCLUDED.cost_items_count,
    cost_items_with_actuals = EXCLUDED.cost_items_with_actuals,
    estimated_profit = EXCLUDED.estimated_profit,
    actual_profit = EXCLUDED.actual_profit,
    estimated_margin = EXCLUDED.estimated_margin,
    actual_margin = EXCLUDED.actual_margin,
    cost_variance = EXCLUDED.cost_variance,
    cost_variance_pct = EXCLUDED.cost_variance_pct,
    total_commissions = EXCLUDED.total_commissions,
    draft_commissions = EXCLUDED.draft_commissions,
    approved_commissions = EXCLUDED.approved_commissions,
    paid_commissions = EXCLUDED.paid_commissions,
    last_calculated_at = EXCLUDED.last_calculated_at,
    updated_at = EXCLUDED.updated_at;
  
  RETURN v_result;
END;
$$;

-- =====================================================
-- TRIGGERS: Auto-recalculate on item changes
-- =====================================================

CREATE OR REPLACE FUNCTION public.trigger_recalc_job_financials()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Determine job_id based on operation
  IF TG_OP = 'DELETE' THEN
    PERFORM public.calculate_job_financials(OLD.job_id);
  ELSE
    PERFORM public.calculate_job_financials(NEW.job_id);
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger on revenue items
DROP TRIGGER IF EXISTS trg_revenue_items_recalc ON public.job_revenue_items;
CREATE TRIGGER trg_revenue_items_recalc
AFTER INSERT OR UPDATE OR DELETE ON public.job_revenue_items
FOR EACH ROW EXECUTE FUNCTION public.trigger_recalc_job_financials();

-- Trigger on cost items
DROP TRIGGER IF EXISTS trg_cost_items_recalc ON public.job_cost_items;
CREATE TRIGGER trg_cost_items_recalc
AFTER INSERT OR UPDATE OR DELETE ON public.job_cost_items
FOR EACH ROW EXECUTE FUNCTION public.trigger_recalc_job_financials();

-- Trigger on commission entries
DROP TRIGGER IF EXISTS trg_commission_entries_recalc ON public.commission_entries;
CREATE TRIGGER trg_commission_entries_recalc
AFTER INSERT OR UPDATE OR DELETE ON public.commission_entries
FOR EACH ROW EXECUTE FUNCTION public.trigger_recalc_job_financials();

-- =====================================================
-- SEED: Default Commission Plan
-- =====================================================

INSERT INTO public.commission_plans (id, name, description, is_active, is_default)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Standard Roofing Commission Plan',
  'Default commission plan: 3% of contract for sales, 1.5% for PM, with tiered bonuses above 35% margin',
  true,
  true
) ON CONFLICT DO NOTHING;

-- Sales rep rule: 3% of revenue
INSERT INTO public.commission_rules (plan_id, role, calculation_type, rate, priority)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'sales_rep',
  'percentage_of_revenue',
  3.0000,
  1
) ON CONFLICT DO NOTHING;

-- PM rule: 1.5% of revenue
INSERT INTO public.commission_rules (plan_id, role, calculation_type, rate, priority)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'project_manager',
  'percentage_of_revenue',
  1.5000,
  2
) ON CONFLICT DO NOTHING;

-- Bonus rule: tiered based on margin (applies to sales_rep)
INSERT INTO public.commission_rules (plan_id, role, calculation_type, tiers, priority)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'sales_rep_bonus',
  'tiered_percentage',
  '[
    {"min_margin": 35, "max_margin": 40, "rate": 0.5},
    {"min_margin": 40, "max_margin": 45, "rate": 1.0},
    {"min_margin": 45, "max_margin": 100, "rate": 1.5}
  ]'::jsonb,
  3
) ON CONFLICT DO NOTHING;

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_job_revenue_items_updated_at ON public.job_revenue_items;
CREATE TRIGGER trg_job_revenue_items_updated_at
BEFORE UPDATE ON public.job_revenue_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_job_cost_items_updated_at ON public.job_cost_items;
CREATE TRIGGER trg_job_cost_items_updated_at
BEFORE UPDATE ON public.job_cost_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_commission_plans_updated_at ON public.commission_plans;
CREATE TRIGGER trg_commission_plans_updated_at
BEFORE UPDATE ON public.commission_plans
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_commission_rules_updated_at ON public.commission_rules;
CREATE TRIGGER trg_commission_rules_updated_at
BEFORE UPDATE ON public.commission_rules
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_commission_entries_updated_at ON public.commission_entries;
CREATE TRIGGER trg_commission_entries_updated_at
BEFORE UPDATE ON public.commission_entries
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();