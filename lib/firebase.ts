import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDKcYB_T9Tf_gMJ1b4ldaxIaPDVcbv5kBI",
  authDomain: "event-platform-d496c.firebaseapp.com",
  projectId: "event-platform-d496c",
  storageBucket: "event-platform-d496c.firebasestorage.app",
  messagingSenderId: "346618550325",
  appId: "1:346618550325:web:fcb29083bca25cac44397c",
  measurementId: "G-S98HT3C21X",
};

/* ✅ FIX: prevent multiple initialization */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/* EXPORTS */
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);