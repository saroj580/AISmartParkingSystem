"use client";

import { useState } from "react";
import {
  Bell,
  CheckCheck,
  QrCode,
  CreditCard,
  CalendarClock,
  LogOut as LogOutIcon,
  RotateCcw,
  MegaphoneIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/format";
import type { AppNotification, NotificationType } from "@/types/domain";
import { cn } from "@/lib/cn";

const ICONS: Record<NotificationType, typeof Bell> = {
  BOOKING_CONFIRMATION: CalendarClock,
  PAYMENT_CONFIRMATION: CreditCard,
  BOOKING_REMINDER: Bell,
  BOOKING_EXPIRY: Bell,
  CHECK_IN: QrCode,
  CHECK_OUT: LogOutIcon,
  REFUND_CONFIRMATION: RotateCcw,
  OPERATOR_ALERT: MegaphoneIcon,
};

export function NotificationsClient({ notifications }: { notifications: AppNotification[] }) {
  const [items, setItems] = useState(notifications);
  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Notifications"
        description={
          unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"
        }
        actions={
          unreadCount > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setItems((v) => v.map((n) => ({ ...n, read: true })))}
            >
              <CheckCheck className="size-4" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState icon={<Bell />} title="No notifications" />
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-card">
          {items.map((n) => {
            const Icon = ICONS[n.type];
            return (
              <button
                key={n.id}
                onClick={() =>
                  setItems((v) =>
                    v.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
                  )
                }
                className={cn(
                  "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50",
                  !n.read && "bg-brand-subtle/40",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    n.read ? "bg-muted text-muted-foreground" : "bg-brand-subtle text-brand-subtle-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium leading-snug">
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {formatDateTime(n.createdAt)}
                  </p>
                </div>
                {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
