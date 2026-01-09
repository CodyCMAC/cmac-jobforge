-- Create activity type enum
CREATE TYPE public.activity_type AS ENUM (
  'comment_created',
  'status_changed',
  'assigned_changed',
  'job_created',
  'task_completed',
  'proposal_created',
  'proposal_sent',
  'proposal_signed'
);

-- Create job_comments table
CREATE TABLE public.job_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_initials TEXT NOT NULL,
  body TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.job_comments(id) ON DELETE CASCADE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for job_comments
CREATE INDEX idx_job_comments_job_created ON public.job_comments(job_id, created_at DESC);
CREATE INDEX idx_job_comments_author_created ON public.job_comments(author_user_id, created_at DESC);

-- Create job_activity table
CREATE TABLE public.job_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  actor_user_id UUID,
  actor_name TEXT,
  actor_initials TEXT,
  type activity_type NOT NULL,
  summary TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for job_activity
CREATE INDEX idx_job_activity_created ON public.job_activity(created_at DESC);
CREATE INDEX idx_job_activity_job_created ON public.job_activity(job_id, created_at DESC);
CREATE INDEX idx_job_activity_type_created ON public.job_activity(type, created_at DESC);

-- Add comment_count and last_activity_at to jobs table for efficient queries
ALTER TABLE public.jobs 
ADD COLUMN comment_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN last_comment_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN last_comment_snippet TEXT,
ADD COLUMN priority TEXT DEFAULT 'normal';

-- Enable RLS on both tables
ALTER TABLE public.job_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_activity ENABLE ROW LEVEL SECURITY;

-- RLS policies for job_comments (authenticated users only)
CREATE POLICY "Comments are readable by authenticated users"
ON public.job_comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Comments are insertable by authenticated users"
ON public.job_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_user_id);

CREATE POLICY "Comments are updatable by author within 5 minutes or admin"
ON public.job_comments FOR UPDATE TO authenticated 
USING (auth.uid() = author_user_id AND created_at > now() - interval '5 minutes');

CREATE POLICY "Comments are deletable by author"
ON public.job_comments FOR DELETE TO authenticated 
USING (auth.uid() = author_user_id);

-- RLS policies for job_activity (authenticated users only)
CREATE POLICY "Activity is readable by authenticated users"
ON public.job_activity FOR SELECT TO authenticated USING (true);

CREATE POLICY "Activity is insertable by authenticated users"
ON public.job_activity FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger to update updated_at on job_comments
CREATE TRIGGER update_job_comments_updated_at
BEFORE UPDATE ON public.job_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update job comment stats when a comment is added
CREATE OR REPLACE FUNCTION public.update_job_comment_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.jobs 
    SET 
      comment_count = comment_count + 1,
      last_comment_at = NEW.created_at,
      last_comment_snippet = LEFT(NEW.body, 100),
      last_activity_at = NEW.created_at
    WHERE id = NEW.job_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.is_deleted = true AND OLD.is_deleted = false) THEN
    UPDATE public.jobs 
    SET comment_count = GREATEST(0, comment_count - 1)
    WHERE id = COALESCE(NEW.job_id, OLD.job_id);
    RETURN COALESCE(NEW, OLD);
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for comment stats
CREATE TRIGGER update_job_comment_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.job_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_job_comment_stats();

-- Function to update job last_activity_at when activity is added
CREATE OR REPLACE FUNCTION public.update_job_activity_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jobs 
  SET last_activity_at = NEW.created_at
  WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$;

-- Trigger for activity timestamp
CREATE TRIGGER update_job_activity_timestamp_trigger
AFTER INSERT ON public.job_activity
FOR EACH ROW
EXECUTE FUNCTION public.update_job_activity_timestamp();

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_activity;