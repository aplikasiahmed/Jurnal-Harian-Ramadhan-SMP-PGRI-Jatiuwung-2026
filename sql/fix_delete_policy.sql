-- Script untuk mengaktifkan izin HAPUS (DELETE) pada tabel jurnal_ramadhan
-- Jalankan script ini di SQL Editor Supabase Anda

-- 1. Pastikan RLS aktif (biasanya sudah aktif)
ALTER TABLE public.jurnal_ramadhan ENABLE ROW LEVEL SECURITY;

-- 2. Hapus policy lama jika ada (opsional, untuk menghindari konflik)
DROP POLICY IF EXISTS "Allow delete for everyone" ON public.jurnal_ramadhan;
DROP POLICY IF EXISTS "Allow delete for anon" ON public.jurnal_ramadhan;

-- 3. Buat policy baru untuk mengizinkan penghapusan oleh siapa saja (anon dan authenticated)
-- Catatan: Dalam produksi, Anda mungkin ingin membatasi ini hanya untuk user tertentu,
-- tetapi untuk aplikasi ini yang menggunakan anon key, ini adalah solusinya.
CREATE POLICY "Allow delete for everyone" 
ON public.jurnal_ramadhan 
FOR DELETE 
TO anon, authenticated 
USING (true);

-- 4. Pastikan juga izin SELECT, INSERT, dan UPDATE tersedia jika belum
DROP POLICY IF EXISTS "Allow select for everyone" ON public.jurnal_ramadhan;
CREATE POLICY "Allow select for everyone" ON public.jurnal_ramadhan FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow insert for everyone" ON public.jurnal_ramadhan;
CREATE POLICY "Allow insert for everyone" ON public.jurnal_ramadhan FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for everyone" ON public.jurnal_ramadhan;
CREATE POLICY "Allow update for everyone" ON public.jurnal_ramadhan FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
