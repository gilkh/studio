
'use client';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: 'tradecraft-5c8mv',
  appId: '1:864853702730:web:e03190ceafd4278dfd8eb3',
  storageBucket: 'tradecraft-5c8mv.firebasestorage.app',
  apiKey: 'AIzaSyCRM1IeOKLecBUl10L4XNPU9lWjuf2_TyA',
  authDomain: 'tradecraft-5c8mv.firebaseapp.com',
  messagingSenderId: '864853702730',
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
