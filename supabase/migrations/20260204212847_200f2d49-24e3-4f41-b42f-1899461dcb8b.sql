-- Security fixes (error-level findings):
-- 1) Add roles helper for "authorized managers" checks
-- 2) Add ownership columns + tighter RLS for contacts/jobs/proposals
-- 3) Remove public write access from estimator_questions (keep public read)

BEGIN;

-- =========================================================
-- 1) Roles (separate table) + helper function
-- =========================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE t.typname='app_role' AND n.nspname='public') THEN
    CREATE TYPE public.app_role AS ENUM ('admin','manager','member');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- user_roles policies
DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
CREATE POLICY "Admins can read all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow users to self-provision ONLY the lowest role for themselves (prevents privilege escalation)
DROP POLICY IF EXISTS "Users can self-assign member role" ON public.user_roles;
CREATE POLICY "Users can self-assign member role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'member');

-- Seed: make existing users admins so current app behavior doesn't suddenly break.
-- (You can later downgrade users by inserting/removing roles via backend admin workflows.)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
ON CONFLICT DO NOTHING;


-- =========================================================
-- 2) Ownership columns + tighter RLS for sensitive tables
-- =========================================================

-- Ownership helpers
CREATE OR REPLACE FUNCTION public.set_owner_user_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_user_id IS NULL THEN
    NEW.owner_user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- contacts.owner_user_id
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS owner_user_id uuid;
CREATE INDEX IF NOT EXISTS idx_contacts_owner_user_id ON public.contacts (owner_user_id);

DROP TRIGGER IF EXISTS trg_contacts_set_owner_user_id ON public.contacts;
CREATE TRIGGER trg_contacts_set_owner_user_id
BEFORE INSERT ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.set_owner_user_id();

-- jobs.owner_user_id
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS owner_user_id uuid;
CREATE INDEX IF NOT EXISTS idx_jobs_owner_user_id ON public.jobs (owner_user_id);

DROP TRIGGER IF EXISTS trg_jobs_set_owner_user_id ON public.jobs;
CREATE TRIGGER trg_jobs_set_owner_user_id
BEFORE INSERT ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.set_owner_user_id();

-- Tighten contacts RLS (replace permissive authenticated policies)
DROP POLICY IF EXISTS "Contacts are readable by authenticated users" ON public.contacts;
DROP POLICY IF EXISTS "Contacts are insertable by authenticated users" ON public.contacts;
DROP POLICY IF EXISTS "Contacts are updatable by authenticated users" ON public.contacts;
DROP POLICY IF EXISTS "Contacts are deletable by authenticated users" ON public.contacts;

CREATE POLICY "Contacts: read own or privileged"
ON public.contacts
FOR SELECT
TO authenticated
USING (
  owner_user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Contacts: create as self (or privileged)"
ON public.contacts
FOR INSERT
TO authenticated
WITH CHECK (
  owner_user_id IS NULL
  OR owner_user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Contacts: update own or privileged"
ON public.contacts
FOR UPDATE
TO authenticated
USING (
  owner_user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
)
WITH CHECK (
  owner_user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Contacts: delete own or privileged"
ON public.contacts
FOR DELETE
TO authenticated
USING (
  owner_user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

-- Tighten jobs RLS (needed so proposals inherit access via job ownership)
DROP POLICY IF EXISTS "Jobs are readable by authenticated users" ON public.jobs;
DROP POLICY IF EXISTS "Jobs are insertable by authenticated users" ON public.jobs;
DROP POLICY IF EXISTS "Jobs are updatable by authenticated users" ON public.jobs;
DROP POLICY IF EXISTS "Jobs are deletable by authenticated users" ON public.jobs;

CREATE POLICY "Jobs: read own or privileged"
ON public.jobs
FOR SELECT
TO authenticated
USING (
  owner_user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Jobs: create as self (or privileged)"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (
  owner_user_id IS NULL
  OR owner_user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Jobs: update own or privileged"
ON public.jobs
FOR UPDATE
TO authenticated
USING (
  owner_user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
)
WITH CHECK (
  owner_user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Jobs: delete own or privileged"
ON public.jobs
FOR DELETE
TO authenticated
USING (
  owner_user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

-- Tighten proposals access to job owner/admin/manager
DROP POLICY IF EXISTS "Allow authenticated read access to proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow authenticated insert access to proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow authenticated update access to proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow authenticated delete access to proposals" ON public.proposals;

CREATE POLICY "Proposals: read by job access"
ON public.proposals
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = proposals.job_id)
);

CREATE POLICY "Proposals: create by job access"
ON public.proposals
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = proposals.job_id)
);

CREATE POLICY "Proposals: update by job access"
ON public.proposals
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = proposals.job_id)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = proposals.job_id)
);

