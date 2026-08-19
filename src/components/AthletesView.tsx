import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Crosshair,
  Award,
  Phone,
  Calendar,
  Layers,
  Wrench,
  CheckCircle2,
  X,
  FileText,
  QrCode,
  ShieldCheck,
  MapPin,
  Image as ImageIcon,
  Upload,
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  UserX,
  RefreshCw,
  Lock,
  XCircle,
} from 'lucide-react';
import { Athlete, BowDivision, AgeCategory, Gender, UserAccount, ClubSettings, KTAApprovalStatus } from '../types';
import { formatDateIndo, formatRupiah } from '../utils/formatters';
import { AthleteImportExportModal } from './AthleteImportExportModal';

interface AthletesViewProps {
  athletes: Athlete[];
  currentUser: UserAccount;
  clubSettings: ClubSettings;
  onAddAthlete: (athlete: Athlete) => void;
  onUpdateAthlete: (athlete: Athlete) => void;
  onDeleteAthlete: (id: string) => void;
  onOpenReportForAthlete: (athleteId: string) => void;
  onOpenMemberCardModal: (athlete: Athlete) => void;
  onOpenVerificationModal: (athleteId: string) => void;
  onBatchImportAthletes?: (athletes: Athlete[]) => void;
  onApproveKTA?: (athleteId: string, notes?: string) => void;
  onRejectKTA?: (athleteId: string, reason?: string) => void;
  onDeactivateKTA?: (athleteId: string, reason?: string) => void;
  onReactivateKTA?: (athleteId: string) => void;
}

