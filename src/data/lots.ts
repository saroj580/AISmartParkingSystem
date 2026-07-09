import type { ParkingLot, VehicleType } from "@/types/domain";

function cap(total: number, available: number) {
  return { total, available };
}

export const PARKING_LOTS: ParkingLot[] = [
  {
    id: "lot_marina",
    name: "BKC SmartDeck",
    operatorId: "op_urbanpark",
    operatorName: "UrbanPark Holdings",
    description:
      "Premium covered parking in the heart of the Bandra-Kurla Complex financial district. Full EV charging bank, 24/7 staffed security, and direct lift access to the retail concourse.",
    addressLine: "18 BKC Main Road",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    postalCode: "400051",
    latitude: 19.0662,
    longitude: 72.8686,
    status: "ACTIVE",
    openTime: "00:00",
    closeTime: "23:59",
    amenities: ["EV Charging", "CCTV", "Covered", "24/7 Staff", "Lift Access", "Valet"],
    images: [],
    rating: 4.8,
    reviewCount: 1284,
    distanceKm: 0.4,
    capacity: {
      TWO_WHEELER: cap(80, 34),
      THREE_WHEELER: cap(20, 3),
      FOUR_WHEELER: cap(240, 96),
    },
    pricing: {
      TWO_WHEELER: { baseRatePerHour: 30, dailyMaxRate: 180, currency: "INR" },
      THREE_WHEELER: { baseRatePerHour: 50, dailyMaxRate: 280, currency: "INR" },
      FOUR_WHEELER: { baseRatePerHour: 80, dailyMaxRate: 520, currency: "INR" },
    },
    coverColor: "#4F46E5",
  },
  {
    id: "lot_union",
    name: "Nariman Point Central",
    operatorId: "op_urbanpark",
    operatorName: "UrbanPark Holdings",
    description:
      "The most central garage in Mumbai's business district. Fast in-out, license-plate recognition entry, and validated rates with 400+ partner stores.",
    addressLine: "333 Marine Drive",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    postalCode: "400021",
    latitude: 18.9256,
    longitude: 72.8242,
    status: "ACTIVE",
    openTime: "05:00",
    closeTime: "01:00",
    amenities: ["CCTV", "Covered", "ANPR Entry", "Validation", "Restrooms"],
    images: [],
    rating: 4.6,
    reviewCount: 942,
    distanceKm: 1.1,
    capacity: {
      TWO_WHEELER: cap(60, 12),
      THREE_WHEELER: cap(15, 0),
      FOUR_WHEELER: cap(180, 22),
    },
    pricing: {
      TWO_WHEELER: { baseRatePerHour: 25, dailyMaxRate: 160, currency: "INR" },
      THREE_WHEELER: { baseRatePerHour: 45, dailyMaxRate: 240, currency: "INR" },
      FOUR_WHEELER: { baseRatePerHour: 70, dailyMaxRate: 440, currency: "INR" },
    },
    coverColor: "#0EA5E9",
  },
  {
    id: "lot_soma",
    name: "Lower Parel Tech Campus P2",
    operatorId: "op_metrospaces",
    operatorName: "Metro Spaces Inc.",
    description:
      "Purpose-built for commuters. Reserved monthly bays, secure two-wheeler cage, and bike-to-work lockers with showers on level 1.",
    addressLine: "645 Senapati Bapat Marg",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    postalCode: "400013",
    latitude: 18.999,
    longitude: 72.8258,
    status: "ACTIVE",
    openTime: "06:00",
    closeTime: "22:00",
    amenities: ["EV Charging", "Two-Wheeler Cage", "Showers", "CCTV", "Covered"],
    images: [],
    rating: 4.7,
    reviewCount: 611,
    distanceKm: 1.8,
    capacity: {
      TWO_WHEELER: cap(120, 74),
      THREE_WHEELER: cap(24, 9),
      FOUR_WHEELER: cap(140, 58),
    },
    pricing: {
      TWO_WHEELER: { baseRatePerHour: 20, dailyMaxRate: 120, currency: "INR" },
      THREE_WHEELER: { baseRatePerHour: 40, dailyMaxRate: 220, currency: "INR" },
      FOUR_WHEELER: { baseRatePerHour: 60, dailyMaxRate: 360, currency: "INR" },
    },
    coverColor: "#10B981",
  },
  {
    id: "lot_airport",
    name: "CSMIA LongStay North",
    operatorId: "op_skyport",
    operatorName: "SkyPort Aviation Parking",
    description:
      "Airport long-stay with 24/7 shuttle every 8 minutes. Ideal for multi-day trips with the lowest daily cap in the network.",
    addressLine: "Terminal Access Road, Santacruz",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    postalCode: "400099",
    latitude: 19.0896,
    longitude: 72.8656,
    status: "ACTIVE",
    openTime: "00:00",
    closeTime: "23:59",
    amenities: ["Shuttle", "CCTV", "24/7 Staff", "Luggage Assist", "EV Charging"],
    images: [],
    rating: 4.5,
    reviewCount: 3120,
    distanceKm: 21.4,
    capacity: {
      TWO_WHEELER: cap(40, 28),
      THREE_WHEELER: cap(10, 6),
      FOUR_WHEELER: cap(620, 214),
    },
    pricing: {
      TWO_WHEELER: { baseRatePerHour: 15, dailyMaxRate: 100, currency: "INR" },
      THREE_WHEELER: { baseRatePerHour: 30, dailyMaxRate: 180, currency: "INR" },
      FOUR_WHEELER: { baseRatePerHour: 50, dailyMaxRate: 300, currency: "INR" },
    },
    coverColor: "#8B5CF6",
  },
  {
    id: "lot_mission",
    name: "Dadar Market Yard",
    operatorId: "op_metrospaces",
    operatorName: "Metro Spaces Inc.",
    description:
      "Open-air neighborhood lot with the best value for two and three wheelers. Solar-canopy shaded and cash-free.",
    addressLine: "2100 Dr. Ambedkar Road",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    postalCode: "400014",
    latitude: 19.0178,
    longitude: 72.8478,
    status: "ACTIVE",
    openTime: "06:00",
    closeTime: "23:00",
    amenities: ["Solar Canopy", "CCTV", "Cash-free", "Two-Wheeler Cage"],
    images: [],
    rating: 4.4,
    reviewCount: 388,
    distanceKm: 3.2,
    capacity: {
      TWO_WHEELER: cap(90, 41),
      THREE_WHEELER: cap(30, 14),
      FOUR_WHEELER: cap(70, 9),
    },
    pricing: {
      TWO_WHEELER: { baseRatePerHour: 18, dailyMaxRate: 110, currency: "INR" },
      THREE_WHEELER: { baseRatePerHour: 35, dailyMaxRate: 200, currency: "INR" },
      FOUR_WHEELER: { baseRatePerHour: 55, dailyMaxRate: 320, currency: "INR" },
    },
    coverColor: "#F59E0B",
  },
  {
    id: "lot_pier",
    name: "Colaba Waterfront Parking",
    operatorId: "op_urbanpark",
    operatorName: "UrbanPark Holdings",
    description:
      "Waterfront event parking with premium valet on weekends. Closest access to the Gateway of India and the ferry terminal.",
    addressLine: "Near Gateway of India, Colaba",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    postalCode: "400001",
    latitude: 18.922,
    longitude: 72.8347,
    status: "MAINTENANCE",
    openTime: "07:00",
    closeTime: "23:00",
    amenities: ["Valet", "CCTV", "Waterfront", "Event Rates"],
    images: [],
    rating: 4.3,
    reviewCount: 205,
    distanceKm: 0.9,
    capacity: {
      TWO_WHEELER: cap(30, 0),
      THREE_WHEELER: cap(8, 0),
      FOUR_WHEELER: cap(110, 0),
    },
    pricing: {
      TWO_WHEELER: { baseRatePerHour: 35, dailyMaxRate: 200, currency: "INR" },
      THREE_WHEELER: { baseRatePerHour: 55, dailyMaxRate: 300, currency: "INR" },
      FOUR_WHEELER: { baseRatePerHour: 90, dailyMaxRate: 560, currency: "INR" },
    },
    coverColor: "#EC4899",
  },
];

