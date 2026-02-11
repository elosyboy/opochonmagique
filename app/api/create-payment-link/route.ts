import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { total } = body;

    if (!total || total <= 0) {
      return NextResponse.json(
        { error: "Montant invalide" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${process.env.QONTO_API_BASE_URL}/v2/payment_links`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.QONTO_API_KEY?.trim()}`,
          "X-Qonto-Organization-Id": process.env.QONTO_ORGANIZATION_ID!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: "EUR",
          description: "Commande Opochon Magique",
          reference: `order_${Date.now()}`,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Qonto error:", err);
      return NextResponse.json({ error: "Erreur Qonto" }, { status: 500 });
    }

    const data = await res.json();

    return NextResponse.json({
      payment_url: data.payment_link?.url,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}