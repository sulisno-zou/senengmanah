import React, { useState } from 'react';
import { X, KeyRound, User, Lock, CheckCircle2, AlertCircle, Sparkles, Send, ShieldAlert } from 'lucide-react';
import { UserAccount, Athlete, ProfileUpdateRequest } from '../types';

interface AthleteChangeCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  currentAthlete?: Athlete;
  onSubmitRequest: (request: Omit<ProfileUpdateRequest, 'id' | 'requestedAt' | 'status'>) => void;
  pendingRequest?: ProfileUpdateRequest;
}

export const AthleteChangeCredentialsModal: React.FC<AthleteChangeCredentialsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentAthlete,
  onSubmitRequest,
  pendingRequest,
}) => {
  if (!isOpen) return null;

  const [newUsername, setNewUsername] = useState<string>(currentUser.username || '');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUsername = newUsername.trim().toLowerCase();
    const cleanPassword = newPassword.trim();

    if (!cleanUsername) {
      setError('Username baru tidak boleh kosong.');
      return;
    }

    if (cleanPassword && cleanPassword.length < 6) {
      setError('Password baru minimal harus 6 karakter.');
      return;
    }

    if (cleanPassword && cleanPassword !== confirmPassword.trim()) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }

    if (cleanUsername === currentUser.username.toLowerCase() && !cleanPassword) {
      setError('Anda belum mengubah username atau password.');
      return;
    }

    onSubmitRequest({
      athleteId: currentAthlete?.id || currentUser.athleteId || currentUser.id,
      athleteName: currentAthlete?.name || currentUser.name,
      currentUsername: currentUser.username,
      newUsername: cleanUsername !== currentUser.username.toLowerCase() ? cleanUsername : undefined,
      newPassword: cleanPassword ? cleanPassword : undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-pink-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Ubah Username & Password</h3>
              <p className="text-xs text-pink-400 font-bold">Verifikasi & Persetujuan Admin</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition border border-slate-700/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {pendingRequest && pendingRequest.status === 'MENUNGGU_VERIFIKASI' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Permohonan Perubahan Sedang Ditinjau</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Permohonan perubahan kredensial akun Anda telah dikirim dan sedang menunggu persetujuan dari Super Admin atau Admin Klub demi keamanan data.
                </p>
                <div className="mt-2 pt-2 border-t border-amber-500/20 space-y-1 font-mono text-[11px]">
                  {pendingRequest.newUsername && (
                    <p>
                      <span className="text-slate-400">Username Baru:</span> <span className="font-bold text-white">{pendingRequest.newUsername}</span>
                    </p>
                  )}
                  {pendingRequest.newPassword && (
                    <p>
                      <span className="text-slate-400">Password Baru:</span> <span className="font-bold text-emerald-400">•••••••• (Dienkripsi)</span>
                    </p>
                  )}
                  <p>
                    <span className="text-slate-400">Waktu Pengajuan:</span> <span className="text-slate-300">{new Date(pendingRequest.requestedAt).toLocaleString('id-ID')}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/20 text-xs text-slate-300 space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>Aturan Perubahan Akun Atlet</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Untuk menjaga integritas data atlet, perubahan username atau password akan diverifikasi oleh Admin/Super Admin sebelum aktif.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {isSuccess && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Permohonan berhasil dikirim ke Admin untuk disetujui!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Username Akun (Baru / Tetap)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Contoh: bagas_archery"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-mono font-bold"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Username saat ini: @{currentUser.username}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Password Baru (Kosongkan jika tidak diubah)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-mono font-bold"
                  />
                </div>
              </div>

              {newPassword && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Konfirmasi Password Baru *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang password baru"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 hover:opacity-90 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-pink-500/20 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pengajuan</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