export const AthletesView: React.FC<AthletesViewProps> = ({
  athletes,
  currentUser,
  clubSettings,
  onAddAthlete,
  onUpdateAthlete,
  onDeleteAthlete,
  onOpenReportForAthlete,
  onOpenMemberCardModal,
  onOpenVerificationModal,
  onBatchImportAthletes,
  onApproveKTA,
  onRejectKTA,
  onDeactivateKTA,
  onReactivateKTA,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedAgeCategory, setSelectedAgeCategory] = useState<string>('ALL');
  const [selectedKTAStatus, setSelectedKTAStatus] = useState<string>('ALL');
  const [detailAthlete, setDetailAthlete] = useState<Athlete | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);

  // Deactivation confirmation dialog state
  const [deactivatingAthlete, setDeactivatingAthlete] = useState<Athlete | null>(null);
  const [deactivateReasonInput, setDeactivateReasonInput] = useState('Anggota Keluar / Mengundurkan Diri');

  const isSuperAdmin = currentUser.role === 'super_admin';
  const isAdmin = currentUser.role === 'admin';
  const isAthlete = currentUser.role === 'atlit';

  const canManageAthletes = isSuperAdmin || isAdmin || currentUser.role === 'pelatih_utama';
  const canManageKTA = isSuperAdmin || isAdmin;

  // Form State
  const [formData, setFormData] = useState<Partial<Athlete>>({
    name: '',
    memberNo: '',
    gender: 'L',
    nik: '',
    birthPlace: 'Kota Batu',
    birthDate: '2010-01-01',
    ageCategory: 'U-15',
    division: 'Horsebow',
    phone: '',
    parentName: '',
    parentPhone: '',
    address: '',
    joinDate: new Date().toISOString().slice(0, 10),
    active: true,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    userRole: 'atlit',
    username: '',
    password: 'password123',
    ktaStatus: 'APPROVED',
    leaveReason: '',
    notes: '',
    equipment: {
      bowBrand: 'Ottoman Sipahi Bow',
      bowType: 'Horsebow 48"',
      drawWeightLbs: 35,
      drawLengthInch: 28,
      arrowBrand: 'Carbon Traditional Hybrid',
      arrowSpine: '600',
      sightMarkNotes: '',
      thumbRingType: 'Ottoman Brass Ring',
      khatraStyle: 'Forward Khatra',
      quiverType: 'Hip Quiver',
    },
  });

  const divisions: BowDivision[] = ['Horsebow'];
  const ageCategories: AgeCategory[] = ['U-10', 'U-12', 'U-15', 'U-18', 'Senior/Umum'];

  // Filtered athletes (if current user is athlete, restricted to their own profile)
  const filteredAthletes = athletes.filter((a) => {
    if (isAthlete) {
      const isOwn =
        (currentUser.athleteId && a.id === currentUser.athleteId) ||
        (currentUser.name && a.name.toLowerCase().includes(currentUser.name.toLowerCase())) ||
        (currentUser.username && a.name.toLowerCase().includes(currentUser.username.toLowerCase()));
      if (!isOwn) return false;
    }
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.memberNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.birthPlace && a.birthPlace.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.address && a.address.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDiv = selectedDivision === 'ALL' || a.division === selectedDivision;
    const matchesAge = selectedAgeCategory === 'ALL' || a.ageCategory === selectedAgeCategory;
    
    // KTA filter
    const effectiveKtaStatus = a.ktaStatus || (a.active === false ? 'NONAKTIF' : 'PENDING');
    const matchesKTA =
      selectedKTAStatus === 'ALL' ||
      (selectedKTAStatus === 'APPROVED' && effectiveKtaStatus === 'APPROVED' && a.active !== false) ||
      (selectedKTAStatus === 'PENDING' && effectiveKtaStatus === 'PENDING') ||
      (selectedKTAStatus === 'NONAKTIF' && (effectiveKtaStatus === 'NONAKTIF' || a.active === false));

    return matchesSearch && matchesDiv && matchesAge && matchesKTA;
  });

  const handleOpenAddModal = () => {
    setEditingAthlete(null);
    const nextMemberNum = String(athletes.length + 1).padStart(3, '0');
    setFormData({
      name: '',
      memberNo: `SM-BATU-${nextMemberNum}`,
      gender: 'L',
      nik: `357901${String(Date.now()).slice(-10)}`,
      birthPlace: 'Kota Batu',
      birthDate: '2010-01-01',
      ageCategory: 'U-15',
      division: 'Horsebow',
      phone: '',
      parentName: '',
      parentPhone: '',
      address: 'Kota Batu, Jawa Timur',
      joinDate: new Date().toISOString().slice(0, 10),
      active: true,
      ktaStatus: isSuperAdmin || isAdmin ? 'APPROVED' : 'PENDING',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      userRole: 'atlit',
      username: `atlit_${nextMemberNum}`,
      password: 'password123',
      notes: '',
      equipment: {
        bowBrand: 'Ottoman Turkish Bow',
        bowType: 'Horsebow 48"',
        drawWeightLbs: 35,
        drawLengthInch: 28,
        arrowBrand: 'Carbon Traditional Hybrid',
        arrowSpine: '600',
        sightMarkNotes: '',
        thumbRingType: 'Ottoman Brass Ring',
        khatraStyle: 'Forward Khatra',
        quiverType: 'Hip Quiver',
      },
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (athlete: Athlete) => {
    setEditingAthlete(athlete);
    setFormData({
      ...athlete,
      ktaStatus: athlete.ktaStatus || (athlete.active === false ? 'NONAKTIF' : 'PENDING'),
      userRole: athlete.userRole || 'atlit',
      username: athlete.username || athlete.memberNo.toLowerCase().replace(/[^a-z0-9]/g, ''),
      password: athlete.password || 'password123',
      equipment: { ...athlete.equipment },
    });
    setIsModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const isActive = formData.ktaStatus !== 'NONAKTIF';

    if (editingAthlete) {
      onUpdateAthlete({
        ...(formData as Athlete),
        id: editingAthlete.id,
        active: isActive,
      });
    } else {
      const newAthlete: Athlete = {
        ...(formData as Athlete),
        id: `ath-${Date.now()}`,
        active: isActive,
      };
      onAddAthlete(newAthlete);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDeactivate = () => {
    if (!deactivatingAthlete) return;
    if (onDeactivateKTA) {
      onDeactivateKTA(deactivatingAthlete.id, deactivateReasonInput.trim() || 'Anggota Keluar');
    }
    setDeactivatingAthlete(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-pink-500/20">
              <Users className="w-4 h-4" />
            </div>
            <span>Database Atlet & Verifikasi Kelayakan KTA</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data lengkap atlet {clubSettings.clubName} • Penerbitan KTA memerlukan persetujuan Super Admin & Admin
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {(isSuperAdmin || isAdmin) && (
            <button
              onClick={() => setIsImportExportOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-pink-300 border border-pink-500/30 text-xs font-bold transition shadow-xs"
              title="Impor dan Ekspor Data Atlet (CSV / Excel / JSON)"
            >
              <Upload className="w-3.5 h-3.5 text-pink-400" />
              <span>Impor & Ekspor Data</span>
            </button>
          )}

          <button
            onClick={() => onOpenVerificationModal(athletes[0]?.id)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition"
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Simulasi Scan Barcode</span>
          </button>

          {canManageAthletes && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-pink-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Atlet Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, ID, alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 font-medium"
          />
        </div>

        {/* Division Filter */}
        <div className="flex items-center space-x-2">
          <Crosshair className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-pink-500 font-medium"
          >
            <option value="ALL">Semua Divisi Busur</option>
            {divisions.map((d) => (
              <option key={d} value={d}>
                Divisi {d}
              </option>
            ))}
          </select>
        </div>

        {/* Age Category Filter */}
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <select
            value={selectedAgeCategory}
            onChange={(e) => setSelectedAgeCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-pink-500 font-medium"
          >
            <option value="ALL">Semua Kategori Usia</option>
            {ageCategories.map((c) => (
              <option key={c} value={c}>
                Kategori {c}
              </option>
            ))}
          </select>
        </div>

        {/* KTA Status Filter */}
        <div className="flex items-center space-x-2">
          <QrCode className="w-4 h-4 text-slate-400" />
          <select
            value={selectedKTAStatus}
            onChange={(e) => setSelectedKTAStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-pink-500 font-medium"
          >
            <option value="ALL">Semua Status KTA</option>
            <option value="APPROVED">🟢 KTA Disetujui (Aktif)</option>
            <option value="PENDING">⏳ Dalam Proses Kelayakan</option>
            <option value="NONAKTIF">🚫 KTA Nonaktif (Keluar)</option>
          </select>
        </div>
      </div>

      {/* Athlete Cards Grid */}
      {filteredAthletes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">Belum Ada Data Anggota / Atlet</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Data anggota saat ini tidak ditemukan sesuai filter. Calon atlet dapat mendaftar dari jauh melalui portal pendaftaran publik atau ditambahkan langsung oleh Super Admin.
          </p>
          {canManageAthletes && (
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-90 transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Anggota Perdana</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAthletes.map((athlete) => {
          const effectiveKtaStatus = athlete.ktaStatus || (athlete.active === false ? 'NONAKTIF' : 'PENDING');
          const isKtaApproved = effectiveKtaStatus === 'APPROVED' && athlete.active !== false;
          const isKtaPending = effectiveKtaStatus === 'PENDING';
          const isKtaInactive = effectiveKtaStatus === 'NONAKTIF' || athlete.active === false;

          return (
            <div
              key={athlete.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between ${
                isKtaPending
                  ? 'border-amber-300 hover:border-amber-400 bg-amber-50/20'
                  : isKtaInactive
                  ? 'border-rose-200 hover:border-rose-300 bg-rose-50/20 opacity-80'
                  : 'border-slate-200 hover:border-pink-300'
              }`}
            >
              <div>
                {/* Header Card with Photo and ID */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={athlete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                        alt={athlete.name}
                        className={`w-13 h-13 rounded-xl object-cover border-2 shadow-xs bg-slate-100 ${
                          isKtaApproved
                            ? 'border-pink-500/40'
                            : isKtaPending
                            ? 'border-amber-500'
                            : 'border-rose-400 grayscale'
                        }`}
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white ${
                          isKtaApproved ? 'bg-emerald-500' : isKtaPending ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug">{athlete.name}</h3>
                      <p className="text-xs text-pink-600 font-mono font-bold">{athlete.memberNo}</p>
                    </div>
                  </div>

                  <span
                    className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap"
                  >
                    {athlete.division}
                  </span>
                </div>

                {/* KTA Status Badge & Level Role */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                  {/* KTA Status Badge */}
                  {isKtaApproved ? (
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> KTA Resmi (Aktif)
                    </span>
                  ) : isKtaPending ? (
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-600" /> Dalam Proses Kelayakan
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <UserX className="w-3 h-3 text-rose-600" /> KTA Nonaktif (Keluar)
                    </span>
                  )}

                  {/* Level Role Badge */}
                  {athlete.userRole && athlete.userRole !== 'atlit' ? (
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase border ${
                        athlete.userRole === 'super_admin'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : athlete.userRole === 'admin'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : athlete.userRole === 'pelatih' || athlete.userRole === 'pelatih_utama'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                      }`}
                    >
                      Level: {athlete.userRole === 'super_admin' ? 'Super Admin' : athlete.userRole === 'admin' ? 'Admin' : athlete.userRole === 'pelatih_atlit' ? 'Pelatih / Atlit' : 'Pelatih'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      Level: Atlit
                    </span>
                  )}

                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[11px] border border-purple-100">
                    {athlete.ageCategory} ({athlete.gender === 'L' ? 'Putra' : 'Putri'})
                  </span>
                </div>

                {/* Address & WhatsApp */}
                <div className="mt-2.5 space-y-1 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight line-clamp-1">{athlete.address || 'Kota Batu, Jawa Timur'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/50">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-mono">{athlete.phone || athlete.parentPhone || '-'}</span>
                  </div>
                </div>

                {/* Status Notice if Pending or Nonaktif */}
                {isKtaPending && (
                  <div className="mt-2 p-2 rounded-lg bg-amber-100/70 border border-amber-300 text-[11px] text-amber-900 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="font-semibold leading-tight">
                      persetujuan KTA Altit dalam proses kelayakan
                    </span>
                  </div>
                )}

                {isKtaInactive && athlete.leaveReason && (
                  <div className="mt-2 p-2 rounded-lg bg-rose-100/70 border border-rose-300 text-[11px] text-rose-900 flex items-start gap-1.5">
                    <UserX className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span className="leading-tight">
                      <strong>Alasan Keluar:</strong> {athlete.leaveReason}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions Toolbar */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
                {/* Admin Quick KTA Approval / Deactivation Buttons */}
                {canManageKTA && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isKtaPending && (
                      <>
                        {onApproveKTA && (
                          <button
                            onClick={() => onApproveKTA(athlete.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                            title="Setujui dan terbitkan KTA resmi atlet"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Setujui KTA</span>
                          </button>
                        )}
                        {onRejectKTA && (
                          <button
                            onClick={() => onRejectKTA(athlete.id)}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold transition flex items-center gap-1"
                            title="Tolak penerbitan KTA"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Tolak</span>
                          </button>
                        )}
                      </>
                    )}

                    {isKtaApproved && onDeactivateKTA && (
                      <button
                        onClick={() => {
                          setDeactivatingAthlete(athlete);
                          setDeactivateReasonInput('Anggota Keluar / Mengundurkan Diri');
                        }}
                        className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold transition flex items-center gap-1"
                        title="Nonaktifkan KTA jika anggota keluar dari klub"
                      >
                        <UserX className="w-3 h-3 text-rose-600" />
                        <span>Nonaktifkan KTA (Keluar)</span>
                      </button>
                    )}

                    {isKtaInactive && onReactivateKTA && (
                      <button
                        onClick={() => onReactivateKTA(athlete.id)}
                        className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold transition flex items-center gap-1"
                        title="Aktifkan kembali keanggotaan dan KTA"
                      >
                        <RefreshCw className="w-3 h-3 text-emerald-600" />
                        <span>Aktifkan Kembali KTA</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    {/* Print KTA Button */}
                    <button
                      onClick={() => onOpenMemberCardModal(athlete)}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-white text-xs font-bold shadow-xs transition ${
                        isKtaApproved
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90'
                          : isKtaPending
                          ? 'bg-amber-600 hover:bg-amber-500'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      title={isKtaApproved ? 'Lihat / Cetak KTA Berbarcode' : 'Cek Status KTA'}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{isKtaApproved ? 'KTA' : 'Cek KTA'}</span>
                    </button>

                    <button
                      onClick={() => setDetailAthlete(athlete)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                      title="Detail Profil Lengkap"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Profil</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onOpenReportForAthlete(athlete.id)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition"
                      title="Cetak Rapor Prestasi"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    {canManageAthletes && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(athlete)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition"
                          title="Edit Data Atlet"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus data atlet ${athlete.name}?`)) {
                              onDeleteAthlete(athlete.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition"
                          title="Hapus Data Atlet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* DETAIL ATHLETE MODAL */}
      {detailAthlete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-pink-500/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center space-x-3">
                <img
                  src={detailAthlete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={detailAthlete.name}
                  className="w-10 h-10 rounded-xl object-cover border border-pink-500/50"
                />
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">{detailAthlete.name}</h3>
                  <p className="text-xs text-pink-400 font-mono">{detailAthlete.memberNo}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailAthlete(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
              {/* Status KTA Alert in Detail */}
              {detailAthlete.ktaStatus === 'PENDING' && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs">persetujuan KTA Altit dalam proses kelayakan</h5>
                    <p className="text-[11px] text-amber-200/80 mt-0.5">
                      Penerbitan KTA memerlukan persetujuan dari Super Admin / Admin sebelum resmi diterbitkan dan berbarcode aktif.
                    </p>
                  </div>
                </div>
              )}

              {detailAthlete.ktaStatus === 'NONAKTIF' && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 flex items-start gap-2">
                  <UserX className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs">KTA Telah Dinonaktifkan (Status: Anggota Keluar)</h5>
                    <p className="text-[11px] text-rose-200/80 mt-0.5">
                      {detailAthlete.leaveReason || 'Anggota telah dinonaktifkan dari klub.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Personal Details */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-pink-400 uppercase tracking-widest flex items-center gap-1.5 text-xs">
                  <UserCheck className="w-4 h-4" />
                  <span>Biodata Lengkap & Alamat Domisili</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nama Lengkap:</span>
                    <strong className="text-white text-sm">{detailAthlete.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">No. ID Anggota:</span>
                    <strong className="text-pink-300 font-mono text-sm">{detailAthlete.memberNo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Divisi Busur:</span>
                    <span className="text-blue-300 font-bold">{detailAthlete.division}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kategori Usia:</span>
                    <span className="text-purple-300 font-bold">
                      {detailAthlete.ageCategory} ({detailAthlete.gender === 'L' ? 'Putra' : 'Putri'})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tempat, Tgl Lahir:</span>
                    <span className="text-slate-200">
                      {detailAthlete.birthPlace}, {formatDateIndo(detailAthlete.birthDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tanggal Bergabung:</span>
                    <span className="text-slate-200">{formatDateIndo(detailAthlete.joinDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">WhatsApp Atlet:</span>
                    <span className="text-emerald-400 font-mono">{detailAthlete.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Orang Tua / Wali:</span>
                    <span className="text-slate-200">
                      {detailAthlete.parentName || '-'} ({detailAthlete.parentPhone || '-'})
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[10px]">Alamat Lengkap:</span>
                    <span className="text-slate-200">{detailAthlete.address}</span>
                  </div>
                </div>
              </div>

              {/* Equipment Specifications */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5 text-xs">
                  <Wrench className="w-4 h-4" />
                  <span>Spesifikasi Peralatan (Horsebow Equipment)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Jenis Busur:</span>
                    <strong className="text-slate-200">{detailAthlete.equipment?.bowType || 'Horsebow'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Draw Weight:</span>
                    <strong className="text-pink-300 font-mono">{detailAthlete.equipment?.drawWeightLbs || '-'} lbs</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Draw Length:</span>
                    <strong className="text-purple-300 font-mono">{detailAthlete.equipment?.drawLengthInch || '-'}″</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Arrow Spine:</span>
                    <strong className="text-blue-300 font-mono">{detailAthlete.equipment?.arrowSpine || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Thumb Ring:</span>
                    <strong className="text-slate-200">{detailAthlete.equipment?.thumbRingType || 'Brass Ring'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Khatra Style:</span>
                    <strong className="text-slate-200">{detailAthlete.equipment?.khatraStyle || 'Forward'}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
              <button
                onClick={() => {
                  setDetailAthlete(null);
                  onOpenMemberCardModal(detailAthlete);
                }}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4" />
                <span>Buka Kartu KTA Digital</span>
              </button>
              <button
                onClick={() => setDetailAthlete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate KTA Dialog */}
      {deactivatingAthlete && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-2 text-rose-400">
              <UserX className="w-5 h-5" />
              <h4 className="font-black text-base text-white">Nonaktifkan KTA (Anggota Keluar)</h4>
            </div>
            <p className="text-xs text-slate-300">
              Anda akan menonaktifkan KTA resmi untuk <strong className="text-white">{deactivatingAthlete.name}</strong> ({deactivatingAthlete.memberNo}). Setelah dinonaktifkan, KTA tidak dapat dicetak atau discan valid.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Alasan Keluar / Nonaktif:
              </label>
              <input
                type="text"
                value={deactivateReasonInput}
                onChange={(e) => setDeactivateReasonInput(e.target.value)}
                placeholder="Contoh: Mengundurkan diri / Pindah kota / Lulus..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeactivatingAthlete(null)}
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

      {/* ADD / EDIT ATHLETE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-pink-500/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/40 flex items-center justify-center font-bold">
                  {editingAthlete ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <h3 className="text-base font-bold text-white">
                  {editingAthlete ? `Edit Data Atlet: ${editingAthlete.name}` : 'Tambah Atlet / Anggota Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAthlete} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* KTA Approval Status selector for Admin/Super Admin */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <span>Status Persetujuan Penerbitan KTA</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Otorisasi Super Admin / Admin</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Status KTA *</label>
                    <select
                      value={formData.ktaStatus || 'APPROVED'}
                      onChange={(e) => setFormData({ ...formData, ktaStatus: e.target.value as KTAApprovalStatus })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                    >
                      <option value="APPROVED">1. Disetujui & Diterbitkan Resmi (Aktif)</option>
                      <option value="PENDING">2. Dalam Proses Kelayakan (Pending)</option>
                      <option value="NONAKTIF">3. Dinonaktifkan (Anggota Keluar)</option>
                    </select>
                  </div>

                  {formData.ktaStatus === 'NONAKTIF' && (
                    <div>
                      <label className="block font-bold text-rose-300 mb-1">Alasan Keluar / Nonaktif</label>
                      <input
                        type="text"
                        value={formData.leaveReason || ''}
                        onChange={(e) => setFormData({ ...formData, leaveReason: e.target.value })}
                        placeholder="Contoh: Pindah domisili / Mengundurkan diri..."
                        className="w-full bg-slate-800 border border-rose-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Photo & Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Foto Profil Atlet</label>
                  <div className="flex flex-col items-center p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                    <img
                      src={formData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                      alt="Preview"
                      className="w-20 h-24 rounded-lg object-cover border border-pink-500/50 bg-slate-900"
                    />
                    <label className="cursor-pointer px-3 py-1 bg-slate-800 hover:bg-slate-700 text-pink-300 text-[11px] font-bold rounded-lg border border-pink-500/30 transition flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      <span>Unggah Foto</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">Nama Lengkap Atlet *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Muhammad Farhan Al-Fatih"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold">Nomor ID Anggota *</label>
                      <input
                        type="text"
                        required
                        value={formData.memberNo || ''}
                        onChange={(e) => setFormData({ ...formData, memberNo: e.target.value })}
                        placeholder="SM-BATU-001"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-pink-300 font-mono focus:outline-none focus:border-pink-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold">Jenis Kelamin</label>
                      <select
                        value={formData.gender || 'L'}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                      >
                        <option value="L">Laki-Laki (Putra)</option>
                        <option value="P">Perempuan (Putri)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tempat & Tanggal Lahir */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.birthPlace || ''}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    placeholder="Kota Batu / Malang"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.birthDate || '2010-01-01'}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Kategori Usia</label>
                  <select
                    value={formData.ageCategory || 'U-15'}
                    onChange={(e) => setFormData({ ...formData, ageCategory: e.target.value as AgeCategory })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                  >
                    {ageCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kontak & Alamat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">No. WhatsApp Atlet</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={formData.parentName || ''}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="Nama Orang Tua"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1">Alamat Domisili</label>
                  <textarea
                    rows={2}
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Alamat lengkap domisili di Kota Batu..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 resize-none"
                  />
                </div>
              </div>

              {/* User Level Role & Account Access */}
              <div className="p-4 bg-slate-950/70 rounded-xl border border-pink-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-pink-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-pink-400" />
                    <span>Level Akses Anggota & Kredensial Login</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Multi-User RBAC Cloud</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Level / Hak Akses *</label>
                    <select
                      value={formData.userRole || 'atlit'}
                      onChange={(e) => setFormData({ ...formData, userRole: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                    >
                      <option value="super_admin">1. Super Admin</option>
                      <option value="admin">2. Admin</option>
                      <option value="pelatih">3. Pelatih</option>
                      <option value="pelatih_atlit">4. Pelatih / Atlit</option>
                      <option value="atlit">5. Atlit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Username Login *</label>
                    <input
                      type="text"
                      required
                      value={formData.username || ''}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500 font-bold"
                      placeholder="Contoh: atlit_farhan"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Password Login *</label>
                    <input
                      type="text"
                      required
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500 font-bold"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Equipment section */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-blue-400 uppercase tracking-wider text-xs">
                  Spesifikasi Peralatan Busur (Equipment)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Draw Weight (lbs)</label>
                    <input
                      type="number"
                      value={formData.equipment?.drawWeightLbs || 30}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          equipment: { ...formData.equipment!, drawWeightLbs: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Draw Length (inch)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.equipment?.drawLengthInch || 27}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          equipment: { ...formData.equipment!, drawLengthInch: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Arrow Spine</label>
                    <input
                      type="text"
                      value={formData.equipment?.arrowSpine || '600'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          equipment: { ...formData.equipment!, arrowSpine: e.target.value },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                      placeholder="500, 600, 1616"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-pink-500/20 transition"
                >
                  Simpan Data Atlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Impor dan Ekspor Data Atlet Modal */}
      <AthleteImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        athletes={athletes}
        currentUser={currentUser}
        onBatchImportAthletes={(importedList) => {
          if (onBatchImportAthletes) {
            onBatchImportAthletes(importedList);
          } else {
            importedList.forEach((ath) => {
              const exists = athletes.find((a) => a.id === ath.id || a.memberNo === ath.memberNo);
              if (exists) {
                onUpdateAthlete({ ...ath, id: exists.id });
              } else {
                onAddAthlete(ath);
              }
            });
          }
        }}
      />
    </div>
  );
};
