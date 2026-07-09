"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { toast } from "sonner";

export function DriverSettingsClient({
  firstName,
  lastName,
  email,
  phone,
  avatarColor,
  memberSince,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarColor: string;
  memberSince: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ firstName, lastName, phone });
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    emailReminders: true,
    pushReminders: true,
    emailReceipts: true,
    promoEmails: false,
  });

  async function saveProfile() {
    setSaving(true);
    const res = await fetch("/api/v1/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        ...(form.phone ? { phone: form.phone } : {}),
      }),
    });
    const json = await res.json().catch(() => null);
    setSaving(false);

    if (!res.ok || !json?.success) {
      toast.error(json?.error?.message ?? "Couldn't update profile");
      return;
    }
    toast.success("Profile updated");
    router.refresh();
  }

  const name = `${form.firstName} ${form.lastName}`;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Settings" description="Manage your account preferences." />

      <section className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
        <h2 className="text-[15px] font-semibold">Profile</h2>
        <div className="mt-5 flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback
              className="text-lg"
              style={{ backgroundColor: `${avatarColor}22`, color: avatarColor }}
            >
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button variant="secondary" size="sm" disabled>
              Change photo
            </Button>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Member since{" "}
              {new Date(memberSince).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" defaultValue={email} type="email" disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
        </div>

        <Button className="mt-6" onClick={saveProfile} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
        <h2 className="text-[15px] font-semibold">Notification preferences</h2>
        <div className="mt-5 flex flex-col gap-4">
          <PrefRow
            label="Booking reminders (email)"
            description="Get an email 30 minutes before your reservation starts."
            checked={prefs.emailReminders}
            onChange={(v) => setPrefs((p) => ({ ...p, emailReminders: v }))}
          />
          <Separator />
          <PrefRow
            label="Booking reminders (push)"
            description="Push notifications for check-in windows and expiring holds."
            checked={prefs.pushReminders}
            onChange={(v) => setPrefs((p) => ({ ...p, pushReminders: v }))}
          />
          <Separator />
          <PrefRow
            label="Email receipts"
            description="Receive a receipt after every completed payment."
            checked={prefs.emailReceipts}
            onChange={(v) => setPrefs((p) => ({ ...p, emailReceipts: v }))}
          />
          <Separator />
          <PrefRow
            label="Product updates & offers"
            description="Occasional emails about new features and promotions."
            checked={prefs.promoEmails}
            onChange={(v) => setPrefs((p) => ({ ...p, promoEmails: v }))}
          />
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Payment methods</h2>
          <Button variant="secondary" size="sm" disabled>
            <Plus className="size-4" />
            Add card
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Card details are managed securely by Stripe at checkout and aren&apos;t stored here.
        </p>
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
