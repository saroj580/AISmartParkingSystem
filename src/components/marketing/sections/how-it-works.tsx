import { Search, CalendarCheck, QrCode, LogOut } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const STEPS = [
  {
    icon: Search,
    title: "Search your route",
    description:
      "Enter your destination and vehicle type. We surface every nearby lot with live space counts.",
  },
  {
    icon: CalendarCheck,
    title: "Reserve a slot",
    description:
      "Pick a date and time window, confirm the rate, and pay securely — your space is held instantly.",
  },
  {
    icon: QrCode,
    title: "Scan in with your pass",
    description:
      "A QR pass lands in your app the moment you book. Scan at the barrier — no ticket, no wait.",
  },
  {
    icon: LogOut,
    title: "Scan out and go",
    description:
      "Leave whenever you're ready. Scan out, the barrier lifts, and your receipt is emailed automatically.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-surface-muted/40 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-brand">How it works</p>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            From search to space in under a minute
          </h2>
        </Reveal>

        <div className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-border lg:block" />
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08} className="relative">
              <div className="relative flex size-12 items-center justify-center rounded-full border border-border bg-card text-brand shadow-xs">
                <step.icon className="size-5" />
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-brand-foreground">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-[15px] font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
