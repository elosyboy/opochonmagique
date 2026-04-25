import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "API Viva Wallet active. Utilise POST depuis le panier pour créer un paiement.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, customerTrns, customer } = body;
    const vivaAmount = Number(amount);

    if (!Number.isFinite(vivaAmount) || vivaAmount <= 0) {
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
          scope: "urn:viva:payments:core:api:redirectcheckout",
        }),
      }
    );

    const tokenText = await tokenResponse.text();
    let tokenData: any = {};

    try {
      tokenData = tokenText ? JSON.parse(tokenText) : {};
    } catch {
      tokenData = { raw: tokenText };
    }

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

    const vivaResponse = await fetch(
      "https://api.vivapayments.com/checkout/v2/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.access_token}`,
        },
        body: JSON.stringify({
          amount: vivaAmount,
          sourceCode,
          merchantTrns: orderId ? `Commande ${orderId}` : "Commande Opochon Magic",
          customerTrns: customerTrns || "Commande Opochon Magic",
          customer: {
            email: customer?.email || undefined,
            fullName: customer?.fullName || undefined,
            phone: customer?.phone || undefined,
            countryCode: "FR",
            requestLang: "fr-FR",
          },
          paymentTimeout: 1800,
        }),
      }
    );

    const responseText = await vivaResponse.text();
    let data: any = {};

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { raw: responseText };
    }

    if (!vivaResponse.ok || !data.orderCode) {
      console.error("Erreur Viva Wallet:", data);

      return NextResponse.json(
        {
          error:
            data?.message ||
            data?.error_description ||
            data?.error ||
            "Viva Wallet a refusé la création du paiement.",
          details: data,
        },
        { status: vivaResponse.status || 500 }
      );
    }

    return NextResponse.json({
      orderCode: data.orderCode,
      redirectUrl: `https://www.vivapayments.com/web/checkout?ref=${data.orderCode}`,
    });
  } catch (error) {
    console.error("Erreur création paiement Viva Wallet:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur serveur pendant la création du paiement Viva Wallet.",
      },
      { status: 500 }
    );
  }
}