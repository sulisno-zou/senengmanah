import React, { useState } from 'react';
import {
  QrCode,
  Search,
  X,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Phone,
  MapPin,
  IdCard,
  Building,
  UserX,
  Lock,
} from 'lucide-react';
import { Athlete, ClubSettings, UserAccount } from '../types';
import { formatDateIndo } from '../utils/formatters';

interface ScanKTAModalProps {
  isOpen: boolean;
  onClose: () => void;
  athletes: Athlete[];
  clubSettings: ClubSettings;
  currentUser?: UserAccount;
  onApproveKTA?: (athleteId: string) => void;
}

export const ScanKTAModal: React.FC<ScanKTAModalProps> = ({
  isOpen,
  onClose,
  athletes,
  clubSettings,
  currentUser,
  onApproveKTA,
}) => {
  const [query, setQuery] = useState('');
  const [matchedAthlete, setMatchedAthlete] = useState<Athlete | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isAdmin = currentUser?.role === 'admin';
  const canManageKTA = isSuperAdmin || isAdmin;

  const handleSearchOrScan = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setMatchedAthlete(null);
      setHasSearched(false);
      return;
    }

    // Try finding by memberNo, ID, or Name
    const found = athletes.find(
      (a) =>
        a.memberNo.toUpperCase() === trimmed ||
        a.id.toUpperCase() === trimmed ||
        a.name.toUpperCase().includes(trimmed) ||
        (a.phone && a.phone.includes(trimmed))
    );

    setMatchedAthlete(found || null);
    setHasSearched(true);
  };

  const handleSelectQuick = (athlete: Athlete) => {
    setQuery(athlete.memberNo);
    setMatchedAthlete(athlete);
    setHasSearched(true);
  };

  // Determine KTA Status
  const ktaStatus = matchedAthlete?.ktaStatus || (matchedAthlete?.active === false ? 'NONAKTIF' : 'PENDING');
  const isApproved = matchedAthlete && ktaStatus === 'APPROVED' && matchedAthlete.active !== false;
  const isPending = matchedAthlete && ktaStatus === 'PENDING';
  const isInactive = matchedAthlete && (ktaStatus === 'NONAKTIF' || matchedAthlete.active === false);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-pink-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-pink-500/20">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Scan Barcode / Cek KTA Atlet</h3>
              <p className="text-[11px] text-slate-400">
                Pemeriksaan keaslian dan status kelayakan KTA {clubSettings.clubName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Scanner / Barcode Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Masukkan Nomor Anggota / Scan Barcode KTA
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  handleSearchOrScan(e.target.value);
                }}
                placeholder="Contoh: SM-BATU-001 atau nama atlet..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-pink-500 placeholder-slate-500 shadow-inner"
                autoFocus
              />
            </div>
          </div>

          {/* Quick Select Buttons */}
          {athletes.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Uji Coba Scan Cepat Atlet:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {athletes.slice(0, 5).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleSelectQuick(a)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
                      a.ktaStatus === 'APPROVED'
                        ? 'bg-slate-800 hover:bg-emerald-950/40 border-slate-700 hover:border-emerald-500/50 text-emerald-300'
                        : a.ktaStatus === 'NONAKTIF' || a.active === false
                        ? 'bg-slate-800 hover:bg-rose-950/40 border-slate-700 hover:border-rose-500/50 text-rose-300'
                        : 'bg-slate-800 hover:bg-amber-950/40 border-slate-700 hover:border-amber-500/50 text-amber-300'
                    }`}
                  >
                    {a.name.split(' ')[0]} ({a.memberNo})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Result Section */}
          {hasSearched && (
            <div>
              {matchedAthlete ? (
                isPending ? (
                  /* ⚠️ PENDING KTA APPROVAL RESULT */
                  <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-2xl p-5 shadow-xl space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>DALAM PROSES KELAYAKAN</span>
                      </div>
                      <span className="text-[11px] font-mono text-amber-200/80">
                        {matchedAthlete.memberNo}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1 text-xs">
                      <h4 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>persetujuan KTA Altit dalam proses kelayakan</span>
                      </h4>
                      <p className="text-amber-200/90 text-[11px] leading-relaxed">
                        Data nomor anggota terdaftar dalam sistem, namun Kartu Tanda Anggota (KTA) resmi belum disetujui. Penerbitan KTA memerlukan verifikasi kelayakan oleh Super Admin atau Admin Klub.
                      </p>
                    </div>

                    <div className="flex items-start space-x-3 text-xs">
                      <img
                        src={matchedAthlete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                        alt={matchedAthlete.name}
                        className="w-16 h-20 rounded-xl object-cover border border-amber-500/40 shadow-sm shrink-0"
                      />
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-white">{matchedAthlete.name}</h4>
                        <p className="text-amber-400 font-semibold">
                          Divisi {matchedAthlete.division} • {matchedAthlete.ageCategory}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          Tgl Daftar: {formatDateIndo(matchedAthlete.joinDate)}
                        </p>
                      </div>
                    </div>

                    {canManageKTA && onApproveKTA && (
                      <div className="pt-2 border-t border-slate-800 flex justify-end">
                        <button
                          onClick={() => {
                            onApproveKTA(matchedAthlete.id);
                            handleSearchOrScan(matchedAthlete.memberNo);
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Setujui KTA Sekarang</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : isInactive ? (
                  /* 🚫 INACTIVE / LEAVING ATHLETE RESULT */
                  <div className="bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border-2 border-rose-500/60 rounded-2xl p-5 shadow-xl space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-black uppercase tracking-wider">
                        <UserX className="w-3.5 h-3.5 text-rose-400" />
                        <span>KTA TELAH DINONAKTIFKAN</span>
                      </div>
                      <span className="text-[11px] font-mono text-rose-200/80">
                        {matchedAthlete.memberNo}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1 text-xs">
                      <h4 className="text-sm font-black text-rose-300 flex items-center gap-1.5">
                        <UserX className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>KTA Tidak Berlaku / Dinonaktifkan</span>
                      </h4>
                      <p className="text-rose-200/90 text-[11px] leading-relaxed">
                        Atlet ini telah berstatus keluar dari keanggotaan klub. {matchedAthlete.leaveReason ? `Catatan: "${matchedAthlete.leaveReason}"` : ''}
                      </p>
                    </div>

                    <div className="flex items-start space-x-3 text-xs opacity-80">
                      <img
                        src={matchedAthlete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                        alt={matchedAthlete.name}
                        className="w-16 h-20 rounded-xl object-cover border border-rose-500/40 shadow-sm shrink-0 grayscale"
                      />
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-white">{matchedAthlete.name}</h4>
                        <p className="text-slate-400 font-semibold">
                          Divisi {matchedAthlete.division} • {matchedAthlete.ageCategory}
                        </p>
                        <p className="text-rose-400 text-[11px] font-bold">
                          Status: Nonaktif / Keluar
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ✅ APPROVED OFFICIAL KTA RESULT */
                  <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/40 border-2 border-emerald-500/60 rounded-2xl p-5 shadow-xl space-y-4 animate-fadeIn">
                    {/* Verified Badge */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>KTA RESMI TERVERIFIKASI & AKTIF</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        ID: <strong className="text-white">{matchedAthlete.memberNo}</strong>
                      </span>
                    </div>

                    {/* Identity Presentation */}
                    <div className="flex items-start space-x-4">
                      <img
                        src={matchedAthlete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                        alt={matchedAthlete.name}
                        className="w-20 h-24 rounded-xl object-cover border-2 border-emerald-500/60 shadow-md shrink-0"
                      />
                      <div className="space-y-1 text-xs">
                        <h4 className="text-base font-black text-white">{matchedAthlete.name}</h4>
                        <p className="text-pink-400 font-bold">
                          {matchedAthlete.division} • {matchedAthlete.ageCategory} ({matchedAthlete.gender === 'L' ? 'Putra' : 'Putri'})
                        </p>
                        <div className="text-slate-300 pt-1 space-y-0.5">
                          <p className="flex items-center space-x-1.5">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>{clubSettings.clubName}</span>
                          </p>
                          <p className="flex items-center space-x-1.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{matchedAthlete.birthPlace}, {formatDateIndo(matchedAthlete.birthDate)}</span>
                          </p>
                          <p className="flex items-center space-x-1.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Bergabung: {formatDateIndo(matchedAthlete.joinDate)}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Status KTA: <strong className="text-emerald-400">Aktif Resmi</strong></span>
                      <span className="font-mono text-slate-500">QR-VERIFIED-VALID</span>
                    </div>
                  </div>
                )
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">Data Atlet Tidak Ditemukan</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Nomor identitas atau nama &quot;{query}&quot; tidak terdaftar dalam database resmi {clubSettings.clubName}.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Verifikasi KTA Terhubung Real-Time Database</span>
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
