export type AgeCategory = 'U-10' | 'U-12' | 'U-15' | 'U-18' | 'Senior/Umum';
export type BowDivision = 'Horsebow';
export type Gender = 'L' | 'P';
export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
export type SessionType =
  | 'Latihan Rutin'
  | 'Scoring Test (Uji Tanding)'
  | 'Fisik & Drill'
  | 'Simulasi Lomba'
  | 'HBA (Horseback Archery)'
  | 'Berkuda & Equitation'
  | 'Fast Shooting'
  | 'Dynamic Archery';

export type HorseBowTopic =
  | 'Latihan Rutin'
  | 'Persiapan Lomba'
  | 'HBA'
  | 'Berkuda'
  | 'FAST SHOOTING'
  | 'DYNAMIC';
export type SPPStatus = 'LUNAS' | 'BELUM_BAYAR' | 'TERLAMBAT' | 'BEASISWA' | 'MENUNGGU_VERIFIKASI';
export type PaymentMethod =
  | 'Transfer Bank'
  | 'Transfer BCA'
  | 'Transfer Mandiri'
  | 'Transfer BRI / BNI'
  | 'QRIS'
  | 'Tunai'
  | 'Tunai / Cash'
  | 'Beasiswa Prestasi';
export type UserRole = 'super_admin' | 'admin' | 'pelatih' | 'pelatih_atlit' | 'atlit' | 'pelatih_utama';

export interface ArrowHit {
  id?: string;
  endIndex?: number;
  endNumber?: number;
  arrowIndex?: number;
  arrowNumber?: number;
  score: number | 'X' | 'M';
  x: number; // percentage on target face -100 to 100
  y: number;
}

export interface EndScore {
  endNumber: number;
  arrows: (number | 'X' | 'M')[];
  endTotal: number;
  runningTotal: number;
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  avatar?: string;
  athleteId?: string; // If role is 'atlit' or 'pelatih_atlit'
  phone?: string;
}

export interface BowEquipment {
  bowBrand?: string;
  bowType: string;
  drawWeightLbs: number;
  drawLengthInch: number;
  arrowBrand?: string;
  arrowSpine: string;
  arrowLengthInch?: number;
  pointWeightGrains?: number;
  stabilizerSetup?: string;
  sightMarkNotes?: string;
  thumbRingType?: string; // For Horsebow
  khatraStyle?: string; // For Horsebow
  quiverType?: string; // Hip / Back / Bowhand
  lastTunedDate?: string;
}

export interface Athlete {
  id: string;
  memberNo: string; // e.g. "SM-BATU-001"
  name: string;
  nickname?: string;
  gender: Gender;
  nik: string; // 16 digit - hidden on public barcode scan
  birthPlace: string;
  birthDate: string;
  ageCategory: AgeCategory;
  division: BowDivision;
  phone: string;
  parentName?: string;
  parentPhone?: string;
  address: string;
  joinDate: string;
  active: boolean;
  photoUrl?: string;
  equipment?: BowEquipment;
  monthlySppCustomFee?: number;
  userRole?: UserRole;
  username?: string;
  password?: string;
  notes?: string;
}

export interface SPPPayment {
  id: string;
  athleteId: string;
  athleteName: string;
  monthYear: string; // e.g. "2026-08"
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: SPPStatus;
  paymentMethod?: PaymentMethod;
  receiptNumber?: string;
  recordedBy?: string;
  notes?: string;
  proofImageUrl?: string;
  proofNote?: string;
  referenceNo?: string;
  paymentProofId?: string;
  createdAt: string;
}

