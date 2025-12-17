
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { config } from '../config';

const isConfigured = !!config.firebase.apiKey;

let app;
let auth: any = null;
let db: any = null;
let storage: any = null;
// Fix: Initialize googleProvider
let googleProvider: any = null;

if (isConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(config.firebase);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    // Fix: Instantiate GoogleAuthProvider
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
} else {
  console.warn('Firebase configuration is missing. Auth-dependent features will be disabled.');
}

// Fix: Export googleProvider
export { auth, db, storage, googleProvider };
export const isFirebaseInitialized = isConfigured;
