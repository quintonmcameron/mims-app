import Stripe from "stripe";
import { NextResponse } from "next/server";

function stripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function GET(req: Request) {
  const stripe = stripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    const paid =
      session.payment_status === "paid" || session.status === "complete";

    let subscriptionActive = false;
    let currentPeriodEnd: string | undefined;
    let stripeSubscriptionId: string | undefined;
    let stripeCustomerId: string | undefined;

    const sub = session.subscription;
    if (typeof sub === "object" && sub !== null) {
      subscriptionActive = sub.status === "active" || sub.status === "trialing";
      stripeSubscriptionId = sub.id;
      if (sub.current_period_end) {
        currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
      }
    } else if (typeof sub === "string" && paid) {
      const full = await stripe.subscriptions.retrieve(sub);
      subscriptionActive = full.status === "active" || full.status === "trialing";
      stripeSubscriptionId = full.id;
      if (full.current_period_end) {
        currentPeriodEnd = new Date(full.current_period_end * 1000).toISOString();
      }
    }

    if (typeof session.customer === "string") {
      stripeCustomerId = session.customer;
    }

    const active = paid && (subscriptionActive || session.mode === "subscription");

    return NextResponse.json({
      active,
      currentPeriodEnd,
      stripeSubscriptionId,
      stripeCustomerId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not verify session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
