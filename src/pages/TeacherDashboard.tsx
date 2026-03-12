import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent } from '@/src/components/ui/card';
import { Search, FileText, CheckCircle, XCircle, Download, FileSpreadsheet, Heart, BookOpen, HandHeart, Star, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function TeacherDashboard() {
  const [entries, setEntries] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [classFilter, setClassFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'cek_laporan' | 'download_data'>('cek_laporan');
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [dateFilter]);

  const checkUser = async () => {
    if (supabase) {
      const isTeacherLoggedIn = localStorage.getItem('teacher_logged_in') === 'true';
      if (!isTeacherLoggedIn) {
        navigate('/');
      }
    }
  };

  const fetchStudents = async () => {
    if (supabase) {
      const { data, error } = await supabase.from('students').select('*');
      if (data) {
        setAllStudents(data);
        const uniqueClasses = [...new Set(data.map(s => s.Kelas))].filter(Boolean).sort() as string[];
        setClasses(uniqueClasses);
      }
    }
  };

  const fetchEntries = async () => {
    setLoading(true);
    try {
      if (supabase) {
        let query = supabase
          .from('jurnal_ramadhan')
          .select('*')
          .order('created_at', { ascending: false });

        if (dateFilter) {
          query = query.eq('tanggal', dateFilter);
        }

        const { data, error } = await query;
        if (error) throw error;
        setEntries(data || []);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Yakin ingin keluar?',
      text: "Anda akan keluar dari Dashboard Guru.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#047857',
      cancelButtonColor: '#d33',
      confirmButtonText: 'KELUAR',
      cancelButtonText: 'TIDAK',
      customClass: {
        popup: 'rounded-2xl',
        title: 'text-lg sm:text-xl font-bold',
        confirmButton: 'rounded-xl px-6',
        cancelButton: 'rounded-xl px-6'
      }
    });

    if (result.isConfirmed) {
      if (supabase) {
        localStorage.removeItem('teacher_logged_in');
        localStorage.removeItem('teacher_email');
      }
      navigate('/');
    }
  };

  const handleDeleteEntry = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Hapus Jurnal?',
      text: `Apakah Anda yakin ingin menghapus jurnal milik ${name}? Tindakan ini tidak dapat dibatalkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Tidak',
      customClass: {
        popup: 'rounded-2xl',
        title: 'text-lg sm:text-xl font-bold',
        confirmButton: 'rounded-xl px-6',
        cancelButton: 'rounded-xl px-6'
      }
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Menghapus...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        customClass: {
          popup: 'rounded-2xl'
        }
      });

      try {
        if (supabase) {
          const { error } = await supabase
            .from('jurnal_ramadhan')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          Swal.fire({
            icon: 'success',
            title: 'Berhasil Dihapus',
            text: `Jurnal milik ${name} telah dihapus dari database.`,
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'rounded-2xl'
            }
          });
          
          fetchEntries();
        }
      } catch (error) {
        console.error('Error deleting entry:', error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus',
          text: 'Terjadi kesalahan saat menghapus data.',
          customClass: {
            popup: 'rounded-2xl'
          }
        });
      }
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchSearch = 
      entry.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.nama_siswa && entry.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.kelas && entry.kelas.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchClass = classFilter ? entry.kelas === classFilter : true;
    
    return matchSearch && matchClass;
  });

  const generateReportData = () => {
    const filteredStudents = classFilter 
      ? allStudents.filter(s => s.Kelas === classFilter)
      : allStudents;

    filteredStudents.sort((a, b) => {
      if (a.Kelas === b.Kelas) {
        return (a.namalengkap || '').localeCompare(b.namalengkap || '');
      }
      return (a.Kelas || '').localeCompare(b.Kelas || '');
    });

    return filteredStudents.map((student, index) => {
      const entry = entries.find(e => e.nis === student.nis);
      
      let mengisiIya = '';
      let mengisiTidak = 'V';
      let nilai = 'D';

      if (entry) {
        mengisiIya = 'V';
        mengisiTidak = '';
        
        if (entry.puasa === 'SEDANG HAID') {
          nilai = 'C';
        } else {
          const items = [
            entry.shalat_subuh,
            entry.shalat_dzuhur,
            entry.shalat_ashar,
            entry.shalat_maghrib,
            entry.shalat_isya,
            entry.shalat_tarawih,
            entry.tadarus
          ];
          
          const iyaCount = items.filter(item => item === 'IYA' || item === true).length;
          
          if (iyaCount === 7) nilai = 'A';
          else if (iyaCount >= 4) nilai = 'B';
          else if (iyaCount > 0) nilai = 'C';
          else nilai = 'D';
        }
      }

      return {
        no: index + 1,
        nis: student.nis,
        nama: student.namalengkap,
        kelas: student.Kelas,
        mengisiIya,
        mengisiTidak,
        nilai
      };
    });
  };

  const downloadExcel = () => {
    const allData = generateReportData();
    
    const [year, month, day] = dateFilter.split('-');
    const formattedDate = `${day}/${month}/${year.slice(-2)}`;
    
    const wb = XLSX.utils.book_new();

    const classesToPrint = classFilter 
      ? [classFilter] 
      : Array.from(new Set(allData.map(d => d.kelas))).filter(Boolean).sort();

    if (classesToPrint.length === 0) {
      classesToPrint.push('Semua Kelas');
    }

    classesToPrint.forEach(currentClass => {
      const classData = classFilter ? allData : allData.filter(d => d.kelas === currentClass);
      const displayData = classFilter ? classData : classData.map((d, idx) => ({ ...d, no: idx + 1 }));

      const ws = XLSX.utils.aoa_to_sheet([
        ['LAPORAN HASIL JURNAL HARIAN'],
        ['RAMADHAN 1447 H / 2026 M'],
        ['SMP PGRI JATIUWUNG - KOTA TANGERANG'],
        [`Tanggal: ${formattedDate}`],
        currentClass !== 'Semua Kelas' ? [`Kelas: ${currentClass}`] : [],
        [],
        ['NO', 'NIS', 'NAMA', 'KELAS', 'MENGISI JURNAL', '', 'NILAI'],
        ['', '', '', '', 'IYA', 'TIDAK', '']
      ]);

      const startRow = currentClass !== 'Semua Kelas' ? 6 : 5;

      ws['!merges'] = [
        { s: { r: startRow, c: 0 }, e: { r: startRow + 1, c: 0 } },
        { s: { r: startRow, c: 1 }, e: { r: startRow + 1, c: 1 } },
        { s: { r: startRow, c: 2 }, e: { r: startRow + 1, c: 2 } },
        { s: { r: startRow, c: 3 }, e: { r: startRow + 1, c: 3 } },
        { s: { r: startRow, c: 4 }, e: { r: startRow, c: 5 } },
        { s: { r: startRow, c: 6 }, e: { r: startRow + 1, c: 6 } },
      ];

      const rowData = displayData.map(row => [
        row.no,
        row.nis,
        row.nama,
        row.kelas,
        row.mengisiIya || '-',
        row.mengisiTidak || '-',
        row.nilai
      ]);

      XLSX.utils.sheet_add_aoa(ws, rowData, { origin: `A${startRow + 3}` });

      let sheetName = currentClass.replace(/[\\/?*\[\]]/g, '').substring(0, 31);
      if (!sheetName || sheetName === 'Semua Kelas') sheetName = 'Laporan';
      
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, `Laporan_Jurnal_${dateFilter}${classFilter ? `_${classFilter}` : ''}.xlsx`);
  };

  const downloadPDF = async () => {
    const doc = new jsPDF();
    const allData = generateReportData();
    const pageWidth = doc.internal.pageSize.width;

    const [year, month, day] = dateFilter.split('-');
    const formattedDate = `${day}/${month}/${year.slice(-2)}`;

    // Fetch logo
    const logoUrl = "https://wogprdohptvfnmdanutd.supabase.co/storage/v1/object/sign/GAMBAR/Logo%20PGRI.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNjJiN2ZiMi1kNjA5LTRmNjYtYTliOC1jMGMwYmM2ZjQ2YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHQU1CQVIvTG9nbyBQR1JJLnBuZyIsImlhdCI6MTc3MzE1NjUzNiwiZXhwIjoxODA0NjkyNTM2fQ.TthcwawgwLCFfoFGR08xAD_cYXtRmypgCoeosILn2G8";
    let logoBase64 = '';
    try {
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Failed to load logo", e);
    }

    const classesToPrint = classFilter 
      ? [classFilter] 
      : Array.from(new Set(allData.map(d => d.kelas))).filter(Boolean).sort();

    if (classesToPrint.length === 0) {
      classesToPrint.push('Semua Kelas');
    }

    for (let i = 0; i < classesToPrint.length; i++) {
      const currentClass = classesToPrint[i];
      const classData = classFilter ? allData : allData.filter(d => d.kelas === currentClass);
      const displayData = classFilter ? classData : classData.map((d, idx) => ({ ...d, no: idx + 1 }));

      if (i > 0) {
        doc.addPage();
      }

      const startPageForClass = (doc as any).internal.getNumberOfPages();
      let finalY = 0;

      autoTable(doc, {
        startY: 49,
        margin: { top: 49, bottom: 30 },
        head: [
          [
            { content: 'NO', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
            { content: 'NIS', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
            { content: 'NAMA', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
            { content: 'MENGISI JURNAL', colSpan: 2, styles: { halign: 'center' } },
            { content: 'NILAI', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
          ],
          [
            { content: 'IYA', styles: { halign: 'center' } },
            { content: 'TIDAK', styles: { halign: 'center' } }
          ]
        ],
        body: displayData.map(row => [
          row.no,
          row.nis,
          row.nama,
          row.mengisiIya || '-',
          row.mengisiTidak || '-',
          row.nilai
        ]),
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1 },
        headStyles: { fillColor: [4, 120, 87], textColor: 255 },
        columnStyles: {
          0: { halign: 'center' },
          1: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center' },
        },
        didParseCell: (data) => {
          if (data.section === 'body') {
            const nilai = data.row.raw[5];
            if (nilai === 'D') {
              data.cell.styles.textColor = [220, 38, 38]; // Red color
            }
          }
        },
        didDrawPage: (data) => {
          // Header
          if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', 14, 10, 24, 24);
          }
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          doc.text('LAPORAN HASIL JURNAL HARIAN', pageWidth / 2, 16, { align: 'center' });
          doc.setFontSize(12);
          doc.text('RAMADHAN 1447 H / 2026 M', pageWidth / 2, 23, { align: 'center' });
          doc.text('SMP PGRI JATIUWUNG - KOTA TANGERANG', pageWidth / 2, 30, { align: 'center' });
          
          doc.setFontSize(10);
          doc.text(`Tanggal: ${formattedDate}`, pageWidth / 2, 37, { align: 'center' });
          if (currentClass !== 'Semua Kelas') {
            doc.text(`Kelas: ${currentClass}`, pageWidth / 2, 44, { align: 'center' });
          }

          // Footer
          const kelasText = currentClass !== 'Semua Kelas' ? `Kelas: ${currentClass}` : 'Semua Kelas';
          const currentPage = (doc as any).internal.getNumberOfPages() - startPageForClass + 1;
          
          doc.setFontSize(8);
          doc.text(
            `Dicetak pada: ${new Date().toLocaleString('id-ID')} | ${kelasText} | Halaman ${currentPage}`,
            pageWidth / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          );
        }
      });

      finalY = (doc as any).lastAutoTable.finalY || 40;
      
      // Check if there is enough space for the legend, otherwise add a new page
      if (finalY + 35 > doc.internal.pageSize.height - 20) {
        doc.addPage();
        finalY = 20;
        
        // Draw header and footer for the new page
        if (logoBase64) {
          doc.addImage(logoBase64, 'PNG', 14, 10, 24, 24);
        }
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('LAPORAN HASIL JURNAL HARIAN', pageWidth / 2, 16, { align: 'center' });
        doc.setFontSize(12);
        doc.text('RAMADHAN 1447 H / 2026 M', pageWidth / 2, 23, { align: 'center' });
        doc.text('SMP PGRI JATIUWUNG - KOTA TANGERANG', pageWidth / 2, 30, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Tanggal: ${formattedDate}`, pageWidth / 2, 37, { align: 'center' });
        if (currentClass !== 'Semua Kelas') {
          doc.text(`Kelas: ${currentClass}`, pageWidth / 2, 44, { align: 'center' });
        }
        
        const kelasText = currentClass !== 'Semua Kelas' ? `Kelas: ${currentClass}` : 'Semua Kelas';
        const currentPage = (doc as any).internal.getNumberOfPages() - startPageForClass + 1;
        doc.setFontSize(8);
        doc.text(
          `Dicetak pada: ${new Date().toLocaleString('id-ID')} | ${kelasText} | Halaman ${currentPage}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
        
        finalY = 55;
      }

      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text('Keterangan Nilai:', 14, finalY + 8);
      doc.text('A : Sangat Baik (Mengisi Semua)', 14, finalY + 13);
      doc.text('B : Baik (Hanya Mengisi setengah)', 14, finalY + 18);
      doc.text('C : Cukup (Hanya Mengisi Sebagian atau siswa Perempuan Berhalangan (Haid))', 14, finalY + 23);
      doc.text('D : Kurang (Tidak Mengisi sama Sekali atau Siswa Non Muslim)', 14, finalY + 28);
    }

    doc.save(`Laporan_Jurnal_${dateFilter}${classFilter ? `_${classFilter}` : ''}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-10 bg-emerald-700 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="https://wogprdohptvfnmdanutd.supabase.co/storage/v1/object/sign/GAMBAR/Logo%20PGRI.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNjJiN2ZiMi1kNjA5LTRmNjYtYTliOC1jMGMwYmM2ZjQ2YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHQU1CQVIvTG9nbyBQR1JJLnBuZyIsImlhdCI6MTc3MzE1NjUzNiwiZXhwIjoxODA0NjkyNTM2fQ.TthcwawgwLCFfoFGR08xAD_cYXtRmypgCoeosILn2G8" alt="Logo PGRI" className="w-8 h-8 sm:w-10 sm:h-10 object-contain bg-white rounded-full p-0.5" referrerPolicy="no-referrer" />
            <span className="font-bold text-sm sm:text-base">Dashboard Guru</span>
          </div>
          <Button variant="ghost" className="text-white hover:bg-emerald-600 hover:text-white min-h-[40px] px-4" onClick={handleLogout}>
            <span className="text-sm font-medium">Keluar</span>
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card 
            className={`cursor-pointer transition-all ${activeTab === 'cek_laporan' ? 'ring-2 ring-emerald-600 shadow-md' : 'hover:shadow-md opacity-80'}`}
            onClick={() => setActiveTab('cek_laporan')}
          >
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-emerald-100 p-3 rounded-full">
                <FileText className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Cek Laporan</h3>
                <p className="text-sm text-gray-500">Lihat hasil siswa yang menginput jurnal harian</p>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all ${activeTab === 'download_data' ? 'ring-2 ring-emerald-600 shadow-md' : 'hover:shadow-md opacity-80'}`}
            onClick={() => setActiveTab('download_data')}
          >
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Download className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Download Data</h3>
                <p className="text-sm text-gray-500">Unduh laporan dalam format Excel & PDF</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {activeTab === 'cek_laporan' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 bg-white p-4 rounded-xl shadow-sm border">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Daftar Jurnal Masuk</h2>
                <p className="text-xs sm:text-sm text-gray-600">Filter data berdasarkan tanggal dan kelas</p>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Cari NIS, Nama..."
                    className="pl-9 w-full min-h-[40px] text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="w-full sm:w-32 min-h-[40px] text-sm rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                >
                  <option value="">Semua Kelas</option>
                  {classes.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Input
                  type="date"
                  className="w-full sm:w-auto min-h-[40px] text-sm"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-4 text-gray-500 text-xs sm:text-sm">Memuat data...</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <Card className="text-center py-12 mx-auto max-w-lg">
                <CardContent className="pt-6">
                  <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm sm:text-base">Belum ada data jurnal yang sesuai kriteria.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredEntries.map((entry) => (
                  <Card key={entry.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-emerald-50 px-4 py-3 border-b flex justify-between items-start sm:items-center">
                      <div>
                        <span className="font-bold text-emerald-800 block sm:inline text-sm">
                          {entry.nama_siswa || `NIS: ${entry.nis}`}
                        </span>
                        {entry.kelas && (
                          <span className="text-[10px] sm:text-xs text-emerald-600 sm:ml-2 block sm:inline mt-1 sm:mt-0">
                            Kelas: {entry.kelas} | NIS: {entry.nis} | {new Date(entry.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDeleteEntry(entry.id, entry.nama_siswa || entry.nis)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Jurnal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] sm:text-xs text-emerald-700 font-semibold bg-emerald-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                          {entry.puasa}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-4">
                      {/* Shalat Wajib */}
                      <div>
                        <h4 className="text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Shalat Wajib</h4>
                        <div className="flex justify-between sm:justify-start sm:space-x-3">
                          {['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'].map((waktu) => (
                            <div 
                              key={waktu}
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                                entry[`shalat_${waktu}`] === 'IYA' || entry[`shalat_${waktu}`] === true
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

                      {/* Grid untuk Tarawih & Bersedekah */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-2.5 rounded-lg border flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[11px] sm:text-xs font-semibold text-gray-600">Tarawih</span>
                            {entry.bukti_tarawih && (
                              <a 
                                href={entry.bukti_tarawih} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-600 hover:underline font-bold mt-0.5"
                              >
                                [ LIHAT FOTO ]
                              </a>
                            )}
                          </div>
                          {entry.shalat_tarawih === 'IYA' || entry.shalat_tarawih === true ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <div className="bg-gray-50 p-2.5 rounded-lg border flex items-center justify-between">
                          <span className="text-[11px] sm:text-xs font-semibold text-gray-600">Bersedekah</span>
                          {entry.bersedekah === 'IYA' || entry.bersedekah === true ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </div>

                      {/* Shalat Sunnah & Tadarus */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                          <h4 className="text-[10px] sm:text-[11px] font-semibold text-emerald-800 uppercase tracking-wider mb-1 flex items-center"><Star className="w-3 h-3 mr-1" /> Shalat Sunnah</h4>
                          <p className="text-xs sm:text-sm font-medium text-emerald-900 truncate" title={entry.shalat_sunnah || '-'}>
                            {entry.shalat_sunnah || '-'}
                          </p>
                        </div>
                        <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-[10px] sm:text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center"><BookOpen className="w-3 h-3 mr-1" /> Tadarus</h4>
                            {entry.bukti_tadarus && (
                              <a 
                                href={entry.bukti_tadarus} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-600 hover:underline font-bold"
                              >
                                [ LIHAT FOTO ]
                              </a>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-emerald-900 truncate" title={`${entry.tadarus_surah} ${entry.tadarus_ayat}`}>
                            {entry.tadarus_surah ? `${entry.tadarus_surah} (${entry.tadarus_ayat})` : '-'}
                          </p>
                        </div>
                      </div>

                      {/* Membantu Orang Tua */}
                      <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-[10px] sm:text-[11px] font-semibold text-blue-800 uppercase tracking-wider flex items-center"><HandHeart className="w-3 h-3 mr-1" /> Membantu Orang Tua</h4>
                          {entry.membantu_orang_tua === 'IYA' || entry.membantu_orang_tua === true ? (
                            <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                          )}
                        </div>
                        {entry.deskripsi_membantu_orang_tua && (
                          <p className="text-xs sm:text-sm text-blue-900 italic line-clamp-2" title={entry.deskripsi_membantu_orang_tua}>
                            "{entry.deskripsi_membantu_orang_tua}"
                          </p>
                        )}
                      </div>

                      {/* Kebaikan Hari Ini */}
                      {entry.kebaikan && (
                        <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                          <h4 className="text-[10px] sm:text-[11px] font-semibold text-amber-800 uppercase tracking-wider mb-1.5 flex items-center"><Heart className="w-3 h-3 mr-1" /> Kebaikan Hari Ini</h4>
                          <p className="text-xs sm:text-sm text-amber-900 italic line-clamp-2" title={entry.kebaikan}>
                            "{entry.kebaikan}"
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'download_data' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Download Laporan Jurnal</h2>
                  <p className="text-gray-500">Pilih tanggal dan kelas untuk mengunduh laporan rekapitulasi jurnal harian siswa.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Tanggal Laporan</label>
                    <Input
                      type="date"
                      className="w-full min-h-[44px]"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Filter Kelas</label>
                    <select
                      className="w-full min-h-[44px] rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                    >
                      <option value="">Semua Kelas</option>
                      {classes.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <Button 
                    onClick={downloadExcel}
                    className="w-full min-h-[48px] bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <FileSpreadsheet className="w-5 h-5 mr-2" />
                    Download Excel
                  </Button>
                  <Button 
                    onClick={downloadPDF}
                    className="w-full min-h-[48px] bg-red-600 hover:bg-red-700 text-white"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Download PDF
                  </Button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border text-sm mt-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Keterangan Penilaian:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li><span className="font-bold text-emerald-700">A (Sangat Baik)</span> : Mengisi Semua</li>
                    <li><span className="font-bold text-blue-700">B (Baik)</span> : Hanya Mengisi setengah</li>
                    <li><span className="font-bold text-yellow-600">C (Cukup)</span> : Hanya Mengisi Sebagian atau siswa Perempuan Berhalangan (Haid)</li>
                    <li><span className="font-bold text-red-600">D (Kurang)</span> : Tidak Mengisi sama Sekali atau Siswa Non Muslim</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
