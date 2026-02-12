"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

type CartItem = {
  key: string;
  category: string;
  productId: string;
  name: string;
  photo?: string | null;
  grams: string;
  price: number;
  qty: number;
  tags?: string[];
};

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("cart");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-extrabold mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-emerald-900/15 px-4 py-3 font-extrabold"
      />
    </label>
  );
}

export default function PanierPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [delivery, setDelivery] = useState<"domicile" | "marseille" | "click">(
    "domicile"
  );

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    pointRelay: false,
  });

  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoData, setPromoData] = useState<null | {
    code: string;
    type: "percent" | "fixed";
    value: number;
  }>(null);

  useEffect(() => {
    const update = () => setItems(loadCart());
    update();
    window.addEventListener("storage", update);
    setLoading(false);
    return () => window.removeEventListener("storage", update);
  }, []);

  function updateQuantity(item: CartItem, delta: number) {
    const cart = loadCart();
    const idx = cart.findIndex((i) => i.key === item.key);
    if (idx < 0) return;
    cart[idx].qty = Math.max(1, cart[idx].qty + delta);
    localStorage.setItem("cart", JSON.stringify(cart));
    setItems(cart);
  }

  function removeItem(key: string) {
    const cart = loadCart().filter((i) => i.key !== key);
    localStorage.setItem("cart", JSON.stringify(cart));
    setItems(cart);
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  const discount = promoData
    ? promoData.type === "percent"
      ? (subtotal * promoData.value) / 100
      : promoData.value
    : 0;

  const total = Math.max(0, subtotal - discount);


  async function submitOrder(paid: boolean) {
    if (items.length === 0) {
      alert("Panier vide");
      return;
    }

    if (!form.email || !form.prenom) {
      alert("Merci de compléter les informations requises.");
      return;
    }

    await addDoc(collection(db, "orders"), {
      items,
      subtotal,
      discount,
      total,
      promo: promoData,
      delivery,
      form,
      paid,
      createdAt: serverTimestamp(),
    });

    localStorage.removeItem("cart");
    router.push("/app/admin/page.tsx?paid=0");
  }

  async function redirectToPayment() {
    if (items.length === 0) {
      alert("Panier vide");
      return;
    }

    if (!form.email || !form.prenom) {
      alert("Merci de compléter les informations requises.");
      return;
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        subtotal,
        discount,
        total,
        promo: promoData,
        delivery,
        form,
      }),
    });

    if (!res.ok) {
      alert("Erreur lors de la création du paiement");
      return;
    }

    const data = await res.json();

    if (!data?.url) {
      alert("Erreur de redirection vers Stripe");
      return;
    }

    window.location.href = data.url;
  }

  async function applyPromo() {
    setPromoError(null);

    if (!promoInput.trim()) return;

    const q = await import("firebase/firestore").then(({ collection, getDocs, query, where }) =>
      getDocs(
        query(
          collection(db, "promoCodes"),
          where("code", "==", promoInput.trim().toUpperCase()),
          where("active", "==", true)
        )
      )
    );

    if (q.empty) {
      setPromoError("Code promo invalide");
      setPromoData(null);
      return;
    }

    const data = q.docs[0].data();
    setPromoData({
      code: data.code,
      type: data.type,
      value: data.value,
    });
  }

  if (loading) {
    return <div className="min-h-screen bg-white p-6">Chargement…</div>;
  }

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
            <img src="/assets/feuille.png" className="h-11 w-11 object-contain" />

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
              <Link
                href="/panier"
                className="relative grid place-items-center h-11 w-11 rounded-2xl bg-white/10 border border-white/20 backdrop-blur"
              >
                <img src="/assets/panier.png" className="h-7 w-7 object-contain" />
              </Link>
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-xl">
            Panier
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-white/90 text-lg drop-shadow">
            Finalisez votre commande en toute simplicité
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10">
        {items.length === 0 && (
          <div className="rounded-3xl border border-emerald-900/10 bg-white p-8 text-center font-extrabold text-emerald-900/60">
            Votre panier est vide.
          </div>
        )}

        <h2 className="text-2xl font-extrabold mb-4">Vos produits</h2>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={`${item.key}-${index}`}
              className="rounded-3xl bg-white border border-emerald-900/10 p-4 flex gap-4"
            >
              <div className="h-20 w-20 rounded-2xl overflow-hidden bg-emerald-50">
                {item.photo && (
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="flex-1">
                <div className="font-extrabold">{item.name}</div>
                <div className="text-sm text-emerald-900/70">{item.grams}</div>
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center rounded-2xl border border-emerald-900/15 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item, -1)}
                      className="px-3 py-2 font-extrabold"
                    >
                      −
                    </button>
                    <div className="px-4 font-extrabold">{item.qty}</div>
                    <button
                      onClick={() => updateQuantity(item, 1)}
                      className="px-3 py-2 font-extrabold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.key)}
                    className="text-sm font-extrabold text-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              <div className="font-extrabold text-right">
                {(item.price * item.qty).toFixed(2)} €
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-emerald-900/15 bg-white p-6">
          <div className="font-extrabold mb-3">Code promo</div>

          <div className="flex gap-3">
            <input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Entrer un code"
              className="flex-1 rounded-2xl border border-emerald-900/15 px-4 py-3 font-extrabold uppercase"
            />
            <button
              onClick={applyPromo}
              className="rounded-2xl bg-emerald-600 px-6 py-3 text-white font-extrabold"
            >
              Appliquer
            </button>
          </div>

          {promoError && (
            <div className="mt-3 text-sm font-extrabold text-red-600">
              {promoError}
            </div>
          )}

          {promoData && (
            <div className="mt-3 text-sm font-extrabold text-emerald-700">
              Code appliqué : {promoData.code} (
              {promoData.type === "percent"
                ? `-${promoData.value}%`
                : `-${promoData.value}€`}
              )
            </div>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-extrabold mb-4">Livraison</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["domicile", "marseille", "click"].map((m) => (
              <button
                key={m}
                onClick={() => setDelivery(m as any)}
                className={`rounded-3xl border px-6 py-6 font-extrabold transition ${
                  delivery === m
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white border-emerald-900/15"
                }`}
              >
                {m === "domicile"
                  ? "Livraison à domicile"
                  : m === "marseille"
                  ? "Livraison Marseille"
                  : "Click & Collect"}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {delivery === "click" && (
              <>
                <Input label="Prénom" value={form.prenom} onChange={(v) => setForm((f) => ({ ...f, prenom: v }))} />
                <Input label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
              </>
            )}

            {delivery === "marseille" && (
              <>
                <Input label="Nom" value={form.nom} onChange={(v) => setForm((f) => ({ ...f, nom: v }))} />
                <Input label="Téléphone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
                <Input label="Adresse" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} />
                <Input label="Ville" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />
                <Input label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
              </>
            )}

            {delivery === "domicile" && (
              <>
                <Input label="Nom" value={form.nom} onChange={(v) => setForm((f) => ({ ...f, nom: v }))} />
                <Input label="Prénom" value={form.prenom} onChange={(v) => setForm((f) => ({ ...f, prenom: v }))} />
                <Input label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
                <Input label="Adresse" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} />
                <Input label="Ville" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />
                <Input label="Code postal" value={form.zip} onChange={(v) => setForm((f) => ({ ...f, zip: v }))} />

                <div className="mt-6 rounded-3xl border border-emerald-900/15 bg-emerald-50 p-5">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.pointRelay}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, pointRelay: e.target.checked }))
                      }
                      className="mt-1 h-5 w-5 accent-emerald-600"
                    />
                    <div>
                      <div className="font-extrabold">
                        Livraison en point relais (automatique)
                      </div>
                      <p className="text-sm text-emerald-900/70 mt-1">
                        Nous nous occupons de tout. Votre commande sera déposée dans le point
                        relais le plus proche de chez vous.
                      </p>
                    </div>
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-10">
          <div className="flex justify-between text-xl font-extrabold">
            <span>Total</span>
            <span>{total.toFixed(2)} €</span>
          </div>

          <button
            onClick={redirectToPayment}
            className="mt-6 w-full rounded-2xl bg-emerald-600 py-4 text-white font-extrabold"
            disabled={items.length === 0}
          >
            Payer
          </button>
        </div>
      </section>
    </main>
  );
}