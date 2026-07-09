"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { Reveal } from "@/components/marketing/reveal";

const STATS = [
  { value: 2400, suffix: "+", label: "Parking lots connected" },
  { value: 41, suffix: "", label: "Cities live" },
  { value: 6.2, suffix: "M", label: "Bookings completed", decimals: 1 },
  { value: 99.95, suffix: "%", label: "Platform uptime", decimals: 2 },
];

function Counter({
  value,
  suffix,
  decimals = 0,
}: {
  value: number;
  suffix: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1400, bounce: 0 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  useEffect(() => {
    return spring.on("change", (v) => {
      setDisplay(
        decimals > 0
          ? v.toFixed(decimals)
          : Math.round(v).toLocaleString("en-US"),
      );
    });
  }, [spring, decimals]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="border-y border-border bg-foreground py-20 text-background">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06} className="text-center lg:text-left">
            <p className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              <Counter value={s.value} suffix={s.suffix} decimals={s.decimals} />
            </p>
            <p className="mt-2 text-sm text-background/60">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
