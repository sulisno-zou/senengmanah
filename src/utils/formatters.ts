export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatMonthYearIndo(monthYearStr: string): string {
  // input: "2026-08" -> "Agustus 2026"
  if (!monthYearStr) return '-';
  const parts = monthYearStr.split('-');
  if (parts.length !== 2) return monthYearStr;
  const year = parts[0];
  const month = parseInt(parts[1], 10);
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${monthNames[month - 1] || month} ${year}`;
}

export function generateWhatsAppReminderMessage(
  athleteName: string,
  parentName: string | undefined,
  monthYear: string,
  amount: number,
  clubName: string,
  bankDetails: string,
  bankAccount: string,
  bankHolder: string
): string {
  const monthName = formatMonthYearIndo(monthYear);
  const formattedAmount = formatRupiah(amount);
  const recipient = parentName ? `Bapak/Ibu ${parentName} (Wali dari ${athleteName})` : `Kak ${athleteName}`;

  return `*Pemberitahuan Iuran/SPP Klub Panahan - ${clubName}*

Yth. ${recipient},

Semoga selalu sehat dan penuh semangat. Menginfokan tagihan iuran SPP latihan panahan untuk:
• *Nama Atlet:* ${athleteName}
• *Periode:* ${monthName}
• *Jumlah:* ${formattedAmount}
• *Status:* Belum Lunas

Pembayaran dapat ditransfer melalui:
• *Bank:* ${bankDetails}
• *No. Rekening:* ${bankAccount}
• *A.n:* ${bankHolder}

Mohon konfirmasi bukti transfer setelah melakukan pembayaran. Terima kasih atas dukungan Bapak/Ibu untuk perkembangan latihan atlet kita. 🎯🏹

_Salam Olahraga Panahan,_
*Manajemen ${clubName}*`;
}

export function generateWhatsAppAttendanceReminderMessage(
  athleteName: string,
  parentName: string | undefined,
  clubName: string,
  attendancePercentage: number,
  absentCount: number,
  nextPracticeSchedule: string = 'Sabtu & Minggu Pukul 07.30 WIB di Lapangan Utama'
): string {
  const recipient = parentName ? `Bapak/Ibu ${parentName} (Wali dari ${athleteName})` : `Kak ${athleteName}`;

  return `*Pengingat Semangat Kehadiran Latihan Panahan - ${clubName}* 🎯🏹

Yth. ${recipient},

Semoga Bapak/Ibu dan keluarga senantiasa diberikan kesehatan dan keberkahan. 

Kami dari tim pelatih dan pengurus klub ingin menyapa ananda *${athleteName}*. Berdasarkan catatan presensi latihan Horsebow terakhir, tercatat:
• *Persentase Kehadiran:* ${attendancePercentage}% (${absentCount} kali berhalangan hadir)
• *Kategori Busur:* HORSEBOW (Traditional Archery & HBA)

Latihan rutin sangat krusial untuk menjaga *muscle memory (kuncian thumb draw & khatra)*, ritme tarikan, stabilitas fisik, serta persiapan agenda kompetisi mendatang.

📅 *Jadwal Latihan Terdekat:*
${nextPracticeSchedule}

Kami sangat menantikan kehadiran ananda *${athleteName}* di lapangan untuk berlatih bersama rekan-rekan atlit lainnya. Jika ada kendala, jangan ragu untuk berkoordinasi dengan tim pelatih.

Terima kasih atas dedikasi dan dukungannya! 🏹🔥

_Salam Hormat & Semangat Memanah,_
*Tim Pelatih & Manajemen ${clubName}*`;
}

export function generateWhatsAppPaidReceiptMessage(
  athleteName: string,
  monthYear: string,
  amount: number,
  receiptNo: string,
  paymentMethod: string,
  paidDate: string,
  clubName: string
): string {
  const monthName = formatMonthYearIndo(monthYear);
  const formattedAmount = formatRupiah(amount);
  const formattedDate = formatDateIndo(paidDate);

  return `*KUITANSI PEMBAYARAN SPP - ${clubName}*
✅ *STATUS: LUNAS*

Terima kasih, pembayaran SPP latihan panahan telah kami terima dengan rincian:
• *No. Kuitansi:* ${receiptNo}
• *Nama Atlet:* ${athleteName}
• *Periode:* ${monthName}
• *Nominal:* ${formattedAmount}
• *Metode:* ${paymentMethod}
• *Tanggal:* ${formattedDate}

Semoga latihan ananda semakin rajin, fokus, dan terus menorehkan prestasi gemilang! 🎯🏹

*Manajemen ${clubName}*`;
}

export function numberToWordsIndo(num: number): string {
  if (num === 0) return 'Nol Rupiah';
  const units = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  
  function convert(n: number): string {
    if (n < 12) return units[n];
    if (n < 20) return convert(n - 10) + ' Belas';
    if (n < 100) return convert(Math.floor(n / 10)) + ' Puluh ' + units[n % 10];
    if (n < 200) return 'Seratus ' + convert(n - 100);
    if (n < 1000) return convert(Math.floor(n / 100)) + ' Ratus ' + convert(n % 100);
    if (n < 2000) return 'Seribu ' + convert(n - 1000);
    if (n < 1000000) return convert(Math.floor(n / 1000)) + ' Ribu ' + convert(n % 1000);
    if (n < 1000000000) return convert(Math.floor(n / 1000000)) + ' Juta ' + convert(n % 1000000);
    return n.toString();
  }

  return convert(num).trim().replace(/\s+/g, ' ') + ' Rupiah';
}

export function getArrowNumericValue(val: number | 'X' | 'M'): number {
  if (val === 'X') return 10;
  if (val === 'M') return 0;
  return Number(val) || 0;
}
