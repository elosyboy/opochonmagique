"use client";

import React from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Product = {
  id: string;
  name: string;
  photos?: string[];
  description?: string;
  flavors?: string[];
  promo?: boolean;
  promoBasePrice?: number;
  promoPrice?: number;
  priceByGrams?: { grams: string; price: string }[];
};

export default function ResinePage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selected, setSelected] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [cartCount, setCartCount] = React.useState(0);
  const [flavorFilter, setFlavorFilter] = React.useState<string | null>(null);
  const [selectedWeight, setSelectedWeight] = React.useState<{ grams: string; price: string } | null>(null);
  const [qty, setQty] = React.useState(1);
  const [photoIndex, setPhotoIndex] = React.useState(0);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const q = query(
        collection(db, "products"),
        where("category", "==", "resine")
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

  const filtered = flavorFilter
    ? products.filter((p) =>
        (p.flavors || []).map((f) => f.toLowerCase()).includes(flavorFilter)
      )
    : products;

  return (
    <main className="min-h-screen bg-white text-emerald-950">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/fond.png')] bg-cover bg-no-repeat bg-[size:120%] bg-[position:center_90%]" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 via-emerald-950/30 to-white" />

        <header className="relative z-10 mx-auto max-w-6xl px-6 pt-6">
          <div className="flex items-center justify-between rounded-3xl bg-white/10 border border-white/20 backdrop-blur px-4 py-3">
            <img src="/assets/resine.png" className="h-11 w-11" />

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
            Résines de CBD Premium
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-white/90 text-lg sm:text-xl leading-relaxed drop-shadow">
            Découvrez notre sélection de résines de CBD soigneusement choisies pour leur qualité,
            leurs arômes et leur pureté.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        {loading && (
          <div className="text-emerald-900/60">Chargement…</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-emerald-900/60">
            Aucun produit ne correspond aux filtres.
          </div>
        )}

        <div className="mb-10 mt-6">
          <div className="flex flex-wrap justify-center gap-3">
            {["fruité", "boisé", "terreux", "acide", "autre"].map((flavor) => {
              const active = flavorFilter === flavor;
              return (
                <button
                  key={flavor}
                  onClick={() => setFlavorFilter(active ? null : flavor)}
                  className={`px-5 py-2 rounded-2xl border font-extrabold transition-all ${
                    active
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                      : "bg-white border-emerald-900/15 text-emerald-950 hover:bg-emerald-50"
                  }`}
                >
                  {flavor.charAt(0).toUpperCase() + flavor.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelected(p);
                setSelectedWeight(p.priceByGrams?.[0] || null);
                setQty(1);
                setPhotoIndex(0);
              }}
              className="relative rounded-3xl bg-white border border-emerald-900/10 shadow-sm hover:shadow-xl transition overflow-hidden text-left flex flex-col"
            >
              {p.promo && (
                <div className="absolute top-2 left-2 rounded-full bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 z-10">
                  PROMO
                </div>
              )}

              <div className="aspect-square w-full bg-emerald-50 overflow-hidden">
                <img
                  src={p.photos?.[0] || "/assets/placeholder.png"}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-3">
                <div className="font-bold text-sm">{p.name}</div>

                {p.promoBasePrice && p.promoPrice ? (
                  <div className="text-sm mt-1">
                    <span className="line-through text-emerald-900/50 mr-2">
                      {p.promoBasePrice} €
                    </span>
                    <span className="font-extrabold text-red-600">
                      {p.promoPrice} €
                    </span>
                  </div>
                ) : (
                  <>
                    {p.priceByGrams?.[0] && (
                      <div className="text-xs text-emerald-900/70 mt-1">
                        {p.priceByGrams[0].price} € / {p.priceByGrams[0].grams}g
                      </div>
                    )}
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelected(null)}
          />
          <div className="relative flex w-full max-w-5xl rounded-3xl bg-white p-8 shadow-xl max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="flex flex-col justify-center gap-6 flex-1 pr-8">
              <header className="flex items-center gap-4">
                <img src="/assets/resine.png" alt="Résine" className="h-12 w-12" />
                <h2 className="text-3xl font-extrabold">{selected.name}</h2>
              </header>

              <p className="text-emerald-900/70">{selected.description || "Description à venir."}</p>

              {selected.flavors && (
                <div className="flex flex-wrap gap-2">
                  {selected.flavors.map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold capitalize"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}

              {selected.priceByGrams && (
                <div className="flex flex-wrap gap-2">
                  {selected.priceByGrams.map((row) => (
                    <button
                      key={row.grams}
                      onClick={() => setSelectedWeight(row)}
                      className={`px-4 py-2 rounded-full border font-semibold ${
                        selectedWeight?.grams === row.grams
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white"
                      }`}
                    >
                      {row.grams}g – {row.price} €
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 mt-4">
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

              {selectedWeight && (
                <>
                  <div className="mt-6 text-xl font-extrabold">
                    {(Number(selectedWeight.price) * qty).toFixed(2)} €
                  </div>
                  <button
                    onClick={() => {
                      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

                      const key = `fleur:${selected.id}:${selectedWeight.grams}:${selectedWeight.price}`;

                      const existing = cart.find((i: any) => i.key === key);

                      if (existing) {
                        existing.qty += qty;
                      } else {
                        cart.push({
                          key,
                          id: selected.id,
                          name: selected.name,
                          grams: selectedWeight.grams,
                          price: Number(selectedWeight.price),
                          qty,
                          photo: selected.photos?.[0],
                          category: "fleur",
                        });
                      }

                      localStorage.setItem("cart", JSON.stringify(cart));
                      window.dispatchEvent(new Event("storage"));
                      setSelected(null);
                    }}
                    className="mt-6 w-full rounded-2xl bg-emerald-600 py-4 text-white font-extrabold text-lg hover:bg-emerald-700 transition"
                  >
                    Ajouter au panier
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-1 items-center justify-center">
              {selected.photos && selected.photos.length > 0 && (
                <div className="relative w-full max-w-md">
                  <img
                    src={selected.photos[photoIndex]}
                    alt={selected.name}
                    className="h-[360px] w-full object-contain"
                  />

                  {selected.photos && selected.photos.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setPhotoIndex(
                            photoIndex === 0
                              ? selected.photos!.length - 1
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
                            photoIndex === selected.photos!.length - 1
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

                  {selected.photos.length > 1 && (
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}