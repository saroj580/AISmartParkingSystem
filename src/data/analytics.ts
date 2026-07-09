import type { TimePoint } from "@/types/domain";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Revenue series are in INR.
export const REVENUE_WEEKLY: TimePoint[] = [
  { label: "Mon", value: 249600, secondary: 227200 },
  { label: "Tue", value: 278400, secondary: 241600 },
  { label: "Wed", value: 316800, secondary: 267200 },
  { label: "Thu", value: 296800, secondary: 284800 },
  { label: "Fri", value: 385600, secondary: 318400 },
  { label: "Sat", value: 451200, secondary: 336800 },
  { label: "Sun", value: 351200, secondary: 311200 },
];

export const REVENUE_MONTHLY: TimePoint[] = MONTH_LABELS.map((label, i) => ({
  label,
  value: Math.round(4640000 + i * 336000 + Math.sin(i / 2) * 480000),
  secondary: Math.round(3680000 + i * 272000 + Math.cos(i / 2) * 320000),
}));

const BOOKINGS_VALUES = [312, 348, 366, 340, 428, 512, 402];
export const BOOKINGS_DAILY: TimePoint[] = DAY_LABELS.map((label, i) => ({
  label,
  value: BOOKINGS_VALUES[i] ?? 0,
}));

const PEAK_HOUR_LABELS = ["6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p"];
const PEAK_HOUR_VALUES = [18, 62, 74, 58, 51, 68, 92, 66, 24];
export const PEAK_HOURS: TimePoint[] = PEAK_HOUR_LABELS.map((label, i) => ({
  label,
  value: PEAK_HOUR_VALUES[i] ?? 0,
}));

export const VEHICLE_DISTRIBUTION = [
  { name: "Four Wheeler", value: 612, colorIndex: 0 },
  { name: "Two Wheeler", value: 348, colorIndex: 1 },
  { name: "Three Wheeler", value: 94, colorIndex: 2 },
];

const OCCUPANCY_LABELS = ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"];
const OCCUPANCY_VALUES = [22, 14, 28, 71, 84, 79, 91, 58];
export const OCCUPANCY_TREND: TimePoint[] = OCCUPANCY_LABELS.map((label, i) => ({
  label,
  value: OCCUPANCY_VALUES[i] ?? 0,
}));

export const LOT_UTILIZATION = [
  { name: "Marina Bay SmartDeck", value: 78 },
  { name: "Union Square Central", value: 84 },
  { name: "SoMa Tech Campus P2", value: 61 },
  { name: "SFO LongStay North", value: 69 },
  { name: "Mission District Yard", value: 52 },
];

export const PLATFORM_GROWTH: TimePoint[] = MONTH_LABELS.slice(0, 9).map(
  (label, i) => ({
    label,
    value: Math.round(336000 + i * 54400 + Math.sin(i) * 25600),
    secondary: Math.round(14400 + i * 1920),
  }),
);