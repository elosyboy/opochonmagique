"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import "@/lib/firebase";

export default function ProfilPage() {
  const [user, setUser] = useState(null as any);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isAdult, setIsAdult] = useState(false);
  const [promo, setPromo] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // 🔹 Load promo code
        const promoRef = doc(db, "promo_codes", currentUser.uid);
        const promoSnap = await getDoc(promoRef);
        if (promoSnap.exists()) {
          setPromo(promoSnap.data().code);
        }

        // 🔹 Load orders
        const q = query(
          collection(db, "orders"),
          where("userId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const ordersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function signIn() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      alert(error.message);
    }
  }

  async function signUp() {
    if (!isAdult) {
      alert("Vous devez certifier avoir plus de 18 ans.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      alert(error.message);
    }
  }

  async function resetPassword() {
    if (!email) {
      alert("Entrez votre email");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Email de réinitialisation envoyé");
    } catch (error: any) {
      alert(error.message);
    }
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  if (loading) return <div className="min-h-screen w-full bg-white p-6 text-black">Chargement...</div>;

  if (!user) {
    return (
      <main className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-6">
        <img
          src="/assets/feuille.png"
          alt="Feuille"
          className="w-48 mb-6"
        />
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border-2 border-black">
          <h2 className="text-xl font-extrabold mb-4 text-center text-black">
            {isRegister ? "Inscription" : "Connexion"}
          </h2>

          <input
            className="w-full mb-3 bg-white text-black border-2 border-black rounded-xl px-4 py-2 placeholder-gray-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full mb-3 bg-white text-black border-2 border-black rounded-xl px-4 py-2 placeholder-gray-500"
            placeholder="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {isRegister && (
            <label className="flex items-center gap-2 mb-3 text-sm text-black">
              <input
                type="checkbox"
                checked={isAdult}
                onChange={(e) => setIsAdult(e.target.checked)}
              />
              Je certifie avoir plus de 18 ans
            </label>
          )}

          <button
            onClick={isRegister ? signUp : signIn}
            className="w-full bg-black text-white border-2 border-green-500 rounded-xl py-2 font-bold"
          >
            {isRegister ? "Créer mon compte" : "Se connecter"}
          </button>

          {!isRegister && (
            <button
              onClick={resetPassword}
              className="w-full text-sm mt-2 text-black font-semibold"
            >
              Mot de passe oublié ?
            </button>
          )}

          <button
            onClick={() => setIsRegister(!isRegister)}
            className="w-full text-sm mt-4 text-black font-semibold"
          >
            {isRegister
              ? "Déjà un compte ? Se connecter"
              : "Pas de compte ? S’inscrire"}
          </button>

          {isRegister && (
            <div className="mt-4 text-center text-sm text-green-600 font-semibold">
              🎁 -10% sur votre première commande
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-white p-6">
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        <img
          src="/assets/feuille.png"
          alt="Feuille"
          className="w-28 mb-4"
        />
        <h1 className="text-2xl font-semibold text-black tracking-wide">
          O Pochon Magique
        </h1>
      </div>

      {/* Profile card */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
        <div className="text-sm text-gray-600 mb-1">Compte client</div>
        <div className="text-base font-medium text-black">{user.email}</div>
      </div>

      {/* Promo code */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
        <div className="text-sm text-gray-600 mb-1">Code promo</div>
        <div className="text-xl font-semibold text-black">
          {promo ?? "Aucun code pour le moment"}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => window.history.back()}
          className="flex-1 border border-gray-400 rounded-lg py-3 text-black font-medium"
        >
          ← Retour
        </button>

        <button
          onClick={logout}
          className="flex-1 border border-gray-400 rounded-lg py-3 text-black font-medium"
        >
          Se déconnecter
        </button>
      </div>

      {/* Orders disabled for now */}
      <div className="text-sm text-gray-400 text-center">
        Les commandes apparaîtront ici après vos premiers achats.
      </div>
    </main>
  );
}