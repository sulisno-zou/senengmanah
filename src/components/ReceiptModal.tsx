import React, { useRef } from 'react';
import { X, Printer, CheckCircle, Share2, Copy } from 'lucide-react';
import { SPPPayment, ClubSettings } from '../types';
import { formatRupiah, formatDateIndo, formatMonthYearIndo, numberToWordsIndo, generateWhatsAppPaidReceiptMessage } from '../utils/formatters';

interface ReceiptModalProps {
  payment: SPPPayment | null;
  clubSettings: ClubSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ payment, clubSettings, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppPaidReceiptMessage(
      payment.athleteName,
      payment.monthYear,
      payment.amount,
      payment.receiptNumber || 'KWT-LUNAS',
      payment.paymentMethod || 'Transfer',
      payment.paidDate || new Date().toISOString(),
      clubSettings.clubName
    );
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-xl shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Kuitansi Pembayaran SPP</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Body (Formatted for screen and printing) */}
        <div className="p-6 bg-slate-50 text-slate-900" ref={receiptRef}>
          <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200 font-sans printable-receipt">
            {/* Header / Kop Kuitansi */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900">
                  {clubSettings.clubName}
                </h2>
                <p className="text-xs text-slate-600 font-medium">{clubSettings.tagline}</p>
                <p className="text-[11px] text-slate-500 mt-1">{clubSettings.trainingLocation}</p>
                <p className="text-[11px] text-slate-500">Kontak: {clubSettings.coachContact}</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 bg-green-100 text-green-800 font-bold text-[10px] uppercase tracking-wider rounded border border-green-200">
                  {payment.status === 'BEASISWA' ? 'BEASISWA' : 'LUNAS'}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  No: <strong className="text-slate-900 font-mono">{payment.receiptNumber || 'KWT-PENDING'}</strong>
                </p>
                <p className="text-[11px] text-slate-500">
                  Tgl: {formatDateIndo(payment.paidDate || new Date().toISOString())}
                </p>
              </div>
            </div>

            {/* Receipt Content */}
            <div className="space-y-3 text-sm">
              <div className="flex py-1 border-b border-dashed border-slate-200">
                <span className="w-36 text-slate-500 font-medium">Telah Diterima Dari</span>
                <span className="text-slate-900 font-bold">: {payment.athleteName}</span>
              </div>
              <div className="flex py-1 border-b border-dashed border-slate-200">
                <span className="w-36 text-slate-500 font-medium">Untuk Pembayaran</span>
                <span className="text-slate-900 font-semibold">
                  : Iuran SPP Latihan Panahan Periode {formatMonthYearIndo(payment.monthYear)}
                </span>
              </div>
              <div className="flex py-1 border-b border-dashed border-slate-200">
                <span className="w-36 text-slate-500 font-medium">Metode Pembayaran</span>
                <span className="text-slate-900">: {payment.paymentMethod || 'Transfer Bank / Tunai'}</span>
              </div>
              {payment.referenceNo && (
                <div className="flex py-1 border-b border-dashed border-slate-200">
                  <span className="w-36 text-slate-500 font-medium">No. Referensi / Ref</span>
                  <span className="text-slate-700 font-mono">: {payment.referenceNo}</span>
                </div>
              )}
              {payment.proofNote && (
                <div className="flex py-1 border-b border-dashed border-slate-200">
                  <span className="w-36 text-slate-500 font-medium">Keterangan</span>
                  <span className="text-slate-700">: {payment.proofNote}</span>
                </div>
              )}
              <div className="flex py-1 border-b border-dashed border-slate-200">
                <span className="w-36 text-slate-500 font-medium">Terbilang</span>
                <span className="text-slate-800 italic">: {numberToWordsIndo(payment.amount)}</span>
              </div>
            </div>

            {/* Total Box & Signatures */}
            <div className="mt-6 pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 w-full sm:w-auto">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">JUMLAH DITERIMA</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                  {formatRupiah(payment.amount)}
                </p>
              </div>

              <div className="text-center sm:text-right w-full sm:w-auto">
                <p className="text-xs text-slate-500">Bendahara / Administrasi Klub</p>
                <div className="h-10 flex items-center justify-center sm:justify-end">
                  <span className="text-xs font-serif italic text-slate-400">[Tanda Tangan Digital]</span>
                </div>
                <p className="text-xs font-bold text-slate-900">{payment.recordedBy || clubSettings.coachName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleCopyWhatsApp}
            className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Kirim WA Kuitansi'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kuitansi</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
