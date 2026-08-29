import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getBearerToken, verifyIdToken } from "@/lib/firebase/verifyIdToken";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const idToken = getBearerToken(request);
    if (!idToken) {
      return NextResponse.json({ error: "認証情報がありません" }, { status: 401 });
    }

    const uid = await verifyIdToken(idToken);
    if (!uid) {
      return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dokodoko.pages.dev";
    if (!priceId) {
      console.error("STRIPE_PRICE_ID is not set");
      return NextResponse.json({ error: "サーバー設定エラーが発生しました" }, { status: 500 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: uid,
      metadata: { firebaseUid: uid },
      subscription_data: { metadata: { firebaseUid: uid } },
      success_url: `${siteUrl}/settings?upgrade=success`,
      cancel_url: `${siteUrl}/pricing?upgrade=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "決済ページの作成に失敗しました" }, { status: 500 });
  }
}
