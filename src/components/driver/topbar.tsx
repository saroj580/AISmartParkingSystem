"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/format";
import { useSignOut } from "@/lib/use-sign-out";

export function DriverTopbar({
  name,
  email,
  avatarColor,
  unreadCount = 0,
}: {
  name: string;
  email: string;
  avatarColor: string;
  unreadCount?: number;
}) {
  const signOut = useSignOut();

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border px-4 sm:px-6">
      <div className="flex-1">
        <Input
          leadingIcon={<Search />}
          placeholder="Search parking lots, bookings…"
          className="max-w-sm bg-surface-muted"
        />
      </div>

      <ThemeToggle className="hidden sm:inline-flex" />

      <Link
        href="/driver/notifications"
        className="relative inline-flex size-9 items-center justify-center rounded-[var(--radius-md)] border border-border bg-surface text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="size-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-full ring-2 ring-surface" />
        )}
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full outline-none">
          <Avatar>
            <AvatarFallback
              style={{
                backgroundColor: `${avatarColor}22`,
                color: avatarColor,
              }}
            >
              {initials(name)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{name}</DropdownMenuLabel>
          <p className="px-2.5 pb-2 text-xs text-muted-foreground">
            {email}
          </p>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/driver/settings">Account settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/driver/vehicles">Manage vehicles</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void signOut()}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
