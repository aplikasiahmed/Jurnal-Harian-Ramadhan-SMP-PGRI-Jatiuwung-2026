import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent } from '@/src/components/ui/card';
import { LogOut, Search, FileText, CheckCircle, XCircle } from 'lucide-react';

export default function TeacherDashboard() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchEntries();
  }, [dateFilter]);

  const checkUser = async () => {
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    }
  };

  const fetchEntries = async () => {
    setLoading(true);
    try {
      if (supabase) {
        let query = supabase
          .from('jurnal_ramadhan')
          .select('*, students(namalengkap, Kelas)')
          .order('created_at', { ascending: false });

        if (dateFilter) {
          query = query.eq('tanggal', dateFilter);
        }

        const { data, error } = await query;
        if (error) throw error;
        setEntries(data || []);
      } else {
        // Mock data
        setEntries([
          {
            id: 1,
            nis: '2023001',
            tanggal: new Date().toISOString().split('T')[0],
            puasa: 'Penuh',
            shalat_subuh: true,
            shalat_dzuhur: true,
            shalat_ashar: true,
            shalat_maghrib: true,
            shalat_isya: true,
            shalat_tarawih: true,
            tadarus_surah: 'Al-Baqarah',
            tadarus_ayat: '1-10',
            kebaikan: 'Membantu ibu memasak untuk berbuka',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            nis: '2023002',
            tanggal: new Date().toISOString().split('T')[0],
            puasa: 'Setengah Hari',
            shalat_subuh: true,
            shalat_dzuhur: true,
            shalat_ashar: false,
            shalat_maghrib: false,
            shalat_isya: false,
            shalat_tarawih: false,
            tadarus_surah: '',
            tadarus_ayat: '',
            kebaikan: 'Membersihkan kamar',
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    navigate('/login');
  };

  const filteredEntries = entries.filter(entry => 
    entry.nis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-emerald-700 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="https://wogprdohptvfnmdanutd.supabase.co/storage/v1/object/sign/GAMBAR/Logo%20PGRI.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNjJiN2ZiMi1kNjA5LTRmNjYtYTliOC1jMGMwYmM2ZjQ2YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHQU1CQVIvTG9nbyBQR1JJLnBuZyIsImlhdCI6MTc3MzE1NjUzNiwiZXhwIjoxODA0NjkyNTM2fQ.TthcwawgwLCFfoFGR08xAD_cYXtRmypgCoeosILn2G8" alt="Logo PGRI" className="w-8 h-8 sm:w-10 sm:h-10 object-contain bg-white rounded-full p-0.5" referrerPolicy="no-referrer" />
            <span className="font-bold text-base sm:text-lg">Dashboard Guru</span>
          </div>
          <Button variant="ghost" className="text-white hover:bg-emerald-600 hover:text-white min-h-[40px] px-2 sm:px-4" onClick={handleLogout}>
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Rekap Jurnal Ramadhan</h1>
            <p className="text-sm sm:text-base text-gray-600">SMP PGRI Jatiuwung Kota Tangerang</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari NIS..."
                className="pl-9 w-full min-h-[44px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Input
              type="date"
              className="w-full sm:w-auto min-h-[44px]"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table / Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-500 text-sm sm:text-base">Memuat data...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <Card className="text-center py-12 mx-auto max-w-lg">
            <CardContent className="pt-6">
              <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-base sm:text-lg">Belum ada data jurnal untuk tanggal ini.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-emerald-50 px-4 py-3 border-b flex justify-between items-start sm:items-center">
                  <div>
                    <span className="font-bold text-emerald-800 block sm:inline">
                      {entry.students?.namalengkap || `NIS: ${entry.nis}`}
                    </span>
                    {entry.students?.Kelas && (
                      <span className="text-xs text-emerald-600 sm:ml-2 block sm:inline mt-1 sm:mt-0">
                        Kelas: {entry.students.Kelas} | NIS: {entry.nis}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-2.5 py-1 rounded-full whitespace-nowrap ml-2">
                    {entry.puasa}
                  </span>
                </div>
                <CardContent className="p-4 space-y-5">
                  <div>
                    <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Shalat Wajib</h4>
                    <div className="flex justify-between sm:justify-start sm:space-x-3">
                      {['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'].map((waktu) => (
                        <div 
                          key={waktu}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                            entry[`shalat_${waktu}`] 
                              ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' 
                              : 'bg-gray-100 text-gray-400'
                          }`}
                          title={waktu.charAt(0).toUpperCase() + waktu.slice(1)}
                        >
                          {waktu.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border">
                    <div>
                      <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tarawih</h4>
                      <div className="flex items-center">
                        {entry.shalat_tarawih ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 mr-1.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 mr-1.5" />
                        )}
                        <span className="text-sm font-medium text-gray-700">{entry.shalat_tarawih ? 'Ya' : 'Tidak'}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tadarus</h4>
                      <p className="text-sm font-medium text-gray-700 truncate" title={`${entry.tadarus_surah} ${entry.tadarus_ayat}`}>
                        {entry.tadarus_surah ? `${entry.tadarus_surah} (${entry.tadarus_ayat})` : '-'}
                      </p>
                    </div>
                  </div>

                  {entry.kebaikan && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Kebaikan</h4>
                      <p className="text-sm text-gray-700 italic bg-emerald-50/50 p-3 rounded-md border border-emerald-100">"{entry.kebaikan}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
