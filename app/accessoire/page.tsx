"use client";

import React from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Product = {
  id: string;
  name: string;
  price: number;
  tags?: string[];
  description?: string;
  photos?: string[];
};

function getCartCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("cart");
    if (!raw) return 0;
    const items = JSON.parse(raw) as Array<{ qty: number }>;
    return items.reduce((sum, i) => sum + (i.qty || 0), 0);
  } catch {
    return 0;
  }
}

export default function AccessoirePage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selected, setSelected] = React.useState<Product | null>(null);
  const [photoIndex, setPhotoIndex] = React.useState(0);
  const [qty, setQty] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [cartCount, setCartCount] = React.useState(0);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const q = query(
        collection(db, "products"),
        where("category", "in", ["accessoire", "accessoires"])
      );
      const snap = await getDocs(q);
      setProducts(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Product, "id">),
        }))
      );
      setLoading(false);
    }
    load();
  }, []);

  React.useEffect(() => {
    setCartCount(getCartCount());
    const onStorage = () => setCartCount(getCartCount());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);


  return (
    <main className="min-h-screen bg-white text-emerald-950">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/fond.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 via-emerald-950/30 to-white" />

        <header className="relative z-10 mx-auto max-w-6xl px-6 pt-6">
          <div className="flex items-center justify-between rounded-3xl bg-white/10 border border-white/20 backdrop-blur px-4 py-3">
            <img src="/assets/accessoire.png" className="h-11 w-11" />

            <div className="text-center">
              <div className="text-white font-extrabold text-lg">
                Opochon Magique
              </div>
              <div className="text-white/80 text-xs tracking-[0.35em] uppercase">
                CBD Premium
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/">
                <span className="text-white text-sm font-semibold hover:underline">
                  Retour
                </span>
              </Link>
              <Link
                href="/panier"
                className="relative grid place-items-center h-11 w-11 rounded-2xl bg-white/10 border border-white/20 backdrop-blur hover:bg-white/15 transition"
              >
                <img src="/assets/panier.png" className="h-7 w-7 object-contain" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 rounded-full bg-white text-emerald-950 text-[11px] font-black px-2 py-0.5 shadow">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-xl">
            Accessoires CBD
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-white/90 text-lg sm:text-xl leading-relaxed drop-shadow">
            Tous les accessoires essentiels pour accompagner votre expérience CBD.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        {loading && <div className="text-emerald-900/60">Chargement…</div>}

        {!loading && products.length === 0 && (
          <div className="text-emerald-900/60">
            Aucun produit disponible pour le moment.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelected(p);
                setPhotoIndex(0);
                setQty(1);
              }}
              className="relative rounded-3xl bg-white border border-emerald-900/10 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 text-left overflow-hidden"
            >
              <div className="p-4 bg-gradient-to-b from-emerald-50 to-white">
                <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-white">
                  <img
                    src={p.photos?.[0] || '/assets/placeholder.png'}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="p-4">
                <div className="font-extrabold text-[15px] leading-tight line-clamp-1">
                  {p.name}
                </div>
                <div className="mt-1 text-sm font-black text-emerald-700">
                  {p.price.toFixed(2)} €
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Modal Product */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelected(null)}
          />

          <div className="relative w-full max-w-4xl rounded-3xl bg-white p-6 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col justify-between">
              <div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <h2 className="text-xl font-extrabold">{selected.name}</h2>
                  <button
                    onClick={() => setSelected(null)}
                    className="rounded-full border px-3 py-1 text-sm font-extrabold hover:bg-emerald-50"
                  >
                    Fermer
                  </button>
                </div>
                <div className="mt-1 text-lg font-black text-emerald-700">
                  {selected.price.toFixed(2)} €
                </div>

                <p className="mt-3 text-emerald-900/70 text-sm">
                  {selected.description || "Description à venir."}
                </p>

                <div className="mt-4 flex items-center gap-4">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="h-10 w-10 rounded-full border text-xl font-bold"
                  >
                    −
                  </button>

                  <span className="font-extrabold text-lg">{qty}</span>

                  <button
                    onClick={() => setQty(qty + 1)}
                    className="h-10 w-10 rounded-full border text-xl font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (selected.price == null) return;

                    const raw = localStorage.getItem("cart");
                    const cart = raw ? JSON.parse(raw) : [];

                    const key = `accessoire:${selected.id}:${selected.price}`;

                    const idx = cart.findIndex((x: any) => x.key === key);

                    if (idx >= 0) {
                      cart[idx].qty = (cart[idx].qty || 0) + qty;
                    } else {
                      cart.push({
                        key,
                        category: "accessoire",
                        productId: selected.id,
                        name: selected.name,
                        photo: selected.photos?.[0] || null,
                        price: Number(selected.price),
                        grams: "—",
                        qty,
                        addedAt: Date.now(),
                      });
                    }

                    localStorage.setItem("cart", JSON.stringify(cart));
                    window.dispatchEvent(new Event("storage"));
                    setSelected(null);
                  }}
                  className="mt-6 w-full rounded-2xl bg-emerald-600 text-white py-3 font-extrabold hover:opacity-95 transition"
                >
                  Ajouter au panier
                </button>
              </div>
            </div>

            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
              <img
                src={selected.photos?.[photoIndex] || "/assets/placeholder.png"}
                alt={selected.name}
                className="h-full w-full object-cover"
              />

              {selected.photos && selected.photos.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setPhotoIndex(
                        photoIndex === 0
                          ? (selected.photos?.length ?? 1) - 1
                          : photoIndex - 1
                      )
                    }
                    className="absolute left-0 top-1/2 -translate-y-1/2 px-3 text-2xl font-bold text-emerald-600"
                  >
                    ‹
                  </button>

                  <button
                    onClick={() =>
                      setPhotoIndex(
                        photoIndex === (selected.photos?.length ?? 1) - 1
                          ? 0
                          : photoIndex + 1
                      )
                    }
                    className="absolute right-0 top-1/2 -translate-y-1/2 px-3 text-2xl font-bold text-emerald-600"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}