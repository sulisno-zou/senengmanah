import { Athlete, SPPPayment, TrainingSession, AttendanceRecord, ClubSettings, NewsArticle, PaymentProof, UserAccount, RegistrationRequest, KTACardSettings } from '../types';

export const SENENG_MANAH_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><defs><linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230b56d0"/><stop offset="100%" stop-color="%23063aa9"/></linearGradient><path id="textArcTop" d="M 60,250 A 190,190 0 0,1 440,250" fill="none"/><path id="textArcBottom" d="M 440,250 A 190,190 0 0,1 60,250" fill="none"/></defs><circle cx="250" cy="250" r="240" fill="url(%23bgGrad)" stroke="%23ffffff" stroke-width="8"/><circle cx="250" cy="250" r="232" fill="none" stroke="%23063aa9" stroke-width="4"/><circle cx="250" cy="250" r="160" fill="%23ffffff"/><path d="M 230,120 A 140,140 0 0,0 230,380 A 115,115 0 0,1 230,120 Z" fill="%23dc2626"/><g transform="translate(145, 95)"><path d="M 95,20 C 130,50 170,110 180,170 C 170,135 125,80 95,65 Z" fill="%231e293b"/><path d="M 95,20 L 140,110 L 180,170" fill="none" stroke="%231e293b" stroke-width="5"/><path d="M 95,20 L 80,105 L 180,170" fill="none" stroke="%23ffffff" stroke-width="3"/><path d="M 85,95 C 80,85 70,80 60,88 C 50,95 55,108 65,112 C 75,116 85,105 85,95 Z" fill="%230f172a"/><path d="M 60,110 L 40,130 L 70,145 L 85,115 Z" fill="%230f172a"/><path d="M 70,130 C 65,150 60,185 62,220 L 105,220 C 108,185 105,150 95,130 Z" fill="%230f172a"/><path d="M 62,220 L 55,290 L 75,295 L 82,230 L 92,230 L 98,295 L 118,290 L 105,220 Z" fill="%230f172a"/><path d="M 140,100 L 185,165" fill="none" stroke="%23e11d48" stroke-width="4"/><path d="M 185,165 L 195,180" fill="%23e11d48"/></g><circle cx="250" cy="250" r="236" fill="none" stroke="%23ffffff" stroke-dasharray="4,6" stroke-width="2"/><text font-family="Arial Black, Impact, sans-serif" font-size="44" font-weight="900" fill="%23ffffff" letter-spacing="14"><textPath href="%23textArcTop" startOffset="50%" text-anchor="middle">SENENG</textPath></text><text font-family="Arial Black, Impact, sans-serif" font-size="40" font-weight="900" fill="%23ffffff" letter-spacing="16"><textPath href="%23textArcBottom" startOffset="50%" text-anchor="middle">MANAH</textPath></text><polygon points="52,250 62,235 68,252 50,242 70,242 52,254" fill="%23ffffff" transform="scale(1.5) translate(-18,-85)"/><polygon points="52,250 62,235 68,252 50,242 70,242 52,254" fill="%23ffffff" transform="scale(1.5) translate(250,-85)"/></svg>`;

export const DEFAULT_KTA_SETTINGS: KTACardSettings = {
  themePreset: 'pink_purple_blue',
  bgGradientFrom: '#0f172a',
  bgGradientVia: '#3b0764',
  bgGradientTo: '#0c4a6e',
  headerColor: '#ffffff',
  nameColor: '#f43f5e',
  memberIdColor: '#38bdf8',
  labelColor: '#94a3b8',
  valueColor: '#f8fafc',
  badgeBgColor: '#ec4899',
  badgeTextColor: '#ffffff',
  borderColor: '#ec4899',
  showWatermark: true,
  watermarkOpacity: 0.15,
  footerText: 'Kartu Tanda Anggota Resmi • Club Seneng Manah Batu',
  cardTitle: 'KARTU TANDA ANGGOTA RESMI',
  disclaimerText: 'Anggota Resmi Seneng Manah, Segala penyalahgunaan KTA adalah tanggung jawab pemegang.',
  photoBorderColor: '#ec4899',
  barcodeBorderColor: '#38bdf8',
  backSubtitle: 'KETENTUAN KARTU TANDA ANGGOTA',
  backCoachName: 'Coach Zoulkifli',
  backCoachTitle: 'Pelatih Kepala / Penanggung Jawab',
  backContactText: '0812-3344-5566',
  backLocationText: 'Lapangan Panahan Seneng Manah, Kota Batu',
  regulations: [
    'Kartu ini sah sebagai bukti keanggotaan atlet resmi klub.',
    'Wajib dibawa saat sesi latihan & kejuaraan panahan.',
    'Tidak dapat dipindahtangankan kepada pihak lain.',
    'Scan barcode untuk memeriksa status aktif & profil resmi atlet.',
    'Segala bentuk penyalahgunaan KTA menjadi tanggung jawab penuh pemegang kartu.',
  ],
};

