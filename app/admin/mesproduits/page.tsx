"use client";

import React from "react";
import Link from "next/link";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

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
const db = getFirestore(app);

/* ========= TYPES ========= */
type Product = {
  id: string;
  name: string;
  category: string;
  description?: string;
  photos?: string[];
  price?: number;
  promo?: boolean;
  promoPrice?: number;
  bestSeller?: boolean;
};

/* ========= PAGE ========= */
export default function MesProduitsPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [filterCategory, setFilterCategory] = React.useState("");

  const [editing, setEditing] = React.useState<Product | null>(null);
  const [form, setForm] = React.useState<any>({});

  async function loadProducts() {
    setLoading(true);
    const snap = await getDocs(collection(db, "products"));
    const list = snap.docs.map(
      (d) => ({ id: d.id, ...(d.data() as any) }) as Product
    );
    setProducts(list);
    setLoading(false);
  }

  async function removeProduct(id: string) {
    if (!confirm("Supprimer ce produit ?")) return;
    await deleteDoc(doc(db, "products", id));
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function editProduct(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category,
      price: p.price || "",
      promo: p.promo || false,
      promoPrice: p.promoPrice || "",
      bestSeller: p.bestSeller || false,
    });
  }

  async function saveProduct() {
    if (!editing) return;

    await updateDoc(doc(db, "products", editing.id), {
      name: form.name,
      category: form.category,
      price: form.price ? Number(form.price) : null,
      promo: form.promo,
      promoPrice: form.promo ? Number(form.promoPrice) : null,
      bestSeller: form.bestSeller,
    });

    setEditing(null);
    loadProducts();
  }

  React.useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter((p) => {
    if (filterCategory && p.category !== filterCategory) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-black">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-2xl font-extrabold">Mes produits</h1>
        <Link href="/admin" className="underline font-semibold">
          ← Retour admin
        </Link>
      </header>

      {/* FILTRES */}
      <section className="max-w-6xl mx-auto border border-black rounded-xl p-6 mb-10">
        <h2 className="font-extrabold mb-4">Filtres</h2>

        <div className="flex flex-wrap gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-black rounded-xl px-4 py-2 text-black"
          >
            <option value="">Toutes catégories</option>
            <option value="fleur">Fleur</option>
            <option value="resine">Résine</option>
            <option value="puff">Puff</option>
            <option value="huile">Huile</option>
            <option value="accessoire">Accessoire</option>
          </select>
        </div>
      </section>

      {/* LISTE */}
      <section className="max-w-6xl mx-auto">
        {loading ? (
          <div>Chargement…</div>
        ) : filtered.length === 0 ? (
          <div>Aucun produit.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="border border-black rounded-xl p-5 flex flex-col gap-4"
              >
                {p.photos?.[0] && (
                  <img
                    src={p.photos[0]}
                    alt={p.name}
                    className="h-40 w-full object-cover rounded-lg"
                  />
                )}

                <div>
                  <div className="font-extrabold">{p.name}</div>
                  <div className="text-sm">{p.category}</div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {p.bestSeller && (
                    <span className="border border-black px-2 py-1 text-xs font-bold">
                      Best seller
                    </span>
                  )}
                  {p.promo && (
                    <span className="border border-black px-2 py-1 text-xs font-bold">
                      Promo
                    </span>
                  )}
                </div>

                <div className="flex gap-3 mt-auto">
                  <button
                    className="flex-1 border border-black rounded-xl py-2 font-semibold"
                    onClick={() => editProduct(p)}
                  >
                    Modifier
                  </button>
                  <button
                    className="flex-1 border border-black rounded-xl py-2 font-semibold"
                    onClick={() => removeProduct(p.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-extrabold text-xl">Modifier le produit</h2>

            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-black rounded-xl px-4 py-2"
              placeholder="Nom"
            />

            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-black rounded-xl px-4 py-2"
            >
              <option value="fleur">Fleur</option>
              <option value="resine">Résine</option>
              <option value="puff">Puff</option>
              <option value="huile">Huile</option>
              <option value="accessoire">Accessoire</option>
            </select>

            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border border-black rounded-xl px-4 py-2"
              placeholder="Prix"
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.promo}
                onChange={(e) => setForm({ ...form, promo: e.target.checked })}
              />
              Produit en promotion
            </label>

            {form.promo && (
              <input
                type="number"
                value={form.promoPrice}
                onChange={(e) =>
                  setForm({ ...form, promoPrice: e.target.value })
                }
                className="w-full border border-black rounded-xl px-4 py-2"
                placeholder="Prix promo"
              />
            )}

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.bestSeller}
                onChange={(e) =>
                  setForm({ ...form, bestSeller: e.target.checked })
                }
              />
              Afficher sur la page d’accueil (Best seller)
            </label>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 border border-black rounded-xl py-2 font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={saveProduct}
                className="flex-1 bg-black text-white rounded-xl py-2 font-semibold"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}