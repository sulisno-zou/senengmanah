/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_ATHLETES,
  INITIAL_SPP_PAYMENTS,
  INITIAL_TRAINING_SESSIONS,
  INITIAL_ATTENDANCE,
  INITIAL_CLUB_SETTINGS,
  INITIAL_USERS,
  INITIAL_NEWS,
  INITIAL_PAYMENT_PROOFS,
  INITIAL_REGISTRATIONS,
} from './data/initialData';
import {
  Athlete,
  SPPPayment,
  TrainingSession,
  AttendanceRecord,
  ClubSettings,
  TabType,
  UserAccount,
  NewsArticle,
  PaymentProof,
  RegistrationRequest,
  CashflowTransaction,
  AthleteProgressEvaluation,
} from './types';
import {
  subscribeToCollection,
  subscribeToDoc,
  syncSaveDoc,
  syncDeleteDoc,
  seedInitialCloudDataIfEmpty,
  clearAllAthletesAndRegistrationsCloudData,
  COLLECTIONS,
} from './services/firebaseService';
import { HeaderNavbar } from './components/HeaderNavbar';
import { SidebarLeft } from './components/SidebarLeft';
import { PublicGuestView } from './components/PublicGuestView';
import { RegistrationsManagerView } from './components/RegistrationsManagerView';
import { DashboardView } from './components/DashboardView';
import { AthletesView } from './components/AthletesView';
import { SPPMonitoringView } from './components/SPPMonitoringView';
import { TrainingScoringView } from './components/TrainingScoringView';
import { AttendanceView } from './components/AttendanceView';
import { AICoachEvaluatorView } from './components/AICoachEvaluatorView';
import { FinancialReportsView } from './components/FinancialReportsView';
import { AthleteProgressReportsView } from './components/AthleteProgressReportsView';
import { NewsFeedSection } from './components/NewsFeedSection';
import { ReceiptModal } from './components/ReceiptModal';
import { ReportPrintModal } from './components/ReportPrintModal';
import { ClubSettingsModal } from './components/ClubSettingsModal';
import { MemberCardModal } from './components/MemberCardModal';
import { ScanKTAModal } from './components/ScanKTAModal';
import { PaymentProofModal } from './components/PaymentProofModal';
import { RoleLoginModal } from './components/RoleLoginModal';
import { NewsManagerModal } from './components/NewsManagerModal';
import { DownloadAllModal } from './components/DownloadAllModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  Target,
  CalendarCheck,
  Bot,
  Menu,
  BellRing,
  Smartphone,
  X,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Authentication State - Always starts logged out (requiring login upon opening)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserAccount>(INITIAL_USERS[0]);

  // Pure Cloud-Only States (Directly synchronized with Firebase Cloud Firestore)
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRequest[]>([]);
  const [sppPayments, setSppPayments] = useState<SPPPayment[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [clubSettings, setClubSettings] = useState<ClubSettings>(INITIAL_CLUB_SETTINGS);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [newsList, setNewsList] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([]);
  const [cashflowTransactions, setCashflowTransactions] = useState<CashflowTransaction[]>([]);
  const [savedEvaluations, setSavedEvaluations] = useState<AthleteProgressEvaluation[]>([]);

  // Modal States
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<SPPPayment | null>(null);
  const [reportAthleteId, setReportAthleteId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isScanKTAModalOpen, setIsScanKTAModalOpen] = useState(false);
  const [isPaymentProofModalOpen, setIsPaymentProofModalOpen] = useState(false);
  const [isNewsManagerOpen, setIsNewsManagerOpen] = useState(false);
  const [isDownloadAllOpen, setIsDownloadAllOpen] = useState(false);
  const [isAndroidInstallOpen, setIsAndroidInstallOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [cardAthlete, setCardAthlete] = useState<Athlete | null>(null);
  const [newRegistrantToast, setNewRegistrantToast] = useState<RegistrationRequest | null>(null);

  // Listen to PWA beforeinstallprompt on Android/mobile browsers
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Trigger PWA Android install
  const handleTriggerAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsAndroidInstallOpen(false);
      }
    } else {
      setIsAndroidInstallOpen(true);
    }
  };

  // Web Audio chime for incoming mobile registrations
  const playNewRegistrationAlertSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      // Tone 1: High crisp bell
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Tone 2: Harmonious resonance
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.66, now + 0.12); // D6
      gain2.gain.setValueAtTime(0.2, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.7);
    } catch (e) {
      console.warn('Audio alert not supported in current browser context:', e);
    }
  };

  // Restore imported data handler
  const handleRestoreData = (data: any) => {
    if (data.athletes && Array.isArray(data.athletes)) {
      setAthletes(data.athletes);
      data.athletes.forEach((ath: Athlete) => syncSaveDoc(COLLECTIONS.ATHLETES, ath));
    }
    if (data.sppPayments && Array.isArray(data.sppPayments)) {
      setSppPayments(data.sppPayments);
      data.sppPayments.forEach((p: SPPPayment) => syncSaveDoc(COLLECTIONS.SPP_PAYMENTS, p));
    }
    if (data.trainingSessions && Array.isArray(data.trainingSessions)) {
      setTrainingSessions(data.trainingSessions);
      data.trainingSessions.forEach((t: TrainingSession) => syncSaveDoc(COLLECTIONS.TRAINING_SESSIONS, t));
    }
    if (data.attendanceRecords && Array.isArray(data.attendanceRecords)) {
      setAttendanceRecords(data.attendanceRecords);
      data.attendanceRecords.forEach((a: AttendanceRecord) => syncSaveDoc(COLLECTIONS.ATTENDANCE, a));
    }
    if (data.registrations && Array.isArray(data.registrations)) {
      setRegistrations(data.registrations);
      data.registrations.forEach((r: RegistrationRequest) => syncSaveDoc(COLLECTIONS.REGISTRATIONS, r));
    }
    if (data.newsArticles && Array.isArray(data.newsArticles)) {
      setNewsList(data.newsArticles);
      data.newsArticles.forEach((n: NewsArticle) => syncSaveDoc(COLLECTIONS.NEWS, n));
    }
    if (data.paymentProofs && Array.isArray(data.paymentProofs)) {
      setPaymentProofs(data.paymentProofs);
      data.paymentProofs.forEach((p: PaymentProof) => syncSaveDoc('paymentProofs', p));
    }
    if (data.cashflowTransactions && Array.isArray(data.cashflowTransactions)) {
      setCashflowTransactions(data.cashflowTransactions);
      data.cashflowTransactions.forEach((c: CashflowTransaction) => syncSaveDoc(COLLECTIONS.CASHFLOW, c));
    }
    if (data.savedEvaluations && Array.isArray(data.savedEvaluations)) {
      setSavedEvaluations(data.savedEvaluations);
      data.savedEvaluations.forEach((e: AthleteProgressEvaluation) => syncSaveDoc(COLLECTIONS.ATHLETE_EVALUATIONS, e));
    }
    if (data.clubSettings && typeof data.clubSettings === 'object') {
      setClubSettings(data.clubSettings);
      syncSaveDoc(COLLECTIONS.SETTINGS, data.clubSettings, 'global_settings');
    }
  };

  // Firebase Cloud Real-Time Subscriptions (Multi-User & Multi-Device Sync - Fast & Stable)
  useEffect(() => {
    // 1. Auto-seed if cloud database is fresh
    seedInitialCloudDataIfEmpty({
      athletes: INITIAL_ATHLETES,
      sppPayments: INITIAL_SPP_PAYMENTS,
      trainingSessions: INITIAL_TRAINING_SESSIONS,
      attendanceRecords: INITIAL_ATTENDANCE,
      news: INITIAL_NEWS,
      registrations: INITIAL_REGISTRATIONS,
      clubSettings: INITIAL_CLUB_SETTINGS,
      users: INITIAL_USERS,
    });

    // 2. Real-time Athletes listener
    const unsubAthletes = subscribeToCollection<Athlete>(COLLECTIONS.ATHLETES, (cloudAthletes) => {
      if (cloudAthletes && cloudAthletes.length > 0) {
        setAthletes(cloudAthletes);
      } else {
        setAthletes((prev) => (prev.length > 0 ? prev : INITIAL_ATHLETES));
      }
    });

    // 3. Real-time SPP Payments listener
    const unsubSPP = subscribeToCollection<SPPPayment>(COLLECTIONS.SPP_PAYMENTS, (cloudPayments) => {
      if (cloudPayments && cloudPayments.length > 0) {
        setSppPayments(cloudPayments);
      } else {
        setSppPayments((prev) => (prev.length > 0 ? prev : INITIAL_SPP_PAYMENTS));
      }
    });

    // 4. Real-time Training Sessions listener
    const unsubTraining = subscribeToCollection<TrainingSession>(COLLECTIONS.TRAINING_SESSIONS, (cloudSessions) => {
      if (cloudSessions && cloudSessions.length > 0) {
        setTrainingSessions(cloudSessions);
      } else {
        setTrainingSessions((prev) => (prev.length > 0 ? prev : INITIAL_TRAINING_SESSIONS));
      }
    });

    // 5. Real-time Attendance listener
    const unsubAttendance = subscribeToCollection<AttendanceRecord>(COLLECTIONS.ATTENDANCE, (cloudAttendance) => {
      if (cloudAttendance && cloudAttendance.length > 0) {
        setAttendanceRecords(cloudAttendance);
      } else {
        setAttendanceRecords((prev) => (prev.length > 0 ? prev : INITIAL_ATTENDANCE));
      }
    });

    // 6. Real-time News listener
    const unsubNews = subscribeToCollection<NewsArticle>(COLLECTIONS.NEWS, (cloudNews) => {
      if (cloudNews && cloudNews.length > 0) {
        setNewsList(cloudNews);
      }
    });

    // 7. Real-time Online Registrations listener (incoming from remote HP / mobile)
    let isInitialRegsSync = true;
    const unsubRegs = subscribeToCollection<RegistrationRequest>(COLLECTIONS.REGISTRATIONS, (cloudRegs) => {
      if (cloudRegs) {
        setRegistrations((prevRegs) => {
          if (!isInitialRegsSync) {
            const prevIds = new Set(prevRegs.map((r) => r.id));
            const newIncoming = cloudRegs.filter((r) => !prevIds.has(r.id) && r.status === 'MENUNGGU_VERIFIKASI');
            if (newIncoming.length > 0) {
              playNewRegistrationAlertSound();
              setNewRegistrantToast(newIncoming[0]);
            }
          }
          isInitialRegsSync = false;
          return cloudRegs;
        });
      }
    });

    // 9. Real-time Club Settings listener
    const unsubSettings = subscribeToDoc<ClubSettings>(COLLECTIONS.SETTINGS, 'global_settings', (cloudSettings) => {
      if (cloudSettings && cloudSettings.clubName) {
        setClubSettings((prev) => ({ ...prev, ...cloudSettings }));
      }
    });

    // 10. Real-time Users Accounts listener
    const unsubUsers = subscribeToCollection<UserAccount>(COLLECTIONS.USERS, (cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers(cloudUsers);
      }
    });

    // 11. Real-time Payment Proofs listener
    const unsubProofs = subscribeToCollection<PaymentProof>('paymentProofs', (cloudProofs) => {
      if (cloudProofs) {
        setPaymentProofs(cloudProofs);
      }
    });

    // 12. Real-time Cashflow Transactions listener
    const unsubCashflow = subscribeToCollection<CashflowTransaction>(COLLECTIONS.CASHFLOW, (cloudCashflow) => {
      if (cloudCashflow) {
        setCashflowTransactions(cloudCashflow);
      }
    });

    // 13. Real-time Athlete Progress Evaluations listener
    const unsubEvaluations = subscribeToCollection<AthleteProgressEvaluation>(COLLECTIONS.ATHLETE_EVALUATIONS, (cloudEvals) => {
      if (cloudEvals) {
        setSavedEvaluations(cloudEvals);
      }
    });

    return () => {
      unsubAthletes();
      unsubSPP();
      unsubTraining();
      unsubAttendance();
      unsubNews();
      unsubRegs();
      unsubSettings();
      unsubUsers();
      unsubProofs();
      unsubCashflow();
      unsubEvaluations();
    };
  }, []);

  // Handlers for Resetting / Clearing Data
  const handleClearAllClubData = async () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin MENGOSONGKAN seluruh data atlet, pendaftar, dan riwayat pembayaran di Cloud Firestore? Database akan bersih untuk pendaftaran baru jarak jauh.'
      )
    ) {
      try {
        await clearAllAthletesAndRegistrationsCloudData();
        setAthletes([]);
        setRegistrations([]);
        setSppPayments([]);
        setTrainingSessions([]);
        setAttendanceRecords([]);
        setPaymentProofs([]);
        setCashflowTransactions([]);
        setSavedEvaluations([]);
        alert('Berhasil! Seluruh data atlet dan pendaftar telah dikosongkan langsung dari Cloud Firestore.');
      } catch (err) {
        console.error('Failed to clear cloud data:', err);
        alert('Gagal mengosongkan data cloud.');
      }
    }
  };

  // Login & Logout Handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Registration Submission (Public Form)
  const handleSubmitRegistration = (newReg: RegistrationRequest) => {
    setRegistrations([newReg, ...registrations]);
    syncSaveDoc(COLLECTIONS.REGISTRATIONS, newReg);
  };

  // Approve Registration (Admin Action)
  const handleApproveRegistration = (regId: string, memberNo: string) => {
    const reg = registrations.find((r) => r.id === regId);
    if (!reg) return;

    // 1. Update registration status
    const updatedRegItem: RegistrationRequest = {
      ...reg,
      status: 'DISETUJUI' as const,
      assignedMemberNo: memberNo,
      verifiedAt: new Date().toISOString(),
      verifiedBy: currentUser.name,
    };
    const updatedRegs = registrations.map((r) => (r.id === regId ? updatedRegItem : r));
    setRegistrations(updatedRegs);
    syncSaveDoc(COLLECTIONS.REGISTRATIONS, updatedRegItem);

    // 2. Create official Athlete in the club database
    const newAthlete: Athlete = {
      id: `ath-${Date.now()}`,
      memberNo: memberNo,
      name: reg.name,
      nickname: reg.nickname,
      gender: reg.gender,
      nik: reg.nik,
      birthPlace: reg.birthPlace,
      birthDate: reg.birthDate,
      ageCategory: reg.ageCategory,
      division: reg.division,
      phone: reg.phone,
      parentName: reg.parentName,
      parentPhone: reg.parentPhone,
      address: reg.address,
      joinDate: new Date().toISOString().slice(0, 10),
      active: true,
      photoUrl: reg.photoUrl,
      notes: reg.experienceNotes,
      equipment: {
        bowType: reg.division,
        drawWeightLbs: reg.ageCategory === 'U-10' || reg.ageCategory === 'U-12' ? 18 : 26,
        drawLengthInch: 26,
        arrowSpine: '700',
      },
    };

    setAthletes([newAthlete, ...athletes]);
    syncSaveDoc(COLLECTIONS.ATHLETES, newAthlete);

    // 3. Create initial SPP record
    const newPayment: SPPPayment = {
      id: `spp-2026-08-${newAthlete.id}`,
      athleteId: newAthlete.id,
      athleteName: newAthlete.name,
      monthYear: '2026-08',
      amount: clubSettings.defaultMonthlySpp,
      dueDate: '2026-08-10',
      status: 'BELUM_BAYAR',
      createdAt: new Date().toISOString(),
    };
    setSppPayments([newPayment, ...sppPayments]);
    syncSaveDoc(COLLECTIONS.SPP_PAYMENTS, newPayment);

    // 4. Create User Account for the athlete
    const cleanUsername = (reg.nickname || reg.name.split(' ')[0]).toLowerCase().replace(/[^a-z0-9]/g, '');
    const newAccount: UserAccount = {
      id: `usr-${newAthlete.id}`,
      username: `${cleanUsername}_${newAthlete.memberNo.slice(-3).toLowerCase()}`,
      password: 'password123',
      name: newAthlete.name,
      role: 'atlit',
      athleteId: newAthlete.id,
      phone: newAthlete.phone,
      avatar: newAthlete.photoUrl,
    };
    setUsers([...users, newAccount]);
    syncSaveDoc(COLLECTIONS.USERS, newAccount);
  };

  // Reject Registration (Admin Action)
  const handleRejectRegistration = (regId: string, reason: string) => {
    const reg = registrations.find((r) => r.id === regId);
    if (!reg) return;

    const updatedRegItem: RegistrationRequest = {
      ...reg,
      status: 'DITOLAK' as const,
      rejectionReason: reason,
      verifiedAt: new Date().toISOString(),
      verifiedBy: currentUser.name,
    };
    const updatedRegs = registrations.map((r) => (r.id === regId ? updatedRegItem : r));
    setRegistrations(updatedRegs);
    syncSaveDoc(COLLECTIONS.REGISTRATIONS, updatedRegItem);
  };

  const handleDeleteRegistration = (regId: string) => {
    setRegistrations(registrations.filter((r) => r.id !== regId));
    syncDeleteDoc(COLLECTIONS.REGISTRATIONS, regId);
  };

  // Athletes Handlers
  const handleAddAthlete = (newAthlete: Athlete) => {
    setAthletes([newAthlete, ...athletes]);
    syncSaveDoc(COLLECTIONS.ATHLETES, newAthlete);

    const newPayment: SPPPayment = {
      id: `spp-2026-08-${newAthlete.id}`,
      athleteId: newAthlete.id,
      athleteName: newAthlete.name,
      monthYear: '2026-08',
      amount: newAthlete.monthlySppCustomFee ?? clubSettings.defaultMonthlySpp,
      dueDate: '2026-08-10',
      status: newAthlete.monthlySppCustomFee === 0 ? 'BEASISWA' : 'BELUM_BAYAR',
      createdAt: new Date().toISOString(),
    };
    setSppPayments([newPayment, ...sppPayments]);
    syncSaveDoc(COLLECTIONS.SPP_PAYMENTS, newPayment);

    // Create / sync user account with assigned level role (super_admin, admin, pelatih, pelatih_atlit, atlit)
    const roleLevel = newAthlete.userRole || 'atlit';
    const accUsername = newAthlete.username || newAthlete.memberNo.toLowerCase().replace(/[^a-z0-9]/g, '');
    const accPassword = newAthlete.password || (roleLevel === 'super_admin' ? (clubSettings.superAdminPassword || 'senengm4n4h') : 'password123');

    const newUserAcc: UserAccount = {
      id: `usr-${newAthlete.id}`,
      username: accUsername,
      password: accPassword,
      name: newAthlete.name,
      role: roleLevel,
      athleteId: newAthlete.id,
      phone: newAthlete.phone,
      avatar: newAthlete.photoUrl,
    };
    setUsers((prev) => [...prev.filter((u) => u.id !== newUserAcc.id && u.username !== newUserAcc.username), newUserAcc]);
    syncSaveDoc(COLLECTIONS.USERS, newUserAcc);
  };

  const handleUpdateAthlete = (updated: Athlete) => {
    setAthletes(athletes.map((a) => (a.id === updated.id ? updated : a)));
    syncSaveDoc(COLLECTIONS.ATHLETES, updated);

    // Update matching user account
    setUsers((prev) =>
      prev.map((u) => {
        if (u.athleteId === updated.id || u.id === `usr-${updated.id}`) {
          const updatedUser = {
            ...u,
            name: updated.name,
            role: updated.userRole || u.role,
            username: updated.username || u.username,
            password: updated.password || u.password,
            phone: updated.phone,
            avatar: updated.photoUrl,
          };
          syncSaveDoc(COLLECTIONS.USERS, updatedUser);
          return updatedUser;
        }
        return u;
      })
    );
  };

  const handleDeleteAthlete = (id: string) => {
    setAthletes(athletes.filter((a) => a.id !== id));
    syncDeleteDoc(COLLECTIONS.ATHLETES, id);
    syncDeleteDoc(COLLECTIONS.USERS, `usr-${id}`);
  };

  const handleBatchImportAthletes = (importedList: Athlete[]) => {
    setAthletes((prev) => {
      const athleteMap = new Map(prev.map((a) => [a.id, a]));
      importedList.forEach((item) => {
        const existing = prev.find((a) => a.memberNo === item.memberNo || a.id === item.id);
        const finalAthlete: Athlete = existing ? { ...item, id: existing.id } : item;
        athleteMap.set(finalAthlete.id, finalAthlete);
        syncSaveDoc(COLLECTIONS.ATHLETES, finalAthlete);

        // Also create/sync user account
        const roleLevel = finalAthlete.userRole || 'atlit';
        const accUsername = finalAthlete.username || finalAthlete.memberNo.toLowerCase().replace(/[^a-z0-9]/g, '');
        const accPassword = finalAthlete.password || 'password123';

        const userAcc: UserAccount = {
          id: `usr-${finalAthlete.id}`,
          username: accUsername,
          password: accPassword,
          name: finalAthlete.name,
          role: roleLevel,
          athleteId: finalAthlete.id,
          phone: finalAthlete.phone,
          avatar: finalAthlete.photoUrl,
        };
        syncSaveDoc(COLLECTIONS.USERS, userAcc);
      });
      return Array.from(athleteMap.values());
    });
  };

  // SPP Handlers
  const handleUpdatePayment = (updated: SPPPayment) => {
    setSppPayments(sppPayments.map((p) => (p.id === updated.id ? updated : p)));
    syncSaveDoc(COLLECTIONS.SPP_PAYMENTS, updated);
  };

  const handleAddPayment = (newPay: SPPPayment) => {
    setSppPayments((prev) => [newPay, ...prev]);
    syncSaveDoc(COLLECTIONS.SPP_PAYMENTS, newPay);
  };

  // Training Session Handlers
  const handleAddTrainingSession = (newSession: TrainingSession) => {
    setTrainingSessions([newSession, ...trainingSessions]);
    syncSaveDoc(COLLECTIONS.TRAINING_SESSIONS, newSession);
  };

  const handleDeleteTrainingSession = (id: string) => {
    setTrainingSessions(trainingSessions.filter((s) => s.id !== id));
    syncDeleteDoc(COLLECTIONS.TRAINING_SESSIONS, id);
  };

  // Attendance Handlers
  const handleAddAttendanceBatch = (newRecords: AttendanceRecord[]) => {
    const updated = [...attendanceRecords];
    newRecords.forEach((rec) => {
      const idx = updated.findIndex((r) => r.athleteId === rec.athleteId && r.date === rec.date);
      if (idx >= 0) {
        updated[idx] = rec;
      } else {
        updated.unshift(rec);
      }
      syncSaveDoc(COLLECTIONS.ATTENDANCE, rec);
    });
    setAttendanceRecords(updated);
  };

  // News Handlers
  const handleAddNews = (news: NewsArticle) => {
    setNewsList([news, ...newsList]);
    syncSaveDoc(COLLECTIONS.NEWS, news);
  };

  const handleUpdateNews = (updatedNews: NewsArticle) => {
    setNewsList(newsList.map((n) => (n.id === updatedNews.id ? updatedNews : n)));
    syncSaveDoc(COLLECTIONS.NEWS, updatedNews);
  };

  const handleDeleteNews = (id: string) => {
    setNewsList(newsList.filter((n) => n.id !== id));
    syncDeleteDoc(COLLECTIONS.NEWS, id);
  };

  // Payment Proof Handlers
  const handleUploadPaymentProof = (proof: PaymentProof) => {
    setPaymentProofs([proof, ...paymentProofs]);
    syncSaveDoc('paymentProofs', proof);
    const targetPayment = sppPayments.find(
      (p) => p.athleteId === proof.athleteId && p.monthYear === proof.monthYear
    );
    if (targetPayment) {
      handleUpdatePayment({
        ...targetPayment,
        status: 'MENUNGGU_VERIFIKASI',
        proofNote: `Bukti transfer diunggah: ${proof.paymentMethod}`,
        proofImageUrl: proof.proofImageUrl,
      });
    }
  };

  const handleVerifyPaymentProof = (proofId: string, status: 'APPROVED' | 'REJECTED') => {
    const proof = paymentProofs.find((p) => p.id === proofId);
    if (!proof) return;

    const updatedProof: PaymentProof = {
      ...proof,
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser.name,
    };

    const updatedProofs = paymentProofs.map((p) => (p.id === proofId ? updatedProof : p));
    setPaymentProofs(updatedProofs);
    syncSaveDoc('paymentProofs', updatedProof);

    if (status === 'APPROVED') {
      const targetPayment = sppPayments.find(
        (p) => p.athleteId === proof.athleteId && p.monthYear === proof.monthYear
      );
      if (targetPayment) {
        const receiptNum = `KWT/${proof.monthYear.replace('-', '/')}/${String(Math.floor(100 + Math.random() * 900))}`;
        handleUpdatePayment({
          ...targetPayment,
          status: 'LUNAS',
          paidDate: proof.transferDate || new Date().toISOString().slice(0, 10),
          paymentMethod: proof.paymentMethod,
          receiptNumber: receiptNum,
          referenceNo: `VERIFIED-${proof.id.slice(-6)}`,
          recordedBy: currentUser.name,
        });
      }
    } else if (status === 'REJECTED') {
      const targetPayment = sppPayments.find(
        (p) => p.athleteId === proof.athleteId && p.monthYear === proof.monthYear
      );
      if (targetPayment) {
        handleUpdatePayment({
          ...targetPayment,
          status: 'BELUM_BAYAR',
          proofNote: 'Bukti transfer ditolak oleh admin. Silakan kirim ulang.',
        });
      }
    }
  };

  // Cashflow Handlers
  const handleAddCashflow = (trx: CashflowTransaction) => {
    setCashflowTransactions((prev) => [trx, ...prev]);
    syncSaveDoc(COLLECTIONS.CASHFLOW, trx);
  };

  const handleDeleteCashflow = (id: string) => {
    setCashflowTransactions((prev) => prev.filter((t) => t.id !== id));
    syncDeleteDoc(COLLECTIONS.CASHFLOW, id);
  };

  // Athlete Evaluation Handlers (Raport / Penilaian Kemajuan)
  const handleSaveAthleteEvaluation = (evaluation: AthleteProgressEvaluation) => {
    setSavedEvaluations((prev) => {
      const idx = prev.findIndex((e) => e.id === evaluation.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = evaluation;
        return updated;
      }
      return [evaluation, ...prev];
    });
    syncSaveDoc(COLLECTIONS.ATHLETE_EVALUATIONS, evaluation);
  };

  // KTA Status Handlers
  const handleApproveKTA = (athleteId: string, notes?: string) => {
    const target = athletes.find((a) => a.id === athleteId);
    if (target) {
      const updated: Athlete = {
        ...target,
        ktaStatus: 'APPROVED',
        active: true,
        ktaApprovedAt: new Date().toISOString(),
        ktaApprovedBy: currentUser.name,
      };
      handleUpdateAthlete(updated);
    }
  };

  const handleRejectKTA = (athleteId: string, reason?: string) => {
    const target = athletes.find((a) => a.id === athleteId);
    if (target) {
      const updated: Athlete = {
        ...target,
        ktaStatus: 'REJECTED',
        leaveReason: reason,
      };
      handleUpdateAthlete(updated);
    }
  };

  const handleDeactivateKTA = (athleteId: string, reason?: string) => {
    const target = athletes.find((a) => a.id === athleteId);
    if (target) {
      const updated: Athlete = {
        ...target,
        ktaStatus: 'NONAKTIF',
        active: false,
        leaveDate: new Date().toISOString().slice(0, 10),
        leaveReason: reason || 'Anggota Keluar / Nonaktif',
      };
      handleUpdateAthlete(updated);
    }
  };

  const handleReactivateKTA = (athleteId: string) => {
    const target = athletes.find((a) => a.id === athleteId);
    if (target) {
      const updated: Athlete = {
        ...target,
        ktaStatus: 'APPROVED',
        active: true,
        leaveDate: undefined,
        leaveReason: undefined,
      };
      handleUpdateAthlete(updated);
    }
  };

  // Switch role handler
  const handleSwitchUser = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'atlit' && (activeTab === 'ai_coach' || activeTab === 'attendance' || activeTab === 'registrations')) {
      setActiveTab('dashboard');
    }
  };

  // Counters for badges
  const pendingRegistrationsCount = registrations.filter((r) => r.status === 'MENUNGGU_VERIFIKASI').length;
  const pendingProofsCount = paymentProofs.filter((p) => p.status === 'PENDING').length;

  // =========================================================================
  // RENDER 1: PUBLIC / GUEST VIEW (Jika belum login)
  // =========================================================================
  if (!isLoggedIn || !currentUser) {
    return (
      <>
        <PublicGuestView
          clubSettings={clubSettings}
          newsList={newsList}
          users={users}
          registrations={registrations}
          onLogin={handleLogin}
          onSubmitRegistration={handleSubmitRegistration}
          onOpenAndroidInstall={() => setIsAndroidInstallOpen(true)}
        />
        <AndroidInstallModal
          isOpen={isAndroidInstallOpen}
          onClose={() => setIsAndroidInstallOpen(false)}
          deferredPrompt={deferredPrompt}
          onInstallClick={handleTriggerAndroidInstall}
        />
      </>
    );
  }

  // =========================================================================
  // RENDER 2: LOGGED IN SYSTEM (Dengan Menu di Sebelah Kiri / Sidebar)
  // =========================================================================
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Beranda & Pusat Informasi Klub';
      case 'athletes':
        return 'Data Atlet & Kartu Tanda Anggota (KTA)';
      case 'registrations':
        return 'Verifikasi Pendaftar Anggota Baru';
      case 'spp':
        return 'Monitoring SPP & Verifikasi Transfer';
      case 'financial_report':
        return 'Laporan Keuangan & Kas Klub (Harian, Mingguan, Bulanan, Tahunan)';
      case 'athlete_progress':
        return 'Laporan Perkembangan & Raport Atlet (Harian, Mingguan, Bulanan, Tahunan)';
      case 'scoring':
        return 'Scoring & Analisis Latihan Panahan';
      case 'attendance':
        return 'Presensi & Kehadiran Atlet';
      case 'ai_coach':
        return 'AI Coach Evaluator & Form Advisor';
      case 'news':
        return 'Warta & Publikasi Berita Klub';
      case 'member_card':
        return 'Cetak Kartu Tanda Anggota (KTA Digital)';
      default:
        return 'Portal Manajemen Klub Panahan';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* 1. Left Sidebar Navigation (Only visible when logged in) */}
      <SidebarLeft
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        clubSettings={clubSettings}
        pendingRegistrationsCount={pendingRegistrationsCount}
        pendingProofsCount={pendingProofsCount}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenScanKTA={() => setIsScanKTAModalOpen(true)}
        onOpenPaymentProof={() => setIsPaymentProofModalOpen(true)}
        onOpenRoleSwitch={() => setIsLoginModalOpen(true)}
        onOpenDownloadAll={() => setIsDownloadAllOpen(true)}
        onOpenAndroidInstall={() => setIsAndroidInstallOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Wrapper (With responsive left padding for sidebar on large screens) */}
      <div className="lg:pl-72 sm:lg:pl-80 flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Navbar */}
        <HeaderNavbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          clubSettings={clubSettings}
          currentUser={currentUser}
          pendingRegistrationsCount={pendingRegistrationsCount}
          pendingProofsCount={pendingProofsCount}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenRoleLogin={() => setIsLoginModalOpen(true)}
          onOpenMemberCardModal={() => {
            const targetAth = currentUser.athleteId
              ? athletes.find((a) => a.id === currentUser.athleteId)
              : athletes.find((a) => a.name.toLowerCase() === currentUser.name.toLowerCase()) || athletes[0];
            setCardAthlete(targetAth || null);
          }}
          onOpenVerificationModal={() => setIsScanKTAModalOpen(true)}
          onOpenPaymentProofModal={() => setIsPaymentProofModalOpen(true)}
          onOpenDownloadAll={() => setIsDownloadAllOpen(true)}
          onOpenAndroidInstall={() => setIsAndroidInstallOpen(true)}
          onLogout={handleLogout}
        />

        {/* Dynamic Subheader / Page Title */}
        <div className="bg-slate-900/80 backdrop-blur-md border-b border-pink-500/20 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse shrink-0" />
            <h2 className="text-xs sm:text-sm font-extrabold text-white truncate">
              {getTabTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTab === 'athletes' && (
              <button
                onClick={() => setReportAthleteId(athletes[0]?.id || null)}
                className="px-2.5 py-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-bold text-xs rounded-lg shadow-sm"
              >
                Cetak Rapor
              </button>
            )}

            {activeTab === 'registrations' && (
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {pendingRegistrationsCount} Menunggu
              </span>
            )}
          </div>
        </div>

        {/* Main Tab Content */}
        <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto pb-24 lg:pb-12 relative">
          {/* Floating Real-Time Mobile Registration Alert */}
          {newRegistrantToast && (
            <div className="fixed top-16 sm:top-20 right-3 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-24px)] bg-gradient-to-r from-pink-950/95 via-purple-950/95 to-slate-900/95 border-2 border-pink-500 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/30 border border-pink-400 flex items-center justify-center text-pink-300 shrink-0 animate-bounce">
                  <BellRing className="w-5 h-5 text-pink-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-pink-500 text-white tracking-wider animate-pulse">
                      Pendaftar Baru Masuk!
                    </span>
                    <span className="text-[10px] text-pink-300 font-bold">Via Mobile HP</span>
                  </div>
                  <h4 className="text-sm font-black text-white truncate mt-1">
                    {newRegistrantToast.name}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Divisi: <strong className="text-pink-300">{newRegistrantToast.division}</strong> • WA: {newRegistrantToast.phone}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => {
                        setActiveTab('registrations');
                        setNewRegistrantToast(null);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-black shadow-md transition active:scale-95 flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Tinjau & Setujui</span>
                    </button>
                    <button
                      onClick={() => setNewRegistrantToast(null)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setNewRegistrantToast(null)}
                  className="text-slate-400 hover:text-white p-1"
                  title="Tutup Notifikasi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          {activeTab === 'dashboard' && (
            <DashboardView
              athletes={athletes}
              sppPayments={sppPayments}
              trainingSessions={trainingSessions}
              attendanceRecords={attendanceRecords}
              clubSettings={clubSettings}
              currentUser={currentUser}
              newsList={newsList}
              onNavigateTab={setActiveTab}
              onSelectPaymentForReceipt={setActiveReceiptPayment}
              onOpenMemberCardModal={setCardAthlete}
              onOpenVerificationModal={() => setIsScanKTAModalOpen(true)}
              onOpenPaymentProofModal={() => setIsPaymentProofModalOpen(true)}
              onOpenNewsManager={() => setIsNewsManagerOpen(true)}
              onOpenDownloadAll={() => setIsDownloadAllOpen(true)}
            />
          )}

          {activeTab === 'athletes' && (
            <AthletesView
              athletes={athletes}
              currentUser={currentUser}
              clubSettings={clubSettings}
              onAddAthlete={handleAddAthlete}
              onUpdateAthlete={handleUpdateAthlete}
              onDeleteAthlete={handleDeleteAthlete}
              onOpenReportForAthlete={setReportAthleteId}
              onOpenMemberCardModal={setCardAthlete}
              onOpenVerificationModal={() => setIsScanKTAModalOpen(true)}
              onBatchImportAthletes={handleBatchImportAthletes}
            />
          )}

          {activeTab === 'registrations' && (
            <RegistrationsManagerView
              registrations={registrations}
              athletes={athletes}
              currentUser={currentUser}
              onApproveRegistration={handleApproveRegistration}
              onRejectRegistration={handleRejectRegistration}
              onDeleteRegistration={handleDeleteRegistration}
            />
          )}

          {activeTab === 'spp' && (
            <SPPMonitoringView
              sppPayments={sppPayments}
              athletes={athletes}
              clubSettings={clubSettings}
              currentUser={currentUser}
              onUpdatePayment={handleUpdatePayment}
              onAddPayment={handleAddPayment}
              onOpenReceiptModal={setActiveReceiptPayment}
              onOpenPaymentProofModal={() => setIsPaymentProofModalOpen(true)}
            />
          )}

          {activeTab === 'financial_report' && (
            <FinancialReportsView
              sppPayments={sppPayments}
              registrations={registrations}
              cashflowTransactions={cashflowTransactions}
              clubSettings={clubSettings}
              currentUser={currentUser}
              onAddTransaction={handleAddCashflow}
              onDeleteTransaction={handleDeleteCashflow}
            />
          )}

          {activeTab === 'athlete_progress' && (
            <AthleteProgressReportsView
              athletes={athletes}
              trainingSessions={trainingSessions}
              attendanceRecords={attendanceRecords}
              savedEvaluations={savedEvaluations}
              clubSettings={clubSettings}
              currentUser={currentUser}
              onSaveEvaluation={handleSaveAthleteEvaluation}
            />
          )}

          {activeTab === 'scoring' && (
            <TrainingScoringView
              athletes={athletes}
              trainingSessions={trainingSessions}
              currentUser={currentUser}
              onAddTrainingSession={handleAddTrainingSession}
              onDeleteTrainingSession={handleDeleteTrainingSession}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              athletes={athletes}
              attendanceRecords={attendanceRecords}
              onAddAttendanceBatch={handleAddAttendanceBatch}
            />
          )}

          {activeTab === 'ai_coach' && (
            <AICoachEvaluatorView
              athletes={athletes}
              trainingSessions={trainingSessions}
              sppPayments={sppPayments}
              attendanceRecords={attendanceRecords}
            />
          )}

          {activeTab === 'news' && (
            <div className="space-y-6">
              <NewsFeedSection
                newsList={newsList}
                currentUser={currentUser}
                onOpenNewsManager={() => setIsNewsManagerOpen(true)}
              />
            </div>
          )}

          {activeTab === 'member_card' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-2xl border border-pink-500/20">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    {currentUser.role === 'atlit' ? 'Kartu Tanda Anggota (KTA) Digital Anda' : 'Cetak Kartu Tanda Anggota (KTA) Atlet'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {currentUser.role === 'atlit'
                      ? 'Berikut adalah Kartu Tanda Anggota resmi Anda yang dilengkapi QR Barcode verifikasi keaslian sistem.'
                      : 'Pilih atlet untuk melihat atau mencetak KTA Digital lengkap dengan barcode verifikasi.'}
                  </p>
                </div>
              </div>

              {/* Athletes List (Restricted to own profile if role is athlete) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {athletes
                  .filter((ath) => {
                    if (currentUser.role === 'atlit') {
                      return (
                        (currentUser.athleteId && ath.id === currentUser.athleteId) ||
                        (currentUser.name && ath.name.toLowerCase().includes(currentUser.name.toLowerCase())) ||
                        (currentUser.username && ath.name.toLowerCase().includes(currentUser.username.toLowerCase()))
                      );
                    }
                    return true;
                  })
                  .map((ath) => (
                    <div
                      key={ath.id}
                      onClick={() => setCardAthlete(ath)}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={ath.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={ath.name}
                          className="w-10 h-10 rounded-full object-cover border border-pink-500/40"
                        />
                        <div>
                          <h3 className="text-xs font-bold text-white group-hover:text-pink-300">
                            {ath.name}
                          </h3>
                          <p className="text-[10px] font-mono text-pink-400 font-bold">
                            {ath.memberNo}
                          </p>
                          <span className="text-[10px] text-slate-400">{ath.division}</span>
                        </div>
                      </div>
                      <button className="px-2.5 py-1 rounded-lg text-xs font-bold bg-pink-500/10 text-pink-300 border border-pink-500/30">
                        Lihat KTA
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </main>

        {/* 3. Mobile Bottom Navigation Bar for One-Thumb Ergonomics */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
              activeTab === 'dashboard' ? 'text-pink-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Beranda</span>
          </button>

          <button
            onClick={() => setActiveTab('athletes')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
              activeTab === 'athletes' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span>Atlet</span>
          </button>

          {(currentUser.role === 'super_admin' ||
            currentUser.role === 'admin' ||
            currentUser.role === 'pelatih_utama') && (
            <button
              onClick={() => setActiveTab('registrations')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all relative ${
                activeTab === 'registrations' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-5 h-5 mb-0.5" />
              <span>Pendaftar</span>
              {pendingRegistrationsCount > 0 && (
                <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('spp')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
              activeTab === 'spp' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-5 h-5 mb-0.5" />
            <span>SPP</span>
          </button>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold text-slate-400 hover:text-pink-300 transition-all"
          >
            <Menu className="w-5 h-5 mb-0.5 text-pink-400" />
            <span>Menu Lain</span>
          </button>
        </nav>
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      {/* 1. Kuitansi Pembayaran SPP Modal */}
      {activeReceiptPayment && (
        <ReceiptModal
          payment={activeReceiptPayment}
          athlete={athletes.find((a) => a.id === activeReceiptPayment.athleteId)}
          clubSettings={clubSettings}
          onClose={() => setActiveReceiptPayment(null)}
        />
      )}

      {/* 2. Rapor Cetak Perkembangan Atlet Modal */}
      {reportAthleteId && (
        <ReportPrintModal
          athletes={athletes}
          defaultAthleteId={reportAthleteId}
          trainingSessions={trainingSessions}
          attendanceRecords={attendanceRecords}
          sppPayments={sppPayments}
          clubSettings={clubSettings}
          onClose={() => setReportAthleteId(null)}
        />
      )}

      {/* 3. Pengaturan Profil Klub Modal (Super Admin Zou) */}
      <ClubSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        clubSettings={clubSettings}
        currentUser={currentUser}
        onSaveSettings={(newSettings) => {
          setClubSettings(newSettings);
          syncSaveDoc(COLLECTIONS.SETTINGS, newSettings, 'global_settings');
        }}
        onClearAllData={handleClearAllClubData}
      />

      {/* 4. Cetak Kartu Tanda Anggota (KTA) & Barcode */}
      {cardAthlete && (
        <MemberCardModal
          athlete={cardAthlete}
          athletes={athletes}
          clubSettings={clubSettings}
          currentUser={currentUser}
          onClose={() => setCardAthlete(null)}
          onOpenVerification={() => {
            setCardAthlete(null);
            setIsScanKTAModalOpen(true);
          }}
          onApproveKTA={handleApproveKTA}
          onRejectKTA={handleRejectKTA}
          onDeactivateKTA={handleDeactivateKTA}
          onReactivateKTA={handleReactivateKTA}
          onSaveKTASettings={(updatedSettings) => {
            const newClubSettings = { ...clubSettings, ktaSettings: updatedSettings };
            setClubSettings(newClubSettings);
            syncSaveDoc(COLLECTIONS.SETTINGS, newClubSettings, 'global_settings');
          }}
        />
      )}

      {/* 5. Scan Barcode KTA Modal */}
      <ScanKTAModal
        isOpen={isScanKTAModalOpen}
        onClose={() => setIsScanKTAModalOpen(false)}
        athletes={athletes}
        clubSettings={clubSettings}
      />

      {/* 6. Upload & Verifikasi Bukti Pembayaran SPP */}
      <PaymentProofModal
        isOpen={isPaymentProofModalOpen}
        onClose={() => setIsPaymentProofModalOpen(false)}
        currentUser={currentUser}
        athletes={athletes}
        sppPayments={sppPayments}
        paymentProofs={paymentProofs}
        clubSettings={clubSettings}
        onSubmitProof={handleUploadPaymentProof}
        onApproveProof={(proofId) => handleVerifyPaymentProof(proofId, 'APPROVED')}
        onRejectProof={(proofId) => handleVerifyPaymentProof(proofId, 'REJECTED')}
      />

      {/* 7. Switch / Login Modal */}
      <RoleLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        users={users}
        athletes={athletes}
        onSelectUser={handleSwitchUser}
      />

      {/* 8. Kelola Berita Modal */}
      <NewsManagerModal
        isOpen={isNewsManagerOpen}
        onClose={() => setIsNewsManagerOpen(false)}
        currentUser={currentUser}
        newsList={newsList}
        onSaveNews={(article) => {
          const exists = newsList.find((n) => n.id === article.id);
          if (exists) {
            handleUpdateNews(article);
          } else {
            handleAddNews(article);
          }
        }}
        onDeleteNews={handleDeleteNews}
      />

      {/* 9. Download Semua Data dalam 1 Folder (ZIP) & Backup Master */}
      <DownloadAllModal
        isOpen={isDownloadAllOpen}
        onClose={() => setIsDownloadAllOpen(false)}
        athletes={athletes}
        sppPayments={sppPayments}
        trainingSessions={trainingSessions}
        attendanceRecords={attendanceRecords}
        registrations={registrations}
        newsArticles={newsList}
        paymentProofs={paymentProofs}
        cashflowTransactions={cashflowTransactions}
        savedEvaluations={savedEvaluations}
        clubSettings={clubSettings}
        currentUser={currentUser}
        onRestoreData={handleRestoreData}
      />

      {/* 10. Pasang di Android Modal (PWA) */}
      <AndroidInstallModal
        isOpen={isAndroidInstallOpen}
        onClose={() => setIsAndroidInstallOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallClick={handleTriggerAndroidInstall}
      />
    </div>
  );
}
