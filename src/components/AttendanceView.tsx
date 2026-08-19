import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  Plus,
  Filter,
  Save,
  Bell,
  Send,
  AlertTriangle,
  Sparkles,
  PhoneCall,
  Flame,
} from 'lucide-react';
import { AttendanceRecord, Athlete, AttendanceStatus, SessionType, ClubSettings } from '../types';
import { formatDateIndo, generateWhatsAppAttendanceReminderMessage } from '../utils/formatters';

interface AttendanceViewProps {
  athletes: Athlete[];
  attendanceRecords: AttendanceRecord[];
  clubSettings?: ClubSettings;
  onAddAttendanceBatch: (records: AttendanceRecord[]) => void;
  onOpenReminderModal?: (tab: 'attendance' | 'spp') => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  athletes,
  attendanceRecords,
  clubSettings,
  onAddAttendanceBatch,
  onOpenReminderModal,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [sessionType, setSessionType] = useState<SessionType>('Latihan Rutin');
  const [filterView, setFilterView] = useState<'all' | 'needs_reminder'>('all');

  // Form State for today's roster
  const [rosterStatus, setRosterStatus] = useState<Record<string, { status: AttendanceStatus; notes: string; rounds: number }>>(() => {
    const initial: Record<string, { status: AttendanceStatus; notes: string; rounds: number }> = {};
    athletes.forEach((a) => {
      // check if already recorded
      const existing = attendanceRecords.find((r) => r.athleteId === a.id && r.date === new Date().toISOString().slice(0, 10));
      initial[a.id] = {
        status: existing ? existing.status : 'Hadir',
        notes: existing ? existing.notes || '' : '',
        rounds: existing ? existing.roundsCompleted || 60 : 60,
      };
    });
    return initial;
  });

  const handleStatusChange = (athleteId: string, status: AttendanceStatus) => {
    setRosterStatus((prev) => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        status,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; notes: string; rounds: number }> = {};
    athletes.forEach((a) => {
      updated[a.id] = {
        status: 'Hadir',
        notes: '',
        rounds: 60,
      };
    });
    setRosterStatus(updated);
  };

  const handleSaveAttendance = () => {
    const newRecords: AttendanceRecord[] = athletes.map((a) => {
      const info = rosterStatus[a.id] || { status: 'Hadir', notes: '', rounds: 60 };
      return {
        id: `att-${selectedDate}-${a.id}`,
        athleteId: a.id,
        athleteName: a.name,
        date: selectedDate,
        status: info.status,
        sessionType,
        roundsCompleted: info.status === 'Hadir' ? info.rounds : 0,
        notes: info.notes || undefined,
        checkInTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      };
    });

    onAddAttendanceBatch(newRecords);
    alert(`Presensi tanggal ${formatDateIndo(selectedDate)} berhasil disimpan untuk ${athletes.length} atlet!`);
  };

