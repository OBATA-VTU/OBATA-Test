import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Helper to safely get environment variables
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return import.meta.env?.[key] || '';
  } catch (e) {
    return '';
  }
};

const apiKey = getEnv('VITE_FIREBASE_API_KEY');

let app: any;
let auth: Auth;
let db: Firestore;
let googleProvider: GoogleAuthProvider;
export const isFirebaseInitialized = !!(apiKey && apiKey.length > 0);

if (isFirebaseInitialized) {
    const firebaseConfig = {
      apiKey: apiKey,
      authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
      projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
      storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
      appId: getEnv('VITE_FIREBASE_APP_ID'),
      measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID')
    };

    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        googleProvider = new GoogleAuthProvider();
    } catch (e) {
        console.error("Firebase Initialization Error:", e);
        // Fallback to mocks if initialization throws despite having a key (e.g. invalid key format)
        app = {} as any;
        auth = {} as any;
        db = {} as any;
        googleProvider = {} as any;
    }
} else {
    console.warn("VITE_FIREBASE_API_KEY is missing. App running in offline/mock mode.");
    
    // Create dummy objects to satisfy exports and prevent crash on load.
    // Note: Calling SDK functions on these will fail, but components are wrapped in try/catch or bypass logic.
    app = {} as any;
    auth = {} as any;
    db = {} as any; 
    googleProvider = {} as any;
}

export { auth, db, googleProvider };
export default app;