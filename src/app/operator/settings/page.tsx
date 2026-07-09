"use client";

import { useState } from "react";
import { Landmark, KeyRound, Copy } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { CURRENT_OPERATOR } from "@/data/user";
import { toast } from "sonner";

export default function OperatorSettingsPage() {
  const [prefs, setPrefs] = useState({
    dailySummary: true,
    lowAvailabilityAlerts: true,
    payoutEmails: true,
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Settings" description="Manage your company account." />

      <section className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
        <h2 className="text-[15px] font-semibold">Company profile</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Company name</Label>
            <Input defaultValue={CURRENT_OPERATOR.company} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Contact name</Label>
            <Input defaultValue={CURRENT_OPERATOR.contactName} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Billing email</Label>
            <Input type="email" defaultValue={CURRENT_OPERATOR.email} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Support phone</Label>
            <Input defaultValue="+1 (415) 555-0198" />
          </div>
        </div>
        <Button className="mt-6" onClick={() => toast.success("Company profile updated")}>
          Save changes
        </Button>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold">
          <Landmark className="size-4" />
          Payout account
        </h2>
        <div className="mt-4 flex items-center justify-between rounded-[var(--radius-md)] border border-border p-4">
          <div>
            <p className="text-sm font-medium">Chase Business ****4821</p>
            <p className="text-xs text-muted-foreground">Payouts run every Monday</p>
          </div>
          <Button variant="secondary" size="sm">Update</Button>
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold">
          <KeyRound className="size-4" />
          API access
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Use this key to integrate barrier hardware or third-party systems.
        </p>
        <div className="mt-4 flex items-center justify-between rounded-[var(--radius-md)] border border-border bg-surface-muted p-3">
          <code className="font-mono text-xs text-muted-foreground">
            pk_live_51JX••••••••••••••••4f2A
          </code>
          <button
            onClick={() => toast.success("API key copied")}
            className="text-muted-foreground hover:text-foreground"
          >
            <Copy className="size-4" />
          </button>
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
        <h2 className="text-[15px] font-semibold">Notification preferences</h2>
        <div className="mt-5 flex flex-col gap-4">
          <PrefRow
            label="Daily summary email"
            description="A digest of yesterday's revenue and occupancy."
            checked={prefs.dailySummary}
            onChange={(v) => setPrefs((p) => ({ ...p, dailySummary: v }))}
          />
          <Separator />
          <PrefRow
            label="Low availability alerts"
            description="Get notified when a lot drops below 10% availability."
            checked={prefs.lowAvailabilityAlerts}
            onChange={(v) => setPrefs((p) => ({ ...p, lowAvailabilityAlerts: v }))}
          />
          <Separator />
          <PrefRow
            label="Payout confirmations"
            description="Email receipt each time a payout is sent to your bank."
            checked={prefs.payoutEmails}
            onChange={(v) => setPrefs((p) => ({ ...p, payoutEmails: v }))}
          />
        </div>
      </section>
    </div>
  );
}

function PrefRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
