"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin, CalendarClock, Car, User } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/driver", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/driver/parking", label: "Parking", icon: MapPin },
  { href: "/driver/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/driver/vehicles", label: "Vehicles", icon: Car },
  { href: "/driver/settings", label: "Profile", icon: User },
];

export function DriverMobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur lg:hidden">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
              active ? "text-brand" : "text-muted-foreground",
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
