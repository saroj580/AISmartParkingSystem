/**
 * Frontend domain types — mirror the Prisma schema at a UI-friendly altitude.
 * Dates are ISO strings for serialization-safety across server/client.
 */

export type VehicleType = "TWO_WHEELER" | "THREE_WHEELER" | "FOUR_WHEELER";

export type Role = "DRIVER" | "OPERATOR" | "ADMIN";

export type LotStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

export type SpaceStatus = "AVAILABLE" | "RESERVED" | "OCCUPIED" | "MAINTENANCE";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED"
  | "NO_SHOW";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "CANCELLED";

export type QrStatus = "ACTIVE" | "CHECKED_IN" | "USED" | "EXPIRED" | "INVALID";

export type NotificationType =
  | "BOOKING_CONFIRMATION"
  | "PAYMENT_CONFIRMATION"
  | "BOOKING_REMINDER"
  | "BOOKING_EXPIRY"
  | "CHECK_IN"
  | "CHECK_OUT"
  | "REFUND_CONFIRMATION"
  | "OPERATOR_ALERT";

export interface CapacityByType {
  total: number;
  available: number;
}

export type Capacity = Record<VehicleType, CapacityByType>;

export interface PricingByType {
  baseRatePerHour: number;
  dailyMaxRate: number;
  currency: string;
}

export interface ParkingLot {
  id: string;
  name: string;
  operatorId: string;
  operatorName: string;
  description: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  status: LotStatus;
  openTime: string;
  closeTime: string;
  amenities: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  distanceKm: number;
  capacity: Capacity;
  pricing: Record<VehicleType, PricingByType>;
  coverColor: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  make: string;
  model: string;
  color: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  lotId: string;
  lotName: string;
  lotAddress: string;
  lotCity: string;
  spaceCode: string;
  zoneName: string;
  vehicleType: VehicleType;
  vehiclePlate: string;
  startTime: string;
  endTime: string;
  actualCheckInAt: string | null;
  actualCheckOutAt: string | null;
  status: BookingStatus;
  totalAmount: number;
  currency: string;
  createdAt: string;
  qrStatus: QrStatus;
  qrToken: string;
  driverName?: string;
  driverEmail?: string;
}

export interface Payment {
  id: string;
  bookingNumber: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string;
  cardBrand: string;
  cardLast4: string;
  createdAt: string;
  lotName: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface TimePoint {
  label: string;
  value: number;
  secondary?: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  bookings: number;
  totalSpend: number;
  lastActive: string;
  status: "active" | "new" | "churned";
  vehicleTypes: VehicleType[];
}

export interface Operator {
  id: string;
  company: string;
  contactName: string;
  email: string;
  city: string;
  lots: number;
  spaces: number;
  revenue: number;
  status: "active" | "pending" | "suspended";
  joinedAt: string;
  avatarColor: string;
}
