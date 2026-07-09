"use client";

import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useThemeColors } from "@/components/charts/use-theme-colors";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import type { TimePoint } from "@/types/domain";

export function SimpleBarChart({
  data,
  label = "Value",
  valueFormatter,
  colorIndex = 0,
  height = 240,
}: {
  data: TimePoint[];
  label?: string;
  valueFormatter?: (v: number) => string;
  colorIndex?: number;
  height?: number;
}) {
  const { series, grid, muted } = useThemeColors();
  const color = series[colorIndex % series.length];

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke={grid} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: muted, fontSize: 12 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: muted, fontSize: 12 }}
            width={40}
          />
          <Tooltip
            cursor={{ fill: grid }}
            content={({ active, label: l, payload }) => (
              <ChartTooltip
                active={active}
                label={l}
                formatValue={valueFormatter}
                payload={payload?.map((p) => ({
                  name: label,
                  value: p.value as number,
                  color,
                }))}
              />
            )}
          />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={24} />
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}
