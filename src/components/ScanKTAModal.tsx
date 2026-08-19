import React, { useState } from 'react';
import {
  QrCode,
  Search,
  X,
  UserCheck,
  CheckCircle2,
  ShieldAlert,
  Calendar,
  Phone,
  MapPin,
  IdCard,
  Building,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { Athlete, ClubSettings } from '../types';
import { formatDateIndo } from '../utils/formatters';

interface ScanKTAModalProps {
  isOpen: boolean;
  onClose: () => void;
  athletes: Athlete[];
  clubSettings: ClubSettings;
}

export const ScanKTAModal: React.FC<ScanKTAModalProps> = ({
  isOpen,
  onClose,
  athletes,
  clubSettings,
}) => {
  const [query, setQuery] = useState('');
  const [matchedAthlete, setMatchedAthlete] = useState<Athlete | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

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
        a.name.toUpperCase().includes(trimmed)
    );

    setMatchedAthlete(found || null);
    setHasSearched(true);
  };

  const handleSelectQuick = (athlete: Athlete) => {
    setQuery(athlete.memberNo);
    setMatchedAthlete(athlete);
    setHasSearched(true);
  };

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
              <h3 className="text-base font-black text-white">Scan Barcode / Verifikasi KTA</h3>
              <p className="text-[11px] text-slate-400">
                Pemeriksaan keaslian Kartu Tanda Anggota atlet {clubSettings.clubName}
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
              Masukkan Nomor ID Atlet / Scan Barcode
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
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Uji Coba Scan Cepat Atlet:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {athletes.slice(0, 4).map((a) => (
                <button
                  key={a.id}
                  onClick={() => handleSelectQuick(a)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-pink-900/40 hover:border-pink-500/50 border border-slate-700 text-slate-200 text-xs font-medium transition"
                >
                  {a.name.split(' ')[0]} ({a.memberNo})
                </button>
              ))}
            </div>
          </div>

          {/* Result Section */}
          {hasSearched && (
            <div>
              {matchedAthlete ? (
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/40 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-xl space-y-4">
                  {/* Verified Badge */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>KTA Resmi Terverifikasi</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      ID: <strong className="text-white">{matchedAthlete.memberNo}</strong>
                    </span>
                  </div>

                  {/* Identity Card Presentation */}
                  <div className="flex items-start space-x-4">
                    <img
                      src={matchedAthlete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                      alt={matchedAthlete.name}
                      className="w-20 h-24 rounded-xl object-cover border-2 border-pink-500/60 shadow-md shrink-0"
                    />
                    <div className="space-y-1 text-xs">
                      <h4 className="text-base font-black text-white">{matchedAthlete.name}</h4>
                      <p className="text-pink-400 font-bold">
                        {matchedAthlete.division} • {matchedAthlete.ageCategory}
                      </p>
                      <div className="text-slate-300 pt-1 space-y-0.5">
                        <p className="flex items-center space-x-1.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{clubSettings.clubName}</span>
                        </p>
                        <p className="flex items-center space-x-1.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>
                            {matchedAthlete.birthPlace}, {formatDateIndo(matchedAthlete.birthDate)}
                          </span>
                        </p>
                        <p className="flex items-center space-x-1.5">
                          <MapPin className="w-3 h-3 text-pink-400" />
                          <span className="text-slate-200">{matchedAthlete.address}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Notice (NIK Hidden) */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-2">
                      <EyeOff className="w-4 h-4 text-amber-400" />
                      <span>
                        NIK KTP/KIA: <strong className="text-slate-300 font-mono">•••• •••• •••• 9821</strong>
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800">
                      Disembunyikan (Privasi)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-6 text-center space-y-2">
                  <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto" />
                  <h4 className="text-sm font-bold text-white">ID Anggota Tidak Ditemukan</h4>
                  <p className="text-xs text-rose-300">
                    Nomor ID atau barcode "{query}" tidak terdaftar di database resmi {clubSettings.clubName}.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
