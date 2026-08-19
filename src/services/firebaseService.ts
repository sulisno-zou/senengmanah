import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Athlete,
  SPPPayment,
  TrainingSession,
  AttendanceRecord,
  NewsArticle,
  RegistrationRequest,
  ClubSettings,
  UserAccount,
} from '../types';

// Collection references
export const COLLECTIONS = {
  ATHLETES: 'athletes',
  SPP_PAYMENTS: 'sppPayments',
  TRAINING_SESSIONS: 'trainingSessions',
  ATTENDANCE: 'attendanceRecords',
  NEWS: 'clubNews',
  REGISTRATIONS: 'clubRegistrations',
  SETTINGS: 'clubSettings',
  USERS: 'userAccounts',
  CASHFLOW: 'cashflowTransactions',
  ATHLETE_EVALUATIONS: 'athleteEvaluations',
  PROFILE_UPDATES: 'profileUpdateRequests',
};

// Generic subscribe to a collection
export function subscribeToCollection<T>(
  collectionName: string,
  onData: (data: T[]) => void,
  onError?: (err: any) => void
) {
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as T);
        });
        onData(items);
      },
      (error) => {
        console.warn(`Firestore subscription error on ${collectionName}:`, error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn(`Failed to initialize snapshot for ${collectionName}:`, err);
    return () => {};
  }
}

// Single document subscription (e.g. club settings)
export function subscribeToDoc<T>(
  collectionName: string,
  docId: string,
  onData: (data: T | null) => void,
  onError?: (err: any) => void
) {
  try {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onData(snapshot.data() as T);
        } else {
          onData(null);
        }
      },
      (error) => {
        console.warn(`Firestore doc subscription error on ${collectionName}/${docId}:`, error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn(`Failed to subscribe to doc ${collectionName}/${docId}:`, err);
    return () => {};
  }
}

// Save or update document
export async function syncSaveDoc<T extends { id?: string }>(
  collectionName: string,
  item: T,
  customId?: string
) {
  try {
    const id = customId || item.id || doc(collection(db, collectionName)).id;
    const docRef = doc(db, collectionName, id);
    const dataToSave = { ...item, id };
    await setDoc(docRef, dataToSave, { merge: true });
    return id;
  } catch (err) {
    console.error(`Error saving to ${collectionName}:`, err);
    throw err;
  }
}

// Delete document
export async function syncDeleteDoc(collectionName: string, id: string) {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error(`Error deleting from ${collectionName}:`, err);
    throw err;
  }
}

// Seed initial cloud data safely if collections are completely empty
export async function seedInitialCloudDataIfEmpty(initialData: {
  athletes: Athlete[];
  sppPayments: SPPPayment[];
  trainingSessions: TrainingSession[];
  attendanceRecords: AttendanceRecord[];
  news: NewsArticle[];
  registrations: RegistrationRequest[];
  clubSettings: ClubSettings;
  users: UserAccount[];
}) {
  try {
    // 1. Seed Settings if not exists
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'global_settings');
    const settingsSnap = await getDocs(collection(db, COLLECTIONS.SETTINGS));
    if (settingsSnap.empty) {
      await setDoc(settingsRef, initialData.clubSettings, { merge: true });
    }

    // 2. Seed News if not exists
    const newsSnap = await getDocs(collection(db, COLLECTIONS.NEWS));
    if (newsSnap.empty && initialData.news && initialData.news.length > 0) {
      const batch = writeBatch(db);
      initialData.news.forEach((n) => {
        const ref = doc(db, COLLECTIONS.NEWS, n.id);
        batch.set(ref, n);
      });
      await batch.commit();
    }

    // 3. Seed Users if not exists
    const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
    if (usersSnap.empty && initialData.users && initialData.users.length > 0) {
      const batch = writeBatch(db);
      initialData.users.forEach((u) => {
        const ref = doc(db, COLLECTIONS.USERS, u.id);
        batch.set(ref, u);
      });
      await batch.commit();
    }

    // 4. Seed Athletes if not exists
    const athletesSnap = await getDocs(collection(db, COLLECTIONS.ATHLETES));
    if (athletesSnap.empty && initialData.athletes && initialData.athletes.length > 0) {
      const batch = writeBatch(db);
      initialData.athletes.forEach((ath) => {
        const ref = doc(db, COLLECTIONS.ATHLETES, ath.id);
        batch.set(ref, ath);
      });
      await batch.commit();
    }

    // 5. Seed SPP Payments if not exists
    const sppSnap = await getDocs(collection(db, COLLECTIONS.SPP_PAYMENTS));
    if (sppSnap.empty && initialData.sppPayments && initialData.sppPayments.length > 0) {
      const batch = writeBatch(db);
      initialData.sppPayments.forEach((p) => {
        const ref = doc(db, COLLECTIONS.SPP_PAYMENTS, p.id);
        batch.set(ref, p);
      });
      await batch.commit();
    }

    // 6. Seed Training Sessions if not exists
    const trainingSnap = await getDocs(collection(db, COLLECTIONS.TRAINING_SESSIONS));
    if (trainingSnap.empty && initialData.trainingSessions && initialData.trainingSessions.length > 0) {
      const batch = writeBatch(db);
      initialData.trainingSessions.forEach((t) => {
        const ref = doc(db, COLLECTIONS.TRAINING_SESSIONS, t.id);
        batch.set(ref, t);
      });
      await batch.commit();
    }

    // 7. Seed Attendance if not exists
    const attendanceSnap = await getDocs(collection(db, COLLECTIONS.ATTENDANCE));
    if (attendanceSnap.empty && initialData.attendanceRecords && initialData.attendanceRecords.length > 0) {
      const batch = writeBatch(db);
      initialData.attendanceRecords.forEach((a) => {
        const ref = doc(db, COLLECTIONS.ATTENDANCE, a.id);
        batch.set(ref, a);
      });
      await batch.commit();
    }

    // 8. Seed Registrations if not exists
    const regsSnap = await getDocs(collection(db, COLLECTIONS.REGISTRATIONS));
    if (regsSnap.empty && initialData.registrations && initialData.registrations.length > 0) {
      const batch = writeBatch(db);
      initialData.registrations.forEach((r) => {
        const ref = doc(db, COLLECTIONS.REGISTRATIONS, r.id);
        batch.set(ref, r);
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn('Could not auto-seed cloud database (offline or permissions):', err);
  }
}

// Clear / Purge all athlete and registration data from Firestore Cloud
export async function clearAllAthletesAndRegistrationsCloudData() {
  try {
    const collectionsToClear = [
      COLLECTIONS.ATHLETES,
      COLLECTIONS.REGISTRATIONS,
      COLLECTIONS.SPP_PAYMENTS,
      COLLECTIONS.TRAINING_SESSIONS,
      COLLECTIONS.ATTENDANCE,
      'paymentProofs',
    ];

    for (const colName of collectionsToClear) {
      const snap = await getDocs(collection(db, colName));
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.docs.forEach((d) => {
          batch.delete(d.ref);
        });
        await batch.commit();
        console.log(`Successfully purged ${snap.size} documents from Firestore collection: ${colName}`);
      }
    }

    // Clean localStorage
    localStorage.removeItem('senengmanah_athletes');
    localStorage.removeItem('senengmanah_registrations');
    localStorage.removeItem('senengmanah_spp');
    localStorage.removeItem('senengmanah_trainings');
    localStorage.removeItem('senengmanah_attendance');
    localStorage.removeItem('senengmanah_proofs');
    
    return true;
  } catch (err) {
    console.error('Error clearing cloud data:', err);
    throw err;
  }
}
