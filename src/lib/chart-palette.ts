/**
 * Categorical chart palette — validated pair (light/dark), CVD-safe in fixed
 * order. Do not reorder or cycle; a series always keeps the same slot.
 */
export const CHART_SERIES_LIGHT = [
  "#2a78d6", // blue
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#4a3aa7", // violet
  "#e34948", // red
  "#e87ba4", // magenta
  "#eb6834", // orange
] as const;

export const CHART_SERIES_DARK = [
  "#3987e5",
  "#199e70",
  "#c98500",
  "#9085e9",
  "#e66767",
  "#d55181",
  "#d95926",
] as const;

export const CHART_SEQUENTIAL_LIGHT = [
  "#cde2fb", "#9ec5f4", "#5598e7", "#2a78d6", "#1c5cab", "#0d366b",
] as const;

export const STATUS_COLORS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

export function seriesColor(index: number, dark = false) {
  const arr = dark ? CHART_SERIES_DARK : CHART_SERIES_LIGHT;
  return arr[index % arr.length];
}
