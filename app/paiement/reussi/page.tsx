

"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function PaiementReussi() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("t") || searchParams.get("transactionId");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      <div className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-white/5 backdrop-blur-xl p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-400/40">
          <span className="text-4xl">✓</span>
        </div>

        <h1 className="text-3xl font-bold text-emerald-400 mb-4">
          Paiement réussi
        </h1>

        <p className="text-gray-300 mb-6">
          Merci pour ta commande. Ton paiement a bien été validé et ta commande
          va être préparée.
        </p>

        {transactionId && (
          <div className="mb-6 rounded-2xl bg-black/40 border border-white/10 p-4">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
              Référence transaction
            </p>
            <p className="text-sm text-gray-200 break-all">{transactionId}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition font-semibold"
          >
            Retour à l’accueil
          </button>

          <button
            onClick={() => router.push("/boutique")}
            className="w-full px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition font-semibold"
          >
            Continuer mes achats
          </button>
        </div>
      </div>
    </div>
  );
}