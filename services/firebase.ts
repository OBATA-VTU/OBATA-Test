import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { config } from '../config';

const isConfigured = !!config.firebase.apiKey;

let app;
let auth;
let db;
let storage;
let googleProvider;

if (isConfigured) {
  try {
    app = initializeApp(config.firebase);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn('Firebase keys missing. Running in mock/offline mode.');
  // Mock objects to prevent crash during development
  app = {} as any;
  auth = {} as any;
  db = {} as any;
  storage = {} as any;
  googleProvider = {} as any;
}

const isFirebaseInitialized = isConfigured;

export { app, auth, db, storage, googleProvider, isFirebaseInitialized };