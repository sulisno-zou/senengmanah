import React, { useState } from 'react';
import { X, Upload, CheckCircle2, XCircle, FileText, Image as ImageIcon, ShieldCheck, AlertCircle, Sparkles, DollarSign, Calendar, Eye } from 'lucide-react';
import { Athlete, SPPPayment, PaymentProof, PaymentMethod, ClubSettings, UserAccount } from '../types';
import { formatRupiah, formatMonthYearIndo, formatDateIndo } from '../utils/formatters';

interface PaymentProofModalProps {
  currentUser: UserAccount;
  athletes: Athlete[];
  sppPayments: SPPPayment[];
  paymentProofs: PaymentProof[];
  clubSettings: ClubSettings;
  isOpen: boolean;
  onClose: () => void;
  onSubmitProof: (proof: PaymentProof) => void;
  onApproveProof: (proofId: string, reviewedBy: string) => void;
  onRejectProof: (proofId: string, reason: string, reviewedBy: string) => void;
}

export const PaymentProofModal: React.FC<PaymentProofModalProps> = ({
  currentUser,
  athletes,
  sppPayments,
  paymentProofs,
  clubSettings,
  isOpen,
  onClose,
  onSubmitProof,
  onApproveProof,
  onRejectProof,
}) => {
  if (!isOpen) return null;

  const isAdminOrSuper = currentUser.role === 'admin' || currentUser.role === 'super_admin' || currentUser.role === 'pelatih_utama';
  const isAthlete = currentUser.role === 'atlit' || currentUser.role === 'pelatih_atlit';

  // For Athlete submit form
  const matchedAthlete = isAthlete && currentUser.athleteId
    ? athletes.find((a) => a.id === currentUser.athleteId) || athletes[0]
    : athletes[0];

  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(
    currentUser.athleteId || athletes[0]?.id || ''
  );
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [amount, setAmount] = useState<number>(clubSettings.defaultMonthlySpp);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transfer BCA');
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [senderAccountName, setSenderAccountName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [proofImage, setProofImage] = useState<string>(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
  );
  const [activeTab, setActiveTab] = useState<'submit' | 'verify'>(
    isAdminOrSuper ? 'verify' : 'submit'
  );

  // Selected proof for admin detail view
  const [inspectProof, setInspectProof] = useState<PaymentProof | null>(
    paymentProofs.find((p) => p.status === 'PENDING') || paymentProofs[0] || null
  );
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const currentSelectedAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];

  // Handle image upload from file input
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProofImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProof: PaymentProof = {
      id: `proof-${Date.now()}`,
      athleteId: currentSelectedAthlete.id,
      athleteName: currentSelectedAthlete.name,
      monthYear: selectedMonth,
      amount: Number(amount),
      paymentMethod,
      transferDate,
      proofImageUrl: proofImage,
      senderAccountName: senderAccountName || currentSelectedAthlete.name,
      notes,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };

    onSubmitProof(newProof);
    alert('Bukti pembayaran SPP berhasil diunggah! Menunggu verifikasi dari Admin Keuangan.');
    onClose();
  };

  const pendingProofs = paymentProofs.filter((p) => p.status === 'PENDING');
  const historyProofs = paymentProofs.filter((p) => p.status !== 'PENDING');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-pink-500/30 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-pink-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Portal Bukti Pembayaran SPP</span>
                {isAdminOrSuper && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                    {pendingProofs.length} Menunggu Verifikasi
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">SENENG MANAH SHOOTING CLASS BATU</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isAdminOrSuper && (
              <div className="bg-slate-800 p-1 rounded-lg flex space-x-1 border border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('verify')}
                  className={`px-3 py-1 rounded transition ${
                    activeTab === 'verify'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Verifikasi ({pendingProofs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('submit')}
                  className={`px-3 py-1 rounded transition ${
                    activeTab === 'submit'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Unggah Bukti Baru
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Submit Form (Atlit / Wali / Admin) */}
        {activeTab === 'submit' && (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* Rekening Tujuan Info Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-pink-300">
                  Rekening Resmi Pembayaran SPP Klub
                </p>
                <h4 className="text-sm font-black text-white font-mono mt-0.5">
                  {clubSettings.bankName}: <span className="text-pink-400">{clubSettings.bankAccountNumber}</span>
                </h4>
                <p className="text-xs text-slate-300">a.n {clubSettings.bankAccountHolder}</p>
              </div>
              <div className="text-right sm:border-l sm:border-purple-700/50 sm:pl-4">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Nominal Standar</span>
                <p className="text-base font-black text-white font-mono">
                  {formatRupiah(clubSettings.defaultMonthlySpp)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Atlet Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nama Atlet Panahan *
                </label>
                <select
                  disabled={isAthlete && !!currentUser.athleteId}
                  value={selectedAthleteId}
                  onChange={(e) => setSelectedAthleteId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-medium"
                >
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.memberNo} - {a.name} ({a.division})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bulan Iuran */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Untuk Pembayaran Bulan *
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-medium"
                >
                  <option value="2026-08">Agustus 2026 (Bulan Berjalan)</option>
                  <option value="2026-07">Juli 2026</option>
                  <option value="2026-09">September 2026</option>
                  <option value="2026-10">Oktober 2026</option>
                </select>
              </div>

              {/* Nominal Transfer */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Jumlah yang Ditransfer (Rp) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="10000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono font-bold"
                />
              </div>

              {/* Metode Transfer */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Metode Pembayaran *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-medium"
                >
                  <option value="Transfer BCA">Transfer BCA</option>
                  <option value="Transfer Mandiri">Transfer Mandiri (Livin)</option>
                  <option value="Transfer BRI">Transfer BRI (BRIMo)</option>
                  <option value="QRIS">Scan QRIS Seneng Manah</option>
                  <option value="Tunai">Titip Tunai di Lapangan</option>
                  <option value="Lainnya">Bank Lainnya</option>
                </select>
              </div>

              {/* Tanggal Transfer */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tanggal Transfer *
                </label>
                <input
                  type="date"
                  required
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-medium"
                />
              </div>

              {/* Atas Nama Rekening Pengirim */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nama Pemilik Rekening Pengirim
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bambang Sudarmono"
                  value={senderAccountName}
                  onChange={(e) => setSenderAccountName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-medium"
                />
              </div>
            </div>

            {/* Foto Bukti Transfer Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Unggah Foto Struk / Screenshot Bukti Transfer *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Upload Box */}
                <div className="sm:col-span-8 p-4 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50 hover:border-pink-500 transition text-center space-y-2">
                  <div className="flex justify-center">
                    <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="proof-file-input"
                      className="cursor-pointer text-xs font-bold text-pink-400 hover:text-pink-300 underline"
                    >
                      Klik untuk pilih gambar dari galeri / kamera
                    </label>
                    <input
                      id="proof-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Format: JPG, PNG, WEBP (Maksimal 5MB)</p>
                  </div>
                </div>

                {/* Preview Box */}
                <div className="sm:col-span-4 flex flex-col items-center">
                  <div className="w-28 h-28 rounded-xl border border-slate-700 overflow-hidden bg-slate-950 flex items-center justify-center shadow-md">
                    {proofImage ? (
                      <img src={proofImage} alt="Preview Bukti" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-600" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">Preview Struk</span>
                </div>
              </div>
            </div>

            {/* Catatan Tambahan */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Pembayaran SPP Farhan + Uji tanding scoring..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-lg transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md shadow-pink-500/20 transition"
              >
                Kirim Bukti Pembayaran
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Verification Panel (Admin & Super Admin) */}
        {activeTab === 'verify' && (
          <div className="p-6 overflow-y-auto flex-1 grid grid-cols-12 gap-6">
            {/* Left: Pending List */}
            <div className="col-span-12 md:col-span-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center justify-between">
                <span>Daftar Menunggu Verifikasi ({pendingProofs.length})</span>
              </h4>

              {pendingProofs.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/40 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-200">Semua Pembayaran Telah Diverifikasi</p>
                  <p className="text-xs text-slate-400 mt-1">Tidak ada bukti transfer yang tertunda saat ini.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {pendingProofs.map((proof) => {
                    const isSelected = inspectProof?.id === proof.id;
                    return (
                      <div
                        key={proof.id}
                        onClick={() => setInspectProof(proof)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'bg-purple-950/40 border-pink-500 shadow-md shadow-pink-500/10'
                            : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="text-sm font-bold text-white">{proof.athleteName}</h5>
                            <p className="text-xs text-pink-300 font-mono font-bold">
                              {formatRupiah(proof.amount)} • {formatMonthYearIndo(proof.monthYear)}
                            </p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            Menunggu
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                          <span>{proof.paymentMethod}</span>
                          <span>{formatDateIndo(proof.transferDate)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* History / Approved */}
              {historyProofs.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Riwayat Pembayaran Sebelumnya ({historyProofs.length})
                  </h5>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                    {historyProofs.map((h) => (
                      <div
                        key={h.id}
                        onClick={() => setInspectProof(h)}
                        className="p-2 bg-slate-800/30 rounded-lg text-xs flex items-center justify-between cursor-pointer hover:bg-slate-800"
                      >
                        <span className="text-slate-300 font-medium">{h.athleteName} ({h.monthYear})</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            h.status === 'APPROVED' ? 'bg-green-500/20 text-green-300' : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {h.status === 'APPROVED' ? 'LUNAS' : 'DITOLAK'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Inspection & Actions */}
            <div className="col-span-12 md:col-span-6 bg-slate-800/80 p-5 rounded-2xl border border-slate-700 flex flex-col justify-between">
              {inspectProof ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-white leading-tight">{inspectProof.athleteName}</h4>
                      <p className="text-xs text-slate-400">
                        Iuran Bulan {formatMonthYearIndo(inspectProof.monthYear)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-pink-400 font-mono">
                        {formatRupiah(inspectProof.amount)}
                      </p>
                      <p className="text-[10px] text-slate-400">{inspectProof.paymentMethod}</p>
                    </div>
                  </div>

                  {/* Struk Image Display */}
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-pink-400" />
                      <span>Foto Bukti Transfer:</span>
                    </p>
                    <div className="w-full h-48 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center">
                      <img
                        src={inspectProof.proofImageUrl}
                        alt="Bukti Transfer"
                        className="w-full h-full object-contain hover:scale-105 transition duration-300"
                      />
                    </div>
                  </div>

                  {/* Meta details */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Pengirim Rekening:</span>
                      <span className="font-bold text-slate-200">{inspectProof.senderAccountName || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tanggal Transfer:</span>
                      <span className="font-bold text-slate-200">{formatDateIndo(inspectProof.transferDate)}</span>
                    </div>
                    {inspectProof.notes && (
                      <div className="col-span-2 pt-1 border-t border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Catatan Atlet:</span>
                        <span className="text-slate-300 italic">"{inspectProof.notes}"</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons for Pending */}
                  {inspectProof.status === 'PENDING' && (
                    <div className="space-y-2 pt-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const reason = prompt('Masukkan alasan penolakan bukti pembayaran:', 'Bukti transfer tidak terbaca / nominal belum sesuai.');
                            if (reason) {
                              onRejectProof(inspectProof.id, reason, currentUser.name);
                            }
                          }}
                          className="flex-1 py-2.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl uppercase tracking-wider transition"
                        >
                          Tolak
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onApproveProof(inspectProof.id, currentUser.name);
                            alert(`Pembayaran SPP ${inspectProof.athleteName} telah Diverifikasi LUNAS & Kuitansi Digital diterbitkan!`);
                          }}
                          className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verifikasi & Terbitkan Kuitansi</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {inspectProof.status === 'APPROVED' && (
                    <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center text-emerald-300 text-xs font-bold">
                      ✓ Telah Diverifikasi Lunas oleh {inspectProof.reviewedBy || 'Admin'} pada {inspectProof.reviewedAt?.slice(0, 10) || 'Agustus 2026'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Pilih salah satu bukti pembayaran untuk melihat detail dan melakukan verifikasi.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
