import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, QrCode, MapPin, Phone, Award, UserCheck, Calendar, ShieldAlert, Sparkles, Building2 } from 'lucide-react';
import { Athlete, ClubSettings } from '../types';
import { formatDateIndo } from '../utils/formatters';

interface CardVerificationModalProps {
  athleteId: string;
  athletes: Athlete[];
  clubSettings: ClubSettings;
  onClose: () => void;
  onSelectAthleteToVerify?: (athleteId: string) => void;
}

export const CardVerificationModal: React.FC<CardVerificationModalProps> = ({
  athleteId,
  athletes,
  clubSettings,
  onClose,
  onSelectAthleteToVerify,
}) => {
  const [selectedId, setSelectedId] = useState<string>(athleteId);
  const [scanInput, setScanInput] = useState<string>('');

  const currentAthlete = athletes.find((a) => a.id === selectedId) || athletes[0];

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
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] text-slate-400">Pilih Atlet:</span>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-pink-500 font-semibold"
            >
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.memberNo} - {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Verification Verified Content */}
        {currentAthlete && (
          <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-gradient-to-b from-slate-900 to-slate-950">
            {/* Status Verification Badge */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/20 to-blue-500/10 border border-emerald-500/30 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wide">
                  TERVERIFIKASI RESMI
                </h4>
                <p className="text-xs text-slate-300">
                  Atlet aktif terdaftar pada {clubSettings.clubName}.
                </p>
              </div>
            </div>

            {/* Main Athlete Verified Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Photo and Primary Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="relative">
                  <img
                    src={currentAthlete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                    alt={currentAthlete.name}
                    className="w-24 h-28 object-cover rounded-xl border-2 border-pink-500 shadow-md bg-slate-900"
                  />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-white text-[10px] font-bold">
                    🏹
                  </div>
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
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                      {currentAthlete.ageCategory} ({currentAthlete.gender === 'L' ? 'Putra' : 'Putri'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail Items Grid (With NIK explicitly HIDDEN/Protected!) */}
              <div className="grid grid-cols-1 gap-2.5 pt-3 border-t border-slate-700/60 text-xs">
                {/* 1. Alamat (Ditampilkan sesuai instruksi) */}
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Alamat Domisili:</p>
                    <p className="text-slate-200 font-medium">{currentAthlete.address || 'Kota Batu, Jawa Timur'}</p>
                  </div>
                </div>

                {/* 2. Tempat & Tanggal Lahir */}
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50 flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Tempat & Tanggal Lahir:</p>
                    <p className="text-slate-200 font-medium">
                      {currentAthlete.birthPlace}, {formatDateIndo(currentAthlete.birthDate)}
                    </p>
                  </div>
                </div>

                {/* 3. NIK PRIVACY NOTICE (NIK DISEMBUNYIKAN DEMI PRIVASI) */}
                <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/30 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase font-bold text-purple-300">Nomor Induk Kependudukan (NIK):</p>
                      <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/30 text-purple-200 rounded font-mono font-bold uppercase">
                        Disembunyikan
                      </span>
                    </div>
                    <p className="text-slate-400 font-mono text-xs mt-0.5 tracking-wider">
                      ●●●●●●●●●●●●●●●● (Dilindungi Sistem Privasi)
                    </p>
                  </div>
                </div>

                {/* 4. Club & Info */}
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50 flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Klub & Lapangan Latihan:</p>
                    <p className="text-slate-200 font-medium">{clubSettings.clubName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{clubSettings.trainingLocation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Bar */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">SENENG MANAH ARCHERY SCANNER</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:opacity-90 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
