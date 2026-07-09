import { Check } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

const PLANS = [
  {
    name: "Starter",
    price: "₹0",
    period: "/mo",
    description: "For single-lot operators getting started.",
    features: [
      "Up to 1 parking lot",
      "150 managed spaces",
      "QR check-in & check-out",
      "Email support",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "₹19,999",
    period: "/mo",
    description: "For multi-lot operators scaling across a city.",
    features: [
      "Up to 10 parking lots",
      "Unlimited managed spaces",
      "Dynamic pricing rules",
      "Live occupancy analytics",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For networks and municipal parking authorities.",
    features: [
      "Unlimited lots & spaces",
      "Custom SLAs & onboarding",
      "Dedicated account manager",
      "SSO & audit logs",
      "Custom reporting & API access",
    ],
    cta: "Talk to sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-surface-muted/40 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-brand">Pricing</p>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple plans for operators of any size
          </h2>
          <p className="mt-4 text-muted-foreground">
            The driver app is always free. Operators pay one flat platform fee
            — no per-transaction surprises.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08}>
              <div
                className={cn(
                  "flex h-full flex-col rounded-[var(--radius-xl)] border p-8",
                  plan.highlighted
                    ? "border-brand bg-card shadow-[var(--shadow-glow)]"
                    : "border-border bg-card",
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">
                    {plan.name}
                  </h3>
                  {plan.highlighted && <Badge variant="brand">Most popular</Badge>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-semibold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <ul className="mt-7 flex flex-1 flex-col gap-3.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-available" />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8"
                  variant={plan.highlighted ? "primary" : "secondary"}
                >
                  {plan.cta}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}