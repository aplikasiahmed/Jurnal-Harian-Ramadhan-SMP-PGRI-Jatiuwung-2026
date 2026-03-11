-- Script SQL untuk membuat akun Guru di Supabase Auth
-- Jalankan script ini di SQL Editor Supabase Anda.
-- Email default: guru@smppgri.sch.id
-- Password default: admin123

-- Pastikan ekstensi pgcrypto aktif (biasanya sudah aktif di Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert user ke dalam tabel auth.users
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
  'guru@smppgri.sch.id',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"teacher"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Note: Jika Anda ingin menambahkan user lain, cukup ganti email dan password pada script di atas.
