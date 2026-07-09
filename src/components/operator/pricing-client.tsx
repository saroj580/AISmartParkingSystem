"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VEHICLE_META, VEHICLE_TYPES } from "@/constants/vehicles";
import type { VehicleType } from "@/types/domain";
import { updatePricingRule } from "@/app/operator/pricing/actions";

export interface LotPricingRule {
  id: string;
  vehicleType: VehicleType;
  baseRatePerHour: number;
  dailyMaxRate: number;
  weekendMultiplier: number;
}

export function PricingClient({
  lots,
}: {
  lots: { id: string; name: string; rules: LotPricingRule[] }[];
}) {
  const router = useRouter();
  const [activeLotId, setActiveLotId] = useState(lots[0]?.id ?? "");
  const [saving, setSaving] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, { baseRatePerHour: number; dailyMaxRate: number; weekendMultiplier: number }>>(
    () =>
      Object.fromEntries(
        lots.flatMap((l) => l.rules.map((r) => [r.id, { baseRatePerHour: r.baseRatePerHour, dailyMaxRate: r.dailyMaxRate, weekendMultiplier: r.weekendMultiplier }])),
      ),
  );

  const lot = lots.find((l) => l.id === activeLotId) ?? lots[0];
  if (!lot) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Add a parking lot first to configure pricing.
      </div>
    );
  }

  async function saveRule(ruleId: string) {
    const v = values[ruleId];
    if (!v) return;
    setSaving(ruleId);
    const result = await updatePricingRule(ruleId, v);
    setSaving(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Pricing updated");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
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
          const rule = lot.rules.find((r) => r.vehicleType === type);
          if (!rule) {
            return (
              <div key={type} className="rounded-[var(--radius-lg)] border border-dashed border-border p-5 text-sm text-muted-foreground">
                No pricing configured for {meta.label} at this lot.
              </div>
            );
          }
          const v = values[rule.id]!;
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
                    value={v.baseRatePerHour}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [rule.id]: { ...prev[rule.id]!, baseRatePerHour: Number(e.target.value) } }))
                    }
                    leadingIcon={<span className="text-xs">₹</span>}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Daily max rate</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={v.dailyMaxRate}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [rule.id]: { ...prev[rule.id]!, dailyMaxRate: Number(e.target.value) } }))
                    }
                    leadingIcon={<span className="text-xs">₹</span>}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Weekend multiplier</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min={1}
                    max={5}
                    value={v.weekendMultiplier}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [rule.id]: { ...prev[rule.id]!, weekendMultiplier: Number(e.target.value) } }))
                    }
                    leadingIcon={<span className="text-xs">×</span>}
                  />
                </div>
              </div>
              <Button className="mt-4" size="sm" onClick={() => saveRule(rule.id)} disabled={saving === rule.id}>
                <Save className="size-4" />
                {saving === rule.id ? "Saving…" : "Save"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
