

"use client";

import { useRouter } from "next/navigation";

export default function PaiementEchec() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      <h1 className="text-3xl font-bold text-red-500 mb-4">
        Paiement échoué ❌
      </h1>

      <p className="text-center text-gray-300 mb-6 max-w-md">
        Le paiement n’a pas pu être finalisé. Vérifie tes informations ou
        réessaie avec un autre moyen de paiement.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => router.push("/panier")}
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 transition font-semibold"
        >
          Retour au panier
        </button>

        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-800 transition font-semibold"
        >
          Accueil
        </button>
      </div>
    </div>
  );
}