"use client";

import { SimpleBarChart } from "@/components/charts/bar-chart";
import type { TimePoint } from "@/types/domain";

/** SimpleBarChart wrapper with the percent formatter defined client-side — Server Components can't pass functions as props. */
export function PercentBarChart({
  data,
  label,
  colorIndex,
  height,
}: {
  data: TimePoint[];
  label?: string;
  colorIndex?: number;
  height?: number;
}) {
  return (
    <SimpleBarChart
      data={data}
      label={label}
      valueFormatter={(v) => `${v}%`}
      colorIndex={colorIndex}
      height={height}
    />
  );
}
