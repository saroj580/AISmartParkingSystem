"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  CalendarClock,
  Car,
  CreditCard,
  Bookmark,
  Bell,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/cn";
import { DRIVER_NOTIFICATIONS } from "@/data/payments";

const NAV = [
  { href: "/driver", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/driver/parking", label: "Nearby Parking", icon: MapPin },
  { href: "/driver/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/driver/vehicles", label: "Vehicles", icon: Car },
  { href: "/driver/payments", label: "Payments", icon: CreditCard },
  { href: "/driver/saved", label: "Saved Parking", icon: Bookmark },
  { href: "/driver/notifications", label: "Notifications", icon: Bell },
  { href: "/driver/settings", label: "Settings", icon: Settings },
];

export function DriverSidebar() {
  const pathname = usePathname();
  const unread = DRIVER_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-border bg-surface-muted/40 lg:flex">
      <div className="flex h-16 items-center px-6">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-[13.5px] font-medium transition-colors",
                active
                  ? "bg-brand-subtle text-brand-subtle-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "size-[17px]",
                  active ? "text-brand-subtle-foreground" : "text-muted-foreground",
                )}
              />
              {item.label}
              {item.label === "Notifications" && unread > 0 && (
                <span className="ml-auto flex size-[18px] items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-brand-foreground">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-[13.5px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
