-- 1) Make job status updates possible (Workflow & Stages)
-- Replace overly-permissive public policies with authenticated-only CRUD.
DROP POLICY IF EXISTS "Allow public read access to jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow public insert access to jobs" ON public.jobs;

CREATE POLICY "Jobs are readable by authenticated users"
ON public.jobs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Jobs are insertable by authenticated users"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Jobs are updatable by authenticated users"
ON public.jobs
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Jobs are deletable by authenticated users"
ON public.jobs
FOR DELETE
TO authenticated
USING (true);

-- Keep updated_at correct on edits
DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- 2) Job Tasks (persistent tasks per job)
CREATE TABLE IF NOT EXISTS public.job_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  due_date DATE,
  assignee TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_tasks_job_id ON public.job_tasks(job_id);
CREATE INDEX IF NOT EXISTS idx_job_tasks_job_id_created_at ON public.job_tasks(job_id, created_at DESC);

ALTER TABLE public.job_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Job tasks are readable by authenticated users" ON public.job_tasks;
DROP POLICY IF EXISTS "Job tasks are insertable by authenticated users" ON public.job_tasks;
DROP POLICY IF EXISTS "Job tasks are updatable by authenticated users" ON public.job_tasks;
DROP POLICY IF EXISTS "Job tasks are deletable by authenticated users" ON public.job_tasks;

CREATE POLICY "Job tasks are readable by authenticated users"
ON public.job_tasks
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Job tasks are insertable by authenticated users"
ON public.job_tasks
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Job tasks are updatable by authenticated users"
ON public.job_tasks
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Job tasks are deletable by authenticated users"
ON public.job_tasks
FOR DELETE
TO authenticated
USING (true);

DROP TRIGGER IF EXISTS update_job_tasks_updated_at ON public.job_tasks;
CREATE TRIGGER update_job_tasks_updated_at
BEFORE UPDATE ON public.job_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- 3) Job Activity Log (persistent activity entries per job)
CREATE TABLE IF NOT EXISTS public.job_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'note',
  title TEXT NOT NULL,
  body TEXT,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_activities_job_id ON public.job_activities(job_id);
CREATE INDEX IF NOT EXISTS idx_job_activities_job_id_created_at ON public.job_activities(job_id, created_at DESC);

ALTER TABLE public.job_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Job activities are readable by authenticated users" ON public.job_activities;
DROP POLICY IF EXISTS "Job activities are insertable by authenticated users" ON public.job_activities;
DROP POLICY IF EXISTS "Job activities are updatable by authenticated users" ON public.job_activities;
DROP POLICY IF EXISTS "Job activities are deletable by authenticated users" ON public.job_activities;

CREATE POLICY "Job activities are readable by authenticated users"
ON public.job_activities
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Job activities are insertable by authenticated users"
ON public.job_activities
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Job activities are updatable by authenticated users"
ON public.job_activities
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Job activities are deletable by authenticated users"
ON public.job_activities
FOR DELETE
TO authenticated
USING (true);
