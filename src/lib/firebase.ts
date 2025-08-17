
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, Firestore, enableNetwork, disableNetwork, terminate, connectFirestoreEmulator, CACHE_SIZE_UNLIMITED, memoryLocalCache } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined' && getApps().length === 0) {
  // We are on the client, initialize the app
  app = initializeApp(firebaseConfig);
  db = initializeFirestore(app, {
    localCache: memoryLocalCache({ cacheSizeBytes: CACHE_SIZE_UNLIMITED }),
  });
  auth = getAuth(app);
} else if (getApps().length > 0) {
  // App is already initialized, get the existing instance
  app = getApp();
  db = getFirestore(app);
  auth = getAuth(app);
} else {
  // We are on the server, initialize a server-side instance
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
}


export { app, db, auth };
