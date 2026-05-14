BEGIN;

DROP POLICY IF EXISTS "Users can self-assign member role" ON public.user_roles;

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.instant_estimator_contact_details (
  estimator_id uuid PRIMARY KEY REFERENCES public.instant_estimators(id) ON DELETE CASCADE,
  contact_name text,
  contact_email text,
  contact_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.instant_estimator_contact_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Estimator contacts are readable by authenticated users" ON public.instant_estimator_contact_details;
CREATE POLICY "Estimator contacts are readable by authenticated users"
ON public.instant_estimator_contact_details
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.instant_estimators ie
    WHERE ie.id = instant_estimator_contact_details.estimator_id
  )
);

DROP POLICY IF EXISTS "Estimator contacts are insertable by authenticated users" ON public.instant_estimator_contact_details;
CREATE POLICY "Estimator contacts are insertable by authenticated users"
ON public.instant_estimator_contact_details
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.instant_estimators ie
    WHERE ie.id = instant_estimator_contact_details.estimator_id
  )
);

DROP POLICY IF EXISTS "Estimator contacts are updatable by authenticated users" ON public.instant_estimator_contact_details;
CREATE POLICY "Estimator contacts are updatable by authenticated users"
ON public.instant_estimator_contact_details
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.instant_estimators ie
    WHERE ie.id = instant_estimator_contact_details.estimator_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.instant_estimators ie
    WHERE ie.id = instant_estimator_contact_details.estimator_id
  )
);

DROP POLICY IF EXISTS "Estimator contacts are deletable by authenticated users" ON public.instant_estimator_contact_details;
CREATE POLICY "Estimator contacts are deletable by authenticated users"
ON public.instant_estimator_contact_details
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.instant_estimators ie
    WHERE ie.id = instant_estimator_contact_details.estimator_id
  )
);

DROP TRIGGER IF EXISTS update_instant_estimator_contact_details_updated_at ON public.instant_estimator_contact_details;
CREATE TRIGGER update_instant_estimator_contact_details_updated_at
BEFORE UPDATE ON public.instant_estimator_contact_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.instant_estimator_contact_details (estimator_id, contact_name, contact_email, contact_phone)
SELECT id, contact_name, contact_email, contact_phone
FROM public.instant_estimators
WHERE contact_name IS NOT NULL OR contact_email IS NOT NULL OR contact_phone IS NOT NULL
ON CONFLICT (estimator_id) DO UPDATE SET
  contact_name = EXCLUDED.contact_name,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone;

ALTER TABLE public.instant_estimators
  DROP COLUMN IF EXISTS contact_name,
  DROP COLUMN IF EXISTS contact_email,
  DROP COLUMN IF EXISTS contact_phone;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'job_comments'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.job_comments';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'job_activity'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.job_activity';
  END IF;
END $$;

COMMIT;