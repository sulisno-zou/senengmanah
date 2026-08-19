import React, { useState } from 'react';
import {
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Send,
  Sparkles,
  Award,
  AlertCircle,
  FileCheck,
  UserCheck,
  Eye,
  Trash2,
} from 'lucide-react';
import { RegistrationRequest, UserAccount, Athlete, BowDivision, AgeCategory } from '../types';

interface RegistrationsManagerViewProps {
  registrations: RegistrationRequest[];
  athletes: Athlete[];
  currentUser: UserAccount;
  onApproveRegistration: (regId: string, memberNo: string) => void;
  onRejectRegistration: (regId: string, reason: string) => void;
  onDeleteRegistration?: (regId: string) => void;
}

export const RegistrationsManagerView: React.FC<RegistrationsManagerViewProps> = ({
  registrations,
  athletes,
  currentUser,
  onApproveRegistration,
  onRejectRegistration,
  onDeleteRegistration,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('MENUNGGU_VERIFIKASI');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReg, setSelectedReg] = useState<RegistrationRequest | null>(null);

  // Approval modal state
  const [approvingReg, setApprovingReg] = useState<RegistrationRequest | null>(null);
  const [customMemberNo, setCustomMemberNo] = useState('');

  // Rejection modal state
  const [rejectingReg, setRejectingReg] = useState<RegistrationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Counters
  const pendingCount = registrations.filter((r) => r.status === 'MENUNGGU_VERIFIKASI').length;
  const approvedCount = registrations.filter((r) => r.status === 'DISETUJUI').length;
  const rejectedCount = registrations.filter((r) => r.status === 'DITOLAK').length;

  // Filtered registrations
  const filteredList = registrations.filter((r) => {
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchQuery =
      r.name.toLowerCase().includes(q) ||
      r.regNumber.toLowerCase().includes(q) ||
      r.nik.includes(q) ||
      r.phone.includes(q) ||
      r.division.toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });

  // Next suggested member ID
  const generateNextMemberNo = () => {
    const num = athletes.length + 1;
    return `SM-BATU-${String(num).padStart(3, '0')}`;
  };

  const handleOpenApproveModal = (reg: RegistrationRequest) => {
    setApprovingReg(reg);
    setCustomMemberNo(generateNextMemberNo());
  };

  const handleConfirmApproval = () => {
    if (!approvingReg) return;
    onApproveRegistration(approvingReg.id, customMemberNo.trim() || generateNextMemberNo());
    setApprovingReg(null);
  };

  const handleConfirmRejection = () => {
    if (!rejectingReg) return;
    onRejectRegistration(rejectingReg.id, rejectReason.trim() || 'Permohonan belum memenuhi kriteria klub.');
    setRejectingReg(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* View Header */}
      <div className="bg-slate-900/90 border border-purple-500/20 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <UserPlus className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white">
                  Verifikasi Pendaftar Anggota Baru
                </h1>
                <p className="text-xs text-slate-400">
                  Kelola dan verifikasi permohonan biodata calon atlet panahan yang mendaftar secara online.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Menunggu: <strong className="text-amber-300 font-bold">{pendingCount}</strong></span>
            </div>
          </div>
        </div>

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-5">
          <button
            onClick={() => setFilterStatus('MENUNGGU_VERIFIKASI')}
            className={`p-3 rounded-xl border text-left transition-all ${
              filterStatus === 'MENUNGGU_VERIFIKASI'
                ? 'bg-amber-500/20 border-amber-500/50 shadow-lg shadow-amber-950/30'
                : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <span className="truncate">Menunggu</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-lg sm:text-2xl font-black text-white mt-1">{pendingCount}</p>
          </button>

          <button
            onClick={() => setFilterStatus('DISETUJUI')}
            className={`p-3 rounded-xl border text-left transition-all ${
              filterStatus === 'DISETUJUI'
                ? 'bg-emerald-500/20 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span className="truncate">Disetujui</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-lg sm:text-2xl font-black text-white mt-1">{approvedCount}</p>
          </button>

          <button
            onClick={() => setFilterStatus('ALL')}
            className={`p-3 rounded-xl border text-left transition-all ${
              filterStatus === 'ALL'
                ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-950/30'
                : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-purple-400">
              <span className="truncate">Semua Data</span>
              <UserCheck className="w-4 h-4" />
            </div>
            <p className="text-lg sm:text-2xl font-black text-white mt-1">{registrations.length}</p>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, No. Registrasi, NIK, WhatsApp, divisi..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:border-pink-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'MENUNGGU_VERIFIKASI', label: 'Menunggu' },
            { id: 'DISETUJUI', label: 'Disetujui' },
            { id: 'DITOLAK', label: 'Ditolak' },
            { id: 'ALL', label: 'Semua' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === st.id
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* List of Registration Requests */}
      {filteredList.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <UserPlus className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">Tidak ada data pendaftar</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ditemukan permohonan pendaftaran anggota baru pada status ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((reg) => (
            <div
              key={reg.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all"
            >
              <div>
                {/* Card Top: Reg No & Status Badge */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                      {reg.regNumber}
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-1">{reg.name}</h3>
                    {reg.nickname && (
                      <span className="text-xs text-slate-400">Panggilan: {reg.nickname}</span>
                    )}
                  </div>

                  <div>
                    {reg.status === 'MENUNGGU_VERIFIKASI' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        MENUNGGU VERIFIKASI
                      </span>
                    ) : reg.status === 'DISETUJUI' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> DISETUJUI
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        DITOLAK
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs mt-3">
                  <div>
                    <span className="text-slate-500 block">NIK:</span>
                    <span className="font-mono text-slate-300">
                      {reg.nik.slice(0, 6)}******{reg.nik.slice(-4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Gender & Usia:</span>
                    <span className="font-semibold text-slate-200">
                      {reg.gender === 'L' ? 'Laki-laki' : 'Perempuan'} ({reg.ageCategory})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Divisi Busur:</span>
                    <span className="font-semibold text-purple-300">{reg.division}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tempat/Tgl Lahir:</span>
                    <span className="text-slate-300">{reg.birthPlace}, {reg.birthDate}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Alamat Domisili:</span>
                    <span className="text-slate-300 line-clamp-1">{reg.address}</span>
                  </div>
                  {reg.parentName && (
                    <div className="col-span-2">
                      <span className="text-slate-500 block">Orang Tua / Wali:</span>
                      <span className="text-slate-300">
                        {reg.parentName} {reg.parentPhone ? `(${reg.parentPhone})` : ''}
                      </span>
                    </div>
                  )}
                  {reg.experienceNotes && (
                    <div className="col-span-2 bg-slate-950 p-2 rounded-lg text-[11px] text-slate-400 italic">
                      &quot;{reg.experienceNotes}&quot;
                    </div>
                  )}
                </div>

                {reg.assignedMemberNo && (
                  <div className="mt-3 p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">KTA Resmi Diterbitkan:</span>
                    <span className="font-mono font-black text-white">{reg.assignedMemberNo}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <a
                  href={`https://wa.me/${reg.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <div className="flex items-center gap-1.5">
                  {reg.status === 'MENUNGGU_VERIFIKASI' && (
                    <>
                      <button
                        onClick={() => {
                          setRejectingReg(reg);
                          setRejectReason('');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40"
                      >
                        Tolak
                      </button>

                      <button
                        onClick={() => handleOpenApproveModal(reg)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-slate-950 font-black shadow-md flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Setujui & Buat KTA
                      </button>
                    </>
                  )}

                  {onDeleteRegistration && (
                    <button
                      onClick={() => onDeleteRegistration(reg.id)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                      title="Hapus Data"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      {approvingReg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Setujui Pendaftaran Anggota
                </h3>
                <p className="text-xs text-slate-400">
                  Calon atlet akan resmi terdaftar di database klub dan diterbitkan KTA.
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Calon:</span>
                <span className="font-bold text-white">{approvingReg.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Divisi & Kategori:</span>
                <span className="text-purple-300 font-semibold">{approvingReg.division} ({approvingReg.ageCategory})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nomor WhatsApp:</span>
                <span className="text-slate-300">{approvingReg.phone}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nomor Keanggotaan (ID KTA Resmi)
              </label>
              <input
                type="text"
                value={customMemberNo}
                onChange={(e) => setCustomMemberNo(e.target.value)}
                placeholder="SM-BATU-007"
                className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-emerald-300 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Format nomor otomatis: SM-BATU-XXX
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setApprovingReg(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmApproval}
                className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg"
              >
                Konfirmasi & Terbitkan KTA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingReg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Tolak Pendaftaran
                </h3>
                <p className="text-xs text-slate-400">
                  Tuliskan alasan penolakan yang akan dapat dilihat oleh pendaftar saat cek status.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Alasan Penolakan
              </label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Kuota divisi penuh untuk bulan ini / Data NIK tidak terverifikasi..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl p-3 text-xs text-slate-200 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingReg(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmRejection}
                className="px-5 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg"
              >
                Tolak Pendaftaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
