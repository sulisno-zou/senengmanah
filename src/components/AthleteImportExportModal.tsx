import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Users,
  Info,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Check,
} from 'lucide-react';
import { Athlete, UserAccount, BowDivision, AgeCategory, Gender } from '../types';
import { formatDateIndo } from '../utils/formatters';

interface AthleteImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  athletes: Athlete[];
  currentUser: UserAccount;
  onBatchImportAthletes: (athletes: Athlete[]) => void;
}

export const AthleteImportExportModal: React.FC<AthleteImportExportModalProps> = ({
  isOpen,
  onClose,
  athletes,
  currentUser,
  onBatchImportAthletes,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedAthletes, setParsedAthletes] = useState<Athlete[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const canAccess = currentUser.role === 'super_admin' || currentUser.role === 'admin';
  if (!canAccess) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full text-center space-y-4 text-white">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold">Akses Dibatasi</h3>
          <p className="text-xs text-slate-400">
            Fitur Impor & Ekspor data atlet hanya dapat diakses oleh Super Admin dan Admin Klub.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 1. EXPORT HANDLERS
  // ==========================================
  const escapeCsv = (val: any) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const handleExportCSV = () => {
    const headers = [
      'No',
      'No Anggota (KTA)',
      'Nama Lengkap',
      'Nama Panggilan',
      'Jenis Kelamin (L/P)',
      'NIK',
      'Tempat Lahir',
      'Tanggal Lahir (YYYY-MM-DD)',
      'Kategori Usia',
      'Divisi Busur',
      'No HP / WhatsApp',
      'Nama Orang Tua / Wali',
      'No HP Orang Tua',
      'Alamat Lengkap',
      'Tanggal Bergabung (YYYY-MM-DD)',
      'Status Aktif (Aktif/Nonaktif)',
      'Model Busur',
      'Draw Weight (lbs)',
      'Draw Length (inch)',
      'Merk Arrow & Spine',
      'Thumb Ring',
      'Gaya Khatra',
      'Tipe Quiver',
      'Catatan Tambahan',
    ];

    const rows = athletes.map((a, idx) => [
      idx + 1,
      a.memberNo || '',
      a.name || '',
      a.nickname || '',
      a.gender || 'L',
      `'${a.nik || ''}`,
      a.birthPlace || '',
      a.birthDate || '',
      a.ageCategory || 'U-15',
      a.division || 'Horsebow',
      `'${a.phone || ''}`,
      a.parentName || '',
      `'${a.parentPhone || ''}`,
      a.address || '',
      a.joinDate || '',
      a.active ? 'Aktif' : 'Nonaktif',
      a.equipment?.bowType || 'Horsebow 48"',
      a.equipment?.drawWeightLbs || 35,
      a.equipment?.drawLengthInch || 28,
      `${a.equipment?.arrowBrand || ''} (Spine ${a.equipment?.arrowSpine || '600'})`,
      a.equipment?.thumbRingType || 'Ottoman Brass Ring',
      a.equipment?.khatraStyle || 'Forward Khatra',
      a.equipment?.quiverType || 'Hip Quiver',
      a.notes || '',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const todayStr = new Date().toISOString().slice(0, 10);
    link.download = `DATA_ATLIT_SENENG_MANAH_${todayStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(athletes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const todayStr = new Date().toISOString().slice(0, 10);
    link.download = `DATA_ATLIT_SENENG_MANAH_${todayStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'No Anggota (KTA)',
      'Nama Lengkap',
      'Nama Panggilan',
      'Jenis Kelamin (L/P)',
      'NIK',
      'Tempat Lahir',
      'Tanggal Lahir (YYYY-MM-DD)',
      'Kategori Usia (U-10/U-12/U-15/U-18/Senior)',
      'Divisi Busur (Horsebow)',
      'No HP / WhatsApp',
      'Nama Orang Tua',
      'No HP Orang Tua',
      'Alamat Lengkap',
      'Tanggal Bergabung (YYYY-MM-DD)',
      'Status Aktif (Aktif/Nonaktif)',
      'Model Busur',
      'Draw Weight (lbs)',
      'Draw Length (inch)',
      'Spine Arrow',
      'Catatan',
    ];

    const sampleRow1 = [
      'SM-BATU-901',
      'Ahmad Syakir Pratama',
      'Syakir',
      'L',
      '3579012304080001',
      'Kota Batu',
      '2009-04-12',
      'U-15',
      'Horsebow',
      '081234567890',
      'Budi Pratama',
      '081298765432',
      'Jl. Sultan Agung No. 12, Kota Batu',
      '2026-01-10',
      'Aktif',
      'Ottoman Sipahi Bow 48"',
      '35',
      '28',
      '600',
      'Fokus latihan Fast Shooting & Dynamic',
    ];

    const sampleRow2 = [
      'SM-BATU-902',
      'Fatimah Azzahra',
      'Zahra',
      'P',
      '3579016508100002',
      'Kota Batu',
      '2011-08-25',
      'U-15',
      'Horsebow',
      '081345678901',
      'Ahmad Faisal',
      '081398765432',
      'Jl. Panglima Sudirman No. 45, Kota Batu',
      '2026-02-15',
      'Aktif',
      'Turkish Horsebow 50"',
      '30',
      '27',
      '700',
      'Persiapan Kejuaraan Daerah Horsebow',
    ];

    const csvContent =
      '\uFEFF' +
      [
        headers.map(escapeCsv).join(','),
        sampleRow1.map(escapeCsv).join(','),
        sampleRow2.map(escapeCsv).join(','),
      ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TEMPLATE_IMPOR_ATLIT_SENENG_MANAH.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // 2. IMPORT HANDLERS
  // ==========================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setParseErrors([]);
    setSuccessMessage(null);
    parseFile(file);
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error('Berkas kosong');

        if (file.name.endsWith('.json')) {
          const json = JSON.parse(text);
          if (!Array.isArray(json)) throw new Error('Format JSON harus berupa Array data atlet');
          const validList: Athlete[] = json.map((item, idx) => ({
            id: item.id || `ath-imported-${Date.now()}-${idx}`,
            memberNo: item.memberNo || `SM-BATU-${String(athletes.length + idx + 1).padStart(3, '0')}`,
            name: item.name || `Atlit ${idx + 1}`,
            nickname: item.nickname || '',
            gender: (item.gender === 'P' ? 'P' : 'L') as Gender,
            nik: item.nik ? String(item.nik).replace(/'/g, '') : `357901${String(Date.now() + idx).slice(-10)}`,
            birthPlace: item.birthPlace || 'Kota Batu',
            birthDate: item.birthDate || '2010-01-01',
            ageCategory: (item.ageCategory || 'U-15') as AgeCategory,
            division: 'Horsebow',
            phone: item.phone ? String(item.phone).replace(/'/g, '') : '',
            parentName: item.parentName || '',
            parentPhone: item.parentPhone ? String(item.parentPhone).replace(/'/g, '') : '',
            address: item.address || 'Kota Batu',
            joinDate: item.joinDate || new Date().toISOString().slice(0, 10),
            active: item.active !== false,
            photoUrl: item.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
            userRole: item.userRole || 'atlit',
            username: item.username || (item.memberNo ? item.memberNo.toLowerCase().replace(/[^a-z0-9]/g, '') : `atlit_${idx + 1}`),
            password: item.password || 'password123',
            notes: item.notes || '',
            equipment: item.equipment || {
              bowBrand: 'Ottoman Turkish Bow',
              bowType: 'Horsebow 48"',
              drawWeightLbs: 35,
              drawLengthInch: 28,
              arrowBrand: 'Carbon Traditional Hybrid',
              arrowSpine: '600',
              sightMarkNotes: '',
              thumbRingType: 'Ottoman Brass Ring',
              khatraStyle: 'Forward Khatra',
              quiverType: 'Hip Quiver',
            },
          }));
          setParsedAthletes(validList);
        } else {
          // CSV Parser with support for quotes and comma/semicolon delimiter
          const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
          if (lines.length < 2) throw new Error('Berkas CSV harus memiliki minimal baris judul dan 1 baris data');

          const delimiter = lines[0].includes(';') ? ';' : ',';
          const parseCsvLine = (line: string): string[] => {
            const result: string[] = [];
            let cur = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"' || char === "'") {
                if (inQuotes && line[i + 1] === char) {
                  cur += char;
                  i++;
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (char === delimiter && !inQuotes) {
                result.push(cur.trim());
                cur = '';
              } else {
                cur += char;
              }
            }
            result.push(cur.trim());
            return result;
          };

          const rawHeaders = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
          const list: Athlete[] = [];
          const errors: string[] = [];

          for (let i = 1; i < lines.length; i++) {
            const cols = parseCsvLine(lines[i]);
            if (cols.length === 0 || cols.every((c) => !c)) continue;

            // Extract based on column index or position
            const memberNo = cols[0]?.replace(/'/g, '').trim() || `SM-BATU-${String(athletes.length + i).padStart(3, '0')}`;
            const name = cols[1]?.trim() || cols[0]?.trim();

            if (!name) {
              errors.push(`Baris ${i + 1}: Nama atlet tidak ditemukan, dilewati.`);
              continue;
            }

            const nickname = cols[2]?.trim() || name.split(' ')[0];
            const genderRaw = cols[3]?.trim().toUpperCase();
            const gender: Gender = genderRaw === 'P' || genderRaw === 'PEREMPUAN' || genderRaw === 'WANITA' ? 'P' : 'L';
            const nik = cols[4]?.replace(/['"\s]/g, '').trim() || `357901${String(Date.now() + i).slice(-10)}`;
            const birthPlace = cols[5]?.trim() || 'Kota Batu';
            const birthDate = cols[6]?.trim() || '2010-01-01';
            const ageCategoryRaw = cols[7]?.trim() || 'U-15';
            const ageCategory: AgeCategory = (
              ageCategoryRaw.includes('10') ? 'U-10' :
              ageCategoryRaw.includes('12') ? 'U-12' :
              ageCategoryRaw.includes('18') ? 'U-18' :
              ageCategoryRaw.toLowerCase().includes('senior') ? 'Senior/Umum' : 'U-15'
            );
            const division: BowDivision = 'Horsebow';
            const phone = cols[9]?.replace(/['"\s]/g, '').trim() || '';
            const parentName = cols[10]?.trim() || '';
            const parentPhone = cols[11]?.replace(/['"\s]/g, '').trim() || '';
            const address = cols[12]?.trim() || 'Kota Batu, Jawa Timur';
            const joinDate = cols[13]?.trim() || new Date().toISOString().slice(0, 10);
            const activeStatus = cols[14]?.trim().toLowerCase();
            const active = !(activeStatus === 'nonaktif' || activeStatus === 'tidak' || activeStatus === 'false');
            const bowType = cols[15]?.trim() || 'Horsebow 48"';
            const drawWeightLbs = parseInt(cols[16]?.trim() || '35', 10) || 35;
            const drawLengthInch = parseInt(cols[17]?.trim() || '28', 10) || 28;
            const arrowSpine = cols[18]?.trim() || '600';
            const notes = cols[19]?.trim() || '';

            const newAth: Athlete = {
              id: `ath-imp-${Date.now()}-${i}`,
              memberNo,
              name,
              nickname,
              gender,
              nik,
              birthPlace,
              birthDate,
              ageCategory,
              division,
              phone,
              parentName,
              parentPhone,
              address,
              joinDate,
              active,
              photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
              userRole: 'atlit',
              username: memberNo.toLowerCase().replace(/[^a-z0-9]/g, '') || `atlit_${i}`,
              password: 'password123',
              notes,
              equipment: {
                bowBrand: 'Ottoman Turkish Bow',
                bowType,
                drawWeightLbs,
                drawLengthInch,
                arrowBrand: 'Carbon Traditional Hybrid',
                arrowSpine,
                sightMarkNotes: '',
                thumbRingType: 'Ottoman Brass Ring',
                khatraStyle: 'Forward Khatra',
                quiverType: 'Hip Quiver',
              },
            };

            list.push(newAth);
          }

          setParsedAthletes(list);
          setParseErrors(errors);
        }
      } catch (err: any) {
        console.error('Error parsing file:', err);
        setParseErrors([`Gagal memproses berkas: ${err.message || 'Format tidak valid'}`]);
      }
    };

    if (file.name.endsWith('.json') || file.name.endsWith('.csv') || file.type === 'text/csv' || file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      setParseErrors(['Format berkas harus berekstensi .csv atau .json']);
    }
  };

  const handleProcessImport = () => {
    if (parsedAthletes.length === 0) return;
    setIsProcessing(true);
    try {
      onBatchImportAthletes(parsedAthletes);
      setSuccessMessage(`Berhasil mengimpor dan menyinkronkan ${parsedAthletes.length} data atlet ke database!`);
      setTimeout(() => {
        setParsedAthletes([]);
        setImportFile(null);
        setIsProcessing(false);
      }, 1200);
    } catch (err: any) {
      setParseErrors([`Terjadi kesalahan saat menyimpan: ${err.message}`]);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <ArrowUpDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Impor & Ekspor Data Atlet</span>
                <span className="text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/40 px-2 py-0.5 rounded-full font-bold">
                  {currentUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pusat pertukaran data atlit format CSV, Microsoft Excel, dan JSON Cloud Backup
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-2 bg-slate-950/70 border-b border-slate-800 gap-2">
          <button
            onClick={() => {
              setActiveTab('export');
              setSuccessMessage(null);
            }}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'export'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Data ({athletes.length} Atlet)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('import');
              setSuccessMessage(null);
            }}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'import'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Impor Data Atlet (CSV / JSON)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* ======================= EXPORT TAB ======================= */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-start gap-3">
                <Info className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-white">Ringkasan Data Atlet Tersedia:</p>
                  <p>
                    Saat ini tersimpan <strong>{athletes.length} orang atlet</strong> aktif di klub Seneng Manah.
                    Berkas ekspor berisi identitas lengkap, NIK, nomor KTA, tanggal lahir, kontak orang tua, spesifikasi
                    busur, berat tarikan (draw weight), arrow spine, hingga catatan pelatih.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Export CSV */}
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 hover:border-pink-500/40 transition flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Unduh CSV / Microsoft Excel</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Format standar tabel (UTF-8 BOM) yang dapat langsung dibuka dan diedit di Microsoft Excel, Google
                      Sheets, LibreOffice, atau WPS Office tanpa karakter rusak.
                    </p>
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Berkas (.CSV)</span>
                  </button>
                </div>

                {/* 2. Export JSON */}
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Unduh Cadangan JSON Struktural</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Format objek lengkap termasuk konfigurasi peralatan memanah lengkap (bow model, thumb ring, khatra)
                      yang siap dipulihkan kembali ke sistem.
                    </p>
                  </div>

                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-purple-600/20 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Berkas (.JSON)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================= IMPORT TAB ======================= */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              {/* Instructions & Template Download */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300">
                    <p className="font-bold text-white">Panduan Impor Data:</p>
                    <p className="text-slate-400">
                      Gunakan template resmi Seneng Manah agar kolom terbaca dengan tepat dan otomatis sinkron ke Firebase.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center gap-2 shrink-0 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Template CSV Contoh</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div className="p-6 bg-slate-950 rounded-2xl border-2 border-dashed border-slate-700 hover:border-pink-500/60 transition text-center space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>

                <div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-bold text-xs shadow-md transition"
                  >
                    Pilih File CSV atau JSON
                  </button>
                  <p className="text-[11px] text-slate-400 mt-2">
                    {importFile ? (
                      <span className="text-emerald-400 font-bold">Berkas terpilih: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)</span>
                    ) : (
                      'Klik tombol di atas untuk memilih berkas dari komputer/HP Anda'
                    )}
                  </p>
                </div>
              </div>

              {/* Error messages */}
              {parseErrors.length > 0 && (
                <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-rose-300 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Catatan Kesalahan:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {parseErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Parsed Athletes Preview Table */}
              {parsedAthletes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Hasil Analisis Berkas: {parsedAthletes.length} Atlet Siap Diimpor</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Periksa pratinjau sebelum menyimpan
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-56 bg-slate-950">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 sticky top-0">
                        <tr>
                          <th className="p-2.5">No KTA</th>
                          <th className="p-2.5">Nama Lengkap</th>
                          <th className="p-2.5">L/P</th>
                          <th className="p-2.5">Kategori Usia</th>
                          <th className="p-2.5">WhatsApp</th>
                          <th className="p-2.5">Model Busur</th>
                          <th className="p-2.5">Draw Weight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {parsedAthletes.map((a, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/60">
                            <td className="p-2.5 font-mono text-pink-400 font-bold">{a.memberNo}</td>
                            <td className="p-2.5 font-bold text-white">{a.name}</td>
                            <td className="p-2.5">{a.gender}</td>
                            <td className="p-2.5">{a.ageCategory}</td>
                            <td className="p-2.5 font-mono">{a.phone || '-'}</td>
                            <td className="p-2.5 text-slate-400">{a.equipment?.bowType || 'Horsebow'}</td>
                            <td className="p-2.5">{a.equipment?.drawWeightLbs || 35} lbs</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleProcessImport}
                      disabled={isProcessing}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:opacity-90 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 flex items-center gap-2 transition disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Menyimpan ke Cloud...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Proses Impor ({parsedAthletes.length} Atlet)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Kompatibel dengan Microsoft Excel 2013-2026, Google Sheets, dan Cloud Firestore.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
