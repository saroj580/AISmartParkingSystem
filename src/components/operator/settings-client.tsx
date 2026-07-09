"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export function OperatorSettingsClient({
  companyName,
  firstName,
  lastName,
  email,
  phone,
}: {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ companyName, firstName, lastName, phone });
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    dailySummary: true,
    lowAvailabilityAlerts: true,
    payoutEmails: true,
  });

  async function handleSave() {
    setSaving(true);
    const [companyRes, profileRes] = await Promise.all([
      fetch("/api/v1/operators/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: form.companyName }),
      }),
      fetch("/api/v1/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, ...(form.phone ? { phone: form.phone } : {}) }),
      }),
    ]);
    setSaving(false);

    if (!companyRes.ok || !profileRes.ok) {
      toast.error("Couldn't update company profile");
      return;
    }
    toast.success("Company profile updated");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Settings" description="Manage your company account." />

      <section className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
        <h2 className="text-[15px] font-semibold">Company profile</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Company name</Label>
            <Input value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Contact name</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="First name"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              />
              <Input
                placeholder="Last name"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Billing email</Label>
            <Input type="email" defaultValue={email} disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Support phone</Label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
        </div>
        <Button className="mt-6" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold">
          <Landmark className="size-4" />
          Payout account
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Payouts require a connected bank account and a live Stripe Connect integration, which
          isn&apos;t set up on this instance yet. Bookings can still be marked paid in cash from the
          Bookings page.
        </p>
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
