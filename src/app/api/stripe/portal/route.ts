import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getBearerToken, verifyIdToken } from "@/lib/firebase/verifyIdToken";
import { getUserDocField } from "@/lib/firebase/adminRest";

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

    const customerId = await getUserDocField(uid, "stripeCustomerId");
    if (!customerId) {
      return NextResponse.json({ error: "有効な契約情報が見つかりません" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dokodoko.pages.dev";
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    return NextResponse.json({ error: "プラン管理画面の作成に失敗しました" }, { status: 500 });
  }
}
