import { prisma } from "@/lib/prisma";
import type { TimePoint } from "@/types/domain";

const HOUR_LABELS = Array.from({ length: 24 }, (_, h) => {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
});

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function getOperatorAnalytics(operatorId: string) {
  const since = new Date(Date.now() - 7 * 86_400_000);

  const bookings = await prisma.booking.findMany({
    where: { lot: { operatorId } },
    include: { vehicle: true },
    orderBy: { createdAt: "desc" },
  });

  const recentBookings = bookings.filter((b) => b.createdAt >= since);

  // Peak hours — count of check-ins by hour-of-day across all bookings that have checked in.
  const peakHourCounts = new Array(24).fill(0);
  for (const b of bookings) {
    if (b.actualCheckInAt) peakHourCounts[b.actualCheckInAt.getHours()] += 1;
  }
  const peakHours: TimePoint[] = HOUR_LABELS.map((label, h) => ({ label, value: peakHourCounts[h] }));

  // Bookings per day for the last 7 days.
  const bookingsByDay = new Array(7).fill(0);
  const dayLabels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    dayLabels.push(DAY_LABELS[d.getDay()]!);
  }
  for (const b of recentBookings) {
    const daysAgo = Math.floor((Date.now() - b.createdAt.getTime()) / 86_400_000);
    if (daysAgo >= 0 && daysAgo < 7) bookingsByDay[6 - daysAgo] += 1;
  }
  const bookingsDaily: TimePoint[] = dayLabels.map((label, i) => ({ label, value: bookingsByDay[i] }));

  // Vehicle distribution across all bookings.
  const vehicleCounts = { TWO_WHEELER: 0, THREE_WHEELER: 0, FOUR_WHEELER: 0 };
  for (const b of bookings) vehicleCounts[b.vehicle.type] += 1;
  const vehicleDistribution = [
    { name: "Two Wheeler", value: vehicleCounts.TWO_WHEELER, colorIndex: 0 },
    { name: "Three Wheeler", value: vehicleCounts.THREE_WHEELER, colorIndex: 1 },
    { name: "Four Wheeler", value: vehicleCounts.FOUR_WHEELER, colorIndex: 2 },
  ];

  // Revenue trend for the last 7 days, from succeeded payments.
  const payments = await prisma.payment.findMany({
    where: { status: "SUCCEEDED", booking: { lot: { operatorId } }, paidAt: { gte: since } },
  });
  const revenueByDay = new Array(7).fill(0);
  for (const p of payments) {
    if (!p.paidAt) continue;
    const daysAgo = Math.floor((Date.now() - p.paidAt.getTime()) / 86_400_000);
    if (daysAgo >= 0 && daysAgo < 7) revenueByDay[6 - daysAgo] += Number(p.amount);
  }
  const revenueTrend: TimePoint[] = dayLabels.map((label, i) => ({ label, value: Math.round(revenueByDay[i] * 100) / 100 }));

  return { peakHours, bookingsDaily, vehicleDistribution, revenueTrend };
}
