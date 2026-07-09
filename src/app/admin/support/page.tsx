"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/format";

interface Ticket {
  id: string;
  subject: string;
  requester: string;
  role: "Driver" | "Operator";
  priority: "low" | "medium" | "high";
  status: "open" | "pending" | "resolved";
  updatedAt: string;
  avatarColor: string;
}

const TICKETS: Ticket[] = [
  { id: "t1", subject: "Refund not received for cancelled booking", requester: "Marcus Webb", role: "Driver", priority: "high", status: "open", updatedAt: "12m ago", avatarColor: "#e34948" },
  { id: "t2", subject: "QR code failed to scan at Union Square Central", requester: "Sofia Reyes", role: "Driver", priority: "high", status: "open", updatedAt: "38m ago", avatarColor: "#eda100" },
  { id: "t3", subject: "Need help configuring weekend pricing multiplier", requester: "Janelle Kwon", role: "Operator", priority: "medium", status: "pending", updatedAt: "2h ago", avatarColor: "#1baf7a" },
  { id: "t4", subject: "Payout didn't arrive on schedule", requester: "Recep Aydin", role: "Operator", priority: "high", status: "pending", updatedAt: "5h ago", avatarColor: "#4a3aa7" },
  { id: "t5", subject: "How do I add a two-wheeler zone?", requester: "Helen Struss", role: "Operator", priority: "low", status: "resolved", updatedAt: "1d ago", avatarColor: "#2a78d6" },
  { id: "t6", subject: "Duplicate charge on my card", requester: "Ava Chen", role: "Driver", priority: "medium", status: "resolved", updatedAt: "2d ago", avatarColor: "#e87ba4" },
];

const PRIORITY_VARIANT = { low: "neutral", medium: "limited", high: "full" } as const;
const STATUS_VARIANT = { open: "full", pending: "limited", resolved: "available" } as const;

export default function AdminSupportPage() {
  const [tab, setTab] = useState("all");
  const filtered = tab === "all" ? TICKETS : TICKETS.filter((t) => t.status === tab);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Support"
        description={`${TICKETS.filter((t) => t.status !== "resolved").length} open tickets across drivers and operators`}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-card">
        {filtered.map((t) => (
          <div key={t.id} className="flex items-start gap-3 p-4">
            <Avatar className="size-9">
              <AvatarFallback
                style={{ backgroundColor: `${t.avatarColor}22`, color: t.avatarColor }}
              >
                {initials(t.requester)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-medium leading-snug">{t.subject}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t.requester} · {t.role} · {t.updatedAt}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <Badge variant={STATUS_VARIANT[t.status]} dot size="sm">
                {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
              </Badge>
              <Badge variant={PRIORITY_VARIANT[t.priority]} size="sm">
                {t.priority} priority
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
