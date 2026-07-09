import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { VehicleTypeBadge } from "@/components/shared/vehicle-type-badge";
import { CUSTOMERS } from "@/data/customers";
import { initials } from "@/lib/format";

const STATUS_VARIANT = {
  active: "available",
  new: "brand",
  churned: "neutral",
} as const;

export default function OperatorCustomersPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Customers"
        description={`${CUSTOMERS.length} customers have parked at your lots`}
      />

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
          {CUSTOMERS.map((c) => (
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
              <TableCell className="font-medium tabular-nums">${c.totalSpend.toFixed(2)}</TableCell>
              <TableCell className="text-muted-foreground">{c.lastActive}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[c.status]} dot size="sm">
                  {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
