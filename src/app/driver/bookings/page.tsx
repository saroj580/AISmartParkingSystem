"use client";

import { useMemo, useState } from "react";
import { CalendarX } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookingCard } from "@/components/driver/booking-card";
import { EmptyState } from "@/components/shared/empty-state";
import { DRIVER_BOOKINGS } from "@/data/bookings";
import type { BookingStatus } from "@/types/domain";

const TABS: { key: string; label: string; statuses?: BookingStatus[] }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming", statuses: ["CONFIRMED", "PENDING"] },
  { key: "active", label: "Active", statuses: ["ACTIVE"] },
  { key: "past", label: "Past", statuses: ["COMPLETED"] },
  { key: "cancelled", label: "Cancelled", statuses: ["CANCELLED", "EXPIRED", "NO_SHOW"] },
];

export default function BookingsPage() {
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    const config = TABS.find((t) => t.key === tab);
    if (!config?.statuses) return DRIVER_BOOKINGS;
    return DRIVER_BOOKINGS.filter((b) => config.statuses!.includes(b.status));
  }, [tab]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title="Bookings"
        description="Every reservation you've made, past and upcoming."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => (
          <TabsContent key={t.key} value={t.key}>
            {filtered.length === 0 ? (
              <EmptyState
                icon={<CalendarX />}
                title="No bookings here"
                description="Bookings matching this filter will show up here."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
