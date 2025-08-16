
'use client';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, initializeFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  projectId: 'tradecraft-5c8mv',
  appId: '1:864853702730:web:e03190ceafd4278dfd8eb3',
  storageBucket: 'tradecraft-5c8mv.firebasestorage.app',
  apiKey: 'AIzaSyCRM1IeOKLecBUl10L4XNPU9lWjuf2_TyA',
  authDomain: 'tradecraft-5c8mv.firebaseapp.com',
  messagingSenderId: '864853702730',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Initialize Firebase
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

try {
    db = initializeFirestore(app, {
        localCache: enableIndexedDbPersistence({
            forceOwnership: true,
        })
    });
} catch (e) {
    // This can happen in server-side rendering, we can fallback to just getFirestore()
    // or handle it gracefully. For this prototype, we get the instance without persistence.
    console.warn("Could not enable offline persistence. This is expected on the server.", e);
    db = getFirestore(app);
}


auth = getAuth(app);

export { app, db, auth };
