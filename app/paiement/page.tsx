"use client";

import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function PaiementPage() {
  const router = useRouter();

  const handlePayment = async () => {
    try {
      await addDoc(collection(db, "orders"), {
        status: "pending",
        paymentMethod: "card",
        createdAt: serverTimestamp(),
      });

      alert("Commande enregistrée dans Firebase !");
    } catch (error) {
      console.error("Erreur Firebase:", error);
      alert("Erreur lors de l'enregistrement de la commande.");
    }
  };

  const simulatePayment = async (deliveryMethod: string) => {
    try {
      await addDoc(collection(db, "orders"), {
        status: "paid",
        paymentMethod: "simulation",
        deliveryMethod: deliveryMethod,
        simulated: true,
        createdAt: serverTimestamp(),
      });

      alert("Paiement simulé enregistré dans Firebase !");
    } catch (error) {
      console.error("Erreur Firebase:", error);
      alert("Erreur lors de la simulation du paiement.");
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-3xl shadow-xl border border-gray-200 p-8">
        <h1 className="text-3xl font-extrabold text-center mb-6">
          Paiement sécurisé
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Vérifiez votre commande puis procédez au paiement.
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={handlePayment}
            className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-700 transition"
          >
            Payer par carte
          </button>

          <button
            className="w-full py-4 rounded-2xl bg-black text-white font-bold text-lg hover:opacity-90 transition"
          >
            Apple Pay
          </button>

          <button
            onClick={() => router.back()}
            className="w-full py-4 rounded-2xl border border-gray-300 font-semibold hover:bg-gray-50 transition"
          >
            Retour au panier
          </button>
        </div>
      </div>
    </main>
  );
}