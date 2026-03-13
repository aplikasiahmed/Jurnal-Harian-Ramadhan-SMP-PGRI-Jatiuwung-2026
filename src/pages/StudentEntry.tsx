import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { BookOpen, CheckCircle2, Moon, Sun, Lock, ArrowLeft, Video } from 'lucide-react';
import Swal from 'sweetalert2';
import TeacherLoginModal from '@/src/components/TeacherLoginModal';
import VideoModal from '@/src/components/VideoModal';

const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function StudentEntry() {
  const navigate = useNavigate();
  const [nis, setNis] = useState('');
  const [isNisSubmitted, setIsNisSubmitted] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [rawStudentName, setRawStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const videoTutorialUrl = "https://wogprdohptvfnmdanutd.supabase.co/storage/v1/object/sign/Video/video%20tutorial.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNjJiN2ZiMi1kNjA5LTRmNjYtYTliOC1jMGMwYmM2ZjQ2YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJWaWRlby92aWRlbyB0dXRvcmlhbC5tcDQiLCJpYXQiOjE3NzMyMzU3MDQsImV4cCI6MTgwNDc3MTcwNH0.NiBqmCRzT477q_l3J48kYILqVAs8SZ4DqEEiXFdoTjQ";

  useEffect(() => {
    const showHonestyPopup = () => {
      Swal.fire({
        title: 'Wajib Dibaca',
        icon: 'info',
        html: `
          <div class="text-center px-1">
            <p class="text-gray-700 leading-relaxed font-medium text-sm sm:text-base">
              isilah Jurnal Ramadhan ini dengan Penuh Tanggung Jawab dengan penuh kejujuran tanpa ada kebohongan. 
              Ingat !!! Allah Swt Maha Tahu Bagi Hambanya yang berbohong
            </p>
          </div>
        `,
        showConfirmButton: false,
        showCloseButton: true,
        customClass: {
          popup: 'rounded-[32px] border-0 shadow-2xl p-4 sm:p-6',
          title: 'text-emerald-800 font-bold text-xl sm:text-2xl mt-2',
          htmlContainer: 'mt-3 sm:mt-4',
          closeButton: 'swal2-close-red'
        }
      });
    };

    // Show on first load
    showHonestyPopup();

    // Show when switching back to this tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        showHonestyPopup();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    tanggal: getLocalDate(),
    puasa: 'BERPUASA',
    alasan_puasa: '',
    shalat_subuh: false,
    shalat_dzuhur: false,
    shalat_ashar: false,
    shalat_maghrib: false,
    shalat_isya: false,
    shalat_tarawih: false,
    shalat_sunnah: '',
    tadarus: false,
    tadarus_surah: '',
    tadarus_ayat: '',
    bukti_tarawih: '',
    bukti_tadarus: '',
    bersedekah: false,
    membantu_orang_tua: false,
    deskripsi_membantu_orang_tua: '',
    kebaikan: '',
  });

  const handleNisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'NIS Wajib Diisi!',
        text: 'Silakan masukkan NIS Anda terlebih dahulu.',
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
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('students')
          .select('namalengkap, Kelas')
          .eq('nis', nis)
          .single();
        
        if (data) {
          // Check if journal already submitted today
          const today = getLocalDate();
          const { data: existingEntry } = await supabase
            .from('jurnal_ramadhan')
            .select('id')
            .eq('nis', nis)
            .eq('tanggal', today)
            .maybeSingle();

          if (existingEntry) {
            Swal.fire({
              icon: 'warning',
              title: 'Sudah Mengisi Jurnal!',
              text: 'Anda sudah mengisi jurnal Ramadhan untuk hari ini. Jurnal hanya dapat diisi 1x sehari.',
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

          setStudentName(data.namalengkap);
          setRawStudentName(data.namalengkap);
          setStudentClass(data.Kelas);
          setIsNisSubmitted(true);
          
          const loginResult = await Swal.fire({
            title: 'Login Berhasil!',
            showCloseButton: true,
            html: `
              <div class="flex flex-col items-center">
                <div class="mb-4 relative">
                  <div class="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-sm">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
                <div class="text-center space-y-0">
                  <p class="text-emerald-800 font-bold text-lg tracking-tight uppercase leading-tight mb-1">${data.namalengkap}</p>
                  <div class="inline-block px-3 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[14px] font-bold leading-none">
                    Kelas: ${data.Kelas}
                  </div>
                  <p class="text-gray-500 font-medium text-xs mt-0.5">NIS: ${nis}</p>
                </div>
              </div>
            `,
            confirmButtonText: 'Mulai Isi Jurnal',
            confirmButtonColor: '#047857',
            customClass: {
              popup: 'swal2-mobile-optimized rounded-3xl shadow-2xl',
              title: 'swal2-title-optimized text-2xl mb-2',
              confirmButton: 'swal2-confirm-optimized w-full sm:w-auto py-3 px-8 text-lg',
              closeButton: 'swal2-close-red'
            }
          });

          if (loginResult.dismiss === Swal.DismissReason.close) {
            setIsNisSubmitted(false);
          }
        } else {
          Swal.fire({
            icon: 'error',
            title: 'NIS tidak ditemukan!',
            text: 'Silakan periksa kembali NIS Anda.',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            
            customClass: {
              popup: 'swal2-mobile-optimized',
              title: 'swal2-title-optimized',
              htmlContainer: 'swal2-content-optimized'
            }
          });
        }
      } else {
        setStudentName('Siswa (Mode Demo)');
        setRawStudentName('Siswa Demo');
        setStudentClass('Demo');
        setIsNisSubmitted(true);
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'NIS tidak ditemukan!',
        text: 'Silakan periksa kembali NIS Anda.',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        
        customClass: {
          popup: 'swal2-mobile-optimized',
          title: 'swal2-title-optimized',
          htmlContainer: 'swal2-content-optimized'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Wajib Diisi
    if (!formData.tanggal) {
      Swal.fire({
        icon: 'warning',
        title: 'Tanggal Wajib Diisi!',
        text: 'Silakan isi tanggal jurnal terlebih dahulu.',
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

    if (formData.puasa === 'TIDAK PUASA' && !formData.alasan_puasa.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Alasan Puasa Wajib Diisi!',
        text: 'Silakan isi alasan mengapa Anda tidak berpuasa.',
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

    if (formData.puasa === 'BERPUASA' || formData.puasa === 'TIDAK PUASA') {
      const allShalatWajib = formData.shalat_subuh && formData.shalat_dzuhur && formData.shalat_ashar && formData.shalat_maghrib && formData.shalat_isya;
      if (!allShalatWajib) {
        Swal.fire({
          icon: 'warning',
          title: 'Shalat Wajib Harus Penuh!',
          text: formData.puasa === 'BERPUASA' 
            ? 'Karena Anda berpuasa penuh, maka kelima Shalat Wajib harus dilaksanakan.'
            : 'Meskipun tidak berpuasa, Anda tetap wajib melaksanakan Shalat Wajib 5 waktu.',
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
    }

    const gdriveRegex = /^(https?:\/\/)?(drive|docs)\.google\.com\/.+/;

    if (formData.puasa !== 'SEDANG HAID' && formData.shalat_tarawih) {
      if (!formData.bukti_tarawih.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Bukti Tarawih Wajib Diisi!',
          text: 'Silakan masukkan link Google Drive bukti foto Shalat Tarawih.',
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
      
      if (!gdriveRegex.test(formData.bukti_tarawih.trim())) {
        Swal.fire({
          icon: 'error',
          title: 'Link Tidak Valid!',
          text: 'Format link Bukti Tarawih harus berupa link Google Drive yang valid.',
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
    }

    if (formData.puasa !== 'SEDANG HAID' && formData.tadarus) {
      if (!formData.tadarus_surah.trim() || !formData.tadarus_ayat.trim() || !formData.bukti_tadarus.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Tadarrus Al-Quran & Bukti Wajib Diisi!',
          text: 'Silakan isi nama Surah, Ayat yang dibaca, dan link Google Drive bukti foto.',
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

      if (!gdriveRegex.test(formData.bukti_tadarus.trim())) {
        Swal.fire({
          icon: 'error',
          title: 'Link Tidak Valid!',
          text: 'Format link Bukti Tadarrus harus berupa link Google Drive yang valid.',
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
    }

    if (!formData.membantu_orang_tua) {
      Swal.fire({
        icon: 'warning',
        title: 'Wajib Membantu Orang Tua!',
        text: 'Membantu orang tua adalah kewajiban. Silakan pilih IYA dan sebutkan apa yang Anda lakukan.',
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

    if (formData.membantu_orang_tua && !formData.deskripsi_membantu_orang_tua.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Deskripsi Wajib Diisi!',
        text: 'Silakan isi deskripsi kegiatan membantu orang tua yang Anda lakukan hari ini.',
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

    // Helper to format date to DD-MM-YYYY
    const formatDate = (dateString: string) => {
      const [year, month, day] = dateString.split('-');
      return `${day} ${month} ${year}`;
    };

    // Konfirmasi sebelum kirim
    const confirmResult = await Swal.fire({
      icon: 'question',
      title: 'Yakin ingin Kirim ?',
      html: `Saya mengirim jurnal harian atas nama <b class="text-emerald-900">${rawStudentName}</b>, Kelas <b class="text-emerald-900">${studentClass}</b>, pada tanggal <b class="text-emerald-900">${formatDate(formData.tanggal)}</b>.`,
      showCancelButton: true,
      confirmButtonText: 'Ya, Kirim',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#047857',
      cancelButtonColor: '#d33',
      
      customClass: {
          popup: 'swal2-mobile-optimized',
          title: 'swal2-title-optimized',
          htmlContainer: 'swal2-content-optimized',
          confirmButton: 'swal2-confirm-optimized',
          cancelButton: 'swal2-cancel-optimized'
        }
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    setLoading(true);
    
    try {
      if (supabase) {
        // Cek duplikasi pengisian per hari
        const { data: existingEntry } = await supabase
          .from('jurnal_ramadhan')
          .select('id')
          .eq('nis', nis)
          .eq('tanggal', formData.tanggal)
          .maybeSingle();

        if (existingEntry) {
          Swal.fire({
            icon: 'error',
            title: 'Sudah Mengisi!',
            text: `Anda sudah mengisi Jurnal Harian Ramadhan pada tanggal ${formatDate(formData.tanggal)}. Hanya diperbolehkan mengisi 1x dalam sehari.`,
            confirmButtonColor: '#047857',
            
            customClass: {
          popup: 'swal2-mobile-optimized',
          title: 'swal2-title-optimized',
          htmlContainer: 'swal2-content-optimized',
          confirmButton: 'swal2-confirm-optimized',
          cancelButton: 'swal2-cancel-optimized'
        }
          });
          setLoading(false);
          return;
        }

        const isHaid = formData.puasa === 'SEDANG HAID';

        const formatToggle = (val: boolean) => val ? 'IYA' : 'TIDAK';

        const payload = {
          nis,
          nama_siswa: rawStudentName,
          kelas: studentClass,
          tanggal: formData.tanggal,
          puasa: formData.puasa,
          alasan_puasa: isHaid ? null : formData.alasan_puasa,
          shalat_subuh: isHaid ? null : formatToggle(formData.shalat_subuh),
          shalat_dzuhur: isHaid ? null : formatToggle(formData.shalat_dzuhur),
          shalat_ashar: isHaid ? null : formatToggle(formData.shalat_ashar),
          shalat_maghrib: isHaid ? null : formatToggle(formData.shalat_maghrib),
          shalat_isya: isHaid ? null : formatToggle(formData.shalat_isya),
          shalat_tarawih: isHaid ? null : formatToggle(formData.shalat_tarawih),
          bukti_tarawih: (isHaid || !formData.shalat_tarawih) ? null : formData.bukti_tarawih,
          shalat_sunnah: isHaid ? null : formData.shalat_sunnah,
          tadarus: isHaid ? null : formatToggle(formData.tadarus),
          tadarus_surah: isHaid ? null : formData.tadarus_surah,
          tadarus_ayat: isHaid ? null : formData.tadarus_ayat,
          bukti_tadarus: (isHaid || !formData.tadarus) ? null : formData.bukti_tadarus,
          bersedekah: formatToggle(formData.bersedekah),
          membantu_orang_tua: formatToggle(formData.membantu_orang_tua),
          deskripsi_membantu_orang_tua: formData.membantu_orang_tua ? formData.deskripsi_membantu_orang_tua : null,
          kebaikan: formData.kebaikan,
        };

        const { error } = await supabase
          .from('jurnal_ramadhan')
          .insert([payload]);
          
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

  const formatIndoDate = (dateStr: string) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const [year, month, day] = dateStr.split('-');
    return `${day}-${months[parseInt(month) - 1]}-${year}`;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-emerald-50 flex flex-col">
        <header className="sticky top-0 z-10 bg-emerald-700 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="https://wogprdohptvfnmdanutd.supabase.co/storage/v1/object/sign/GAMBAR/Logo%20PGRI.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNjJiN2ZiMi1kNjA5LTRmNjYtYTliOC1jMGMwYmM2ZjQ2YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHQU1CQVIvTG9nbyBQR1JJLnBuZyIsImlhdCI6MTc3MzE1NjUzNiwiZXhwIjoxODA0NjkyNTM2fQ.TthcwawgwLCFfoFGR08xAD_cYXtRmypgCoeosILn2G8" alt="Logo PGRI" className="w-8 h-8 object-contain bg-white rounded-full p-0.5" referrerPolicy="no-referrer" />
              <span className="font-bold text-xs sm:text-sm truncate">Jurnal Ramadhan</span>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center py-8">
            <CardContent className="flex flex-col items-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              <CardTitle className="text-xl text-emerald-800">Alhamdulillah!</CardTitle>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Jurnal Ramadhan hari ini berhasil dikirim.</p>
                <p className="text-xs font-bold text-emerald-700">{formatIndoDate(formData.tanggal)}</p>
              </div>
              <Button onClick={() => window.location.reload()} className="mt-4 min-h-[44px] w-full sm:w-auto text uppercase text-sm">
                Tutup
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col font-sans relative overflow-hidden">
      {/* Islamic Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23047857' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

      {/* Header with Login Guru Button */}
      <header className="sticky top-0 z-10 bg-emerald-800 text-white shadow-lg border-b border-emerald-700/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-full shadow-sm">
              <img src="https://wogprdohptvfnmdanutd.supabase.co/storage/v1/object/sign/GAMBAR/Logo%20PGRI.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNjJiN2ZiMi1kNjA5LTRmNjYtYTliOC1jMGMwYmM2ZjQ2YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHQU1CQVIvTG9nbyBQR1JJLnBuZyIsImlhdCI6MTc3MzE1NjUzNiwiZXhwIjoxODA0NjkyNTM2fQ.TthcwawgwLCFfoFGR08xAD_cYXtRmypgCoeosILn2G8" alt="Logo PGRI" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className="font-bold text-sm sm:text-base tracking-wide">Jurnal Harian Ramadhan</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-emerald-700/50 border-emerald-500/50 text-white hover:bg-emerald-600 hover:text-white min-h-[38px] text-xs sm:text-sm shadow-sm backdrop-blur-sm transition-all"
            onClick={() => setIsLoginModalOpen(true)}
          >
            <Lock className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Login Guru</span>
            <span className="sm:hidden ml-1">Guru</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 relative z-0">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 relative">
            {isNisSubmitted && (
              <button 
                onClick={() => setIsNisSubmitted(false)} 
                className="absolute left-0 top-0 p-2 text-emerald-700 hover:bg-emerald-100 rounded-full transition-colors"
                title="Kembali"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <div className="inline-block bg-white p-3 rounded-2xl shadow-sm mb-5 border border-emerald-100">
              <img src="https://wogprdohptvfnmdanutd.supabase.co/storage/v1/object/sign/GAMBAR/Logo%20PGRI.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNjJiN2ZiMi1kNjA5LTRmNjYtYTliOC1jMGMwYmM2ZjQ2YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHQU1CQVIvTG9nbyBQR1JJLnBuZyIsImlhdCI6MTc3MzE1NjUzNiwiZXhwIjoxODA0NjkyNTM2fQ.TthcwawgwLCFfoFGR08xAD_cYXtRmypgCoeosILn2G8" alt="Logo PGRI" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" referrerPolicy="no-referrer" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-2 tracking-tight">Jurnal Harian Ramadhan</h1>
            <p className="text-1xl sm:text-base text-emerald-900 mb-2 font-medium">1447 H / 2026 M</p>
            <p className="text-sm sm:text-base text-emerald-700/80 font-medium">SMP PGRI Jatiuwung Kota Tangerang</p>
          </div>

          {!isNisSubmitted ? (
            <div className="space-y-6">
              <Card className="max-w-md mx-auto border-emerald-100 shadow-xl shadow-emerald-900/5 rounded-2xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                <CardHeader className="p-6 sm:p-8 text-center bg-white">
                <CardDescription className="text-sm mt-2">Masukkan Nomor Induk Siswa (NIS) untuk Mengisi Jurnal Harian Ramadhan</CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 pt-0 text-center bg-white">
                <form onSubmit={handleNisSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Input
                      id="nis"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Nomor Induk Siswa (NIS)"
                      value={nis}
                      onChange={(e) => setNis(e.target.value.replace(/[^0-9]/g, ''))}
                      className="min-h-[42px] text-base text-center text-bold rounded-xl border-emerald-200 focus-visible:ring-emerald-500 bg-emerald-50/50"
                    />
                  </div>
                  <Button type="submit" className="w-full min-h-[52px] text-base font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all" disabled={loading}>
                    {loading ? 'Memeriksa NIS...' : 'MASUK'}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <p className="text-center text-xs sm:text-sm text-gray-500">
              <a 
                href="https://wa.me/6282175787863?text=Assalamu'alaikum%20Wr%20Wb.%20Mohon%20Maaf%20Pak%20Ahmed%2C%20Saya%20Nama%20........%20Kelas%20.....%20Ingin%20mengetahui%20Nomor%20NIS%20saya%20untuk%20pengisian%20Jurnal%20Harian%20Ramadhan" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                Hubungi
              </a>{' '}
              Pak Ahmed Jika tidak mengetahui nomor NIS Siswa
            </p>
            <div className="mt-6 p-4 bg-emerald-50/80 rounded-xl border border-emerald-100 text-center shadow-sm">
              <p className="text-[10px] sm:text-xs font-bold text-emerald-700/80 uppercase tracking-wider">
                "Rasulallah SAW Bersabda"
              </p>
              <p className="text-xs sm:text-sm italic text-emerald-800 mb-1 leading-relaxed">
                "Hendaklah kalian senantiasa berlaku jujur, karena sesungguhnya kejujuran akan mengantarkan pada kebaikan dan sesungguhnya kebaikan akan mengantarkan pada surga."
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-emerald-700/80 uppercase tracking-wider">
                (HR. Bukhari dan Muslim)
              </p>
            </div>
            </div>
          ) : (
            <Card className="border-emerald-100 shadow-xl shadow-emerald-900/5 rounded-2xl overflow-hidden">
              <CardHeader className="p-5 sm:p-8 bg-gradient-to-br from-emerald-700 to-emerald-800 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                  <Moon className="w-32 h-32" />
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold relative z-10 uppercase leading-tight">{studentName}</CardTitle>
                <div className="text-emerald-50 text-sm sm:text-base mt-0 relative z-10 font-bold opacity-95 leading-tight">
                  (Kelas {studentClass})
                </div>
                <CardDescription className="text-emerald-50 text-xs sm:text-sm mt-0.5 relative z-10 font-medium opacity-80 leading-tight">
                  NIS: {nis}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-8 mt-2 bg-white">
                <form onSubmit={handleFormSubmit} className="space-y-8 sm:space-y-10">
                  {/* Tanggal */}
                  <div className="space-y-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                    <Label htmlFor="tanggal" className="text-base font-semibold text-emerald-900">Tanggal Pengisian</Label>
                    <Input
                      id="tanggal"
                      type="date"
                      value={formData.tanggal}
                      readOnly
                      className="min-h-[48px] text-base rounded-lg border-emerald-200 bg-gray-100/50 text-gray-500 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-emerald-200 hover:border-emerald-200 select-none pointer-events-none"
                    />
                  </div>

                  {/* Puasa */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold text-emerald-900 border-b border-emerald-100 pb-2 block">Status Puasa Hari Ini</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {['BERPUASA', 'TIDAK PUASA', 'SEDANG HAID'].map((status) => (
                        <label
                          key={status}
                          className={`flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all duration-200 min-h-[52px] ${
                            formData.puasa === status
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500 shadow-sm'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-emerald-200'
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
                          <span className="text-sm sm:text-base font-semibold">{status}</span>
                        </label>
                      ))}
                    </div>
                    {formData.puasa === 'TIDAK PUASA' && (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                        <textarea
                          rows={3}
                          className="flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-transparent transition-all"
                          placeholder="Tuliskan alasan mengapa tidak berpuasa..."
                          value={formData.alasan_puasa}
                          onChange={(e) => setFormData({...formData, alasan_puasa: e.target.value})}
                        />
                      </div>
                    )}
                  </div>

                  {formData.puasa !== 'SEDANG HAID' && (
                    <>
                      {/* Shalat Wajib */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold text-emerald-900 border-b border-emerald-100 pb-2 block">Shalat Wajib 5 Waktu</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { id: 'shalat_subuh', label: 'Subuh', icon: Moon },
                        { id: 'shalat_dzuhur', label: 'Dzuhur', icon: Sun },
                        { id: 'shalat_ashar', label: 'Ashar', icon: Sun },
                        { id: 'shalat_maghrib', label: 'Maghrib', icon: Moon },
                        { id: 'shalat_isya', label: 'Isya', icon: Moon },
                      ].map((shalat) => (
                        <div key={shalat.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="bg-emerald-50 p-2 rounded-lg">
                              <shalat.icon className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{shalat.label}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData[shalat.id as keyof typeof formData] as boolean}
                              onChange={() => handleCheckboxChange(shalat.id)}
                              className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            <span className={`ml-3 text-xs font-bold w-12 ${formData[shalat.id as keyof typeof formData] ? 'text-emerald-700' : 'text-gray-400'}`}>
                              {formData[shalat.id as keyof typeof formData] ? 'IYA' : 'TIDAK'}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shalat Tarawih */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold text-emerald-900 border-b border-emerald-100 pb-2 block">Shalat Tarawih</Label>
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 p-2 rounded-lg">
                          <Moon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Tarawih</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.shalat_tarawih}
                          onChange={() => handleCheckboxChange('shalat_tarawih')}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        <span className={`ml-3 text-xs font-bold w-12 ${formData.shalat_tarawih ? 'text-emerald-700' : 'text-gray-400'}`}>
                          {formData.shalat_tarawih ? 'IYA' : 'TIDAK'}
                        </span>
                      </label>
                    </div>
                    {formData.shalat_tarawih && (
                      <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                        <Label htmlFor="bukti_tarawih" className="text-sm font-semibold text-emerald-900 mb-2 block">Link Google Drive Bukti Tarawih <span className="text-red-500">*</span></Label>
                        <p className="text-xs text-emerald-700/80 mb-3">Mohon upload foto bukti tarawih ke Google Drive dan paste linknya di sini. foto harus berada di masjid atau mushollah ketika sebelum atau sesudah tarawih, foto wajib terlihat wajah</p>
                        <Input
                          id="bukti_tarawih"
                          placeholder="https://drive.google.com/..."
                          value={formData.bukti_tarawih}
                          onChange={(e) => setFormData({...formData, bukti_tarawih: e.target.value})}
                          className="min-h-[48px] text-sm rounded-lg border-emerald-200 focus-visible:ring-emerald-500 bg-white"
                        />
                        <a 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); setIsVideoModalOpen(true); }}
                          className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 italic hover:underline"
                        >
                          <Video className="w-3 h-3" />
                          Klik tutorial cara upload fotonya
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Shalat Sunnah */}
                  <div className="space-y-4">
                    <Label htmlFor="shalat_sunnah" className="text-base font-semibold text-emerald-900 border-b border-emerald-100 pb-2 block">Shalat Sunnah (Opsional)</Label>
                    <p className="text-sm text-gray-500 -mt-2 mb-3">Sebutkan sholat sunnah yang dilakukan (contoh: Tahajjud, Dhuha, Rawatib, dll)</p>
                    <Input
                      id="shalat_sunnah"
                      placeholder="Ketik sholat sunnah di sini..."
                      value={formData.shalat_sunnah}
                      onChange={(e) => setFormData({...formData, shalat_sunnah: e.target.value})}
                      className="min-h-[48px] text-sm rounded-lg border-gray-200 focus-visible:ring-emerald-500"
                    />
                  </div>
                    </>
                  )}

                  {/* Bersedekah Harian */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold text-emerald-900 border-b border-emerald-100 pb-2 block">Amalan Sedekah</Label>
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 p-2 rounded-lg">
                          <span className="text-emerald-600 font-bold text-lg leading-none">Rp</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Bersedekah Hari Ini</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.bersedekah}
                          onChange={() => handleCheckboxChange('bersedekah')}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        <span className={`ml-3 text-xs font-bold w-12 ${formData.bersedekah ? 'text-emerald-700' : 'text-gray-400'}`}>
                          {formData.bersedekah ? 'IYA' : 'TIDAK'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Membantu Orang Tua */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold text-emerald-900 border-b border-emerald-100 pb-2 block">Membantu Orang Tua</Label>
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 p-2 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Membantu Orang Tua Hari Ini</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.membantu_orang_tua}
                          onChange={() => handleCheckboxChange('membantu_orang_tua')}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        <span className={`ml-3 text-xs font-bold w-12 ${formData.membantu_orang_tua ? 'text-emerald-700' : 'text-gray-400'}`}>
                          {formData.membantu_orang_tua ? 'IYA' : 'TIDAK'}
                        </span>
                      </label>
                    </div>
                    {formData.membantu_orang_tua && (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                        <textarea
                          rows={6}
                          className="flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-transparent transition-all"
                          placeholder="Ceritakan bagaimana kamu membantu orang tua hari ini..."
                          value={formData.deskripsi_membantu_orang_tua}
                          onChange={(e) => setFormData({...formData, deskripsi_membantu_orang_tua: e.target.value})}
                        />
                      </div>
                    )}
                  </div>

                  {formData.puasa !== 'SEDANG HAID' && (
                    <>
                  {/* Tadarus */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold text-emerald-900 border-b border-emerald-100 pb-2 block">Tadarus Al-Quran</Label>
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 p-2 rounded-lg">
                          <BookOpen className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Membaca Al-Quran</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.tadarus}
                          onChange={() => handleCheckboxChange('tadarus')}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        <span className={`ml-3 text-xs font-bold w-12 ${formData.tadarus ? 'text-emerald-700' : 'text-gray-400'}`}>
                          {formData.tadarus ? 'IYA' : 'TIDAK'}
                        </span>
                      </label>
                    </div>

                    {formData.tadarus && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 mt-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                          <Label htmlFor="surah" className="text-sm font-semibold text-emerald-800">Nama Surah</Label>
                          <Input
                            id="surah"
                            placeholder="Contoh: Al-Baqarah"
                            value={formData.tadarus_surah}
                            onChange={(e) => setFormData({...formData, tadarus_surah: e.target.value})}
                            className="min-h-[48px] bg-white text-sm border-emerald-200 focus-visible:ring-emerald-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ayat" className="text-sm font-semibold text-emerald-800">Ayat</Label>
                          <Input
                            id="ayat"
                            placeholder="Contoh: 1-10"
                            value={formData.tadarus_ayat}
                            onChange={(e) => setFormData({...formData, tadarus_ayat: e.target.value})}
                            className="min-h-[48px] bg-white text-sm border-emerald-200 focus-visible:ring-emerald-500"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label htmlFor="bukti_tadarus" className="text-sm font-semibold text-emerald-800">Link Google Drive Bukti Tadarus <span className="text-red-500">*</span></Label>
                          <p className="text-xs text-emerald-700/80 mb-3">Mohon upload foto bukti tadarus ke Google Drive dan paste linknya di sini. foto asli saat mengaji bukan foto orang lain. foto wajib terlihat wajah.</p>
                          <Input
                            id="bukti_tadarus"
                            placeholder="https://drive.google.com/..."
                            value={formData.bukti_tadarus}
                            onChange={(e) => setFormData({...formData, bukti_tadarus: e.target.value})}
                            className="min-h-[48px] bg-white text-sm border-emerald-200 focus-visible:ring-emerald-500"
                          />
                          <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); setIsVideoModalOpen(true); }}
                            className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 italic hover:underline"
                          >
                            <Video className="w-3 h-3" />
                            Klik tutorial cara upload fotonya
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                    </>
                  )}

                  {/* Kebaikan */}
                  <div className="space-y-4">
                    <Label htmlFor="kebaikan" className="text-base font-semibold text-emerald-900 border-b border-emerald-100 pb-2 block">Kebaikan Hari Ini (Opsional)</Label>
                    <textarea
                      id="kebaikan"
                      rows={6}
                      className="flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-transparent transition-all"
                      placeholder="Ceritakan kebaikan yang kamu lakukan hari ini..."
                      value={formData.kebaikan}
                      onChange={(e) => setFormData({...formData, kebaikan: e.target.value})}
                    />
                  </div>

                  <Button type="submit" className="w-full text-lg font-bold min-h-[60px] mt-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition-all" disabled={loading}>
                    {loading ? 'Memproses...' : 'Kirim Jurnal Sekarang'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <TeacherLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} videoUrl={videoTutorialUrl} />
    </div>
  );
}
