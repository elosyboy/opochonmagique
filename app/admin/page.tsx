"use client";

import React from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import Link from "next/link";


/* ================= FLAVORS ================= */
const PUFF_FLAVORS = [
  "Menthe",
  "Menthe glaciale",
  "Fruits rouges",
  "Fruit du dragon",
  "Mangue",
  "Ananas",
  "Citron",
  "Citron vert",
  "Orange",
  "Pêche",
  "Fraise",
  "Framboise",
  "Myrtille",
  "Coco",
  "Vanille",
  "Cola",
  "Bubble gum",
  "Raisin",
  "Pastèque",
  "Pomme",
  "Poire",
  "Autre",
];

const TERROIR_FLAVORS = ["Fruité", "Boisé", "Acide", "Terreux", "Autre"];

const ACCESSORY_TYPES = [
  "Feuille",
  "Carton",
  "Grinder",
  "Briquet",
  "Plateau",
];

/* ================= FIREBASE ================= */
const firebaseConfig = {
  apiKey: "AIzaSyCn2BL2M5a-3c3JgbyeEQTWwZfwPoBEXx0",
  authDomain: "opochonmagique.firebaseapp.com",
  projectId: "opochonmagique",
  storageBucket: "opochonmagique.appspot.com",
  messagingSenderId: "952596006855",
  appId: "1:952596006855:web:2f520fa71cea3e16af7be2",
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

// ================= CLOUDINARY UPLOAD =================
async function uploadToCloudinary(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      console.error("Cloudinary upload failed:", await res.text());
      return null;
    }

    const data = await res.json();
    return data.secure_url ?? null;
  } catch (err) {
    console.error("Cloudinary exception:", err);
    return null;
  }
}

/* ================= DATA ================= */

