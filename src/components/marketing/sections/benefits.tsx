import { Check } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const DRIVER_POINTS = [
  "Compare live rates across every nearby lot before you commit",
  "One saved vehicle list — switch between bike, auto, or car in a tap",
  "Cancel free up to 30 minutes before your window starts",
  "Full booking and payment history, exportable anytime",
];

const OPERATOR_POINTS = [
  "Dynamic pricing rules by vehicle type, day, and demand",
  "Live occupancy across every zone and floor, updated in real time",
  "Built-in QR scanner app for attendants — no extra hardware",
  "Revenue, utilization, and peak-hour analytics out of the box",
];

export function Benefits() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
      <div className="grid gap-8 lg:grid-cols-2">
        <Reveal>
          <div className="flex h-full flex-col rounded-[var(--radius-2xl)] border border-border bg-card p-8 sm:p-10">
            <span className="text-sm font-medium text-brand">For drivers</span>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
              Never circle the block again
            </h3>
            <ul className="mt-7 flex flex-col gap-4">
              {DRIVER_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-available" />
                  <span className="text-foreground/90">{p}</span>
                </li>
              ))}
            </ul>
            <Button variant="secondary" className="mt-8 w-fit" asChild>
              <Link href="/register?role=DRIVER">Explore the driver app</Link>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="flex h-full flex-col rounded-[var(--radius-2xl)] border border-border bg-foreground p-8 text-background sm:p-10">
            <span className="text-sm font-medium text-brand-subtle">
              For operators
            </span>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
              Run every lot from one dashboard
            </h3>
            <ul className="mt-7 flex flex-col gap-4">
              {OPERATOR_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-available" />
                  <span className="text-background/85">{p}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="secondary"
              className="mt-8 w-fit bg-background text-foreground hover:bg-background/90"
              asChild
            >
              <Link href="/register?role=OPERATOR">Explore the operator dashboard</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