export const INITIAL_CLUB_SETTINGS: ClubSettings = {
  clubName: 'SENENG MANAH SHOOTING CLASS BATU',
  tagline: 'Mencetak Atlet Panahan Berprestasi, Berkarakter & Berdisiplin Tinggi',
  coachName: 'Coach Zoulkifli (Level 2 World Archery Coach)',
  coachContact: '0812-3456-7890',
  headCoach: 'Coach Zoulkifli',
  headCoachName: 'Coach Zoulkifli (Level 2 World Archery Coach)',
  headCoachTitle: 'Pelatih Utama (Head Coach)',
  headCoachContact: '0812-3456-7890',
  ktaResponsiblePerson: 'Coach Zoulkifli',
  ktaResponsibleTitle: 'Pelatih Utama & Penanggung Jawab Teknis',
  phone: '0812-3344-5566',
  email: 'senengmanah.batu@gmail.com',
  address: 'Jl. Oro-Oro Ombo No. 88, Kota Batu, Jawa Timur',
  defaultMonthlySpp: 250000,
  bankName: 'BCA (Bank Central Asia)',
  bankAccountNumber: '8720-1928-33',
  bankAccountHolder: 'SENENG MANAH SHOOTING CLASS BATU',
  qrisInstruction: 'Scan QRIS SENENG MANAH pada kasir sekretariat atau transfer bank.',
  trainingLocation: 'Lapangan Panahan Seneng Manah Archery Field, Kota Batu',
  trainingSchedule: 'Selasa & Kamis (15:30 - 18:00 WIB), Sabtu & Minggu (07:30 - 11:00 WIB)',
  logoUrl: SENENG_MANAH_LOGO_SVG,
  themePreset: 'pink_blue_purple',
  primaryColor: '#ec4899', // Pink / Rose
  accentColor: '#2563eb', // Royal Blue
  superAdminUsername: 'zou',
  superAdminPassword: 'senengm4n4h',
  ktaSettings: DEFAULT_KTA_SETTINGS,
};

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-super',
    username: 'zou',
    password: 'senengm4n4h',
    name: 'Super Admin Zou',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    phone: '0812-3456-7890',
  },
  {
    id: 'usr-headcoach',
    username: 'pelatih_utama',
    password: 'password123',
    name: 'Coach Zoulkifli',
    role: 'pelatih_utama',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    phone: '0812-3456-7890',
  },
  {
    id: 'usr-admin',
    username: 'admin_batu',
    password: 'password123',
    name: 'Admin Kegiatan & Pelatih',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '0813-9876-5432',
  },
  {
    id: 'usr-coach',
    username: 'pelatih_batu',
    password: 'password123',
    name: 'Coach Rahmat (Pelatih)',
    role: 'pelatih',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '0812-8877-6655',
  },
  {
    id: 'usr-pengurus',
    username: 'pengurus_batu',
    password: 'password123',
    name: 'Pengurus Organisasi Klub',
    role: 'pengurus',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '0813-1122-3344',
  },
];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Kejuaraan Horsebow & HBA Sirkuit Panahan Pelajar Piala Walikota Batu 2026',
    category: 'Jadwal & Event',
    date: '2026-08-16',
    author: 'Super Admin',
    authorRole: 'Admin Klub',
    summary: 'Seluruh atlit divisi Horsebow dipersiapkan untuk uji tanding scoring intensif, fast shooting, dan track HBA menjelang kejuaraan daerah.',
    content: 'Diberitahukan kepada seluruh atlet SENENG MANAH SHOOTING CLASS BATU bahwa pendaftaran Kejuaraan Sirkuit Panahan Horsebow Pelajar Piala Walikota Batu 2026 telah dibuka. Sesi latihan scoring test, blind nocking, dan simulasi lomba akan diadakan rutin setiap Sabtu pagi di Lapangan Utama.',
    imageUrl: 'https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?w=800&auto=format&fit=crop&q=80',
    featured: true,
    tags: ['Kejurda', 'Kota Batu', 'Horsebow', 'HBA', 'Prestasi'],
    createdAt: '2026-08-16T08:00:00Z',
  },
  {
    id: 'news-2',
    title: 'Pengumuman: Pendaftaran Anggota Baru & Pembayaran Iuran SPP Digital Berbarcode',
    category: 'Pengumuman Klub',
    date: '2026-08-14',
    author: 'Super Admin',
    authorRole: 'Administrasi',
    summary: 'Calon atlit dan wali murid kini dapat mendaftar secara langsung melalui portal atlit dan mencetak Kartu Anggota KTA resmi berbarcode.',
    content: 'Untuk meningkatkan kemudahan dan transparansi administrasi, SENENG MANAH kini meluncurkan portal pendaftaran mandiri dan Kartu Anggota Digital Resmi dengan sistem verifikasi barcode. Data NIK atlit otomatis dilindungi demi keamanan privasi.',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    featured: false,
    tags: ['Pendaftaran', 'SPP', 'KTA', 'Digital'],
    createdAt: '2026-08-14T10:30:00Z',
  },
  {
    id: 'news-3',
    title: 'Tips Teknik: Menjaga Kuncian Thumb Draw & Aksi Khatra saat Angin Pegunungan di Batu',
    category: 'Tips & Teknik',
    date: '2026-08-10',
    author: 'Super Admin',
    authorRole: 'Head Coach',
    summary: 'Panduan khusus mengantisipasi hembusan angin pegunungan Kota Batu agar grouping panah Horsebow tetap mengumpul di ring 10.',
    content: 'Kota Batu memiliki karakter hembusan angin sejuk yang khas. Pastikan kuncian thumb ring pas pada sendi ibu jari, aksi forward khatra terdorong lembut saat release, dan pernapasan terkontrol. Jangan menahan full draw lebih dari 3 detik untuk menjaga ledakan daya lenting busur.',
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80',
    featured: false,
    tags: ['Teknik', 'Thumb Draw', 'Khatra', 'Horsebow'],
    createdAt: '2026-08-10T14:00:00Z',
  },
];

export const INITIAL_ATHLETES: Athlete[] = [];

export const INITIAL_PAYMENT_PROOFS: PaymentProof[] = [];

export const INITIAL_SPP_PAYMENTS: SPPPayment[] = [];

export const INITIAL_TRAINING_SESSIONS: TrainingSession[] = [];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_REGISTRATIONS: RegistrationRequest[] = [];

