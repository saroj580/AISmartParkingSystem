import type { Payment, AppNotification } from "@/types/domain";
import { DRIVER_BOOKINGS } from "@/data/bookings";

const now = Date.now();
const H = 3600_000;
const D = 24 * H;
function iso(offsetMs: number) {
  return new Date(now + offsetMs).toISOString();
}

export const DRIVER_PAYMENTS: Payment[] = [
  {
    id: "pay_1",
    bookingNumber: "PK-8F2A9C",
    amount: 320,
    currency: "INR",
    status: "SUCCEEDED",
    method: "card",
    cardBrand: "Visa",
    cardLast4: "4242",
    createdAt: iso(-3 * H),
    lotName: "Marina Bay SmartDeck",
  },
  {
    id: "pay_2",
    bookingNumber: "PK-3B7E11",
    amount: 80,
    currency: "INR",
    status: "SUCCEEDED",
    method: "card",
    cardBrand: "Mastercard",
    cardLast4: "8831",
    createdAt: iso(-5 * H),
    lotName: "SoMa Tech Campus P2",
  },
  {
    id: "pay_3",
    bookingNumber: "PK-9A0D42",
    amount: 350,
    currency: "INR",
    status: "SUCCEEDED",
    method: "card",
    cardBrand: "Visa",
    cardLast4: "4242",
    createdAt: iso(-2 * D - 1 * H),
    lotName: "Union Square Central",
  },
  {
    id: "pay_4",
    bookingNumber: "PK-1C6F80",
    amount: 900,
    currency: "INR",
    status: "SUCCEEDED",
    method: "card",
    cardBrand: "Visa",
    cardLast4: "4242",
    createdAt: iso(-11 * D),
    lotName: "SFO LongStay North",
  },
  {
    id: "pay_5",
    bookingNumber: "PK-5E2B33",
    amount: 105,
    currency: "INR",
    status: "REFUNDED",
    method: "card",
    cardBrand: "Mastercard",
    cardLast4: "8831",
    createdAt: iso(-16 * D),
    lotName: "Mission District Yard",
  },
  {
    id: "pay_6",
    bookingNumber: "PK-7D4A18",
    amount: 150,
    currency: "INR",
    status: "SUCCEEDED",
    method: "card",
    cardBrand: "Visa",
    cardLast4: "4242",
    createdAt: iso(-4 * H),
    lotName: "Marina Bay SmartDeck",
  },
];

export const DRIVER_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n_1",
    type: "CHECK_IN",
    title: "Checked in at SoMa Tech Campus P2",
    body: "Your two-wheeler was checked in at space B-07. Timer started.",
    createdAt: iso(-1.4 * H),
    read: false,
  },
  {
    id: "n_2",
    type: "BOOKING_REMINDER",
    title: "Upcoming booking in 2 hours",
    body: "Marina Bay SmartDeck — space D-142 is reserved for your Tesla Model 3.",
    createdAt: iso(-0.5 * H),
    read: false,
  },
  {
    id: "n_3",
    type: "PAYMENT_CONFIRMATION",
    title: "Payment of ₹320 received",
    body: "Your booking PK-8F2A9C at Marina Bay SmartDeck is confirmed.",
    createdAt: iso(-3 * H),
    read: true,
  },
  {
    id: "n_4",
    type: "BOOKING_CONFIRMATION",
    title: "Booking confirmed at Marina Bay SmartDeck",
    body: "Space D-088 reserved for MOTO77, arriving in 3 days.",
    createdAt: iso(-4 * H),
    read: true,
  },
  {
    id: "n_5",
    type: "REFUND_CONFIRMATION",
    title: "Refund issued for PK-5E2B33",
    body: "₹105 was refunded to your Mastercard ending 8831.",
    createdAt: iso(-16 * D),
    read: true,
  },
  {
    id: "n_6",
    type: "CHECK_OUT",
    title: "Checked out from Union Square Central",
    body: "Total charge ₹350 for 4h 30m. Thanks for parking with us.",
    createdAt: iso(-2 * D - 1 * H + 4.6 * H),
    read: true,
  },
];

export function bookingsForLot(lotId: string) {
  return DRIVER_BOOKINGS.filter((b) => b.lotId === lotId);
}