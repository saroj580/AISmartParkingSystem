"use client";

import { useTheme } from "next-themes";
import { CHART_SERIES_DARK, CHART_SERIES_LIGHT } from "@/lib/chart-palette";

export function useThemeColors() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return {
    series: dark ? CHART_SERIES_DARK : CHART_SERIES_LIGHT,
    grid: dark
      ? "color-mix(in oklab, white 10%, transparent)"
      : "color-mix(in oklab, black 7%, transparent)",
    muted: dark ? "#8a8f9c" : "#8a8f9c",
    dark,
  };
}
