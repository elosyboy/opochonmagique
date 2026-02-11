"use client";

import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export const dynamic = "force-dynamic";

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