-- Script SQL untuk menambahkan kolom bukti_tarawih dan bukti_tadarus
-- Jalankan script ini di SQL Editor Supabase Anda.

ALTER TABLE public.jurnal_ramadhan
ADD COLUMN IF NOT EXISTS bukti_tarawih text,
ADD COLUMN IF NOT EXISTS bukti_tadarus text;
