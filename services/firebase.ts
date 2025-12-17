import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { config } from '../config';

// Production Ready: Strict check for configuration
const isConfigured = !!config.firebase.apiKey;

if (!isConfigured) {
  console.error('Firebase configuration is missing. Please check your environment variables.');
}

const app = initializeApp(config.firebase);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Export initialized instances
export { app, auth, db, storage, googleProvider };
// Deprecate isFirebaseInitialized check as we enforce config or fail
export const isFirebaseInitialized = true;