import React, { useState } from 'react';
import { X, Lock, User, ShieldCheck, Key, CheckCircle2, AlertCircle, Sparkles, LogIn } from 'lucide-react';
import { UserAccount, ClubSettings, Athlete } from '../types';

interface RoleLoginModalProps {
  currentUser: UserAccount;
  users: UserAccount[];
  athletes: Athlete[];
  clubSettings: ClubSettings;
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: UserAccount) => void;
  onUpdateSuperAdminCredentials?: (username: string, pass: string) => void;
}

export const RoleLoginModal: React.FC<RoleLoginModalProps> = ({
  currentUser,
  users,
  athletes,
  clubSettings,
  isOpen,
  onClose,
  onSelectUser,
  onUpdateSuperAdminCredentials,
}) => {
  if (!isOpen) return null;

  const [inputUsername, setInputUsername] = useState<string>('');
  const [inputPassword, setInputPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isManagingSuperCreds, setIsManagingSuperCreds] = useState<boolean>(false);

  // Form for Super admin changing credentials
  const [newSuperUsername, setNewSuperUsername] = useState<string>(clubSettings.superAdminUsername || 'zou');
  const [newSuperPassword, setNewSuperPassword] = useState<string>(clubSettings.superAdminPassword || 'senengm4n4h');
  const [superCredsSuccess, setSuperCredsSuccess] = useState<string>('');

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanUsername = inputUsername.trim().toLowerCase();
    const cleanPassword = inputPassword.trim();
    const superPass = (clubSettings.superAdminPassword || 'senengm4n4h').trim();
    const configuredSuperUser = (clubSettings.superAdminUsername || 'zou').toLowerCase();

    // 1. Check Super Admin Credentials (supports 'zou', 'superadmin', 'admin', or configured username)
    if (
      (cleanUsername === configuredSuperUser ||
        cleanUsername === 'superadmin' ||
        cleanUsername === 'admin' ||
        cleanUsername === 'zou') &&
      cleanPassword === superPass
    ) {
      const superUser = users.find((u) => u.role === 'super_admin') || {
        id: 'usr-super',
        username: clubSettings.superAdminUsername || 'zou',
        name: `Super Admin (${clubSettings.superAdminUsername || 'Zou'})`,
        role: 'super_admin',
      };
      onSelectUser(superUser);
      onClose();
      return;
    }

    // 2. Check Other User Accounts
    const matchedUser = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername ||
        (u.phone && u.phone.replace(/[^0-9]/g, '') === cleanUsername.replace(/[^0-9]/g, ''))
    );

    if (matchedUser) {
      const expectedPass = matchedUser.password || 'password123';
      if (cleanPassword !== expectedPass) {
        setLoginError('Password yang Anda masukkan salah. Silakan coba kembali.');
        return;
      }

      onSelectUser(matchedUser);
      onClose();
      return;
    }

    // 3. Check Athlete by Member Number / Nickname / WhatsApp if registered
    const matchedAthlete = athletes.find(
      (a) =>
        a.memberNo.toLowerCase() === cleanUsername ||
        (a.username && a.username.toLowerCase() === cleanUsername) ||
        (a.phone && a.phone.replace(/[^0-9]/g, '') === cleanUsername.replace(/[^0-9]/g, ''))
    );

    if (matchedAthlete) {
      const athletePass = matchedAthlete.password || 'password123';
      if (cleanPassword !== athletePass) {
        setLoginError('Password untuk akun atlit ini salah.');
        return;
      }

      const athleteAccount: UserAccount = {
        id: `usr-${matchedAthlete.id}`,
        username: matchedAthlete.username || matchedAthlete.memberNo.toLowerCase(),
        name: matchedAthlete.name,
        role: matchedAthlete.userRole || 'atlit',
        athleteId: matchedAthlete.id,
        phone: matchedAthlete.phone,
      };

      onSelectUser(athleteAccount);
      onClose();
      return;
    }

    setLoginError('Username atau Nomor Anggota tidak ditemukan. Hubungi Administrator klub.');
  };

  const handleSaveSuperCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuperUsername || !newSuperPassword) return;
    if (onUpdateSuperAdminCredentials) {
      onUpdateSuperAdminCredentials(newSuperUsername, newSuperPassword);
      setSuperCredsSuccess('Kredensial Super Admin berhasil diperbarui!');
      setTimeout(() => {
        setSuperCredsSuccess('');
        setIsManagingSuperCreds(false);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-pink-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Login Autentikasi Pengguna</h3>
              <p className="text-xs text-slate-400">{clubSettings.clubName}</p>
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
          {!isManagingSuperCreds ? (
            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div className="text-center space-y-1 pb-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-pink-500/10 text-pink-300 border border-pink-500/20">
                  <Lock className="w-3 h-3 text-pink-400" />
                  <span>Autentikasi Multi-Level (RBAC)</span>
                </div>
                <p className="text-xs text-slate-400">
                  Silakan masukkan username/nomor anggota dan password terdaftar Anda
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Username / No. Anggota / No. WA *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={inputUsername}
                    onChange={(e) => setInputUsername(e.target.value)}
                    placeholder="Contoh: zou / atlit_farhan / SM-BATU-001"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Password Akun *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 hover:from-pink-400 hover:via-purple-500 hover:to-blue-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-pink-500/20 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Sistem</span>
              </button>

              {/* Super Admin Manage Credentials Toggle (if currently logged in as Super Admin) */}
              {currentUser.role === 'super_admin' && (
                <div className="pt-2 border-t border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={() => setIsManagingSuperCreds(true)}
                    className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Ubah Password / Username Super Admin</span>
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleSaveSuperCredentials} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200">
                <h5 className="font-bold mb-1 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-purple-400" />
                  <span>Pengaturan Kredensial Super Admin</span>
                </h5>
                <p className="text-slate-300 text-[11px]">
                  Ubah username dan password super admin utama sistem Seneng Manah.
                </p>
              </div>

              {superCredsSuccess && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{superCredsSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Username Super Admin *</label>
                <input
                  type="text"
                  required
                  value={newSuperUsername}
                  onChange={(e) => setNewSuperUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500 font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Password Super Admin Baru *</label>
                <input
                  type="text"
                  required
                  value={newSuperPassword}
                  onChange={(e) => setNewSuperPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500 font-bold font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManagingSuperCreds(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

