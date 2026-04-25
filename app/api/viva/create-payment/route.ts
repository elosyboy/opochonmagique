

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

    // 1) Get OAuth token from Viva
    const tokenResponse = await fetch(
      "https://accounts.vivapayments.com/connect/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Erreur token Viva Wallet:", tokenData);

      return NextResponse.json(
        {
          error: "Impossible de s'authentifier auprès de Viva Wallet.",
          details: tokenData,
        },
        { status: tokenResponse.status || 500 }
      );
    }

    // 2) Create payment order with Bearer token
    const vivaResponse = await fetch(
      "https://api.vivapayments.com/checkout/v2/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.access_token}`,
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