import Stripe from "stripe";
import { ENV } from "./_core/env";

if (!ENV.stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-10-29.clover",
});

export async function createCheckoutSession({
  orderId,
  tableNumber,
  totalAmountYen,
  customerEmail,
  customerName,
  origin,
}: {
  orderId: number;
  tableNumber: string;
  totalAmountYen: number;
  customerEmail?: string;
  customerName?: string;
  origin: string;
}) {
  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "jpy",
          product_data: {
            name: `テーブル ${tableNumber} のご注文`,
            description: `注文番号: #${orderId}`,
          },
          unit_amount: totalAmountYen,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
    cancel_url: `${origin}/payment-cancelled?order_id=${orderId}`,
    client_reference_id: orderId.toString(),
    metadata: {
      order_id: orderId.toString(),
      table_number: tableNumber,
      customer_name: customerName || "",
    },
    allow_promotion_codes: true,
  };

  // Only add customer_email if it's provided and not empty
  if (customerEmail && customerEmail.trim() !== "") {
    sessionConfig.customer_email = customerEmail;
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  return session;
}
