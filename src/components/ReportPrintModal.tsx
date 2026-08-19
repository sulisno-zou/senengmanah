import React, { useState } from 'react';
import { X, Printer, Download, Award, Target, DollarSign, CalendarCheck } from 'lucide-react';
import { Athlete, TrainingSession, SPPPayment, AttendanceRecord, ClubSettings } from '../types';
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

  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];

  if (!selectedAthlete) return null;

  // Filter athlete records
  const athleteScores = trainingSessions
    .filter((s) => s.athleteId === selectedAthlete.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const athleteSPP = sppPayments
    .filter((p) => p.athleteId === selectedAthlete.id)
    .sort((a, b) => b.monthYear.localeCompare(a.monthYear));

  const athleteAttendance = attendanceRecords.filter((a) => a.athleteId === selectedAthlete.id);
  const totalAtt = athleteAttendance.length;
  const hadirCount = athleteAttendance.filter((a) => a.status === 'Hadir').length;
  const attendanceRate = totalAtt > 0 ? Math.round((hadirCount / totalAtt) * 100) : 100;

  // Best & Average scores
  const totalScoreSum = athleteScores.reduce((sum, s) => sum + s.totalScore, 0);
  const avgScore = athleteScores.length > 0 ? (totalScoreSum / athleteScores.length).toFixed(1) : '-';
  const highestScore = athleteScores.length > 0 ? Math.max(...athleteScores.map((s) => s.totalScore)) : '-';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center space-x-3">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">
              Rapor Perkembangan Atlit & Status SPP
            </h3>
          </div>

          <div className="flex items-center space-x-3">
            {/* Athlete selector */}
            <select
              value={selectedAthleteId}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500"
            >
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.division} - {a.ageCategory})
                </option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold uppercase tracking-wider transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Sheet */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50">
          <div className="bg-white text-slate-900 p-6 sm:p-10 rounded-xl shadow-xs max-w-3xl mx-auto printable-report border border-slate-200">
            {/* Header Kop Klub */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-wide">
                  {clubSettings.clubName}
                </h1>
                <p className="text-xs text-slate-600 font-semibold">{clubSettings.tagline}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Sekretariat & Lapangan: {clubSettings.trainingLocation}
                </p>
                <p className="text-[11px] text-slate-500">
                  Kepala Pelatih: {clubSettings.coachName} ({clubSettings.coachContact})
                </p>
              </div>
              <div className="text-right">
                <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 font-black text-2xl shadow-xs">
                  🏹
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-mono mt-1 font-bold">RAPOR ATLET</p>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 underline underline-offset-4">
                LEMBAR EVALUASI PERKEMBANGAN ATLET & ADMINISTRASI
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Dicetak pada: {formatDateIndo(new Date().toISOString())}
              </p>
            </div>

            {/* Biodata & Alat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs mb-6">
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-800 border-b pb-1">BIODATA ATLET</p>
                <div className="flex"><span className="w-28 text-slate-500">Nama Lengkap</span><strong className="text-slate-900">: {selectedAthlete.name}</strong></div>
                <div className="flex"><span className="w-28 text-slate-500">No. Anggota</span><span className="text-slate-800 font-mono">: {selectedAthlete.memberNo}</span></div>
                <div className="flex"><span className="w-28 text-slate-500">Divisi Busur</span><span className="text-slate-800 font-semibold">: {selectedAthlete.division}</span></div>
                <div className="flex"><span className="w-28 text-slate-500">Kategori Usia</span><span className="text-slate-800">: {selectedAthlete.ageCategory}</span></div>
                <div className="flex"><span className="w-28 text-slate-500">Tanggal Gabung</span><span className="text-slate-800">: {formatDateIndo(selectedAthlete.joinDate)}</span></div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-800 border-b pb-1">SPESIFIKASI ALAT (EQUIPMENT)</p>
                <div className="flex"><span className="w-28 text-slate-500">Model Busur</span><span className="text-slate-800">: {selectedAthlete.equipment?.bowType || '-'}</span></div>
                <div className="flex"><span className="w-28 text-slate-500">Draw Weight</span><span className="text-slate-800 font-bold">: {selectedAthlete.equipment?.drawWeightLbs || '-'} lbs</span></div>
                <div className="flex"><span className="w-28 text-slate-500">Draw Length</span><span className="text-slate-800">: {selectedAthlete.equipment?.drawLengthInch || '-'} inch</span></div>
                <div className="flex"><span className="w-28 text-slate-500">Arrow & Spine</span><span className="text-slate-800">: {selectedAthlete.equipment?.arrowBrand || ''} (Spine {selectedAthlete.equipment?.arrowSpine || '-'})</span></div>
                <div className="flex"><span className="w-28 text-slate-500">Catatan Sight</span><span className="text-slate-800 truncate">: {selectedAthlete.equipment?.sightMarkNotes || '-'}</span></div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-6 text-center">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-[10px] uppercase font-bold text-amber-800">Skor Tertinggi</p>
                <p className="text-xl font-black text-amber-950 font-mono">{highestScore}</p>
                <p className="text-[10px] text-amber-700">dari 360 poin (6x6)</p>
              </div>
              <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
                <p className="text-[10px] uppercase font-bold text-sky-800">Rata-Rata Scoring</p>
                <p className="text-xl font-black text-sky-950 font-mono">{avgScore}</p>
                <p className="text-[10px] text-sky-700">{athleteScores.length} sesi kualifikasi</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-[10px] uppercase font-bold text-emerald-800">Disiplin Presensi</p>
                <p className="text-xl font-black text-emerald-950 font-mono">{attendanceRate}%</p>
                <p className="text-[10px] text-emerald-700">{hadirCount} dari {totalAtt} sesi</p>
              </div>
            </div>

            {/* Tabel Riwayat Scoring Latihan */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 border-b border-slate-300 pb-1 mb-2">
                <Target className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
                  Riwayat Skor & Uji Tanding Terakhir
                </h3>
              </div>

              {athleteScores.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">Belum ada catatan scoring latihan tersimpan.</p>
              ) : (
                <table className="w-full text-left text-xs border-collapse border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-2 border border-slate-200">Tanggal</th>
                      <th className="p-2 border border-slate-200">Jarak & Target</th>
                      <th className="p-2 border border-slate-200 text-center">10s</th>
                      <th className="p-2 border border-slate-200 text-center">Xs</th>
                      <th className="p-2 border border-slate-200 text-center">Rata2/Panah</th>
                      <th className="p-2 border border-slate-200 text-right">Total Skor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {athleteScores.slice(0, 5).map((s) => (
                      <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-2 border border-slate-200 font-medium">{formatDateIndo(s.date)}</td>
                        <td className="p-2 border border-slate-200">
                          {s.distanceMeters}m ({s.targetFaceType})
                        </td>
                        <td className="p-2 border border-slate-200 text-center font-mono">{s.tensCount}</td>
                        <td className="p-2 border border-slate-200 text-center font-mono text-amber-700 font-bold">{s.xCount}</td>
                        <td className="p-2 border border-slate-200 text-center font-mono">{s.averagePerArrow.toFixed(2)}</td>
                        <td className="p-2 border border-slate-200 text-right font-mono font-bold text-slate-900">
                          {s.totalScore} / {s.maxPossibleScore}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Tabel Status Pembayaran SPP */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 border-b border-slate-300 pb-1 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
                  Riwayat Iuran SPP Bulanan
                </h3>
              </div>

              <table className="w-full text-left text-xs border-collapse border border-slate-200">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="p-2 border border-slate-200">Bulan/Periode</th>
                    <th className="p-2 border border-slate-200">Jumlah</th>
                    <th className="p-2 border border-slate-200">Status</th>
                    <th className="p-2 border border-slate-200">Tgl Bayar / Metode</th>
                    <th className="p-2 border border-slate-200">No Kuitansi</th>
                  </tr>
                </thead>
                <tbody>
                  {athleteSPP.slice(0, 4).map((p) => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="p-2 border border-slate-200 font-semibold">{formatMonthYearIndo(p.monthYear)}</td>
                      <td className="p-2 border border-slate-200 font-mono">{formatRupiah(p.amount)}</td>
                      <td className="p-2 border border-slate-200">
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
                      <td className="p-2 border border-slate-200 text-slate-600">
                        {p.paidDate ? `${formatDateIndo(p.paidDate)} (${p.paymentMethod || 'Transfer'})` : '-'}
                      </td>
                      <td className="p-2 border border-slate-200 font-mono text-slate-500">{p.receiptNumber || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Catatan Pelatih & Tanda Tangan */}
            <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 text-xs mb-6">
              <p className="font-bold text-slate-800 mb-1">Catatan & Saran Pelatih:</p>
              <p className="text-slate-700 italic">
                {selectedAthlete.notes || 'Pertahankan disiplin latihan rutin dan konsistensi form saat pelepasan panah. Tingkatkan porsi latihan fisik SPT (Specific Physical Training).'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4 text-xs text-center">
              <div>
                <p className="text-slate-500">Mengetahui Orang Tua / Wali,</p>
                <div className="h-14"></div>
                <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block min-w-[140px]">
                  ( {selectedAthlete.parentName || 'Orang Tua / Wali'} )
                </p>
              </div>

              <div>
                <p className="text-slate-500">Pelatih Kepala Panahan,</p>
                <div className="h-14"></div>
                <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block min-w-[140px]">
                  ( {clubSettings.coachName} )
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
