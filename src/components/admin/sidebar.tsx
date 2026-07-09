"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Wallet,
  FileBarChart,
  Settings,
  LifeBuoy,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Platform Analytics", icon: LayoutDashboard, exact: true },
  { href: "/admin/operators", label: "Operators", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/revenue", label: "Revenue", icon: Wallet },
  { href: "/admin/reports", label: "Reports", icon: FileBarChart },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
  { href: "/admin/support", label: "Support", icon: LifeBuoy },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-border bg-surface-muted/40 lg:flex">
      <div className="flex h-16 items-center px-6">
        <Logo />
      </div>
      <div className="px-6 pb-2">
        <Badge variant="outline" size="sm" className="gap-1.5">
          <ShieldCheck className="size-3" />
          Admin console
        </Badge>
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
                "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-[13.5px] font-medium transition-colors",
                active
                  ? "bg-brand-subtle text-brand-subtle-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-[17px]" />
              {item.label}
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
