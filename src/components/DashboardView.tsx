import React from 'react';
import {
  Users,
  DollarSign,
  Target,
  CalendarCheck,
  TrendingUp,
  Award,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  Clock,
  QrCode,
  CreditCard,
  PlusCircle,
  ShieldCheck,
  FolderArchive,
  Download,
  KeyRound,
  UserCheck,
  ShieldAlert,
  Send,
  Camera,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Athlete,
  SPPPayment,
  TrainingSession,
  AttendanceRecord,
  ClubSettings,
  NewsArticle,
  UserAccount,
  ProfileUpdateRequest,
} from '../types';
import {
  formatRupiah,
  formatDateIndo,
  formatMonthYearIndo,
  generateWhatsAppReminderMessage,
} from '../utils/formatters';
import { NewsFeedSection } from './NewsFeedSection';

interface DashboardViewProps {
  athletes: Athlete[];
  sppPayments: SPPPayment[];
  trainingSessions: TrainingSession[];
  attendanceRecords: AttendanceRecord[];
  newsList: NewsArticle[];
  clubSettings: ClubSettings;
  currentUser: UserAccount;
  onNavigateTab: (tab: any) => void;
  onSelectPaymentForReceipt: (payment: SPPPayment) => void;
  onOpenMemberCardModal: (athlete?: Athlete) => void;
  onOpenVerificationModal: (athleteId?: string) => void;
  onOpenPaymentProofModal: () => void;
  onOpenNewsManager: () => void;
  onOpenDownloadAll?: () => void;
  onOpenImportExportModal?: () => void;
  onOpenChangeCredentials?: () => void;
  pendingCredentialRequests?: ProfileUpdateRequest[];
  onOpenCredentialRequests?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  athletes,
  sppPayments,
  trainingSessions,
  attendanceRecords,
  newsList,
  clubSettings,
  currentUser,
  onNavigateTab,
  onSelectPaymentForReceipt,
  onOpenMemberCardModal,
  onOpenVerificationModal,
  onOpenPaymentProofModal,
  onOpenNewsManager,
  onOpenDownloadAll,
  onOpenImportExportModal,
  onOpenChangeCredentials,
  pendingCredentialRequests = [],
  onOpenCredentialRequests,
}) => {
  const currentMonth = '2026-08';
  const isAthleteRole = currentUser.role === 'atlit';

  // Find linked athlete profile if current user is an athlete
  const currentAthlete = isAthleteRole
    ? athletes.find(
        (a) =>
          a.id === currentUser.athleteId ||
          (a.username && a.username.toLowerCase() === currentUser.username.toLowerCase()) ||
          a.memberNo.toLowerCase() === currentUser.username.toLowerCase()
      ) || athletes[0]
    : null;

  // SPP Exemption helper: Pelatih, Pelatih Utama, Admin, Pengurus are exempt from SPP
  const isExemptFromSPP = (athlete: Athlete | null | undefined) => {
    if (!athlete) return false;
    const level = athlete.memberLevel;
    const role = athlete.userRole;
    return (
      level === 'Pelatih' ||
      level === 'Pelatih Utama' ||
      level === 'Pengurus' ||
      role === 'pelatih' ||
      role === 'pelatih_utama' ||
      role === 'pelatih_atlit' ||
      role === 'admin' ||
      role === 'pengurus'
    );
  };

  // =========================================================================
  // ATHLETE-ONLY VIEW LOGIC
  // =========================================================================
  if (isAthleteRole && currentAthlete) {
    const athleteAttendances = attendanceRecords.filter((r) => r.athleteId === currentAthlete.id);
    const athleteSessions = trainingSessions.filter((s) => s.athleteId === currentAthlete.id);

    const attendedCount = athleteAttendances.filter((a) => a.status === 'Hadir').length;
    const totalSessions = athleteAttendances.length;
    const athleteAttendanceRate =
      totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 100) : 100;

    const athleteBestScore = athleteSessions.reduce((max, s) => (s.totalScore > max ? s.totalScore : max), 0);
    const athleteAvgScore =
      athleteSessions.length > 0
        ? Math.round(
            athleteSessions.reduce((sum, s) => sum + s.totalScore, 0) / athleteSessions.length
          )
        : 0;

    // Athlete SPP Status
    const athleteIsExempt = isExemptFromSPP(currentAthlete);
    const currentMonthPayment = sppPayments.find(
      (p) => p.athleteId === currentAthlete.id && p.monthYear === currentMonth
    );

    return (
      <div className="space-y-8 pb-12 animate-fadeIn">
        {/* Top Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-pink-500/30 p-6 sm:p-8 bg-slate-900 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/30 via-purple-700/40 to-blue-600/30" />
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-950 p-1 border-2 border-pink-400 shadow-xl shrink-0 flex items-center justify-center">
                <img
                  src={clubSettings.logoUrl}
                  alt="Logo Club"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-pink-500/20 text-pink-300 border border-pink-500/30 mb-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>Portal Mandiri Atlet • {clubSettings.clubName}</span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                  Halo, {currentAthlete.name}! 🏹
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                  Nomor KTA: <span className="font-mono text-pink-400 font-bold">{currentAthlete.memberNo}</span> • Divisi: <span className="text-amber-300 font-bold">{currentAthlete.division}</span> ({currentAthlete.ageCategory})
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <button
                onClick={() => onOpenMemberCardModal(currentAthlete)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs shadow-lg shadow-pink-500/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Lihat KTA Digital Saya</span>
              </button>

              {onOpenChangeCredentials && (
                <button
                  onClick={onOpenChangeCredentials}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4 text-pink-400" />
                  <span>Ganti Username / Password</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Athlete Personal Stats Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: KTA & Status */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Status Keanggotaan</span>
              <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-white">
                {currentAthlete.active ? 'Aktif Resmi' : 'Nonaktif'}
              </h3>
              <p className="text-xs text-pink-400 font-bold mt-0.5">
                {currentAthlete.memberLevel || 'Atlet Reguler'}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Bergabung:</span>
              <span className="font-mono text-slate-300">{formatDateIndo(currentAthlete.joinDate)}</span>
            </div>
          </div>

          {/* Card 2: Kehadiran Pribadi */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Tingkat Kehadiran</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">{athleteAttendanceRate}%</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {attendedCount} Hadir dari {totalSessions} Sesi Latihan
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Presensi tercatat otomatis</span>
            </div>
          </div>

          {/* Card 3: Rekor Skor Panahan Pribadi */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Skor Tertinggi Saya</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">{athleteBestScore || '-'} Poin</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rata-rata Skor: <span className="font-bold text-white">{athleteAvgScore || '-'} Poin</span>
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-purple-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{athleteSessions.length} Sesi Scoring tercatat</span>
            </div>
          </div>

          {/* Card 4: Status SPP Pribadi */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Status SPP ({formatMonthYearIndo(currentMonth)})</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              {athleteIsExempt ? (
                <div>
                  <h3 className="text-base font-black text-emerald-400">Bebas Biaya SPP</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Tugas: {currentAthlete.memberLevel}</p>
                </div>
              ) : currentMonthPayment?.status === 'LUNAS' ? (
                <div>
                  <h3 className="text-xl font-black text-emerald-400">LUNAS</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{formatRupiah(currentMonthPayment.amount)}</p>
                </div>
              ) : currentMonthPayment?.status === 'MENUNGGU_VERIFIKASI' ? (
                <div>
                  <h3 className="text-base font-black text-amber-400">Menunggu Verifikasi</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Bukti transfer telah dikirim</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-base font-black text-rose-400">Belum Dibayar</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{formatRupiah(clubSettings.monthlySPPAmount || 150000)}</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800">
              {!athleteIsExempt && currentMonthPayment?.status !== 'LUNAS' ? (
                <button
                  onClick={onOpenPaymentProofModal}
                  className="w-full py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
                >
                  <Send className="w-3 h-3" />
                  <span>Kirim Bukti Bayar SPP</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">Kewajiban SPP aman & tertib</span>
              )}
            </div>
          </div>
        </div>

        {/* Athlete Training Scores History */}
        {athleteSessions.length > 0 && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-black text-white text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-pink-400" />
              <span>Riwayat Skor & Sesi Latihan Panahan Saya</span>
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
                  <tr>
                    <th className="p-3">Tanggal Latihan</th>
                    <th className="p-3">Jarak & Target</th>
                    <th className="p-3">Total Skor</th>
                    <th className="p-3">Rata-rata / Arrow</th>
                    <th className="p-3">Catatan Pelatih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                  {athleteSessions.slice(-6).reverse().map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono">{formatDateIndo(s.date)}</td>
                      <td className="p-3">{s.distanceMeters} Meter • {s.totalArrows} Arrows</td>
                      <td className="p-3 font-black text-pink-400 text-sm">{s.totalScore} Poin</td>
                      <td className="p-3 font-mono text-emerald-400">
                        {(s.totalScore / (s.totalArrows || 30)).toFixed(1)} / 10
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">{s.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Official News & Announcements Section */}
        <NewsFeedSection
          newsList={newsList}
          currentUser={currentUser}
          onOpenNewsManager={onOpenNewsManager}
        />
      </div>
    );
  }

  // =========================================================================
  // ADMIN, SUPER ADMIN, PELATIH UTAMA, PELATIH, PENGURUS DASHBOARD
  // =========================================================================
  const activeAthletes = athletes.filter((a) => a.active);

  // SPP Collection calculation (exclude exempt members like pelatih and pengurus)
  const currentMonthSPP = sppPayments.filter((p) => p.monthYear === currentMonth);
  const totalBilledSPP = currentMonthSPP.reduce((sum, p) => sum + p.amount, 0);
  const totalCollectedSPP = currentMonthSPP
    .filter((p) => p.status === 'LUNAS' || p.status === 'BEASISWA')
    .reduce((sum, p) => sum + p.amount, 0);

  const lunasCount = currentMonthSPP.filter((p) => p.status === 'LUNAS' || p.status === 'BEASISWA').length;
  const sppLunasRate = currentMonthSPP.length > 0 ? Math.round((lunasCount / currentMonthSPP.length) * 100) : 0;
  const unpaidSPP = currentMonthSPP.filter((p) => p.status === 'BELUM_BAYAR' || p.status === 'TERLAMBAT');
  const pendingVerificationSPP = currentMonthSPP.filter((p) => p.status === 'MENUNGGU_VERIFIKASI');

  // Attendance rate
  const recentAttendance = attendanceRecords.slice(-30);
  const hadirCount = recentAttendance.filter((a) => a.status === 'Hadir').length;
  const avgAttendance = recentAttendance.length > 0 ? Math.round((hadirCount / recentAttendance.length) * 100) : 0;

  // Training scores
  const topScoreSession: TrainingSession | null = trainingSessions.reduce(
    (top: TrainingSession | null, curr: TrainingSession) => {
      if (!top || curr.totalScore > top.totalScore) return curr;
      return top;
    },
    null
  );

  // Division breakdown
  const divisionCounts: Record<string, number> = {};
  athletes.forEach((a) => {
    divisionCounts[a.division] = (divisionCounts[a.division] || 0) + 1;
  });
  const divisionData = Object.entries(divisionCounts).map(([name, value]) => ({ name, value }));

  const handleSendReminderWA = (payment: SPPPayment) => {
    const athlete = athletes.find((a) => a.id === payment.athleteId);
    const phone = athlete?.parentPhone || athlete?.phone;
    const msg = generateWhatsAppReminderMessage(
      payment.athleteName,
      athlete?.parentName,
      payment.monthYear,
      payment.amount,
      clubSettings.clubName,
      clubSettings.bankName,
      clubSettings.bankAccountNumber,
      clubSettings.bankAccountHolder
    );
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const pendingCreds = pendingCredentialRequests.filter((r) => r.status === 'MENUNGGU_VERIFIKASI');

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Top Banner Hero */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-pink-500/30 p-6 sm:p-8 bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/30 via-purple-700/40 to-blue-600/30" />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-950 p-1 border-2 border-pink-400 shadow-xl shrink-0 flex items-center justify-center">
              <img
                src={clubSettings.logoUrl}
                alt="Logo Club"
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-pink-500/20 text-pink-300 border border-pink-500/30 mb-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>Dashboard Manajemen • {clubSettings.clubName}</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                {clubSettings.clubName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                Penanggung Jawab Teknis: <span className="text-pink-400 font-bold">{clubSettings.headCoachName || clubSettings.headCoach || 'Coach Zoulkifli'}</span> • {clubSettings.trainingLocation}
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {onOpenImportExportModal && (
              <button
                onClick={onOpenImportExportModal}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Excel Impor/Ekspor</span>
              </button>
            )}

            <button
              onClick={() => onOpenMemberCardModal()}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs shadow-lg shadow-pink-500/25 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Cetak KTA Digital</span>
            </button>

            {onOpenDownloadAll && (
              <button
                onClick={onOpenDownloadAll}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Download Semua</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pending Credential Updates Alert Banner (Super Admin & Admin & Pelatih Utama) */}
      {pendingCreds.length > 0 && onOpenCredentialRequests && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-amber-300 text-sm">
                Ada {pendingCreds.length} Permintaan Perubahan Username/Password Atlet
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Atlet mengajukan pembaruan akun. Harap lakukan verifikasi dan persetujuan.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCredentialRequests}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
          >
            <span>Tinjau & Setujui ({pendingCreds.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Athletes */}
        <div
          onClick={() => onNavigateTab('athletes')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg hover:border-pink-500/40 transition cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Atlet Aktif</span>
            <div className="w-9 h-9 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">{activeAthletes.length} Orang</h3>
            <p className="text-xs text-slate-400 mt-0.5">Dari total {athletes.length} anggota terdaftar</p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-pink-400 font-bold flex items-center justify-between">
            <span>Kelola Data Atlet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: SPP Terkumpul */}
        <div
          onClick={() => onNavigateTab('spp')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg hover:border-emerald-500/40 transition cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">SPP Bulan Ini ({sppLunasRate}%)</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-emerald-400">{formatRupiah(totalCollectedSPP)}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lunasCount} Lunas • {unpaidSPP.length} Belum Bayar
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400 font-bold flex items-center justify-between">
            <span>Kas & Keuangan SPP</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Rata-Rata Kehadiran */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg hover:border-blue-500/40 transition cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Tingkat Kehadiran</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">{avgAttendance}%</h3>
            <p className="text-xs text-slate-400 mt-0.5">Rata-rata 30 sesi latihan terakhir</p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-blue-400 font-bold flex items-center justify-between">
            <span>Presensi & Absensi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Top Score Klub */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg hover:border-purple-500/40 transition cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Skor Scoring Tertinggi</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">
              {topScoreSession ? `${topScoreSession.totalScore} Pts` : 'Belum Ada'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {topScoreSession?.athleteName || 'Sesi Scoring'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-purple-400 font-bold flex items-center justify-between">
            <span>Lihat Evaluasi & Progres</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Unpaid SPP & Reminders Section */}
      {unpaidSPP.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm">
                  Tagihan SPP Belum Lunas ({unpaidSPP.length} Atlet)
                </h3>
                <p className="text-xs text-slate-400">Kirimkan pengingat WhatsApp sopan kepada wali atlet</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('spp')}
              className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1"
            >
              <span>Lihat Semua Tagihan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {unpaidSPP.slice(0, 6).map((payment) => (
              <div
                key={payment.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-white truncate max-w-[160px]">{payment.athleteName}</h4>
                  <p className="text-[11px] text-rose-400 font-semibold">{formatRupiah(payment.amount)}</p>
                </div>

                <button
                  onClick={() => handleSendReminderWA(payment)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 font-bold text-[11px] transition flex items-center gap-1 shrink-0"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Kirim WA</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official News & Announcements Section */}
      <NewsFeedSection
        newsList={newsList}
        currentUser={currentUser}
        onOpenNewsManager={onOpenNewsManager}
      />
    </div>
  );
};
