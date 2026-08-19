import React, { useState, useEffect } from 'react';
import { X, Printer, QrCode, ShieldCheck, Sparkles, MapPin, Phone } from 'lucide-react';
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
}

export const MemberCardModal: React.FC<MemberCardModalProps> = ({
  athlete,
  athletes,
  clubSettings,
  currentUser,
  onClose,
  onOpenVerification,
}) => {
  // If user is athlete, strictly restrict available athletes to their own profile
  const isAthlete = currentUser?.role === 'atlit';
  const myAthlete = isAthlete
    ? athletes.find((a) => a.id === currentUser?.athleteId || a.name.toLowerCase() === currentUser?.name.toLowerCase()) || athlete
    : athlete;

  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(isAthlete ? myAthlete.id : athlete.id);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const displayAthletes = isAthlete ? [myAthlete] : athletes;
  const currentAthlete = displayAthletes.find((a) => a.id === selectedAthleteId) || myAthlete;
  const kta: KTACardSettings = clubSettings.ktaSettings || DEFAULT_KTA_SETTINGS;

  // Generate real QR code containing verification identifier
  useEffect(() => {
    const verificationData = `SENENG-MANAH-VERIFY:${currentAthlete.memberNo}:${currentAthlete.name}`;
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
  }, [currentAthlete]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-pink-500/30 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:border-none print:shadow-none print:bg-white">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950 print:hidden gap-2.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-md shadow-pink-500/20">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span>Kartu Tanda Anggota (KTA) Digital</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black tracking-wider uppercase">
                  Resmi
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Dilengkapi QR Barcode Verifikasi Sistem</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Athlete Selector (Hidden if user is single athlete) */}
            {displayAthletes.length > 1 && (
              <select
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-pink-500"
              >
                {displayAthletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.memberNo} - {a.name}
                  </option>
                ))}
              </select>
            )}

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

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable & Preview Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center print:p-0 print:bg-white space-y-6">
          <div className="w-full max-w-xl space-y-6 print:space-y-4">
            
            {/* FRONT CARD (TAMPAK DEPAN) */}
            <div
              className="relative w-full aspect-[85.6/53.98] max-w-[480px] mx-auto rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 sm:p-5 select-none print:shadow-none print:max-w-none print:w-[85.6mm] print:h-[53.98mm] print:rounded-lg print:p-3"
              style={{
                background: `linear-gradient(135deg, ${kta.bgGradientFrom}, ${kta.bgGradientVia || kta.bgGradientFrom}, ${kta.bgGradientTo})`,
                borderColor: kta.borderColor,
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
                      {kta.cardTitle}
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
                      NAMA ATLET
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
                </div>
              </div>

              {/* Front Footer with Hologram & QR preview */}
              <div className="relative z-10 flex items-center justify-between border-t border-white/20 pt-1.5 text-[8px] text-slate-300 font-medium">
                <div className="flex items-center space-x-1.5 truncate max-w-[280px]">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-500 border border-white/60 flex items-center justify-center text-[7px] text-slate-900 font-black shrink-0">
                    ★
                  </div>
                  <span className="truncate">{kta.footerText}</span>
                </div>
                <div className="font-mono text-[8.5px] font-bold" style={{ color: kta.barcodeBorderColor }}>
                  VALID RESMI
                </div>
              </div>
            </div>

            {/* BACK CARD (TAMPAK BELAKANG) */}
            <div className="relative w-full aspect-[85.6/53.98] max-w-[480px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-700 text-slate-900 bg-white flex flex-col justify-between p-4 sm:p-5 select-none print:shadow-none print:border-slate-800 print:max-w-none print:w-[85.6mm] print:h-[53.98mm] print:rounded-lg print:p-3">
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
                      KETENTUAN KARTU TANDA ANGGOTA
                    </p>
                  </div>
                </div>
                <div className="text-[8px] font-mono font-bold text-slate-500">
                  DIGITAL QR VERIFIED
                </div>
              </div>

              {/* Back Content Grid */}
              <div className="grid grid-cols-12 gap-3 my-auto items-center">
                {/* Rules List */}
                <div className="col-span-8 space-y-1 text-[8px] sm:text-[8.5px] leading-tight text-slate-700">
                  <p className="font-bold text-slate-950 mb-0.5">Tata Tertib & Ketentuan:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                    <li>Kartu ini sah sebagai bukti keanggotaan atlet resmi klub.</li>
                    <li>Wajib dibawa saat sesi latihan & kejuaraan panahan.</li>
                    <li>Tidak dapat dipindahtangankan kepada pihak lain.</li>
                    <li>Scan barcode untuk memeriksa status aktif & profil atlet.</li>
                  </ol>
                  <div className="pt-1 text-[7.5px] text-slate-500">
                    <p className="flex items-center gap-1 font-semibold text-slate-700 truncate">
                      <MapPin className="w-2.5 h-2.5 text-pink-500 shrink-0" />
                      <span className="truncate">{clubSettings.trainingLocation || 'Kota Batu, Jawa Timur'}</span>
                    </p>
                  </div>
                </div>

                {/* QR Code & Barcode Box */}
                <div className="col-span-4 flex flex-col items-center justify-center p-1.5 rounded-xl bg-slate-50 border border-slate-200">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR Code Verifikasi"
                      className="w-16 h-16 sm:w-18 sm:h-18 object-contain rounded-md shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded animate-pulse" />
                  )}
                  <p className="text-[7px] font-mono font-bold text-slate-700 mt-1 uppercase text-center">
                    SCAN VERIFIKASI
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
                  <p className="font-bold text-slate-800 text-[8px]">{clubSettings.phone || '0812-3344-5566'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[7px] text-slate-500">Pelatih Kepala / Pengurus</p>
                  <p className="font-bold text-slate-900 text-[8.5px] mt-1 underline font-mono">
                    {clubSettings.headCoach || clubSettings.coachName || 'Coach Zoulkifli'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between text-xs text-slate-400 print:hidden gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-[11px]">Format kartu standar ID-1 (85.60 × 53.98 mm) resolusi tinggi.</span>
          </div>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </div>
    </div>
  );
};
