"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Warehouse,
  Grid3x3,
  Activity,
  CalendarClock,
  Wallet,
  Users,
  Tags,
  BarChart3,
  ScanLine,
  UserCog,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/operator", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/operator/lots", label: "Parking Lots", icon: Warehouse },
  { href: "/operator/spaces", label: "Parking Spaces", icon: Grid3x3 },
  { href: "/operator/occupancy", label: "Live Occupancy", icon: Activity, live: true },
  { href: "/operator/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/operator/revenue", label: "Revenue", icon: Wallet },
  { href: "/operator/customers", label: "Customers", icon: Users },
  { href: "/operator/pricing", label: "Pricing", icon: Tags },
  { href: "/operator/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/operator/scanner", label: "QR Scanner", icon: ScanLine },
  { href: "/operator/employees", label: "Employees", icon: UserCog },
  { href: "/operator/settings", label: "Settings", icon: Settings },
];

export function OperatorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-border bg-surface-muted/40 lg:flex">
      <div className="flex h-16 items-center justify-between px-6">
        <Logo />
      </div>
      <div className="px-6 pb-2">
        <Badge variant="outline" size="sm">
          UrbanPark Holdings
        </Badge>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
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
              <item.icon className="size-[17px]" />
              {item.label}
              {item.live && (
                <span className="relative ml-auto flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-available opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-available" />
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
