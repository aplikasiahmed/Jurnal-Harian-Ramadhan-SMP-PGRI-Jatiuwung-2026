import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Lock, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

export default function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Semua Kolom Wajib di Isi',
        text: 'Silakan isi email dan password terlebih dahulu!',
        confirmButtonColor: '#047857',
        
        customClass: {
          popup: 'swal2-mobile-optimized',
          title: 'swal2-title-optimized',
          htmlContainer: 'swal2-content-optimized',
          confirmButton: 'swal2-confirm-optimized',
          cancelButton: 'swal2-cancel-optimized'
        }
      });
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      } else {
        // Mock login if no supabase
        if (email === 'guru@smppgri.sch.id' && password === 'admin123') {
          // Success
        } else {
          throw new Error('Email atau password salah (Demo: guru@smppgri.sch.id / admin123)');
        }
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login');
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: 'Email atau password yang Anda masukkan salah!',
        confirmButtonColor: '#047857',
        
        customClass: {
          popup: 'swal2-mobile-optimized',
          title: 'swal2-title-optimized',
          htmlContainer: 'swal2-content-optimized',
          confirmButton: 'swal2-confirm-optimized',
          cancelButton: 'swal2-cancel-optimized'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col relative">
      <div className="p-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 min-h-[44px] text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center p-6 pb-4">
            <div className="mx-auto mb-4">
              <img src="https://wogprdohptvfnmdanutd.supabase.co/storage/v1/object/sign/GAMBAR/Logo%20PGRI.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNjJiN2ZiMi1kNjA5LTRmNjYtYTliOC1jMGMwYmM2ZjQ2YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHQU1CQVIvTG9nbyBQR1JJLnBuZyIsImlhdCI6MTc3MzE1NjUzNiwiZXhwIjoxODA0NjkyNTM2fQ.TthcwawgwLCFfoFGR08xAD_cYXtRmypgCoeosILn2G8" alt="Logo PGRI" className="w-16 h-16 mx-auto object-contain" referrerPolicy="no-referrer" />
            </div>
            <CardTitle className="text-xl">Login Guru</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Masuk untuk mengecek jurnal siswa</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-xs sm:text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-[44px] text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="************"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-[44px] text-sm"
                />
              </div>
              <Button type="submit" className="w-full min-h-[44px] text-sm mt-2" disabled={loading}>
                {loading ? 'Masuk...' : 'Masuk'}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-2">
                Hanya Guru yang dapat Masuk
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
