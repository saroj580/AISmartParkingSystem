import { prisma } from "@/lib/prisma";

export async function getOperatorRevenueTotal(operatorId: string): Promise<number> {
  const result = await prisma.payment.aggregate({
    where: { status: "SUCCEEDED", booking: { lot: { operatorId } } },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}
