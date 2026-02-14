import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// YOUR Firebase config (kept exactly as you sent)
const firebaseConfig = {
  apiKey: "AIzaSyDKcYB_T9Tf_gMJ1b4ldaxIaPDVcbv5kBI",
  authDomain: "event-platform-d496c.firebaseapp.com",
  projectId: "event-platform-d496c",
  storageBucket: "event-platform-d496c.firebasestorage.app",
  messagingSenderId: "346618550325",
  appId: "1:346618550325:web:fcb29083bca25cac44397c",
  measurementId: "G-S98HT3C21X",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔐 VERY IMPORTANT — this line enables Authentication
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);