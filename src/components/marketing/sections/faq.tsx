"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/cn";

const FAQS = [
  {
    q: "Which vehicle types does Parkly support?",
    a: "Parkly is built around three vehicle categories: two-wheelers (motorcycles and scooters), three-wheelers (auto-rickshaws and similar), and four-wheelers (cars, SUVs, and vans). Every lot displays live availability and pricing separately for each type.",
  },
  {
    q: "What happens if I'm late to check in?",
    a: "Your reserved space is held for a configurable grace window after your start time. If you haven't checked in by then, the hold is released and the space returns to availability — you'll be notified before that happens.",
  },
  {
    q: "Can I cancel or change a booking?",
    a: "Yes. Bookings can be cancelled free of charge up until 30 minutes before the reserved start time, with an instant refund to your original payment method.",
  },
  {
    q: "How does QR check-in work without app internet access?",
    a: "Your pass is generated and cached on your device the moment payment succeeds, so it scans locally at the barrier even with a weak signal. The system reconciles the check-in with the server as soon as connectivity returns.",
  },
  {
    q: "How do operators get paid?",
    a: "Revenue settles to the operator's connected bank account on a rolling schedule, with a full transaction ledger and downloadable statements available in the operator dashboard.",
  },
  {
    q: "Is there a contract or lock-in period?",
    a: "Starter and Growth plans are month-to-month with no lock-in. Enterprise agreements are negotiated based on your network's size and support needs.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24 lg:py-32">
      <Reveal className="text-center">
        <p className="text-sm font-medium text-brand">FAQ</p>
        <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Questions, answered
        </h2>
      </Reveal>

      <div className="mt-14 divide-y divide-border rounded-[var(--radius-xl)] border border-border bg-card">
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="px-6">
              <button
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span className="text-[15px] font-medium">{item.q}</span>
                <Plus
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-300",
                    isOpen && "rotate-45",
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 pr-8 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