export interface PaymentProof {
  id: string;
  athleteId: string;
  athleteName: string;
  monthYear: string;
  amount: number;
  transferDate: string;
  paymentMethod: PaymentMethod;
  senderName?: string;
  senderAccountName?: string;
  bankOrigin?: string;
  proofImageUrl: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface ScoreEnd {
  endNumber: number;
  arrows: (number | string)[]; // e.g. [10, 9, 9, 8, 7, 6] or ['X', 10, 9]
  endScore?: number;
  endTotal?: number;
  runningTotal: number;
  tensCount?: number;
  xCount?: number;
}

// Specific HBA Shot interface
export interface HBATrackShot {
  targetIndex: number;
  targetName: string;
  angle: 'Front (Maju)' | 'Side (Samping)' | 'Back (Kassai/Belakang)' | 'Qabaq (Atas)';
  score: number | 'X' | 'M';
}

export interface TrainingSession {
  id: string;
  athleteId: string;
  athleteName: string;
  date: string;
  topic?: HorseBowTopic; // 'Latihan Rutin' | 'Persiapan Lomba' | 'HBA' | 'Berkuda' | 'FAST SHOOTING' | 'DYNAMIC'
  distanceMeters: number; // 10, 15, 20, 30, 50, 70, 90
  targetFaceCm?: number; // 40, 80, 122, 6-ring
  targetFaceType?: string;
  roundType?: string;
  sessionType?: SessionType;
  ends: (ScoreEnd | EndScore)[];
  totalScore: number;
  maxPossibleScore?: number;
  totalTens?: number;
  totalXs?: number;
  tensCount?: number;
  xCount?: number;
  arrowsShotCount?: number;
  averageArrowScore?: number;
  averagePerArrow?: number;
  goldPercentage?: number;
  notes?: string;
  coachEvaluation?: string;
  windCondition?: string;
  weatherCondition?: string;
  physicalCondition?: string;
  recordedBy?: string;
  arrowHits?: ArrowHit[];
  arrowHitsCoordinates?: any;
  createdAt?: string;

  // Horsebow & Topic-specific metrics
  techniqueStyle?: string; // 'Thumb Draw' | 'Slavic Draw' | 'Mediterranean' | 'Index Draw'
  khatraStyle?: string; // 'Forward Khatra' | 'Side Khatra' | 'Diagonal Khatra' | 'None'

  // Persiapan Lomba specific
  championshipFormat?: string; // 'WHAF Standard' | 'IHAA World Track' | 'KPBI / FESPATI' | 'Kejurda Panahan Tradisional'
  competitionCategory?: string;

  // HBA (Horseback Archery) Track specific
  hbaTrackType?: string; // 'Korean Style (90m - 3 Target)' | 'Turkish Qabaq (Tiang Tinggi)' | 'Hungarian Kassai Track (99m)' | 'Polish Track (200m)' | 'Serial 5 Target'
  hbaTrackTimeSeconds?: number;
  hbaTimeLimitSeconds?: number;
  hbaTimeBonus?: number;
  hbaTrackShots?: HBATrackShot[];

  // Berkuda (Horse Riding & Equitation) specific
  horseName?: string;
  gaitType?: 'Walk (Jalan)' | 'Trot (Trot)' | 'Canter (Canter)' | 'Gallop (Lari Kencang)';
  seatBalanceScore?: number; // 1-100
  reinsControlScore?: number; // 1-100
  gaitRhythmSyncScore?: number; // 1-100
  postureScore?: number; // 1-100
  ridingEvaluationNotes?: string;

  // FAST SHOOTING specific
  fastShootingMode?: string; // '30 Detik Speed Test' | '60 Detik Speed Test' | '5 Arrows Blind Nocking' | 'Speed & Accuracy Drill'
  timeElapsedSeconds?: number;
  timeLimitSeconds?: number;
  fastShootingArrowsCount?: number;
  fastShootingHitCount?: number;
  blindNockingRating?: 'S' | 'A' | 'B' | 'C';
  speedScorePerArrow?: number; // seconds per arrow

  // DYNAMIC specific
  dynamicCourseName?: string; // 'Tactical Obstacle Course' | 'Running & Shooting Track' | '360° Multi-Target Hunt' | 'Kneeling & Behind Cover'
  dynamicObstacleCount?: number;
  dynamicCourseTimeSeconds?: number;
  dynamicAgilityScore?: number; // 1-100
  dynamicTargetHits?: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: 'Pengumuman Klub' | 'Jadwal & Event' | 'Tips & Teknik' | 'Prestasi Atlit' | 'Keuangan';
  date: string;
  author: string;
  authorRole: string;
  summary: string;
  content: string;
  imageUrl?: string;
  featured?: boolean;
  tags?: string[];
  createdAt: string;
}

export interface RegistrationRequest {
  id: string;
  regNumber: string; // e.g. "REG-202608-001"
  name: string;
  nickname?: string;
  gender: Gender;
  nik: string; // NIK KTP / Kartu Identitas Anak / KK
  birthPlace: string;
  birthDate: string;
  ageCategory: AgeCategory;
  division: BowDivision;
  phone: string; // WhatsApp Aktif
  parentName?: string;
  parentPhone?: string;
  address: string;
  experienceNotes?: string;
  photoUrl?: string;
  status: 'MENUNGGU_VERIFIKASI' | 'DISETUJUI' | 'DITOLAK';
  rejectionReason?: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  assignedMemberNo?: string;
}

export interface AttendanceRecord {
  id: string;
  athleteId: string;
  athleteName: string;
  date: string;
  status: AttendanceStatus;
  sessionType: SessionType;
  roundsCompleted?: number;
  notes?: string;
  checkInTime?: string;
}

export type TabType = 'dashboard' | 'athletes' | 'registrations' | 'spp' | 'scoring' | 'attendance' | 'financial_report' | 'athlete_progress' | 'ai_coach' | 'news' | 'member_card';

export interface CashflowTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: 'SPP_BULANAN' | 'PENDAFTARAN_ANGGOTA' | 'DONASI_SPONSOR' | 'PENJUALAN_MERCHANDISE' | 'PERALATAN_BANTALAN_TARGET' | 'PERAWATAN_LAPANGAN' | 'HONOR_PELATIH' | 'KONSUMSI_EVENT' | 'BIAYA_LOMBA' | 'LAIN_LAIN';
  amount: number;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  athleteId?: string;
  athleteName?: string;
  recordedBy: string;
  receiptNumber?: string;
  createdAt: string;
}

