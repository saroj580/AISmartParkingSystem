import type { Vehicle } from "@/types/domain";

export const CURRENT_DRIVER = {
  id: "drv_ava",
  name: "Ava Chen",
  email: "ava.chen@gmail.com",
  phone: "+1 (415) 555-0142",
  memberSince: "2024-03-11",
  avatarColor: "#4F46E5",
  city: "San Francisco",
  savedLots: ["lot_marina", "lot_soma"],
  stats: {
    totalBookings: 47,
    hoursParked: 312,
    totalSpent: 1284.5,
    co2SavedKg: 41,
  },
};

export const CURRENT_OPERATOR = {
  id: "op_urbanpark",
  company: "UrbanPark Holdings",
  contactName: "Marcus Reed",
  email: "marcus@urbanpark.io",
  avatarColor: "#0EA5E9",
};

export const CURRENT_ADMIN = {
  id: "adm_root",
  name: "Priya Nair",
  email: "priya@parkly.com",
  avatarColor: "#10B981",
};

export const DRIVER_VEHICLES: Vehicle[] = [
  {
    id: "veh_1",
    plateNumber: "8XYZ204",
    type: "FOUR_WHEELER",
    make: "Tesla",
    model: "Model 3",
    color: "Midnight Silver",
    isDefault: true,
    isActive: true,
  },
  {
    id: "veh_2",
    plateNumber: "MOTO77",
    type: "TWO_WHEELER",
    make: "Royal Enfield",
    model: "Meteor 350",
    color: "Stellar Black",
    isDefault: false,
    isActive: true,
  },
  {
    id: "veh_3",
    plateNumber: "AUTO9K",
    type: "THREE_WHEELER",
    make: "Bajaj",
    model: "RE Compact",
    color: "Yellow",
    isDefault: false,
    isActive: false,
  },
];
