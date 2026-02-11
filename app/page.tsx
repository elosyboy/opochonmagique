 "use client";

import { useEffect } from "react";

import React from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

const CATEGORIES = [
  { key: "fleur", label: "Fleurs", img: "/assets/fleur.png", href: "/fleur" },
  { key: "resine", label: "Résines", img: "/assets/resine.png", href: "/resine" },
  { key: "puff", label: "Puffs", img: "/assets/puff.png", href: "/puff" },
  { key: "huile", label: "Huiles", img: "/assets/huile.png", href: "/huile" },
  { key: "accessoire", label: "Accessoires", img: "/assets/accessoire.png", href: "/accessoire" },
];

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
      <img src={img} alt={alt} className="h-6 w-6 object-contain" />
      {badge ? (
        <span className="absolute -top-2 -right-2 rounded-full bg-white text-emerald-950 text-[11px] font-black px-2 py-0.5 shadow">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export default function Home() {
  const [cartCount, setCartCount] = React.useState(0);
  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const [bestSellers, setBestSellers] = React.useState<any[]>([]);
  const [loadingBest, setLoadingBest] = React.useState(true);

  const [promos, setPromos] = React.useState<any[]>([]);
  const [loadingPromos, setLoadingPromos] = React.useState(true);

  const [activeProduct, setActiveProduct] = React.useState<any | null>(null);
  const [selectedGram, setSelectedGram] = React.useState<any | null>(null);
  const [qty, setQty] = React.useState(1);
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  React.useEffect(() => {
    setCartCount(getCartCount());
    const onStorage = () => setCartCount(getCartCount());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  React.useEffect(() => {
    async function loadBestSellers() {
      try {
        const q = query(
          collection(db, "products"),
          where("bestSeller", "==", true)
        );
        const snap = await getDocs(q);
        setBestSellers(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
      } catch (e) {
        console.error("Erreur chargement best sellers", e);
      } finally {
        setLoadingBest(false);
      }
    }
    loadBestSellers();
  }, []);

  React.useEffect(() => {
    async function loadPromos() {
      try {
        const q = query(
          collection(db, "products"),
          where("promo", "==", true)
        );
        const snap = await getDocs(q);
        setPromos(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
      } catch (e) {
        console.error("Erreur chargement promotions", e);
      } finally {
        setLoadingPromos(false);
      }
    }
    loadPromos();
  }, []);

  return (
    <main className="min-h-screen bg-white text-emerald-950 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl animate-float-slow" />
        <div className="absolute top-16 -right-24 h-80 w-80 rounded-full bg-emerald-300/40 blur-3xl animate-float" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-emerald-100/70 blur-3xl animate-float-slower" />
        <div className="absolute bottom-16 right-10 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl animate-float" />
      </div>

      {/* HERO / Banner */}
      <section className="relative overflow-hidden">
        {/* Banner image */}
        <div className="absolute inset-0 bg-[url('/assets/fond.png')] bg-cover bg-center" />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/55 via-emerald-950/25 to-white" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.22),transparent_55%)]" />

        {/* Transparent Header */}
        <header className="relative z-10 mx-auto max-w-6xl px-6 pt-6">
          <div className="flex items-center justify-between rounded-3xl bg-white/10 border border-white/20 backdrop-blur px-4 py-3">
            {/* Left */}
            <img
              src="/assets/feuille.png"
              alt="Feuille"
              className="h-9 w-9 object-contain drop-shadow-[0_0_18px_rgba(255,255,255,0.25)]"
            />

            {/* Center */}
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/assets/feuille.png"
                alt="Opochon Magique"
                className="h-10 w-10 object-contain animate-spin-slow drop-shadow-[0_0_22px_rgba(16,185,129,0.6)]"
              />
              <div className="text-center leading-tight">
                <div className="text-white font-extrabold tracking-tight text-lg">
                  Opochon Magique
                </div>
                <div className="text-white/80 text-[11px] tracking-[0.35em] uppercase">
                  CBD Premium
                </div>
              </div>
            </Link>

            {/* Right */}
            <div className="flex items-center gap-2">
              <IconBtn
                href="/panier"
                img="/assets/panier.png"
                alt="Panier"
                badge={cartCount > 0 ? String(cartCount) : undefined}
              />
            </div>
          </div>
        </header>

        {/* Hero copy */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-10 pt-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-5 py-2 text-white/90 backdrop-blur border border-white/15">
              <span className="h-2 w-2 rounded-full bg-emerald-200" />
              <span className="text-xs tracking-[0.25em] uppercase">
                Livraison rapide • Qualité boutique
              </span>
            </div>

            <h1 className="mt-6 text-white text-4xl md:text-6xl font-extrabold tracking-tight">
              Le CBD, version <span className="text-emerald-200">premium</span>.
            </h1>

            <p className="mt-4 text-white/85 text-lg">
              Fleurs, résines, huiles, puffs et accessoires.
            </p>
          </div>
        </div>
      </section>

      {/* Categories (horizontal scroll) */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-emerald-950">Catégories</h2>
            <p className="mt-1 text-emerald-900/70">
              Clique — ça t’emmène au bon endroit.
            </p>
          </div>
        </div>

        <div className="mt-6 -mx-2 overflow-x-auto no-scrollbar">
          <div className="px-2 flex gap-4 min-w-max">
            {CATEGORIES.map((c) => (
              <Link
                key={c.key}
                href={c.href}
                className="w-44 shrink-0 rounded-3xl bg-white border border-emerald-900/10 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                <div className="p-6 bg-emerald-50">
                  <img
                    src={c.img}
                    alt={c.label}
                    className="h-16 w-full object-contain drop-shadow-[0_0_18px_rgba(16,185,129,0.22)]"
                  />
                </div>
                <div className="px-5 py-4">
                  <div className="font-extrabold text-emerald-950">{c.label}</div>
                  <div className="text-xs text-emerald-900/60 mt-1 tracking-wide">
                    Découvrir →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best sellers – Firebase ready */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="text-2xl font-extrabold text-emerald-950">Best-sellers</h2>
        <p className="mt-1 text-emerald-900/60">
          Les produits les plus populaires, le meilleur pour vous.
        </p>
        <div className="mt-6">
          {loadingBest && (
            <div className="rounded-3xl border border-emerald-900/10 bg-emerald-50 p-10 text-center text-emerald-900/60">
              Chargement des best-sellers…
            </div>
          )}

          {!loadingBest && bestSellers.length === 0 && (
            <div className="rounded-3xl border border-emerald-900/10 bg-emerald-50 p-10 text-center text-emerald-900/60">
              Aucun best-seller pour le moment.
            </div>
          )}

          {!loadingBest && bestSellers.length > 0 && (
            <div className="-mx-2 overflow-x-auto no-scrollbar">
              <div className="px-2 flex gap-4 min-w-max">
                {bestSellers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProduct(p);
                      setSelectedGram(p.priceByGrams?.[0] || null);
                      setQty(1);
                      setActiveImageIndex(0);
                    }}
                    className="w-44 shrink-0 rounded-3xl bg-white border border-emerald-900/10 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
                  >
                    <div className="h-40 w-full bg-emerald-50 overflow-hidden">
                      <img
                        src={p.photos?.[0]}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="px-5 py-4">
                      <div className="font-extrabold text-emerald-950">
                        {p.name}
                      </div>
                      {p.priceByGrams?.[0] && (
                        <div className="text-xs text-emerald-900/60 mt-1">
                          {p.priceByGrams[0].price} € / {p.priceByGrams[0].grams}g
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="h-px w-full bg-emerald-600/25" />
      </div>

      {/* Promotions – Firebase ready */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-2xl font-extrabold text-emerald-950">Promotions</h2>
        <p className="mt-1 text-emerald-900/60">
          Profitez des meilleures offres du moment.
        </p>

        <div className="mt-6">
          {loadingPromos && (
            <div className="rounded-3xl border border-emerald-900/10 bg-emerald-50 p-10 text-center text-emerald-900/60">
              Chargement des promotions…
            </div>
          )}

          {!loadingPromos && promos.length === 0 && (
            <div className="rounded-3xl border border-emerald-900/10 bg-emerald-50 p-10 text-center text-emerald-900/60">
              Aucune promotion active pour le moment.
            </div>
          )}

          {!loadingPromos && promos.length > 0 && (
            <div className="-mx-2 overflow-x-auto no-scrollbar">
              <div className="px-2 flex gap-4 min-w-max">
                {promos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProduct(p);
                      setSelectedGram(p.priceByGrams?.[0] || null);
                      setQty(1);
                      setActiveImageIndex(0);
                    }}
                    className="relative w-44 shrink-0 rounded-3xl bg-white border border-emerald-900/10 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
                  >
                    <div className="absolute top-2 left-2 rounded-full bg-red-600 text-white text-xs font-extrabold px-3 py-1">
                      PROMO
                    </div>

                    <div className="h-40 w-full bg-emerald-50 overflow-hidden">
                      <img
                        src={p.photos?.[0]}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="px-5 py-4">
                      <div className="font-extrabold text-emerald-950">
                        {p.name}
                      </div>

                      {p.promoBasePrice && p.promoPrice && (
                        <div className="mt-1 text-xs">
                          <span className="line-through text-emerald-900/50 mr-2">
                            {p.promoBasePrice} €
                          </span>
                          <span className="font-extrabold text-red-600">
                            {p.promoPrice} €
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Engagement qualité */}
      <section className="mx-auto max-w-6xl px-6 py-16 reveal" data-reveal>
        {/* Divider */}
        <div className="mb-12 h-px w-full bg-emerald-600/25" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Texte */}
          <div>
            <h3 className="text-3xl font-extrabold text-emerald-950">
              La meilleure qualité CBD au meilleur prix.
            </h3>

            <p className="mt-6 text-emerald-900/80 leading-relaxed text-lg">
              Chez <strong>Opochon Magique</strong>, nous avons fait un choix simple :
              proposer des produits CBD d’une <strong>qualité maximale</strong> à des
              <strong> prix défiant toute concurrence</strong>.
            </p>

            <p className="mt-4 text-emerald-900/80 leading-relaxed text-lg">
              Basés à <strong>Marseille</strong>, nous assurons une
              <strong> livraison express dans toute la ville</strong>, ainsi que des
              <strong> envois partout en France</strong>.
            </p>

            <p className="mt-4 text-emerald-900/80 leading-relaxed text-lg">
              Cette exigence de qualité, à ce niveau de prix, vous ne la trouverez
              <strong> nulle part ailleurs</strong>.
            </p>
          </div>

          {/* Image */}
          <div className="flex justify-center">
            <img
              src="/assets/image.png"
              alt="Qualité CBD Opochon Magique"
              className="h-64 w-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* Localisation du shop */}
      <section className="mx-auto max-w-6xl px-6 py-20 reveal" data-reveal>
        {/* Divider */}
        <div className="mb-12 h-px w-full bg-emerald-600/25" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Map à gauche */}
          <div className="w-full h-[520px] rounded-3xl overflow-hidden border border-emerald-900/10 shadow-md">
            <iframe
              src="https://www.google.com/maps?q=27%20Boulevard%20de%20la%20Libération%2013001%20Marseille&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Texte à droite */}
          <div>
            <h3 className="text-4xl font-extrabold text-emerald-950">
              Nous sommes situés à proximité de la Canebière
            </h3>

            <p className="mt-6 text-emerald-900/80 leading-relaxed text-xl">
              Notre boutique est idéalement implantée au{" "}
              <strong>27 Boulevard de la Libération, 13001 Marseille</strong>,
              à quelques minutes de la Canebière.
            </p>

            <p className="mt-4 text-emerald-900/80 leading-relaxed text-xl">
              L’accès est simple et rapide grâce aux{" "}
              <strong>lignes de tramway</strong> et aux transports en commun,
              pour venir en boutique en toute tranquillité.
            </p>
          </div>
        </div>
      </section>

      {/* Modal Product Card */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white p-8 shadow-2xl">
            {/* Close */}
            <button
              onClick={() => setActiveProduct(null)}
              className="absolute top-4 right-4 text-emerald-900/60 hover:text-emerald-950 text-xl"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Images */}
              <div className="relative rounded-2xl overflow-hidden bg-emerald-50">
                <img
                  src={activeProduct.photos?.[activeImageIndex]}
                  alt={activeProduct.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />

                {activeProduct.photos?.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((i) =>
                          i === 0 ? activeProduct.photos.length - 1 : i - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur px-3 py-2 text-xl font-extrabold text-emerald-950 shadow hover:bg-white transition"
                    >
                      ‹
                    </button>

                    <button
                      onClick={() =>
                        setActiveImageIndex((i) =>
                          i === activeProduct.photos.length - 1 ? 0 : i + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur px-3 py-2 text-xl font-extrabold text-emerald-950 shadow hover:bg-white transition"
                    >
                      ›
                    </button>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                      {activeProduct.photos.map((_: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`h-2.5 w-2.5 rounded-full transition ${
                            idx === activeImageIndex
                              ? "bg-emerald-600"
                              : "bg-white/70"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Info */}
              <div>
                <h3 className="text-3xl font-extrabold text-emerald-950">
                  {activeProduct.name}
                </h3>

                <p className="mt-4 text-emerald-900/80">
                  {activeProduct.description || "CBD premium sélectionné en boutique."}
                </p>

                {/* Gram selection */}
                {activeProduct.priceByGrams && (
                  <div className="mt-6">
                    <div className="font-extrabold text-emerald-950 mb-2">
                      Choisir le grammage
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {activeProduct.priceByGrams.map((g: any) => (
                        <button
                          key={g.grams}
                          onClick={() => setSelectedGram(g)}
                          className={`px-4 py-2 rounded-xl border font-bold transition ${
                            selectedGram?.grams === g.grams
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "border-emerald-900/20 text-emerald-950 hover:bg-emerald-50"
                          }`}
                        >
                          {g.grams}g — {g.price}€
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mt-6 flex items-center gap-4">
                  <div className="font-extrabold text-emerald-950">Quantité</div>
                  <div className="flex items-center border border-emerald-900/20 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-4 py-2 font-bold"
                    >
                      −
                    </button>
                    <div className="px-4 font-bold">{qty}</div>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="px-4 py-2 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price & cart */}
                {selectedGram && (
                  <div className="mt-8 flex items-center justify-between">
                    <div className="text-2xl font-extrabold text-emerald-950">
                      {selectedGram.price * qty} €
                    </div>

                    <button
                      onClick={() => {
                        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
                        cart.push({
                          id: activeProduct.id,
                          name: activeProduct.name,
                          grams: selectedGram.grams,
                          price: selectedGram.price,
                          qty,
                          photo: activeProduct.photos?.[0],
                        });
                        localStorage.setItem("cart", JSON.stringify(cart));
                        setCartCount(getCartCount());
                        setActiveProduct(null);
                      }}
                      className="rounded-2xl bg-emerald-600 px-8 py-4 text-white font-extrabold shadow-lg hover:bg-emerald-700 transition"
                    >
                      Ajouter au panier
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-emerald-900/10 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="font-extrabold text-emerald-950">Paiements sécurisés</div>
              <div className="text-sm text-emerald-900/70 mt-1">
                CB • Visa • Mastercard • 3D Secure • CVV
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-emerald-900/10 px-4 py-2 text-xs font-extrabold text-emerald-950">
                3D Secure
              </div>
              <div className="rounded-2xl border border-emerald-900/10 px-4 py-2 text-xs font-extrabold text-emerald-950">
                CVV
              </div>
              <div className="rounded-2xl border border-emerald-900/10 px-4 py-2 text-xs font-extrabold text-emerald-950">
                SSL
              </div>
            </div>
          </div>

          <div className="mt-8 text-xs text-emerald-900/60">
            © {new Date().getFullYear()} Opochon Magique — Tous droits réservés.
          </div>
        </div>
      </footer>
      <style jsx global>{`
        .reveal {
          opacity: 0;
          transform: translateY(80px) scale(0.96);
          filter: blur(8px);
          transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .reveal-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }

        iframe {
          transition: transform 1s ease, box-shadow 1s ease;
        }

        iframe:hover {
          transform: scale(1.04);
          box-shadow: 0 30px 80px rgba(16, 185, 129, 0.35);
        }
      `}</style>
    </main>
  );
}