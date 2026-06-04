import Stripe from "stripe";
import { NextResponse } from "next/server";

function stripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function appOrigin(req: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return "http://localhost:3000";
}

export async function POST(req: Request) {
  const stripe = stripeClient();
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!stripe || !priceId) {
    return NextResponse.json(
      {
        error:
          "Billing is not configured. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID in Vercel (or .env.local).",
      },
      { status: 503 },
    );
  }

  let email: string | undefined;
  let deviceId: string | undefined;
  try {
    const body = (await req.json()) as { email?: string; deviceId?: string };
    email = body.email?.trim() || undefined;
    deviceId = body.deviceId?.trim() || undefined;
  } catch {
    /* optional body */
  }

  const origin = appOrigin(req);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled`,
      customer_email: email,
      client_reference_id: deviceId,
      metadata: deviceId ? { deviceId } : undefined,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
