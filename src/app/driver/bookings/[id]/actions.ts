"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/session";
import { bookingsService } from "@/modules/bookings/bookings.service";

export async function cancelDriverBooking(bookingId: string) {
  const session = await getSessionUser();
  if (!session || session.role !== "DRIVER") {
    return { success: false as const, error: "Please sign in as a driver to manage bookings." };
  }

  try {
    await bookingsService.cancel(session.id, bookingId, undefined);
    revalidatePath(`/driver/bookings/${bookingId}`);
    revalidatePath("/driver/bookings");
    revalidatePath("/driver");
    return { success: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not cancel booking.";
    return { success: false as const, error: message };
  }
}
