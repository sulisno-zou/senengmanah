import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  Share2,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  HardDrive,
  Wifi,
  QrCode as QrCodeIcon,
  Copy,
  Check
} from 'lucide-react';
import QRCode from 'qrcode';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallClick: () => void;
  appUrl?: string;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallClick,
  appUrl = window.location.href,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'features' | 'qr'>('android');

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(appUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#ec4899',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error(err));
    }
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-pink-500/30 rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl shadow-pink-500/20 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-900/50 via-slate-900 to-purple-900/50 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shadow-lg shadow-pink-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-pink-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Pasang di HP Android
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                  Resmi PWA
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                SENENG MANAH SHOOTING CLASS BATU
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('android')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'android'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Cara Pasang (1-Klik)
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'features'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            Keunggulan Aplikasi
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCodeIcon className="w-4 h-4" />
            Bagikan / Scan QR
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-300 text-xs sm:text-sm">
          
          {activeTab === 'android' && (
            <div className="space-y-4">
              {/* Direct Install Button (if browser supports prompt) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-slate-900 border border-pink-500/30 text-center space-y-3">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-pink-500/20 text-pink-400">
                  <Download className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Klik Tombol Pasang Sekarang
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Aplikasi akan langsung terpasang di layar utama HP Android Anda tanpa perlu mendownload file APK dari luar.
                  </p>
                </div>
                
                <button
                  onClick={onInstallClick}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-sm tracking-wide shadow-lg shadow-pink-500/25 transition transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>{deferredPrompt ? 'PASANG SEKARANG KE ANDROID (1-KLIK)' : 'PASANG KE LAYAR UTAMA (HOME SCREEN)'}</span>
                </button>
              </div>

              {/* Step by step manual guide */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Langkah Manual di Browser Chrome Android:
                </h4>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="text-white font-bold">Buka di Browser Google Chrome</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Buka link web aplikasi ini di HP Android Anda menggunakan Google Chrome.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="text-white font-bold">Klik Ikon Titik Tiga (⋮) di Kanan Atas</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Tekan menu Chrome di sudut kanan atas layar HP Anda.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <p className="text-white font-bold">Pilih "Instal Aplikasi" / "Tambahkan ke Layar Utama"</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Pilih menu <strong>"Instal aplikasi"</strong> (atau <em>Add to Home Screen</em>).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </span>
                    <div>
                      <p className="text-white font-bold">Selesai! Icon Seneng Manah Siap Digunakan</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Aplikasi akan tampil di layar depan HP Anda seperti aplikasi bawaan Google Play Store!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-xs">Full Screen & Cepat</h4>
                  <p className="text-[11px] text-slate-400">
                    Tampilan bersih tanpa bilah URL browser, memberikan pengalaman aplikasi native yang imersif.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-xs">Sangat Ringan (&lt; 2 MB)</h4>
                  <p className="text-[11px] text-slate-400">
                    Tidak membebani memori internal HP atlet & pelatih, hemat RAM dan kuota internet.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-xs">Real-Time Firebase Cloud</h4>
                  <p className="text-[11px] text-slate-400">
                    Skor latihan, absensi lapangan, bukti SPP, dan KTA barcode tersinkronisasi otomatis seketika.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-xs">Aman & Terverifikasi</h4>
                  <p className="text-[11px] text-slate-400">
                    Bebas virus/malware pihak ketiga, menggunakan enkripsi SSL HTTPS resmi.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-pink-400 shrink-0" />
                <p className="text-[11px] text-slate-300">
                  Dapat digunakan oleh semua peran: <strong>Super Admin, Admin Kegiatan, Pelatih Utama, Pelatih, Atlet, dan Tamu/Pendaftar</strong>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-400">
                Scan QR Code ini menggunakan kamera HP Android atlet/pelatih untuk langsung membuka dan memasang aplikasi:
              </p>

              {qrCodeUrl ? (
                <div className="inline-block p-3.5 bg-white rounded-2xl shadow-xl shadow-pink-500/20 border-4 border-pink-500/30">
                  <img
                    src={qrCodeUrl}
                    alt="Scan QR Seneng Manah"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center animate-pulse text-slate-500">
                  Membuat QR...
                </div>
              )}

              {/* Copy link bar */}
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2 max-w-md mx-auto">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="bg-transparent text-xs text-slate-300 px-2 py-1 outline-none w-full truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Tersalin' : 'Salin'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500">
            Kompatibel dengan semua Android (Chrome, Samsung Internet, Opera, Firefox)
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
