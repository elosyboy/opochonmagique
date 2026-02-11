// Coller le contenu complet fourni dans l'instruction :

"use client";

import React from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type PriceRow = { price: string; grams: string };

type Product = {
  id: string;
  name: string;
  photos?: string[];
  description?: string;
  flavors?: string[];
  promo?: boolean;
  promoPrice?: number | null;
  promoCode?: string | null;
  priceByGrams?: PriceRow[];
  bestSeller?: boolean;
  comments?: string[];
};

const FLAVORS = ["terreux", "boisé", "fruité", "acide"];


function clampPriceRows(rows?: PriceRow[]) {
  if (!rows || !Array.isArray(rows)) return [];
  return rows
    .filter((r) => r && String(r.price).trim() !== "" && String(r.grams).trim() !== "")
    .map((r) => ({ price: String(r.price), grams: String(r.grams) }));
}

function formatEuro(v: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(v);
}

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

function addToCart(item: {
  id: string;
  name: string;
  photo?: string;
  grams: string;
  price: number;
  qty: number;
}) {
  if (typeof window === "undefined") return;

  const key = `fleur:${item.id}:${item.grams}:${item.price}`;
  const raw = localStorage.getItem("cart");
  const cart: any[] = raw ? JSON.parse(raw) : [];

  const idx = cart.findIndex((x) => x.key === key);
  if (idx >= 0) {
    cart[idx].qty = (cart[idx].qty || 0) + item.qty;
  } else {
    cart.push({
      key,
      category: "fleur",
      productId: item.id,
      name: item.name,
      photo: item.photo || null,
      grams: item.grams,
      price: item.price,
      qty: item.qty,
      addedAt: Date.now(),
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  // Notifie les autres onglets / composants
  window.dispatchEvent(new Event("storage"));
}

function IconBtn({
  href,
  img,
  alt,
  badge,
}: {
  href: string;
  img: string;
  alt: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="relative grid place-items-center h-11 w-11 rounded-2xl bg-white/10 border border-white/20 backdrop-blur hover:bg-white/15 transition"
      aria-label={alt}
      title={alt}
    >
      <img src={img} alt={alt} className="h-7 w-7 object-contain" />
      {badge ? (
        <span className="absolute -top-2 -right-2 rounded-full bg-white text-emerald-950 text-[11px] font-black px-2 py-0.5 shadow">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        aria-label="Fermer"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center p-3">
        <div className="w-full md:max-w-3xl rounded-3xl bg-white border border-emerald-900/10 shadow-2xl overflow-hidden animate-sheet-up">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function FleurPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selected, setSelected] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [cartCount, setCartCount] = React.useState(0);

  // Filtre par saveur
  const [flavorFilter, setFlavorFilter] = React.useState<string | null>(null);


  // Modal selection
  const [photoIndex, setPhotoIndex] = React.useState(0);
  const [variantIndex, setVariantIndex] = React.useState(0);
  const [qty, setQty] = React.useState(1);

  React.useEffect(() => {
    setCartCount(getCartCount());
    const onStorage = () => setCartCount(getCartCount());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const q = query(collection(db, "products"), where("category", "==", "fleur"));
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

  const filtered = flavorFilter
    ? products.filter((p) =>
        (p.flavors || []).map((f) => f.toLowerCase()).includes(flavorFilter)
      )
    : products;


  function openProduct(p: Product) {
    setSelected(p);
    setPhotoIndex(0);
    setVariantIndex(0);
    setQty(1);
  }

  function closeProduct() {
    setSelected(null);
  }

  const selectedRows = clampPriceRows(selected?.priceByGrams);
  const selectedVariant = selectedRows[variantIndex] || selectedRows[0] || null;
  const selectedPrice = selectedVariant ? Number(selectedVariant.price) : 0;

  const photos = (selected?.photos || []).filter(Boolean) as string[];
  const canPrev = photoIndex > 0;
  const canNext = photoIndex < Math.max(0, photos.length - 1);

  return (
    <main className="min-h-screen bg-white text-emerald-950 relative overflow-hidden">
      {/* Background blobs (subtil, premium) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 -left-28 h-80 w-80 rounded-full bg-emerald-200/45 blur-3xl animate-float-slow" />
        <div className="absolute top-10 -right-28 h-96 w-96 rounded-full bg-emerald-300/35 blur-3xl animate-float" />
        <div className="absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-100/70 blur-3xl animate-float-slower" />
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/fond.png')] bg-cover bg-no-repeat bg-[size:120%] bg-[position:center_90%]" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 via-emerald-950/28 to-white" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.22),transparent_55%)]" />

        <header className="relative z-10 mx-auto max-w-6xl px-6 pt-6">
          <div className="flex items-center justify-between rounded-3xl bg-white/10 border border-white/20 backdrop-blur px-4 py-3">
            <img src="/assets/fleur.png" className="h-11 w-11 object-contain" />

            <Link href="/" className="text-center">
              <div className="text-white font-extrabold text-lg">Opochon Magique</div>
              <div className="text-white/80 text-xs tracking-[0.35em] uppercase">
                CBD Premium
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Link href="/" className="hidden sm:block">
                <span className="text-white text-sm font-semibold hover:underline">Retour</span>
              </Link>
              <IconBtn
                href="/panier"
                img="/assets/panier.png"
                alt="Panier"
                badge={cartCount > 0 ? String(cartCount) : undefined}
              />
            </div>
          </div>
        </header>

        {/* Hero title */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-xl">
            Fleurs de CBD Premium
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-white/90 text-lg sm:text-xl leading-relaxed drop-shadow">
            Découvrez notre sélection de fleurs de CBD soigneusement choisies pour leur
            qualité, leurs arômes et leur caractère unique.
          </p>
        </div>

      </section>




      {/* LISTE PRODUITS */}
      <section className="mx-auto max-w-6xl px-6 pb-14">
        {/* Filtres saveurs */}
        <div className="mt-10 mb-10">
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {["fruité", "boisé", "terreux", "acide", "autre"].map((flavor) => {
              const active = flavorFilter === flavor;
              return (
                <button
                  key={flavor}
                  onClick={() =>
                    setFlavorFilter(active ? null : flavor)
                  }
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
        {loading && (
          <div className="rounded-3xl border border-emerald-900/10 bg-white shadow-sm p-8">
            Chargement…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="rounded-3xl border border-emerald-900/10 bg-white shadow-sm p-8">
            Aucun produit ne correspond aux filtres.
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const rows = clampPriceRows(p.priceByGrams);
            const label = rows?.[0]
              ? `${rows[0].price} € / ${rows[0].grams}g`
              : "—";
            return (
              <button
                key={p.id}
                onClick={() => openProduct(p)}
                className="relative rounded-3xl bg-white border border-emerald-900/10 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 text-left overflow-hidden"
              >
                {p.bestSeller && (
                  <img
                    src="/assets/best.png"
                    alt="Best seller"
                    className="absolute top-2 right-2 h-24 w-24 z-10"
                  />
                )}
                <div className="p-4 bg-gradient-to-b from-emerald-50 to-white">
                  <div className="aspect-square w-full overflow-hidden rounded-2xl bg-white">
                    <img
                      src={p.photos?.[0]}
                      alt={p.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-extrabold text-[15px] leading-tight line-clamp-1">
                    {p.name}
                  </div>
                  <div className="text-xs text-emerald-900/70 mt-1">
                    {rows?.[0]
                      ? `${rows[0].price} € / ${rows[0].grams}g`
                      : "—"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* MODAL PRODUIT */}
      <Modal open={!!selected} onClose={closeProduct}>
        {selected && (
          <div className="grid md:grid-cols-2 md:min-h-[520px]">
            {/* Left: infos + actions */}
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-extrabold text-emerald-900/70">
                    Fleur
                  </div>
                  <h3 className="text-2xl font-extrabold mt-1">{selected.name}</h3>
                </div>
                <button
                  onClick={closeProduct}
                  className="rounded-2xl border border-emerald-900/15 px-3 py-2 font-extrabold hover:bg-emerald-50"
                >
                  Fermer
                </button>
              </div>

              {selected.description ? (
                <p className="mt-4 text-emerald-900/75 leading-relaxed">
                  {selected.description}
                </p>
              ) : (
                <p className="mt-4 text-emerald-900/60">
                  Description disponible bientôt.
                </p>
              )}

              {selected.flavors?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selected.flavors.map((flavor) => (
                    <span
                      key={flavor}
                      className="rounded-full border border-emerald-900/15 bg-emerald-50 px-3 py-1 text-sm font-extrabold text-emerald-900"
                    >
                      {flavor}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* Variant picker */}
              <div className="mt-6">
                <div className="font-extrabold mb-3">Sélectionner un prix</div>
                {selectedRows.length ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedRows.map((r, idx) => {
                      const isActive = idx === variantIndex;
                      const priceNum = Number(r.price);
                      const isPromo = !!selected.promo && selected.promoPrice != null;
                      const promoPrice = selected.promoPrice != null ? Number(selected.promoPrice) : null;

                      return (
                        <button
                          key={`${r.price}-${r.grams}-${idx}`}
                          onClick={() => setVariantIndex(idx)}
                          className={`rounded-2xl border px-4 py-3 text-left transition ${
                            isActive
                              ? "border-emerald-600 bg-emerald-50"
                              : "border-emerald-900/15 hover:bg-emerald-50/60"
                          }`}
                        >
                          <div className="font-extrabold">
                            {r.grams}g
                          </div>
                          <div className="text-sm mt-1">
                            {isPromo && promoPrice != null ? (
                              <span className="flex items-center gap-2">
                                <span className="line-through text-emerald-900/50">
                                  {formatEuro(priceNum)}
                                </span>
                                <span className="font-extrabold">
                                  {formatEuro(promoPrice)}
                                </span>
                              </span>
                            ) : (
                              <span className="font-extrabold">
                                {formatEuro(priceNum)}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-900/15 p-4 text-emerald-900/60">
                    Aucun prix configuré pour ce produit.
                  </div>
                )}

                {/* Selected summary */}
                <div className="mt-4 rounded-2xl border border-emerald-900/10 bg-white p-4">
                  <div className="text-sm text-emerald-900/70 font-extrabold">
                    Sélection actuelle
                  </div>
                  <div className="mt-1 font-extrabold">
                    {selectedVariant ? `${selectedVariant.grams}g` : "—"}
                    {selectedVariant ? (
                      <span className="ml-2 text-emerald-900/70 font-semibold">
                        • {formatEuro(selectedPrice)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Qty + Add */}
              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center rounded-2xl border border-emerald-900/15 overflow-hidden">
                  <button
                    className="px-4 py-3 font-extrabold hover:bg-emerald-50"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Diminuer"
                  >
                    −
                  </button>
                  <div className="px-4 py-3 font-extrabold w-12 text-center">
                    {qty}
                  </div>
                  <button
                    className="px-4 py-3 font-extrabold hover:bg-emerald-50"
                    onClick={() => setQty((q) => q + 1)}
                    aria-label="Augmenter"
                  >
                    +
                  </button>
                </div>

                <button
                  disabled={!selectedVariant}
                  onClick={() => {
                    if (!selectedVariant) return;
                    addToCart({
                      id: selected.id,
                      name: selected.name,
                      photo: selected.photos?.[0],
                      grams: selectedVariant.grams,
                      price: Number(selectedVariant.price),
                      qty,
                    });
                    closeProduct();
                  }}
                  className={`flex-1 rounded-2xl px-5 py-3 font-extrabold shadow-sm transition ${
                    selectedVariant
                      ? "bg-emerald-600 text-white hover:opacity-95"
                      : "bg-emerald-200 text-emerald-900/60 cursor-not-allowed"
                  }`}
                >
                  Ajouter au panier
                </button>
              </div>
            </div>

            {/* Right: carousel photos */}
            <div className="bg-emerald-50 p-0 md:p-0 border-t md:border-t-0 md:border-l border-emerald-900/10 flex">
              <div className="flex-1 rounded-none md:rounded-r-3xl bg-white border-l border-emerald-900/10 overflow-hidden shadow-sm">
                <div className="relative w-full h-full bg-white overflow-hidden">
                  <div className="absolute inset-0 bg-black/5" />
                  {photos.length ? (
                    <img
                      src={photos[Math.min(photoIndex, photos.length - 1)]}
                      alt={selected.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-72 md:h-[26rem] grid place-items-center text-emerald-900/60 font-extrabold">
                      Pas de photo
                    </div>
                  )}

                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={() => canPrev && setPhotoIndex((i) => i - 1)}
                        className={`absolute left-3 top-1/2 -translate-y-1/2 rounded-2xl px-3 py-2 font-extrabold border border-emerald-900/10 bg-white/90 backdrop-blur ${
                          canPrev ? "hover:bg-white" : "opacity-40 cursor-not-allowed"
                        }`}
                        aria-label="Photo précédente"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => canNext && setPhotoIndex((i) => i + 1)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-2xl px-3 py-2 font-extrabold border border-emerald-900/10 bg-white/90 backdrop-blur ${
                          canNext ? "hover:bg-white" : "opacity-40 cursor-not-allowed"
                        }`}
                        aria-label="Photo suivante"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                {photos.length > 1 && (
                  <div className="flex items-center justify-center gap-2 py-3">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIndex(i)}
                        className={`h-2.5 w-2.5 rounded-full border ${
                          i === photoIndex
                            ? "bg-emerald-600 border-emerald-600"
                            : "bg-white border-emerald-900/20"
                        }`}
                        aria-label={`Aller à la photo ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* animations */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(0,-14px,0); }
          100% { transform: translate3d(0,0,0); }
        }
        @keyframes floatSlow {
          0% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(0,-10px,0); }
          100% { transform: translate3d(0,0,0); }
        }
        @keyframes floatSlower {
          0% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(0,-8px,0); }
          100% { transform: translate3d(0,0,0); }
        }
        .animate-float { animation: float 9s ease-in-out infinite; }
        .animate-float-slow { animation: floatSlow 12s ease-in-out infinite; }
        .animate-float-slower { animation: floatSlower 15s ease-in-out infinite; }
        @keyframes sheetUp {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-sheet-up { animation: sheetUp 180ms ease-out; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </main>
  );
}