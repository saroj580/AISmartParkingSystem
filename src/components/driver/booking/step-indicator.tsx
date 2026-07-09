"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export interface WizardStep {
  key: string;
  label: string;
}

export function StepIndicator({
  steps,
  activeIndex,
}: {
  steps: WizardStep[];
  activeIndex: number;
}) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "pending";
        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  state === "done" && "border-brand bg-brand text-brand-foreground",
                  state === "active" && "border-brand bg-brand-subtle text-brand-subtle-foreground",
                  state === "pending" && "border-border bg-surface text-muted-foreground",
                )}
              >
                {state === "done" ? <Check className="size-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-[11px] font-medium sm:block",
                  state === "pending" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-px flex-1 transition-colors",
                  i < activeIndex ? "bg-brand" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
