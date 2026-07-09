"use client";

import { useMemo, useState } from "react";
import { Search, MoreVertical } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { VehicleTypeBadge } from "@/components/shared/vehicle-type-badge";
import { CUSTOMERS } from "@/data/customers";
import { initials } from "@/lib/format";

const STATUS_VARIANT = {
  active: "available",
  new: "brand",
  churned: "neutral",
} as const;

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => CUSTOMERS.filter((c) => `${c.name} ${c.email}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Users"
        description="18,204 registered drivers platform-wide (showing a sample)"
      />

      <Input
        leadingIcon={<Search />}
        placeholder="Search by name or email…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Vehicles</TableHead>
            <TableHead>Bookings</TableHead>
            <TableHead>Lifetime spend</TableHead>
            <TableHead>Last active</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback
                      className="text-[11px]"
                      style={{ backgroundColor: `${c.avatarColor}22`, color: c.avatarColor }}
                    >
                      {initials(c.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1.5">
                  {c.vehicleTypes.map((t) => <VehicleTypeBadge key={t} type={t} showIcon={false} />)}
                </div>
              </TableCell>
              <TableCell className="tabular-nums">{c.bookings}</TableCell>
              <TableCell className="font-medium tabular-nums">${c.totalSpend.toFixed(2)}</TableCell>
              <TableCell className="text-muted-foreground">{c.lastActive}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[c.status]} dot size="sm">
                  {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
                    <MoreVertical className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View profile</DropdownMenuItem>
                    <DropdownMenuItem>View bookings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-full focus:bg-full-subtle focus:text-full">
                      Suspend user
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
