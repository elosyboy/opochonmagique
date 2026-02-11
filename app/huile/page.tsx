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
  promo?: boolean;
  promoPrice?: number | null;
  promoCode?: string | null;
  price?: number | null;
  bestSeller?: boolean;
};

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
  price: number;
  qty: number;
}) {
  if (typeof window === "undefined") return;

  const key = `huile:${item.id}:${item.price}`;

  const raw = localStorage.getItem("cart");
  const cart: any[] = raw ? JSON.parse(raw) : [];

  const idx = cart.findIndex((x) => x.key === key);

  if (idx >= 0) {
    cart[idx].qty += item.qty;
  } else {
    cart.push({
      key,
      category: "huile",
      productId: item.id,
      name: item.name,
      photo: item.photo || null,
      grams: "—",
      price: item.price,
      qty: item.qty,
      addedAt: Date.now(),
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
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

export default function HuilePage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selected, setSelected] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [cartCount, setCartCount] = React.useState(0);

  const [photoIndex, setPhotoIndex] = React.useState(0);
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
      const q = query(collection(db, "products"), where("category", "==", "huile"));
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

  const filtered = products;

  function openProduct(p: Product) {
    setSelected(p);
    setPhotoIndex(0);
    setQty(1);
  }

  function closeProduct() {
    setSelected(null);
  }

  const photos = (selected?.photos || []).filter(Boolean) as string[];
  const canPrev = photoIndex > 0;
  const canNext = photoIndex < Math.max(0, photos.length - 1);

  return (
    <main className="min-h-screen bg-white text-emerald-950 relative overflow-hidden">
      {/* Background blobs */}
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
            <img src="/assets/huile.png" className="h-11 w-11 object-contain" />

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

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-xl">
            Huiles de CBD Premium
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-white/90 text-lg sm:text-xl leading-relaxed drop-shadow">
            Découvrez notre sélection d’huiles de CBD soigneusement formulées pour une
            expérience optimale.
          </p>
        </div>
      </section>

      {/* LISTE PRODUITS */}
      <section className="mx-auto max-w-6xl px-6 pb-14">

        {loading && (
          <div className="rounded-3xl border border-emerald-900/10 bg-white shadow-sm p-8">
            Chargement…
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => {
            return (
              <button
                key={p.id}
                onClick={() => openProduct(p)}
                className="relative rounded-3xl bg-white border border-emerald-900/10 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 text-left overflow-hidden"
              >
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
                  <div className="text-sm text-emerald-900 mt-1 font-extrabold">
                    {p.price != null
                      ? formatEuro(Number(p.price))
                      : "Prix non disponible"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* MODAL */}
      <Modal open={!!selected} onClose={closeProduct}>
        {selected && (
          <div className="grid md:grid-cols-2 md:min-h-[520px]">
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-extrabold text-emerald-900/70">
                    Huile
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

              {selected.description && (
                <p className="mt-4 text-emerald-900/75 leading-relaxed">
                  {selected.description}
                </p>
              )}
              {selected.price != null && (
                <div className="mt-4 text-2xl font-extrabold text-emerald-900">
                  {formatEuro(Number(selected.price))}
                </div>
              )}

              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center rounded-2xl border border-emerald-900/15 overflow-hidden">
                  <button
                    className="px-4 py-3 font-extrabold hover:bg-emerald-50"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <div className="px-4 py-3 font-extrabold w-12 text-center">
                    {qty}
                  </div>
                  <button
                    className="px-4 py-3 font-extrabold hover:bg-emerald-50"
                    onClick={() => setQty((q) => q + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (selected?.price == null) return;

                    addToCart({
                      id: selected.id,
                      name: selected.name,
                      photo: selected.photos?.[0],
                      price: Number(selected.price),
                      qty,
                    });

                    closeProduct();
                  }}
                  className="flex-1 rounded-2xl px-5 py-3 font-extrabold shadow-sm transition bg-emerald-600 text-white hover:opacity-95"
                >
                  Ajouter au panier
                </button>
              </div>

            </div>

            <div className="bg-emerald-50 border-l border-emerald-900/10">
              <div className="relative w-full h-full">
                {photos.length ? (
                  <img
                    src={photos[Math.min(photoIndex, photos.length - 1)]}
                    alt={selected.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full grid place-items-center">Pas de photo</div>
                )}

                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => canPrev && setPhotoIndex((i) => i - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-2xl px-3 py-2 font-extrabold bg-white/90"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => canNext && setPhotoIndex((i) => i + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-2xl px-3 py-2 font-extrabold bg-white/90"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}