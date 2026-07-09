import Link from "next/link";
import { MapPin, Star, MoreVertical } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { LotStatusBadge } from "@/components/shared/status-badge";
import { AvailabilityRow } from "@/components/shared/availability-row";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddLotDialog } from "@/components/operator/add-lot-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { listLotsForOperator } from "@/server/views/parking-lots";
import { occupancyPct } from "@/data/lots";

export default async function OperatorLotsPage() {
  const session = await getSessionUser();
  const operatorProfile = await prisma.operatorProfile.findUniqueOrThrow({ where: { userId: session!.id } });
  const lots = await listLotsForOperator(operatorProfile.id);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Parking lots"
        description={`${lots.length} lot${lots.length === 1 ? "" : "s"} under ${operatorProfile.companyName}`}
        actions={<AddLotDialog />}
      />

      {lots.length === 0 ? (
        <EmptyState icon={<MapPin />} title="No parking lots yet" description="Add your first lot to start accepting bookings." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {lots.map((lot) => (
            <div
              key={lot.id}
              className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <LotStatusBadge status={lot.status} />
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="size-3.5 fill-limited text-limited" />
                      {lot.rating}
                    </span>
                  </div>
                  <Link href={`/operator/lots/${lot.id}`}>
                    <p className="mt-2 text-[15px] font-semibold hover:text-brand">
                      {lot.name}
                    </p>
                  </Link>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" />
                    {lot.addressLine}, {lot.city}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
                    <MoreVertical className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/operator/lots/${lot.id}`}>View details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/operator/pricing">Edit pricing</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <AvailabilityRow capacity={lot.capacity} />

              <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="text-muted-foreground">Occupancy</span>
                <span className="font-semibold">{occupancyPct(lot)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
