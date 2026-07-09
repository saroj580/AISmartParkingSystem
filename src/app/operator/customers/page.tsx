import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { VehicleTypeBadge } from "@/components/shared/vehicle-type-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { listCustomersForOperator } from "@/server/views/customers";
import { initials, formatCurrency, formatDate } from "@/lib/format";

const STATUS_VARIANT = {
  active: "available",
  new: "brand",
  churned: "neutral",
} as const;

export default async function OperatorCustomersPage() {
  const session = await getSessionUser();
  const operatorProfile = await prisma.operatorProfile.findUniqueOrThrow({ where: { userId: session!.id } });
  const customers = await listCustomersForOperator(operatorProfile.id);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Customers"
        description={`${customers.length} customer${customers.length === 1 ? "" : "s"} have parked at your lots`}
      />

      {customers.length === 0 ? (
        <EmptyState icon={<Users />} title="No customers yet" description="Customers will show up here after their first booking." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle types</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Total spend</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
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
                    {c.vehicleTypes.map((t) => (
                      <VehicleTypeBadge key={t} type={t} showIcon={false} />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="tabular-nums">{c.bookings}</TableCell>
                <TableCell className="font-medium tabular-nums">{formatCurrency(c.totalSpend)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(c.lastActive)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[c.status]} dot size="sm">
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
