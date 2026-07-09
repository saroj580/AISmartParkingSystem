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
import { OPERATORS } from "@/data/customers";
import { initials, formatDate, formatCurrency } from "@/lib/format";

const STATUS_VARIANT = {
  active: "available",
  pending: "limited",
  suspended: "full",
} as const;

export default function AdminOperatorsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      OPERATORS.filter((o) =>
        `${o.company} ${o.contactName} ${o.city}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Operators"
        description={`${OPERATORS.length} operators on the platform`}
      />

      <Input
        leadingIcon={<Search />}
        placeholder="Search operators by company, contact, or city…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Operator</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Lots</TableHead>
            <TableHead>Spaces</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((o) => (
            <TableRow key={o.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback
                      className="text-[11px]"
                      style={{ backgroundColor: `${o.avatarColor}22`, color: o.avatarColor }}
                    >
                      {initials(o.company)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{o.company}</p>
                    <p className="text-xs text-muted-foreground">{o.contactName}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{o.city}</TableCell>
              <TableCell className="tabular-nums">{o.lots}</TableCell>
              <TableCell className="tabular-nums">{o.spaces}</TableCell>
              <TableCell className="font-medium tabular-nums">{formatCurrency(o.revenue)}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(o.joinedAt)}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[o.status]} dot size="sm">
                  {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
                    <MoreVertical className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View details</DropdownMenuItem>
                    <DropdownMenuItem>View lots</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {o.status === "pending" && (
                      <DropdownMenuItem className="text-available focus:bg-available-subtle focus:text-available">
                        Approve operator
                      </DropdownMenuItem>
                    )}
                    {o.status === "active" && (
                      <DropdownMenuItem className="text-full focus:bg-full-subtle focus:text-full">
                        Suspend operator
                      </DropdownMenuItem>
                    )}
                    {o.status === "suspended" && (
                      <DropdownMenuItem className="text-available focus:bg-available-subtle focus:text-available">
                        Reinstate operator
                      </DropdownMenuItem>
                    )}
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
