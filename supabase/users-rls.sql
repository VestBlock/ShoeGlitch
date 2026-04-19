-- ==========================================================================
-- RLS POLICIES FOR public.users
-- Required for middleware role-based redirects to work.
-- An authenticated user must be able to read their own row by email.
-- ==========================================================================

-- Make sure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own users row (matched by email).
-- This is what middleware.ts uses to fetch the role.
DROP POLICY IF EXISTS "users_self_select" ON public.users;
CREATE POLICY "users_self_select"
ON public.users
FOR SELECT
TO authenticated
USING (email = (auth.jwt() ->> 'email'));

-- Allow super_admin role to read any user row.
-- Uses a subquery because we can't recursively read users inside a policy
-- without infinite loop; the trick is to check the auth email belongs to
-- a super_admin. This uses the service_role path already (admin client),
-- so the policy mostly exists to support client-side reads if you add them.
DROP POLICY IF EXISTS "users_admin_select" ON public.users;
CREATE POLICY "users_admin_select"
ON public.users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u2
    WHERE u2.email = (auth.jwt() ->> 'email')
      AND u2.role = 'super_admin'
  )
);

-- Verify
SELECT policyname, cmd, qual FROM pg_policies WHERE schemaname='public' AND tablename='users';
