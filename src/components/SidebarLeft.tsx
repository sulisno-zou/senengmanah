import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  Target,
  CalendarCheck,
  Bot,
  Contact,
  Newspaper,
  Settings,
  LogOut,
  X,
  ScanLine,
  FileCheck2,
  Shield,
  ChevronRight,
  Sparkles,
  ArrowRightLeft,
  FolderArchive,
  Download,
  Smartphone,
} from 'lucide-react';
import { TabType, UserAccount, ClubSettings } from '../types';

interface SidebarLeftProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  currentUser: UserAccount;
  clubSettings: ClubSettings;
  pendingRegistrationsCount: number;
  pendingProofsCount: number;
  onOpenSettings: () => void;
  onOpenScanKTA: () => void;
  onOpenPaymentProof: () => void;
  onOpenRoleSwitch: () => void;
  onOpenDownloadAll?: () => void;
  onOpenAndroidInstall?: () => void;
  onLogout: () => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  currentUser,
  clubSettings,
  pendingRegistrationsCount,
  pendingProofsCount,
  onOpenSettings,
  onOpenScanKTA,
  onOpenPaymentProof,
  onOpenRoleSwitch,
  onOpenDownloadAll,
  onOpenAndroidInstall,
  onLogout,
}) => {
  const roleBadgeColors: Record<string, { bg: string; text: string; label: string }> = {
    super_admin: { bg: 'bg-rose-500/20 border-rose-500/40 text-rose-300', text: 'text-rose-400', label: 'SUPER ADMIN' },
    admin: { bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300', text: 'text-amber-400', label: 'ADMIN KEGIATAN' },
    pelatih_utama: { bg: 'bg-purple-500/20 border-purple-500/40 text-purple-300', text: 'text-purple-400', label: 'PELATIH UTAMA' },
    pelatih: { bg: 'bg-blue-500/20 border-blue-500/40 text-blue-300', text: 'text-blue-400', label: 'PELATIH' },
    pelatih_atlit: { bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', text: 'text-emerald-400', label: 'PELATIH & ATLIT' },
    atlit: { bg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300', text: 'text-cyan-400', label: 'ATLIT' },
  };

  const badge = roleBadgeColors[currentUser.role] || roleBadgeColors.atlit;

  // Filter accessible tabs according to role
  const isSuperAdmin = currentUser.role === 'super_admin';
  const isAdmin = currentUser.role === 'admin' || isSuperAdmin;
  const isCoach = currentUser.role === 'pelatih_utama' || currentUser.role === 'pelatih';
  const isAthlete = currentUser.role === 'atlit';

  const menuItems: {
    id: TabType;
    label: string;
    icon: React.ElementType;
    badgeCount?: number;
    color: string;
    visible: boolean;
  }[] = [
    {
      id: 'dashboard',
      label: 'Beranda & Berita Klub',
      icon: LayoutDashboard,
      color: 'text-pink-400',
      visible: true,
    },
    {
      id: 'athletes',
      label: isAthlete ? 'Profil & Biodata Diri' : 'Data Atlet & Anggota',
      icon: Users,
      color: 'text-blue-400',
      visible: true,
    },
    {
      id: 'registrations',
      label: 'Pendaftar Baru (Calon)',
      icon: UserPlus,
      badgeCount: pendingRegistrationsCount,
      color: 'text-purple-400',
      visible: isSuperAdmin || isAdmin,
    },
    {
      id: 'spp',
      label: isAthlete ? 'Tagihan & SPP Saya' : 'SPP & Keuangan Klub',
      icon: CreditCard,
      badgeCount: isAthlete ? 0 : pendingProofsCount,
      color: 'text-emerald-400',
      visible: isSuperAdmin || isAdmin || isAthlete, // Pelatih is restricted from finance
    },
    {
      id: 'scoring',
      label: isAthlete ? 'Hasil Latihan Saya' : isCoach ? 'Input Hasil Latihan Atlet' : 'Scoring World Archery',
      icon: Target,
      color: 'text-rose-400',
      visible: true,
    },
    {
      id: 'attendance',
      label: 'Presensi & Jadwal',
      icon: CalendarCheck,
      color: 'text-indigo-400',
      visible: true,
    },
    {
      id: 'ai_coach',
      label: 'AI Coach Evaluator',
      icon: Bot,
      color: 'text-cyan-400',
      visible: true,
    },
    {
      id: 'member_card',
      label: isAthlete ? 'KTA Digital Saya' : 'Kartu Tanda Anggota (KTA)',
      icon: Contact,
      color: 'text-amber-400',
      visible: true,
    },
    {
      id: 'news',
      label: 'Warta & Pengumuman',
      icon: Newspaper,
      color: 'text-sky-400',
      visible: true,
    },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Left Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-slate-950/95 lg:bg-slate-950 border-r border-pink-500/20 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0 bg-slate-900/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-blue-600 p-[2px] shadow-md shadow-pink-500/20 shrink-0">
              <img
                src={clubSettings.logoUrl}
                alt={clubSettings.clubName}
                className="w-full h-full object-cover rounded-[10px] bg-slate-900"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-black tracking-tight text-white line-clamp-1">
                {clubSettings.clubName}
              </h2>
              <p className="text-[10px] font-bold text-pink-400">PANAHAN KOTA BATU</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card in Sidebar */}
        <div className="p-3.5 mx-3 my-3 rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900 border border-slate-800 shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                alt={currentUser.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-pink-500/60 shadow"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-white truncate">{currentUser.name}</h3>
              <p className="text-[10px] text-slate-400 truncate">@{currentUser.username}</p>
              <div className="mt-1">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[9px] font-black border tracking-wider ${badge.bg}`}
                >
                  {badge.label}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <button
              onClick={() => {
                onOpenRoleSwitch();
                onClose();
              }}
              className="text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3 h-3" /> Ganti Akun
            </button>
            <button
              onClick={onLogout}
              className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" /> Keluar
            </button>
          </div>
        </div>

        {/* Menu Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Menu Utama
          </div>

          {menuItems
            .filter((item) => item.visible)
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 text-white border border-pink-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-pink-400' : item.color}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-pink-500 text-white shadow-sm animate-pulse">
                      {item.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}

          {/* Quick Action Tools */}
          <div className="pt-3 mt-2 border-t border-slate-800/80 px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Fasilitas Cepat
          </div>

          {onOpenAndroidInstall && (
            <button
              onClick={() => {
                onOpenAndroidInstall();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-pink-300 hover:text-pink-200 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition"
            >
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-pink-400 shrink-0 animate-pulse" />
                <span>Pasang di HP Android</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500 text-white font-black uppercase">
                PWA
              </span>
            </button>
          )}

          <button
            onClick={() => {
              onOpenScanKTA();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-cyan-300 hover:bg-slate-900/80 border border-transparent"
          >
            <div className="flex items-center gap-2.5">
              <ScanLine className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Scan Barcode KTA</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </button>

          <button
            onClick={() => {
              onOpenPaymentProof();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-emerald-300 hover:bg-slate-900/80 border border-transparent"
          >
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verifikasi Bukti SPP</span>
            </div>
            {pendingProofsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-500 text-slate-950">
                {pendingProofsCount}
              </span>
            )}
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => {
                onOpenSettings();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-purple-300 hover:bg-slate-900/80 border border-transparent"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Pengaturan & Logo Klub</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            </button>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 shrink-0 text-center bg-slate-950">
          <p className="text-[10px] text-slate-500 font-medium">
            Seneng Manah v2.4 • Kota Batu
          </p>
        </div>
      </aside>
    </>
  );
};
