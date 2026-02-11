"use client";

import React from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Puff = {
  id: string;
  name: string;
  photos?: string[];
  description?: string;
  flavors?: string[];
  price: number;
};

const FLAVORS = [
  "menthe",
  "menthe glaciale",
  "fraise",
  "fruits rouges",
  "mangue",
  "ananas",
  "citron",
  "cola",
  "bubble gum",
  "pêche",
  "pastèque",
  "vanille",
  "coco",
  "energy",
  "raisin",
  "framboise",
  "myrtille",
  "kiwi",
  "banane",
  "pomme",
  "cerise",
  "orange",
  "tropical",
];

export default function PuffPage() {
  const [puffs, setPuffs] = React.useState<Puff[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [selectedFlavor, setSelectedFlavor] = React.useState<string | null>(null);
  const [showFlavor, setShowFlavor] = React.useState(false);

  const [selected, setSelected] = React.useState<Puff | null>(null);
  const [qty, setQty] = React.useState(1);

  const [cartCount, setCartCount] = React.useState(0);

  const [photoIndex, setPhotoIndex] = React.useState(0);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const q = query(
        collection(db, "products"),
        where("category", "in", ["puff", "puffs"])
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Puff, "id">) }));
      setPuffs(list);
      setLoading(false);
    }
    load();
  }, []);

  React.useEffect(() => {
    const getCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        return cart.reduce((sum: number, i: any) => sum + (i.qty || 1), 0);
      } catch {
        return 0;
      }
    };

    setCartCount(getCartCount());
    const onStorage = () => setCartCount(getCartCount());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filtered = selectedFlavor
    ? puffs.filter((p) =>
        Array.isArray(p.flavors) &&
        p.flavors.map((f) => f.toLowerCase()).includes(selectedFlavor.toLowerCase())
      )
    : puffs;

  function openProduct(p: Puff) {
    setSelected(p);
    setQty(1);
    setPhotoIndex(0);
  }


  return (
    <main className="min-h-screen bg-white text-emerald-950">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/fond.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 via-emerald-950/30 to-white" />

        <header className="relative z-10 mx-auto max-w-6xl px-6 pt-6">
          <div className="flex items-center justify-between rounded-3xl bg-white/10 border border-white/20 backdrop-blur px-4 py-3">
            <img src="/assets/puff.png" className="h-11 w-11" />

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
              <Link href="/panier" className="relative">
                <div className="h-11 w-11 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <img src="/assets/panier.png" className="h-6 w-6" />
                </div>

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-600 text-white text-xs font-extrabold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-xl">
            Puffs
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-white/90 text-lg sm:text-xl leading-relaxed drop-shadow">
            Un maximum de goûts, un prix attractif, et une sélection de puffs pensée pour tous les profils.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10 flex justify-center">
        <button
          onClick={() => setShowFlavor(true)}
          className="rounded-full bg-white px-12 py-3 font-extrabold border hover:bg-emerald-50 transition"
        >
          Goûts
        </button>
      </div>

      {/* Tous les produits */}
      <section className="mx-auto max-w-6xl px-6 pb-14">
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => openProduct(p)}
                className="relative rounded-3xl bg-white border border-emerald-900/10 shadow-sm hover:shadow-xl transition overflow-hidden text-left flex flex-col"
              >
                <div className="aspect-square w-full bg-emerald-50 overflow-hidden">
                  <img
                    src={p.photos?.[0] || "/assets/placeholder.png"}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <div className="font-bold text-sm">{p.name}</div>
                  <div className="text-xs text-emerald-900/70">{p.price.toFixed(2)} €</div>
                  {p.flavors?.length ? (
                    <div className="mt-1 text-xs text-emerald-900/60">
                      {p.flavors.slice(0, 2).join(" • ")}
                      {p.flavors.length > 2 ? "…" : ""}
                    </div>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Bottom sheet GOÛTS */}
      {showFlavor && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFlavor(false)} />
          <div className="relative w-full rounded-t-3xl bg-white p-6 animate-slide-up">
            <div className="font-extrabold mb-4">Choisir un goût</div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setSelectedFlavor(null);
                  setShowFlavor(false);
                }}
                className="px-4 py-2 rounded-full border font-semibold"
              >
                Tous
              </button>

              {FLAVORS.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setSelectedFlavor(f);
                    setShowFlavor(false);
                  }}
                  className={`px-4 py-2 rounded-full border font-semibold capitalize ${
                    selectedFlavor === f ? "bg-emerald-600 text-white" : ""
                  }`}
                >
                  💨 {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom sheet PRODUIT */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-xs rounded-3xl bg-white p-4 shadow-xl max-h-[80vh] overflow-y-auto animate-slide-up">
            {selected.photos && selected.photos.length > 0 && (
              <div className="relative">
                <img
                  src={selected.photos[photoIndex]}
                  alt={selected.name}
                  className="h-40 mx-auto object-contain"
                />

                {selected.photos.length > 1 && (
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
            )}

            {selected.photos && selected.photos.length > 1 && (
              <div className="mt-2 flex justify-center gap-1">
                {selected.photos.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${
                      i === photoIndex ? "bg-emerald-600" : "bg-emerald-300"
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="mt-4 flex items-start justify-between gap-4">
              <h2 className="text-2xl font-extrabold">{selected.name}</h2>

              <button
                onClick={() => setSelected(null)}
                className="rounded-full border px-3 py-1 text-sm font-extrabold hover:bg-emerald-50"
              >
                Fermer
              </button>
            </div>

            <p className="mt-2 text-emerald-900/70">
              {selected.description || "Description à venir."}
            </p>

            {selected.flavors?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {selected.flavors.map((f) => (
                  <span
                    key={f}
                    className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold capitalize"
                  >
                    💨 {f}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-between">
              <div className="text-xl font-extrabold">{selected.price.toFixed(2)} €</div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-10 w-10 grid place-items-center rounded-full border font-extrabold"
                >
                  −
                </button>
                <div className="w-10 text-center font-extrabold">{qty}</div>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="h-10 w-10 grid place-items-center rounded-full border font-extrabold"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                try {
                  const raw = localStorage.getItem("cart");
                  const cart = raw ? JSON.parse(raw) : [];

                  const key = `fleur:${selected.id}:${selected.price}`;

                  const idx = cart.findIndex((x: any) => x.key === key);

                  if (idx >= 0) {
                    cart[idx].qty = (cart[idx].qty || 1) + qty;
                  } else {
                    cart.push({
                      key,
                      category: "fleur",
                      productId: selected.id,
                      name: selected.name,
                      photo: selected.photos?.[0] || null,
                      price: selected.price,
                      qty,
                      addedAt: Date.now(),
                    });
                  }

                  localStorage.setItem("cart", JSON.stringify(cart));
                  window.dispatchEvent(new Event("storage"));
                } catch {}
                setSelected(null);
              }}
              className="mt-6 w-full rounded-full bg-emerald-600 text-white px-8 py-3 font-extrabold hover:bg-emerald-700 transition"
            >
              Ajouter au panier
            </button>
          </div>
        </div>
      )}
    </main>
  );
}