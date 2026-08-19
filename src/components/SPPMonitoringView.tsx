import React, { useState } from 'react';
import {
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  PhoneCall,
  Search,
  Plus,
  Filter,
  CreditCard,
  X,
  FileCheck,
  Award,
  Upload,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SPPPayment, Athlete, ClubSettings, SPPStatus, PaymentMethod, UserAccount } from '../types';
import {
  formatRupiah,
  formatDateIndo,
  formatMonthYearIndo,
  generateWhatsAppReminderMessage,
} from '../utils/formatters';

interface SPPMonitoringViewProps {
  sppPayments: SPPPayment[];
  athletes: Athlete[];
  clubSettings: ClubSettings;
  currentUser: UserAccount;
  onUpdatePayment: (payment: SPPPayment) => void;
  onAddPayment: (payment: SPPPayment) => void;
  onOpenReceiptModal: (payment: SPPPayment) => void;
  onOpenPaymentProofModal: () => void;
}

export const SPPMonitoringView: React.FC<SPPMonitoringViewProps> = ({
  sppPayments,
  athletes,
  clubSettings,
  currentUser,
  onUpdatePayment,
  onAddPayment,
  onOpenReceiptModal,
  onOpenPaymentProofModal,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Recording Modal State
  const [recordingPayment, setRecordingPayment] = useState<SPPPayment | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Transfer BCA');
  const [payRefNo, setPayRefNo] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const isAthlete = currentUser.role === 'atlit';
  const canManageSPP =
    currentUser.role === 'super_admin' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'pelatih_utama';

  const isExemptFromSPP = (athlete: Athlete | undefined) => {
    if (!athlete) return false;
    const level = athlete.memberLevel;
    const role = athlete.userRole;
    return (
      level === 'Pelatih' ||
      level === 'Pelatih Utama' ||
      level === 'Pengurus' ||
      role === 'pelatih' ||
      role === 'pelatih_utama' ||
      role === 'pelatih_atlit' ||
      role === 'admin' ||
      role === 'pengurus'
    );
  };

  // Available months list
  const availableMonths: string[] = Array.from(new Set<string>(sppPayments.map((p) => p.monthYear))).sort().reverse();
  if (!availableMonths.includes('2026-08')) availableMonths.unshift('2026-08');

  // Filtered payments for chosen month
  const rawMonthPayments = sppPayments.filter((p) => p.monthYear === selectedMonth);

  // If athlete, only show own records
  const monthPayments = isAthlete
    ? rawMonthPayments.filter((p) => {
        return (
          (currentUser.athleteId && p.athleteId === currentUser.athleteId) ||
          (currentUser.name && p.athleteName.toLowerCase().includes(currentUser.name.toLowerCase()))
        );
      })
    : rawMonthPayments;

  const filteredPayments = monthPayments.filter((p) => {
    const athlete = athletes.find((a) => a.id === p.athleteId);
    const matchesSearch = p.athleteName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'EXEMPT') return matchesSearch && isExemptFromSPP(athlete);
    return matchesSearch && p.status === statusFilter && !isExemptFromSPP(athlete);
  });

  // Financial statistics with exemption calculation
  const totalBilled = monthPayments.reduce((sum, p) => {
    const athlete = athletes.find((a) => a.id === p.athleteId);
    return isExemptFromSPP(athlete) ? sum : sum + p.amount;
  }, 0);

  const totalCollected = monthPayments
    .filter((p) => {
      const athlete = athletes.find((a) => a.id === p.athleteId);
      return !isExemptFromSPP(athlete) && (p.status === 'LUNAS' || p.status === 'BEASISWA');
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOutstanding = monthPayments
    .filter((p) => {
      const athlete = athletes.find((a) => a.id === p.athleteId);
      return !isExemptFromSPP(athlete) && (p.status === 'BELUM_BAYAR' || p.status === 'TERLAMBAT');
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const lunasCount = monthPayments.filter((p) => {
    const athlete = athletes.find((a) => a.id === p.athleteId);
    return !isExemptFromSPP(athlete) && p.status === 'LUNAS';
  }).length;

  const unpaidCount = monthPayments.filter((p) => {
    const athlete = athletes.find((a) => a.id === p.athleteId);
    return !isExemptFromSPP(athlete) && (p.status === 'BELUM_BAYAR' || p.status === 'TERLAMBAT');
  }).length;

  const exemptCount = monthPayments.filter((p) => {
    const athlete = athletes.find((a) => a.id === p.athleteId);
    return isExemptFromSPP(athlete);
  }).length;

  const pendingCount = monthPayments.filter((p) => p.status === 'MENUNGGU_VERIFIKASI').length;

  const handleOpenRecordPayment = (payment: SPPPayment) => {
    setRecordingPayment(payment);
    setPayMethod('Transfer BCA');
    setPayRefNo('');
    setPayNotes('');
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordingPayment) return;

    const receiptNum = `KWT/${selectedMonth.replace('-', '/')}/${String(Math.floor(100 + Math.random() * 900))}`;

    const updated: SPPPayment = {
      ...recordingPayment,
      status: 'LUNAS',
      paidDate: new Date().toISOString().slice(0, 10),
      paymentMethod: payMethod,
      receiptNumber: receiptNum,
      referenceNo: payRefNo || undefined,
      proofNote: payNotes || undefined,
      recordedBy: currentUser.name || 'Admin SPP',
    };

    onUpdatePayment(updated);
    setRecordingPayment(null);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const handleSendWhatsAppReminder = (payment: SPPPayment) => {
    const athlete = athletes.find((a) => a.id === payment.athleteId);
    const phone = athlete?.parentPhone || athlete?.phone;
    const msg = generateWhatsAppReminderMessage(
      payment.athleteName,
      athlete?.parentName,
      payment.monthYear,
      payment.amount,
      clubSettings.clubName,
      clubSettings.bankName,
      clubSettings.bankAccountNumber,
      clubSettings.bankAccountHolder
    );
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleGenerateNextMonthBillings = () => {
    const nextMonth = '2026-09';
    const existing = sppPayments.filter((p) => p.monthYear === nextMonth);
    if (existing.length > 0) {
      alert(`Tagihan untuk bulan ${formatMonthYearIndo(nextMonth)} sudah dibuat!`);
      setSelectedMonth(nextMonth);
      return;
    }

    athletes.forEach((athlete) => {
      const isExempt = isExemptFromSPP(athlete);
      const isScholarship = athlete.monthlySppCustomFee === 0 || isExempt;
      const amount = isScholarship ? 0 : (athlete.monthlySppCustomFee ?? clubSettings.defaultMonthlySpp);
      const newPay: SPPPayment = {
        id: `spp-${nextMonth}-${athlete.id}`,
        athleteId: athlete.id,
        athleteName: athlete.name,
        monthYear: nextMonth,
        amount,
        dueDate: `${nextMonth}-10`,
        status: isScholarship ? 'BEASISWA' : 'BELUM_BAYAR',
        receiptNumber: isScholarship ? `KWT/${nextMonth.replace('-', '/')}/BEA` : undefined,
        createdAt: new Date().toISOString(),
      };
      onAddPayment(newPay);
    });

    setSelectedMonth(nextMonth);
    alert(`Berhasil membuat tagihan SPP periode ${formatMonthYearIndo(nextMonth)} (Pelatih, Admin, Pengurus otomatis Bebas SPP)!`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header & Month Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-pink-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
            <span>Monitoring SPP & Verifikasi Transfer Online</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi iuran SPP {clubSettings.clubName} • Pelatih, Admin, & Pengurus Bebas SPP
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenPaymentProofModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-pink-500/20 transition"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{isAthlete ? 'Kirim Bukti Pembayaran' : 'Verifikasi Bukti SPP'}</span>
          </button>

          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500">Periode:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m} className="bg-white text-slate-900">
                  {formatMonthYearIndo(m)}
                </option>
              ))}
            </select>
          </div>

          {canManageSPP && (
            <button
              onClick={handleGenerateNextMonthBillings}
              className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold uppercase tracking-wider transition"
              title="Buat Tagihan SPP Bulan Depan"
            >
              <Plus className="w-3.5 h-3.5 text-pink-600" />
              <span className="hidden lg:inline">Bulan Depan</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Tagihan Periode</p>
          <div className="my-2 text-3xl font-black text-slate-900 font-mono tracking-tight">{formatRupiah(totalBilled)}</div>
          <p className="text-xs text-slate-500 font-medium">
            {monthPayments.length} Anggota ({exemptCount} Bebas SPP Pelatih/Pengurus)
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sudah Terkumpul</p>
          <div className="my-2 text-3xl font-black text-emerald-600 font-mono tracking-tight">{formatRupiah(totalCollected)}</div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-emerald-600 font-bold">{lunasCount} Lunas</span>
            {exemptCount > 0 && <span className="text-purple-600 font-medium">({exemptCount} Bebas SPP)</span>}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belum Lunas / Tunggakan</p>
          <div className="my-2 text-3xl font-black text-rose-600 font-mono tracking-tight">{formatRupiah(totalOutstanding)}</div>
          <p className="text-xs text-rose-600 font-bold">{unpaidCount} Atlet Belum Bayar</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Menunggu Verifikasi</p>
          <div className="my-2 text-3xl font-black text-purple-600 font-mono tracking-tight">
            {pendingCount} <span className="text-base font-normal text-slate-400">bukti</span>
          </div>
          <button
            onClick={onOpenPaymentProofModal}
            className="text-xs text-pink-600 font-bold hover:underline self-start"
          >
            Buka Panel Verifikasi &rarr;
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama atlet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-pink-500 font-medium"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'LUNAS', label: 'Lunas' },
            { id: 'MENUNGGU_VERIFIKASI', label: 'Menunggu Verifikasi' },
            { id: 'BELUM_BAYAR', label: 'Belum Bayar' },
            { id: 'EXEMPT', label: 'Bebas SPP (Pelatih/Pengurus)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SPP Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-400 border-b border-slate-100 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Nama Anggota</th>
                <th className="px-6 py-3.5">Level & Peran</th>
                <th className="px-6 py-3.5">Nominal SPP</th>
                <th className="px-6 py-3.5">Status Iuran</th>
                <th className="px-6 py-3.5">Tanggal / Metode</th>
                <th className="px-6 py-3.5">No. Kuitansi</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 italic">
                    Tidak ada data pembayaran SPP untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const athlete = athletes.find((a) => a.id === payment.athleteId);
                  const isExempt = isExemptFromSPP(athlete);
                  const isLunas = payment.status === 'LUNAS';
                  const isPending = payment.status === 'MENUNGGU_VERIFIKASI';
                  const isUnpaid = !isExempt && (payment.status === 'BELUM_BAYAR' || payment.status === 'TERLAMBAT');

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50 transition">
                      {/* Name */}
                      <td className="px-6 py-3.5 font-bold text-slate-900">
                        {payment.athleteName}
                        {athlete?.parentName && (
                          <span className="block text-[11px] font-normal text-slate-400">
                            Ortu: {athlete.parentName}
                          </span>
                        )}
                      </td>

                      {/* Level / Role */}
                      <td className="px-6 py-3.5 text-slate-600">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {athlete?.memberLevel || 'Atlet Reguler'}
                        </span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">{athlete?.division || '-'}</span>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                        {isExempt ? (
                          <span className="text-slate-400 line-through text-xs font-normal">Rp 0 (Bebas)</span>
                        ) : (
                          formatRupiah(payment.amount)
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3.5">
                        {isExempt ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                            <Award className="w-3 h-3 text-purple-600" />
                            <span>Bebas SPP (Pelatih/Pengurus)</span>
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isLunas
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isPending
                                ? 'bg-pink-50 text-pink-700 border border-pink-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {isLunas && <CheckCircle2 className="w-3 h-3" />}
                            {isUnpaid && <AlertCircle className="w-3 h-3" />}
                            {isPending && <Clock className="w-3 h-3" />}
                            <span>{payment.status.replace('_', ' ')}</span>
                          </span>
                        )}
                      </td>

                      {/* Payment Info */}
                      <td className="px-6 py-3.5 text-slate-600 text-xs">
                        {isExempt ? (
                          <span className="text-slate-400 italic">Otomatis Terverifikasi Sistem</span>
                        ) : payment.paidDate ? (
                          <div>
                            <span className="text-slate-900 font-medium">{formatDateIndo(payment.paidDate)}</span>
                            <span className="block text-[11px] text-slate-400">{payment.paymentMethod || 'Transfer'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Jatuh tempo: 10 {formatMonthYearIndo(payment.monthYear)}</span>
                        )}
                      </td>

                      {/* Receipt No */}
                      <td className="px-6 py-3.5 font-mono text-xs text-slate-500">
                        {payment.receiptNumber || '-'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {isUnpaid && canManageSPP && (
                          <>
                            <button
                              onClick={() => handleSendWhatsAppReminder(payment)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-bold uppercase tracking-wider transition"
                              title="Kirim Pesan Pengingat WhatsApp"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span className="hidden md:inline">Tagih WA</span>
                            </button>

                            <button
                              onClick={() => handleOpenRecordPayment(payment)}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider transition shadow-xs"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Catat Bayar</span>
                            </button>
                          </>
                        )}

                        {isPending && (
                          <button
                            onClick={onOpenPaymentProofModal}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold uppercase tracking-wider transition shadow-xs"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verifikasi</span>
                          </button>
                        )}

                        {isLunas && (
                          <button
                            onClick={() => onOpenReceiptModal(payment)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-500" />
                            <span>Kuitansi</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Payment Recording Modal */}
      {recordingPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Catat Penerimaan SPP</h3>
                <p className="text-xs text-slate-500">{recordingPayment.athleteName} • {formatMonthYearIndo(recordingPayment.monthYear)}</p>
              </div>
              <button onClick={() => setRecordingPayment(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal Iuran SPP</label>
                <div className="font-mono font-black text-lg text-pink-600 bg-pink-50 p-2.5 rounded-xl border border-pink-200">
                  {formatRupiah(recordingPayment.amount)}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Metode Pembayaran *</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-pink-500"
                >
                  <option value="Transfer BCA">Transfer BCA</option>
                  <option value="Transfer Mandiri">Transfer Mandiri</option>
                  <option value="Transfer BSI">Transfer BSI</option>
                  <option value="Tunai / Kasir">Tunai Langsung di Lapangan</option>
                  <option value="QRIS">QRIS / E-Wallet</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Referensi / No. Bukti Transfer (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: TRF-BCA-987654"
                  value={payRefNo}
                  onChange={(e) => setPayRefNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-800 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Dibayarkan langsung oleh orang tua"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRecordingPayment(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-extrabold shadow-md shadow-pink-500/20"
                >
                  Simpan & Terbitkan Kuitansi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
