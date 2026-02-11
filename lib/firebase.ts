import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCn2BL2M5a-3c3JgbyeEQTWwZfwPoBEXx0",
  authDomain: "opochonmagique.firebaseapp.com",
  projectId: "opochonmagique",
  storageBucket: "opochonmagique.firebasestorage.app",
  messagingSenderId: "952596006855",
  appId: "1:952596006855:web:2f520fa71cea3e16af7be2",
};

// Empêche Firebase d'être initialisé plusieurs fois (important avec Next.js)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firestore (base de données)
export const db = getFirestore(app);