export interface TopicScoreItem {
  topic: HorseBowTopic;
  aspect: string;
  score: number; // 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  notes: string;
}

export interface AthleteProgressEvaluation {
  id: string;
  athleteId: string;
  athleteName: string;
  periodType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate: string;
  endDate: string;
  periodLabel: string; // e.g. "Harian - 18 Agustus 2026", "Mingguan", "Bulan Agustus 2026", "Tahun 2026"
  attendanceRatePercent: number;
  totalArrowsShot: number;
  highestScore: number;
  averageScore: number;
  overallScore: number; // 0-100
  overallGrade: string; // e.g. "A (Sangat Memuaskan)"
  topicEvaluations: TopicScoreItem[];
  physicalConditionNotes?: string;
  drawWeightCurrentLbs?: number;
  coachFeedback: string;
  recommendations: string[];
  assessedBy: string;
  assessedByRole: UserRole;
  assessedAt: string;
  updatedAt?: string;
}

export type ThemePreset = 'pink_blue_purple' | 'midnight_purple' | 'royal_blue_pink' | 'emerald_purple';

export interface KTACardSettings {
  themePreset: 'pink_purple_blue' | 'gold_navy' | 'emerald_teal' | 'crimson_dark' | 'cyber_neon' | 'clean_white' | 'custom';
  bgGradientFrom: string; // e.g. '#0f172a'
  bgGradientVia?: string; // e.g. '#581c87'
  bgGradientTo: string; // e.g. '#0284c7'
  headerColor: string; // e.g. '#ffffff' (warna nama club)
  nameColor: string; // e.g. '#f43f5e' (warna nama atlit)
  memberIdColor: string; // e.g. '#38bdf8' (warna ID anggota)
  labelColor: string; // e.g. '#94a3b8' (warna label kolom)
  valueColor: string; // e.g. '#f8fafc' (warna nilai biodata)
  badgeBgColor: string; // e.g. '#ec4899' (warna background badge divisi)
  badgeTextColor: string; // e.g. '#ffffff' (warna teks badge)
  borderColor: string; // e.g. '#ec4899' (warna border kartu)
  showWatermark: boolean; // tampilkan watermark target panahan
  watermarkOpacity: number; // 0.05 - 0.4
  footerText: string; // "Kartu ini sah sebagai bukti keanggotaan atlet panahan Seneng Manah Batu"
  cardTitle: string; // "KARTU TANDA ANGGOTA RESMI"
  photoBorderColor: string; // e.g. '#f43f5e'
  barcodeBorderColor: string; // e.g. '#38bdf8'
}

export interface ClubSettings {
  clubName: string;
  tagline: string;
  coachName?: string;
  coachContact?: string;
  headCoach?: string;
  phone?: string;
  email?: string;
  address?: string;
  defaultMonthlySpp: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  qrisInstruction?: string;
  trainingLocation?: string;
  trainingSchedule?: string;
  logoUrl: string;
  themePreset: ThemePreset;
  primaryColor?: string;
  accentColor?: string;
  superAdminUsername: string;
  superAdminPassword?: string;
  ktaSettings?: KTACardSettings;
}

export interface AICoachAnalysis {
  title: string;
  summary: string;
  strengths: string[];
  areasToImprove: string[];
  drillsRecommended: string[];
  coachNote: string;
}
