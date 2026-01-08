-- Drop all public policies on estimator_materials
DROP POLICY IF EXISTS "Allow public read access to estimator_materials" ON public.estimator_materials;
DROP POLICY IF EXISTS "Allow public insert access to estimator_materials" ON public.estimator_materials;
DROP POLICY IF EXISTS "Allow public update access to estimator_materials" ON public.estimator_materials;
DROP POLICY IF EXISTS "Allow public delete access to estimator_materials" ON public.estimator_materials;

-- Create authenticated-only policies
CREATE POLICY "Materials are readable by authenticated users"
ON public.estimator_materials FOR SELECT TO authenticated USING (true);

CREATE POLICY "Materials are insertable by authenticated users"
ON public.estimator_materials FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Materials are updatable by authenticated users"
ON public.estimator_materials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Materials are deletable by authenticated users"
ON public.estimator_materials FOR DELETE TO authenticated USING (true);