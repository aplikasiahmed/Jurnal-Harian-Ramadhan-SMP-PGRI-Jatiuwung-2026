import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';

interface TeacherLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TeacherLoginModal({ isOpen, onClose }: TeacherLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Semua Kolom Wajib di Isi',
        text: 'Silakan isi email dan password terlebih dahulu!',
        confirmButtonColor: '#047857',
        width: '85%',
        customClass: {
          popup: 'rounded-2xl text-sm sm:text-base max-w-md z-[9999]',
          title: 'text-lg sm:text-xl',
        }
      });
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('userguru')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .single();

        if (error || !data) {
          throw new Error('Email atau password salah');
        }
        
        // Simpan status login di localStorage
        localStorage.setItem('teacher_logged_in', 'true');
        localStorage.setItem('teacher_email', email);
      } else {
        // Mock login if no supabase
        if (email === 'guru@smppgri.sch.id' && password === 'admin123') {
          localStorage.setItem('teacher_logged_in', 'true');
          localStorage.setItem('teacher_email', email);
        } else {
          throw new Error('Email atau password salah (Demo: guru@smppgri.sch.id / admin123)');
        }
      }
      onClose();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login');
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: 'Email atau password yang Anda masukkan salah!',
        confirmButtonColor: '#047857',
        width: '85%',
        customClass: {
          popup: 'rounded-2xl text-sm sm:text-base max-w-md z-[9999]',
          title: 'text-lg sm:text-xl',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2 text-gray-500 hover:bg-gray-100 rounded-full"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
        <CardHeader className="text-center p-6 pb-4">
          <div className="mx-auto mb-4">
            <img src="https://wogprdohptvfnmdanutd.supabase.co/storage/v1/object/sign/GAMBAR/Logo%20PGRI.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNjJiN2ZiMi1kNjA5LTRmNjYtYTliOC1jMGMwYmM2ZjQ2YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHQU1CQVIvTG9nbyBQR1JJLnBuZyIsImlhdCI6MTc3MzE1NjUzNiwiZXhwIjoxODA0NjkyNTM2fQ.TthcwawgwLCFfoFGR08xAD_cYXtRmypgCoeosILn2G8" alt="Logo PGRI" className="w-16 h-16 mx-auto object-contain" referrerPolicy="no-referrer" />
          </div>
          <CardTitle className="text-xl text-emerald-800">Login Guru</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Masuk untuk mengecek jurnal siswa</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-xs sm:text-sm border border-red-100">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-[44px] text-sm focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-[44px] text-sm focus-visible:ring-emerald-500"
              />
            </div>
            <Button type="submit" className="w-full min-h-[44px] text-sm mt-2 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
              {loading ? 'Masuk...' : 'Masuk'}
            </Button>
            <p className="text-xs text-center text-gray-500 mt-4">
              Hanya Guru yang dapat Masuk
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
