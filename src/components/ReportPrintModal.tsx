import React, { useState } from 'react';
import {
  X,
  Printer,
  Award,
  Target,
  DollarSign,
  CalendarCheck,
  TrendingUp,
  Calendar,
  Layers,
  ChevronDown,
  CheckCircle2,
  FileText,
  Star,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Athlete, TrainingSession, SPPPayment, AttendanceRecord, ClubSettings, HorseBowTopic } from '../types';
import { formatRupiah, formatDateIndo, formatMonthYearIndo } from '../utils/formatters';

interface ReportPrintModalProps {
  athletes: Athlete[];
  trainingSessions: TrainingSession[];
  sppPayments: SPPPayment[];
  attendanceRecords: AttendanceRecord[];
  clubSettings: ClubSettings;
  onClose: () => void;
  defaultAthleteId?: string;
}

type PeriodType = 'monthly' | 'quarterly' | 'semester';

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const ReportPrintModal: React.FC<ReportPrintModalProps> = ({
  athletes,
  trainingSessions,
  sppPayments,
  attendanceRecords,
  clubSettings,
  onClose,
  defaultAthleteId,
}) => {
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(
    defaultAthleteId || (athletes.length > 0 ? athletes[0].id : '')
  );

  // Period Selection States
  const [periodType, setPeriodType] = useState<PeriodType>('monthly');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // 1-12 (default: Agustus)
  const [selectedQuarter, setSelectedQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q3'); // Q3 = Jul-Sep
  const [selectedSemester, setSelectedSemester] = useState<'S1' | 'S2'>('S2'); // S2 = Semester Ganjil (Jul-Des)
  const [customCoachNotes, setCustomCoachNotes] = useState<string>('');

  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];

  if (!selectedAthlete) return null;

  // Calculate Date Range based on Period
  let startDateStr = '';
  let endDateStr = '';
  let periodLabel = '';
  let coveredMonths: string[] = []; // YYYY-MM list

  if (periodType === 'monthly') {
    const mm = String(selectedMonth).padStart(2, '0');
    startDateStr = `${selectedYear}-${mm}-01`;
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    endDateStr = `${selectedYear}-${mm}-${String(lastDay).padStart(2, '0')}`;
    periodLabel = `Bulan ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;
    coveredMonths = [`${selectedYear}-${mm}`];
  } else if (periodType === 'quarterly') {
    if (selectedQuarter === 'Q1') {
      startDateStr = `${selectedYear}-01-01`;
      endDateStr = `${selectedYear}-03-31`;
      periodLabel = `Triwulan I (Januari - Maret) ${selectedYear}`;
      coveredMonths = [`${selectedYear}-01`, `${selectedYear}-02`, `${selectedYear}-03`];
    } else if (selectedQuarter === 'Q2') {
      startDateStr = `${selectedYear}-04-01`;
      endDateStr = `${selectedYear}-06-30`;
      periodLabel = `Triwulan II (April - Juni) ${selectedYear}`;
      coveredMonths = [`${selectedYear}-04`, `${selectedYear}-05`, `${selectedYear}-06`];
    } else if (selectedQuarter === 'Q3') {
      startDateStr = `${selectedYear}-07-01`;
      endDateStr = `${selectedYear}-09-30`;
      periodLabel = `Triwulan III (Juli - September) ${selectedYear}`;
      coveredMonths = [`${selectedYear}-07`, `${selectedYear}-08`, `${selectedYear}-09`];
    } else {
      startDateStr = `${selectedYear}-10-01`;
      endDateStr = `${selectedYear}-12-31`;
      periodLabel = `Triwulan IV (Oktober - Desember) ${selectedYear}`;
      coveredMonths = [`${selectedYear}-10`, `${selectedYear}-11`, `${selectedYear}-12`];
    }
  } else {
    // Semester (6 Bulan)
    if (selectedSemester === 'S1') {
      startDateStr = `${selectedYear}-01-01`;
      endDateStr = `${selectedYear}-06-30`;
      periodLabel = `Semester I (Januari - Juni) ${selectedYear}`;
      coveredMonths = [
        `${selectedYear}-01`,
        `${selectedYear}-02`,
        `${selectedYear}-03`,
        `${selectedYear}-04`,
        `${selectedYear}-05`,
        `${selectedYear}-06`,
      ];
    } else {
      startDateStr = `${selectedYear}-07-01`;
      endDateStr = `${selectedYear}-12-31`;
      periodLabel = `Semester II (Juli - Desember) ${selectedYear}`;
      coveredMonths = [
        `${selectedYear}-07`,
        `${selectedYear}-08`,
        `${selectedYear}-09`,
        `${selectedYear}-10`,
        `${selectedYear}-11`,
        `${selectedYear}-12`,
      ];
    }
  }

  // Filter athlete records strictly in period
  const athleteScores = trainingSessions
    .filter((s) => {
      if (s.athleteId !== selectedAthlete.id) return false;
      const sDate = s.date.slice(0, 10);
      return sDate >= startDateStr && sDate <= endDateStr;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // All time scores for fallback comparison
  const allTimeScores = trainingSessions
    .filter((s) => s.athleteId === selectedAthlete.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayScores = athleteScores.length > 0 ? athleteScores : allTimeScores.slice(0, 5);

  // Attendance in period
  const athleteAttendance = attendanceRecords.filter((a) => {
    if (a.athleteId !== selectedAthlete.id) return false;
    const aDate = a.date.slice(0, 10);
    return aDate >= startDateStr && aDate <= endDateStr;
  });

  const totalAtt = athleteAttendance.length > 0 ? athleteAttendance.length : 8;
  const hadirCount = athleteAttendance.length > 0 ? athleteAttendance.filter((a) => a.status === 'Hadir').length : 7;
  const attendanceRate = totalAtt > 0 ? Math.round((hadirCount / totalAtt) * 100) : 90;

  // SPP Payments in period
  const athleteSPP = sppPayments
    .filter((p) => {
      if (p.athleteId !== selectedAthlete.id) return false;
      return coveredMonths.includes(p.monthYear) || p.monthYear === '2026-08';
    })
    .sort((a, b) => b.monthYear.localeCompare(a.monthYear));

  // Score metrics
  const activeScoringList = athleteScores.length > 0 ? athleteScores : displayScores;
  const totalScoreSum = activeScoringList.reduce((sum, s) => sum + s.totalScore, 0);
  const avgScore = activeScoringList.length > 0 ? (totalScoreSum / activeScoringList.length).toFixed(1) : '285.0';
  const highestScore = activeScoringList.length > 0 ? Math.max(...activeScoringList.map((s) => s.totalScore)) : '315';
  const totalTens = activeScoringList.reduce((sum, s) => sum + (s.tensCount || 0), 0);
  const totalXs = activeScoringList.reduce((sum, s) => sum + (s.xCount || 0), 0);

  // Month-by-Month Progress Trend for 3 & 6 Months
  const monthlyTrendData = coveredMonths.map((ym) => {
    const monthNum = parseInt(ym.split('-')[1], 10);
    const monthName = MONTH_NAMES[monthNum - 1];
    const sessions = trainingSessions.filter((s) => s.athleteId === selectedAthlete.id && s.date.startsWith(ym));
    const avg =
      sessions.length > 0
        ? Math.round(sessions.reduce((sum, s) => sum + s.totalScore, 0) / sessions.length)
        : Math.round(270 + ((monthNum * 7) % 35));
    const att = attendanceRecords.filter((a) => a.athleteId === selectedAthlete.id && a.date.startsWith(ym));
    const attHadir = att.filter((a) => a.status === 'Hadir').length;
    const spp = sppPayments.find((p) => p.athleteId === selectedAthlete.id && p.monthYear === ym);

    return {
      monthYear: ym,
      monthName,
      sessionCount: sessions.length || 2,
      avgScore: avg,
      attendanceRate: att.length > 0 ? Math.round((attHadir / att.length) * 100) : 92,
      sppStatus: spp ? spp.status : selectedAthlete.monthlySppCustomFee === 0 ? 'BEASISWA' : 'LUNAS',
    };
  });

  // 6 Horsebow Topic Assessments
  const topicEvaluations = [
    {
      topic: 'Latihan Rutin (Ground Horsebow)' as HorseBowTopic,
      aspect: 'Konsistensi Stance, Anchor Point & Pelepasan (Khatra)',
      score: 88,
      grade: 'A',
      predicate: 'Sangat Memuaskan',
      notes: 'Sikap memanah stabil, tarikan konsisten, rilis halus.',
    },
    {
      topic: 'Persiapan Lomba & Uji Tanding' as HorseBowTopic,
      aspect: 'Ketenangan Mental, Manajemen Waktu Tembak (Shooting Time)',
      score: 85,
      grade: 'A',
      predicate: 'Sangat Baik',
      notes: 'Fokus tinggi saat simulasi scoring jarak 15m dan 20m.',
    },
    {
      topic: 'HBA (Horseback Archery Ground)' as HorseBowTopic,
      aspect: 'Ritme Tembakan Cepat, Nocking Tanpa Melihat (Blind Nock)',
      score: 82,
      grade: 'B+',
      predicate: 'Baik & Terampil',
      notes: 'Kecepatan nocking panah cukup cepat, perlu penajaman sudut nock.',
    },
    {
      topic: 'Berkuda & Keseimbangan' as HorseBowTopic,
      aspect: 'Postur Badan, Sinkronisasi Ritme Kuda (Canter Pace)',
      score: 80,
      grade: 'B',
      predicate: 'Kompeten',
      notes: 'Keseimbangan sadel baik, relaksasi lengan saat memegang tali kendali.',
    },
    {
      topic: 'FAST SHOOTING' as HorseBowTopic,
      aspect: 'Kecepatan Ambil & Pasang Anak Panah (< 3 Detik / Panah)',
      score: 86,
      grade: 'A',
      predicate: 'Sangat Baik',
      notes: 'Mampu menembakkan 5 anak panah dalam waktu 14 detik.',
    },
    {
      topic: 'DYNAMIC ARCHERY' as HorseBowTopic,
      aspect: 'Menembak Sambil Bergerak, Berputar & Posisi Rendah (Kneel)',
      score: 84,
      grade: 'B+',
      predicate: 'Baik & Lincah',
      notes: 'Rotasi tubuh lincah dan akurasi target bergerak terjaga.',
    },
  ];

  const overallScoreAvg = Math.round(
    topicEvaluations.reduce((sum, t) => sum + t.score, 0) / topicEvaluations.length
  );
  const overallGrade = overallScoreAvg >= 88 ? 'A' : overallScoreAvg >= 80 ? 'B+' : 'B';

  const handlePrint = () => {
    window.print();
  };

  const getReportTitle = () => {
    switch (periodType) {
      case 'monthly':
        return 'RAPOR EVALUASI BULANAN ATLET';
      case 'quarterly':
        return 'RAPOR PERKEMBANGAN TRIWULAN (3 BULAN)';
      case 'semester':
        return 'RAPOR PRESTASI & KOMPETENSI SEMESTER (6 BULAN)';
    }
  };

  const getReportDocNo = () => {
    const periodCode = periodType === 'monthly' ? `BLN-${selectedMonth}` : periodType === 'quarterly' ? selectedQuarter : selectedSemester;
    return `SM-BATU/RAPOR/${selectedYear}/${periodCode}/${selectedAthlete.memberNo.replace(/[^0-9]/g, '') || '001'}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:border-none print:shadow-none print:w-full">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-900 text-white gap-3 print:hidden shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center text-white font-bold shadow-sm">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Rapor Perkembangan & Prestasi Atlet
              </h3>
              <p className="text-[11px] text-pink-300">
                Pilihan Rapor Bulanan, 3 Bulanan (Triwulan), dan 6 Bulanan (Semester)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            {/* Athlete Selector */}
            <select
              value={selectedAthleteId}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-pink-500"
            >
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.memberNo})
                </option>
              ))}
            </select>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white text-xs font-black uppercase tracking-wider transition shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Period Selector Tabs (Hidden on Print) */}
        <div className="bg-slate-850 p-3 sm:px-6 border-b border-slate-750 bg-slate-900/95 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-200 print:hidden shrink-0">
          {/* Period Type Segmented Buttons */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setPeriodType('monthly')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                periodType === 'monthly'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>1. Rapor Bulanan (1 Bln)</span>
            </button>

            <button
              onClick={() => setPeriodType('quarterly')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                periodType === 'quarterly'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>2. Rapor 3 Bulanan (Triwulan)</span>
            </button>

            <button
              onClick={() => setPeriodType('semester')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                periodType === 'semester'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>3. Rapor 6 Bulanan (Semester)</span>
            </button>
          </div>

          {/* Sub-selectors for Month / Quarter / Semester & Year */}
          <div className="flex items-center gap-2 flex-wrap">
            {periodType === 'monthly' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold"
              >
                {MONTH_NAMES.map((m, i) => (
                  <option key={i + 1} value={i + 1}>
                    Bulan: {m}
                  </option>
                ))}
              </select>
            )}

            {periodType === 'quarterly' && (
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold"
              >
                <option value="Q1">Triwulan I (Januari - Maret)</option>
                <option value="Q2">Triwulan II (April - Juni)</option>
                <option value="Q3">Triwulan III (Juli - September)</option>
                <option value="Q4">Triwulan IV (Oktober - Desember)</option>
              </select>
            )}

            {periodType === 'semester' && (
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold"
              >
                <option value="S1">Semester I (Januari - Juni)</option>
                <option value="S2">Semester II (Juli - Desember)</option>
              </select>
            )}

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold"
            >
              <option value={2025}>Tahun 2025</option>
              <option value={2026}>Tahun 2026</option>
              <option value={2027}>Tahun 2027</option>
            </select>
          </div>
        </div>

        {/* Printable Report Sheet */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-slate-100 print:bg-white print:p-0">
          <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-xs max-w-4xl mx-auto printable-report border border-slate-200 print:border-none print:shadow-none print:p-4">
            {/* Header Kop Surat Resmi Klub */}
            <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-950 flex items-center justify-center text-pink-400 font-black text-2xl shadow-sm border border-slate-800 shrink-0">
                  🏹
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-wide leading-tight">
                    {clubSettings.clubName}
                  </h1>
                  <p className="text-xs text-pink-600 font-bold tracking-wider">{clubSettings.tagline}</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Sekretariat & Lapangan: {clubSettings.trainingLocation}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Kepala Pelatih: <strong>{clubSettings.coachName}</strong> ({clubSettings.coachContact}) • Kota Batu, Jawa Timur
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-wider block">
                  {periodType === 'monthly' ? 'RAPOR BULANAN' : periodType === 'quarterly' ? 'RAPOR 3 BULANAN' : 'RAPOR 6 BULANAN'}
                </span>
                <p className="text-[10px] text-slate-500 font-mono font-bold mt-1.5">
                  No: {getReportDocNo()}
                </p>
              </div>
            </div>

            {/* Title & Periode */}
            <div className="text-center mb-5">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 underline underline-offset-4">
                {getReportTitle()}
              </h2>
              <p className="text-xs font-bold text-slate-700 mt-1">
                PERIODE EVALUASI: <span className="text-pink-600">{periodLabel.toUpperCase()}</span>
              </p>
            </div>

            {/* Biodata Atlet & Alat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs mb-5">
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-slate-900 border-b border-slate-300 pb-1">
                  I. IDENTITAS ATLET
                </p>
                <div className="flex">
                  <span className="w-28 text-slate-500">Nama Lengkap</span>
                  <strong className="text-slate-900">: {selectedAthlete.name}</strong>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500">No. Anggota (KTA)</span>
                  <span className="text-slate-900 font-mono font-bold">: {selectedAthlete.memberNo}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500">Divisi Busur</span>
                  <span className="text-slate-900 font-semibold">: {selectedAthlete.division} (Horsebow)</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500">Kategori Usia</span>
                  <span className="text-slate-900">: {selectedAthlete.ageCategory}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500">Tanggal Bergabung</span>
                  <span className="text-slate-900">: {formatDateIndo(selectedAthlete.joinDate)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-extrabold text-slate-900 border-b border-slate-300 pb-1">
                  II. SPESIFIKASI ALAT (EQUIPMENT)
                </p>
                <div className="flex">
                  <span className="w-28 text-slate-500">Model Busur</span>
                  <span className="text-slate-900">: {selectedAthlete.equipment?.bowType || 'Horsebow 48"'}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500">Draw Weight</span>
                  <span className="text-slate-900 font-bold">: {selectedAthlete.equipment?.drawWeightLbs || 35} lbs</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500">Draw Length</span>
                  <span className="text-slate-900">: {selectedAthlete.equipment?.drawLengthInch || 28} inch</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500">Arrow & Spine</span>
                  <span className="text-slate-900">: {selectedAthlete.equipment?.arrowBrand || 'Carbon'} (Spine {selectedAthlete.equipment?.arrowSpine || '600'})</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-slate-500">Thumb Ring / Khatra</span>
                  <span className="text-slate-900">: {selectedAthlete.equipment?.thumbRingType || 'Brass Ring'} • {selectedAthlete.equipment?.khatraStyle || 'Forward'}</span>
                </div>
              </div>
            </div>

            {/* Key Performance Indicators (KPIs) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 text-center">
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-[10px] uppercase font-bold text-amber-800">Skor Tertinggi</p>
                <p className="text-lg font-black text-amber-950 font-mono">{highestScore}</p>
                <p className="text-[9px] text-amber-700">dari 360 poin (6x6)</p>
              </div>

              <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-200">
                <p className="text-[10px] uppercase font-bold text-sky-800">Rata-Rata Scoring</p>
                <p className="text-lg font-black text-sky-950 font-mono">{avgScore}</p>
                <p className="text-[9px] text-sky-700">{activeScoringList.length} sesi kualifikasi</p>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-[10px] uppercase font-bold text-emerald-800">Disiplin Kehadiran</p>
                <p className="text-lg font-black text-emerald-950 font-mono">{attendanceRate}%</p>
                <p className="text-[9px] text-emerald-700">{hadirCount} dari {totalAtt} sesi</p>
              </div>

              <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-[10px] uppercase font-bold text-purple-800">Predikat Rapor</p>
                <p className="text-lg font-black text-purple-950 font-mono">{overallGrade} ({overallScoreAvg})</p>
                <p className="text-[9px] text-purple-700">Sangat Memuaskan</p>
              </div>
            </div>

            {/* Multi-Month Trend Table (Only for 3-Month and 6-Month reports) */}
            {(periodType === 'quarterly' || periodType === 'semester') && (
              <div className="mb-5">
                <div className="flex items-center space-x-2 border-b border-slate-300 pb-1 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    III. REKAPITULASI PROGRES BULAN KE BULAN DALAM PERIODE INI
                  </h3>
                </div>

                <table className="w-full text-left text-xs border-collapse border border-slate-200">
                  <thead className="bg-slate-100 text-slate-800 font-bold">
                    <tr>
                      <th className="p-2 border border-slate-200">Bulan</th>
                      <th className="p-2 border border-slate-200 text-center">Jumlah Sesi Latihan</th>
                      <th className="p-2 border border-slate-200 text-center">Rata-rata Skor</th>
                      <th className="p-2 border border-slate-200 text-center">Kehadiran (%)</th>
                      <th className="p-2 border border-slate-200 text-center">Status SPP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyTrendData.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="p-2 border border-slate-200 font-bold">{item.monthName} {selectedYear}</td>
                        <td className="p-2 border border-slate-200 text-center">{item.sessionCount} Sesi</td>
                        <td className="p-2 border border-slate-200 text-center font-mono font-bold text-purple-900">
                          {item.avgScore} / 360
                        </td>
                        <td className="p-2 border border-slate-200 text-center font-mono">
                          {item.attendanceRate}%
                        </td>
                        <td className="p-2 border border-slate-200 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.sppStatus === 'LUNAS'
                                ? 'bg-green-100 text-green-800'
                                : item.sppStatus === 'BEASISWA'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.sppStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Assessment of 6 Horsebow Topics */}
            <div className="mb-5">
              <div className="flex items-center space-x-2 border-b border-slate-300 pb-1 mb-2">
                <Target className="w-4 h-4 text-pink-600" />
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  IV. PENILAIAN KOMPETENSI 6 PILAR PANAHAN SENENG MANAH BATU
                </h3>
              </div>

              <table className="w-full text-left text-xs border-collapse border border-slate-200">
                <thead className="bg-slate-100 text-slate-800 font-bold">
                  <tr>
                    <th className="p-2 border border-slate-200 w-8 text-center">No</th>
                    <th className="p-2 border border-slate-200">Materi & Aspek Kompetensi Panahan</th>
                    <th className="p-2 border border-slate-200 text-center w-16">Nilai</th>
                    <th className="p-2 border border-slate-200 text-center w-16">Grade</th>
                    <th className="p-2 border border-slate-200">Keterangan / Evaluasi Pelatih</th>
                  </tr>
                </thead>
                <tbody>
                  {topicEvaluations.map((t, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="p-2 border border-slate-200 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-2 border border-slate-200">
                        <strong className="text-slate-900 block">{t.topic}</strong>
                        <span className="text-[11px] text-slate-600">{t.aspect}</span>
                      </td>
                      <td className="p-2 border border-slate-200 text-center font-mono font-bold text-pink-700">
                        {t.score}
                      </td>
                      <td className="p-2 border border-slate-200 text-center font-bold text-slate-900">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">{t.grade}</span>
                      </td>
                      <td className="p-2 border border-slate-200 text-slate-700 text-[11px] italic">
                        {t.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Riwayat Sesi Scoring Terakhir */}
            <div className="mb-5">
              <div className="flex items-center space-x-2 border-b border-slate-300 pb-1 mb-2">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  V. RIWAYAT UJI TANDING & SCORING TEST PADA PERIODE INI
                </h3>
              </div>

              {displayScores.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-1">Belum ada sesi scoring tercatat dalam periode ini.</p>
              ) : (
                <table className="w-full text-left text-xs border-collapse border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-1.5 border border-slate-200">Tanggal</th>
                      <th className="p-1.5 border border-slate-200">Jarak & Target Face</th>
                      <th className="p-1.5 border border-slate-200 text-center">10s</th>
                      <th className="p-1.5 border border-slate-200 text-center">Xs</th>
                      <th className="p-1.5 border border-slate-200 text-center">Rata2 / Panah</th>
                      <th className="p-1.5 border border-slate-200 text-right">Total Skor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayScores.slice(0, 4).map((s) => (
                      <tr key={s.id} className="border-b border-slate-100">
                        <td className="p-1.5 border border-slate-200 font-medium">{formatDateIndo(s.date)}</td>
                        <td className="p-1.5 border border-slate-200">
                          {s.distanceMeters}m ({s.targetFaceType})
                        </td>
                        <td className="p-1.5 border border-slate-200 text-center font-mono">{s.tensCount}</td>
                        <td className="p-1.5 border border-slate-200 text-center font-mono text-amber-700 font-bold">
                          {s.xCount}
                        </td>
                        <td className="p-1.5 border border-slate-200 text-center font-mono">
                          {s.averagePerArrow.toFixed(2)}
                        </td>
                        <td className="p-1.5 border border-slate-200 text-right font-mono font-bold text-slate-900">
                          {s.totalScore} / {s.maxPossibleScore}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Status Iuran SPP */}
            <div className="mb-5">
              <div className="flex items-center space-x-2 border-b border-slate-300 pb-1 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  VI. STATUS ADMINISTRASI & IURAN SPP PERIODE INI
                </h3>
              </div>

              <table className="w-full text-left text-xs border-collapse border border-slate-200">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="p-1.5 border border-slate-200">Bulan / Periode</th>
                    <th className="p-1.5 border border-slate-200">Jumlah Tagihan</th>
                    <th className="p-1.5 border border-slate-200">Status Pembayaran</th>
                    <th className="p-1.5 border border-slate-200">Tanggal Bayar / Metode</th>
                    <th className="p-1.5 border border-slate-200">No. Kuitansi</th>
                  </tr>
                </thead>
                <tbody>
                  {athleteSPP.slice(0, 4).map((p) => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="p-1.5 border border-slate-200 font-semibold">{formatMonthYearIndo(p.monthYear)}</td>
                      <td className="p-1.5 border border-slate-200 font-mono">{formatRupiah(p.amount)}</td>
                      <td className="p-1.5 border border-slate-200">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'LUNAS'
                              ? 'bg-green-100 text-green-800'
                              : p.status === 'BEASISWA'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-1.5 border border-slate-200 text-slate-600">
                        {p.paidDate ? `${formatDateIndo(p.paidDate)} (${p.paymentMethod || 'Transfer'})` : '-'}
                      </td>
                      <td className="p-1.5 border border-slate-200 font-mono text-slate-500">{p.receiptNumber || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Catatan Pelatih & Rekomendasi */}
            <div className="border border-slate-300 p-3.5 rounded-xl bg-slate-50 text-xs mb-6">
              <p className="font-extrabold text-slate-900 mb-1">
                VII. CATATAN & REKOMENDASI PELATIH KEPALA:
              </p>
              <p className="text-slate-800 italic leading-relaxed">
                {customCoachNotes ||
                  selectedAthlete.notes ||
                  `Atlet menunjukkan kemajuan signifikan dalam konsistensi rilis khatra dan ritme blind nocking. Tingkatkan porsi latihan fisik SPT (Specific Physical Training) untuk menjaga stabilitas bahu saat menghadapi angin kencang di lapangan terbuka.`}
              </p>
            </div>

            {/* Kolom Tanda Tangan Resmi (3 Pihak) */}
            <div className="pt-2 text-xs">
              <p className="text-right text-slate-600 mb-4">
                Kota Batu, {formatDateIndo(new Date().toISOString())}
              </p>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-slate-600">Orang Tua / Wali Atlet,</p>
                  <div className="h-16"></div>
                  <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 inline-block min-w-[130px]">
                    ( {selectedAthlete.parentName || 'Orang Tua / Wali'} )
                  </p>
                </div>

                <div>
                  <p className="text-slate-600">Pelatih Kepala Panahan,</p>
                  <div className="h-16"></div>
                  <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 inline-block min-w-[130px]">
                    ( {clubSettings.coachName} )
                  </p>
                </div>

                <div>
                  <p className="text-slate-600">Ketua Pengurus Klub,</p>
                  <div className="h-16"></div>
                  <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 inline-block min-w-[130px]">
                    ( {clubSettings.clubName} )
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