CREATE POLICY "Proposals: delete by job access"
ON public.proposals
FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = proposals.job_id)
);

-- Ensure proposal_options / proposal_line_items inherit proposal access too
DROP POLICY IF EXISTS "Allow authenticated read access to proposal_options" ON public.proposal_options;
DROP POLICY IF EXISTS "Allow authenticated insert access to proposal_options" ON public.proposal_options;
DROP POLICY IF EXISTS "Allow authenticated update access to proposal_options" ON public.proposal_options;
DROP POLICY IF EXISTS "Allow authenticated delete access to proposal_options" ON public.proposal_options;

CREATE POLICY "Proposal options: read by proposal access"
ON public.proposal_options
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_options.proposal_id)
);

CREATE POLICY "Proposal options: create by proposal access"
ON public.proposal_options
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_options.proposal_id)
);

CREATE POLICY "Proposal options: update by proposal access"
ON public.proposal_options
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_options.proposal_id)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_options.proposal_id)
);

CREATE POLICY "Proposal options: delete by proposal access"
ON public.proposal_options
FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_options.proposal_id)
);

DROP POLICY IF EXISTS "Allow authenticated read access to proposal_line_items" ON public.proposal_line_items;
DROP POLICY IF EXISTS "Allow authenticated insert access to proposal_line_items" ON public.proposal_line_items;
DROP POLICY IF EXISTS "Allow authenticated update access to proposal_line_items" ON public.proposal_line_items;
DROP POLICY IF EXISTS "Allow authenticated delete access to proposal_line_items" ON public.proposal_line_items;

CREATE POLICY "Proposal line items: read by proposal access"
ON public.proposal_line_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.proposal_options o
    WHERE o.id = proposal_line_items.option_id
  )
);

CREATE POLICY "Proposal line items: create by proposal access"
ON public.proposal_line_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.proposal_options o
    WHERE o.id = proposal_line_items.option_id
  )
);

CREATE POLICY "Proposal line items: update by proposal access"
ON public.proposal_line_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.proposal_options o
    WHERE o.id = proposal_line_items.option_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.proposal_options o
    WHERE o.id = proposal_line_items.option_id
  )
);

CREATE POLICY "Proposal line items: delete by proposal access"
ON public.proposal_line_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.proposal_options o
    WHERE o.id = proposal_line_items.option_id
  )
);


-- =========================================================
-- 3) estimator_questions: remove public write, keep public read
-- =========================================================
DROP POLICY IF EXISTS "Allow public insert access to estimator_questions" ON public.estimator_questions;
DROP POLICY IF EXISTS "Allow public update access to estimator_questions" ON public.estimator_questions;
DROP POLICY IF EXISTS "Allow public delete access to estimator_questions" ON public.estimator_questions;

-- Replace public read with "only for active estimators" (prevents scraping inactive/draft forms)
DROP POLICY IF EXISTS "Allow public read access to estimator_questions" ON public.estimator_questions;

CREATE POLICY "Estimator questions are publicly readable for active estimators"
ON public.estimator_questions
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM public.instant_estimators ie
    WHERE ie.id = estimator_questions.estimator_id
      AND ie.is_active = true
  )
);

-- Authenticated read (internal builder/admin UI)
DROP POLICY IF EXISTS "Estimator questions are readable by authenticated users" ON public.estimator_questions;
CREATE POLICY "Estimator questions are readable by authenticated users"
ON public.estimator_questions
FOR SELECT
TO authenticated
USING (true);

-- Authenticated write (prevents public tampering)
DROP POLICY IF EXISTS "Estimator questions are insertable by authenticated users" ON public.estimator_questions;
CREATE POLICY "Estimator questions are insertable by authenticated users"
ON public.estimator_questions
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Estimator questions are updatable by authenticated users" ON public.estimator_questions;
CREATE POLICY "Estimator questions are updatable by authenticated users"
ON public.estimator_questions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Estimator questions are deletable by authenticated users" ON public.estimator_questions;
CREATE POLICY "Estimator questions are deletable by authenticated users"
ON public.estimator_questions
FOR DELETE
TO authenticated
USING (true);

COMMIT;
