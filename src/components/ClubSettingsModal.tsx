import React, { useState } from 'react';
import {
  Settings,
  Save,
  X,
  Building2,
  CreditCard,
  Phone,
  Palette,
  Sparkles,
  Lock,
  Contact,
  Check,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { ClubSettings, ThemePreset, UserAccount, KTACardSettings } from '../types';
import { SENENG_MANAH_LOGO_SVG, DEFAULT_KTA_SETTINGS } from '../data/initialData';
import { Trash2, AlertTriangle } from 'lucide-react';

interface ClubSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubSettings: ClubSettings;
  currentUser: UserAccount;
  onSaveSettings: (settings: ClubSettings) => void;
  onClearAllData?: () => void;
}

export const ClubSettingsModal: React.FC<ClubSettingsModalProps> = ({
  isOpen,
  onClose,
  clubSettings,
  currentUser,
  onSaveSettings,
  onClearAllData,
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const [activeSubTab, setActiveSubTab] = useState<'club' | 'kta' | 'finance' | 'admin'>('club');

  const [formData, setFormData] = useState<ClubSettings>(() => {
    return {
      ...clubSettings,
      ktaSettings: clubSettings.ktaSettings || DEFAULT_KTA_SETTINGS,
    };
  });

  if (!isOpen) return null;

  const currentKTA: KTACardSettings = formData.ktaSettings || DEFAULT_KTA_SETTINGS;

  const updateKTAField = <K extends keyof KTACardSettings>(key: K, value: KTACardSettings[K]) => {
    setFormData((prev) => ({
      ...prev,
      ktaSettings: {
        ...(prev.ktaSettings || DEFAULT_KTA_SETTINGS),
        [key]: value,
      },
    }));
  };

  const applyKTAPreset = (preset: 'pink_purple_blue' | 'gold_navy' | 'emerald_teal' | 'crimson_dark' | 'cyber_neon' | 'clean_white') => {
    switch (preset) {
      case 'pink_purple_blue':
        setFormData((prev) => ({
          ...prev,
          ktaSettings: {
            ...DEFAULT_KTA_SETTINGS,
            themePreset: 'pink_purple_blue',
          },
        }));
        break;
      case 'gold_navy':
        setFormData((prev) => ({
          ...prev,
          ktaSettings: {
            themePreset: 'gold_navy',
            bgGradientFrom: '#0a192f',
            bgGradientVia: '#1e3a8a',
            bgGradientTo: '#172554',
            headerColor: '#fde047',
            nameColor: '#fbbf24',
            memberIdColor: '#38bdf8',
            labelColor: '#93c5fd',
            valueColor: '#ffffff',
            badgeBgColor: '#eab308',
            badgeTextColor: '#0f172a',
            borderColor: '#eab308',
            showWatermark: true,
            watermarkOpacity: 0.2,
            footerText: 'Kartu Anggota Resmi • Club Seneng Manah Batu',
            cardTitle: 'KARTU TANDA ANGGOTA RESMI',
            photoBorderColor: '#eab308',
            barcodeBorderColor: '#fbbf24',
          },
        }));
        break;
      case 'emerald_teal':
        setFormData((prev) => ({
          ...prev,
          ktaSettings: {
            themePreset: 'emerald_teal',
            bgGradientFrom: '#022c22',
            bgGradientVia: '#065f46',
            bgGradientTo: '#0f766e',
            headerColor: '#6ee7b7',
            nameColor: '#34d399',
            memberIdColor: '#a7f3d0',
            labelColor: '#6ee7b7',
            valueColor: '#f0fdf4',
            badgeBgColor: '#10b981',
            badgeTextColor: '#022c22',
            borderColor: '#10b981',
            showWatermark: true,
            watermarkOpacity: 0.18,
            footerText: 'Official Member Card • Seneng Manah Batu',
            cardTitle: 'KARTU TANDA ANGGOTA RESMI',
            photoBorderColor: '#10b981',
            barcodeBorderColor: '#34d399',
          },
        }));
        break;
      case 'crimson_dark':
        setFormData((prev) => ({
          ...prev,
          ktaSettings: {
            themePreset: 'crimson_dark',
            bgGradientFrom: '#18181b',
            bgGradientVia: '#881337',
            bgGradientTo: '#4c0519',
            headerColor: '#ffffff',
            nameColor: '#fb7185',
            memberIdColor: '#fda4af',
            labelColor: '#f43f5e',
            valueColor: '#fff1f2',
            badgeBgColor: '#e11d48',
            badgeTextColor: '#ffffff',
            borderColor: '#e11d48',
            showWatermark: true,
            watermarkOpacity: 0.15,
            footerText: 'Kartu Anggota Panahan • Seneng Manah Batu',
            cardTitle: 'KARTU TANDA ANGGOTA RESMI',
            photoBorderColor: '#e11d48',
            barcodeBorderColor: '#fb7185',
          },
        }));
        break;
      case 'cyber_neon':
        setFormData((prev) => ({
          ...prev,
          ktaSettings: {
            themePreset: 'cyber_neon',
            bgGradientFrom: '#030712',
            bgGradientVia: '#4c1d95',
            bgGradientTo: '#0284c7',
            headerColor: '#38bdf8',
            nameColor: '#f43f5e',
            memberIdColor: '#22d3ee',
            labelColor: '#c084fc',
            valueColor: '#ffffff',
            badgeBgColor: '#ec4899',
            badgeTextColor: '#ffffff',
            borderColor: '#38bdf8',
            showWatermark: true,
            watermarkOpacity: 0.25,
            footerText: 'Digital Archery Verified • Seneng Manah Batu',
            cardTitle: 'KARTU TANDA ANGGOTA RESMI',
            photoBorderColor: '#ec4899',
            barcodeBorderColor: '#38bdf8',
          },
        }));
        break;
      case 'clean_white':
        setFormData((prev) => ({
          ...prev,
          ktaSettings: {
            themePreset: 'clean_white',
            bgGradientFrom: '#ffffff',
            bgGradientVia: '#f8fafc',
            bgGradientTo: '#e2e8f0',
            headerColor: '#0f172a',
            nameColor: '#be123c',
            memberIdColor: '#0369a1',
            labelColor: '#64748b',
            valueColor: '#0f172a',
            badgeBgColor: '#0284c7',
            badgeTextColor: '#ffffff',
            borderColor: '#cbd5e1',
            showWatermark: true,
            watermarkOpacity: 0.08,
            footerText: 'Kartu Tanda Anggota Resmi • Seneng Manah Batu',
            cardTitle: 'KARTU TANDA ANGGOTA RESMI',
            photoBorderColor: '#0284c7',
            barcodeBorderColor: '#be123c',
          },
        }));
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-pink-500/30 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-pink-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span>Pengaturan Klub & Kustomisasi KTA</span>
                {isSuperAdmin && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-black border border-rose-500/40 uppercase">
                    Super Admin
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">SENENG MANAH SHOOTING CLASS BATU</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-950/90 border-b border-slate-800 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('club')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'club'
                ? 'bg-pink-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Identitas & Logo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('kta')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'kta'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Contact className="w-3.5 h-3.5 text-pink-400" />
            <span>Desain & Warna KTA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('finance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'finance'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>SPP & Rekening</span>
          </button>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setActiveSubTab('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'admin'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* ========================================================================= */}
          {/* TAB 1: IDENTITAS KLUB & LOGO */}
          {/* ========================================================================= */}
          {activeSubTab === 'club' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                  <Building2 className="w-4 h-4" />
                  <span>Identitas Resmi Klub & Logo</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-4 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full border-2 border-pink-500/50 p-1 bg-slate-950 flex items-center justify-center overflow-hidden shadow-lg shadow-pink-500/10">
                      <img
                        src={formData.logoUrl || SENENG_MANAH_LOGO_SVG}
                        alt="Logo Club"
                        className="w-full h-full object-contain rounded-full"
                      />
                    </div>

                    {isSuperAdmin && (
                      <div className="mt-2 space-y-1 text-center">
                        <label
                          htmlFor="logo-file-input"
                          className="cursor-pointer text-[10px] font-bold text-pink-400 hover:text-pink-300 underline block"
                        >
                          Unggah Logo Baru
                        </label>
                        <input
                          id="logo-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, logoUrl: SENENG_MANAH_LOGO_SVG }))}
                          className="text-[9px] text-slate-400 hover:text-slate-200 underline block"
                        >
                          Reset Logo Asli
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-8 space-y-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        Nama Klub Panahan * {isSuperAdmin ? '(Super Admin dapat mengubah)' : ''}
                      </label>
                      <input
                        type="text"
                        required
                        disabled={!isSuperAdmin}
                        value={formData.clubName}
                        onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-pink-500 disabled:opacity-60 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Slogan / Tagline Klub</label>
                      <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lokasi & WhatsApp */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                  <Phone className="w-4 h-4" />
                  <span>Lokasi Lapangan & Kontak Pengurus</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Lokasi Latihan Panahan</label>
                    <input
                      type="text"
                      value={formData.trainingLocation}
                      onChange={(e) => setFormData({ ...formData, trainingLocation: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">WhatsApp Sekretariat</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PENGATURAN KARTU ANGGOTA (KTA) - WARNA TULISAN & DESAIN */}
          {/* ========================================================================= */}
          {activeSubTab === 'kta' && (
            <div className="space-y-5">
              {/* Presets Grid */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-pink-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                    <Palette className="w-4 h-4" />
                    <span>Pilihan Tema Warna KTA Instan</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => applyKTAPreset('pink_purple_blue')}
                    className="text-[11px] text-pink-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Default
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'pink_purple_blue', name: '🌸 Radiant Pink-Purple', from: '#0f172a', to: '#0c4a6e', border: '#ec4899' },
                    { id: 'gold_navy', name: '👑 Royal Navy & Gold', from: '#0a192f', to: '#172554', border: '#eab308' },
                    { id: 'emerald_teal', name: '🌲 Emerald & Mint', from: '#022c22', to: '#0f766e', border: '#10b981' },
                    { id: 'crimson_dark', name: '🌹 Ruby Crimson Dark', from: '#18181b', to: '#4c0519', border: '#e11d48' },
                    { id: 'cyber_neon', name: '⚡ Cyberpunk Neon', from: '#030712', to: '#0284c7', border: '#38bdf8' },
                    { id: 'clean_white', name: '📄 Classic Clean White', from: '#ffffff', to: '#e2e8f0', border: '#94a3b8' },
                  ].map((pr) => (
                    <button
                      key={pr.id}
                      type="button"
                      onClick={() => applyKTAPreset(pr.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition relative ${
                        currentKTA.themePreset === pr.id
                          ? 'border-pink-500 bg-pink-950/30 ring-1 ring-pink-500'
                          : 'border-slate-800 bg-slate-900 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1.5">
                        <span className="w-3.5 h-3.5 rounded-full border border-white/40" style={{ backgroundColor: pr.from }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-white/40" style={{ backgroundColor: pr.border }} />
                      </div>
                      <span className="text-[11px] font-bold text-white block truncate">{pr.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* LIVE CARD PREVIEW */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-pink-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-white text-xs flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span>Pratinjau Langsung Kartu Anggota (Live Preview)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Standar ID Card (85.6 × 54mm)</span>
                </div>

                {/* Card Mockup */}
                <div
                  className="w-full max-w-[420px] aspect-[85.6/53.98] mx-auto rounded-2xl p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${currentKTA.bgGradientFrom}, ${currentKTA.bgGradientVia || currentKTA.bgGradientFrom}, ${currentKTA.bgGradientTo})`,
                    borderColor: currentKTA.borderColor,
                    borderWidth: '2px',
                  }}
                >
                  {/* Decorative Watermark */}
                  {currentKTA.showWatermark && (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      style={{ opacity: currentKTA.watermarkOpacity }}
                    >
                      <div className="w-40 h-40 rounded-full border-8 border-white/40 flex items-center justify-center">
                        <div className="w-28 h-28 rounded-full border-8 border-white/40 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/30" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top Bar */}
                  <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-2">
                    <div className="flex items-center gap-2">
                      <img src={formData.logoUrl} alt="Logo" className="w-7 h-7 rounded-full bg-white/20 object-contain p-0.5" />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-tight leading-none" style={{ color: currentKTA.headerColor }}>
                          {formData.clubName}
                        </p>
                        <p className="text-[7.5px] font-semibold text-slate-300">{currentKTA.cardTitle}</p>
                      </div>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase shadow-xs"
                      style={{ backgroundColor: currentKTA.badgeBgColor, color: currentKTA.badgeTextColor }}
                    >
                      RECURVE
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="relative z-10 grid grid-cols-12 gap-3 items-center my-auto">
                    <div className="col-span-4 flex flex-col items-center">
                      <div
                        className="w-16 h-20 rounded-lg overflow-hidden border-2 shadow-md bg-slate-800"
                        style={{ borderColor: currentKTA.photoBorderColor }}
                      >
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"
                          alt="Athlete Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[8px] font-mono font-black mt-1" style={{ color: currentKTA.memberIdColor }}>
                        SM-BATU-001
                      </span>
                    </div>

                    <div className="col-span-8 space-y-1 text-left">
                      <div>
                        <span className="text-[7px] font-bold uppercase tracking-wider block" style={{ color: currentKTA.labelColor }}>
                          Nama Atlet
                        </span>
                        <h4 className="text-xs font-black tracking-tight leading-tight" style={{ color: currentKTA.nameColor }}>
                          Muhammad Farhan Al-Fatih
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[8px]">
                        <div>
                          <span className="text-[6.5px] font-semibold uppercase block" style={{ color: currentKTA.labelColor }}>
                            Kategori
                          </span>
                          <span className="font-bold" style={{ color: currentKTA.valueColor }}>
                            U-18 (Putra)
                          </span>
                        </div>
                        <div>
                          <span className="text-[6.5px] font-semibold uppercase block" style={{ color: currentKTA.labelColor }}>
                            Tempat Lahir
                          </span>
                          <span className="font-bold" style={{ color: currentKTA.valueColor }}>
                            Kota Batu
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom */}
                  <div className="relative z-10 flex items-center justify-between border-t border-white/20 pt-1 text-[7px] text-slate-300">
                    <span className="truncate max-w-[260px]">{currentKTA.footerText}</span>
                    <span className="font-mono font-bold" style={{ color: currentKTA.barcodeBorderColor }}>
                      VERIFIED
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail Color Pickers */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Kustomisasi Warna Tulisan & Elemen KTA
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* Nama Atlet Color */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Warna Nama Atlet</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentKTA.nameColor}
                        onChange={(e) => updateKTAField('nameColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={currentKTA.nameColor}
                        onChange={(e) => updateKTAField('nameColor', e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* ID Member Color */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Warna ID Anggota (SM-BATU-XXX)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentKTA.memberIdColor}
                        onChange={(e) => updateKTAField('memberIdColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={currentKTA.memberIdColor}
                        onChange={(e) => updateKTAField('memberIdColor', e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Header Title Color */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Warna Judul Nama Klub</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentKTA.headerColor}
                        onChange={(e) => updateKTAField('headerColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={currentKTA.headerColor}
                        onChange={(e) => updateKTAField('headerColor', e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Label Color */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Warna Label Data (Kategori, dll)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentKTA.labelColor}
                        onChange={(e) => updateKTAField('labelColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={currentKTA.labelColor}
                        onChange={(e) => updateKTAField('labelColor', e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Value Color */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Warna Nilai Biodata</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentKTA.valueColor}
                        onChange={(e) => updateKTAField('valueColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={currentKTA.valueColor}
                        onChange={(e) => updateKTAField('valueColor', e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Badge Divisi Background */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Warna Badge Divisi</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentKTA.badgeBgColor}
                        onChange={(e) => updateKTAField('badgeBgColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={currentKTA.badgeBgColor}
                        onChange={(e) => updateKTAField('badgeBgColor', e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Card Border Color */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Warna Border Kartu</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentKTA.borderColor}
                        onChange={(e) => updateKTAField('borderColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={currentKTA.borderColor}
                        onChange={(e) => updateKTAField('borderColor', e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Background Gradient Start */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Gradasi Latar (Warna Awal)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentKTA.bgGradientFrom}
                        onChange={(e) => updateKTAField('bgGradientFrom', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={currentKTA.bgGradientFrom}
                        onChange={(e) => updateKTAField('bgGradientFrom', e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Background Gradient End */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Gradasi Latar (Warna Akhir)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentKTA.bgGradientTo}
                        onChange={(e) => updateKTAField('bgGradientTo', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={currentKTA.bgGradientTo}
                        onChange={(e) => updateKTAField('bgGradientTo', e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer text & Watermark */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Teks Footer KTA</label>
                    <input
                      type="text"
                      value={currentKTA.footerText}
                      onChange={(e) => updateKTAField('footerText', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                      <input
                        type="checkbox"
                        checked={currentKTA.showWatermark}
                        onChange={(e) => updateKTAField('showWatermark', e.target.checked)}
                        className="rounded accent-pink-500 w-4 h-4"
                      />
                      <span className="font-bold">Watermark Target Panahan</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SPP & REKENING BANK */}
          {/* ========================================================================= */}
          {activeSubTab === 'finance' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                  <CreditCard className="w-4 h-4" />
                  <span>Rekening Pembayaran & Iuran SPP Bulanan</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Iuran SPP Standar (Rp)</label>
                    <input
                      type="number"
                      step="10000"
                      value={formData.defaultMonthlySpp}
                      onChange={(e) => setFormData({ ...formData, defaultMonthlySpp: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Nama Bank</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Nomor Rekening</label>
                    <input
                      type="text"
                      value={formData.bankAccountNumber}
                      onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Atas Nama Rekening Bank</label>
                  <input
                    type="text"
                    value={formData.bankAccountHolder}
                    onChange={(e) => setFormData({ ...formData, bankAccountHolder: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: KREDENSIAL SUPER ADMIN (HANYA SUPER ADMIN) */}
          {/* ========================================================================= */}
          {activeSubTab === 'admin' && isSuperAdmin && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-950/20 rounded-xl border border-rose-500/30 space-y-3">
                <h4 className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                  <Lock className="w-4 h-4" />
                  <span>Kredensial Super Admin (Username & Password)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Username Super Admin *</label>
                    <input
                      type="text"
                      required
                      value={formData.superAdminUsername}
                      onChange={(e) => setFormData({ ...formData, superAdminUsername: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Password Super Admin *</label>
                    <input
                      type="text"
                      required
                      value={formData.superAdminPassword || 'senengm4n4h'}
                      onChange={(e) => setFormData({ ...formData, superAdminPassword: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Data Purge / Clean Slate Section */}
              {onClearAllData && (
                <div className="p-4 bg-slate-950 rounded-xl border border-rose-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <h4 className="font-bold text-xs uppercase tracking-wider">
                      Zona Reset Data (Kosongkan Atlet & Pendaftar)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400">
                    Gunakan fitur ini jika ingin menghapus seluruh data atlit, riwayat pendaftar lama, dan pembayaran SPP sehingga database kembali bersih untuk pendaftar baru jarak jauh.
                  </p>
                  <button
                    type="button"
                    onClick={onClearAllData}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-rose-600/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Kosongkan Seluruh Data Atlet & Pendaftar</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-pink-500/20 transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
