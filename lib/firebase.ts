import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCn2BL2M5a-3c3JgbyeEQTWwZfwPoBEXx0",
  authDomain: "opochonmagique.firebaseapp.com",
  projectId: "opochonmagique",
  storageBucket: "opochonmagique.firebasestorage.app",
  messagingSenderId: "952596006855",
  appId: "1:952596006855:web:2f520fa71cea3e16af7be2",
};

// 🔥 PROTECTION ANTI DOUBLE INIT (OK)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Exports
export const db = getFirestore(app);
export const auth = getAuth(app);