
"use client";
export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ========= TYPES ========= */
type Product = {
  id: string;
  name: string;
  category: string;
  description?: string;
  photos?: string[];
  price?: number;
  priceByGrams?: { grams: string; price: string }[];
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

  const categoryUsesGrams = (category: string) =>
    category === "fleur" || category === "resine";

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
    const usesGrams = categoryUsesGrams(p.category);

    setEditing(p);
    setForm({
      name: p.name || "",
      category: p.category || "",
      description: p.description || "",
      price: !usesGrams ? p.price || "" : "",
      priceByGrams:
        usesGrams && p.priceByGrams && p.priceByGrams.length > 0
          ? p.priceByGrams.map((row) => ({
              grams: row.grams || "",
              price: row.price || "",
            }))
          : [{ grams: "", price: "" }],
      promo: p.promo || false,
      promoPrice: p.promoPrice || "",
      bestSeller: p.bestSeller || false,
    });
  }

  async function saveProduct() {
    if (!editing) return;

    const usesGrams = categoryUsesGrams(form.category);
    const cleanedPriceByGrams = usesGrams
      ? (form.priceByGrams || []).filter(
          (row: { grams: string; price: string }) =>
            String(row.grams || "").trim() !== "" &&
            String(row.price || "").trim() !== ""
        )
      : [];

    await updateDoc(doc(db, "products", editing.id), {
      name: form.name,
      category: form.category,
      description: form.description || "",
      price: !usesGrams && form.price !== "" ? Number(form.price) : null,
      priceByGrams: usesGrams ? cleanedPriceByGrams : [],
      promo: form.promo,
      promoPrice: form.promo ? Number(form.promoPrice) : null,
      bestSeller: form.bestSeller,
    });

    setEditing(null);
    loadProducts();
  }
  function updatePriceRow(index: number, field: "grams" | "price", value: string) {
    setForm((prev: any) => {
      const nextRows = [...(prev.priceByGrams || [])];
      nextRows[index] = {
        ...(nextRows[index] || { grams: "", price: "" }),
        [field]: value,
      };
      return { ...prev, priceByGrams: nextRows };
    });
  }

  function addPriceRow() {
    setForm((prev: any) => ({
      ...prev,
      priceByGrams: [...(prev.priceByGrams || []), { grams: "", price: "" }],
    }));
  }

  function removePriceRow(index: number) {
    setForm((prev: any) => {
      const currentRows = [...(prev.priceByGrams || [])];
      const nextRows = currentRows.filter((_: any, i: number) => i !== index);
      return {
        ...prev,
        priceByGrams: nextRows.length > 0 ? nextRows : [{ grams: "", price: "" }],
      };
    });
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
                  <div className="text-sm capitalize">{p.category}</div>
                  {p.description && (
                    <div className="text-sm mt-2 text-black/70">{p.description}</div>
                  )}
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

                <div className="text-sm space-y-1">
                  {Array.isArray(p.priceByGrams) && p.priceByGrams.length > 0 ? (
                    <div className="space-y-1">
                      {p.priceByGrams.map((row, index) => (
                        <div key={index} className="flex justify-between gap-3 border-b border-black/10 pb-1">
                          <span>{row.grams} g</span>
                          <span>{row.price} €</span>
                        </div>
                      ))}
                    </div>
                  ) : p.price ? (
                    <div>
                      Prix : <span className="font-semibold">{p.price} €</span>
                    </div>
                  ) : null}
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
            <textarea
              value={form.description || ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full border border-black rounded-xl px-4 py-2 min-h-[120px]"
              placeholder="Description"
            />

            <select
              value={form.category}
              onChange={(e) => {
                const nextCategory = e.target.value;
                setForm({
                  ...form,
                  category: nextCategory,
                  price:
                    nextCategory === "fleur" || nextCategory === "resine"
                      ? ""
                      : form.price,
                  priceByGrams:
                    nextCategory === "fleur" || nextCategory === "resine"
                      ? form.priceByGrams?.length
                        ? form.priceByGrams
                        : [{ grams: "", price: "" }]
                      : [],
                });
              }}
              className="w-full border border-black rounded-xl px-4 py-2"
            >
              <option value="fleur">Fleur</option>
              <option value="resine">Résine</option>
              <option value="puff">Puff</option>
              <option value="huile">Huile</option>
              <option value="accessoire">Accessoire</option>
            </select>

            {categoryUsesGrams(form.category) ? (
              <div className="space-y-3">
                <div className="font-semibold">Prix par grammes</div>

                {(form.priceByGrams || []).map(
                  (row: { grams: string; price: string }, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="number"
                        value={row.price}
                        onChange={(e) =>
                          updatePriceRow(index, "price", e.target.value)
                        }
                        className="flex-1 border border-black rounded-xl px-4 py-2"
                        placeholder="Prix"
                      />
                      <input
                        type="number"
                        value={row.grams}
                        onChange={(e) =>
                          updatePriceRow(index, "grams", e.target.value)
                        }
                        className="flex-1 border border-black rounded-xl px-4 py-2"
                        placeholder="Gramme"
                      />
                      <button
                        type="button"
                        onClick={() => removePriceRow(index)}
                        className="border border-black rounded-xl px-3 py-2 font-semibold"
                      >
                        −
                      </button>
                    </div>
                  )
                )}

                <button
                  type="button"
                  onClick={addPriceRow}
                  className="w-full border border-black rounded-xl py-2 font-semibold"
                >
                  Ajouter une ligne prix / gramme
                </button>
              </div>
            ) : (
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-black rounded-xl px-4 py-2"
                placeholder="Prix"
              />
            )}

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