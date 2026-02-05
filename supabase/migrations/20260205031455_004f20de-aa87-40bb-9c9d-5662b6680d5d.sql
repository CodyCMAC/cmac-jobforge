-- Create audit log table for tracking role changes and other admin actions
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  target_user_id uuid NOT NULL,
  target_user_email text,
  actor_user_id uuid NOT NULL,
  actor_email text,
  old_value jsonb,
  new_value jsonb,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Audit log: admin read only"
ON public.admin_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Only service role (edge functions) can insert - no direct user inserts
-- We'll handle inserts via edge function with service role key

-- Create user invites table
CREATE TABLE public.user_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  invited_by uuid NOT NULL,
  invited_by_email text,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;

-- Admins can read all invites
CREATE POLICY "Invites: admin read"
ON public.user_invites
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete invites
CREATE POLICY "Invites: admin delete"
ON public.user_invites
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Index for faster lookups
CREATE INDEX idx_user_invites_email ON public.user_invites(email);
CREATE INDEX idx_user_invites_token ON public.user_invites(token);
CREATE INDEX idx_admin_audit_log_target ON public.admin_audit_log(target_user_id);
CREATE INDEX idx_admin_audit_log_created ON public.admin_audit_log(created_at DESC);