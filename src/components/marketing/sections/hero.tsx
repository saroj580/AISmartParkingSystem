"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bike, Car, Truck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SLOTS = [
  "A1", "A2", "A3", "A4", "A5", "A6",
  "B1", "B2", "B3", "B4", "B5", "B6",
  "C1", "C2", "C3", "C4", "C5", "C6",
];
const OCCUPIED = new Set(["A2", "A5", "B1", "B3", "B4", "C2", "C5", "C6"]);
const RESERVED = new Set(["A6", "C1"]);

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid mask-fade-b absolute inset-0 -z-10" />
      <div
        className="absolute -top-40 left-1/2 -z-10 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.14] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--brand), transparent)",
        }}
      />

      <div className="mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-32 lg:pt-28">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="brand" size="md" className="mb-6">
              <span className="size-1.5 rounded-full bg-brand" />
              Now live in 40+ cities
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-balance font-display text-[2.75rem] font-semibold leading-[1.08] tracking-tight sm:text-6xl"
          >
            Parking, reserved
            <br />
            before you arrive.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground"
          >
            HamroPark finds, holds, and unlocks the exact space you need — for two,
            three, and four-wheelers — with real-time availability and a QR
            pass that gets you in and out in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Button size="xl" asChild>
              <Link href="/driver">
                Find parking near you
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="xl" variant="secondary" asChild>
              <Link href="/operator">List your parking lot</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            {["No surge pricing", "Free cancellation", "Instant QR access"].map(
              (t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-available" />
                  {t}
                </span>
              ),
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="rounded-[var(--radius-2xl)] border border-border bg-card p-5 shadow-lg sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Marina Bay SmartDeck</p>
                <p className="text-xs text-muted-foreground">
                  Deck D · updated just now
                </p>
              </div>
              <Badge variant="available" dot>
                Open
              </Badge>
            </div>

            <div className="mt-5 grid grid-cols-6 gap-1.5">
              {SLOTS.map((slot) => {
                const state = OCCUPIED.has(slot)
                  ? "occupied"
                  : RESERVED.has(slot)
                    ? "reserved"
                    : "available";
                return (
                  <div
                    key={slot}
                    className={
                      "aspect-square rounded-[5px] " +
                      (state === "occupied"
                        ? "bg-full/70"
                        : state === "reserved"
                          ? "bg-limited/70"
                          : "bg-available/70")
                    }
                    title={slot}
                  />
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-[2px] bg-available/70" />
                Available
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-[2px] bg-limited/70" />
                Reserved
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-[2px] bg-full/70" />
                Occupied
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-5">
              {[
                { Icon: Bike, label: "2W", value: "34/80" },
                { Icon: Truck, label: "3W", value: "3/20" },
                { Icon: Car, label: "4W", value: "96/240" },
              ].map(({ Icon, label, value }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 rounded-[var(--radius-sm)] bg-surface-muted py-2.5"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="text-[13px] font-semibold tabular-nums">
                    {value}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 12, y: -8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute -right-5 -top-5 hidden rounded-[var(--radius-md)] border border-border bg-card px-3.5 py-2.5 shadow-md sm:block"
          >
            <p className="text-[11px] text-muted-foreground">Space held for</p>
            <p className="font-mono text-sm font-semibold">04:58</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
