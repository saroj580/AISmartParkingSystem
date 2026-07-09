"use server";

import { revalidatePath } from "next/cache";
import type { VehicleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { bookingsService } from "@/modules/bookings/bookings.service";

interface CreateDriverBookingInput {
  lotId: string;
  vehicleType: VehicleType;
  vehicleId: string;
  startTime: string;
  endTime: string;
}

export async function createDriverBooking(input: CreateDriverBookingInput) {
  const session = await getSessionUser();
  if (!session || session.role !== "DRIVER") {
    return { success: false as const, error: "Please sign in as a driver to book a space." };
  }

  const space = await prisma.parkingSpace.findFirst({
    where: { lotId: input.lotId, vehicleType: input.vehicleType, status: "AVAILABLE", isActive: true },
    orderBy: { code: "asc" },
  });

  if (!space) {
    return { success: false as const, error: "No available space left for this vehicle type." };
  }

  try {
    const booking = await bookingsService.create(session.id, {
      spaceId: space.id,
      vehicleId: input.vehicleId,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
    });

    revalidatePath("/driver/bookings");
    revalidatePath("/driver");

    return {
      success: true as const,
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        totalAmount: Number(booking.totalAmount),
        currency: booking.currency,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create booking.";
    return { success: false as const, error: message };
  }
}
