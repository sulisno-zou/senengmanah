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
import { Athlete, SPPPayment, TrainingSession, AttendanceRecord, ClubSettings, NewsArticle, UserAccount } from '../types';
import { formatRupiah, formatDateIndo, formatMonthYearIndo, generateWhatsAppReminderMessage } from '../utils/formatters';
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
}) => {
  const currentMonth = '2026-08';

  // Stats calculation
  const activeAthletes = athletes.filter((a) => a.active);
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
  const recentAttendance = attendanceRecords.slice(-20);
  const hadirCount = recentAttendance.filter((a) => a.status === 'Hadir').length;
  const avgAttendance = recentAttendance.length > 0 ? Math.round((hadirCount / recentAttendance.length) * 100) : 0;

  // Training scores
  const topScoreSession: TrainingSession | null = trainingSessions.reduce((top: TrainingSession | null, curr: TrainingSession) => {
    if (!top || curr.totalScore > top.totalScore) return curr;
    return top;
  }, null);

  // Chart 1: SPP Collection monthly trend
  const sppMonthlyData = [
    { month: 'Mei', target: 2000000, terkumpul: 2000000 },
    { month: 'Jun', target: 2000000, terkumpul: 1750000 },
    { month: 'Jul', target: 2000000, terkumpul: 2000000 },
    { month: 'Agu (Kini)', target: totalBilledSPP, terkumpul: totalCollectedSPP },
  ];

  // Chart 2: Division breakdown
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

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Hero: SENENG MANAH SHOOTING CLASS BATU with Pink-Blue-Purple Gradient */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-pink-500/30 p-6 sm:p-8 bg-slate-900 text-white">
        {/* Background ambient lighting */}
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
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold uppercase tracking-wider shadow-sm">
                  Portal Resmi Klub
                </span>
                <span className="text-xs text-pink-300 font-mono font-bold">
                  KOTA BATU, JAWA TIMUR
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white font-mono tracking-tight leading-tight drop-shadow-sm">
                {clubSettings.clubName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                {clubSettings.tagline || 'Mencetak Atlet Panahan Berprestasi, Berkarakter & Berdisiplin Tinggi'}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons on Hero */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto">
            {onOpenDownloadAll && (
              <button
                onClick={onOpenDownloadAll}
                className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-transform active:scale-95 border border-blue-400/30"
                title="Download Semua Data dalam 1 Folder ZIP"
              >
                <FolderArchive className="w-4 h-4 text-sky-200" />
                <span>Download Semua (ZIP)</span>
              </button>
            )}

            <button
              onClick={() => onOpenMemberCardModal(athletes[0])}
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-pink-500/20 transition-transform active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>Cetak KTA Berbarcode</span>
            </button>

            <button
              onClick={() => onOpenPaymentProofModal()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-pink-300 border border-pink-500/30 text-xs font-bold uppercase tracking-wider transition shadow-sm"
            >
              <CreditCard className="w-4 h-4 text-pink-400" />
              <span>{currentUser.role === 'atlit' ? 'Kirim Bukti SPP' : 'Verifikasi SPP'}</span>
            </button>

            <button
              onClick={() => onOpenVerificationModal()}
              className="inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 border border-purple-500/30 text-xs font-bold transition"
              title="Cek & Validasi Barcode Anggota"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Scan Barcode</span>
            </button>
          </div>
        </div>
      </div>

      {/* BERITA & WARTA DI BERANDA (Requested by User) */}
      <NewsFeedSection
        newsList={newsList}
        currentUser={currentUser}
        onOpenNewsManager={onOpenNewsManager}
      />

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Top Skor Kualifikasi */}
        <div
          onClick={() => onNavigateTab('scoring')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-pink-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">Top Skor Kualifikasi</p>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-pink-500/20">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2">
            <h3 className="text-4xl font-black text-slate-900 font-mono tracking-tight">
              {topScoreSession ? topScoreSession.totalScore : '345'} <span className="text-base font-normal text-slate-400">/ 360</span>
            </h3>
          </div>
          <div className="flex items-center gap-2 text-pink-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold">
              {topScoreSession ? `${topScoreSession.athleteName.split(' ')[0]} (${topScoreSession.distanceMeters}m)` : 'Rizky (50m)'}
            </span>
          </div>
        </div>

        {/* Card 2: Total Atlet Aktif */}
        <div
          onClick={() => onNavigateTab('athletes')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">Total Atlet Terdaftar</p>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2">
            <h3 className="text-4xl font-black text-slate-900 font-mono tracking-tight">
              {activeAthletes.length} <span className="text-base font-normal text-slate-400">atlet</span>
            </h3>
          </div>
          <p className="text-xs text-blue-600 font-bold">
            Memiliki KTA Barcode Resmi Terverifikasi
          </p>
        </div>

        {/* Card 3: SPP Terkumpul & Pending */}
        <div
          onClick={() => onNavigateTab('spp')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-purple-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">SPP Bulan Ini ({formatMonthYearIndo(currentMonth)})</p>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
              {sppLunasRate}% <span className="text-base font-normal text-slate-400">Lunas</span>
            </h3>
          </div>
          <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{formatRupiah(totalCollectedSPP)} terkumpul</span>
          </p>
        </div>

        {/* Card 4: Disiplin Presensi */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">Kehadiran Sesi</p>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2">
            <h3 className="text-4xl font-black text-slate-900 font-mono tracking-tight">
              {avgAttendance}% <span className="text-base font-normal text-slate-400">disiplin</span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium">Berdasarkan log presensi latihan Seneng Manah</p>
        </div>
      </div>

      {/* Main Charts & SPP Summary Row */}
      <div className="grid grid-cols-12 gap-6">
        {/* Chart 1: Bar Chart Penerimaan SPP */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">Statistik SPP & Anggaran</p>
              <h4 className="text-base font-bold text-slate-800 mt-0.5">Tren Penerimaan Iuran Bulanan Klub</h4>
            </div>
            <button
              onClick={() => onNavigateTab('spp')}
              className="text-xs font-bold uppercase tracking-wider text-pink-600 hover:text-pink-700 px-3 py-1.5 bg-pink-50 rounded-lg transition"
            >
              Lihat Detail SPP &rarr;
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sppMonthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `Rp${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFFFFF' }}
                  formatter={(val: any) => [formatRupiah(Number(val)), '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="target" name="Target Tagihan" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="terkumpul" name="Dana Terkumpul" fill="#EC4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ringkasan SPP Card (Pink/Blue/Purple Theme) */}
        <div className="col-span-12 lg:col-span-4 bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-pink-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <h4 className="text-xs font-bold uppercase text-pink-400 mb-4 tracking-widest flex items-center justify-between">
              <span>Ringkasan SPP {formatMonthYearIndo(currentMonth)}</span>
              {pendingVerificationSPP.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px]">
                  {pendingVerificationSPP.length} Menunggu
                </span>
              )}
            </h4>
            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span className="text-slate-300">Target Pelunasan</span>
                  <span className="font-bold text-white font-mono">{sppLunasRate}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${sppLunasRate}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400">Total Tagihan:</span>
                <span className="font-mono font-bold text-slate-200">{formatRupiah(totalBilledSPP)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400">Terkumpul:</span>
                <span className="font-mono font-bold text-emerald-400">{formatRupiah(totalCollectedSPP)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400">Tunggakan:</span>
                <span className="font-mono font-bold text-rose-400">{formatRupiah(totalBilledSPP - totalCollectedSPP)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 flex gap-2">
            <button
              onClick={() => onOpenPaymentProofModal()}
              className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white text-[11px] uppercase font-bold tracking-wider rounded-xl transition shadow-md shadow-pink-500/20"
            >
              {currentUser.role === 'atlit' ? 'Kirim Bukti SPP' : 'Verifikasi SPP'}
            </button>
            <button
              onClick={() => onNavigateTab('spp')}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-[11px] uppercase font-bold tracking-wider rounded-xl transition border border-slate-700"
            >
              Laporan SPP
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Daftar Monitoring Atlet & KTA */}
      <div className="grid grid-cols-12 gap-6">
        {/* Table: Daftar Monitoring Atlet */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h4 className="text-sm sm:text-base font-black text-slate-900">Daftar Atlet & Status KTA Barcode</h4>
              <p className="text-xs text-slate-400">Data atlet SENENG MANAH SHOOTING CLASS BATU</p>
            </div>
            <button
              onClick={() => onNavigateTab('athletes')}
              className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
            >
              <span>Kelola Semua Atlet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Atlet</th>
                  <th className="px-6 py-3.5">Divisi & Kategori</th>
                  <th className="px-6 py-3.5">Alamat Domisili</th>
                  <th className="px-6 py-3.5">Status SPP</th>
                  <th className="px-6 py-3.5 text-right">Kartu KTA</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 text-slate-700">
                {athletes.slice(0, 5).map((ath) => {
                  const pay = currentMonthSPP.find((p) => p.athleteId === ath.id);
                  const isPaid = pay?.status === 'LUNAS' || pay?.status === 'BEASISWA';
                  return (
                    <tr key={ath.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={ath.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={ath.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">{ath.name}</div>
                            <div className="text-xs text-pink-600 font-mono font-bold">{ath.memberNo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px] inline-block mb-0.5">
                          {ath.division}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          {ath.ageCategory} ({ath.gender === 'L' ? 'Putra' : 'Putri'})
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-[160px] truncate">
                        {ath.address}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] tracking-wider ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isPaid ? 'LUNAS' : 'BELUM BAYAR'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onOpenMemberCardModal(ath)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition"
                          title="Cetak KTA Barcode"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>KTA</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Jadwal & SPP Peringatan */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Jadwal Latihan Sesi */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest">
              Jadwal Sesi Latihan Panahan Batu
            </h4>
            <div className="space-y-3">
              <div className="flex gap-4 items-start p-3 rounded-xl bg-pink-50/50 border border-pink-100">
                <div className="bg-gradient-to-tr from-pink-500 to-purple-600 text-white px-2.5 py-1.5 rounded-lg text-center min-w-[46px] shadow-sm">
                  <p className="text-[10px] font-bold uppercase">SAB</p>
                  <p className="text-sm font-black">22</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Scoring Test 70m / 50m / 30m</p>
                  <p className="text-xs text-slate-500">07:30 WIB • Lapangan Seneng Manah Batu</p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 text-white px-2.5 py-1.5 rounded-lg text-center min-w-[46px] shadow-sm">
                  <p className="text-[10px] font-bold uppercase">MIN</p>
                  <p className="text-sm font-black">23</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Latihan Fisik & Tuning Alat</p>
                  <p className="text-xs text-slate-500">08:00 WIB • Lapangan Seneng Manah Batu</p>
                </div>
              </div>
            </div>
          </div>

          {/* SPP Belum Lunas Alert */}
          {unpaidSPP.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase text-rose-500 tracking-widest flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Tunggakan SPP ({unpaidSPP.length})</span>
                </h4>
                <button
                  onClick={() => onNavigateTab('spp')}
                  className="text-xs font-bold text-pink-600 hover:text-pink-700"
                >
                  Kelola SPP &rarr;
                </button>
              </div>
              <div className="space-y-2">
                {unpaidSPP.slice(0, 3).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{payment.athleteName}</p>
                      <p className="text-slate-400 font-mono">{formatRupiah(payment.amount)}</p>
                    </div>
                    <button
                      onClick={() => handleSendReminderWA(payment)}
                      className="px-2.5 py-1 bg-green-100 hover:bg-green-200 text-green-700 font-bold rounded-lg text-[11px] uppercase tracking-wider transition"
                    >
                      Kirim WA
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warta & Berita Klub Section */}
      <div className="pt-2">
        <NewsFeedSection
          newsList={newsList}
          currentUser={currentUser}
          onOpenNewsManager={onOpenNewsManager}
        />
      </div>
    </div>
  );
};
