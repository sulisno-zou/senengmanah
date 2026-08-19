import React, { useState } from 'react';
import {
  X,
  Download,
  FolderArchive,
  FileSpreadsheet,
  FileCode,
  FileText,
  CheckCircle2,
  AlertCircle,
  Database,
  UploadCloud,
  Shield,
  Layers,
  Sparkles,
  Info,
  Archive,
  FileDown,
  ExternalLink,
  Code2,
} from 'lucide-react';
import JSZip from 'jszip';
import {
  Athlete,
  SPPPayment,
  TrainingSession,
  AttendanceRecord,
  RegistrationRequest,
  NewsArticle,
  PaymentProof,
  ClubSettings,
  UserAccount,
} from '../types';
import { formatRupiah, formatDateIndo, formatMonthYearIndo } from '../utils/formatters';

interface DownloadAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  athletes: Athlete[];
  sppPayments: SPPPayment[];
  trainingSessions: TrainingSession[];
  attendanceRecords: AttendanceRecord[];
  registrations: RegistrationRequest[];
  newsArticles: NewsArticle[];
  paymentProofs: PaymentProof[];
  clubSettings: ClubSettings;
  currentUser: UserAccount;
  onRestoreData?: (importedData: any) => void;
}

export const DownloadAllModal: React.FC<DownloadAllModalProps> = ({
  isOpen,
  onClose,
  athletes,
  sppPayments,
  trainingSessions,
  attendanceRecords,
  registrations,
  newsArticles,
  paymentProofs,
  clubSettings,
  currentUser,
  onRestoreData,
}) => {
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isDownloadingSource, setIsDownloadingSource] = useState(false);
  const [sourceDownloadSuccess, setSourceDownloadSuccess] = useState(false);

  const handleDownloadSourceZip = async () => {
    setIsDownloadingSource(true);
    setSourceDownloadSuccess(false);
    try {
      const response = await fetch('/api/download-source-zip');
      if (!response.ok) throw new Error('Gagal mengunduh ZIP');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seneng-manah-horsebow-project-source_${todayStr}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSourceDownloadSuccess(true);
    } catch (err: any) {
      console.error('Download error:', err);
      // Fallback direct navigation
      window.location.href = '/api/download-source-zip';
    } finally {
      setIsDownloadingSource(false);
    }
  };

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().slice(0, 10);

  // Helper to escape CSV fields
  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // 1. Generate CSV: Athletes
  const generateAthletesCSV = () => {
    const headers = [
      'Nomor Anggota',
      'Nama Lengkap',
      'Nama Panggilan',
      'Jenis Kelamin',
      'NIK',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Kategori Usia',
      'Divisi Busur',
      'No Telepon/WA',
      'Nama Orang Tua / Wali',
      'No Telepon Orang Tua',
      'Alamat',
      'Tanggal Bergabung',
      'Status Aktif',
      'Merk Busur',
      'Tipe Busur',
      'Draw Weight (lbs)',
      'Draw Length (inch)',
      'Tipe Thumb Ring',
      'Gaya Khatra',
      'Tipe Quiver',
      'Merk Arrow',
      'Spine Arrow',
      'Catatan Khusus',
    ];

    const rows = athletes.map((a) => [
      escapeCsv(a.memberNo),
      escapeCsv(a.name),
      escapeCsv(a.nickname || ''),
      escapeCsv(a.gender === 'L' ? 'Putra (L)' : 'Putri (P)'),
      escapeCsv(a.nik),
      escapeCsv(a.birthPlace),
      escapeCsv(a.birthDate),
      escapeCsv(a.ageCategory),
      escapeCsv(a.division),
      escapeCsv(a.phone),
      escapeCsv(a.parentName || ''),
      escapeCsv(a.parentPhone || ''),
      escapeCsv(a.address),
      escapeCsv(a.joinDate),
      escapeCsv(a.active ? 'Aktif' : 'Non-Aktif'),
      escapeCsv(a.equipment.bowBrand || ''),
      escapeCsv(a.equipment.bowType || ''),
      escapeCsv(a.equipment.drawWeightLbs || ''),
      escapeCsv(a.equipment.drawLengthInch || ''),
      escapeCsv(a.equipment.thumbRingType || ''),
      escapeCsv(a.equipment.khatraStyle || ''),
      escapeCsv(a.equipment.quiverType || ''),
      escapeCsv(a.equipment.arrowBrand || ''),
      escapeCsv(a.equipment.arrowSpine || ''),
      escapeCsv(a.notes || ''),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  };

  // 2. Generate CSV: SPP Payments
  const generateSPPCSV = () => {
    const headers = [
      'ID Tagihan',
      'Nama Atlet',
      'ID Atlet',
      'Periode Bulan',
      'Nominal Tagihan (Rp)',
      'Status Pembayaran',
      'Jatuh Tempo',
      'Tanggal Bayar',
      'Metode Pembayaran',
      'Diverifikasi Oleh',
      'Catatan Pembayaran',
    ];

    const rows = sppPayments.map((p) => [
      escapeCsv(p.id),
      escapeCsv(p.athleteName),
      escapeCsv(p.athleteId),
      escapeCsv(p.monthYear),
      escapeCsv(p.amount),
      escapeCsv(p.status),
      escapeCsv(p.dueDate || ''),
      escapeCsv(p.paidDate || ''),
      escapeCsv(p.paymentMethod || ''),
      escapeCsv(p.verifiedBy || ''),
      escapeCsv(p.notes || ''),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  };

  // 3. Generate CSV: Training & Scoring (6 Topik)
  const generateScoringCSV = () => {
    const headers = [
      'ID Sesi',
      'Nama Atlet',
      'ID Atlet',
      'Tanggal Sesi',
      'Topik Latihan / Penilaian',
      'Jarak Tembak (Meter)',
      'Ukuran Target Face (cm)',
      'Total Skor',
      'Rata-rata Skor per Panah',
      'Rincian Skor Rambu (Ends)',
      'Catatan Pelatih',
    ];

    const rows = trainingSessions.map((s) => [
      escapeCsv(s.id),
      escapeCsv(s.athleteName),
      escapeCsv(s.athleteId),
      escapeCsv(s.date),
      escapeCsv(s.topic || s.category),
      escapeCsv(s.distanceMeters),
      escapeCsv(s.targetFaceSizeCm),
      escapeCsv(s.totalScore),
      escapeCsv(s.averagePerArrow.toFixed(2)),
      escapeCsv(s.ends.map((end, i) => `End ${i + 1}: [${end.join(', ')}]`).join(' | ')),
      escapeCsv(s.coachNotes || ''),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  };

  // 4. Generate CSV: Attendance
  const generateAttendanceCSV = () => {
    const headers = [
      'ID Presensi',
      'Nama Atlet',
      'ID Atlet',
      'Tanggal',
      'Tipe Sesi',
      'Status Kehadiran',
      'Jumlah Rambu Tembakan',
      'Catatan',
    ];

    const rows = attendanceRecords.map((a) => [
      escapeCsv(a.id),
      escapeCsv(a.athleteName),
      escapeCsv(a.athleteId),
      escapeCsv(a.date),
      escapeCsv(a.sessionType),
      escapeCsv(a.status),
      escapeCsv(a.roundsCompleted || 0),
      escapeCsv(a.notes || ''),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  };

  // 5. Generate CSV: Registrations
  const generateRegistrationsCSV = () => {
    const headers = [
      'Nomor Registrasi',
      'Nama Lengkap',
      'Nama Panggilan',
      'Jenis Kelamin',
      'NIK',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Kategori Usia',
      'Pilihan Divisi',
      'No WhatsApp',
      'Nama Wali',
      'No WhatsApp Wali',
      'Alamat',
      'Pengalaman Memanah',
      'Tanggal Daftar',
      'Status Registrasi',
      'Catatan Penolakan / Alasan',
    ];

    const rows = registrations.map((r) => [
      escapeCsv(r.regNumber),
      escapeCsv(r.name),
      escapeCsv(r.nickname || ''),
      escapeCsv(r.gender === 'L' ? 'Putra (L)' : 'Putri (P)'),
      escapeCsv(r.nik),
      escapeCsv(r.birthPlace),
      escapeCsv(r.birthDate),
      escapeCsv(r.ageCategory),
      escapeCsv(r.division),
      escapeCsv(r.phone),
      escapeCsv(r.parentName || ''),
      escapeCsv(r.parentPhone || ''),
      escapeCsv(r.address),
      escapeCsv(r.experienceNotes || ''),
      escapeCsv(r.createdAt),
      escapeCsv(r.status),
      escapeCsv(r.rejectionReason || ''),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  };

  // 6. Generate CSV: News
  const generateNewsCSV = () => {
    const headers = ['ID Berita', 'Judul', 'Kategori', 'Tanggal Terbit', 'Penulis', 'Isi Berita'];
    const rows = newsArticles.map((n) => [
      escapeCsv(n.id),
      escapeCsv(n.title),
      escapeCsv(n.category),
      escapeCsv(n.date),
      escapeCsv(n.author),
      escapeCsv(n.content),
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  };

  // 7. Generate Master JSON Backup
  const generateMasterJSON = () => {
    const backupObj = {
      meta: {
        systemName: clubSettings.clubName,
        exportDate: new Date().toISOString(),
        exportedBy: currentUser.name,
        role: currentUser.role,
        version: '2.4.0',
        division: 'Horsebow Exclusive',
      },
      clubSettings,
      athletes,
      sppPayments,
      trainingSessions,
      attendanceRecords,
      registrations,
      newsArticles,
      paymentProofs,
    };
    return JSON.stringify(backupObj, null, 2);
  };

  // 8. Generate Offline Executive HTML Dashboard
  const generateOfflineHTMLReport = () => {
    const totalAthletes = athletes.length;
    const lunasSPP = sppPayments.filter((p) => p.status === 'LUNAS').length;
    const totalSPP = sppPayments.length;
    const totalScoreSessions = trainingSessions.length;

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rekapitulasi Data Terpadu - ${clubSettings.clubName}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 1100px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #be185d, #6d28d9, #1d4ed8); padding: 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    h1 { margin: 0 0 8px 0; font-size: 24px; }
    p { margin: 4px 0; color: #e2e8f0; font-size: 14px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card { background: #1e293b; padding: 18px; border-radius: 12px; border: 1px solid #334155; }
    .card-num { font-size: 28px; font-weight: bold; color: #38bdf8; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #334155; }
    th { background: #334155; color: #f1f5f9; }
    .badge { padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; background: #0284c7; color: white; display: inline-block; }
    .section { background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 20px; margin-bottom: 24px; }
    .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${clubSettings.clubName}</h1>
      <p>Laporan Rekapitulasi Data Terpadu Atlit, SPP, & Hasil Latihan Horsebow</p>
      <p style="font-size: 12px; opacity: 0.85;">Diekspor pada: ${formatDateIndo(todayStr)} | Oleh: ${currentUser.name} (${currentUser.role})</p>
    </div>

    <div class="grid">
      <div class="card">
        <div>Total Atlet Horsebow</div>
        <div class="card-num">${totalAthletes}</div>
        <p>100% Terdaftar Aktif</p>
      </div>
      <div class="card">
        <div>Status SPP Terbayar</div>
        <div class="card-num" style="color: #4ade80;">${lunasSPP} / ${totalSPP}</div>
        <p>Tingkat Kepatuhan ${totalSPP > 0 ? Math.round((lunasSPP / totalSPP) * 100) : 100}%</p>
      </div>
      <div class="card">
        <div>Total Sesi Scoring</div>
        <div class="card-num" style="color: #f472b6;">${totalScoreSessions}</div>
        <p>6 Topik Penilaian Lengkap</p>
      </div>
      <div class="card">
        <div>Total Presensi</div>
        <div class="card-num" style="color: #fbbf24;">${attendanceRecords.length}</div>
        <p>Monitoring Kehadiran Rutin</p>
      </div>
    </div>

    <div class="section">
      <h2 style="font-size: 18px; margin-top: 0;">Daftar Atlet & Peralatan Horsebow</h2>
      <table>
        <thead>
          <tr>
            <th>No Anggota</th>
            <th>Nama Lengkap</th>
            <th>Kategori Usia</th>
            <th>Busur & Draw Weight</th>
            <th>Thumb Ring / Khatra</th>
            <th>Kontak / WA</th>
          </tr>
        </thead>
        <tbody>
          ${athletes
            .map(
              (a) => `
            <tr>
              <td><strong style="color: #38bdf8;">${a.memberNo}</strong></td>
              <td>${a.name}</td>
              <td><span class="badge">${a.ageCategory}</span></td>
              <td>${a.equipment.bowBrand || 'Horsebow'} (${a.equipment.drawWeightLbs || 30} lbs)</td>
              <td>${a.equipment.thumbRingType || 'Ottoman'} / ${a.equipment.khatraStyle || 'Forward'}</td>
              <td>${a.phone || a.parentPhone || '-'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2 style="font-size: 18px; margin-top: 0;">Ringkasan Monitoring Iuran SPP</h2>
      <table>
        <thead>
          <tr>
            <th>Nama Atlet</th>
            <th>Periode Bulan</th>
            <th>Nominal</th>
            <th>Status</th>
            <th>Tgl Bayar / Verifikasi</th>
          </tr>
        </thead>
        <tbody>
          ${sppPayments
            .slice(0, 15)
            .map(
              (p) => `
            <tr>
              <td><strong>${p.athleteName}</strong></td>
              <td>${formatMonthYearIndo(p.monthYear)}</td>
              <td>${formatRupiah(p.amount)}</td>
              <td>
                <span class="badge" style="background: ${p.status === 'LUNAS' ? '#16a34a' : '#dc2626'};">
                  ${p.status}
                </span>
              </td>
              <td>${p.paidDate ? formatDateIndo(p.paidDate) : '-'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p>Sistem Pemantauan SPP & Hasil Latihan Panahan Horsebow • ${clubSettings.clubName} Kota Batu</p>
      <p>File ini dapat dibuka secara offline di Google Chrome, Mozilla Firefox, Microsoft Edge, atau Safari.</p>
    </div>
  </div>
</body>
</html>`;
  };

  // 9. Generate README documentation file
  const generateReadmeTxt = () => {
    return `================================================================================
ARSIP DATA LENGKAP - ${clubSettings.clubName.toUpperCase()}
SISTEM PEMANTAUAN SPP, PRESENSI & HASIL LATIHAN PANAHAN HORSEBOW
================================================================================

Tanggal Ekspor : ${new Date().toLocaleString('id-ID')}
Diekspor Oleh  : ${currentUser.name} (${currentUser.role})
Divisi Busur   : HORSEBOW (Traditional & Horseback Archery)
Versi Sistem   : 2.4.0

DAFTAR ISI FOLDER INI:
--------------------------------------------------------------------------------
1. 01_Data_Atlit_Horsebow.csv
   -> Berisi data lengkap seluruh atlet (biodata, nomor anggota, NIK, alamat, 
      spesifikasi busur, draw weight, kuncian thumb ring, khatra, arrow).

2. 02_Monitoring_SPP_Iuran.csv
   -> Berisi catatan tagihan SPP bulanan, nominal, status lunas/belum, jatuh 
      tempo, metode bayar, dan verifikator.

3. 03_Hasil_Latihan_Scoring_6_Topik.csv
   -> Berisi riwayat scoring 6 topik Horsebow (Latihan Rutin, Persiapan Lomba, 
      HBA, Berkuda, FAST SHOOTING, DYNAMIC), jarak, total poin, dan catatan pelatih.

4. 04_Presensi_Kehadiran_Latihan.csv
   -> Berisi daftar presensi kehadiran sesi latihan, izin, sakit, alpa, dan 
      volume rambu tembakan.

5. 05_Pendaftaran_Calon_Atlit.csv
   -> Berisi data formulir registrasi online calon atlit baru dari portal publik.

6. 06_Berita_Pengumuman.csv
   -> Berisi warta, berita, dan pengumuman resmi klub.

7. DATA_MASTER_SENENG_MANAH.json
   -> File database JSON lengkap. Dapat digunakan untuk Backup dan Restore 
      ulang ke dalam aplikasi web sewaktu-waktu.

8. LAPORAN_REKAPITULASI_KLUB.html
   -> Laporan eksekutif offline yang dapat dibuka langsung di browser manapun 
      tanpa perlu koneksi internet.

CARA MEMBUKA FILE CSV DI EXCEL:
1. Buka Microsoft Excel -> Data -> From Text/CSV -> Pilih file -> Delimiter: Comma (Koma).
2. Atau langsung double-click pada file CSV.

Untuk mengekspor source code aplikasi lengkap dari AI Studio:
- Klik menu titik tiga / Settings di pojok kanan atas AI Studio -> Pilih "Export to ZIP" atau "Export to GitHub".

================================================================================
Dikelola oleh: ${clubSettings.clubName} - Kota Batu, Jawa Timur
================================================================================
`;
  };

  // Main Action: Download ALL in 1 ZIP folder
  const handleDownloadAllZip = async () => {
    setIsZipping(true);
    setDownloadSuccess(false);

    try {
      const zip = new JSZip();

      // Create a subfolder inside zip named e.g. "DATA_SENENG_MANAH_HORSEBOW"
      const folderName = `SENENG_MANAH_DATA_${todayStr}`;
      const folder = zip.folder(folderName) || zip;

      // 1. Add CSV files
      folder.file('01_Data_Atlit_Horsebow.csv', generateAthletesCSV());
      folder.file('02_Monitoring_SPP_Iuran.csv', generateSPPCSV());
      folder.file('03_Hasil_Latihan_Scoring_6_Topik.csv', generateScoringCSV());
      folder.file('04_Presensi_Kehadiran_Latihan.csv', generateAttendanceCSV());
      folder.file('05_Pendaftaran_Calon_Atlit.csv', generateRegistrationsCSV());
      folder.file('06_Berita_Pengumuman.csv', generateNewsCSV());

      // 2. Add JSON Master Backup
      folder.file('DATA_MASTER_SENENG_MANAH.json', generateMasterJSON());

      // 3. Add Offline HTML Dashboard
      folder.file('LAPORAN_REKAPITULASI_KLUB.html', generateOfflineHTMLReport());

      // 4. Add README
      folder.file('BACA_SAYA_PANDUAN.txt', generateReadmeTxt());

      // Generate ZIP blob
      const content = await zip.generateAsync({ type: 'blob' });

      // Trigger download
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SENENG_MANAH_SEMUA_DATA_${todayStr}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to zip files:', err);
      alert('Gagal membuat file ZIP: ' + (err as Error).message);
    } finally {
      setIsZipping(false);
    }
  };

  // Download Individual File helper
  const handleDownloadSingle = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Restore/Import JSON file
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed.athletes && parsed.sppPayments && parsed.trainingSessions) {
          if (onRestoreData) {
            onRestoreData(parsed);
            setImportStatus('Data berhasil dipulihkan dari file backup!');
            setTimeout(() => setImportStatus(null), 3500);
          }
        } else {
          alert('Format file JSON tidak sesuai dengan skema data Seneng Manah.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-pink-500/20 text-white">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Download Semua Data dalam 1 Folder (ZIP)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Unduh seluruh data atlit, rekapitulasi SPP, scoring 6 topik, presensi, dan database backup dalam satu berkas arsip
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Hero: 1-Click ZIP Download */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-950/40 via-purple-950/50 to-blue-950/40 border-2 border-pink-500/40 p-5 sm:p-6 shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>Paket Lengkap 1 Folder ZIP</span>
                </div>
                <h3 className="text-lg font-black text-white">
                  Arsip Komprehensif Seluruh Data Klub
                </h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  Mencakup 6 lembar kerja CSV Excel terpisah, file database Master JSON, laporan eksekutif HTML interaktif, dan panduan dokumentasi.
                </p>
              </div>

              <button
                onClick={handleDownloadAllZip}
                disabled={isZipping}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-pink-500/25 active:scale-95 flex items-center justify-center gap-2.5 shrink-0 disabled:opacity-50"
              >
                {isZipping ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sedang Memaketkan ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download 1 Folder ZIP ({todayStr})</span>
                  </>
                )}
              </button>
            </div>

            {downloadSuccess && (
              <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Berhasil mengunduh berkas ZIP! Silakan ekstrak di komputer / HP Anda untuk membuka seluruh file.</span>
              </div>
            )}
          </div>

          {/* Isi Berkas dalam Folder ZIP */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Rincian File yang Termasuk dalam Folder ZIP:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between hover:border-slate-700 transition">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-slate-200">01_Data_Atlit_Horsebow.csv</div>
                    <div className="text-[10px] text-slate-400">{athletes.length} atlet terdaftar</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadSingle('01_Data_Atlit_Horsebow.csv', generateAthletesCSV(), 'text/csv;charset=utf-8;')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Unduh file ini saja"
                >
                  <FileDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between hover:border-slate-700 transition">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileSpreadsheet className="w-4 h-4 text-pink-400 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-slate-200">02_Monitoring_SPP_Iuran.csv</div>
                    <div className="text-[10px] text-slate-400">{sppPayments.length} riwayat tagihan</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadSingle('02_Monitoring_SPP_Iuran.csv', generateSPPCSV(), 'text/csv;charset=utf-8;')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Unduh file ini saja"
                >
                  <FileDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between hover:border-slate-700 transition">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileSpreadsheet className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-slate-200">03_Hasil_Latihan_Scoring.csv</div>
                    <div className="text-[10px] text-slate-400">{trainingSessions.length} sesi 6 topik</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadSingle('03_Hasil_Latihan_Scoring.csv', generateScoringCSV(), 'text/csv;charset=utf-8;')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Unduh file ini saja"
                >
                  <FileDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between hover:border-slate-700 transition">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileSpreadsheet className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-slate-200">04_Presensi_Kehadiran.csv</div>
                    <div className="text-[10px] text-slate-400">{attendanceRecords.length} presensi atlit</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadSingle('04_Presensi_Kehadiran.csv', generateAttendanceCSV(), 'text/csv;charset=utf-8;')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Unduh file ini saja"
                >
                  <FileDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between hover:border-slate-700 transition">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileCode className="w-4 h-4 text-purple-400 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-slate-200">DATA_MASTER_BACKUP.json</div>
                    <div className="text-[10px] text-slate-400">Database lengkap (Full Schema)</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadSingle(`DATA_MASTER_SENENG_MANAH_${todayStr}.json`, generateMasterJSON(), 'application/json')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Unduh JSON Backup"
                >
                  <FileDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between hover:border-slate-700 transition">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-slate-200">LAPORAN_REKAPITULASI.html</div>
                    <div className="text-[10px] text-slate-400">Dashboard Offline Browser</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadSingle('LAPORAN_REKAPITULASI_KLUB.html', generateOfflineHTMLReport(), 'text/html')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Unduh HTML Report"
                >
                  <FileDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Backup & Restore Database Section */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Cadangkan / Pulihkan Database (Backup & Restore)</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                JSON Standard
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Anda dapat mencadangkan seluruh konfigurasi sistem, data atlit, riwayat pembayaran SPP, dan scoring untuk dipindahkan ke komputer lain atau disimpan sebagai arsip tahunan.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <label className="w-full sm:w-auto flex-1 cursor-pointer">
                <div className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition">
                  <UploadCloud className="w-4 h-4 text-sky-400" />
                  <span>Pulihkan / Import dari File JSON Backup</span>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => handleDownloadSingle(`DATA_MASTER_SENENG_MANAH_${todayStr}.json`, generateMasterJSON(), 'application/json')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Simpan File JSON Backup</span>
              </button>
            </div>

            {importStatus && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{importStatus}</span>
              </div>
            )}
          </div>

          {/* Export Source Code Proyek Direct Download Section (Khusus Super Admin) */}
          {currentUser.role === 'super_admin' && (
            <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 rounded-2xl border-2 border-purple-500/40 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 shrink-0">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <span>Download Source Code Proyek (ZIP Lengkap)</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                        Khusus Super Admin
                      </span>
                    </h4>
                    <p className="text-xs text-slate-300">
                      Unduh seluruh file kode sumber aplikasi (React, TypeScript, Vite, Tailwind, Server) dalam 1 berkas ZIP siap pakai.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownloadSourceZip}
                  disabled={isDownloadingSource}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-2 shrink-0 border border-purple-400/40 disabled:opacity-50"
                >
                  {isDownloadingSource ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mengunduh ZIP...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Unduh ZIP Source Code</span>
                    </>
                  )}
                </button>
              </div>

              {sourceDownloadSuccess && (
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Berhasil mengunduh berkas ZIP Source Code! Berkas siap diupload ke Vercel.</span>
                </div>
              )}

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Hak Akses Super Admin:</strong> Anda juga dapat mengklik menu titik tiga <strong>(⋮) / Settings</strong> di pojok kanan atas layar AI Studio &rarr; Pilih <strong>"Export to ZIP"</strong> atau <strong>"Export to GitHub"</strong>.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400" />
            <span>Format arsip ZIP kompatibel dengan Windows, Mac, Linux, Android, dan iOS.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
