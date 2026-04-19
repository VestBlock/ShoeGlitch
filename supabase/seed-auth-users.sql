-- ==========================================================================
-- SEED DEMO AUTH USERS
-- Run this in Supabase SQL Editor AFTER your main schema + seed data are in.
-- Creates auth.users entries for the demo role-switch buttons.
-- All demo users share password: shoeglitch-demo
--
-- IMPORTANT: the emails must EXACTLY match the ones in public.users.
-- If you renamed any in your seed, update them here too.
-- ==========================================================================

-- Helper function: creates an auth user with a known password if they don't exist.
-- Uses Supabase's built-in crypto helpers. The password is bcrypt-hashed.

DO $$
DECLARE
  demo_password TEXT := 'shoeglitch-demo';
  demo_emails TEXT[] := ARRAY[
    'admin@shoeglitch.test',
    'cm.milwaukee@shoeglitch.test',
    'cm.memphis@shoeglitch.test',
    'cm.atlanta@shoeglitch.test',
    'cleaner.milwaukee@shoeglitch.test',
    'cleaner2.milwaukee@shoeglitch.test',
    'cleaner.atlanta@shoeglitch.test',
    'customer@shoeglitch.test',
    'maya@shoeglitch.test'
  ];
  demo_email TEXT;
BEGIN
  FOREACH demo_email IN ARRAY demo_emails
  LOOP
    -- Skip if already exists in auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = demo_email) THEN
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
        demo_email,
        crypt(demo_password, gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
      );
    END IF;
  END LOOP;
END $$;

-- Verify
SELECT email, email_confirmed_at IS NOT NULL AS confirmed FROM auth.users
WHERE email LIKE '%@shoeglitch.test'
ORDER BY email;
