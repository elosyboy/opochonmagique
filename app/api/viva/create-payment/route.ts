

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, customerTrns, customer } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Montant invalide." },
        { status: 400 }
      );
    }

    const clientId = process.env.VIVA_CLIENT_ID;
    const clientSecret = process.env.VIVA_CLIENT_SECRET;
    const sourceCode = process.env.VIVA_SOURCE_CODE;

    if (!clientId || !clientSecret || !sourceCode) {
      return NextResponse.json(
        { error: "Configuration Viva Wallet manquante." },
        { status: 500 }
      );
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const vivaResponse = await fetch(
      "https://api.vivapayments.com/checkout/v2/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount,
          sourceCode,
          merchantTrns: orderId ? `Commande ${orderId}` : "Commande Opochon Magic",
          customerTrns: customerTrns || "Commande Opochon Magic",
          customer: {
            email: customer?.email || undefined,
            fullName: customer?.fullName || undefined,
            phone: customer?.phone || undefined,
          },
          paymentTimeout: 1800,
        }),
      }
    );

    const data = await vivaResponse.json();

    if (!vivaResponse.ok || !data.orderCode) {
      console.error("Erreur Viva Wallet:", data);

      return NextResponse.json(
        { error: "Viva Wallet a refusé la création du paiement.", details: data },
        { status: vivaResponse.status || 500 }
      );
    }

    return NextResponse.json({
      orderCode: data.orderCode,
      redirectUrl: `https://www.vivapayments.com/web/checkout?ref=${data.orderCode}`,
    });
  } catch (error) {
    console.error("Erreur création paiement Viva Wallet:", error);

    return NextResponse.json(
      { error: "Erreur serveur pendant la création du paiement Viva Wallet." },
      { status: 500 }
    );
  }
}