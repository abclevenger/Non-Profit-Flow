-- App user profile row keyed by Supabase auth user id (matches Prisma `User.supabaseAuthId` / `auth.users.id`).

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  job_title text,
  phone text,
  timezone text,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_profiles_select_own ON public.user_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY user_profiles_update_own ON public.user_profiles
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_profiles_insert_own ON public.user_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());
