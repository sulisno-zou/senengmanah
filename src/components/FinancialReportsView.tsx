import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Printer,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Wallet,
  Receipt,
  FileText,
  UserCheck,
  Building2,
  CreditCard,
  QrCode,
  Banknote,
  Search,
  Layers,
  Sparkles,
  X,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  SPPPayment,
  RegistrationRequest,
  ClubSettings,
  UserAccount,
  PaymentMethod,
  CashflowTransaction,
} from '../types';
import { formatRupiah, formatDateIndo, formatMonthYearIndo } from '../utils/formatters';

interface FinancialReportsViewProps {
  sppPayments: SPPPayment[];
  registrations: RegistrationRequest[];
  cashflowTransactions: CashflowTransaction[];
  clubSettings: ClubSettings;
  currentUser: UserAccount;
  onAddTransaction: (trx: CashflowTransaction) => void;
  onDeleteTransaction: (id: string) => void;
}

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({
  sppPayments,
  registrations,
  cashflowTransactions,
  clubSettings,
  currentUser,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const isAdmin = currentUser.role === 'admin';
  const canManage = isSuperAdmin || isAdmin || currentUser.role === 'pelatih_utama';

  // Period Selection States
  const [periodType, setPeriodType] = useState<PeriodType>('monthly');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // August
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [customStartDate, setCustomStartDate] = useState<string>('2026-08-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-08-31');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Transaction Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTrxType, setNewTrxType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [newTrxCategory, setNewTrxCategory] = useState<any>('PERALATAN_BANTALAN_TARGET');
  const [newTrxAmount, setNewTrxAmount] = useState<number>(150000);
  const [newTrxDate, setNewTrxDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [newTrxTitle, setNewTrxTitle] = useState<string>('');
  const [newTrxDescription, setNewTrxDescription] = useState<string>('');
  const [newTrxPaymentMethod, setNewTrxPaymentMethod] = useState<PaymentMethod>('Transfer Bank');

  // Compute Active Date Range
  const { startDateStr, endDateStr, periodTitle } = useMemo(() => {
    if (periodType === 'daily') {
      return {
        startDateStr: selectedDate,
        endDateStr: selectedDate,
        periodTitle: `Harian: ${formatDateIndo(selectedDate)}`,
      };
    }
    if (periodType === 'weekly') {
      const cur = new Date(selectedDate);
      const start = new Date(cur);
      start.setDate(cur.getDate() - 6);
      const sStr = start.toISOString().slice(0, 10);
      const eStr = cur.toISOString().slice(0, 10);
      return {
        startDateStr: sStr,
        endDateStr: eStr,
        periodTitle: `Mingguan: ${formatDateIndo(sStr)} s.d. ${formatDateIndo(eStr)}`,
      };
    }
    if (periodType === 'monthly') {
      const mm = String(selectedMonth).padStart(2, '0');
      const sStr = `${selectedYear}-${mm}-01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const eStr = `${selectedYear}-${mm}-${String(lastDay).padStart(2, '0')}`;
      const mNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return {
        startDateStr: sStr,
        endDateStr: eStr,
        periodTitle: `Bulanan: ${mNames[selectedMonth - 1]} ${selectedYear}`,
      };
    }
    if (periodType === 'yearly') {
      return {
        startDateStr: `${selectedYear}-01-01`,
        endDateStr: `${selectedYear}-12-31`,
        periodTitle: `Tahunan: Tahun Kalender ${selectedYear}`,
      };
    }
    return {
      startDateStr: customStartDate,
      endDateStr: customEndDate,
      periodTitle: `Rentang Kustom: ${formatDateIndo(customStartDate)} s.d. ${formatDateIndo(customEndDate)}`,
    };
  }, [periodType, selectedDate, selectedMonth, selectedYear, customStartDate, customEndDate]);

  // Aggregate All Transactions (SPP Inflows + Registrations Inflows + Manual Cashflows)
  const combinedTransactions = useMemo(() => {
    const list: {
      id: string;
      date: string;
      title: string;
      category: string;
      type: 'INCOME' | 'EXPENSE';
      amount: number;
      paymentMethod: string;
      source: string;
      notes?: string;
      receiptNumber?: string;
      rawCashflowId?: string;
    }[] = [];

    // 1. SPP Payments (Income)
    sppPayments.forEach((spp) => {
      if (spp.status === 'LUNAS' || spp.status === 'BEASISWA') {
        const payDate = spp.paidDate || (spp.createdAt ? spp.createdAt.slice(0, 10) : '2026-08-01');
        if (payDate >= startDateStr && payDate <= endDateStr) {
          list.push({
            id: `spp-${spp.id}`,
            date: payDate,
            title: `Iuran SPP - ${spp.athleteName} (${formatMonthYearIndo(spp.monthYear)})`,
            category: 'SPP_BULANAN',
            type: 'INCOME',
            amount: spp.status === 'BEASISWA' ? 0 : spp.amount,
            paymentMethod: spp.paymentMethod || 'Transfer BCA',
            source: 'Modul SPP Atlet',
            notes: spp.notes || (spp.status === 'BEASISWA' ? 'Diskon Beasiswa Prestasi 100%' : 'Lunas'),
            receiptNumber: spp.receiptNumber || `KW-SPP-${spp.id.slice(-5)}`,
          });
        }
      }
    });

    // 2. Approved Registrations (Registration Fee Income)
    registrations.forEach((reg) => {
      if (reg.status === 'DISETUJUI') {
        const vDate = reg.verifiedAt ? reg.verifiedAt.slice(0, 10) : reg.submittedAt.slice(0, 10);
        if (vDate >= startDateStr && vDate <= endDateStr) {
          list.push({
            id: `reg-${reg.id}`,
            date: vDate,
            title: `Uang Pendaftaran Anggota Baru - ${reg.name}`,
            category: 'PENDAFTARAN_ANGGOTA',
            type: 'INCOME',
            amount: 150000, // Biaya pendaftaran standar
            paymentMethod: 'Transfer / QRIS',
            source: 'Registrasi Online',
            notes: `KTA: ${reg.assignedMemberNo || 'SM-NEW'}`,
            receiptNumber: `KW-REG-${reg.id.slice(-5)}`,
          });
        }
      }
    });

    // 3. Manual Cashflow Transactions (Expenses & Extra Incomes)
    cashflowTransactions.forEach((trx) => {
      const tDate = trx.date;
      if (tDate >= startDateStr && tDate <= endDateStr) {
        list.push({
          id: `cfl-${trx.id}`,
          date: trx.date,
          title: trx.title,
          category: trx.category,
          type: trx.type,
          amount: trx.amount,
          paymentMethod: trx.paymentMethod || 'Transfer Bank',
          source: 'Buku Kas Operasional',
          notes: trx.description,
          receiptNumber: trx.receiptNumber || `KW-KAS-${trx.id.slice(-4)}`,
          rawCashflowId: trx.id,
        });
      }
    });

    // Sort descending by date
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [sppPayments, registrations, cashflowTransactions, startDateStr, endDateStr]);

  // Filtered by Search & Category
  const filteredTransactions = useMemo(() => {
    return combinedTransactions.filter((trx) => {
      const matchCat =
        selectedCategoryFilter === 'ALL' ||
        (selectedCategoryFilter === 'INCOME_ONLY' && trx.type === 'INCOME') ||
        (selectedCategoryFilter === 'EXPENSE_ONLY' && trx.type === 'EXPENSE') ||
        trx.category === selectedCategoryFilter;

      const matchSearch =
        !searchQuery ||
        trx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trx.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trx.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [combinedTransactions, selectedCategoryFilter, searchQuery]);

  // Financial Stats Totals
  const totalIncome = useMemo(
    () => combinedTransactions.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0),
    [combinedTransactions]
  );
  const totalExpense = useMemo(
    () => combinedTransactions.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0),
    [combinedTransactions]
  );
  const netCashflow = totalIncome - totalExpense;

  // Chart Data: Inflows vs Outflows
  const chartData = useMemo(() => {
    const map = new Map<string, { label: string; pemasukan: number; pengeluaran: number }>();

    combinedTransactions.forEach((trx) => {
      const key = periodType === 'yearly' ? trx.date.slice(0, 7) : trx.date;
      const label = periodType === 'yearly' ? formatMonthYearIndo(key) : formatDateIndo(key).slice(0, 10);
      const existing = map.get(key) || { label, pemasukan: 0, pengeluaran: 0 };
      if (trx.type === 'INCOME') {
        existing.pemasukan += trx.amount;
      } else {
        existing.pengeluaran += trx.amount;
      }
      map.set(key, existing);
    });

    const arr = Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map((e) => e[1]);

    if (arr.length === 0) {
      return [
        { label: 'Pemasukan SPP', pemasukan: totalIncome || 1200000, pengeluaran: 0 },
        { label: 'Bantalan Target & Operasional', pemasukan: 0, pengeluaran: totalExpense || 450000 },
      ];
    }
    return arr.slice(-10); // Take last 10 points
  }, [combinedTransactions, periodType, totalIncome, totalExpense]);

  // Submit New Transaction
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrxTitle || newTrxAmount <= 0) return;

    const newTrx: CashflowTransaction = {
      id: `trx-${Date.now()}`,
      type: newTrxType,
      category: newTrxCategory,
      amount: newTrxAmount,
      date: newTrxDate,
      title: newTrxTitle,
      description: newTrxDescription,
      paymentMethod: newTrxPaymentMethod,
      recordedBy: currentUser.name,
      receiptNumber: `KW-${newTrxType === 'INCOME' ? 'IN' : 'OUT'}-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };

    onAddTransaction(newTrx);
    setIsAddModalOpen(false);
    setNewTrxTitle('');
    setNewTrxDescription('');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'No',
      'Tanggal Transaksi',
      'No Kuitansi / Bukti',
      'Tipe (Pemasukan/Pengeluaran)',
      'Kategori Transaksi',
      'Uraian / Deskripsi',
      'Metode Pembayaran',
      'Jumlah (Rp)',
      'Sumber Modul',
      'Catatan',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredTransactions.map((trx, idx) => [
      idx + 1,
      trx.date,
      trx.receiptNumber || '-',
      trx.type === 'INCOME' ? 'Pemasukan (+)' : 'Pengeluaran (-)',
      trx.category,
      trx.title,
      trx.paymentMethod,
      trx.amount,
      trx.source,
      trx.notes || '',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LAPORAN_KEUANGAN_SENENG_MANAH_${startDateStr}_sd_${endDateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 print:space-y-3 print:pb-0">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Banknote className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Laporan Keuangan & Kas Klub
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi pembukuan kas masuk (SPP, pendaftaran) dan kas keluar operasional {clubSettings.clubName}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {canManage && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Kas Keluar / Masuk</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider transition shadow-md shadow-pink-500/20 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Period Filter Selection Bar (Interactive Tabs) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 print:hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Segmented Period Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 flex-wrap gap-1">
            <button
              onClick={() => setPeriodType('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                periodType === 'daily'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Harian</span>
            </button>

            <button
              onClick={() => setPeriodType('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                periodType === 'weekly'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Mingguan (7 Hari)</span>
            </button>

            <button
              onClick={() => setPeriodType('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                periodType === 'monthly'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Bulanan</span>
            </button>

            <button
              onClick={() => setPeriodType('yearly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                periodType === 'yearly'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tahunan</span>
            </button>

            <button
              onClick={() => setPeriodType('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                periodType === 'custom'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Rentang Kustom</span>
            </button>
          </div>

          {/* Sub-inputs for Specific Dates */}
          <div className="flex items-center gap-2 flex-wrap">
            {periodType === 'daily' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Pilih Tanggal:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {periodType === 'weekly' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Pekan Berakhir Tanggal:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {periodType === 'monthly' && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value={1}>Januari</option>
                  <option value={2}>Februari</option>
                  <option value={3}>Maret</option>
                  <option value={4}>April</option>
                  <option value={5}>Mei</option>
                  <option value={6}>Juni</option>
                  <option value={7}>Juli</option>
                  <option value={8}>Agustus</option>
                  <option value={9}>September</option>
                  <option value={10}>Oktober</option>
                  <option value={11}>November</option>
                  <option value={12}>Desember</option>
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            )}

            {periodType === 'yearly' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Tahun:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            )}

            {periodType === 'custom' && (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-medium"
                />
                <span className="text-xs text-slate-400">s.d.</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-medium"
                />
              </div>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari uraian transaksi, no. kuitansi, nama pembayar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Jenis Transaksi (Masuk & Keluar)</option>
              <option value="INCOME_ONLY">Hanya Pemasukan (+)</option>
              <option value="EXPENSE_ONLY">Hanya Pengeluaran (-)</option>
              <option value="SPP_BULANAN">Iuran SPP Bulanan</option>
              <option value="PENDAFTARAN_ANGGOTA">Pendaftaran Anggota</option>
              <option value="PERALATAN_BANTALAN_TARGET">Bantalan & Sasaran Target</option>
              <option value="PERAWATAN_LAPANGAN">Perawatan Lapangan</option>
              <option value="HONOR_PELATIH">Honor & Pelatihan</option>
              <option value="KONSUMSI_EVENT">Konsumsi & Operasional</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Inflow */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-slate-500">Total Pemasukan Kas (+)</p>
            <h3 className="text-xl font-black text-emerald-600 font-mono mt-1">
              {formatRupiah(totalIncome)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {combinedTransactions.filter((t) => t.type === 'INCOME').length} transaksi kas masuk
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Total Outflow */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-slate-500">Total Pengeluaran Kas (-)</p>
            <h3 className="text-xl font-black text-rose-600 font-mono mt-1">
              {formatRupiah(totalExpense)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {combinedTransactions.filter((t) => t.type === 'EXPENSE').length} transaksi kas keluar
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        {/* Net Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-slate-500">Saldo Kas Bersih (Net)</p>
            <h3
              className={`text-xl font-black font-mono mt-1 ${
                netCashflow >= 0 ? 'text-indigo-600' : 'text-rose-600'
              }`}
            >
              {formatRupiah(netCashflow)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {netCashflow >= 0 ? 'Surplus Finansial' : 'Defisit Anggaran'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Printable Report Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 printable-report print:border-none print:shadow-none print:p-2">
        {/* Kop Surat Resmi */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-950 flex items-center justify-center text-emerald-400 font-black text-2xl shadow-sm border border-slate-800 shrink-0">
              🏹
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-wide">
                {clubSettings.clubName}
              </h1>
              <p className="text-xs text-emerald-700 font-bold tracking-wider">
                LAPORAN KAS & KEUANGAN RESMI KLUB PANAHAN
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Sekretariat & Lapangan: {clubSettings.trainingLocation}
              </p>
              <p className="text-[11px] text-slate-600">
                Kota Batu, Jawa Timur • Rekening Klub: {clubSettings.bankName} {clubSettings.bankAccountNumber} (a.n. {clubSettings.bankAccountHolder})
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-wider block">
              BUKU KAS UMUM
            </span>
            <p className="text-[10px] text-slate-500 font-mono font-bold mt-1.5">
              Periode: {startDateStr} s/d {endDateStr}
            </p>
          </div>
        </div>

        {/* Title Header */}
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 underline underline-offset-4">
            REKAPITULASI LAPORAN ARUS KAS KEUANGAN
          </h3>
          <p className="text-xs font-bold text-slate-700 mt-1">
            PERIODE LAPORAN: <span className="text-emerald-700">{periodTitle.toUpperCase()}</span>
          </p>
        </div>

        {/* Chart (Hidden on Print for crisp table layout) */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 print:hidden space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Grafik Arus Kas (Pemasukan vs Pengeluaran)
            </span>
            <span className="text-slate-400 text-[11px]">Berdasarkan transaksi periode aktif</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [formatRupiah(value), 'Jumlah']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="pemasukan" name="Pemasukan (+)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pengeluaran" name="Pengeluaran (-)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Rincian Buku Kas ({filteredTransactions.length} Transaksi)</span>
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              Mata Uang: Indonesian Rupiah (IDR)
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 w-8 text-center border-r border-slate-200">No</th>
                  <th className="p-2.5 w-24 border-r border-slate-200">Tanggal</th>
                  <th className="p-2.5 w-28 border-r border-slate-200">No. Bukti / KTA</th>
                  <th className="p-2.5 border-r border-slate-200">Uraian Transaksi</th>
                  <th className="p-2.5 w-28 border-r border-slate-200">Kategori & Metode</th>
                  <th className="p-2.5 text-right w-28 border-r border-slate-200">Debit (Masuk)</th>
                  <th className="p-2.5 text-right w-28 border-r border-slate-200">Kredit (Keluar)</th>
                  {canManage && <th className="p-2.5 w-10 text-center print:hidden">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-900">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400 italic">
                      Tidak ada transaksi tercatat dalam rentang waktu ini.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 text-center font-bold text-slate-500 border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="p-2.5 font-medium border-r border-slate-200 whitespace-nowrap">
                        {formatDateIndo(t.date)}
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-600 border-r border-slate-200 whitespace-nowrap">
                        {t.receiptNumber || '-'}
                      </td>
                      <td className="p-2.5 border-r border-slate-200">
                        <strong className="text-slate-900 block">{t.title}</strong>
                        {t.notes && <span className="text-[10px] text-slate-500 block italic">{t.notes}</span>}
                      </td>
                      <td className="p-2.5 border-r border-slate-200 text-[11px]">
                        <span className="block font-semibold text-slate-700">{t.category.replace(/_/g, ' ')}</span>
                        <span className="text-slate-500 text-[10px]">{t.paymentMethod}</span>
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-700 border-r border-slate-200 whitespace-nowrap">
                        {t.type === 'INCOME' ? formatRupiah(t.amount) : '-'}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-rose-700 border-r border-slate-200 whitespace-nowrap">
                        {t.type === 'EXPENSE' ? formatRupiah(t.amount) : '-'}
                      </td>
                      {canManage && (
                        <td className="p-2.5 text-center print:hidden">
                          {t.rawCashflowId ? (
                            <button
                              onClick={() => onDeleteTransaction(t.rawCashflowId!)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">-</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={5} className="p-3 text-right uppercase tracking-wider border-r border-slate-200">
                    TOTAL KESELURUHAN PERIODE INI:
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-700 border-r border-slate-200">
                    {formatRupiah(totalIncome)}
                  </td>
                  <td className="p-3 text-right font-mono text-rose-700 border-r border-slate-200">
                    {formatRupiah(totalExpense)}
                  </td>
                  {canManage && <td className="p-3 print:hidden"></td>}
                </tr>
                <tr className="bg-slate-200/80 font-black text-slate-950">
                  <td colSpan={5} className="p-3 text-right uppercase tracking-wider border-r border-slate-200">
                    SALDO KAS BERSIH (NET BALANCE):
                  </td>
                  <td colSpan={2} className={`p-3 text-right font-mono text-base ${netCashflow >= 0 ? 'text-indigo-700' : 'text-rose-700'}`}>
                    {formatRupiah(netCashflow)}
                  </td>
                  {canManage && <td className="p-3 print:hidden"></td>}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Official Signatures (3 Pihak) */}
        <div className="pt-6 text-xs">
          <p className="text-right text-slate-600 mb-4">
            Kota Batu, {formatDateIndo(new Date().toISOString())}
          </p>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-slate-600">Bendahara Klub,</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 inline-block min-w-[130px]">
                ( {currentUser.role === 'admin' ? currentUser.name : 'Bendahara Klub'} )
              </p>
            </div>

            <div>
              <p className="text-slate-600">Pelatih Kepala,</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 inline-block min-w-[130px]">
                ( {clubSettings.coachName || 'Pelatih Kepala'} )
              </p>
            </div>

            <div>
              <p className="text-slate-600">Ketua Pengurus Klub,</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 inline-block min-w-[130px]">
                ( {clubSettings.clubName} )
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-white">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Catat Transaksi Kas Baru</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-5 space-y-4 text-xs">
              {/* Type selector */}
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Jenis Transaksi:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTrxType('EXPENSE')}
                    className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                      newTrxType === 'EXPENSE'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Pengeluaran Kas (-)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTrxType('INCOME')}
                    className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                      newTrxType === 'INCOME'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Pemasukan Kas (+)</span>
                  </button>
                </div>
              </div>

              {/* Title / Uraian */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Uraian / Nama Transaksi *
                </label>
                <input
                  type="text"
                  required
                  placeholder={newTrxType === 'EXPENSE' ? 'Misal: Pembelian 3 Bantalan Target Spon EVA 80x80cm' : 'Misal: Donasi Kegiatan Turnamen Panahan'}
                  value={newTrxTitle}
                  onChange={(e) => setNewTrxTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Kategori:</label>
                  <select
                    value={newTrxCategory}
                    onChange={(e) => setNewTrxCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                  >
                    {newTrxType === 'EXPENSE' ? (
                      <>
                        <option value="PERALATAN_BANTALAN_TARGET">Bantalan & Sasaran Target</option>
                        <option value="PERAWATAN_LAPANGAN">Perawatan Lapangan & Kebersihan</option>
                        <option value="HONOR_PELATIH">Honor Pelatih & Official</option>
                        <option value="KONSUMSI_EVENT">Konsumsi & Operasional</option>
                        <option value="BIAYA_LOMBA">Biaya Kejuaraan / Turnamen</option>
                        <option value="LAIN_LAIN">Pengeluaran Lain-lain</option>
                      </>
                    ) : (
                      <>
                        <option value="SPP_BULANAN">Iuran SPP Bulanan</option>
                        <option value="PENDAFTARAN_ANGGOTA">Pendaftaran Anggota Baru</option>
                        <option value="DONASI_SPONSOR">Donasi / Sponsor Klub</option>
                        <option value="PENJUALAN_MERCHANDISE">Penjualan Merchandise & Busur</option>
                        <option value="LAIN_LAIN">Pemasukan Lain-lain</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Jumlah (Rp) *</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={newTrxAmount}
                    onChange={(e) => setNewTrxAmount(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Date & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tanggal Transaksi:</label>
                  <input
                    type="date"
                    required
                    value={newTrxDate}
                    onChange={(e) => setNewTrxDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Metode Pembayaran:</label>
                  <select
                    value={newTrxPaymentMethod}
                    onChange={(e) => setNewTrxPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="Transfer BCA">Transfer BCA</option>
                    <option value="Transfer Mandiri">Transfer Mandiri</option>
                    <option value="Transfer BRI / BNI">Transfer BRI / BNI</option>
                    <option value="QRIS">QRIS</option>
                    <option value="Tunai / Cash">Tunai / Cash</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">Catatan Tambahan (Opsional):</label>
                <textarea
                  rows={2}
                  placeholder="Misal: Nota Toko Panahan No. 891, dibeli di Malang"
                  value={newTrxDescription}
                  onChange={(e) => setNewTrxDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md shadow-emerald-600/20"
                >
                  Simpan Transaksi Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
