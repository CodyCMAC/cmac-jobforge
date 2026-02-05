-- Fix: Allow all authenticated users to READ jobs for the Pulse common board
-- This makes the activity feed visible across users while keeping write operations restricted

-- Drop the restrictive read policy
DROP POLICY IF EXISTS "Jobs: read own or privileged" ON public.jobs;

-- Create new policy allowing all authenticated users to read all jobs
CREATE POLICY "Jobs: readable by all authenticated" 
ON public.jobs FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Keep write policies unchanged (owner or privileged only)