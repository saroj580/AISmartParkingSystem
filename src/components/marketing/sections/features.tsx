import {
  Radar,
  QrCode,
  CreditCard,
  Bell,
  Car,
  BarChart3,
} from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const FEATURES = [
  {
    icon: Radar,
    title: "Real-time availability",
    description:
      "Live space counts refresh every few seconds across two, three, and four-wheeler zones — no more guessing before you drive over.",
  },
  {
    icon: QrCode,
    title: "QR check-in & check-out",
    description:
      "Every booking generates a single-use pass. Scan in, scan out — barriers lift automatically, no ticket, no line.",
  },
  {
    icon: CreditCard,
    title: "Pay once, done",
    description:
      "Cards on file, transparent hourly and daily-max rates, and instant refunds if plans change before your hold window ends.",
  },
  {
    icon: Car,
    title: "Built for every vehicle",
    description:
      "Dedicated zones and pricing for two-wheelers, three-wheelers, and cars — never squeezed into a one-size-fits-all bay.",
  },
  {
    icon: Bell,
    title: "Timely, useful alerts",
    description:
      "Reminders before your window starts, a nudge before it ends, and a receipt the moment you're checked out.",
  },
  {
    icon: BarChart3,
    title: "Analytics for operators",
    description:
      "Occupancy heatmaps, peak-hour breakdowns, and revenue trends so every lot is priced and staffed correctly.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-brand">Platform</p>
        <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything a modern parking network needs
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          One system for drivers, operators, and administrators — connected by
          the same real-time inventory.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-px overflow-hidden rounded-[var(--radius-xl)] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.05}>
            <div className="group h-full bg-card p-7 transition-colors hover:bg-surface-muted">
              <span className="flex size-10 items-center justify-center rounded-[var(--radius-sm)] bg-brand-subtle text-brand-subtle-foreground">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-5 text-[15px] font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
