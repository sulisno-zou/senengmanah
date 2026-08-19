import React, { useState } from 'react';
import {
  X,
  Bell,
  CalendarCheck,
  CreditCard,
  Send,
  UserX,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  Copy,
  ExternalLink,
  Users,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';
import { Athlete, AttendanceRecord, SPPPayment, ClubSettings } from '../types';
import {
  formatRupiah,
  formatMonthYearIndo,
  generateWhatsAppReminderMessage,
  generateWhatsAppAttendanceReminderMessage,
} from '../utils/formatters';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'attendance' | 'spp';
  athletes: Athlete[];
  attendanceRecords: AttendanceRecord[];
  sppPayments: SPPPayment[];
  clubSettings: ClubSettings;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'attendance',
  athletes,
  attendanceRecords,
  sppPayments,
  clubSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'spp'>(initialTab);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [nextSchedule, setNextSchedule] = useState<string>('Sabtu & Minggu Pukul 07.30 WIB di Lapangan Utama');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Calculate Attendance Statistics
  const attendanceData = athletes.map((athlete) => {
    const records = attendanceRecords.filter((r) => r.athleteId === athlete.id);
    const total = records.length;
    const hadir = records.filter((r) => r.status === 'Hadir').length;
    const izin = records.filter((r) => r.status === 'Izin').length;
    const sakit = records.filter((r) => r.status === 'Sakit').length;
    const alpa = records.filter((r) => r.status === 'Alpa').length;
    const percent = total > 0 ? Math.round((hadir / total) * 100) : 100;
    const absentCount = izin + sakit + alpa;

    return {
      athlete,
      total,
      hadir,
      izin,
      sakit,
      alpa,
      percent,
      absentCount,
      needsReminder: percent < 80 || absentCount > 0,
    };
  });

  // Filter athletes needing attendance reminder
  const lowAttendanceAthletes = attendanceData
    .filter((item) => item.needsReminder)
    .sort((a, b) => a.percent - b.percent);

  // 2. Calculate Unpaid SPP Athletes for the selected month
  const unpaidSPPPayments = sppPayments.filter(
    (p) => p.monthYear === selectedMonth && (p.status === 'BELUM_BAYAR' || p.status === 'TERLAMBAT')
  );

  // Send WhatsApp for Attendance
  const handleSendAttendanceWA = (item: typeof attendanceData[0]) => {
    const athlete = item.athlete;
    const phone = athlete.parentPhone || athlete.phone;
    const msg = generateWhatsAppAttendanceReminderMessage(
      athlete.name,
      athlete.parentName,
      clubSettings.clubName,
      item.percent,
      item.absentCount,
      nextSchedule
    );
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Copy Attendance Text
  const handleCopyAttendanceText = (item: typeof attendanceData[0]) => {
    const athlete = item.athlete;
    const msg = generateWhatsAppAttendanceReminderMessage(
      athlete.name,
      athlete.parentName,
      clubSettings.clubName,
      item.percent,
      item.absentCount,
      nextSchedule
    );
    navigator.clipboard.writeText(msg);
    setCopiedId(athlete.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Send WhatsApp for SPP
  const handleSendSPPWA = (payment: SPPPayment) => {
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

  // Copy SPP Text
  const handleCopySPPText = (payment: SPPPayment) => {
    const athlete = athletes.find((a) => a.id === payment.athleteId);
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
    navigator.clipboard.writeText(msg);
    setCopiedId(payment.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20 text-white">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Pusat Pengingat & Notifikasi Klub</span>
              </h2>
              <p className="text-xs text-slate-400">
                Pengingat otomatis kehadiran latihan atlit dan iuran bulanan SPP via WhatsApp
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

        {/* Tab Switcher */}
        <div className="px-5 sm:px-6 pt-4 border-b border-slate-800 flex gap-3">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition border ${
              activeTab === 'attendance'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <UserX className="w-4 h-4 text-amber-400" />
            <span>Pengingat Masuk Latihan</span>
            {lowAttendanceAthletes.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black">
                {lowAttendanceAthletes.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('spp')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition border ${
              activeTab === 'spp'
                ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-md shadow-pink-500/10'
                : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4 text-pink-400" />
            <span>Pengingat Belum Bayar SPP</span>
            {unpaidSPPPayments.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink-500 text-white font-black">
                {unpaidSPPPayments.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Pengingat Kehadiran Latihan */}
        {activeTab === 'attendance' && (
          <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Context Box */}
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-amber-300">
                    Daftar Atlet Sering Tidak Masuk / Perlu Pendampingan
                  </h4>
                  <p className="text-[11px] text-amber-200/80">
                    Atlet dengan persentase kehadiran di bawah 80% atau memiliki riwayat izin/sakit/alpa. Kirim pesan pengingat yang menyemangati agar disiplin latihan Horsebow tetap konsisten.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Schedule Customizer */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-xs font-bold text-slate-300 whitespace-nowrap flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Jadwal Latihan Terdekat:
              </span>
              <input
                type="text"
                value={nextSchedule}
                onChange={(e) => setNextSchedule(e.target.value)}
                placeholder="Contoh: Sabtu & Minggu Pukul 07.30 WIB di Lapangan Utama"
                className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 font-medium"
              />
            </div>

            {/* List of Low Attendance Athletes */}
            {lowAttendanceAthletes.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Disiplin Kehadiran Sangat Baik!</h4>
                <p className="text-xs text-slate-400">Seluruh atlit saat ini memiliki tingkat kehadiran 100%.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowAttendanceAthletes.map((item) => {
                  const athlete = item.athlete;
                  const phone = athlete.parentPhone || athlete.phone;

                  return (
                    <div
                      key={athlete.id}
                      className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={athlete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                          alt={athlete.name}
                          className="w-11 h-11 rounded-full object-cover border border-amber-500/30"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{athlete.name}</h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                              {athlete.memberNo}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Wali: <span className="text-slate-200 font-medium">{athlete.parentName || '-'}</span> • WA:{' '}
                            <span className="text-slate-300 font-mono">{phone || 'Tidak ada no WA'}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                            <span className="px-2 py-0.5 rounded-full font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              {item.percent}% Kehadiran
                            </span>
                            <span className="text-slate-400">
                              (Hadir: <strong className="text-emerald-400">{item.hadir}</strong> • Izin:{' '}
                              <strong className="text-sky-400">{item.izin}</strong> • Sakit:{' '}
                              <strong className="text-amber-400">{item.sakit}</strong> • Alpa:{' '}
                              <strong className="text-rose-400">{item.alpa}</strong>)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        <button
                          onClick={() => handleCopyAttendanceText(item)}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
                          title="Salin Teks Pesan"
                        >
                          {copiedId === athlete.id ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleSendAttendanceWA(item)}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-900/30"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim WA Pengingat</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Pengingat Belum Bayar SPP Bulanan */}
        {activeTab === 'spp' && (
          <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Month filter & Context */}
            <div className="bg-pink-950/30 border border-pink-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-pink-200">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-pink-300">
                    Daftar Atlet Belum Bayar SPP ({formatMonthYearIndo(selectedMonth)})
                  </h4>
                  <p className="text-[11px] text-pink-200/80">
                    Kirimkan tagihan resmi secara santun dan ramah melalui pesan WhatsApp yang mencakup rekening klub dan instruksi pembayaran.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <span className="text-xs font-bold text-slate-300">Periode:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-slate-900 border border-pink-500/50 rounded-xl px-3 py-1.5 text-xs text-pink-300 font-bold outline-none"
                >
                  <option value="2026-08">Agustus 2026</option>
                  <option value="2026-07">Juli 2026</option>
                  <option value="2026-06">Juni 2026</option>
                </select>
              </div>
            </div>

            {/* List of Unpaid SPP Athletes */}
            {unpaidSPPPayments.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Semua SPP Periode Ini Telah Lunas!</h4>
                <p className="text-xs text-slate-400">Tidak ada atlit yang memiliki tagihan belum terbayar untuk bulan {formatMonthYearIndo(selectedMonth)}.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unpaidSPPPayments.map((payment) => {
                  const athlete = athletes.find((a) => a.id === payment.athleteId);
                  const phone = athlete?.parentPhone || athlete?.phone;

                  return (
                    <div
                      key={payment.id}
                      className="bg-slate-950/80 border border-slate-800 hover:border-pink-500/40 rounded-2xl p-4 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={athlete?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                          alt={payment.athleteName}
                          className="w-11 h-11 rounded-full object-cover border border-pink-500/30"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{payment.athleteName}</h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                              {athlete?.memberNo || 'SM-BATU'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Wali: <span className="text-slate-200 font-medium">{athlete?.parentName || '-'}</span> • WA:{' '}
                            <span className="text-slate-300 font-mono">{phone || 'Tidak ada no WA'}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                            <span className="font-mono font-bold text-rose-400 text-xs">
                              {formatRupiah(payment.amount)}
                            </span>
                            <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              {payment.status === 'TERLAMBAT' ? 'TERLAMBAT' : 'BELUM BAYAR'}
                            </span>
                            <span className="text-slate-500 text-[10px]">
                              Jatuh tempo: {payment.dueDate || '10 ' + formatMonthYearIndo(selectedMonth)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        <button
                          onClick={() => handleCopySPPText(payment)}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
                          title="Salin Pesan Tagihan SPP"
                        >
                          {copiedId === payment.id ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleSendSPPWA(payment)}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white flex items-center justify-center gap-1.5 transition shadow-md shadow-pink-900/30"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Tagihan WA</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400" />
            <span>Pesan otomatis membuka aplikasi WhatsApp dengan template resmi klub {clubSettings.clubName}.</span>
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
