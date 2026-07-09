"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/session";
import { pricingService } from "@/modules/pricing/pricing.service";

export async function updatePricingRule(
  ruleId: string,
  input: { baseRatePerHour: number; dailyMaxRate: number; weekendMultiplier: number }
) {
  const session = await getSessionUser();
  if (!session || session.role !== "OPERATOR") {
    return { success: false as const, error: "Please sign in as an operator to update pricing." };
  }

  try {
    await pricingService.update(session.id, ruleId, input);
    revalidatePath("/operator/pricing");
    revalidatePath("/operator/lots");
    revalidatePath("/driver/parking");
    return { success: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't update pricing.";
    return { success: false as const, error: message };
  }
}
