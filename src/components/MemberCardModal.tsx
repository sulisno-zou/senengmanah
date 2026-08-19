import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
  MapPin,
  Phone,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  UserX,
  RefreshCw,
  Lock,
  Edit3,
  Save,
  Palette,
  Eye,
  FileText,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import QRCode from 'qrcode';
import { Athlete, ClubSettings, KTACardSettings, UserAccount } from '../types';
import { formatDateIndo } from '../utils/formatters';
import { DEFAULT_KTA_SETTINGS } from '../data/initialData';

interface MemberCardModalProps {
  athlete: Athlete;
  athletes: Athlete[];
  clubSettings: ClubSettings;
  currentUser?: UserAccount;
  onClose: () => void;
  onOpenVerification: (athleteId: string) => void;
  onApproveKTA?: (athleteId: string, notes?: string) => void;
  onRejectKTA?: (athleteId: string, reason?: string) => void;
  onDeactivateKTA?: (athleteId: string, reason?: string) => void;
  onReactivateKTA?: (athleteId: string) => void;
  onSaveKTASettings?: (updated: KTACardSettings) => void;
}

export const MemberCardModal: React.FC<MemberCardModalProps> = ({
  athlete,
  athletes,
  clubSettings,
  currentUser,
  onClose,
  onOpenVerification,
  onApproveKTA,
  onRejectKTA,
  onDeactivateKTA,
  onReactivateKTA,
  onSaveKTASettings,
}) => {
  const isAthlete = currentUser?.role === 'atlit';
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isAdmin = currentUser?.role === 'admin';
  const isHeadCoach = currentUser?.role === 'pelatih_utama' || currentUser?.role === 'pelatih';
  const canManageKTA = isSuperAdmin || isAdmin || isHeadCoach;

  const myAthlete = isAthlete
    ? athletes.find((a) => a.id === currentUser?.athleteId || a.name.toLowerCase() === currentUser?.name.toLowerCase()) || athlete
    : athlete;

  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(isAthlete ? myAthlete.id : athlete.id);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('Anggota Keluar / Mengundurkan Diri');
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  const displayAthletes = isAthlete ? [myAthlete] : athletes;
  const currentAthlete = displayAthletes.find((a) => a.id === selectedAthleteId) || myAthlete;

  // Local editable KTA settings state
  const initialKTA: KTACardSettings = {
    ...DEFAULT_KTA_SETTINGS,
    ...(clubSettings.ktaSettings || {}),
    backCoachName: clubSettings.ktaSettings?.backCoachName || clubSettings.headCoach || clubSettings.coachName || 'Coach Zoulkifli',
    backCoachTitle: clubSettings.ktaSettings?.backCoachTitle || clubSettings.ktaResponsibleTitle || 'Pelatih Kepala / Penanggung Jawab',
    backContactText: clubSettings.ktaSettings?.backContactText || clubSettings.phone || '0812-3344-5566',
    backLocationText: clubSettings.ktaSettings?.backLocationText || clubSettings.trainingLocation || 'Kota Batu, Jawa Timur',
    disclaimerText:
      clubSettings.ktaSettings?.disclaimerText ||
      'Anggota Resmi Seneng Manah, Segala penyalahgunaan KTA adalah tanggung jawab pemegang.',
    regulations: clubSettings.ktaSettings?.regulations && clubSettings.ktaSettings.regulations.length > 0
      ? clubSettings.ktaSettings.regulations
      : DEFAULT_KTA_SETTINGS.regulations,
  };

  const [editKTA, setEditKTA] = useState<KTACardSettings>(initialKTA);

  // Active KTA settings in effect
  const kta: KTACardSettings = activeTab === 'edit' ? editKTA : { ...initialKTA, ...(clubSettings.ktaSettings || {}) };

  // Determine KTA Status
  const ktaStatus = currentAthlete.ktaStatus || (currentAthlete.active === false ? 'NONAKTIF' : 'PENDING');
  const isApproved = ktaStatus === 'APPROVED' && currentAthlete.active !== false;
  const isPending = ktaStatus === 'PENDING';
  const isInactive = ktaStatus === 'NONAKTIF' || currentAthlete.active === false;

  // Generate real QR code containing verification identifier if approved
  useEffect(() => {
    if (isApproved) {
      const verificationData = `SENENG-MANAH-VERIFY:${currentAthlete.memberNo}:${currentAthlete.name}:STATUS_APPROVED`;
      QRCode.toDataURL(verificationData, {
        width: 250,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating QR code:', err));
    } else {
      setQrDataUrl('');
    }
  }, [currentAthlete, isApproved]);

  const handlePrint = () => {
    if (!isApproved) {
      alert('Peringatan: KTA belum disetujui secara resmi. KTA hanya dapat dicetak setelah disetujui oleh Super Admin atau Admin.');
      return;
    }
    window.print();
  };

  const handleConfirmDeactivate = () => {
    if (onDeactivateKTA) {
      onDeactivateKTA(currentAthlete.id, deactivateReason.trim() || 'Anggota Keluar');
    }
    setShowDeactivateDialog(false);
  };

  const updateEditField = (field: keyof KTACardSettings, value: any) => {
    setEditKTA((prev) => ({ ...prev, [field]: value }));
  };

  const updateRegulation = (index: number, val: string) => {
    const newRegs = [...(editKTA.regulations || DEFAULT_KTA_SETTINGS.regulations || [])];
    newRegs[index] = val;
    setEditKTA((prev) => ({ ...prev, regulations: newRegs }));
  };

  const applyThemePreset = (preset: KTACardSettings['themePreset']) => {
    const presets: Record<string, Partial<KTACardSettings>> = {
      pink_purple_blue: {
        themePreset: 'pink_purple_blue',
        bgGradientFrom: '#0f172a',
        bgGradientVia: '#3b0764',
        bgGradientTo: '#0c4a6e',
        headerColor: '#ffffff',
        nameColor: '#f43f5e',
        memberIdColor: '#38bdf8',
        labelColor: '#94a3b8',
        valueColor: '#f8fafc',
        badgeBgColor: '#ec4899',
        badgeTextColor: '#ffffff',
        borderColor: '#ec4899',
        photoBorderColor: '#ec4899',
        barcodeBorderColor: '#38bdf8',
      },
      gold_navy: {
        themePreset: 'gold_navy',
        bgGradientFrom: '#0a192f',
        bgGradientVia: '#1e3a8a',
        bgGradientTo: '#172554',
        headerColor: '#fbbf24',
        nameColor: '#f59e0b',
        memberIdColor: '#60a5fa',
        labelColor: '#93c5fd',
        valueColor: '#ffffff',
        badgeBgColor: '#eab308',
        badgeTextColor: '#0f172a',
        borderColor: '#eab308',
        photoBorderColor: '#eab308',
        barcodeBorderColor: '#fbbf24',
      },
      emerald_teal: {
        themePreset: 'emerald_teal',
        bgGradientFrom: '#022c22',
        bgGradientVia: '#064e3b',
        bgGradientTo: '#0f766e',
        headerColor: '#34d399',
        nameColor: '#10b981',
        memberIdColor: '#2dd4bf',
        labelColor: '#a7f3d0',
        valueColor: '#ffffff',
        badgeBgColor: '#059669',
        badgeTextColor: '#ffffff',
        borderColor: '#10b981',
        photoBorderColor: '#10b981',
        barcodeBorderColor: '#2dd4bf',
      },
      crimson_dark: {
        themePreset: 'crimson_dark',
        bgGradientFrom: '#18181b',
        bgGradientVia: '#4c0519',
        bgGradientTo: '#881337',
        headerColor: '#fda4af',
        nameColor: '#fb7185',
        memberIdColor: '#f43f5e',
        labelColor: '#fecdd3',
        valueColor: '#ffffff',
        badgeBgColor: '#e11d48',
        badgeTextColor: '#ffffff',
        borderColor: '#e11d48',
        photoBorderColor: '#e11d48',
        barcodeBorderColor: '#fb7185',
      },
      cyber_neon: {
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
        photoBorderColor: '#ec4899',
        barcodeBorderColor: '#38bdf8',
      },
      clean_white: {
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
        photoBorderColor: '#0284c7',
        barcodeBorderColor: '#be123c',
      },
    };

    if (presets[preset]) {
      setEditKTA((prev) => ({ ...prev, ...presets[preset] }));
    }
  };

  const handleSaveKTAConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveKTASettings) {
      onSaveKTASettings(editKTA);
      setSaveSuccessMsg('Pengaturan desain & teks KTA berhasil disimpan ke sistem Cloud!');
      setTimeout(() => {
        setSaveSuccessMsg('');
        setActiveTab('preview');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-pink-500/30 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:border-none print:shadow-none print:bg-white">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950 print:hidden gap-2.5 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-md shadow-pink-500/20">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span>Kartu Tanda Anggota (KTA) Digital</span>
                {isApproved ? (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black tracking-wider uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Resmi Aktif
                  </span>
                ) : isPending ? (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black tracking-wider uppercase flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Dalam Proses Kelayakan
                  </span>
                ) : (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-black tracking-wider uppercase flex items-center gap-1">
                    <UserX className="w-3 h-3" /> Nonaktif / Keluar
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                KTA Depan & Belakang Resmi • {clubSettings.clubName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle (Preview vs Edit) */}
            {canManageKTA && (
              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'preview'
                      ? 'bg-pink-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Pratinjau KTA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'edit'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 text-pink-300" />
                  <span>Edit Teks & Desain</span>
                </button>
              </div>
            )}

            {/* Athlete Selector (Hidden if user is single athlete) */}
            {displayAthletes.length > 1 && activeTab === 'preview' && (
              <select
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-pink-500"
              >
                {displayAthletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.memberNo} - {a.name} ({a.ktaStatus === 'APPROVED' ? 'Disetujui' : a.ktaStatus === 'NONAKTIF' ? 'Nonaktif' : 'Pending'})
                  </option>
                ))}
              </select>
            )}

            {isApproved && activeTab === 'preview' && (
              <>
                <button
                  onClick={() => onOpenVerification(currentAthlete.id)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 text-xs font-bold transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Cek Barcode</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider transition shadow-md shadow-pink-500/20"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Notice Banner if PENDING or NONAKTIF */}
        {isPending && (
          <div className="bg-amber-950/60 border-b border-amber-500/40 p-4 sm:px-6 print:hidden shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-sm font-black text-amber-300">
                    Persetujuan KTA Atlet Dalam Proses Kelayakan
                  </h4>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    KTA Digital & Barcode belum diverifikasi aktif. Memerlukan persetujuan kelayakan oleh Super Admin atau Admin Klub.
                  </p>
                </div>
              </div>

              {canManageKTA && (
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {onApproveKTA && (
                    <button
                      onClick={() => onApproveKTA(currentAthlete.id, 'Disetujui dan diverifikasi layak oleh Super Admin/Admin')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Setujui KTA</span>
                    </button>
                  )}
                  {onRejectKTA && (
                    <button
                      onClick={() => onRejectKTA(currentAthlete.id, 'Tidak memenuhi kriteria kelayakan')}
                      className="px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-500/40 font-bold text-xs transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {isInactive && (
          <div className="bg-rose-950/70 border-b border-rose-500/40 p-4 sm:px-6 print:hidden shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <UserX className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-black text-rose-300">
                    KTA Telah Dinonaktifkan (Status: Anggota Keluar / Nonaktif)
                  </h4>
                  <p className="text-xs text-rose-200/80 mt-0.5">
                    {currentAthlete.leaveReason
                      ? `Alasan: ${currentAthlete.leaveReason} (${currentAthlete.leaveDate || 'Tercatat'})`
                      : 'Anggota ini telah berstatus keluar dari keanggotaan klub panahan.'}
                  </p>
                </div>
              </div>

              {canManageKTA && onReactivateKTA && (
                <button
                  onClick={() => onReactivateKTA(currentAthlete.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition self-end sm:self-auto shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Aktifkan Kembali KTA</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Success Alert */}
        {saveSuccessMsg && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 p-3 px-6 text-emerald-300 font-bold text-xs flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* MAIN BODY AREA */}
        {activeTab === 'preview' ? (
          /* ========================================================================= */
          /* VIEW 1: PRATINJAU KTA LENGKAP (DEPAN & BELAKANG) */
          /* ========================================================================= */
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center print:p-0 print:bg-white space-y-6">
            <div className="w-full max-w-xl space-y-6 print:space-y-4">
              
              {/* SECTION TITLE: TAMPAK DEPAN */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider print:hidden">
                <span className="flex items-center gap-1 text-pink-400 font-extrabold">
                  <Eye className="w-3.5 h-3.5" /> Tampak Depan (Front View)
                </span>
                <span>Standar ID-1 (85.60 × 53.98 mm)</span>
              </div>

              {/* FRONT CARD (TAMPAK DEPAN) */}
              <div
                className={`relative w-full aspect-[85.6/53.98] max-w-[480px] mx-auto rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 sm:p-5 select-none print:shadow-none print:max-w-none print:w-[85.6mm] print:h-[53.98mm] print:rounded-lg print:p-3 ${
                  isPending ? 'opacity-85 filter saturate-75' : isInactive ? 'opacity-60 grayscale' : ''
                }`}
                style={{
                  background: `linear-gradient(135deg, ${kta.bgGradientFrom}, ${kta.bgGradientVia || kta.bgGradientFrom}, ${kta.bgGradientTo})`,
                  borderColor: isInactive ? '#ef4444' : isPending ? '#f59e0b' : kta.borderColor,
                  borderWidth: '2px',
                }}
              >
                {/* Optional Archery Target Watermark */}
                {kta.showWatermark && (
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ opacity: kta.watermarkOpacity }}
                  >
                    <div className="w-52 h-52 rounded-full border-[10px] border-white/50 flex items-center justify-center">
                      <div className="w-36 h-36 rounded-full border-[10px] border-white/50 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-white/40" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Inactive or Pending Diagonal Banner Overlay */}
                {isInactive && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    <div className="w-[120%] bg-rose-600/90 text-white font-black text-xs sm:text-sm uppercase tracking-widest text-center py-1.5 shadow-2xl transform -rotate-12 border-y-2 border-white">
                      🚫 NONAKTIF / ANGGOTA KELUAR
                    </div>
                  </div>
                )}

                {isPending && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    <div className="w-[120%] bg-amber-500/90 text-slate-950 font-black text-[11px] sm:text-xs uppercase tracking-widest text-center py-1.5 shadow-2xl transform -rotate-12 border-y-2 border-slate-900">
                      ⏳ PROSES KELAYAKAN (BELUM DISETUJUI)
                    </div>
                  </div>
                )}

                {/* Front Top Header */}
                <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-2">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={clubSettings.logoUrl}
                      alt="Logo Club"
                      className="w-9 h-9 object-contain rounded-full bg-white/10 p-0.5 border border-white/40 shadow-sm"
                    />
                    <div>
                      <h4
                        className="text-xs font-black tracking-tight uppercase leading-tight drop-shadow-sm font-mono"
                        style={{ color: kta.headerColor }}
                      >
                        {clubSettings.clubName}
                      </h4>
                      <p className="text-[8.5px] font-semibold text-slate-300 uppercase tracking-wider">
                        {kta.cardTitle || 'KARTU TANDA ANGGOTA RESMI'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className="text-[8.5px] px-2 py-0.5 font-black tracking-wider uppercase rounded-full shadow-xs"
                      style={{
                        backgroundColor: kta.badgeBgColor,
                        color: kta.badgeTextColor,
                      }}
                    >
                      {currentAthlete.division}
                    </span>
                  </div>
                </div>

                {/* Front Body */}
                <div className="relative z-10 grid grid-cols-12 gap-3.5 my-auto items-center">
                  {/* Photo with Frame */}
                  <div className="col-span-4 flex flex-col items-center">
                    <div
                      className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border-2 shadow-lg bg-slate-800"
                      style={{ borderColor: kta.photoBorderColor }}
                    >
                      <img
                        src={currentAthlete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                        alt={currentAthlete.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div
                      className="mt-1 text-[9px] font-mono font-extrabold tracking-wider"
                      style={{ color: kta.memberIdColor }}
                    >
                      {currentAthlete.memberNo}
                    </div>
                  </div>

                  {/* Athlete Details */}
                  <div className="col-span-8 space-y-1.5 text-left">
                    <div>
                      <p className="text-[8px] uppercase tracking-widest font-bold" style={{ color: kta.labelColor }}>
                        NAMA ANGGOTA
                      </p>
                      <h3
                        className="text-sm sm:text-base font-black tracking-tight leading-tight drop-shadow-sm truncate"
                        style={{ color: kta.nameColor }}
                      >
                        {currentAthlete.name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-[7.5px] uppercase tracking-wider font-semibold" style={{ color: kta.labelColor }}>
                          DIVISI BUSUR
                        </p>
                        <p className="font-bold text-[10.5px]" style={{ color: kta.valueColor }}>
                          {currentAthlete.division}
                        </p>
                      </div>
                      <div>
                        <p className="text-[7.5px] uppercase tracking-wider font-semibold" style={{ color: kta.labelColor }}>
                          KATEGORI USIA
                        </p>
                        <p className="font-bold text-[10.5px]" style={{ color: kta.valueColor }}>
                          {currentAthlete.ageCategory} ({currentAthlete.gender === 'L' ? 'Putra' : 'Putri'})
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[7.5px] uppercase tracking-wider font-semibold" style={{ color: kta.labelColor }}>
                        TEMPAT, TGL LAHIR
                      </p>
                      <p className="text-[10.5px] font-medium truncate" style={{ color: kta.valueColor }}>
                        {currentAthlete.birthPlace}, {formatDateIndo(currentAthlete.birthDate)}
                      </p>
                    </div>

                    {/* Official Statement */}
                    <div className="pt-0.5">
                      <p className="text-[7px] text-pink-200/90 leading-tight italic font-medium">
                        "{kta.disclaimerText || 'Anggota Resmi Seneng Manah, Segala penyalahgunaan KTA adalah tanggung jawab pemegang.'}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Front Footer with Hologram & Status */}
                <div className="relative z-10 flex items-center justify-between border-t border-white/20 pt-1.5 text-[8px] text-slate-300 font-medium">
                  <div className="flex items-center space-x-1.5 truncate max-w-[280px]">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-500 border border-white/60 flex items-center justify-center text-[7px] text-slate-900 font-black shrink-0 shadow-xs">
                      ★
                    </div>
                    <span className="truncate">{kta.footerText || 'Kartu Tanda Anggota Resmi • Club Seneng Manah Batu'}</span>
                  </div>
                  <div className="font-mono text-[8.5px] font-bold" style={{ color: isApproved ? kta.barcodeBorderColor : '#f59e0b' }}>
                    {isApproved ? 'VALID RESMI' : isPending ? 'PENDING APPROVAL' : 'NONAKTIF'}
                  </div>
                </div>
              </div>

              {/* SECTION TITLE: TAMPAK BELAKANG */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider print:hidden pt-4">
                <span className="flex items-center gap-1 text-cyan-400 font-extrabold">
                  <Eye className="w-3.5 h-3.5" /> Tampak Belakang (Back View) & Ketentuan
                </span>
                <span>Tata Tertib & Barcode Verifikasi</span>
              </div>

              {/* BACK CARD (TAMPAK BELAKANG) */}
              <div className={`relative w-full aspect-[85.6/53.98] max-w-[480px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-700 text-slate-900 bg-white flex flex-col justify-between p-4 sm:p-5 select-none print:shadow-none print:border-slate-800 print:max-w-none print:w-[85.6mm] print:h-[53.98mm] print:rounded-lg print:p-3 ${
                isPending ? 'opacity-85' : isInactive ? 'opacity-60 grayscale' : ''
              }`}>
                {/* Back Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <img
                      src={clubSettings.logoUrl}
                      alt="Logo Club"
                      className="w-7 h-7 object-contain"
                    />
                    <div>
                      <h5 className="text-[10px] font-black text-slate-900 tracking-tight leading-none uppercase font-mono">
                        {clubSettings.clubName}
                      </h5>
                      <p className="text-[7.5px] text-pink-700 font-bold tracking-wider uppercase">
                        {kta.backSubtitle || 'KETENTUAN KARTU TANDA ANGGOTA'}
                      </p>
                    </div>
                  </div>
                  <div className="text-[8px] font-mono font-bold text-slate-500">
                    {isApproved ? 'DIGITAL QR VERIFIED' : 'BELUM AKTIF'}
                  </div>
                </div>

                {/* Back Content Grid */}
                <div className="grid grid-cols-12 gap-3 my-auto items-center">
                  {/* Rules List */}
                  <div className="col-span-8 space-y-1 text-[8px] sm:text-[8.5px] leading-tight text-slate-700">
                    <p className="font-bold text-slate-950 mb-0.5">Tata Tertib & Ketentuan:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                      {(kta.regulations || DEFAULT_KTA_SETTINGS.regulations || []).map((rule, idx) => (
                        <li key={idx} className="truncate">
                          {rule}
                        </li>
                      ))}
                    </ol>
                    <div className="pt-1 text-[7.5px] text-slate-500">
                      <p className="flex items-center gap-1 font-semibold text-slate-700 truncate">
                        <MapPin className="w-2.5 h-2.5 text-pink-500 shrink-0" />
                        <span className="truncate">{kta.backLocationText || clubSettings.trainingLocation || 'Kota Batu, Jawa Timur'}</span>
                      </p>
                    </div>
                  </div>

                  {/* QR Code & Barcode Box */}
                  <div className="col-span-4 flex flex-col items-center justify-center p-1.5 rounded-xl bg-slate-50 border border-slate-200">
                    {isApproved && qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Code Verifikasi"
                        className="w-16 h-16 sm:w-18 sm:h-18 object-contain rounded-md shadow-xs"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-slate-200 rounded flex flex-col items-center justify-center p-1 text-center text-[7px] text-slate-500 font-bold leading-tight">
                        <Lock className="w-4 h-4 mb-0.5 text-slate-400" />
                        <span>{isPending ? 'KTA PENDING' : 'KTA NONAKTIF'}</span>
                      </div>
                    )}
                    <p className="text-[7px] font-mono font-bold text-slate-700 mt-1 uppercase text-center">
                      {isApproved ? 'SCAN VERIFIKASI' : 'KTA TERKUNCI'}
                    </p>
                    <p className="text-[6.5px] font-mono text-slate-400">
                      {currentAthlete.memberNo}
                    </p>
                  </div>
                </div>

                {/* Back Footer Signature & Stamped */}
                <div className="flex items-end justify-between border-t border-slate-200 pt-1.5 text-[7.5px] text-slate-500">
                  <div>
                    <p className="text-[7px] text-slate-400">Sekretariat / WhatsApp:</p>
                    <p className="font-bold text-slate-800 text-[8px]">{kta.backContactText || clubSettings.phone || '0812-3344-5566'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[7px] text-slate-500">{kta.backCoachTitle || 'Pelatih Kepala / Penanggung Jawab'}</p>
                    <p className="font-bold text-slate-900 text-[8.5px] mt-0.5 underline font-mono">
                      {kta.backCoachName || clubSettings.headCoach || clubSettings.coachName || 'LILING RIAHELDA MAQFIROH'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: FORM EDIT KTA (TEKS, PERATURAN, PELATIH, WARNA DLL) */
          /* ========================================================================= */
          <form onSubmit={handleSaveKTAConfig} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-200">
            {/* Theme Presets */}
            <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-pink-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                  <Palette className="w-4 h-4" />
                  <span>Preset Tema & Warna KTA</span>
                </h4>
                <button
                  type="button"
                  onClick={() => applyThemePreset('pink_purple_blue')}
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
                    onClick={() => applyThemePreset(pr.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition relative ${
                      editKTA.themePreset === pr.id
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

            {/* SECTION 1: TEKS DEPAN KTA */}
            <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-pink-400" />
                <span>Pengaturan Teks Tampak Depan (Front Side)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Judul Kartu Depan</label>
                  <input
                    type="text"
                    value={editKTA.cardTitle || ''}
                    onChange={(e) => updateEditField('cardTitle', e.target.value)}
                    placeholder="KARTU TANDA ANGGOTA RESMI"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Teks Footer Depan</label>
                  <input
                    type="text"
                    value={editKTA.footerText || ''}
                    onChange={(e) => updateEditField('footerText', e.target.value)}
                    placeholder="Kartu Tanda Anggota Resmi • Club Seneng Manah Batu"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Pernyataan Resmi / Disclaimer Tanggung Jawab *
                </label>
                <input
                  type="text"
                  value={editKTA.disclaimerText || ''}
                  onChange={(e) => updateEditField('disclaimerText', e.target.value)}
                  placeholder="Anggota Resmi Seneng Manah, Segala penyalahgunaan KTA adalah tanggung jawab pemegang."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-pink-300 focus:outline-none focus:border-pink-500 font-medium"
                />
              </div>
            </div>

            {/* SECTION 2: TEKS BELAKANG, PELATIH & KONTAK */}
            <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>Pengaturan Teks Belakang & Penanggung Jawab Pelatih</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Sub-Judul Belakang KTA</label>
                  <input
                    type="text"
                    value={editKTA.backSubtitle || ''}
                    onChange={(e) => updateEditField('backSubtitle', e.target.value)}
                    placeholder="KETENTUAN KARTU TANDA ANGGOTA"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nama Pelatih Kepala / Penanggung Jawab KTA</label>
                  <input
                    type="text"
                    value={editKTA.backCoachName || ''}
                    onChange={(e) => updateEditField('backCoachName', e.target.value)}
                    placeholder="LILING RIAHELDA MAQFIROH"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Jabatan Penanggung Jawab</label>
                  <input
                    type="text"
                    value={editKTA.backCoachTitle || ''}
                    onChange={(e) => updateEditField('backCoachTitle', e.target.value)}
                    placeholder="Pelatih Kepala / Pengurus"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Kontak WhatsApp Sekretariat</label>
                  <input
                    type="text"
                    value={editKTA.backContactText || ''}
                    onChange={(e) => updateEditField('backContactText', e.target.value)}
                    placeholder="0812-3344-5566"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Lokasi Latihan / Alamat</label>
                <input
                  type="text"
                  value={editKTA.backLocationText || ''}
                  onChange={(e) => updateEditField('backLocationText', e.target.value)}
                  placeholder="Lapangan Panahan Seneng Manah Archery Field, Kota Batu"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* SECTION 3: TATA TERTIB & PERATURAN KTA */}
            <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Tata Tertib & Peraturan Pada Kartu Belakang</span>
              </h4>

              <div className="space-y-2">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={(editKTA.regulations && editKTA.regulations[idx]) || ''}
                      onChange={(e) => updateRegulation(idx, e.target.value)}
                      placeholder={`Poin Peraturan ${idx + 1}`}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: KUSTOMISASI WARNA */}
            <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Kustomisasi Warna Elemen KTA</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Warna Nama Anggota</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editKTA.nameColor}
                      onChange={(e) => updateEditField('nameColor', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={editKTA.nameColor}
                      onChange={(e) => updateEditField('nameColor', e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Warna ID Anggota</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editKTA.memberIdColor}
                      onChange={(e) => updateEditField('memberIdColor', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={editKTA.memberIdColor}
                      onChange={(e) => updateEditField('memberIdColor', e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Warna Border Kartu</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editKTA.borderColor}
                      onChange={(e) => updateEditField('borderColor', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={editKTA.borderColor}
                      onChange={(e) => updateEditField('borderColor', e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 font-mono text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={editKTA.showWatermark}
                    onChange={(e) => updateEditField('showWatermark', e.target.checked)}
                    className="rounded accent-pink-500 w-4 h-4"
                  />
                  <span className="font-bold">Aktifkan Watermark Target Panahan</span>
                </label>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-xs"
              >
                Batal / Kembali ke Pratinjau
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-pink-500/20 transition flex items-center gap-1.5 text-xs uppercase tracking-wider"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan KTA</span>
              </button>
            </div>
          </form>
        )}

        {/* Modal Action Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between text-xs text-slate-400 print:hidden gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-[11px]">
              {isApproved
                ? 'Format kartu standar ID-1 (85.60 × 53.98 mm) resolusi tinggi.'
                : isPending
                ? 'Persetujuan KTA Atlet dalam proses kelayakan.'
                : 'KTA berstatus nonaktif (Anggota telah keluar).'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isApproved && activeTab === 'preview' && (
              <>
                <button
                  onClick={() => onOpenVerification(currentAthlete.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition"
                >
                  Simulasi Scan Barcode
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-md shadow-pink-500/20"
                >
                  Cetak Sekarang
                </button>
              </>
            )}

            {canManageKTA && isApproved && onDeactivateKTA && (
              <button
                onClick={() => setShowDeactivateDialog(true)}
                className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1"
                title="Nonaktifkan KTA jika anggota keluar dari klub"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Nonaktifkan KTA (Keluar)</span>
              </button>
            )}

            {canManageKTA && isPending && onApproveKTA && (
              <button
                onClick={() => onApproveKTA(currentAthlete.id)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-lg transition shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Setujui KTA Sekarang</span>
              </button>
            )}
          </div>
        </div>

        {/* Deactivation Confirmation Dialog */}
        {showDeactivateDialog && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95">
              <div className="flex items-center space-x-2 text-rose-400">
                <UserX className="w-5 h-5" />
                <h4 className="font-black text-base text-white">Nonaktifkan KTA Atlet</h4>
              </div>
              <p className="text-xs text-slate-300">
                Anda akan menonaktifkan KTA resmi untuk <strong className="text-white">{currentAthlete.name}</strong> ({currentAthlete.memberNo}). Setelah dinonaktifkan, KTA tidak dapat dicetak atau discan valid.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Alasan Keluar / Nonaktif:
                </label>
                <input
                  type="text"
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  placeholder="Contoh: Mengundurkan diri / Pindah kota / Lulus..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeactivateDialog(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeactivate}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition shadow-md shadow-rose-600/30"
                >
                  Ya, Nonaktifkan KTA
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
