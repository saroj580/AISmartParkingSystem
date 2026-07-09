import { Reveal } from "@/components/marketing/reveal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/format";

const TESTIMONIALS = [
  {
    quote:
      "We cut check-in time from four minutes to under fifteen seconds. Attendants scan, the barrier lifts, done. Our weekend abuse complaints dropped to almost zero.",
    name: "Rohan Mehta",
    role: "General Manager, UrbanPark Holdings",
    color: "#2a78d6",
  },
  {
    quote:
      "The two-wheeler zone alone paid for the rollout. We finally have real numbers on utilization by vehicle type instead of guessing from ticket stubs.",
    name: "Janelle Kwon",
    role: "Operations Lead, Metro Spaces Inc.",
    color: "#1baf7a",
  },
  {
    quote:
      "I book my CSMIA long-stay from the departures lounge now. The QR pass on my phone is the only thing I need — no more hunting for a paper ticket.",
    name: "Ananya Chetan",
    role: "Frequent driver, Mumbai",
    color: "#e87ba4",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-brand">Testimonials</p>
        <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Loved by operators and drivers alike
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.08}>
            <figure className="flex h-full flex-col justify-between rounded-[var(--radius-xl)] border border-border bg-card p-7">
              <blockquote className="text-[15px] leading-relaxed text-foreground/90">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3">
                <Avatar>
                  <AvatarFallback
                    style={{ backgroundColor: `${t.color}22`, color: t.color }}
                  >
                    {initials(t.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
