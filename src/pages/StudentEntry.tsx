import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { BookOpen, CheckCircle2, Moon, Sun, Lock } from 'lucide-react';

export default function StudentEntry() {
  const navigate = useNavigate();
  const [nis, setNis] = useState('');
  const [isNisSubmitted, setIsNisSubmitted] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    puasa: 'Penuh',
    shalat_subuh: false,
    shalat_dzuhur: false,
    shalat_ashar: false,
    shalat_maghrib: false,
    shalat_isya: false,
    shalat_tarawih: false,
    tadarus_surah: '',
    tadarus_ayat: '',
    kebaikan: '',
  });

  const handleNisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis.trim()) return;
    
    setLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('students')
          .select('name')
          .eq('nis', nis)
          .single();
        
        if (data) {
          setStudentName(data.name);
        } else {
          setStudentName('Siswa (Data tidak ditemukan, tetap bisa mengisi)');
        }
      } else {
        setStudentName('Siswa (Mode Demo)');
      }
      setIsNisSubmitted(true);
    } catch (error) {
      console.error(error);
      setIsNisSubmitted(true);
      setStudentName('Siswa');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (supabase) {
        const { error } = await supabase
          .from('jurnal_ramadhan')
          .insert([
            {
              nis,
              ...formData
            }
          ]);
          
        if (error) throw error;
      }
      
      setSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Terjadi kesalahan saat menyimpan data. Pastikan tabel jurnal_ramadhan sudah dibuat di Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-emerald-50 flex flex-col">
        <header className="sticky top-0 z-10 bg-emerald-700 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="https://wogprdohptvfnmdanutd.supabase.co/storage/v1/object/sign/GAMBAR/Logo%20PGRI.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNjJiN2ZiMi1kNjA5LTRmNjYtYTliOC1jMGMwYmM2ZjQ2YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHQU1CQVIvTG9nbyBQR1JJLnBuZyIsImlhdCI6MTc3MzE1NjUzNiwiZXhwIjoxODA0NjkyNTM2fQ.TthcwawgwLCFfoFGR08xAD_cYXtRmypgCoeosILn2G8" alt="Logo PGRI" className="w-8 h-8 object-contain bg-white rounded-full p-0.5" referrerPolicy="no-referrer" />
              <span className="font-bold text-sm sm:text-base truncate">Jurnal Ramadhan</span>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center py-8">
            <CardContent className="flex flex-col items-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              <CardTitle className="text-2xl text-emerald-800">Alhamdulillah!</CardTitle>
              <p className="text-gray-600">Jurnal Ramadhan hari ini berhasil disimpan.</p>
              <Button onClick={() => window.location.reload()} className="mt-4 min-h-[44px] w-full sm:w-auto">
                Kembali ke Awal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col">
      {/* Header with Login Guru Button */}
      <header className="sticky top-0 z-10 bg-emerald-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="https://wogprdohptvfnmdanutd.supabase.co/storage/v1/object/sign/GAMBAR/Logo%20PGRI.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNjJiN2ZiMi1kNjA5LTRmNjYtYTliOC1jMGMwYmM2ZjQ2YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHQU1CQVIvTG9nbyBQR1JJLnBuZyIsImlhdCI6MTc3MzE1NjUzNiwiZXhwIjoxODA0NjkyNTM2fQ.TthcwawgwLCFfoFGR08xAD_cYXtRmypgCoeosILn2G8" alt="Logo PGRI" className="w-8 h-8 sm:w-10 sm:h-10 object-contain bg-white rounded-full p-0.5" referrerPolicy="no-referrer" />
            <span className="font-bold text-sm sm:text-base truncate">Jurnal Ramadhan</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-transparent border-white/30 text-white hover:bg-emerald-600 hover:text-white min-h-[40px]"
            onClick={() => navigate('/login')}
          >
            <Lock className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Login Guru</span>
            <span className="sm:hidden ml-2">Guru</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <img src="https://wogprdohptvfnmdanutd.supabase.co/storage/v1/object/sign/GAMBAR/Logo%20PGRI.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNjJiN2ZiMi1kNjA5LTRmNjYtYTliOC1jMGMwYmM2ZjQ2YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHQU1CQVIvTG9nbyBQR1JJLnBuZyIsImlhdCI6MTc3MzE1NjUzNiwiZXhwIjoxODA0NjkyNTM2fQ.TthcwawgwLCFfoFGR08xAD_cYXtRmypgCoeosILn2G8" alt="Logo PGRI" className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 object-contain" referrerPolicy="no-referrer" />
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-2">Jurnal Harian</h1>
            <p className="text-sm sm:text-base text-emerald-700">SMP PGRI Jatiuwung Kota Tangerang</p>
          </div>

          {!isNisSubmitted ? (
            <Card className="max-w-md mx-auto">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl">Mulai Pengisian</CardTitle>
                <CardDescription>Masukkan Nomor Induk Siswa (NIS) Anda untuk melanjutkan</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <form onSubmit={handleNisSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nis">Nomor Induk Siswa (NIS)</Label>
                    <Input
                      id="nis"
                      placeholder="Contoh: 2023001"
                      value={nis}
                      onChange={(e) => setNis(e.target.value)}
                      required
                      className="min-h-[44px] text-lg"
                    />
                  </div>
                  <Button type="submit" className="w-full min-h-[44px] text-base" disabled={loading}>
                    {loading ? 'Memeriksa...' : 'Lanjut'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="p-4 sm:p-6 bg-emerald-600 text-white rounded-t-xl">
                <CardTitle className="text-xl">Form Jurnal Harian</CardTitle>
                <CardDescription className="text-emerald-100">
                  NIS: {nis} {studentName && `| Nama: ${studentName}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 mt-4">
                <form onSubmit={handleFormSubmit} className="space-y-6 sm:space-y-8">
                  {/* Tanggal */}
                  <div className="space-y-3">
                    <Label htmlFor="tanggal" className="text-base font-semibold">Tanggal</Label>
                    <Input
                      id="tanggal"
                      type="date"
                      value={formData.tanggal}
                      onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                      required
                      className="min-h-[44px]"
                    />
                  </div>

                  {/* Puasa */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Status Puasa</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {['Penuh', 'Setengah Hari', 'Tidak'].map((status) => (
                        <label
                          key={status}
                          className={`flex items-center justify-center p-4 sm:p-3 border rounded-lg cursor-pointer transition-colors min-h-[44px] ${
                            formData.puasa === status
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500 ring-offset-1'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="puasa"
                            value={status}
                            checked={formData.puasa === status}
                            onChange={(e) => setFormData({...formData, puasa: e.target.value})}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Shalat Wajib */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Shalat Wajib</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {[
                        { id: 'shalat_subuh', label: 'Subuh', icon: Moon },
                        { id: 'shalat_dzuhur', label: 'Dzuhur', icon: Sun },
                        { id: 'shalat_ashar', label: 'Ashar', icon: Sun },
                        { id: 'shalat_maghrib', label: 'Maghrib', icon: Moon },
                        { id: 'shalat_isya', label: 'Isya', icon: Moon },
                      ].map((shalat) => (
                        <label
                          key={shalat.id}
                          className={`flex flex-col items-center justify-center p-4 sm:p-3 border rounded-lg cursor-pointer transition-colors min-h-[80px] ${
                            formData[shalat.id as keyof typeof formData]
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500 ring-offset-1'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData[shalat.id as keyof typeof formData] as boolean}
                            onChange={() => handleCheckboxChange(shalat.id)}
                            className="sr-only"
                          />
                          <shalat.icon className="w-6 h-6 mb-2 opacity-70" />
                          <span className="text-sm font-medium">{shalat.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Shalat Tarawih */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Shalat Tarawih</Label>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
                      <label className="flex items-center space-x-3 cursor-pointer p-2 sm:p-0 border rounded-lg sm:border-none">
                        <input
                          type="radio"
                          checked={formData.shalat_tarawih === true}
                          onChange={() => setFormData({...formData, shalat_tarawih: true})}
                          className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-base">Ya, saya melaksanakan</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer p-2 sm:p-0 border rounded-lg sm:border-none">
                        <input
                          type="radio"
                          checked={formData.shalat_tarawih === false}
                          onChange={() => setFormData({...formData, shalat_tarawih: false})}
                          className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-base">Tidak</span>
                      </label>
                    </div>
                  </div>

                  {/* Tadarus */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-600" />
                      Tadarus Al-Quran
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
                      <div className="space-y-2">
                        <Label htmlFor="surah" className="text-sm text-gray-700">Nama Surah</Label>
                        <Input
                          id="surah"
                          placeholder="Contoh: Al-Baqarah"
                          value={formData.tadarus_surah}
                          onChange={(e) => setFormData({...formData, tadarus_surah: e.target.value})}
                          className="min-h-[44px] bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ayat" className="text-sm text-gray-700">Ayat</Label>
                        <Input
                          id="ayat"
                          placeholder="Contoh: 1-10"
                          value={formData.tadarus_ayat}
                          onChange={(e) => setFormData({...formData, tadarus_ayat: e.target.value})}
                          className="min-h-[44px] bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Kebaikan */}
                  <div className="space-y-3">
                    <Label htmlFor="kebaikan" className="text-base font-semibold">Kebaikan Hari Ini</Label>
                    <textarea
                      id="kebaikan"
                      rows={4}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                      placeholder="Ceritakan kebaikan yang kamu lakukan hari ini..."
                      value={formData.kebaikan}
                      onChange={(e) => setFormData({...formData, kebaikan: e.target.value})}
                    />
                  </div>

                  <Button type="submit" className="w-full text-lg min-h-[56px] mt-8" disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan Jurnal'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
