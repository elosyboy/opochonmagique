

"use client";

import { useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

/* ========= FIREBASE ========= */
const firebaseConfig = {
  apiKey: "AIzaSyCn2BL2M5a-3c3JgbyeEQTWwZfwPoBEXx0",
  authDomain: "opochonmagique.firebaseapp.com",
  projectId: "opochonmagique",
  storageBucket: "opochonmagique.appspot.com",
  messagingSenderId: "952596006855",
  appId: "1:952596006855:web:2f520fa71cea3e16af7be2",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function DeconnexionPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await signOut(auth);
      } finally {
        router.replace("/");
      }
    })();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="border border-black rounded-xl px-8 py-6 font-extrabold text-black">
        Déconnexion…
      </div>
    </main>
  );
}