/* ================= PAGE ================= */
export default function AdminPage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  // login
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError("Email ou mot de passe incorrect");
    }
  }

  async function logout() {
    await signOut(auth);
  }

  if (loading) {
    return <div className="min-h-screen grid place-items-center">Chargement…</div>;
  }

  if (!user) {
    return (
      <main className="min-h-screen grid place-items-center bg-white px-6">
        <form
          onSubmit={login}
          className="w-full max-w-sm border border-black rounded-xl p-8"
        >
          <h1 className="text-2xl font-extrabold text-black mb-6 text-center">
            Admin – Opochon Magique
          </h1>

          {error && <div className="text-red-600 mb-3 text-sm">{error}</div>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-black rounded-xl px-4 py-3 mb-3 text-black placeholder:text-black"
            required
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-black rounded-xl px-4 py-3 mb-4 text-black placeholder:text-black"
            required
          />

          <button className="w-full bg-black text-white py-3 rounded-xl font-extrabold">
            Se connecter
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-2xl font-extrabold text-black">
          Espace de Mohamed
        </h1>

        <div className="flex gap-4 items-center">
          <Link href="/admin/mesproduits" className="underline font-semibold text-black">
            Mes produits
          </Link>
          <button onClick={logout} className="underline font-semibold">
            Déconnexion
          </button>
        </div>
      </header>

      <AdminDashboard />
    </main>
  );
}

/* ================= DASHBOARD ================= */
function AdminDashboard() {
  const [category, setCategory] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [percentage, setPercentage] = React.useState("");
  const [bestSeller, setBestSeller] = React.useState(false);
  const [showOnHome, setShowOnHome] = React.useState(true);
  const [flavors, setFlavors] = React.useState<string[]>([]);
  const [priceRows, setPriceRows] = React.useState([{ price: "", grams: "" }]);
  const [photo1, setPhoto1] = React.useState<File | null>(null);
  const [photo2, setPhoto2] = React.useState<File | null>(null);

  // Accessoire : type
  const [accessoryType, setAccessoryType] = React.useState("");

  // States PROMO
  const [promo, setPromo] = React.useState(false);
  const [promoBasePrice, setPromoBasePrice] = React.useState("");
  const [promoPrice, setPromoPrice] = React.useState("");

  // States code promo global
  const [globalPromoCode, setGlobalPromoCode] = React.useState("");
  const [globalPromoPercent, setGlobalPromoPercent] = React.useState("");
  const [globalPromoSingleUse, setGlobalPromoSingleUse] = React.useState(false);

  const [orders, setOrders] = React.useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "orders"));
        const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setOrders(list);
      } finally {
        setOrdersLoading(false);
      }
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    let photoUrls: string[] = [];

    if (photo1) {
      const url1 = await uploadToCloudinary(photo1);
      if (url1) photoUrls.push(url1);
    }

    if (photo2) {
      const url2 = await uploadToCloudinary(photo2);
      if (url2) photoUrls.push(url2);
    }

    await addDoc(collection(db, "products"), {
      name,
      category,
      description,
      price: price ? Number(price) : null,
      priceByGrams:
        category === "fleur" || category === "resine" ? priceRows : null,
      flavors,
      accessoryType: accessoryType || null,
      bestSeller,
      showOnHome: showOnHome || promo,
      showOnPromo: promo,
      bestBadge: bestSeller ? "/assets/best.png" : null,
      photos: photoUrls,
      createdAt: serverTimestamp(),
      promo,
      promoBasePrice: promo ? Number(promoBasePrice) : null,
      promoPrice: promo ? Number(promoPrice) : null,
    });

    alert(
      photoUrls.length
        ? "Produit ajouté avec photos"
        : "Produit ajouté (photos non envoyées, modifiables plus tard)"
    );
    setName("");
    setDescription("");
    setPrice("");
    setPercentage("");
    setFlavors([]);
    setPriceRows([{ price: "", grams: "" }]);
    setBestSeller(false);
    setShowOnHome(true);
    setPhoto1(null);
    setPhoto2(null);
    setAccessoryType("");
    setPromo(false);
    setPromoBasePrice("");
    setPromoPrice("");
  }

  return (
    <React.Fragment>
      <section className="max-w-6xl mx-auto border border-black rounded-xl p-8">
        <h2 className="text-xl font-extrabold text-black mb-6">
          Ajouter un produit
        </h2>

        <form onSubmit={submit} className="space-y-6">
          {/* CATÉGORIE */}
          <CategorySelect value={category} onChange={setCategory} />

          {/* NOM */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du produit"
            className="w-full border border-black rounded-xl px-4 py-3 text-black placeholder:text-black"
            required
          />

          {/* DESCRIPTION */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description / commentaire"
            className="w-full border border-black rounded-xl px-4 py-3 min-h-[120px] text-black placeholder:text-black"
          />

          {/* PHOTOS */}
          <div className="space-y-2">
            <label className="font-extrabold text-black">Photos</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto1(e.target.files?.[0] || null)}
              className="w-full border border-black rounded-xl px-4 py-3 text-black"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto2(e.target.files?.[0] || null)}
              className="w-full border border-black rounded-xl px-4 py-3 text-black"
            />
          </div>

          {/* PUFF / ACCESSOIRE / HUILE : PRIX */}
          {(category === "puff" ||
            category === "accessoire" ||
            category === "huile") && (
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              placeholder="Prix (€)"
              className="w-full border border-black rounded-xl px-4 py-3 text-black placeholder:text-black"
              required
            />
          )}

          {/* ACCESSOIRE : TYPE */}
          {category === "accessoire" && (
            <div className="space-y-2">
              <label className="font-extrabold text-black">Type d’accessoire</label>
              <select
                value={accessoryType}
                onChange={(e) => setAccessoryType(e.target.value)}
                className="w-full border border-black rounded-xl px-4 py-3 text-black"
                required
              >
                <option value="">Choisir un type</option>
                {ACCESSORY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}


          {/* FLEUR / RÉSINE : PRIX PAR GRAMMES */}
          {(category === "fleur" || category === "resine") && (
            <PriceGrammes rows={priceRows} setRows={setPriceRows} />
          )}

          {/* GOÛTS */}
          {category === "puff" && (
            <FlavorSelect values={flavors} setValues={setFlavors} options={PUFF_FLAVORS} />
          )}

          {(category === "fleur" || category === "resine") && (
            <FlavorSelect values={flavors} setValues={setFlavors} options={TERROIR_FLAVORS} />
          )}

          {/* FLAGS */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border border-black rounded-xl px-4 py-3">
              <div>
                <div className="font-extrabold text-black">Best seller</div>
                <div className="text-sm text-black">
                  Mettre ce produit en avant sur la boutique
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBestSeller(!bestSeller)}
                className={`px-5 py-2 rounded-xl font-extrabold border transition ${
                  bestSeller
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black"
                }`}
              >
                {bestSeller ? "OUI" : "NON"}
              </button>
            </div>

            {/* PROMOTION */}
            <div className="flex items-center justify-between border border-black rounded-xl px-4 py-3">
              <div>
                <div className="font-extrabold text-black">Promotion</div>
                <div className="text-sm text-black">
                  Afficher ce produit en promotion sur la page principale
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPromo(!promo)}
                className={`px-5 py-2 rounded-xl font-extrabold border transition ${
                  promo
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black"
                }`}
              >
                {promo ? "OUI" : "NON"}
              </button>
            </div>

            {/* Champs PRIX PROMO conditionnels */}
            {promo && (
              <div className="space-y-3 border border-black rounded-xl px-4 py-4">
                <input
                  type="number"
                  placeholder="Prix de base (€)"
                  value={promoBasePrice}
                  onChange={(e) => setPromoBasePrice(e.target.value)}
                  className="w-full border border-black rounded-xl px-4 py-3 text-black"
                  required
                />

                <input
                  type="number"
                  placeholder="Prix promotion (€)"
                  value={promoPrice}
                  onChange={(e) => setPromoPrice(e.target.value)}
                  className="w-full border border-black rounded-xl px-4 py-3 text-black"
                  required
                />
              </div>
            )}

            <div className="flex items-center justify-between border border-black rounded-xl px-4 py-3">
              <div>
                <div className="font-extrabold text-black">
                  Afficher sur la page principale
                </div>
                <div className="text-sm text-black">
                  Produit visible sur la page principale
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowOnHome(!showOnHome)}
                className={`px-5 py-2 rounded-xl font-extrabold border transition ${
                  showOnHome
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black"
                }`}
              >
                {showOnHome ? "OUI" : "NON"}
              </button>
            </div>
          </div>

          <button className="w-full bg-black text-white py-4 rounded-xl font-extrabold">
            Ajouter le produit
          </button>
        </form>
      </section>

      {/* Code promo global */}
      <section className="mt-10 border border-black rounded-xl p-8">
        <h3 className="text-xl font-extrabold text-black mb-6">
          Code promo global
        </h3>

        <div className="space-y-4">
          <input
            value={globalPromoCode}
            onChange={(e) => setGlobalPromoCode(e.target.value)}
            placeholder="Code promo (ex: OPO20)"
            className="w-full border border-black rounded-xl px-4 py-3 text-black placeholder:text-black"
          />

          <input
            type="number"
            value={globalPromoPercent}
            onChange={(e) => setGlobalPromoPercent(e.target.value)}
            placeholder="Réduction (%)"
            className="w-full border border-black rounded-xl px-4 py-3 text-black placeholder:text-black"
          />

          <label className="flex items-center gap-2 text-black font-semibold">
            <input
              type="checkbox"
              checked={globalPromoSingleUse}
              onChange={(e) => setGlobalPromoSingleUse(e.target.checked)}
            />
            Usage unique
          </label>

          <button
            type="button"
            className="bg-black text-white rounded-xl px-6 py-3 font-extrabold"
            onClick={async () => {
              await addDoc(collection(db, "promoCodes"), {
                code: globalPromoCode,
                percent: Number(globalPromoPercent),
                singleUse: globalPromoSingleUse,
                active: true,
                createdAt: serverTimestamp(),
              });
              alert("Code promo global créé");
              setGlobalPromoCode("");
              setGlobalPromoPercent("");
              setGlobalPromoSingleUse(false);
            }}
          >
            Créer le code promo
          </button>
        </div>
      </section>

      {/* Commandes */}
      <section className="mt-10 border border-black rounded-xl p-8">
        <h3 className="text-xl font-extrabold text-black mb-4">Commandes</h3>

        {ordersLoading ? (
          <div className="text-black">Chargement…</div>
        ) : orders.length === 0 ? (
          <div className="text-black">Aucune commande pour le moment.</div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const clientEmail = o.email || o.clientEmail || "";
              const orderRef = o.ref || o.id;
              const subjectVue = encodeURIComponent(`Commande ${orderRef} — vue`);
              const bodyVue = encodeURIComponent(
                `Bonjour,\\n\\nVotre commande ${orderRef} a bien été vue et passe en préparation.\\n\\nMerci — Opochon Magique`
              );
              const subjectPret = encodeURIComponent(`Commande ${orderRef} — prête`);
              const bodyPret = encodeURIComponent(
                `Bonjour,\\n\\nVotre commande ${orderRef} est prête.\\n\\nMerci — Opochon Magique`
              );

              return (
                <div key={o.id} className="border border-black rounded-xl p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-extrabold text-black">Commande {orderRef}</div>
                      <div className="text-sm text-black">{clientEmail || "Email client inconnu"}</div>
                    </div>
                    <div className="text-sm text-black">
                      Statut : <span className="font-semibold">{o.status || "nouvelle"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <a
                      className="border border-black rounded-xl px-4 py-2 font-semibold text-black hover:bg-black hover:text-white transition"
                      href={`mailto:${clientEmail}?subject=${subjectVue}&body=${bodyVue}`}
                      onClick={async () => {
                        try {
                          await updateDoc(doc(db, "orders", o.id), { status: "vue" });
                          setOrders((prev) => prev.map(x => x.id === o.id ? { ...x, status: "vue" } : x));
                        } catch {}
                      }}
                    >
                      Vue (mail)
                    </a>

                    <a
                      className="border border-black rounded-xl px-4 py-2 font-semibold text-black hover:bg-black hover:text-white transition"
                      href={`mailto:${clientEmail}?subject=${subjectPret}&body=${bodyPret}`}
                      onClick={async () => {
                        try {
                          await updateDoc(doc(db, "orders", o.id), { status: "prete" });
                          setOrders((prev) => prev.map(x => x.id === o.id ? { ...x, status: "prete" } : x));
                        } catch {}
                      }}
                    >
                      Prête (mail)
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </React.Fragment>
  );
}

/* ================= COMPONENTS ================= */
function CategorySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const categories = [
    { value: "fleur", label: "Fleur" },
    { value: "resine", label: "Résine" },
    { value: "puff", label: "Puff" },
    { value: "huile", label: "Huile" },
    { value: "accessoire", label: "Accessoire" },
  ];
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <label className="font-extrabold text-black mb-2 block">Catégorie</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border border-black rounded-xl px-4 py-3 text-left"
      >
        {categories.find((c) => c.value === value)?.label ||
          "Choisir une catégorie"}
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full border border-black rounded-xl bg-white">
          {categories.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => {
                onChange(c.value);
                setOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-black hover:bg-black hover:text-white"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FlavorSelect({
  values,
  setValues,
  options,
}: {
  values: string[];
  setValues: (v: string[]) => void;
  options: string[];
}) {
  const [open, setOpen] = React.useState(false);

  function toggle(flavor: string) {
    setValues(
      values.includes(flavor)
        ? values.filter((f) => f !== flavor)
        : [...values, flavor]
    );
  }

  return (
    <div className="relative">
      <label className="font-extrabold text-black mb-2 block">Goûts</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border border-black rounded-xl px-4 py-3 text-left"
      >
        {values.length ? values.join(", ") : "Choisir les goûts"}
      </button>

      {open && (
        <div className="absolute z-20 mt-2 max-h-56 overflow-y-auto w-full border border-black rounded-xl bg-white">
          {options.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => toggle(f)}
              className={`w-full px-4 py-2 text-left ${
                values.includes(f)
                  ? "bg-black text-white"
                  : "text-black hover:bg-black/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PriceGrammes({
  rows,
  setRows,
}: {
  rows: { price: string; grams: string }[];
  setRows: React.Dispatch<
    React.SetStateAction<{ price: string; grams: string }[]>
  >;
}) {
  return (
    <div className="space-y-3">
      <label className="font-extrabold text-black">Prix par grammes</label>

      {rows.map((r, i) => (
        <div key={i} className="flex gap-3">
          <input
            placeholder="Prix €"
            value={r.price}
            onChange={(e) => {
              const next = [...rows];
              next[i].price = e.target.value;
              setRows(next);
            }}
            className="flex-1 border border-black rounded-xl px-4 py-3 text-black placeholder:text-black"
          />
          <input
            placeholder="Grammes g"
            value={r.grams}
            onChange={(e) => {
              const next = [...rows];
              next[i].grams = e.target.value;
              setRows(next);
            }}
            className="flex-1 border border-black rounded-xl px-4 py-3 text-black placeholder:text-black"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => setRows([...rows, { price: "", grams: "" }])}
        className="underline font-semibold"
      >
        + Ajouter une ligne
      </button>
    </div>
  );
}