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
} from 'lucide-react';
import { Athlete, BowDivision, AgeCategory, Gender, UserAccount, ClubSettings } from '../types';
import { formatDateIndo, formatRupiah } from '../utils/formatters';

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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedAgeCategory, setSelectedAgeCategory] = useState<string>('ALL');
  const [detailAthlete, setDetailAthlete] = useState<Athlete | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);

  const isSuperAdmin = currentUser.role === 'super_admin';
  const isAdmin = currentUser.role === 'admin';
  const isAthlete = currentUser.role === 'atlit';

  const canManageAthletes = isSuperAdmin || isAdmin || currentUser.role === 'pelatih_utama';

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
    return matchesSearch && matchesDiv && matchesAge;
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

    if (editingAthlete) {
      onUpdateAthlete({
        ...(formData as Athlete),
        id: editingAthlete.id,
      });
    } else {
      const newAthlete: Athlete = {
        ...(formData as Athlete),
        id: `ath-${Date.now()}`,
      };
      onAddAthlete(newAthlete);
    }
    setIsModalOpen(false);
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
            <span>Database Atlet & Fasilitas Cetak KTA Berbarcode</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data lengkap atlet {clubSettings.clubName} ({athletes.length} atlet terdaftar)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama atlet, nomor ID, alamat, tempat lahir..."
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
      </div>

      {/* Athlete Cards Grid */}
      {filteredAthletes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">Belum Ada Data Anggota / Atlet</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Data anggota saat ini kosong. Calon atlet dapat mendaftar dari jauh melalui portal pendaftaran publik atau ditambahkan langsung oleh Super Admin.
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
        {filteredAthletes.map((athlete) => (
          <div
            key={athlete.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:border-pink-300 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Header Card with Photo and ID */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={athlete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                      alt={athlete.name}
                      className="w-13 h-13 rounded-xl object-cover border-2 border-pink-500/40 shadow-xs bg-slate-100"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-white" />
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

              {/* Badges & Meta */}
              <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs">
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
                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Level: Atlit
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[11px] border border-purple-100">
                  {athlete.ageCategory} ({athlete.gender === 'L' ? 'Putra' : 'Putri'})
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[11px]">
                  {athlete.birthPlace}, {formatDateIndo(athlete.birthDate)}
                </span>
              </div>

              {/* Address & WhatsApp */}
              <div className="mt-3 space-y-1.5 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight line-clamp-2">{athlete.address || 'Kota Batu, Jawa Timur'}</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/50">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-mono">{athlete.phone || athlete.parentPhone || '-'}</span>
                </div>
              </div>

              {/* Equipment Highlight */}
              <div className="mt-2.5 p-2.5 bg-slate-900 text-white rounded-xl text-[11px] space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Draw Weight / Length:</span>
                  <strong className="text-pink-300 font-mono">
                    {athlete.equipment?.drawWeightLbs || '-'} lbs / {athlete.equipment?.drawLengthInch || '-'}″
                  </strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Arrow Spine:</span>
                  <strong className="text-blue-300 font-mono">{athlete.equipment?.arrowSpine || '-'}</strong>
                </div>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5">
                {/* Print KTA Button */}
                <button
                  onClick={() => onOpenMemberCardModal(athlete)}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white text-xs font-bold shadow-xs transition"
                  title="Cetak Kartu Anggota (KTA Berbarcode)"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>KTA</span>
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
        ))}
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
                    <span className="text-slate-400 block text-[10px]">Tempat, Tanggal Lahir:</span>
                    <span className="text-slate-200">
                      {detailAthlete.birthPlace}, {formatDateIndo(detailAthlete.birthDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">NIK KTP / KIA (Internal Admin):</span>
                    <span className="text-slate-300 font-mono">
                      {currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'pelatih_utama'
                        ? detailAthlete.nik
                        : '●●●●●●●●●●●●●●●● (Disembunyikan)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">No. WhatsApp Atlet:</span>
                    <span className="text-emerald-400 font-mono font-bold">{detailAthlete.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Orang Tua / Wali:</span>
                    <span className="text-slate-200">{detailAthlete.parentName} ({detailAthlete.parentPhone})</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[10px]">Alamat Domisili:</span>
                    <span className="text-slate-200">{detailAthlete.address}</span>
                  </div>
                </div>
              </div>

              {/* Equipment Specifications */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-blue-400 uppercase tracking-widest flex items-center space-x-2 text-xs">
                  <Wrench className="w-4 h-4" />
                  <span>Spesifikasi Alat Panahan & Tuning</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Model & Merek Busur:</span>
                    <strong className="text-white">{detailAthlete.equipment?.bowType} ({detailAthlete.equipment?.bowBrand || '-'})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Draw Weight & Length:</span>
                    <strong className="text-pink-300 font-mono">{detailAthlete.equipment?.drawWeightLbs} lbs / {detailAthlete.equipment?.drawLengthInch}″</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Arrow & Spine:</span>
                    <span className="text-slate-200">{detailAthlete.equipment?.arrowBrand} (Spine {detailAthlete.equipment?.arrowSpine})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Stabilizer:</span>
                    <span className="text-slate-200">{detailAthlete.equipment?.stabilizerSetup || '-'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[10px]">Catatan Sight Mark Jarak:</span>
                    <p className="mt-1 p-2 bg-slate-900 rounded font-mono text-pink-300 text-[11px] border border-slate-800">
                      {detailAthlete.equipment?.sightMarkNotes || 'Belum ada catatan sight mark'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center gap-2">
              <button
                onClick={() => {
                  onOpenMemberCardModal(detailAthlete);
                  setDetailAthlete(null);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-pink-500/20"
              >
                <QrCode className="w-4 h-4" />
                <span>Cetak KTA Barcode</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onOpenReportForAthlete(detailAthlete.id);
                    setDetailAthlete(null);
                  }}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>Rapor Atlet</span>
                </button>
                <button
                  onClick={() => setDetailAthlete(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT ATHLETE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-pink-500/30 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{editingAthlete ? 'Edit Profil & Data Atlet' : 'Form Pendaftaran Atlet Panahan Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAthlete} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Photo & Main Identity */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-pink-400 uppercase tracking-wider text-xs">
                  Foto & Identitas Atlet
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-4 flex flex-col items-center">
                    <div className="w-24 h-28 rounded-xl border-2 border-pink-500/50 bg-slate-950 overflow-hidden shadow-md">
                      <img
                        src={formData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                        alt="Foto Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label
                      htmlFor="ath-photo-file"
                      className="cursor-pointer text-[10px] font-bold text-pink-400 hover:text-pink-300 underline mt-1.5 block"
                    >
                      Pilih Foto Baru
                    </label>
                    <input
                      id="ath-photo-file"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="sm:col-span-8 space-y-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        Nama Lengkap Atlet *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                        placeholder="Contoh: Muhammad Farhan Al-Fatih"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">
                          Nomor ID Anggota (KTA) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.memberNo || ''}
                          onChange={(e) => setFormData({ ...formData, memberNo: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-pink-500"
                          placeholder="SM-BATU-001"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1">
                          NIK (KTP / KIA) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nik || ''}
                          onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                          placeholder="357901xxxx"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Pribadi & Kontak */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-purple-400 uppercase tracking-wider text-xs">
                  Tempat Lahir, Tanggal & Kontak WhatsApp
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Tempat Lahir *</label>
                    <input
                      type="text"
                      required
                      value={formData.birthPlace || ''}
                      onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                      placeholder="Kota Batu"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Tanggal Lahir *</label>
                    <input
                      type="date"
                      required
                      value={formData.birthDate || '2010-01-01'}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Nomor WhatsApp Atlet *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                      placeholder="0813-xxxx-xxxx"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Jenis Kelamin</label>
                    <select
                      value={formData.gender || 'L'}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                    >
                      <option value="L">Laki-laki (Putra)</option>
                      <option value="P">Perempuan (Putri)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-300 mb-1">Alamat Domisili Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                      placeholder="Jl. Melati No. 14, Kota Batu, Jawa Timur"
                    />
                  </div>
                </div>
              </div>

              {/* Divisi Busur & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Divisi Busur (Tunggal)</label>
                  <div className="w-full bg-slate-800/90 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-amber-300 font-bold flex items-center justify-between">
                    <span>HORSEBOW (Traditional Archery)</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">Official Single Division</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Kategori Usia *</label>
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

                <p className="text-[11px] text-slate-400">
                  Anggota dapat langsung login menggunakan username dan password di atas sesuai dengan level hak akses yang dipilih.
                </p>
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
    </div>
  );
};