  // Monthly stats per athlete
  const attendanceStats = athletes.map((athlete) => {
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

  const lowAttendanceList = attendanceStats.filter((item) => item.needsReminder);

  const handleQuickSendWA = (stat: typeof attendanceStats[0]) => {
    const athlete = stat.athlete;
    const phone = athlete.parentPhone || athlete.phone;
    const clubName = clubSettings?.clubName || 'Seneng Manah Shooting Class Batu';
    const msg = generateWhatsAppAttendanceReminderMessage(
      athlete.name,
      athlete.parentName,
      clubName,
      stat.percent,
      stat.absentCount,
      'Sabtu & Minggu Pukul 07.30 WIB di Lapangan Utama'
    );
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const displayedStats = filterView === 'needs_reminder'
    ? attendanceStats.filter((item) => item.needsReminder)
    : attendanceStats;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Disiplin Latihan Horsebow</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <CalendarCheck className="w-5 h-5 text-amber-500" />
            <span>Presensi & Monitoring Kehadiran Atlit</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring disiplin kehadiran, rekapitulasi volume tembakan harian, dan sistem pengingat otomatis bagi atlit yang sering absen
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onOpenReminderModal && (
            <button
              onClick={() => onOpenReminderModal('attendance')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition"
            >
              <Bell className="w-4 h-4 text-slate-950" />
              <span>Pusat Pengingat WA</span>
              {lowAttendanceList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black">
                  {lowAttendanceList.length} Atlit
                </span>
              )}
            </button>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Tanggal Sesi</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Jenis Sesi</label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as SessionType)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 font-semibold"
            >
              <option value="Latihan Rutin">Latihan Rutin</option>
              <option value="Scoring Test (Uji Tanding)">Scoring Test (Uji Tanding)</option>
              <option value="Latihan Fisik & SPT">Latihan Fisik & SPT</option>
              <option value="Simulasi Pertandingan">Simulasi Pertandingan</option>
              <option value="Tuning Alat">Tuning Alat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Warning Card for Low Attendance */}
      {lowAttendanceList.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-rose-50/60 to-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-300 flex items-center justify-center shrink-0 text-amber-700">
              <AlertTriangle className="w-5 h-5 text-amber-600 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-900">
                  Perhatian: {lowAttendanceList.length} Atlet Sering Tidak Masuk Latihan
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
                  Disiplin &lt; 80%
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                Latihan panahan Horsebow membutuhkan pengulangan teknik konsisten (*Thumb Draw, Khatra, Blind Nocking*). Segera kirimkan pesan WhatsApp motivasi agar atlit kembali aktif berlatih.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {onOpenReminderModal && (
              <button
                onClick={() => onOpenReminderModal('attendance')}
                className="w-full md:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Pengingat WA ({lowAttendanceList.length} Atlit)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Checklist Presensi Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Daftar Presensi Atlit ({formatDateIndo(selectedDate)})</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Sesi: {sessionType}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkAllPresent}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-200 transition"
            >
              Tandai Semua Hadir
            </button>
            <button
              onClick={handleSaveAttendance}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold uppercase tracking-wider shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Presensi</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {athletes.map((athlete) => {
            const current = rosterStatus[athlete.id] || { status: 'Hadir', notes: '', rounds: 60 };

            return (
              <div
                key={athlete.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/70 transition"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{athlete.name}</h4>
                  <p className="text-xs text-slate-500">
                    {athlete.division} • {athlete.ageCategory}
                  </p>
                </div>

                {/* Status selector buttons */}
                <div className="flex items-center space-x-1">
                  {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as AttendanceStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(athlete.id, st)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition ${
                        current.status === st
                          ? st === 'Hadir'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : st === 'Izin'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : st === 'Sakit'
                            ? 'bg-amber-500 text-slate-900 shadow-xs'
                            : 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rekapitulasi Disiplin Kehadiran Tabel */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <CalendarCheck className="w-4 h-4 text-amber-500" />
              <span>Rekapitulasi Persentase Kehadiran & Tindak Lanjut Absensi</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gunakan tombol WhatsApp di kolom aksi untuk menyapa atlit/wali murid secara langsung.
            </p>
          </div>

          {/* Filter toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setFilterView('all')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filterView === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua ({attendanceStats.length})
            </button>
            <button
              onClick={() => setFilterView('needs_reminder')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                filterView === 'needs_reminder'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Perlu Pengingat ({lowAttendanceList.length})</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-400 border-b border-slate-100 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Nama Atlit</th>
                <th className="px-6 py-3.5">Divisi</th>
                <th className="px-6 py-3.5 text-center">Hadir</th>
                <th className="px-6 py-3.5 text-center">Izin</th>
                <th className="px-6 py-3.5 text-center">Sakit</th>
                <th className="px-6 py-3.5 text-center">Alpa</th>
                <th className="px-6 py-3.5 text-center">% Disiplin</th>
                <th className="px-6 py-3.5 text-right">Aksi Pengingat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {displayedStats.map((stat) => {
                const { athlete, hadir, izin, sakit, alpa, percent, absentCount } = stat;

                return (
                  <tr key={athlete.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{athlete.name}</span>
                        {percent < 80 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-100 text-rose-700 font-bold">
                            Sering Absen
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{athlete.division}</td>
                    <td className="px-6 py-3.5 text-center font-mono text-emerald-600 font-bold">{hadir}</td>
                    <td className="px-6 py-3.5 text-center font-mono text-sky-600">{izin}</td>
                    <td className="px-6 py-3.5 text-center font-mono text-amber-600">{sakit}</td>
                    <td className="px-6 py-3.5 text-center font-mono text-rose-600">{alpa}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          percent >= 85
                            ? 'bg-green-100 text-green-700'
                            : percent >= 70
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {percent}%
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {absentCount > 0 ? (
                        <button
                          onClick={() => handleQuickSendWA(stat)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition"
                          title="Kirim Pengingat WA ke Atlet/Wali"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Ingatkan Masuk</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Hadir Rajin</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

