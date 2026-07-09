"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [flags, setFlags] = useState({
    newOperatorSelfServe: true,
    dynamicPricing: true,
    maintenanceMode: false,
    threeWheelerSupport: true,
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Platform settings" description="Global configuration for the Parkly platform." />

      <section className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
        <h2 className="text-[15px] font-semibold">Billing & fees</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Platform take rate</Label>
            <Input defaultValue="8" leadingIcon={<span className="text-xs">%</span>} type="number" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Default currency</Label>
            <Select defaultValue="USD">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD — US Dollar</SelectItem>
                <SelectItem value="EUR">EUR — Euro</SelectItem>
                <SelectItem value="GBP">GBP — British Pound</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Payout schedule</Label>
            <Select defaultValue="weekly">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Support email</Label>
            <Input defaultValue="support@parkly.com" type="email" />
          </div>
        </div>
        <Button className="mt-6" onClick={() => toast.success("Settings saved")}>
          Save changes
        </Button>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
        <h2 className="text-[15px] font-semibold">Feature flags</h2>
        <div className="mt-5 flex flex-col gap-4">
          <FlagRow
            label="Operator self-serve onboarding"
            description="Allow new operators to sign up and list lots without manual approval."
            checked={flags.newOperatorSelfServe}
            onChange={(v) => setFlags((f) => ({ ...f, newOperatorSelfServe: v }))}
          />
          <Separator />
          <FlagRow
            label="Dynamic pricing engine"
            description="Enable demand-based rate adjustments across all lots."
            checked={flags.dynamicPricing}
            onChange={(v) => setFlags((f) => ({ ...f, dynamicPricing: v }))}
          />
          <Separator />
          <FlagRow
            label="Three-wheeler support"
            description="Show three-wheeler zones and pricing across the platform."
            checked={flags.threeWheelerSupport}
            onChange={(v) => setFlags((f) => ({ ...f, threeWheelerSupport: v }))}
          />
          <Separator />
          <FlagRow
            label="Maintenance mode"
            description="Show a maintenance banner and pause new bookings platform-wide."
            checked={flags.maintenanceMode}
            onChange={(v) => setFlags((f) => ({ ...f, maintenanceMode: v }))}
          />
        </div>
      </section>
    </div>
  );
}

function FlagRow({
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
