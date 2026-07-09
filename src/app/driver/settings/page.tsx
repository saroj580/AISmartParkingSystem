"use client";

import { useState } from "react";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CURRENT_DRIVER } from "@/data/user";
import { initials } from "@/lib/format";
import { toast } from "sonner";

export default function DriverSettingsPage() {
  const [prefs, setPrefs] = useState({
    emailReminders: true,
    pushReminders: true,
    emailReceipts: true,
    promoEmails: false,
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Settings" description="Manage your account preferences." />

      <section className="rounded-[var(--radius-lg)] border border-border bg-card p-6">
        <h2 className="text-[15px] font-semibold">Profile</h2>
        <div className="mt-5 flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback
              className="text-lg"
              style={{
                backgroundColor: `${CURRENT_DRIVER.avatarColor}22`,
                color: CURRENT_DRIVER.avatarColor,
              }}
            >
              {initials(CURRENT_DRIVER.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button variant="secondary" size="sm">
              Change photo
            </Button>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Member since{" "}
              {new Date(CURRENT_DRIVER.memberSince).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" defaultValue={CURRENT_DRIVER.name} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" defaultValue={CURRENT_DRIVER.email} type="email" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" defaultValue={CURRENT_DRIVER.phone} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" defaultValue={CURRENT_DRIVER.city} />
          </div>
        </div>

        <Button className="mt-6" onClick={() => toast.success("Profile updated")}>
          Save changes
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
          <Button variant="secondary" size="sm">
            <Plus className="size-4" />
            Add card
          </Button>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-[var(--radius-md)] border border-border p-4">
          <span className="flex items-center gap-3">
            <CreditCard className="size-5 text-muted-foreground" />
            <span>
              <span className="text-sm font-medium">Visa •••• 4242</span>
              <span className="block text-xs text-muted-foreground">
                Expires 12/28
              </span>
            </span>
          </span>
          <button className="text-muted-foreground hover:text-full">
            <Trash2 className="size-4" />
          </button>
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-full/30 bg-full-subtle/40 p-6">
        <h2 className="text-[15px] font-semibold text-full">Danger zone</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Deleting your account permanently removes your bookings, vehicles, and
          payment history.
        </p>
        <Button variant="destructive" size="sm" className="mt-4">
          Delete account
        </Button>
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
