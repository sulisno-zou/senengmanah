import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  MapPin,
  Phone,
  Award,
  Calendar,
  AlertTriangle,
  UserX,
  Lock,
  Building2,
} from 'lucide-react';
import { Athlete, ClubSettings, UserAccount } from '../types';
import { formatDateIndo } from '../utils/formatters';

interface CardVerificationModalProps {
  athleteId: string;
  athletes: Athlete[];
  clubSettings: ClubSettings;
  currentUser?: UserAccount;
  onClose: () => void;
  onSelectAthleteToVerify?: (athleteId: string) => void;
  onApproveKTA?: (athleteId: string) => void;
}

export const CardVerificationModal: React.FC<CardVerificationModalProps> = ({
  athleteId,
  athletes,
  clubSettings,
  currentUser,
  onClose,
  onSelectAthleteToVerify,
  onApproveKTA,
}) => {
  const [selectedId, setSelectedId] = useState<string>(athleteId);
  const [scanInput, setScanInput] = useState<string>('');

  const currentAthlete = athletes.find((a) => a.id === selectedId) || athletes[0];

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isAdmin = currentUser?.role === 'admin';
  const canManageKTA = isSuperAdmin || isAdmin;

  // Determine KTA Status
  const ktaStatus = currentAthlete?.ktaStatus || (currentAthlete?.active === false ? 'NONAKTIF' : 'PENDING');
  const isApproved = currentAthlete && ktaStatus === 'APPROVED' && currentAthlete.active !== false;
  const isPending = currentAthlete && ktaStatus === 'PENDING';
  const isInactive = currentAthlete && (ktaStatus === 'NONAKTIF' || currentAthlete.active === false);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    const query = scanInput.trim().toLowerCase();
    const found = athletes.find(
      (a) =>
        a.memberNo.toLowerCase().includes(query) ||
        a.name.toLowerCase().includes(query) ||
        a.id.toLowerCase() === query
    );
    if (found) {
      setSelectedId(found.id);
      setScanInput('');
    } else {
      alert(`Data atlet dengan ID / Nama "${scanInput}" tidak ditemukan dalam database.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-blue-500/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Verifikasi Kartu Anggota Digital</span>
              </h3>
              <p className="text-xs text-blue-400 font-mono">Hasil Pemindaian Barcode / QR Code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick ID Lookup Scanner Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800">
          <form onSubmit={handleLookup} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Simulasi scan: Masukkan No. ID / Nama atlet..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bold text-xs rounded-lg uppercase tracking-wider transition shadow-sm"
            >
              Cek Barcode
            </button>
          </form>

          {/* Quick Athlete Dropdown */}
          {athletes.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-400">Pilih Atlet:</span>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-pink-500 font-semibold flex-1"
              >
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.memberNo} - {a.name} ({a.ktaStatus === 'APPROVED' ? 'Aktif' : a.ktaStatus === 'NONAKTIF' ? 'Nonaktif' : 'Pending'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Verification Verified Content */}
        {currentAthlete && (
          <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-gradient-to-b from-slate-900 to-slate-950">
            {/* Status Verification Badge */}
            {isApproved ? (
              <div className="space-y-3 animate-fadeIn">
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/25 to-blue-500/15 border border-emerald-500/40 flex items-center gap-3.5 shadow-lg shadow-emerald-950/30">
                  <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-emerald-500/40">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-300 uppercase tracking-wider">
                      TERVERIFIKASI RESMI & AKTIF
                    </h4>
                    <p className="text-xs text-slate-200 font-medium">
                      Nomor Anggota & KTA Digital Sah Terdaftar di {clubSettings.clubName}
                    </p>
                  </div>
                </div>

                {/* Mandated Official Statement */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border-2 border-emerald-500/50 text-xs text-emerald-200 flex items-start gap-2.5 shadow-inner">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-emerald-300 text-xs uppercase tracking-wide">
                      Pernyataan Resmi Keanggotaan:
                    </p>
                    <p className="text-slate-100 font-bold text-[11.5px] mt-0.5 leading-relaxed">
                      "Anggota Resmi Seneng Manah, Segala penyalahgunaan KTA adalah tanggung jawab pemegang."
                    </p>
                  </div>
                </div>
              </div>
            ) : isPending ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-start gap-3.5 animate-fadeIn">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-lg shadow-amber-500/30">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-amber-300 uppercase tracking-wide">
                    persetujuan KTA Altit dalam proses kelayakan
                  </h4>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    Nomor anggota ini sedang dalam proses verifikasi kelayakan dan belum disetujui untuk penerbitan KTA Digital resmi oleh Super Admin/Admin.
                  </p>
                  {canManageKTA && onApproveKTA && (
                    <button
                      onClick={() => onApproveKTA(currentAthlete.id)}
                      className="mt-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition"
                    >
                      Setujui KTA Sekarang
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 flex items-center gap-3.5 animate-fadeIn">
                <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-rose-500/30">
                  <UserX className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-rose-400 uppercase tracking-wide">
                    KTA TELAH DINONAKTIFKAN
                  </h4>
                  <p className="text-xs text-rose-200/90">
                    {currentAthlete.leaveReason || 'Anggota telah berstatus keluar / nonaktif dari klub.'}
                  </p>
                </div>
              </div>
            )}

            {/* Main Athlete Verified Card */}
            <div className={`bg-slate-800/80 border rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden ${
              isPending ? 'border-amber-500/30' : isInactive ? 'border-rose-500/30' : 'border-slate-700/80'
            }`}>
              {/* Photo and Primary Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="relative">
                  <img
                    src={currentAthlete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                    alt={currentAthlete.name}
                    className={`w-24 h-28 object-cover rounded-xl border-2 shadow-md bg-slate-900 ${
                      isApproved ? 'border-pink-500' : isPending ? 'border-amber-500' : 'border-rose-500 grayscale'
                    }`}
                  />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="inline-block px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 font-mono text-[10px] font-bold uppercase tracking-wider mb-1">
                    ID: {currentAthlete.memberNo}
                  </div>
                  <h3 className="text-lg font-black text-white leading-snug">
                    {currentAthlete.name}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
                      {currentAthlete.division}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                      {currentAthlete.ageCategory} ({currentAthlete.gender === 'L' ? 'Putra' : 'Putri'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-700/60 text-xs">
                <div className="flex items-start space-x-2">
                  <Building2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Klub Panahan:</span>
                    <span className="font-semibold text-slate-200">{clubSettings.clubName}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Calendar className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Tgl Lahir & Bergabung:</span>
                    <span className="font-medium text-slate-300">
                      {formatDateIndo(currentAthlete.birthDate)} (Join: {formatDateIndo(currentAthlete.joinDate)})
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Alamat Domisili:</span>
                    <span className="font-medium text-slate-300">{currentAthlete.address || 'Kota Batu, Jawa Timur'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Verifikasi Barcode Real-time</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
