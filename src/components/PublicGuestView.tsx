import React, { useState } from 'react';
import {
  LogIn,
  UserCheck,
  FileText,
  Search,
  ShieldCheck,
  Target,
  Sparkles,
  ChevronRight,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Award,
  Users,
  Copy,
  Check,
  Send,
  Building2,
  KeyRound,
  ShieldAlert,
  Download,
  Smartphone,
} from 'lucide-react';
import { ClubSettings, NewsArticle, RegistrationRequest, UserAccount, Gender, AgeCategory, BowDivision } from '../types';

interface PublicGuestViewProps {
  clubSettings: ClubSettings;
  newsList: NewsArticle[];
  users: UserAccount[];
  registrations: RegistrationRequest[];
  onLogin: (user: UserAccount) => void;
  onSubmitRegistration: (newReg: RegistrationRequest) => void;
  onOpenAndroidInstall?: () => void;
}

type GuestTab = 'login' | 'news' | 'register' | 'check_status';

export const PublicGuestView: React.FC<PublicGuestViewProps> = ({
  clubSettings,
  newsList,
  users,
  registrations,
  onLogin,
  onSubmitRegistration,
  onOpenAndroidInstall,
}) => {
  const [activeGuestTab, setActiveGuestTab] = useState<GuestTab>('login');

  // Login form state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [selectedQuickUser, setSelectedQuickUser] = useState<UserAccount | null>(null);

  // Selected news for reading modal
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [newsFilterCategory, setNewsFilterCategory] = useState<string>('all');
  const [newsSearch, setNewsSearch] = useState('');

  // Registration form state
  const [regForm, setRegForm] = useState({
    name: '',
    nickname: '',
    gender: 'L' as Gender,
    nik: '',
    birthPlace: '',
    birthDate: '2010-01-01',
    ageCategory: 'U-18' as AgeCategory,
    division: 'Horsebow' as BowDivision,
    phone: '',
    parentName: '',
    parentPhone: '',
    address: '',
    experienceNotes: '',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  });

  // Anti-Robot verification states
  const [captchaNum1, setCaptchaNum1] = useState(10);
  const [captchaNum2, setCaptchaNum2] = useState(9);
  const [captchaAnswerInput, setCaptchaAnswerInput] = useState('');
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState('');
  const [regSuccessData, setRegSuccessData] = useState<RegistrationRequest | null>(null);
  const [regCopied, setRegCopied] = useState(false);

  // Status check states
  const [statusSearchQuery, setStatusSearchQuery] = useState('');
  const [searchedRegResult, setSearchedRegResult] = useState<RegistrationRequest | null | undefined>(undefined);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const handleDownloadSourceZip = async () => {
    setIsDownloadingZip(true);
    try {
      const response = await fetch('/api/download-source-zip');
      if (!response.ok) throw new Error('Gagal mengunduh ZIP');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seneng-manah-horsebow-project-source.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download error:', err);
      window.location.href = '/api/download-source-zip';
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Generate new captcha numbers
  const refreshCaptcha = () => {
    const n1 = Math.floor(Math.random() * 6) + 5; // 5 - 10
    const n2 = Math.floor(Math.random() * 10) + 1; // 1 - 10
    setCaptchaNum1(n1);
    setCaptchaNum2(n2);
    setCaptchaAnswerInput('');
    setIsCaptchaVerified(false);
    setCaptchaError('');
  };

  // Handle Login submission
  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedUser = usernameInput.trim().toLowerCase();
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === trimmedUser ||
        (u.phone && u.phone.replace(/[^0-9]/g, '') === trimmedUser.replace(/[^0-9]/g, ''))
    );

    if (!user) {
      setLoginError('Username atau nomor telepon tidak ditemukan.');
      return;
    }

    if (user.password && user.password !== passwordInput) {
      setLoginError('Password tidak sesuai. Silakan periksa kembali.');
      return;
    }

    onLogin(user);
  };

  // Quick login handler
  const handleQuickLogin = (user: UserAccount) => {
    onLogin(user);
  };

  // Calculate age category automatically based on birth date
  const handleBirthDateChange = (dateStr: string) => {
    const birthYear = new Date(dateStr).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    let autoCat: AgeCategory = 'Senior/Umum';
    if (age <= 10) autoCat = 'U-10';
    else if (age <= 12) autoCat = 'U-12';
    else if (age <= 15) autoCat = 'U-15';
    else if (age <= 18) autoCat = 'U-18';

    setRegForm((prev) => ({
      ...prev,
      birthDate: dateStr,
      ageCategory: autoCat,
    }));
  };

  // Handle Registration Submit
  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCaptchaError('');

    // Check robot verification
    const expected = captchaNum1 + captchaNum2;
    if (parseInt(captchaAnswerInput, 10) !== expected) {
      setCaptchaError(`Jawaban verifikasi skor panahan belum tepat. Coba hitung lagi: ${captchaNum1} + ${captchaNum2} = ?`);
      return;
    }

    if (!regForm.name.trim() || !regForm.nik.trim() || !regForm.phone.trim() || !regForm.address.trim()) {
      setCaptchaError('Mohon lengkapi semua data wajib bertanda bintang (*).');
      return;
    }

    // Generate unique Registration Code
    const regCode = `REG-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRegistration: RegistrationRequest = {
      id: `reg-${Date.now()}`,
      regNumber: regCode,
      name: regForm.name.trim(),
      nickname: regForm.nickname.trim() || undefined,
      gender: regForm.gender,
      nik: regForm.nik.trim(),
      birthPlace: regForm.birthPlace.trim(),
      birthDate: regForm.birthDate,
      ageCategory: regForm.ageCategory,
      division: regForm.division,
      phone: regForm.phone.trim(),
      parentName: regForm.parentName.trim() || undefined,
      parentPhone: regForm.parentPhone.trim() || undefined,
      address: regForm.address.trim(),
      experienceNotes: regForm.experienceNotes.trim() || undefined,
      photoUrl: regForm.photoUrl,
      status: 'MENUNGGU_VERIFIKASI',
      submittedAt: new Date().toISOString(),
    };

    onSubmitRegistration(newRegistration);
    setRegSuccessData(newRegistration);
    refreshCaptcha();
  };

  // Status Search
  const handleSearchStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusSearchQuery.trim()) return;

    const query = statusSearchQuery.trim().toLowerCase();
    const found = registrations.find(
      (r) =>
        r.regNumber.toLowerCase().includes(query) ||
        r.phone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, '')) ||
        r.nik.includes(query) ||
        r.name.toLowerCase().includes(query)
    );

    setSearchedRegResult(found || null);
  };

  // Filtered news
  const filteredNews = newsList.filter((item) => {
    const matchCategory = newsFilterCategory === 'all' || item.category === newsFilterCategory;
    const matchSearch =
      item.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
      item.summary.toLowerCase().includes(newsSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Banner / Mobile Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-pink-500/20 px-3 sm:px-6 py-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-blue-600 p-[2px] shadow-md shadow-pink-500/20">
              <img
                src={clubSettings.logoUrl}
                alt={clubSettings.clubName}
                className="w-full h-full object-cover rounded-[10px] bg-slate-900"
              />
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-blue-400 bg-clip-text text-transparent line-clamp-1">
                {clubSettings.clubName}
              </h1>
              <p className="text-[11px] text-slate-400 line-clamp-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-pink-400 shrink-0" /> Kota Batu, Jawa Timur • Portal Publik
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenAndroidInstall && (
              <button
                onClick={onOpenAndroidInstall}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                title="Pasang Aplikasi Seneng Manah di HP Android"
              >
                <Smartphone className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                <span className="hidden sm:inline">Pasang di</span> Android
              </button>
            )}
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-300 border border-pink-500/30">
              <Target className="w-3.5 h-3.5 text-pink-400" />
              World Archery
            </span>
            <button
              onClick={() => setActiveGuestTab('register')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-md shadow-pink-500/20 transition-all active:scale-95 flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Daftar</span> Baru
            </button>
          </div>
        </div>

        {/* Android PWA Quick Banner for Mobile Visitors */}
        {onOpenAndroidInstall && (
          <div className="max-w-4xl mx-auto mt-2.5 px-1">
            <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-pink-950/60 via-purple-950/40 to-slate-900 border border-pink-500/30 shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 border border-pink-500/30">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    Bisa Dipasang di HP Android! 📱
                  </p>
                  <p className="text-[10px] text-pink-300/80 truncate">
                    Pasang sebagai aplikasi langsung di layar utama (PWA) tanpa download APK
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenAndroidInstall}
                className="px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-black shrink-0 transition shadow-sm active:scale-95 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Pasang Sekarang</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Navigation Tabs (Segmented Control) */}
        <div className="max-w-4xl mx-auto mt-3">
          <div className="grid grid-cols-4 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-center gap-1">
            <button
              onClick={() => setActiveGuestTab('login')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                activeGuestTab === 'login'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>

            <button
              onClick={() => setActiveGuestTab('register')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                activeGuestTab === 'register'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Pendaftaran</span>
            </button>

            <button
              onClick={() => setActiveGuestTab('check_status')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                activeGuestTab === 'check_status'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Cek Status</span>
            </button>

            <button
              onClick={() => setActiveGuestTab('news')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                activeGuestTab === 'news'
                  ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white shadow-md shadow-pink-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Berita Klub</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Public Body (Mobile Centric Container) */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 pb-20">
        {/* ======================= TAB 1: AREA LOGIN ======================= */}
        {activeGuestTab === 'login' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Login Card */}
            <div className="bg-slate-900/90 border border-pink-500/30 rounded-2xl p-5 sm:p-7 shadow-2xl shadow-purple-950/40 relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 border border-pink-500/30 text-pink-400 mb-3 shadow-inner">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Masuk ke Portal Klub
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
                  Silakan login untuk mengakses menu khusus Super Admin, Admin, Pelatih, atau Atlit.
                </p>
              </div>

              {loginError && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <span className="font-bold block">Gagal Masuk</span>
                    {loginError}
                  </div>
                </div>
              )}

              <form onSubmit={handleFormLogin} className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Username atau No. WhatsApp
                  </label>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Contoh: zou atau 0812-3456-7890"
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-500">Super Admin: senengm4n4h</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Masukkan password akun..."
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-sm font-extrabold bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 hover:opacity-95 text-white shadow-lg shadow-pink-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Masuk Sekarang
                </button>
              </form>

              {/* Security & Authentication Info */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
                <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Sistem Keamanan Berbasis Hak Akses (Super Admin, Admin, Pelatih, Atlet)</span>
                </div>
              </div>
            </div>

            {/* Quick Club Info Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Belum memiliki akun klub?</h3>
                  <p className="text-xs text-slate-400">
                    Ajukan pendaftaran sebagai atlet baru atau hubungi sekretariat klub.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveGuestTab('register')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-pink-300 border border-pink-500/30 transition-all shrink-0"
              >
                Isi Biodata Pendaftaran
              </button>
            </div>
          </div>
        )}

        {/* ======================= TAB 2: AREA BERITA KLUB ======================= */}
        {activeGuestTab === 'news' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Warta & Pengumuman Panahan
                </h2>
                <p className="text-xs text-slate-400">
                  Berita turnamen, jadwal latihan Kota Batu, dan prestasi atlet terbaru.
                </p>
              </div>

              <div className="relative sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={newsSearch}
                  onChange={(e) => setNewsSearch(e.target.value)}
                  placeholder="Cari berita..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'all', label: 'Semua Berita' },
                { id: 'Pengumuman Klub', label: '📢 Pengumuman' },
                { id: 'Jadwal & Event', label: '📅 Jadwal & Event' },
                { id: 'Tips & Teknik', label: '🎯 Tips & Teknik' },
                { id: 'Prestasi Atlit', label: '🏆 Prestasi' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setNewsFilterCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    newsFilterCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* News Articles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredNews.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedNews(item)}
                  className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 rounded-2xl overflow-hidden cursor-pointer group transition-all hover:shadow-xl hover:shadow-blue-950/30 flex flex-col"
                >
                  <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-950">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-900/90 backdrop-blur-md text-pink-300 border border-pink-500/40 shadow-sm">
                        {item.category}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950/80 backdrop-blur text-slate-300">
                      {item.date}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-medium text-slate-400">Oleh {item.author}</span>
                      <span className="text-blue-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Baca Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Club Training Schedule & Location Callout */}
            <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-sm font-extrabold text-purple-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-pink-400" />
                Informasi Latihan Rutin Panahan Kota Batu
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-slate-200">Jadwal Latihan:</span>
                    {clubSettings.trainingSchedule || 'Selasa & Kamis (15:30 WIB), Sabtu & Minggu (07:30 WIB)'}
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <MapPin className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-slate-200">Lokasi Lapangan:</span>
                    {clubSettings.trainingLocation || 'Lapangan Panahan Seneng Manah Archery Field, Kota Batu'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 3: PENDAFTARAN ANGGOTA BARU ======================= */}
        {activeGuestTab === 'register' && (
          <div className="space-y-6 animate-fadeIn">
            {regSuccessData ? (
              /* Success Submission Card */
              <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20 animate-bounce">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block mb-2">
                    PENGAJUAN BERHASIL TERKIRIM
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Pendaftaran Berhasil Diajukan!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
                    Data biodata calon atlet <strong className="text-white">{regSuccessData.name}</strong> telah masuk ke antrean verifikasi Admin Klub Panahan Batu.
                  </p>
                </div>

                {/* Registration Slip Badge */}
                <div className="max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs text-slate-400">Nomor Registrasi:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono font-bold text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                        {regSuccessData.regNumber}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(regSuccessData.regNumber);
                          setRegCopied(true);
                          setTimeout(() => setRegCopied(false), 2000);
                        }}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="Salin Nomor Registrasi"
                      >
                        {regCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">Divisi Busur:</span>
                      <span className="font-semibold text-slate-200">{regSuccessData.division}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Kategori Usia:</span>
                      <span className="font-semibold text-slate-200">{regSuccessData.ageCategory}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">WhatsApp:</span>
                      <span className="font-semibold text-slate-200">{regSuccessData.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Status:</span>
                      <span className="font-extrabold text-amber-400">MENUNGGU VERIFIKASI</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setStatusSearchQuery(regSuccessData.regNumber);
                      setSearchedRegResult(regSuccessData);
                      setActiveGuestTab('check_status');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white shadow-md flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Cek Status Pendaftaran
                  </button>
                  <button
                    onClick={() => {
                      setRegSuccessData(null);
                      setRegForm({
                        name: '',
                        nickname: '',
                        gender: 'L',
                        nik: '',
                        birthPlace: '',
                        birthDate: '2010-01-01',
                        ageCategory: 'U-18',
                        division: 'Horsebow',
                        phone: '',
                        parentName: '',
                        parentPhone: '',
                        address: '',
                        experienceNotes: '',
                        photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
                      });
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    Daftar Calon Lainnya
                  </button>
                </div>
              </div>
            ) : (
              /* Registration Form */
              <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 mb-2">
                    <UserCheck className="w-3.5 h-3.5 text-pink-400" />
                    Formulir Pendaftaran Online
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Biodata Calon Anggota Baru
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Silakan isi biodata lengkap di bawah ini. Setelah lolos verifikasi anti-robot, permohonan akan diproses oleh Admin Klub.
                  </p>
                </div>

                {captchaError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                    <span>{captchaError}</span>
                  </div>
                )}

                <form onSubmit={handleRegistrationSubmit} className="space-y-5">
                  {/* Bagian 1: Data Pribadi */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" /> 1. Data Diri Calon Atlet
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Nama Lengkap Sesuai KTP/KIA/Akta <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={regForm.name}
                          onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                          placeholder="Contoh: Bagas Aditya Nugraha"
                          className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Nama Panggilan
                        </label>
                        <input
                          type="text"
                          value={regForm.nickname}
                          onChange={(e) => setRegForm({ ...regForm, nickname: e.target.value })}
                          placeholder="Contoh: Bagas"
                          className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Jenis Kelamin <span className="text-rose-400">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setRegForm({ ...regForm, gender: 'L' })}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                              regForm.gender === 'L'
                                ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            Laki-laki (L)
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegForm({ ...regForm, gender: 'P' })}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                              regForm.gender === 'P'
                                ? 'bg-pink-600/30 border-pink-500 text-pink-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            Perempuan (P)
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          NIK (KTP / KIA / KK) <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={16}
                          value={regForm.nik}
                          onChange={(e) => setRegForm({ ...regForm, nik: e.target.value.replace(/[^0-9]/g, '') })}
                          placeholder="16 digit NIK..."
                          className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 outline-none font-mono"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          Disimpan aman & disembunyikan saat scan barcode KTA demi privasi.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Tempat Lahir <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={regForm.birthPlace}
                          onChange={(e) => setRegForm({ ...regForm, birthPlace: e.target.value })}
                          placeholder="Contoh: Kota Batu / Malang"
                          className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Tanggal Lahir <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={regForm.birthDate}
                          onChange={(e) => handleBirthDateChange(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Kategori Usia (Otomatis)
                        </label>
                        <select
                          value={regForm.ageCategory}
                          onChange={(e) => setRegForm({ ...regForm, ageCategory: e.target.value as AgeCategory })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-pink-300 font-bold outline-none"
                        >
                          <option value="U-10">U-10 (Usia ≤ 10 Tahun)</option>
                          <option value="U-12">U-12 (Usia 11-12 Tahun)</option>
                          <option value="U-15">U-15 (Usia 13-15 Tahun)</option>
                          <option value="U-18">U-18 (Usia 16-18 Tahun)</option>
                          <option value="Senior/Umum">Senior / Umum (19+ Tahun)</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Divisi Busur Klub <span className="text-amber-400 font-bold">(HANYA 1 JENIS: HORSEBOW)</span>
                        </label>
                        <div className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-4 py-3 text-xs sm:text-sm text-amber-300 font-bold flex items-center justify-between shadow-inner">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                            <span>HORSEBOW (Traditional & Horseback Archery)</span>
                          </div>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
                            Divisi Tunggal Resmi
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Klub berfokus spesialisasi pada 1 jenis busur Horsebow (Ground Archery, HBA, Fast Shooting & Dynamic).
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Nomor WhatsApp Calon Atlet <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={regForm.phone}
                          onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                          placeholder="0812-xxxx-xxxx"
                          className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bagian 2: Orang Tua / Wali & Alamat */}
                  <div className="space-y-4 pt-3 border-t border-slate-800">
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> 2. Data Orang Tua / Wali & Alamat Domisili
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Nama Orang Tua / Wali
                        </label>
                        <input
                          type="text"
                          value={regForm.parentName}
                          onChange={(e) => setRegForm({ ...regForm, parentName: e.target.value })}
                          placeholder="Nama Ayah/Ibu/Wali"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          No. WhatsApp Orang Tua / Wali
                        </label>
                        <input
                          type="tel"
                          value={regForm.parentPhone}
                          onChange={(e) => setRegForm({ ...regForm, parentPhone: e.target.value })}
                          placeholder="0813-xxxx-xxxx"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Alamat Lengkap Domisili <span className="text-rose-400">*</span>
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={regForm.address}
                          onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                          placeholder="Contoh: Jl. Suropati No. 45, Desa Pesanggrahan, Kec. Batu, Kota Batu..."
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 outline-none resize-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Catatan / Pengalaman Panahan Sebelumnya (Opsional)
                        </label>
                        <input
                          type="text"
                          value={regForm.experienceNotes}
                          onChange={(e) => setRegForm({ ...regForm, experienceNotes: e.target.value })}
                          placeholder="Pernah ikut ekskul sekolah / pemula belum punya alat..."
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bagian 3: 🛡️ VERIFIKASI BUKAN ROBOT (HUMAN CHECK) */}
                  <div className="pt-4 border-t border-purple-500/30">
                    <div className="bg-gradient-to-r from-purple-950/40 via-slate-950 to-pink-950/40 border-2 border-purple-500/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-inner">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-pink-400" />
                          <h4 className="text-xs sm:text-sm font-extrabold text-white">
                            Verifikasi Keamanan (Bukan Robot)
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={refreshCaptcha}
                          className="text-[11px] text-pink-400 hover:text-pink-300 flex items-center gap-1 font-semibold"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Ganti Soal
                        </button>
                      </div>

                      <p className="text-xs text-slate-300">
                        Untuk mencegah bot otomatis, jawab tantangan kalkulasi skor panahan World Archery berikut:
                      </p>

                      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 bg-purple-900/40 border border-purple-500/30 px-3.5 py-2 rounded-xl text-sm font-black text-purple-200">
                          <Target className="w-4 h-4 text-pink-400" />
                          <span>{captchaNum1}</span>
                          <span className="text-slate-400">+</span>
                          <span>{captchaNum2}</span>
                          <span className="text-slate-400">=</span>
                        </div>

                        <div className="flex-1 w-full flex items-center gap-2">
                          <input
                            type="number"
                            required
                            value={captchaAnswerInput}
                            onChange={(e) => {
                              setCaptchaAnswerInput(e.target.value);
                              if (parseInt(e.target.value, 10) === captchaNum1 + captchaNum2) {
                                setIsCaptchaVerified(true);
                                setCaptchaError('');
                              } else {
                                setIsCaptchaVerified(false);
                              }
                            }}
                            placeholder="Ketik total skor..."
                            className="flex-1 bg-slate-900 border border-slate-700 focus:border-pink-500 rounded-xl px-3.5 py-2 text-sm text-white font-bold outline-none"
                          />
                          {isCaptchaVerified && (
                            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 px-2.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                              <CheckCircle2 className="w-4 h-4 shrink-0" /> Manusia Terverifikasi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl text-sm font-black bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 hover:opacity-95 text-white shadow-xl shadow-purple-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Kirim Formulir Pendaftaran Anggota
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB 4: CEK STATUS PENDAFTARAN ======================= */}
        {activeGuestTab === 'check_status' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-5">
              <div className="text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Search className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Cek Status Permohonan
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Masukkan Nomor Registrasi (contoh: <code>REG-202608-0101</code>), Nomor WhatsApp, atau NIK Anda.
                </p>
              </div>

              <form onSubmit={handleSearchStatus} className="max-w-md mx-auto flex gap-2">
                <input
                  type="text"
                  required
                  value={statusSearchQuery}
                  onChange={(e) => setStatusSearchQuery(e.target.value)}
                  placeholder="Ketik No. Registrasi / WhatsApp / NIK..."
                  className="flex-1 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all shrink-0 flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" /> Cari
                </button>
              </form>

              {/* Search Result Display */}
              {searchedRegResult === null && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                  Data pendaftaran dengan kata kunci &quot;<span className="text-white">{statusSearchQuery}</span>&quot; tidak ditemukan. Pastikan nomor registrasi atau WhatsApp yang dimasukkan sudah benar.
                </div>
              )}

              {searchedRegResult && (
                <div className="max-w-lg mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Nomor Registrasi:</span>
                      <span className="text-sm font-mono font-bold text-pink-300">
                        {searchedRegResult.regNumber}
                      </span>
                    </div>
                    <div>
                      {searchedRegResult.status === 'MENUNGGU_VERIFIKASI' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          MENUNGGU VERIFIKASI ADMIN
                        </span>
                      ) : searchedRegResult.status === 'DISETUJUI' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> DISETUJUI & AKTIF
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          PERMOHONAN DITOLAK
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Nama Lengkap:</span>
                      <span className="font-bold text-slate-100 text-sm">{searchedRegResult.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Divisi & Kategori:</span>
                      <span className="font-semibold text-slate-200">
                        {searchedRegResult.division} ({searchedRegResult.ageCategory})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">WhatsApp:</span>
                      <span className="font-semibold text-slate-200">{searchedRegResult.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tanggal Pengajuan:</span>
                      <span className="font-semibold text-slate-200">
                        {new Date(searchedRegResult.submittedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {searchedRegResult.assignedMemberNo && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs">
                      <span className="text-emerald-400 font-bold block">Nomor Anggota (KTA) Resmi:</span>
                      <span className="text-base font-mono font-black text-white">
                        {searchedRegResult.assignedMemberNo}
                      </span>
                      <p className="text-[11px] text-emerald-300/80 mt-1">
                        Selamat! Akun Anda telah aktif. Silakan login menggunakan nomor anggota atau WhatsApp Anda.
                      </p>
                    </div>
                  )}

                  {searchedRegResult.rejectionReason && (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
                      <span className="font-bold block">Catatan Admin:</span>
                      {searchedRegResult.rejectionReason}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950/90 py-6 px-4 text-center">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sistem Terhubung Cloud Database Real-time</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/download-source-zip"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold transition-all shadow-sm"
              title="Unduh Berkas Source Code Lengkap ZIP"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Source Code ZIP</span>
            </a>
            <span className="text-slate-500 text-xs">
              © {new Date().getFullYear()} {clubSettings.clubName}
            </span>
          </div>
        </div>
      </footer>

      {/* Selected News Article Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="relative h-56 sm:h-64 bg-slate-950 shrink-0">
              <img
                src={selectedNews.imageUrl}
                alt={selectedNews.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-600 text-white shadow-md">
                  {selectedNews.category}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-7 space-y-4 flex-1">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>{selectedNews.date}</span>
                  <span>•</span>
                  <span>Oleh {selectedNews.author} ({selectedNews.authorRole})</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
                  {selectedNews.title}
                </h2>
              </div>

              <div className="prose prose-invert text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line border-t border-slate-800 pt-4">
                {selectedNews.content}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedNews(null)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                >
                  Tutup Berita
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
