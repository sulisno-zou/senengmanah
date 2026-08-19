import React, { useState, useMemo, useEffect } from 'react';
import {
  Award,
  Calendar,
  Filter,
  Printer,
  Download,
  Save,
  CheckCircle2,
  TrendingUp,
  Target,
  User,
  Shield,
  Layers,
  Sparkles,
  Flame,
  Activity,
  Edit3,
  Clock,
  ChevronRight,
  Info,
  Sliders,
  Compass,
  Zap,
  CheckSquare,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import {
  Athlete,
  TrainingSession,
  AttendanceRecord,
  ClubSettings,
  UserAccount,
  AthleteProgressEvaluation,
  TopicScoreItem,
  HorseBowTopic,
} from '../types';
import { formatDateIndo, formatMonthYearIndo } from '../utils/formatters';

interface AthleteProgressReportsViewProps {
  athletes: Athlete[];
  trainingSessions: TrainingSession[];
  attendanceRecords: AttendanceRecord[];
  savedEvaluations: AthleteProgressEvaluation[];
  clubSettings: ClubSettings;
  currentUser: UserAccount;
  onSaveEvaluation: (evaluation: AthleteProgressEvaluation) => void;
}

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export const AthleteProgressReportsView: React.FC<AthleteProgressReportsViewProps> = ({
  athletes,
  trainingSessions,
  attendanceRecords,
  savedEvaluations,
  clubSettings,
  currentUser,
  onSaveEvaluation,
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const isAdmin = currentUser.role === 'admin';
  const isPelatih =
    currentUser.role === 'pelatih' ||
    currentUser.role === 'pelatih_utama' ||
    currentUser.role === 'pelatih_atlit';
  const canEditEvaluation = isSuperAdmin || isAdmin || isPelatih;

  // Selected Athlete
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(
    athletes[0]?.id || ''
  );

  // Period Selection States
  const [periodType, setPeriodType] = useState<PeriodType>('monthly');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // August
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [customStartDate, setCustomStartDate] = useState<string>('2026-08-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-08-31');

  // Active athlete object
  const activeAthlete = useMemo(() => {
    return athletes.find((a) => a.id === selectedAthleteId) || athletes[0];
  }, [athletes, selectedAthleteId]);

  // Compute Active Date Range
  const { startDateStr, endDateStr, periodTitle } = useMemo(() => {
    if (periodType === 'daily') {
      return {
        startDateStr: selectedDate,
        endDateStr: selectedDate,
        periodTitle: `Harian: ${formatDateIndo(selectedDate)}`,
      };
    }
    if (periodType === 'weekly') {
      const cur = new Date(selectedDate);
      const start = new Date(cur);
      start.setDate(cur.getDate() - 6);
      const sStr = start.toISOString().slice(0, 10);
      const eStr = cur.toISOString().slice(0, 10);
      return {
        startDateStr: sStr,
        endDateStr: eStr,
        periodTitle: `Mingguan: ${formatDateIndo(sStr)} s.d. ${formatDateIndo(eStr)}`,
      };
    }
    if (periodType === 'monthly') {
      const mm = String(selectedMonth).padStart(2, '0');
      const sStr = `${selectedYear}-${mm}-01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const eStr = `${selectedYear}-${mm}-${String(lastDay).padStart(2, '0')}`;
      const mNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return {
        startDateStr: sStr,
        endDateStr: eStr,
        periodTitle: `Bulanan: ${mNames[selectedMonth - 1]} ${selectedYear}`,
      };
    }
    if (periodType === 'yearly') {
      return {
        startDateStr: `${selectedYear}-01-01`,
        endDateStr: `${selectedYear}-12-31`,
        periodTitle: `Tahunan: Tahun ${selectedYear}`,
      };
    }
    return {
      startDateStr: customStartDate,
      endDateStr: customEndDate,
      periodTitle: `Rentang: ${formatDateIndo(customStartDate)} s.d. ${formatDateIndo(customEndDate)}`,
    };
  }, [periodType, selectedDate, selectedMonth, selectedYear, customStartDate, customEndDate]);

  // Filter Training Sessions for this athlete in date range
  const athleteSessions = useMemo(() => {
    if (!activeAthlete) return [];
    return trainingSessions
      .filter((s) => s.athleteId === activeAthlete.id && s.date >= startDateStr && s.date <= endDateStr)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [trainingSessions, activeAthlete, startDateStr, endDateStr]);

  // Filter Attendance for this athlete in date range
  const athleteAttendances = useMemo(() => {
    if (!activeAthlete) return [];
    return attendanceRecords.filter(
      (a) => a.athleteId === activeAthlete.id && a.date >= startDateStr && a.date <= endDateStr
    );
  }, [attendanceRecords, activeAthlete, startDateStr, endDateStr]);

  // Auto-calculated Metrics
  const totalArrowsShot = useMemo(() => {
    return athleteSessions.reduce((sum, s) => sum + (s.arrowsShotCount || 36), 0);
  }, [athleteSessions]);

  const highestScore = useMemo(() => {
    if (athleteSessions.length === 0) return 0;
    return Math.max(...athleteSessions.map((s) => s.totalScore || 0));
  }, [athleteSessions]);

  const averageScore = useMemo(() => {
    if (athleteSessions.length === 0) return 0;
    const total = athleteSessions.reduce((sum, s) => sum + (s.totalScore || 0), 0);
    return Math.round(total / athleteSessions.length);
  }, [athleteSessions]);

  const attendanceCount = useMemo(() => {
    return athleteAttendances.filter((a) => a.status === 'Hadir').length;
  }, [athleteAttendances]);

  const attendancePercent = useMemo(() => {
    const total = athleteAttendances.length;
    if (total === 0) return 100;
    return Math.round((attendanceCount / total) * 100);
  }, [attendanceCount, athleteAttendances]);

  // Check if there is an existing saved evaluation for this athlete & period
  const existingEval = useMemo(() => {
    if (!activeAthlete) return null;
    return savedEvaluations.find(
      (e) =>
        e.athleteId === activeAthlete.id &&
        e.periodType === periodType &&
        e.startDate === startDateStr &&
        e.endDate === endDateStr
    );
  }, [savedEvaluations, activeAthlete, periodType, startDateStr, endDateStr]);

  // Editable Form States (Set by Coach/Admin/SuperAdmin)
  const defaultTopicScores: TopicScoreItem[] = [
    {
      topic: 'Latihan Rutin',
      aspect: 'Form Dasar, Anchor, & Rilis Thumb Draw',
      score: 88,
      grade: 'A',
      notes: 'Teknik rilis stabil dan tarikan konsisten.',
    },
    {
      topic: 'Persiapan Lomba',
      aspect: 'Simulasi Kejuaraan & Scoring Target 20m/30m',
      score: 85,
      grade: 'A',
      notes: 'Konsentrasi tinggi, grouping arrow rapat di area kuning (gold).',
    },
    {
      topic: 'HBA',
      aspect: 'Horseback Archery Ground Track (Korean & Qabaq)',
      score: 82,
      grade: 'B+',
      notes: 'Kecepatan nocking panah cukup baik, sudut bidik vertikal presisi.',
    },
    {
      topic: 'Berkuda',
      aspect: 'Keseimbangan Seat, Postur Canter, & Kendali Kuda',
      score: 80,
      grade: 'B+',
      notes: 'Postur badan rileks saat canter melingkar.',
    },
    {
      topic: 'FAST SHOOTING',
      aspect: 'Speed Shooting (< 3 Detik / Arrow) & Blind Nocking',
      score: 90,
      grade: 'A+',
      notes: 'Sangat cepat dalam mengambil anak panah dari quiver tanpa melihat.',
    },
    {
      topic: 'DYNAMIC',
      aspect: 'Dynamic Obstacle Track & Agility Bergerak',
      score: 86,
      grade: 'A',
      notes: 'Kelincahan manuver rintangan sangat memuaskan.',
    },
  ];

  const [topicScores, setTopicScores] = useState<TopicScoreItem[]>(defaultTopicScores);
  const [coachFeedback, setCoachFeedback] = useState<string>(
    'Atlet menunjukkan progres teknik yang sangat konsisten. Disiplin latihan fisik dan kecepatan blind nocking meningkat tajam.'
  );
  const [currentDrawWeight, setCurrentDrawWeight] = useState<number>(
    activeAthlete?.equipment?.drawWeightLbs || 35
  );
  const [physicalNotes, setPhysicalNotes] = useState<string>(
    'Kondisi fisik prima, pernafasan teratur, tidak ada cedera bahu atau jari.'
  );
  const [recommendationList, setRecommendationList] = useState<string>(
    'Tingkatkan latihan beban upper body untuk persiapan naik poundage busur.\nPerbanyak simulasi tanding beregu dan fast shooting 60 detik.'
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync with existing evaluation if found
  useEffect(() => {
    if (existingEval) {
      setTopicScores(existingEval.topicEvaluations || defaultTopicScores);
      setCoachFeedback(existingEval.coachFeedback || '');
      setCurrentDrawWeight(existingEval.drawWeightCurrentLbs || activeAthlete?.equipment?.drawWeightLbs || 35);
      setPhysicalNotes(existingEval.physicalConditionNotes || '');
      setRecommendationList((existingEval.recommendations || []).join('\n'));
    } else {
      setTopicScores(defaultTopicScores);
      setCoachFeedback(
        'Atlet menunjukkan dedikasi latihan yang tinggi. Fokus pada pematangan konsistensi rilis dan sinkronisasi irama nafas.'
      );
      setCurrentDrawWeight(activeAthlete?.equipment?.drawWeightLbs || 35);
      setPhysicalNotes('Kondisi fisik fit, stamina latihan stabil sepanjang sesi.');
      setRecommendationList(
        'Tingkatkan latihan beban upper body untuk persiapan naik poundage busur.\nPerbanyak simulasi tanding uji coba.'
      );
    }
  }, [existingEval, activeAthlete, periodType, startDateStr, endDateStr]);

  // Overall Score Calculation (Average of 6 Pillars)
  const calculatedOverallScore = useMemo(() => {
    const sum = topicScores.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
    return Math.round(sum / topicScores.length);
  }, [topicScores]);

  const overallGrade = useMemo(() => {
    if (calculatedOverallScore >= 90) return 'A+ (Istimewa / Sangat Unggul)';
    if (calculatedOverallScore >= 85) return 'A (Sangat Memuaskan)';
    if (calculatedOverallScore >= 75) return 'B+ (Baik Sekali)';
    if (calculatedOverallScore >= 65) return 'B (Cukup Baik)';
    if (calculatedOverallScore >= 55) return 'C (Perlu Pembinaan)';
    return 'D (Evaluasi Khusus)';
  }, [calculatedOverallScore]);

  // Radar chart data for 6 Horsebow Pillars
  const radarChartData = useMemo(() => {
    return topicScores.map((ts) => ({
      pilar: ts.topic,
      skor: ts.score,
      fullMark: 100,
    }));
  }, [topicScores]);

  // Progression Line chart data
  const scoreProgressionData = useMemo(() => {
    if (athleteSessions.length === 0) {
      return [
        { sesi: 'Target 1', skor: 280, avg: 7.7 },
        { sesi: 'Target 2', skor: 295, avg: 8.1 },
        { sesi: 'Target 3', skor: 310, avg: 8.6 },
        { sesi: 'Target 4', skor: 320, avg: 8.8 },
      ];
    }
    return athleteSessions.map((s, idx) => ({
      sesi: `${s.date.slice(5)} (${s.distanceMeters || 20}m)`,
      skor: s.totalScore,
      avg: s.averageArrowScore || Math.round((s.totalScore / (s.arrowsShotCount || 36)) * 10) / 10,
    }));
  }, [athleteSessions]);

  // Handle Score Change for a Topic
  const handleScoreChange = (index: number, newScore: number) => {
    const updated = [...topicScores];
    const scoreVal = Math.min(100, Math.max(0, newScore));
    let grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' = 'B';
    if (scoreVal >= 90) grade = 'A+';
    else if (scoreVal >= 85) grade = 'A';
    else if (scoreVal >= 75) grade = 'B+';
    else if (scoreVal >= 65) grade = 'B';
    else if (scoreVal >= 55) grade = 'C';
    else grade = 'D';

    updated[index] = {
      ...updated[index],
      score: scoreVal,
      grade,
    };
    setTopicScores(updated);
  };

  const handleNotesChange = (index: number, newNotes: string) => {
    const updated = [...topicScores];
    updated[index] = {
      ...updated[index],
      notes: newNotes,
    };
    setTopicScores(updated);
  };

  // Save Progress Evaluation
  const handleSaveEvaluation = () => {
    if (!activeAthlete) return;

    const evaluationToSave: AthleteProgressEvaluation = {
      id: existingEval?.id || `eval-${activeAthlete.id}-${periodType}-${startDateStr}`,
      athleteId: activeAthlete.id,
      athleteName: activeAthlete.name,
      periodType,
      startDate: startDateStr,
      endDate: endDateStr,
      periodLabel: periodTitle,
      attendanceRatePercent: attendancePercent,
      totalArrowsShot,
      highestScore,
      averageScore,
      overallScore: calculatedOverallScore,
      overallGrade,
      topicEvaluations: topicScores,
      physicalConditionNotes: physicalNotes,
      drawWeightCurrentLbs: currentDrawWeight,
      coachFeedback,
      recommendations: recommendationList.split('\n').filter((r) => r.trim().length > 0),
      assessedBy: currentUser.name,
      assessedByRole: currentUser.role,
      assessedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveEvaluation(evaluationToSave);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!activeAthlete) return;

    const headers = [
      'Nomor Anggota',
      'Nama Atlit',
      'Divisi',
      'Kategori Usia',
      'Periode Evaluasi',
      'Tanggal Mulai',
      'Tanggal Selesai',
      'Pilar Evaluasi',
      'Aspek Penilaian',
      'Nilai (0-100)',
      'Grade',
      'Catatan Pelatih',
      'Skor Keseluruhan',
      'Grade Keseluruhan',
      'Total Anak Panah',
      'Poundage Busur (lbs)',
      'Penilai',
      'Tanggal Penilaian',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = topicScores.map((ts) => [
      activeAthlete.memberNo,
      activeAthlete.name,
      activeAthlete.division,
      activeAthlete.ageCategory,
      periodTitle,
      startDateStr,
      endDateStr,
      ts.topic,
      ts.aspect,
      ts.score,
      ts.grade,
      ts.notes,
      calculatedOverallScore,
      overallGrade,
      totalArrowsShot,
      currentDrawWeight,
      currentUser.name,
      formatDateIndo(new Date().toISOString()),
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RAPOR_PERKEMBANGAN_ATLET_${activeAthlete.name.replace(/\s+/g, '_')}_${startDateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!activeAthlete) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        Belum ada data atlit yang terdaftar.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 print:space-y-3 print:pb-0">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Laporan Perkembangan & Rapor Atlet
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evaluasi 6 pilar Horsebow, volume latihan panahan, dan penilaian berkala oleh Super Admin, Admin & Pelatih
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {canEditEvaluation && (
            <button
              onClick={handleSaveEvaluation}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-600/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Evaluasi</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 text-xs font-bold transition shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider transition shadow-md shadow-pink-500/20 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rapor / PDF</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>
              Evaluasi perkembangan atlet <strong>{activeAthlete.name}</strong> untuk rentang <strong>{periodTitle}</strong> berhasil disimpan & diperbarui!
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 uppercase tracking-widest bg-emerald-900/60 px-2 py-0.5 rounded">Tersimpan</span>
        </div>
      )}

      {/* Athlete & Period Selectors Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
          {/* Athlete Selector */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-purple-600 shrink-0" />
            <label className="text-xs font-bold text-slate-700 shrink-0">Pilih Atlet:</label>
            <select
              value={selectedAthleteId}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500"
            >
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.memberNo} - {a.name} ({a.ageCategory} • {a.gender === 'L' ? 'Putra' : 'Putri'})
                </option>
              ))}
            </select>
          </div>

          {/* Period Filter Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 flex-wrap gap-1 justify-end">
            <button
              onClick={() => setPeriodType('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                periodType === 'daily'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Harian</span>
            </button>

            <button
              onClick={() => setPeriodType('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                periodType === 'weekly'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Mingguan</span>
            </button>

            <button
              onClick={() => setPeriodType('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                periodType === 'monthly'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Bulanan</span>
            </button>

            <button
              onClick={() => setPeriodType('yearly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                periodType === 'yearly'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tahunan</span>
            </button>

            <button
              onClick={() => setPeriodType('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                periodType === 'custom'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Kustom</span>
            </button>
          </div>
        </div>

        {/* Date Inputs Sub-bar */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">Rentang Waktu:</span>
            <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
              {startDateStr} s.d. {endDateStr}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {periodType === 'daily' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1 text-xs font-bold text-slate-900"
              />
            )}

            {periodType === 'weekly' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1 text-xs font-bold text-slate-900"
              />
            )}

            {periodType === 'monthly' && (
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900"
                >
                  <option value={1}>Januari</option>
                  <option value={2}>Februari</option>
                  <option value={3}>Maret</option>
                  <option value={4}>April</option>
                  <option value={5}>Mei</option>
                  <option value={6}>Juni</option>
                  <option value={7}>Juli</option>
                  <option value={8}>Agustus</option>
                  <option value={9}>September</option>
                  <option value={10}>Oktober</option>
                  <option value={11}>November</option>
                  <option value={12}>Desember</option>
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            )}

            {periodType === 'yearly' && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            )}

            {periodType === 'custom' && (
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-2 py-1 text-xs font-medium"
                />
                <span>s.d.</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-2 py-1 text-xs font-medium"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Attendance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Presensi Latihan</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{attendancePercent}%</h3>
            <p className="text-[10px] text-emerald-600 font-bold">{attendanceCount} kali hadir</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Arrow Volume */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Volume Panah</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{totalArrowsShot}</h3>
            <p className="text-[10px] text-purple-600 font-bold">{athleteSessions.length} sesi tembak</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
        </div>

        {/* Highest Score */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Skor Tertinggi</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{highestScore || '-'}</h3>
            <p className="text-[10px] text-pink-600 font-bold">Rata-rata: {averageScore || '-'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Overall Grade */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Indeks Evaluasi</p>
            <h3 className="text-xl font-black text-purple-700 mt-0.5">{calculatedOverallScore} / 100</h3>
            <p className="text-[10px] text-indigo-600 font-bold truncate max-w-[120px]">{overallGrade}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Printable Report / Assessment Sheet */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 printable-report print:border-none print:shadow-none print:p-2">
        {/* Kop Surat Resmi */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-950 flex items-center justify-center text-purple-400 font-black text-2xl shadow-sm border border-slate-800 shrink-0">
              🎯
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-wide">
                {clubSettings.clubName}
              </h1>
              <p className="text-xs text-purple-700 font-bold tracking-wider">
                LEMBAR RAPOR & EVALUASI PERKEMBANGAN ATLET HORSEBOW
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Sekretariat & Lapangan: {clubSettings.trainingLocation}
              </p>
              <p className="text-[11px] text-slate-600">
                Kota Batu, Jawa Timur • Terdaftar di Persatuan Panahan Tradisional
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="px-3 py-1 bg-purple-900 text-white text-[10px] font-black rounded-lg uppercase tracking-wider block">
              RAPOR RESMI ATLET
            </span>
            <p className="text-[10px] text-slate-500 font-mono font-bold mt-1.5">
              ID: {activeAthlete.memberNo}
            </p>
          </div>
        </div>

        {/* Athlete Identity Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-bold">NAMA ATLET:</span>
            <span className="font-black text-slate-900 text-sm block">{activeAthlete.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold">NOMOR ANGGOTA:</span>
            <span className="font-mono font-bold text-purple-700 block">{activeAthlete.memberNo}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold">DIVISI & USIA:</span>
            <span className="font-bold text-slate-800 block">{activeAthlete.division} • {activeAthlete.ageCategory}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold">PERIODE EVALUASI:</span>
            <span className="font-bold text-slate-900 block">{periodTitle}</span>
          </div>
        </div>

        {/* Visual Charts (Radar & Score Progress) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
          {/* Radar Chart (6 Pillars) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-600" />
                Radar 6 Pilar Horsebow
              </span>
              <span className="text-[11px] text-purple-600 font-bold">Skor Rata-rata: {calculatedOverallScore}/100</span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={70} data={radarChartData}>
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="pilar" stroke="#475569" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={9} />
                  <Radar name="Skor Atlet" dataKey="skor" stroke="#9333ea" fill="#a855f7" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line Chart (Score Progression) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-pink-600" />
                Grafik Skor Scoring / Latihan
              </span>
              <span className="text-[11px] text-slate-500">{athleteSessions.length} sesi terekam</span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreProgressionData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="sesi" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="skor" name="Total Skor" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="avg" name="Poin / Panah" stroke="#0284c7" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 6 Pillars Evaluation Table (Editable by Coach/Admin) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-600" />
              <span>Matriks Penilaian 6 Pilar Horsebow & Karakter</span>
            </h4>
            {canEditEvaluation && (
              <span className="text-[11px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 print:hidden">
                Mode Edit Pelatih Aktif
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 w-8 text-center border-r border-slate-200">No</th>
                  <th className="p-2.5 w-36 border-r border-slate-200">Pilar Horsebow</th>
                  <th className="p-2.5 w-48 border-r border-slate-200">Aspek yang Dinilai</th>
                  <th className="p-2.5 w-24 text-center border-r border-slate-200">Nilai (0-100)</th>
                  <th className="p-2.5 w-16 text-center border-r border-slate-200">Grade</th>
                  <th className="p-2.5">Catatan Pelatih & Rekomendasi Khusus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-900">
                {topicScores.map((ts, idx) => (
                  <tr key={ts.topic} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 text-center font-bold text-slate-500 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 font-black text-purple-900 border-r border-slate-200">
                      {ts.topic}
                    </td>
                    <td className="p-2.5 text-slate-700 font-medium border-r border-slate-200">
                      {ts.aspect}
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200">
                      {canEditEvaluation ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={ts.score}
                          onChange={(e) => handleScoreChange(idx, parseInt(e.target.value, 10) || 0)}
                          className="w-16 text-center font-mono font-black bg-white border border-purple-300 rounded-lg py-1 text-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-500 print:border-none print:bg-transparent"
                        />
                      ) : (
                        <span className="font-mono font-black text-purple-700">{ts.score}</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200">
                      <span className="px-2 py-0.5 rounded-md font-black text-[11px] bg-slate-900 text-white">
                        {ts.grade}
                      </span>
                    </td>
                    <td className="p-2.5">
                      {canEditEvaluation ? (
                        <input
                          type="text"
                          value={ts.notes}
                          onChange={(e) => handleNotesChange(idx, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-purple-500 print:border-none print:bg-transparent"
                        />
                      ) : (
                        <span className="text-slate-700">{ts.notes}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={3} className="p-3 text-right uppercase tracking-wider border-r border-slate-200">
                    NILAI AKHIR / INDEKS PRESTASI PERIODE INI:
                  </td>
                  <td className="p-3 text-center font-mono text-purple-700 text-sm border-r border-slate-200">
                    {calculatedOverallScore}
                  </td>
                  <td className="p-3 text-center border-r border-slate-200">
                    <span className="px-2 py-0.5 rounded-md bg-purple-700 text-white text-xs">
                      {overallGrade.slice(0, 2).trim()}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-700">
                    PREDIKAT: <span className="text-purple-900">{overallGrade}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Physical Condition & Draw Weight Progression */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">
              1. Catatan Kondisi Fisik & Stamina Atlet:
            </span>
            {canEditEvaluation ? (
              <textarea
                rows={2}
                value={physicalNotes}
                onChange={(e) => setPhysicalNotes(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 print:border-none print:bg-transparent"
              />
            ) : (
              <p className="text-xs text-slate-700">{physicalNotes}</p>
            )}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                2. Poundage Busur Saat Ini (Draw Weight):
              </span>
              {canEditEvaluation ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="15"
                    max="80"
                    value={currentDrawWeight}
                    onChange={(e) => setCurrentDrawWeight(parseInt(e.target.value, 10) || 30)}
                    className="w-16 text-center font-mono font-bold bg-white border border-slate-300 rounded-lg py-0.5 text-xs text-purple-700"
                  />
                  <span className="text-xs font-bold text-slate-600">lbs</span>
                </div>
              ) : (
                <span className="font-mono font-bold text-purple-700 text-xs">{currentDrawWeight} lbs</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Rekomendasi adaptasi: Tambah volume repetisi drill tarikan (draw holding 10 detik) 3x seminggu.
            </p>
          </div>
        </div>

        {/* Coach Feedback & Target Recommendations */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div>
            <span className="text-xs font-bold text-slate-900 block mb-1">
              Catatan & Masukan Pelatih Kepala:
            </span>
            {canEditEvaluation ? (
              <textarea
                rows={2}
                value={coachFeedback}
                onChange={(e) => setCoachFeedback(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 print:border-none print:bg-transparent"
              />
            ) : (
              <p className="text-xs text-slate-700 italic">"{coachFeedback}"</p>
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-slate-900 block mb-1">
              Rekomendasi & Target Periode Berikutnya:
            </span>
            {canEditEvaluation ? (
              <textarea
                rows={2}
                value={recommendationList}
                onChange={(e) => setRecommendationList(e.target.value)}
                placeholder="Tulis 1 rekomendasi per baris..."
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 print:border-none print:bg-transparent"
              />
            ) : (
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5">
                {recommendationList.split('\n').filter(Boolean).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Official Signatures (3 Pihak) */}
        <div className="pt-6 text-xs">
          <p className="text-right text-slate-600 mb-4">
            Kota Batu, {formatDateIndo(new Date().toISOString())}
          </p>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-slate-600">Pelatih Penguji,</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 inline-block min-w-[130px]">
                ( {currentUser.name} )
              </p>
            </div>

            <div>
              <p className="text-slate-600">Pelatih Kepala,</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 inline-block min-w-[130px]">
                ( {clubSettings.coachName || 'Pelatih Kepala'} )
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
  );
};
