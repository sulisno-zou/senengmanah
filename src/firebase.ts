/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore } from 'firebase/firestore';

// Self-contained Firebase Web configuration for the user's Google Project & Cloud Firestore Database
// Directly works out-of-the-box on Vercel, Netlify, Cloud Run, GitHub Pages, or local development.
export const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0615235275',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:323139544456:web:aaae149c6911cc0f2d063d',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC6gtjC0mUqKwp_cwoNuige2zTLn0eDvgk',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'gen-lang-client-0615235275.firebaseapp.com',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'gen-lang-client-0615235275.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '323139544456',
};

// Target Cloud Firestore Database ID for this applet
export const FIRESTORE_DATABASE_ID =
  import.meta.env.VITE_FIREBASE_DATABASE_ID ||
  'ai-studio-sistempemantauan-ba428582-d107-4c57-882a-eea2a319c57e';

// Initialize or reuse Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore database instance with auto-detect long-polling enabled
// for robust connectivity in iframes, mobile networks, and cloud deployments
const dbId =
  FIRESTORE_DATABASE_ID && FIRESTORE_DATABASE_ID !== '(default)'
    ? FIRESTORE_DATABASE_ID
    : undefined;

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    dbId
  );
} catch (e) {
  // If already initialized, retrieve existing instance
  firestoreInstance = getFirestore(app, dbId);
}

export const db = firestoreInstance;

export default db;
