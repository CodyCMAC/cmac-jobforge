-- Fix security issues: Restrict public access to authenticated users only

-- ============================================
-- 1. FIX: contacts_table_public_exposure
-- Remove public read/insert policies, add authenticated-only policies
-- ============================================

-- Drop existing public policies
DROP POLICY IF EXISTS "Allow public read access to contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow public insert access to contacts" ON public.contacts;

-- Create authenticated-only policies
CREATE POLICY "Contacts are readable by authenticated users"
ON public.contacts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Contacts are insertable by authenticated users"
ON public.contacts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Contacts are updatable by authenticated users"
ON public.contacts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Contacts are deletable by authenticated users"
ON public.contacts FOR DELETE TO authenticated USING (true);

-- ============================================
-- 2. FIX: instant_estimators_public_modification
-- Change public policies to authenticated-only
-- ============================================

-- Drop existing public policies
DROP POLICY IF EXISTS "Allow public read access to instant_estimators" ON public.instant_estimators;
DROP POLICY IF EXISTS "Allow public insert access to instant_estimators" ON public.instant_estimators;
DROP POLICY IF EXISTS "Allow public update access to instant_estimators" ON public.instant_estimators;
DROP POLICY IF EXISTS "Allow public delete access to instant_estimators" ON public.instant_estimators;

-- Create authenticated-only policies for management
CREATE POLICY "Estimators are readable by authenticated users"
ON public.instant_estimators FOR SELECT TO authenticated USING (true);

CREATE POLICY "Estimators are insertable by authenticated users"
ON public.instant_estimators FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Estimators are updatable by authenticated users"
ON public.instant_estimators FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Estimators are deletable by authenticated users"
ON public.instant_estimators FOR DELETE TO authenticated USING (true);

-- Allow public read for active estimators (needed for public estimate pages)
CREATE POLICY "Active estimators are publicly readable"
ON public.instant_estimators FOR SELECT TO anon USING (is_active = true);

-- ============================================
-- 3. FIX: estimator_leads_exposure
-- Remove public read/update, keep public insert for form submissions
-- ============================================

-- Drop existing public policies
DROP POLICY IF EXISTS "Allow public read access to estimator_leads" ON public.estimator_leads;
DROP POLICY IF EXISTS "Allow public update access to estimator_leads" ON public.estimator_leads;

-- Keep public insert for form submissions (this policy already exists and is correct)
-- DROP POLICY IF EXISTS "Allow public insert access to estimator_leads" ON public.estimator_leads;

-- Create authenticated-only policies for management
CREATE POLICY "Leads are readable by authenticated users"
ON public.estimator_leads FOR SELECT TO authenticated USING (true);

CREATE POLICY "Leads are updatable by authenticated users"
ON public.estimator_leads FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Leads are deletable by authenticated users"
ON public.estimator_leads FOR DELETE TO authenticated USING (true);