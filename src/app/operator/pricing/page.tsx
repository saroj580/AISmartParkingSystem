"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VEHICLE_META, VEHICLE_TYPES } from "@/constants/vehicles";
import { operatorLots } from "@/data/lots";
import { CURRENT_OPERATOR } from "@/data/user";
import { toast } from "sonner";

export default function OperatorPricingPage() {
  const lots = operatorLots(CURRENT_OPERATOR.id);
  const [activeLotId, setActiveLotId] = useState(lots[0]?.id ?? "");
  const lot = lots.find((l) => l.id === activeLotId) ?? lots[0]!;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Pricing"
        description="Set hourly and daily-max rates by vehicle type, per lot."
      />

      <div className="flex flex-wrap gap-2">
        {lots.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveLotId(l.id)}
            className={
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors " +
              (activeLotId === l.id
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border text-muted-foreground hover:bg-muted")
            }
          >
            {l.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {VEHICLE_TYPES.map((type) => {
          const meta = VEHICLE_META[type];
          const Icon = meta.icon;
          const pricing = lot.pricing[type];
          return (
            <div key={type} className="rounded-[var(--radius-lg)] border border-border bg-card p-5">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-[var(--radius-sm)] bg-brand-subtle text-brand-subtle-foreground">
                  <Icon className="size-4" />
                </span>
                <p className="text-[15px] font-semibold">{meta.label}</p>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <Label>Hourly rate</Label>
                  <Input
                    type="number"
                    step="0.25"
                    defaultValue={pricing.baseRatePerHour}
                    leadingIcon={<span className="text-xs">$</span>}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Daily max rate</Label>
                  <Input
                    type="number"
                    step="0.5"
                    defaultValue={pricing.dailyMaxRate}
                    leadingIcon={<span className="text-xs">$</span>}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Weekend multiplier</Label>
                  <Input type="number" step="0.1" defaultValue={1.2} leadingIcon={<span className="text-xs">×</span>} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        className="w-fit"
        onClick={() => toast.success(`Pricing updated for ${lot.name}`)}
      >
        <Save className="size-4" />
        Save pricing rules
      </Button>
    </div>
  );
}