export function getLot(id: string) {
  return PARKING_LOTS.find((l) => l.id === id);
}

export function totalAvailable(lot: ParkingLot, type?: VehicleType) {
  if (type) return lot.capacity[type].available;
  return (
    lot.capacity.TWO_WHEELER.available +
    lot.capacity.THREE_WHEELER.available +
    lot.capacity.FOUR_WHEELER.available
  );
}

export function totalCapacity(lot: ParkingLot, type?: VehicleType) {
  if (type) return lot.capacity[type].total;
  return (
    lot.capacity.TWO_WHEELER.total +
    lot.capacity.THREE_WHEELER.total +
    lot.capacity.FOUR_WHEELER.total
  );
}

export function occupancyPct(lot: ParkingLot, type?: VehicleType) {
  const total = totalCapacity(lot, type);
  if (total === 0) return 0;
  return Math.round(((total - totalAvailable(lot, type)) / total) * 100);
}

export function lowestHourlyRate(lot: ParkingLot) {
  return Math.min(
    lot.pricing.TWO_WHEELER.baseRatePerHour,
    lot.pricing.THREE_WHEELER.baseRatePerHour,
    lot.pricing.FOUR_WHEELER.baseRatePerHour,
  );
}

export function operatorLots(operatorId: string) {
  return PARKING_LOTS.filter((l) => l.operatorId === operatorId);
}