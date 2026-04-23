-- ==========================================================================
-- CONTACT ADMIN AUTH USER
-- Run this in Supabase SQL Editor if you want a direct email/password auth
-- user for contact@shoeglitch.com.
--
-- Why this exists:
-- The app user row already exists in public.users, but Supabase's auth admin
-- invite API returned "Database error saving new user" for this address.
-- This script creates the auth.users row directly and links it back to
-- public.users.authUserId.
--
-- After running:
-- 1. Sign in with email/password using the temp password below, or
-- 2. Reset the password immediately inside Supabase Auth / your app flow.
-- ==========================================================================

DO $$
DECLARE
  admin_email TEXT := 'contact@shoeglitch.com';
  admin_name TEXT := 'Shoe Glitch HQ';
  temp_password TEXT := 'shoeglitch-contact-admin';
  existing_public_user_id UUID;
  auth_user_id UUID;
BEGIN
  SELECT id::uuid
  INTO existing_public_user_id
  FROM public.users
  WHERE email = admin_email
  LIMIT 1;

  IF existing_public_user_id IS NULL THEN
    INSERT INTO public.users (
      id,
      email,
      name,
      role
    )
    VALUES (
      gen_random_uuid(),
      admin_email,
      admin_name,
      'super_admin'
    )
    RETURNING id::uuid INTO existing_public_user_id;
  ELSE
    UPDATE public.users
    SET role = 'super_admin',
        name = COALESCE(name, admin_name)
    WHERE id = existing_public_user_id::text;
  END IF;

  SELECT id
  INTO auth_user_id
  FROM auth.users
  WHERE email = admin_email
  LIMIT 1;

  IF auth_user_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      admin_email,
      crypt(temp_password, gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('name', admin_name, 'role', 'super_admin'),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO auth_user_id;
  END IF;

  UPDATE public.users
  SET authUserId = auth_user_id::text,
      role = 'super_admin',
      name = COALESCE(name, admin_name)
  WHERE id = existing_public_user_id::text;
END $$;

SELECT
  u.id,
  u.email,
  u.role,
  u.authUserId,
  au.email_confirmed_at IS NOT NULL AS auth_ready
FROM public.users u
LEFT JOIN auth.users au
  ON au.id::text = u.authUserId
WHERE u.email = 'contact@shoeglitch.com';
