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
  FileText,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Athlete, UserAccount, BowDivision, AgeCategory, Gender, MemberLevel } from '../types';
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

  const canAccess =
    currentUser.role === 'super_admin' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'pelatih_utama';

  if (!canAccess) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full text-center space-y-4 text-white">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold">Akses Dibatasi</h3>
          <p className="text-xs text-slate-400">
            Fitur Impor & Ekspor data atlet hanya dapat diakses oleh Super Admin, Admin Klub, dan Pelatih Utama.
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
  // 1. EXPORT HANDLERS (EXCEL XLSX, CSV, JSON)
  // ==========================================
  const prepareExportData = () => {
    return athletes.map((a, idx) => ({
      No: idx + 1,
      'No Anggota (KTA)': a.memberNo || '',
      'Nama Lengkap': a.name || '',
      'Nama Panggilan': a.nickname || '',
      'Level Anggota': a.memberLevel || 'Atlet Reguler',
      'Jenis Kelamin (L/P)': a.gender || 'L',
      NIK: a.nik ? String(a.nik) : '',
      'Tempat Lahir': a.birthPlace || '',
      'Tanggal Lahir (YYYY-MM-DD)': a.birthDate || '',
      'Kategori Usia': a.ageCategory || 'U-15',
      'Divisi Busur': a.division || 'Horsebow',
      'No HP / WhatsApp': a.phone ? String(a.phone) : '',
      'Nama Orang Tua / Wali': a.parentName || '',
      'No HP Orang Tua': a.parentPhone ? String(a.parentPhone) : '',
      'Alamat Lengkap': a.address || '',
      'Tanggal Bergabung (YYYY-MM-DD)': a.joinDate || '',
      'Status Aktif (Aktif/Nonaktif)': a.active ? 'Aktif' : 'Nonaktif',
      'Model Busur': a.equipment?.bowType || 'Horsebow 48"',
      'Draw Weight (lbs)': a.equipment?.drawWeightLbs || 35,
      'Draw Length (inch)': a.equipment?.drawLengthInch || 28,
      'Merk Arrow': a.equipment?.arrowBrand || 'Easton / Beman',
      'Spine Arrow': a.equipment?.arrowSpine || 600,
      'Thumb Ring': a.equipment?.thumbRingType || 'Ottoman Brass Ring',
      'Gaya Khatra': a.equipment?.khatraStyle || 'Forward Khatra',
      'Tipe Quiver': a.equipment?.quiverType || 'Hip Quiver',
      'Username Akun': a.username || '',
      'Catatan Tambahan': a.notes || '',
    }));
  };

  const handleExportExcel = () => {
    const data = prepareExportData();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set column widths
    const wscols = [
      { wch: 5 }, // No
      { wch: 18 }, // No Anggota
      { wch: 25 }, // Nama Lengkap
      { wch: 15 }, // Panggilan
      { wch: 18 }, // Level
      { wch: 10 }, // Gender
      { wch: 20 }, // NIK
      { wch: 18 }, // Tempat Lahir
      { wch: 15 }, // Tgl Lahir
      { wch: 15 }, // Kategori Usia
      { wch: 18 }, // Divisi Busur
      { wch: 18 }, // No HP
      { wch: 22 }, // Orang Tua
      { wch: 18 }, // HP Ortu
      { wch: 30 }, // Alamat
      { wch: 15 }, // Tgl Gabung
      { wch: 12 }, // Status
      { wch: 20 }, // Busur
      { wch: 15 }, // Draw W
      { wch: 15 }, // Draw L
      { wch: 18 }, // Arrow
      { wch: 12 }, // Spine
      { wch: 20 }, // Thumb Ring
      { wch: 18 }, // Khatra
      { wch: 16 }, // Quiver
      { wch: 16 }, // Username
      { wch: 30 }, // Catatan
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Atlet & Anggota');

    const todayStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `DATA_ATLIT_SENENG_MANAH_${todayStr}.xlsx`);
  };

  const handleExportCSV = () => {
    const data = prepareExportData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
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
    const templateData = [
      {
        'No Anggota (KTA)': 'SM-BATU-001',
        'Nama Lengkap': 'Farhan Arya Pratama',
        'Nama Panggilan': 'Farhan',
        'Level Anggota': 'Atlet Reguler',
        'Jenis Kelamin (L/P)': 'L',
        NIK: '3579012345670001',
        'Tempat Lahir': 'Kota Batu',
        'Tanggal Lahir (YYYY-MM-DD)': '2010-05-14',
        'Kategori Usia': 'U-15',
        'Divisi Busur': 'Horsebow',
        'No HP / WhatsApp': '081234567891',
        'Nama Orang Tua / Wali': 'Bambang Santoso',
        'No HP Orang Tua': '081234567890',
        'Alamat Lengkap': 'Jl. Bromo No. 12, Sisir, Kota Batu',
        'Tanggal Bergabung (YYYY-MM-DD)': '2025-01-10',
        'Status Aktif (Aktif/Nonaktif)': 'Aktif',
        'Model Busur': 'Horsebow Ottoman 48"',
        'Draw Weight (lbs)': 35,
        'Draw Length (inch)': 28,
        'Merk Arrow': 'Easton Inspire',
        'Spine Arrow': 600,
        'Thumb Ring': 'Brass Ottoman',
        'Gaya Khatra': 'Forward Khatra',
        'Tipe Quiver': 'Hip Quiver',
        'Username Akun': 'farhan_batu',
        'Catatan Tambahan': 'Atlet binaan potensi kejurda',
      },
      {
        'No Anggota (KTA)': 'SM-BATU-002',
        'Nama Lengkap': 'Aisyah Putri Maharani',
        'Nama Panggilan': 'Aisyah',
        'Level Anggota': 'Atlet Prestasi',
        'Jenis Kelamin (L/P)': 'P',
        NIK: '3579015566770002',
        'Tempat Lahir': 'Malang',
        'Tanggal Lahir (YYYY-MM-DD)': '2012-08-20',
        'Kategori Usia': 'U-13',
        'Divisi Busur': 'Standard Bow',
        'No HP / WhatsApp': '081344556677',
        'Nama Orang Tua / Wali': 'Hendra Wijaya',
        'No HP Orang Tua': '081344556678',
        'Alamat Lengkap': 'Jl. Panderman No. 5, Kota Batu',
        'Tanggal Bergabung (YYYY-MM-DD)': '2025-03-01',
        'Status Aktif (Aktif/Nonaktif)': 'Aktif',
        'Model Busur': 'Cartel Sirius Plus 66"',
        'Draw Weight (lbs)': 24,
        'Draw Length (inch)': 25,
        'Merk Arrow': 'Beman Flash',
        'Spine Arrow': 900,
        'Thumb Ring': '-',
        'Gaya Khatra': '-',
        'Tipe Quiver': 'Target Side Quiver',
        'Username Akun': 'aisyah_archery',
        'Catatan Tambahan': 'Kandidat Popda Jatim',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Atlet');
    XLSX.writeFile(workbook, 'TEMPLATE_IMPORT_ATLIT_SENENG_MANAH.xlsx');
  };

  // ==========================================
  // 2. IMPORT HANDLERS (XLSX, XLS, CSV, JSON)
  // ==========================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setParseErrors([]);
    setSuccessMessage(null);
    setParsedAthletes([]);

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
      parseExcelOrCSVFile(file);
    } else if (fileName.endsWith('.json')) {
      parseJSONFile(file);
    } else {
      setParseErrors(['Format file tidak didukung. Harap pilih file .xlsx, .xls, .csv, atau .json']);
    }
  };

  const parseExcelOrCSVFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!rawJson || rawJson.length === 0) {
          setParseErrors(['File Excel/CSV tidak memiliki data baris atau kosong.']);
          setIsProcessing(false);
          return;
        }

        const validAthletes: Athlete[] = [];
        const errors: string[] = [];

        rawJson.forEach((row, index) => {
          const rowNumber = index + 2; // header is row 1
          const name = (
            row['Nama Lengkap'] ||
            row['nama'] ||
            row['name'] ||
            row['Nama'] ||
            ''
          ).toString().trim();

          if (!name) {
            errors.push(`Baris ${rowNumber}: Nama Lengkap wajib diisi.`);
            return;
          }

          const memberNo = (
            row['No Anggota (KTA)'] ||
            row['no_anggota'] ||
            row['memberNo'] ||
            row['KTA'] ||
            `SM-BATU-${String(athletes.length + validAthletes.length + 1).padStart(3, '0')}`
          ).toString().trim();

          const genderRaw = (
            row['Jenis Kelamin (L/P)'] ||
            row['gender'] ||
            row['Gender'] ||
            'L'
          ).toString().toUpperCase().trim();
          const gender: Gender = genderRaw.startsWith('P') || genderRaw === 'FEMALE' ? 'P' : 'L';

          const divisionRaw = (
            row['Divisi Busur'] ||
            row['division'] ||
            row['Divisi'] ||
            'Horsebow'
          ).toString().trim();
          const division: BowDivision = ['Horsebow', 'Standard Bow', 'Barebow', 'Recurve', 'Compound'].includes(divisionRaw)
            ? (divisionRaw as BowDivision)
            : 'Horsebow';

          const ageCategoryRaw = (
            row['Kategori Usia'] ||
            row['ageCategory'] ||
            'U-15'
          ).toString().trim();
          const ageCategory: AgeCategory = ['U-9', 'U-12', 'U-13', 'U-15', 'U-18', 'Umum', 'Senior'].includes(ageCategoryRaw)
            ? (ageCategoryRaw as AgeCategory)
            : 'U-15';

          const memberLevelRaw = (
            row['Level Anggota'] ||
            row['memberLevel'] ||
            'Atlet Reguler'
          ).toString().trim();
          const memberLevel: MemberLevel = [
            'Pelatih Utama',
            'Pelatih',
            'Pengurus',
            'Atlet Reguler',
            'Atlet Prestasi',
            'Calon Atlet',
          ].includes(memberLevelRaw)
            ? (memberLevelRaw as MemberLevel)
            : 'Atlet Reguler';

          const activeStr = (
            row['Status Aktif (Aktif/Nonaktif)'] ||
            row['active'] ||
            'Aktif'
          ).toString().toLowerCase();
          const active = activeStr.includes('aktif') && !activeStr.includes('non');

          const athlete: Athlete = {
            id: `ath-imp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            memberNo,
            name,
            nickname: (row['Nama Panggilan'] || row['nickname'] || '').toString().trim(),
            gender,
            nik: row['NIK'] ? String(row['NIK']).replace(/[^0-9]/g, '') : undefined,
            birthPlace: (row['Tempat Lahir'] || row['birthPlace'] || 'Kota Batu').toString().trim(),
            birthDate: (row['Tanggal Lahir (YYYY-MM-DD)'] || row['birthDate'] || '2010-01-01').toString().trim(),
            ageCategory,
            division,
            phone: row['No HP / WhatsApp'] ? String(row['No HP / WhatsApp']).trim() : undefined,
            parentName: (row['Nama Orang Tua / Wali'] || row['parentName'] || '').toString().trim(),
            parentPhone: row['No HP Orang Tua'] ? String(row['No HP Orang Tua']).trim() : undefined,
            address: (row['Alamat Lengkap'] || row['address'] || 'Kota Batu').toString().trim(),
            joinDate: (row['Tanggal Bergabung (YYYY-MM-DD)'] || row['joinDate'] || new Date().toISOString().slice(0, 10)).toString().trim(),
            active,
            memberLevel,
            userRole:
              memberLevel === 'Pelatih Utama'
                ? 'pelatih_utama'
                : memberLevel === 'Pelatih'
                ? 'pelatih'
                : memberLevel === 'Pengurus'
                ? 'pengurus'
                : 'atlit',
            username: (row['Username Akun'] || row['username'] || '').toString().trim().toLowerCase() || undefined,
            password: 'password123',
            ktaStatus: 'APPROVED',
            notes: (row['Catatan Tambahan'] || row['notes'] || '').toString().trim(),
            equipment: {
              bowType: (row['Model Busur'] || 'Horsebow 48"').toString().trim(),
              drawWeightLbs: Number(row['Draw Weight (lbs)']) || 35,
              drawLengthInch: Number(row['Draw Length (inch)']) || 28,
              arrowBrand: (row['Merk Arrow'] || 'Easton').toString().trim(),
              arrowSpine: (row['Spine Arrow'] || '600').toString().trim(),
              thumbRingType: (row['Thumb Ring'] || 'Ottoman Brass Ring').toString().trim(),
              khatraStyle: (row['Gaya Khatra'] || 'Forward Khatra').toString().trim(),
              quiverType: (row['Tipe Quiver'] || 'Hip Quiver').toString().trim(),
            },
          };

          validAthletes.push(athlete);
        });

        setParsedAthletes(validAthletes);
        setParseErrors(errors);
        setIsProcessing(false);
      } catch (err: any) {
        setParseErrors([`Gagal membaca file Excel/CSV: ${err.message || 'Format tidak valid'}`]);
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setParseErrors(['Gagal membaca file dari disk.']);
      setIsProcessing(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const parseJSONFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        if (!Array.isArray(parsed)) {
          setParseErrors(['Format JSON harus berupa Array of Athletes [ { ... }, { ... } ]']);
          setIsProcessing(false);
          return;
        }

        const validAthletes: Athlete[] = parsed.map((item, idx) => ({
          id: item.id || `ath-imp-${Date.now()}-${idx}`,
          memberNo: item.memberNo || `SM-BATU-${String(athletes.length + idx + 1).padStart(3, '0')}`,
          name: item.name || 'Atlet Tanpa Nama',
          nickname: item.nickname || '',
          gender: item.gender || 'L',
          nik: item.nik || undefined,
          birthPlace: item.birthPlace || 'Kota Batu',
          birthDate: item.birthDate || '2010-01-01',
          ageCategory: item.ageCategory || 'U-15',
          division: item.division || 'Horsebow',
          phone: item.phone || undefined,
          parentName: item.parentName || undefined,
          parentPhone: item.parentPhone || undefined,
          address: item.address || 'Kota Batu',
          joinDate: item.joinDate || new Date().toISOString().slice(0, 10),
          active: item.active !== undefined ? item.active : true,
          photoUrl: item.photoUrl,
          memberLevel: item.memberLevel || 'Atlet Reguler',
          userRole: item.userRole || 'atlit',
          username: item.username || undefined,
          password: item.password || 'password123',
          ktaStatus: item.ktaStatus || 'APPROVED',
          notes: item.notes || '',
          equipment: item.equipment || {
            bowType: 'Horsebow 48"',
            drawWeightLbs: 35,
            drawLengthInch: 28,
            arrowBrand: 'Easton',
            arrowSpine: 600,
            thumbRingType: 'Ottoman Brass Ring',
            khatraStyle: 'Forward Khatra',
            quiverType: 'Hip Quiver',
          },
        }));

        setParsedAthletes(validAthletes);
        setParseErrors([]);
        setIsProcessing(false);
      } catch (err: any) {
        setParseErrors([`Gagal mem-parsing JSON: ${err.message}`]);
        setIsProcessing(false);
      }
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (parsedAthletes.length === 0) return;
    onBatchImportAthletes(parsedAthletes);
    setSuccessMessage(`Berhasil mengimpor ${parsedAthletes.length} data atlet ke database!`);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-6 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-pink-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Impor & Ekspor Data Atlet (Excel / CSV)</h3>
              <p className="text-xs text-slate-400">Kelola master data atlet Seneng Manah Archery Batu</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition border border-slate-700/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-950 border-b border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'export'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Ekspor ke Excel / CSV ({athletes.length} Atlet)</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'import'
                ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Impor dari Excel / CSV</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {successMessage && (
            <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-bold">{successMessage}</span>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 1: EXPORT SECTION */}
          {/* ==================================================== */}
          {activeTab === 'export' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-pink-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-pink-400" />
                    <span>Total Atlet Terdaftar: {athletes.length} Orang</span>
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Ekspor seluruh data biodata, divisi busur, nomor KTA, dan spesifikasi peralatan ke file Excel atau format lain.
                  </p>
                </div>

                <button
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 shrink-0"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Download Format Template Excel</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Excel Button */}
                <button
                  onClick={handleExportExcel}
                  className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 hover:border-emerald-500/60 transition group text-left space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-white text-sm">Microsoft Excel (.xlsx)</h5>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Format spreadsheet modern lengkap dengan kolom terformat & otomatis lebar.
                    </p>
                  </div>
                  <div className="pt-2 text-emerald-400 font-bold flex items-center gap-1">
                    <span>Download .XLSX</span>
                    <Download className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* CSV Button */}
                <button
                  onClick={handleExportCSV}
                  className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/30 hover:border-blue-500/60 transition group text-left space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-white text-sm">File CSV (.csv)</h5>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Format teks universal terpisah koma dengan encoding UTF-8 standar.
                    </p>
                  </div>
                  <div className="pt-2 text-blue-400 font-bold flex items-center gap-1">
                    <span>Download .CSV</span>
                    <Download className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* JSON Button */}
                <button
                  onClick={handleExportJSON}
                  className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 hover:border-purple-500/60 transition group text-left space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-white text-sm">Backup JSON (.json)</h5>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Struktur raw objek data lengkap untuk backup dan migrasi antar database.
                    </p>
                  </div>
                  <div className="pt-2 text-purple-400 font-bold flex items-center gap-1">
                    <span>Download .JSON</span>
                    <Download className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: IMPORT SECTION */}
          {/* ==================================================== */}
          {activeTab === 'import' && (
            <div className="space-y-5">
              {/* Dropzone / Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-pink-500/60 rounded-3xl p-8 text-center bg-slate-950/50 hover:bg-slate-950/80 transition cursor-pointer space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center justify-center mx-auto shadow-inner">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">
                    Klik atau Seret & Letakkan file Excel (.xlsx / .xls) atau .CSV di sini
                  </p>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Sistem akan memvalidasi kolom secara otomatis dan menampilkan pratinjau sebelum disimpan.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv, .json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {parseErrors.length > 0 && (
                <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Terdapat {parseErrors.length} Catatan Kesalahan:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px]">
                    {parseErrors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {parseErrors.length > 5 && (
                      <li>...dan {parseErrors.length - 5} kesalahan lainnya.</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Preview Table of Parsed Athletes */}
              {parsedAthletes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-white text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Siap Diimpor: {parsedAthletes.length} Atlet</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">Pratinjau Data:</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0 font-bold">
                        <tr>
                          <th className="p-2.5">No KTA</th>
                          <th className="p-2.5">Nama Lengkap</th>
                          <th className="p-2.5">Level</th>
                          <th className="p-2.5">Divisi</th>
                          <th className="p-2.5">Kategori</th>
                          <th className="p-2.5">No WhatsApp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
                        {parsedAthletes.map((a, i) => (
                          <tr key={i} className="hover:bg-slate-900/40">
                            <td className="p-2.5 font-mono text-pink-400">{a.memberNo}</td>
                            <td className="p-2.5 font-bold text-white">{a.name}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded-full text-[9px] bg-purple-500/20 text-purple-300 font-bold">
                                {a.memberLevel || 'Atlet Reguler'}
                              </span>
                            </td>
                            <td className="p-2.5">{a.division}</td>
                            <td className="p-2.5">{a.ageCategory} ({a.gender})</td>
                            <td className="p-2.5 font-mono text-slate-400">{a.phone || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        setParsedAthletes([]);
                        setImportFile(null);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs"
                    >
                      Batal
                    </button>

                    <button
                      onClick={handleConfirmImport}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition active:scale-95 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Simpan & Impor {parsedAthletes.length} Atlet Sekarang</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
