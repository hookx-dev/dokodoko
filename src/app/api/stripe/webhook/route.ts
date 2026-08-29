import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { patchUserDoc, findUserIdByStripeCustomerId } from "@/lib/firebase/adminRest";

export const runtime = "edge";

async function activatePremium(uid: string, customerId: string, subscriptionId: string) {
  await patchUserDoc(uid, {
    plan: "premium",
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    subscriptionStatus: "active",
    planUpdatedAt: new Date(),
  });
}

async function syncSubscriptionStatus(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  let uid = subscription.metadata?.firebaseUid || null;
  if (!uid) {
    uid = await findUserIdByStripeCustomerId(customerId);
  }
  if (!uid) {
    console.error("No matching user found for Stripe customer:", customerId);
    return;
  }

  const isActive = subscription.status === "active" || subscription.status === "trialing";
  await patchUserDoc(uid, {
    plan: isActive ? "premium" : "free",
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: isActive ? "active" : subscription.status === "past_due" ? "past_due" : "canceled",
    planUpdatedAt: new Date(),
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "サーバー設定エラーが発生しました" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "署名がありません" }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.client_reference_id || session.metadata?.firebaseUid;
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        if (uid && customerId && subscriptionId) {
          await activatePremium(uid, customerId, subscriptionId);
        }
        break;
      }
      case "customer.subscription.updated": {
        await syncSubscriptionStatus(event.data.object as Stripe.Subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
        const uid =
          subscription.metadata?.firebaseUid || (await findUserIdByStripeCustomerId(customerId));
        if (uid) {
          await patchUserDoc(uid, {
            plan: "free",
            subscriptionStatus: "canceled",
            planUpdatedAt: new Date(),
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Failed to process Stripe webhook event:", event.type, err);
    return NextResponse.json({ error: "Webhook処理に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
