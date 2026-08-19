import React from 'react';
import {
  Menu,
  Target,
  Users,
  DollarSign,
  Activity,
  CalendarCheck,
  Sparkles,
  Settings,
  QrCode,
  CreditCard,
  LogOut,
  UserPlus,
  ArrowRightLeft,
  FolderArchive,
  Download,
  Cloud,
  Smartphone,
} from 'lucide-react';
import { ClubSettings, TabType, UserAccount, UserRole } from '../types';

interface HeaderNavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  clubSettings: ClubSettings;
  currentUser: UserAccount;
  pendingRegistrationsCount?: number;
  pendingProofsCount?: number;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenRoleLogin: () => void;
  onOpenMemberCardModal: () => void;
  onOpenVerificationModal: () => void;
  onOpenPaymentProofModal: () => void;
  onOpenDownloadAll?: () => void;
  onOpenAndroidInstall?: () => void;
  onLogout: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  activeTab,
  onTabChange,
  clubSettings,
  currentUser,
  pendingRegistrationsCount = 0,
  pendingProofsCount = 0,
  onToggleSidebar,
  onOpenSettings,
  onOpenRoleLogin,
  onOpenMemberCardModal,
  onOpenVerificationModal,
  onOpenPaymentProofModal,
  onOpenDownloadAll,
  onOpenAndroidInstall,
  onLogout,
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const isAthlete = currentUser.role === 'atlit' || currentUser.role === 'pelatih_atlit';

  // Role badge styling
  const roleBadgeMap: Record<UserRole, { label: string; color: string }> = {
    super_admin: { label: 'SUPER ADMIN', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    admin: { label: 'ADMIN KEGIATAN', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    pelatih_utama: { label: 'PELATIH UTAMA', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    pelatih: { label: 'PELATIH', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    pelatih_atlit: { label: 'PELATIH & ATLET', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    atlit: { label: 'ATLET', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  };

  const currentBadge = roleBadgeMap[currentUser.role] || { label: 'USER', color: 'bg-slate-700 text-slate-300 border-slate-600' };

  return (
    <header className="bg-slate-950/95 text-white sticky top-0 z-30 border-b border-pink-500/20 shadow-lg backdrop-blur-md">
      <div className="w-full px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Left: Hamburger Button (for Sidebar) & Club Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-pink-400 border border-pink-500/30 transition-all active:scale-95 flex items-center justify-center shrink-0"
              title="Buka Menu Samping"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0 min-w-0"
              onClick={() => onTabChange('dashboard')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-blue-600 p-0.5 shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
                <img
                  src={clubSettings.logoUrl}
                  alt={clubSettings.clubName}
                  className="w-full h-full object-cover rounded-[10px] bg-slate-900"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-white font-black text-xs sm:text-sm tracking-tight leading-tight drop-shadow-sm truncate">
                  {clubSettings.clubName}
                </h1>
                <p className="text-[9px] sm:text-[10px] text-pink-400 font-bold uppercase tracking-wider truncate">
                  Kota Batu • Sistem Terpadu
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Real-time Cloud Status */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400"
              title="Terhubung ke Firebase Cloud Database (Multi-Device Sync)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cloud Live</span>
            </div>

            {/* Quick Install Android Button */}
            {onOpenAndroidInstall && (
              <button
                onClick={onOpenAndroidInstall}
                className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 text-pink-300 border border-pink-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                title="Pasang Aplikasi di HP Android"
              >
                <Smartphone className="w-4 h-4 text-pink-400 animate-pulse" />
                <span className="hidden lg:inline">Pasang Android</span>
              </button>
            )}

            {/* Quick KTA / Scanner Button */}
            <button
              onClick={onOpenVerificationModal}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 text-xs font-bold transition flex items-center gap-1.5"
              title="Scan Barcode Kartu Anggota"
            >
              <QrCode className="w-4 h-4 text-pink-400" />
              <span className="hidden md:inline">Scan KTA</span>
            </button>

            {/* Quick Bukti SPP Button */}
            <button
              onClick={onOpenPaymentProofModal}
              className="relative p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold transition flex items-center gap-1.5"
              title="Bukti Transfer SPP"
            >
              <CreditCard className="w-4 h-4 text-pink-400" />
              <span className="hidden md:inline">{isAthlete ? 'Kirim SPP' : 'Verifikasi SPP'}</span>
              {pendingProofsCount > 0 && !isAthlete && (
                <span className="w-2 h-2 rounded-full bg-pink-500 absolute -top-0.5 -right-0.5 animate-pulse" />
              )}
            </button>

            {/* User Profile Pill & Quick Switch */}
            <button
              onClick={onOpenRoleLogin}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs transition"
              title="Ganti Akun / Role"
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-pink-500/50"
              />
              <div className="text-left hidden xl:block">
                <p className="text-[11px] font-bold text-white leading-none truncate max-w-[100px]">
                  {currentUser.name}
                </p>
                <span className={`text-[8px] px-1 py-0.2 rounded font-bold uppercase border inline-block mt-0.5 ${currentBadge.color}`}>
                  {currentBadge.label}
                </span>
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition"
              title="Keluar ke Portal Publik"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
