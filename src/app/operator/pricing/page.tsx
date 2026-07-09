import { PageHeader } from "@/components/shared/page-header";
import { PricingClient, type LotPricingRule } from "@/components/operator/pricing-client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { pricingRepository } from "@/modules/pricing/pricing.repository";

export default async function OperatorPricingPage() {
  const session = await getSessionUser();
  const operatorProfile = await prisma.operatorProfile.findUniqueOrThrow({ where: { userId: session!.id } });
  const lots = await prisma.parkingLot.findMany({
    where: { operatorId: operatorProfile.id },
    orderBy: { createdAt: "desc" },
  });

  const lotsWithRules = await Promise.all(
    lots.map(async (lot) => {
      const rules = await pricingRepository.listByLot(lot.id);
      const rulesVM: LotPricingRule[] = rules
        .filter((r) => r.isActive)
        .map((r) => ({
          id: r.id,
          vehicleType: r.vehicleType,
          baseRatePerHour: Number(r.baseRatePerHour),
          dailyMaxRate: r.dailyMaxRate ? Number(r.dailyMaxRate) : 0,
          weekendMultiplier: Number(r.weekendMultiplier),
        }));
      return { id: lot.id, name: lot.name, rules: rulesVM };
    })
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Pricing"
        description="Set hourly and daily-max rates by vehicle type, per lot."
      />
      <PricingClient lots={lotsWithRules} />
    </div>
  );
}
