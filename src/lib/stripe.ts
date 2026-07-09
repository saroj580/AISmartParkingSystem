import Stripe from "stripe";
import { env } from "@/lib/env";

const globalForStripe = globalThis as unknown as { __stripe?: Stripe };

export const stripe =
  globalForStripe.__stripe ??
  new Stripe(env.STRIPE_SECRET_KEY, {
    typescript: true,
  });

if (env.NODE_ENV !== "production") {
  globalForStripe.__stripe = stripe;
}

/** Stripe expects amounts in the smallest currency unit (e.g. cents for USD). */
export function toStripeAmount(amount: number): number {
  return Math.round(amount * 100);
}

export function fromStripeAmount(amount: number): number {
  return amount / 100;
}
